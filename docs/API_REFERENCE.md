# FastPay API Reference

This document provides comprehensive API documentation for the FastPay backend system, including all endpoints, request/response formats, authentication requirements, and usage examples.

## 📋 Table of Contents

- [Authentication](#authentication)
- [Base URLs](#base-urls)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
- [Rate Limiting](#rate-limiting)
- [WebSocket/Real-time](#websocketreal-time)

---

## Authentication

### Session-Based Authentication

The FastPay API uses Django's session-based authentication. Users must authenticate via the dashboard login system, which creates a session that's automatically included in subsequent requests.

**Requirements**:
- Valid user session from dashboard login
- Appropriate access level for requested resources
- CSRF token for state-changing requests (POST, PUT, DELETE)

### Access Levels

| Level | Description | Access |
|-------|-------------|--------|
| **0 (Admin)** | Full system access | All endpoints |
| **1 (OTP-only)** | Limited access | OTP-related endpoints only |

---

## Base URLs

| Environment | Base URL | Description |
|-------------|----------|-------------|
| **Development** | `http://localhost:8000/api` | Local development |
| **Staging** | `https://staging.fastpaygaming.com/api` | Staging environment |
| **Production** | `https://fastpaygaming.com/api` | Production environment |

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-02-15T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field_name": ["This field is required."]
    }
  },
  "timestamp": "2025-02-15T10:30:00Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "count": 150,
    "next": "http://api.example.com/results/?page=2",
    "previous": null,
    "results": [
      // Data items
    ]
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| **200** | OK | Request successful |
| **201** | Created | Resource created |
| **400** | Bad Request | Invalid request data |
| **401** | Unauthorized | Authentication required |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Resource not found |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server error |

### Error Codes

| Code | Description | Example |
|------|-------------|---------|
| `VALIDATION_ERROR` | Input validation failed | Missing required fields |
| `AUTHENTICATION_ERROR` | Authentication failed | Invalid session |
| `PERMISSION_ERROR` | Insufficient permissions | Access denied |
| `RESOURCE_NOT_FOUND` | Resource doesn't exist | Invalid device ID |
| `RATE_LIMIT_ERROR` | Too many requests | Rate limit exceeded |
| `EXTERNAL_SERVICE_ERROR` | Third-party service error | Gmail API failure |

---

## API Endpoints

### Device Management

#### List Devices

```http
GET /api/devices/
```

**Query Parameters**:
- `page` (int): Page number for pagination
- `limit` (int): Number of items per page (default: 20)
- `status` (string): Filter by device status
- `search` (string): Search devices by name or ID

**Response**:
```json
{
  "success": true,
  "data": {
    "count": 25,
    "results": [
      {
        "id": "device_123",
        "name": "Test Device",
        "status": "online",
        "battery_level": 85,
        "last_seen": "2025-02-15T10:30:00Z",
        "activation_code": "ABC123",
        "mode": "testing"
      }
    ]
  }
}
```

#### Create Device

```http
POST /api/devices/
```

**Request Body**:
```json
{
  "id": "device_456",
  "name": "New Device",
  "activation_code": "XYZ789",
  "mode": "testing"
}
```

#### Get Device Details

```http
GET /api/devices/{device_id}/
```

#### Update Device Battery

```http
PATCH /api/devices/{device_id}/update-battery/
```

**Request Body**:
```json
{
  "battery_level": 75
}
```

#### Activate Device

```http
PATCH /api/devices/{device_id}/activate/
```

**Request Body**:
```json
{
  "activation_code": "ABC123",
  "mode": "running"
}
```

---

### Messages (SMS)

#### List Messages

```http
GET /api/messages/
```

**Query Parameters**:
- `device_id` (string): Filter by device
- `sender` (string): Filter by sender number
- `limit` (int): Number of messages (default: 50)
- `offset` (int): Offset for pagination

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "device_id": "device_123",
      "sender": "+1234567890",
      "content": "Hello world",
      "timestamp": "2025-02-15T10:30:00Z",
      "type": "received"
    }
  ]
}
```

#### Create Message

```http
POST /api/messages/
```

**Request Body** (Single):
```json
{
  "device_id": "device_123",
  "sender": "+1234567890",
  "content": "Test message",
  "type": "sent"
}
```

**Request Body** (Batch):
```json
[
  {
    "device_id": "device_123",
    "sender": "+1234567890",
    "content": "Message 1",
    "type": "sent"
  },
  {
    "device_id": "device_123",
    "sender": "+1234567890",
    "content": "Message 2",
    "type": "sent"
  }
]
```

#### Get Message

```http
GET /api/messages/{message_id}/
```

---

### Notifications

#### List Notifications

```http
GET /api/notifications/
```

**Query Parameters**:
- `device_id` (string): Filter by device
- `app_name` (string): Filter by app
- `limit` (int): Number of notifications (default: 50)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "device_id": "device_123",
      "app_name": "WhatsApp",
      "title": "New message",
      "content": "You have a new message",
      "timestamp": "2025-02-15T10:30:00Z"
    }
  ]
}
```

