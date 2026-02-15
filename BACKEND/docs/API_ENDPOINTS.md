# FastPay Backend API Endpoints Documentation

This document provides detailed documentation for all FastPay backend API endpoints, including request/response formats, authentication requirements, and usage examples.

## 📋 Table of Contents

- [Authentication](#authentication)
- [Device Management](#device-management)
- [Messages (SMS)](#messages-sms)
- [Notifications](#notifications)
- [Contacts](#contacts)
- [Bank Card Templates](#bank-card-templates)
- [Gmail Integration](#gmail-integration)
- [API Request Logging](#api-request-logging)
- [File System Operations](#file-system-operations)
- [User Management](#user-management)
- [Utility Endpoints](#utility-endpoints)

---

## Authentication

### Session-Based Authentication

All API endpoints require Django session-based authentication. Users must authenticate through the dashboard login system first.

**Headers**:
```
Cookie: sessionid=<session_id>; csrftoken=<csrf_token>
X-CSRFToken: <csrf_token>  # Required for POST/PUT/DELETE
```

**Access Levels**:
- **Level 0 (Admin)**: Full access to all endpoints
- **Level 1 (OTP-only)**: Limited access to OTP-related endpoints only

---

## Device Management

### List Devices

**Endpoint**: `GET /api/devices/`

**Description**: Retrieve a list of all devices with optional filtering and pagination.

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `limit` | integer | No | 20 | Number of devices per page |
| `status` | string | No | - | Filter by device status (online, offline) |
| `mode` | string | No | - | Filter by activation mode (testing, running) |
| `search` | string | No | - | Search by device name or ID |

**Response**:
```json
{
  "success": true,
  "data": {
    "count": 25,
    "next": "http://localhost:8000/api/devices/?page=2",
    "previous": null,
    "results": [
      {
        "id": "device_123",
        "name": "Test Device",
        "status": "online",
        "battery_level": 85,
        "last_seen": "2025-02-15T10:30:00Z",
        "activation_code": "ABC123",
        "mode": "testing",
        "created_at": "2025-02-10T08:00:00Z",
        "updated_at": "2025-02-15T10:30:00Z",
        "company_code": "COMP001",
        "user_email": "admin@example.com"
      }
    ]
  }
}
```

**Example Request**:
```bash
curl -X GET "http://localhost:8000/api/devices/?status=online&limit=10" \
  -H "Cookie: sessionid=abc123; csrftoken=def456"
```

### Create Device

**Endpoint**: `POST /api/devices/`

**Description**: Create a new device or multiple devices in bulk.

**Request Body** (Single Device):
```json
{
  "id": "device_456",
  "name": "New Device",
  "activation_code": "XYZ789",
  "mode": "testing",
  "company_code": "COMP001",
  "user_email": "user@example.com"
}
```

**Request Body** (Bulk Create):
```json
[
  {
    "id": "device_456",
    "name": "Device 1",
    "activation_code": "XYZ789",
    "mode": "testing"
  },
  {
    "id": "device_457",
    "name": "Device 2",
    "activation_code": "ABC456",
    "mode": "testing"
  }
]
```

**Response**:
```json
{
  "success": true,
  "data": {
    "created": 2,
    "devices": [
      {
        "id": "device_456",
        "name": "Device 1",
        "status": "offline",
        "created_at": "2025-02-15T10:30:00Z"
      }
    ]
  },
  "message": "Devices created successfully"
}
```

### Get Device Details

**Endpoint**: `GET /api/devices/{device_id}/`

**Description**: Retrieve detailed information for a specific device.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `device_id` | string | Yes | Unique device identifier |

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "device_123",
    "name": "Test Device",
    "status": "online",
    "battery_level": 85,
    "last_seen": "2025-02-15T10:30:00Z",
    "activation_code": "ABC123",
    "mode": "testing",
    "company_code": "COMP001",
    "user_email": "admin@example.com",
    "created_at": "2025-02-10T08:00:00Z",
    "updated_at": "2025-02-15T10:30:00Z",
    "metadata": {
      "app_version": "1.0.0",
      "os_version": "Android 11",
      "device_model": "Samsung Galaxy S21"
    }
  }
}
```

### Update Device Battery

**Endpoint**: `PATCH /api/devices/{device_id}/update-battery/`

**Description**: Update the battery level for a specific device.

**Request Body**:
```json
{
  "battery_level": 75,
  "charging_status": "discharging"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "battery_level": 75,
    "updated_at": "2025-02-15T10:35:00Z"
  },
  "message": "Battery level updated successfully"
}
```

### Activate Device

**Endpoint**: `PATCH /api/devices/{device_id}/activate/`

**Description**: Activate a device and switch it to running mode.

**Request Body**:
```json
{
  "activation_code": "ABC123",
  "mode": "running"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "active",
    "mode": "running",
    "activated_at": "2025-02-15T10:30:00Z"
  },
  "message": "Device activated successfully"
}
```

---

## Messages (SMS)

### List Messages

**Endpoint**: `GET /api/messages/`

**Description**: Retrieve SMS messages with filtering and pagination.

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `device_id` | string | No | - | Filter by device ID |
| `sender` | string | No | - | Filter by sender phone number |
| `limit` | integer | No | 50 | Number of messages |
| `offset` | integer | No | 0 | Offset for pagination |
| `date_from` | string | No | - | Filter messages from date (ISO format) |
| `date_to` | string | No | - | Filter messages to date (ISO format) |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "device_id": "device_123",
      "sender": "+1234567890",
      "recipient": "+0987654321",
      "content": "Hello world",
      "timestamp": "2025-02-15T10:30:00Z",
      "type": "received",
      "status": "delivered",
      "created_at": "2025-02-15T10:30:00Z"
    }
  ]
}
```

### Create Message

**Endpoint**: `POST /api/messages/`

**Description**: Create a new SMS message or multiple messages in bulk.

**Request Body** (Single Message):
```json
{
  "device_id": "device_123",
  "sender": "+1234567890",
  "recipient": "+0987654321",
  "content": "Test message",
  "type": "sent",
  "scheduled_time": "2025-02-15T11:00:00Z"
}
```

**Request Body** (Bulk Messages):
```json
[
  {
    "device_id": "device_123",
    "sender": "+1234567890",
    "recipient": "+0987654321",
    "content": "Message 1",
    "type": "sent"
  },
  {
    "device_id": "device_123",
    "sender": "+1234567890",
    "recipient": "+0987654322",
    "content": "Message 2",
    "type": "sent"
  }
]
```

**Response**:
```json
{
  "success": true,
  "data": {
    "created": 2,
    "messages": [
      {
        "id": 124,
        "device_id": "device_123",
        "content": "Message 1",
        "status": "pending",
        "created_at": "2025-02-15T10:30:00Z"
      }
    ]
  },
  "message": "Messages created successfully"
}
```

### Get Message

**Endpoint**: `GET /api/messages/{message_id}/`

**Description**: Retrieve details of a specific message.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "device_id": "device_123",
    "sender": "+1234567890",
    "recipient": "+0987654321",
    "content": "Hello world",
    "timestamp": "2025-02-15T10:30:00Z",
    "type": "received",
    "status": "delivered",
    "delivery_report": {
      "delivered_at": "2025-02-15T10:31:00Z",
      "status_code": 0
    },
    "created_at": "2025-02-15T10:30:00Z",
    "updated_at": "2025-02-15T10:31:00Z"
  }
}
```

---

## Notifications

### List Notifications

**Endpoint**: `GET /api/notifications/`

**Description**: Retrieve notifications with filtering options.

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `device_id` | string | No | - | Filter by device ID |
| `app_name` | string | No | - | Filter by app name |
| `limit` | integer | No | 50 | Number of notifications |
| `offset` | integer | No | 0 | Offset for pagination |

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
      "content": "You have a new message from John",
      "package_name": "com.whatsapp",
      "timestamp": "2025-02-15T10:30:00Z",
      "action_data": {
        "type": "message",
        "sender": "John Doe"
      },
      "created_at": "2025-02-15T10:30:00Z"
    }
  ]
}
```

### Create Notification

**Endpoint**: `POST /api/notifications/`

**Description**: Create a new notification or multiple notifications.

**Request Body**:
```json
{
  "device_id": "device_123",
  "app_name": "Test App",
  "title": "Test Notification",
  "content": "This is a test notification",
  "package_name": "com.test.app",
  "action_data": {
    "type": "test",
    "url": "https://example.com"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 457,
    "device_id": "device_123",
    "title": "Test Notification",
    "created_at": "2025-02-15T10:30:00Z"
  },
  "message": "Notification created successfully"
}
```

---

## Contacts

### List Contacts

**Endpoint**: `GET /api/contacts/`

**Description**: Retrieve contacts with search and filtering.

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `device_id` | string | No | - | Filter by device ID |
| `search` | string | No | - | Search by name or phone number |
| `limit` | integer | No | 50 | Number of contacts |
| `offset` | integer | No | 0 | Offset for pagination |

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
      "email": "john@example.com",
      "notes": "Work contact",
      "created_at": "2025-02-15T10:30:00Z",
      "updated_at": "2025-02-15T10:30:00Z"
    }
  ]
}
```

### Create/Update Contact

**Endpoint**: `POST /api/contacts/`

**Description**: Create a new contact or update an existing one.

**Request Body**:
```json
{
  "device_id": "device_123",
  "name": "Jane Smith",
  "phone": "+0987654321",
  "email": "jane@example.com",
  "notes": "Personal contact"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 790,
    "device_id": "device_123",
    "name": "Jane Smith",
    "phone": "+0987654321",
    "created_at": "2025-02-15T10:30:00Z"
  },
  "message": "Contact created successfully"
}
```

---

## Bank Card Templates

### List Templates

**Endpoint**: `GET /api/bank-card-templates/`

**Description**: Retrieve all bank card templates.

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `is_active` | boolean | No | - | Filter by active status |
| `card_type` | string | No | - | Filter by card type (credit, debit, prepaid) |
| `bank_name` | string | No | - | Filter by bank name |

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
      "description": "Axis Bank debit card template",
      "is_active": true,
      "is_default": false,
      "field_schema": {
        "account_number": {
          "type": "string",
          "required": true,
          "min_length": 10,
          "max_length": 20,
          "label": "Account Number"
        },
        "routing_number": {
          "type": "string",
          "required": true,
          "min_length": 9,
          "max_length": 9,
          "label": "Routing Number"
        }
      },
      "validation_rules": {
        "account_number": {
          "type": "string",
          "required": true,
          "pattern": "^[0-9]{10,20}$"
        }
      },
      "created_at": "2025-02-15T10:30:00Z",
      "updated_at": "2025-02-15T10:30:00Z"
    }
  ]
}
```

### Create Template

**Endpoint**: `POST /api/bank-card-templates/`

**Description**: Create a new bank card template.

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
      "max_length": 20,
      "label": "Account Number"
    },
    "routing_number": {
      "type": "string",
      "required": true,
      "min_length": 9,
      "max_length": 9,
      "label": "Routing Number"
    },
    "card_holder": {
      "type": "string",
      "required": true,
      "max_length": 100,
      "label": "Card Holder Name"
    }
  },
  "validation_rules": {
    "account_number": {
      "type": "string",
      "required": true,
      "pattern": "^[0-9]{10,20}$"
    },
    "card_holder": {
      "type": "string",
      "required": true,
      "min_length": 2
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "template_code": "ICICI.CREDIT",
    "template_name": "ICICI Bank Credit Card",
    "bank_name": "ICICI Bank",
    "card_type": "credit",
    "is_active": true,
    "is_default": false,
    "created_at": "2025-02-15T10:30:00Z"
  },
  "message": "Template created successfully"
}
```

### Update Template

**Endpoint**: `PUT /api/bank-card-templates/{template_id}/`

**Description**: Update an existing bank card template.

**Request Body**: Same as create template

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "template_code": "ICICI.CREDIT",
    "template_name": "ICICI Bank Credit Card (Updated)",
    "updated_at": "2025-02-15T10:35:00Z"
  },
  "message": "Template updated successfully"
}
```

