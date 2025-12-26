#!/bin/bash
set -e

# Configuration
PROJECT_NAME="adama"
REGION="ap-northeast-1"
LAMBDA_FUNCTION_NAME="${PROJECT_NAME}-lark-oauth"
S3_BUCKET_NAME="${PROJECT_NAME}-frontend-$(aws sts get-caller-identity --query Account --output text)"
API_NAME="${PROJECT_NAME}-api"

echo "🚀 Deploying Adama to AWS..."

# 1. Create Lambda function
echo "📦 Creating Lambda function..."

cd infrastructure/lambda/lark-oauth
zip -r function.zip index.js

# Check if function exists
if aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME 2>/dev/null; then
  echo "Updating existing Lambda function..."
  aws lambda update-function-code \
    --function-name $LAMBDA_FUNCTION_NAME \
    --zip-file fileb://function.zip \
    --region $REGION
else
  echo "Creating new Lambda function..."

  # Create IAM role for Lambda
  ROLE_NAME="${PROJECT_NAME}-lambda-role"

  # Check if role exists
  if ! aws iam get-role --role-name $ROLE_NAME 2>/dev/null; then
    echo "Creating IAM role..."
    aws iam create-role \
      --role-name $ROLE_NAME \
      --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
          "Effect": "Allow",
          "Principal": {"Service": "lambda.amazonaws.com"},
          "Action": "sts:AssumeRole"
        }]
      }'

    aws iam attach-role-policy \
      --role-name $ROLE_NAME \
      --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

    echo "Waiting for role to propagate..."
    sleep 10
  fi

  ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)

  aws lambda create-function \
    --function-name $LAMBDA_FUNCTION_NAME \
    --runtime nodejs18.x \
    --role $ROLE_ARN \
    --handler index.handler \
    --zip-file fileb://function.zip \
    --timeout 30 \
    --memory-size 256 \
    --region $REGION
fi

rm function.zip
cd ../../..

# 2. Create/Update API Gateway
echo "🌐 Setting up API Gateway..."

# Check if API exists
API_ID=$(aws apigatewayv2 get-apis --query "Items[?Name=='$API_NAME'].ApiId" --output text --region $REGION)

if [ -z "$API_ID" ] || [ "$API_ID" == "None" ]; then
  echo "Creating new API Gateway..."
  API_ID=$(aws apigatewayv2 create-api \
    --name $API_NAME \
    --protocol-type HTTP \
    --cors-configuration '{
      "AllowOrigins": ["*"],
      "AllowMethods": ["GET", "POST", "OPTIONS"],
      "AllowHeaders": ["Content-Type", "Authorization"]
    }' \
    --query 'ApiId' \
    --output text \
    --region $REGION)
fi

echo "API ID: $API_ID"

# Create Lambda integration
LAMBDA_ARN=$(aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME --query 'Configuration.FunctionArn' --output text --region $REGION)

INTEGRATION_ID=$(aws apigatewayv2 get-integrations --api-id $API_ID --query "Items[?IntegrationUri=='$LAMBDA_ARN'].IntegrationId" --output text --region $REGION)

if [ -z "$INTEGRATION_ID" ] || [ "$INTEGRATION_ID" == "None" ]; then
  INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id $API_ID \
    --integration-type AWS_PROXY \
    --integration-uri $LAMBDA_ARN \
    --payload-format-version 2.0 \
    --query 'IntegrationId' \
    --output text \
    --region $REGION)
fi

# Create routes
for ROUTE in "POST /oauth/token" "POST /oauth/refresh" "POST /tenant-token" "ANY /calendar/{proxy+}"; do
  ROUTE_KEY=$(echo $ROUTE | sed 's/ /%20/g')
  EXISTING_ROUTE=$(aws apigatewayv2 get-routes --api-id $API_ID --query "Items[?RouteKey=='$ROUTE'].RouteId" --output text --region $REGION 2>/dev/null || echo "")

  if [ -z "$EXISTING_ROUTE" ] || [ "$EXISTING_ROUTE" == "None" ]; then
    aws apigatewayv2 create-route \
      --api-id $API_ID \
      --route-key "$ROUTE" \
      --target "integrations/$INTEGRATION_ID" \
      --region $REGION || true
  fi
done

# Create stage
STAGE_EXISTS=$(aws apigatewayv2 get-stages --api-id $API_ID --query "Items[?StageName=='prod'].StageName" --output text --region $REGION)

if [ -z "$STAGE_EXISTS" ] || [ "$STAGE_EXISTS" == "None" ]; then
  aws apigatewayv2 create-stage \
    --api-id $API_ID \
    --stage-name prod \
    --auto-deploy \
    --region $REGION
fi

# Add Lambda permission for API Gateway
aws lambda add-permission \
  --function-name $LAMBDA_FUNCTION_NAME \
  --statement-id apigateway-invoke-${API_ID} \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:$REGION:*:$API_ID/*/*" \
  --region $REGION 2>/dev/null || true

API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"
echo "API URL: $API_URL"

# 3. Create S3 bucket for frontend
echo "🪣 Setting up S3 bucket..."

if ! aws s3 ls "s3://$S3_BUCKET_NAME" 2>/dev/null; then
  aws s3 mb "s3://$S3_BUCKET_NAME" --region $REGION

  # Enable static website hosting
  aws s3 website "s3://$S3_BUCKET_NAME" --index-document index.html --error-document index.html

  # Set bucket policy for public access
  aws s3api put-public-access-block \
    --bucket $S3_BUCKET_NAME \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

  aws s3api put-bucket-policy --bucket $S3_BUCKET_NAME --policy "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [{
      \"Sid\": \"PublicReadGetObject\",
      \"Effect\": \"Allow\",
      \"Principal\": \"*\",
      \"Action\": \"s3:GetObject\",
      \"Resource\": \"arn:aws:s3:::$S3_BUCKET_NAME/*\"
    }]
  }"
fi

# 4. Build and deploy frontend
echo "🔨 Building frontend..."

# Update API URL in environment
echo "VITE_API_URL=$API_URL" > .env.production

npm run build

echo "📤 Uploading to S3..."
aws s3 sync dist/ "s3://$S3_BUCKET_NAME" --delete

# 5. Create CloudFront distribution (optional but recommended)
echo "☁️ Setting up CloudFront..."

DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[0].DomainName=='${S3_BUCKET_NAME}.s3.${REGION}.amazonaws.com'].Id" --output text)

if [ -z "$DISTRIBUTION_ID" ] || [ "$DISTRIBUTION_ID" == "None" ]; then
  DISTRIBUTION_ID=$(aws cloudfront create-distribution \
    --origin-domain-name "${S3_BUCKET_NAME}.s3-website-${REGION}.amazonaws.com" \
    --default-root-object index.html \
    --query 'Distribution.Id' \
    --output text 2>/dev/null || echo "SKIP")
fi

# Get URLs
S3_URL="http://${S3_BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"

if [ "$DISTRIBUTION_ID" != "SKIP" ] && [ -n "$DISTRIBUTION_ID" ]; then
  CF_DOMAIN=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)
  CF_URL="https://$CF_DOMAIN"
fi

echo ""
echo "✅ Deployment complete!"
echo "================================"
echo "API URL: $API_URL"
echo "S3 URL: $S3_URL"
[ -n "$CF_URL" ] && echo "CloudFront URL: $CF_URL"
echo ""
echo "📝 Next steps:"
echo "1. Update Lark Developer Console with redirect URI:"
echo "   ${S3_URL}/auth/lark/callback"
echo "   (or CloudFront URL if using CloudFront)"
echo "2. Test the OAuth flow"
echo "================================"