#### Create Notification

```http
POST /api/notifications/
```

**Request Body**:
```json
{
  "device_id": "device_123",
  "app_name": "Test App",
  "title": "Test Notification",
  "content": "This is a test notification"
}
```

---

### Contacts

#### List Contacts

```http
GET /api/contacts/
```

**Query Parameters**:
- `device_id` (string): Filter by device
- `search` (string): Search by name or phone

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "device_id": "device_123",
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com"
    }
  ]
}
```

#### Create/Update Contact

```http
POST /api/contacts/
```

**Request Body**:
```json
{
  "device_id": "device_123",
  "name": "Jane Smith",
  "phone": "+0987654321",
  "email": "jane@example.com"
}
```

---

### Bank Card Templates

#### List Templates

```http
GET /api/bank-card-templates/
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "template_code": "AXIS.DEBIT",
      "template_name": "Axis Bank Debit Card",
      "bank_name": "Axis Bank",
      "card_type": "debit",
      "is_active": true,
      "is_default": false,
      "field_schema": {
        "account_number": {
          "type": "string",
          "required": true,
          "min_length": 10,
          "max_length": 20
        }
      },
      "validation_rules": {
        "account_number": {
          "type": "string",
          "required": true
        }
      }
    }
  ]
}
```

#### Create Template

```http
POST /api/bank-card-templates/
```

**Request Body**:
```json
{
  "template_code": "ICICI.CREDIT",
  "template_name": "ICICI Bank Credit Card",
  "bank_name": "ICICI Bank",
  "card_type": "credit",
  "description": "ICICI Bank credit card template",
  "field_schema": {
    "account_number": {
      "type": "string",
      "required": true,
      "min_length": 10,
      "max_length": 20
    },
    "routing_number": {
      "type": "string",
      "required": true,
      "min_length": 9,
      "max_length": 9
    }
  },
  "validation_rules": {
    "account_number": {
      "type": "string",
      "required": true,
      "pattern": "^[0-9]{10,20}$"
    }
  }
}
```

#### Update Template

```http
PUT /api/bank-card-templates/{template_id}/
```

#### Delete Template

```http
DELETE /api/bank-card-templates/{template_id}/
```

#### Duplicate Template

```http
POST /api/bank-card-templates/{template_id}/duplicate/
```

**Response**:
```json
{
  "success": true,
  "data": {
    "template_code": "ICICI.CREDIT_v2",
    "template_name": "ICICI Bank Credit Card (Copy)",
    "version": 2
  }
}
```

#### Generate Preview

```http
POST /api/bank-card-templates/{template_id}/preview/
```

**Response**:
```json
{
  "success": true,
  "data": {
    "preview": {
      "account_number": "1234567890123456",
      "routing_number": "123456789",
      "card_holder": "JOHN DOE"
    }
  }
}
```

#### Validate Fields

```http
POST /api/bank-card-templates/{template_id}/validate_fields/
```

**Request Body**:
```json
{
  "fields": {
    "account_number": "1234567890123456",
    "routing_number": "123456789"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "validation": {
      "valid": true,
      "errors": {}
    }
  }
}
```

---

### Gmail Integration

#### Initiate OAuth

```http
GET /api/gmail/oauth/
```

**Query Parameters**:
- `user_email` (string): User email for OAuth
- `dashboard_origin` (string): Dashboard origin URL
- `dashboard_path` (string): Dashboard redirect path

**Response**:
```json
{
  "success": true,
  "data": {
    "oauth_url": "https://accounts.google.com/oauth/authorize?...",
    "state": "encrypted_state_token"
  }
}
```

#### OAuth Callback

```http
GET /api/gmail/callback/
```

**Query Parameters**:
- `code` (string): Authorization code from Google
- `state` (string): State token from OAuth initiation
- `error` (string): Error if OAuth failed

**Success Response**:
```json
{
  "success": true,
  "message": "Gmail account connected successfully",
  "gmail_email": "user@gmail.com",
  "user_email": "user@example.com",
  "created": true,
  "device_linked": false
}
```

#### Get Gmail Status

```http
GET /api/gmail/status/
```

**Query Parameters**:
- `user_email` (string): User email
- `device_id` (string): Device ID (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "connected": true,
    "gmail_email": "user@gmail.com",
    "scopes": ["gmail.readonly", "gmail.modify"],
    "token_expires_at": "2025-03-15T10:30:00Z",
    "device_linked": true
  }
}
```

