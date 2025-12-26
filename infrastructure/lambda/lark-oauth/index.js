/**
 * Lark OAuth Lambda Function
 * Handles OAuth token exchange and API proxy
 */

const https = require('https');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
};

// Lark API base URL
const LARK_API_BASE = 'open.larksuite.com';

/**
 * Make HTTPS request
 */
function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Get tenant access token
 */
async function getTenantAccessToken(appId, appSecret) {
  const response = await makeRequest({
    hostname: LARK_API_BASE,
    path: '/open-apis/auth/v3/tenant_access_token/internal',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { app_id: appId, app_secret: appSecret });

  if (response.body.code === 0) {
    return response.body.tenant_access_token;
  }
  throw new Error(response.body.msg || 'Failed to get tenant token');
}

/**
 * Exchange authorization code for user access token
 */
async function exchangeCodeForToken(appId, appSecret, code) {
  console.log('exchangeCodeForToken called with appId:', appId, 'code length:', code?.length);

  // First get app access token
  const appTokenResponse = await makeRequest({
    hostname: LARK_API_BASE,
    path: '/open-apis/auth/v3/app_access_token/internal',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { app_id: appId, app_secret: appSecret });

  console.log('appTokenResponse:', JSON.stringify(appTokenResponse.body));

  if (appTokenResponse.body.code !== 0) {
    throw new Error(`Failed to get app access token: ${appTokenResponse.body.msg || JSON.stringify(appTokenResponse.body)}`);
  }

  const appAccessToken = appTokenResponse.body.app_access_token;

  // Exchange code for user access token
  const tokenResponse = await makeRequest({
    hostname: LARK_API_BASE,
    path: '/open-apis/authen/v1/oidc/access_token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${appAccessToken}`,
    },
  }, {
    grant_type: 'authorization_code',
    code: code,
  });

  console.log('tokenResponse:', JSON.stringify(tokenResponse.body));

  // If token obtained successfully, fetch user info to get open_id
  if (tokenResponse.body.code === 0 && tokenResponse.body.data?.access_token) {
    const userToken = tokenResponse.body.data.access_token;

    // Get user info
    const userInfoResponse = await makeRequest({
      hostname: LARK_API_BASE,
      path: '/open-apis/authen/v1/user_info',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    }, null);

    console.log('userInfoResponse:', JSON.stringify(userInfoResponse.body));

    // Add user info to token response
    if (userInfoResponse.body.code === 0 && userInfoResponse.body.data) {
      tokenResponse.body.data.open_id = userInfoResponse.body.data.open_id;
      tokenResponse.body.data.union_id = userInfoResponse.body.data.union_id;
      tokenResponse.body.data.user_id = userInfoResponse.body.data.user_id;
      tokenResponse.body.data.name = userInfoResponse.body.data.name;
      tokenResponse.body.data.email = userInfoResponse.body.data.email;
    }
  }

  return tokenResponse.body;
}

/**
 * Refresh user access token
 */
async function refreshUserToken(appId, appSecret, refreshToken) {
  const appTokenResponse = await makeRequest({
    hostname: LARK_API_BASE,
    path: '/open-apis/auth/v3/app_access_token/internal',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { app_id: appId, app_secret: appSecret });

  if (appTokenResponse.body.code !== 0) {
    throw new Error('Failed to get app access token');
  }

  const appAccessToken = appTokenResponse.body.app_access_token;

  const response = await makeRequest({
    hostname: LARK_API_BASE,
    path: '/open-apis/authen/v1/oidc/refresh_access_token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${appAccessToken}`,
    },
  }, {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  return response.body;
}

/**
 * Proxy calendar API requests with user token
 */
async function proxyCalendarRequest(userAccessToken, method, path, body = null) {
  const options = {
    hostname: LARK_API_BASE,
    path: `/open-apis${path}`,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userAccessToken}`,
    },
  };

  return await makeRequest(options, body);
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event));

  // Handle OPTIONS for CORS
  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    const path = event.path || event.rawPath || '';

    // Parse body - handle base64 encoding from API Gateway
    let body = {};
    if (event.body) {
      try {
        const bodyStr = event.isBase64Encoded
          ? Buffer.from(event.body, 'base64').toString('utf-8')
          : event.body;
        body = JSON.parse(bodyStr);
      } catch (e) {
        console.error('Failed to parse body:', e, 'Body:', event.body);
      }
    }

    console.log('Parsed body:', JSON.stringify(body));
    const queryParams = event.queryStringParameters || {};

    // Route handling
    if (path.includes('/oauth/token')) {
      // Exchange code for token
      const { app_id, app_secret, code } = body;
      if (!app_id || !app_secret || !code) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing required parameters' }),
        };
      }

      const result = await exchangeCodeForToken(app_id, app_secret, code);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(result),
      };
    }

    if (path.includes('/oauth/refresh')) {
      // Refresh token
      const { app_id, app_secret, refresh_token } = body;
      if (!app_id || !app_secret || !refresh_token) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing required parameters' }),
        };
      }

      const result = await refreshUserToken(app_id, app_secret, refresh_token);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(result),
      };
    }

    if (path.includes('/tenant-token')) {
      // Get tenant access token
      const { app_id, app_secret } = body;
      if (!app_id || !app_secret) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing required parameters' }),
        };
      }

      const token = await getTenantAccessToken(app_id, app_secret);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ tenant_access_token: token }),
      };
    }

    if (path.includes('/calendar-proxy')) {
      // Generic Lark API proxy
      // Extract the Lark API path from the request
      const larkPath = path.replace(/.*\/calendar-proxy/, '');

      // Check for method override in body (for GET requests that need credentials)
      let method = body._method || event.httpMethod || event.requestContext?.http?.method || 'GET';
      delete body._method;

      // Check for user token in Authorization header
      let token = event.headers?.Authorization?.replace('Bearer ', '') ||
                  event.headers?.authorization?.replace('Bearer ', '');

      // If no user token, try to get tenant token from body credentials
      if (!token && body.app_id && body.app_secret) {
        console.log('Getting tenant token for app:', body.app_id);
        token = await getTenantAccessToken(body.app_id, body.app_secret);
        // Remove credentials from body before proxying
        delete body.app_id;
        delete body.app_secret;
      }

      if (!token) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing authorization token or credentials' }),
        };
      }

      // Build query string
      let queryString = '';
      if (event.queryStringParameters) {
        queryString = '?' + Object.entries(event.queryStringParameters)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&');
      }

      const options = {
        hostname: LARK_API_BASE,
        path: `/open-apis${larkPath}${queryString}`,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };

      console.log('Proxying to Lark:', options.method, options.path);

      // Don't send body for GET requests
      const requestBody = (method === 'GET' || Object.keys(body).length === 0) ? null : body;
      console.log('Request body:', JSON.stringify(requestBody));

      const result = await makeRequest(options, requestBody);
      console.log('Lark response:', JSON.stringify(result));

      return {
        statusCode: result.statusCode || 200,
        headers: corsHeaders,
        body: JSON.stringify(result.body),
      };
    }

    if (path.includes('/calendar')) {
      // Legacy calendar proxy (keep for backward compatibility)
      const userToken = event.headers?.Authorization?.replace('Bearer ', '') ||
                        event.headers?.authorization?.replace('Bearer ', '');

      if (!userToken) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing authorization token' }),
        };
      }

      const calendarPath = path.replace(/.*\/calendar/, '/calendar');
      const result = await proxyCalendarRequest(
        userToken,
        event.httpMethod,
        calendarPath,
        body
      );

      return {
        statusCode: result.statusCode,
        headers: corsHeaders,
        body: JSON.stringify(result.body),
      };
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Not found' }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
