/**
 * Adama Data API Lambda
 * Handles CRUD operations for DynamoDB tables
 * Using AWS SDK v3 (included in Node.js 18.x runtime)
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'ap-northeast-1' });
const docClient = DynamoDBDocumentClient.from(client);

// Table name mapping
const TABLES = {
  projects: 'adama-projects',
  projectEvents: 'adama-project-events',
  staffMembers: 'adama-staff-members',
  organizations: 'adama-organizations',
  externalContacts: 'adama-external-contacts',
  projectLinks: 'adama-project-links',
  settings: 'adama-settings',
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

// Generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Response helper
function respond(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

// Get all items from a table
async function getAll(tableName, filterActive = true) {
  const result = await docClient.send(new ScanCommand({ TableName: tableName }));
  let items = result.Items || [];

  if (filterActive) {
    items = items.filter(item => item.isActive !== false);
  }

  return items;
}

// Get single item
async function getItem(tableName, id) {
  const result = await docClient.send(new GetCommand({
    TableName: tableName,
    Key: { id },
  }));
  return result.Item;
}

// Put item
async function putItem(tableName, item) {
  await docClient.send(new PutCommand({
    TableName: tableName,
    Item: item,
  }));
  return item;
}

// Soft delete
async function softDeleteItem(tableName, id) {
  await docClient.send(new UpdateCommand({
    TableName: tableName,
    Key: { id },
    UpdateExpression: 'SET isActive = :false',
    ExpressionAttributeValues: { ':false': false },
  }));
}

// Main handler
export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event));

  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return respond(200, {});
  }

  try {
    const path = event.path || event.rawPath || '';
    const method = event.httpMethod || event.requestContext?.http?.method || 'GET';

    let body = {};
    if (event.body) {
      try {
        const bodyStr = event.isBase64Encoded
          ? Buffer.from(event.body, 'base64').toString('utf-8')
          : event.body;
        body = JSON.parse(bodyStr);
      } catch (e) {
        console.error('Failed to parse body:', e);
      }
    }

    // Parse resource and ID from pathParameters (API Gateway v2) or path
    let resource, id;
    if (event.pathParameters?.proxy) {
      // API Gateway v2: proxy contains everything after /data/
      const proxyParts = event.pathParameters.proxy.split('/');
      resource = proxyParts[0];
      id = proxyParts[1];
    } else {
      // Direct invocation or API Gateway v1
      const pathParts = path.replace(/^\/+|\/+$/g, '').split('/');
      // Skip stage name if present (prod, data, resource, id)
      const dataIndex = pathParts.indexOf('data');
      resource = pathParts[dataIndex + 1] || pathParts[1];
      id = pathParts[dataIndex + 2] || pathParts[2];
    }

    console.log('Resource:', resource, 'ID:', id, 'Method:', method);

    const tableName = TABLES[resource];
    if (!tableName) {
      return respond(404, { error: `Unknown resource: ${resource}` });
    }

    switch (method) {
      case 'GET':
        if (id) {
          const item = await getItem(tableName, id);
          if (!item) {
            return respond(404, { error: 'Item not found' });
          }
          return respond(200, item);
        } else {
          const includeInactive = event.queryStringParameters?.includeInactive === 'true';
          const items = await getAll(tableName, !includeInactive);
          return respond(200, items);
        }

      case 'POST':
        const newItem = {
          ...body,
          id: body.id || generateUUID(),
          createdAt: body.createdAt || new Date().toISOString(),
          isActive: body.isActive !== undefined ? body.isActive : true,
        };
        await putItem(tableName, newItem);
        return respond(201, newItem);

      case 'PUT':
        if (!id) {
          return respond(400, { error: 'ID required for update' });
        }
        const existingItem = await getItem(tableName, id);
        const updatedItem = {
          ...existingItem,
          ...body,
          id,
          updatedAt: new Date().toISOString(),
        };
        await putItem(tableName, updatedItem);
        return respond(200, updatedItem);

      case 'DELETE':
        if (!id) {
          return respond(400, { error: 'ID required for delete' });
        }
        await softDeleteItem(tableName, id);
        return respond(200, { success: true });

      default:
        return respond(405, { error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error:', error);
    return respond(500, { error: error.message });
  }
};