### Delete Template

**Endpoint**: `DELETE /api/bank-card-templates/{template_id}/`

**Description**: Delete a bank card template.

**Response**:
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

### Duplicate Template

**Endpoint**: `POST /api/bank-card-templates/{template_id}/duplicate/`

**Description**: Create a duplicate of an existing template.

**Response**:
```json
{
  "success": true,
  "data": {
    "template_code": "ICICI.CREDIT_v2",
    "template_name": "ICICI Bank Credit Card (Copy)",
    "version": 2,
    "id": 3
  },
  "message": "Template duplicated successfully"
}
```

### Generate Preview

**Endpoint**: `POST /api/bank-card-templates/{template_id}/preview/`

**Description**: Generate preview data for a template.

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
  },
  "message": "Preview generated successfully"
}
```

### Validate Fields

**Endpoint**: `POST /api/bank-card-templates/{template_id}/validate_fields/`

**Description**: Validate field data against template rules.

**Request Body**:
```json
{
  "fields": {
    "account_number": "1234567890123456",
    "routing_number": "123456789",
    "card_holder": "JOHN DOE"
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
      "errors": {},
      "warnings": []
    }
  },
  "message": "Fields validated successfully"
}
```

---

## Gmail Integration

### Initiate OAuth

**Endpoint**: `GET /api/gmail/oauth/`

**Description**: Initiate Gmail OAuth flow for a user.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_email` | string | Yes | User email for OAuth |
| `dashboard_origin` | string | No | Dashboard origin URL |
| `dashboard_path` | string | No | Dashboard redirect path |