#### Disconnect Gmail

```http
POST /api/gmail/disconnect/
```

**Request Body**:
```json
{
  "user_email": "user@example.com"
}
```

---

### API Request Logging

#### List API Logs

```http
GET /api/api-request-logs/
```

**Query Parameters**:
- `limit` (int): Number of entries (default: 50, max: 100)
- `user_identifier` (string): Filter by user
- `method` (string): Filter by HTTP method
- `status_code` (int): Filter by status code
- `path_contains` (string): Filter by path content

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "method": "GET",
      "path": "/api/devices/",
      "status_code": 200,
      "user_identifier": "admin@example.com",
      "client_ip": "192.168.1.100",
      "response_time_ms": 150,
      "created_at": "2025-02-15T10:30:00Z"
    }
  ]
}
```

#### Get Log Statistics

```http
GET /api/api-request-logs/stats/
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_requests": 1000,
    "success_rate": 0.95,
    "average_response_time": 120,
    "top_endpoints": [
      {
        "path": "/api/devices/",
        "count": 250,
        "avg_response_time": 100
      }
    ],
    "status_distribution": {
      "200": 950,
      "400": 30,
      "500": 20
    }
  }
}
```

---

### File System Operations

#### List Directory

```http
GET /api/fs/list/
```

**Query Parameters**:
- `path` (string): Relative path to list

**Response**:
```json
{
  "success": true,
  "data": {
    "path": "/uploads",
    "files": [
      {
        "name": "document.pdf",
        "size": 1024000,
        "type": "file",
        "modified": "2025-02-15T10:30:00Z"
      }
    ],
    "directories": [
      {
        "name": "images",
        "type": "directory"
      }
    ]
  }
}
```

#### Upload File

```http
POST /api/fs/upload/
```

**Request**: `multipart/form-data`
- `file` (file): File to upload
- `path` (string): Target directory (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "file_path": "/uploads/document.pdf",
    "file_size": 1024000,
    "upload_time": "2025-02-15T10:30:00Z"
  }
}
```

#### Download File

```http
GET /api/fs/download/
```

**Query Parameters**:
- `path` (string): Relative file path

**Response**: File content with appropriate headers

#### Delete File/Directory

```http
DELETE /api/fs/delete/
```

**Query Parameters**:
- `path` (string): Relative path to delete

---

### User Management

#### Get Current User

```http
GET /api/user/me/
```