**Response**:
```json
{
  "success": true,
  "data": {
    "oauth_url": "https://accounts.google.com/oauth/authorize?client_id=...&redirect_uri=...&scope=...&state=...",
    "state": "encrypted_state_token"
  },
  "message": "OAuth URL generated successfully"
}
```

### OAuth Callback

**Endpoint**: `GET /api/gmail/callback/`

**Description**: Handle Gmail OAuth callback from Google.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | No | Authorization code from Google |
| `state` | string | No | State token from OAuth initiation |
| `error` | string | No | Error if OAuth failed |

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

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "OAUTH_ERROR",
    "message": "Google OAuth error: access_denied"
  }
}
```

### Get Gmail Status

**Endpoint**: `GET /api/gmail/status/`

**Description**: Check Gmail connection status for a user.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_email` | string | Yes | User email |
| `device_id` | string | No | Device ID (optional) |

**Response**:
```json
{
  "success": true,
  "data": {
    "connected": true,
    "gmail_email": "user@gmail.com",
    "scopes": ["gmail.readonly", "gmail.modify"],
    "token_expires_at": "2025-03-15T10:30:00Z",
    "device_linked": true,
    "last_sync": "2025-02-15T10:25:00Z"
  },
  "message": "Gmail status retrieved successfully"
}
```

### Disconnect Gmail

**Endpoint**: `POST /api/gmail/disconnect/`

**Description**: Disconnect Gmail account for a user.

**Request Body**:
```json
{
  "user_email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Gmail account disconnected successfully"
}
```

---

## API Request Logging

### List API Logs

**Endpoint**: `GET /api/api-request-logs/`

**Description**: Retrieve API request logs with enhanced filtering.

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 50 | Number of entries (max: 100) |
| `user_identifier` | string | No | - | Filter by user |
| `method` | string | No | - | Filter by HTTP method |
| `status_code` | integer | No | - | Filter by status code |
| `path_contains` | string | No | - | Filter by path content |
| `date_from` | string | No | - | Filter from date (ISO format) |
| `date_to` | string | No | - | Filter to date (ISO format) |

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
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-02-15T10:30:00Z"
    }
  ]
}
```

### Get Log Statistics

**Endpoint**: `GET /api/api-request-logs/stats/`

**Description**: Get API request log statistics.

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
    },
    "method_distribution": {
      "GET": 600,
      "POST": 300,
      "PUT": 50,
      "DELETE": 50
    }
  }
}
```

---

## File System Operations

### List Directory

**Endpoint**: `GET /api/fs/list/`

**Description**: List files and directories in a given path.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Relative path to list |

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
        "modified": "2025-02-15T10:30:00Z",
        "mime_type": "application/pdf"
      }
    ],
    "directories": [
      {
        "name": "images",
        "type": "directory",
        "modified": "2025-02-15T10:30:00Z"
      }
    ]
  }
}
```

### Upload File

**Endpoint**: `POST /api/fs/upload/`

**Description**: Upload a file to the server.

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
    "upload_time": "2025-02-15T10:30:00Z",
    "mime_type": "application/pdf"
  },
  "message": "File uploaded successfully"
}
```