**Response**:
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "access_level": 0,
    "is_active": true,
    "last_login": "2025-02-15T10:30:00Z",
    "assigned_devices": ["device_123", "device_456"]
  }
}
```

#### Update User Access

```http
POST /api/dashboard-update-access/
```

**Request Body**:
```json
{
  "admin_email": "admin@example.com"
}
```

#### Configure User Access

```http
POST /api/dashboard-configure-access/
```

**Request Body**:
```json
{
  "admin_email": "admin@example.com"
}
```

---

## Rate Limiting

### Default Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| **Read Operations** | 1000 requests | 15 minutes |
| **Write Operations** | 500 requests | 15 minutes |
| **File Operations** | 100 requests | 15 minutes |
| **Gmail OAuth** | 10 requests | 15 minutes |

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642234567
```

### Rate Limit Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_ERROR",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 1000,
      "window": "15 minutes",
      "retry_after": 300
    }
  }
}
```

---

## WebSocket/Real-time

### Firebase Real-time Database

The system uses Firebase Real-time Database for real-time data synchronization. WebSocket connections are handled automatically by the Firebase SDK.

#### Real-time Data Paths

```javascript
// Device status
firebase.database().ref('device/{deviceId}/status')

// SMS messages
firebase.database().ref('message/{deviceId}')

// Notifications
firebase.database().ref('notification/{deviceId}')

// Commands
firebase.database().ref('fastpay/{deviceId}/commands')

// Heartbeat
firebase.database().ref('hertbit/{deviceId}')
```

#### Real-time Event Types

| Event | Description |
|-------|-------------|
| `value` | Entire data snapshot |
| `child_added` | New child added |
| `child_changed` | Child modified |
| `child_removed` | Child deleted |
| `child_moved` | Child reordered |

---

## API Usage Examples

### JavaScript/Fetch

```javascript
// Get devices
const response = await fetch('/api/devices/', {
  credentials: 'include'
});
const data = await response.json();

// Create template
const templateResponse = await fetch('/api/bank-card-templates/', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken')
  },
  body: JSON.stringify({
    template_code: 'BANK.TEMPLATE',
    template_name: 'Bank Template',
    card_type: 'debit'
  })
});
```

### cURL

```bash
# Get devices
curl -X GET "http://localhost:8000/api/devices/" \
  -H "Cookie: sessionid=your_session_id"

# Create template
curl -X POST "http://localhost:8000/api/bank-card-templates/" \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionid=your_session_id" \
  -d '{
    "template_code": "BANK.TEMPLATE",
    "template_name": "Bank Template",
    "card_type": "debit"
  }'
```

### Python/Requests

```python
import requests

# Get devices (session-based auth)
session = requests.Session()
session.post('http://localhost:8000/login/', {
    'username': 'user@example.com',
    'password': 'password'
})

response = session.get('http://localhost:8000/api/devices/')
devices = response.json()

# Create template
template_response = session.post(
    'http://localhost:8000/api/bank-card-templates/',
    json={
        'template_code': 'BANK.TEMPLATE',
        'template_name': 'Bank Template',
        'card_type': 'debit'
    }
)
```

---

## Testing the API

### Postman Collection

A Postman collection is available with all pre-configured endpoints:
- Import the collection from `docs/postman/FastPay_API.postman_collection.json`
- Set environment variables for base URL and authentication
- Use the "Login" request to establish session

### Automated Testing

```bash
# Run backend API tests
cd BACKEND
python manage.py test api.tests

# Run specific test suite
python manage.py test api.tests.test_api
python manage.py test api.tests.test_gmail_oauth_enhanced
python manage.py test api.tests.test_api_log_enhanced
python manage.py test api.tests.test_template_enhanced
```

---

## API Changelog

### Version 2.0.0 (Latest)

#### Added
- Bank card template management endpoints
- Enhanced API logging with user filtering (50 entries)
- Gmail OAuth with enhanced error handling
- Template preview and validation endpoints
- Comprehensive error logging and user feedback

#### Enhanced
- API request logging increased from 20 to 50 entries
- User filtering for API logs
- Real-time updates for API logs
- Enhanced error responses with detailed information

#### Fixed
- Gmail OAuth callback URL issues
- API authentication errors
- Template management bugs
- Logging system performance

---

*This API reference serves as the authoritative source for all FastPay backend endpoints. API changes should be reflected in this document.*