### Download File

**Endpoint**: `GET /api/fs/download/`

**Description**: Download a file from the server.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Relative file path |

**Response**: File content with appropriate headers

### Delete File/Directory

**Endpoint**: `DELETE /api/fs/delete/`

**Description**: Delete a file or directory.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Relative path to delete |

**Response**:
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## User Management

### Get Current User

**Endpoint**: `GET /api/user/me/`

**Description**: Get information about the currently authenticated user.

**Response**:
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "access_level": 0,
    "is_active": true,
    "last_login": "2025-02-15T10:30:00Z",
    "assigned_devices": ["device_123", "device_456"],
    "permissions": ["device_management", "template_management"]
  }
}
```

### Update User Access

**Endpoint**: `POST /api/dashboard-update-access/`

**Description**: Update user access levels (admin only).

**Request Body**:
```json
{
  "admin_email": "admin@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User access updated successfully"
}
```

### Configure User Access

**Endpoint**: `POST /api/dashboard-configure-access/`

**Description**: Configure default user access settings.

**Request Body**:
```json
{
  "admin_email": "admin@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User access configured successfully"
}
```

---

## Utility Endpoints

### Health Check

**Endpoint**: `GET /api/health/`

**Description**: Check API health status.

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-02-15T10:30:00Z",
    "version": "2.0.0",
    "database": "connected",
    "firebase": "connected"
  }
}
```

### API Information

**Endpoint**: `GET /api/`

**Description**: Get API information and available endpoints.

**Response**:
```json
{
  "success": true,
  "message": "FastPay Backend API v2.0.0",
  "data": {
    "version": "2.0.0",
    "endpoints": [
      "/api/devices/",
      "/api/messages/",
      "/api/notifications/",
      "/api/contacts/",
      "/api/bank-card-templates/",
      "/api/gmail/",
      "/api/api-request-logs/",
      "/api/fs/"
    ]
  }
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field_name": ["Specific error details"]
    }
  },
  "timestamp": "2025-02-15T10:30:00Z"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `AUTHENTICATION_ERROR` | 401 | Authentication required/failed |
| `PERMISSION_ERROR` | 403 | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_ERROR` | 429 | Rate limit exceeded |
| `EXTERNAL_SERVICE_ERROR` | 502 | Third-party service error |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Get devices with authentication
const response = await fetch('/api/devices/', {
  credentials: 'include',
  headers: {
    'X-CSRFToken': getCookie('csrftoken')
  }
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

### Python/Requests

```python
import requests

# Create session for authentication
session = requests.Session()
session.post('http://localhost:8000/login/', {
    'username': 'user@example.com',
    'password': 'password'
})

# Get devices
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

### cURL

```bash
# Get devices
curl -X GET "http://localhost:8000/api/devices/" \
  -H "Cookie: sessionid=your_session_id; csrftoken=your_csrf_token"

# Create template
curl -X POST "http://localhost:8000/api/bank-card-templates/" \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionid=your_session_id; csrftoken=your_csrf_token" \
  -H "X-CSRFToken: your_csrf_token" \
  -d '{
    "template_code": "BANK.TEMPLATE",
    "template_name": "Bank Template",
    "card_type": "debit"
  }'
```

---

## Testing Endpoints

### Unit Tests

```bash
# Run all API tests
cd BACKEND
python manage.py test api.tests

# Run specific test
python manage.py test api.tests.test_api
python manage.py test api.tests.test_gmail_oauth_enhanced
python manage.py test api.tests.test_api_log_enhanced
python manage.py test api.tests.test_template_enhanced
```

### Integration Tests

```bash
# Run integration tests
python manage.py test api.tests.integration

# Test specific endpoint
python manage.py test api.tests.test_endpoints.TestDeviceEndpoints
```

---

*This API endpoints documentation serves as the comprehensive reference for all FastPay backend endpoints. Keep this document updated with any API changes.*
