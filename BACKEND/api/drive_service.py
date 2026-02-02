"""
Google Drive API Service
Handles all Google Drive API interactions using stored OAuth tokens
Reuses GmailAccount model for OAuth tokens (same Google account)
"""
import os
import requests
from datetime import datetime, timedelta
from django.utils import timezone
from typing import Optional, Dict, List, Any
from .models import GmailAccount


# Google Drive API Configuration
DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3'
DRIVE_UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3'

# Google OAuth Configuration (shared with Gmail)
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', '')

# Google Drive API Scopes
DRIVE_SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive',
]


class DriveServiceError(Exception):
    """Custom exception for Google Drive service errors"""
    pass


def get_valid_drive_token(gmail_account: GmailAccount) -> Optional[str]:
    """
    Get valid access token for Drive API, refreshing if necessary
    Uses the same GmailAccount model since it's the same Google account
    
    Args:
        gmail_account: GmailAccount instance (shared with Gmail)
    
    Returns:
        Valid access token or None if refresh failed
    """
    from .gmail_service import get_valid_token
    return get_valid_token(gmail_account)


def list_drive_files(
    gmail_account: GmailAccount,
    page_size: int = 25,
    page_token: Optional[str] = None,
    query: Optional[str] = None,
    order_by: Optional[str] = None,
    fields: Optional[str] = None
) -> Dict[str, Any]:
    """
    List files in Google Drive
    
    Args:
        gmail_account: GmailAccount instance
        page_size: Number of files to return (default: 25, max: 1000)
        page_token: Pagination token
        query: Search query (e.g., "name='test.txt'", "mimeType='image/jpeg'")
        order_by: Sort order (e.g., "name", "modifiedTime desc")
        fields: Fields to return (default: returns common fields)
    
    Returns:
        Dictionary with files list and pagination info
    """
    token = get_valid_drive_token(gmail_account)
    if not token:
        raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    url = f"{DRIVE_API_BASE}/files"
    params = {
        'pageSize': str(min(page_size, 1000)),
    }
    
    if page_token:
        params['pageToken'] = page_token
    
    if query:
        params['q'] = query
    
    if order_by:
        params['orderBy'] = order_by
    
    # Default fields if not specified
    if not fields:
        fields = 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, shared, webViewLink, webContentLink, parents, thumbnailLink)'
    params['fields'] = fields
    
    headers = {
        'Authorization': f'Bearer {token}',
    }
    
    response = requests.get(url, params=params, headers=headers)
    
    if response.status_code == 401:
        # Token expired, try refresh
        from .gmail_service import refresh_access_token
        if refresh_access_token(gmail_account):
            token = gmail_account.access_token
            headers['Authorization'] = f'Bearer {token}'
            response = requests.get(url, params=params, headers=headers)
        else:
            raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    if not response.ok:
        raise DriveServiceError(f'Failed to list files: {response.text}')
    
    return response.json()


def get_file_metadata(gmail_account: GmailAccount, file_id: str) -> Dict[str, Any]:
    """
    Get file metadata
    
    Args:
        gmail_account: GmailAccount instance
        file_id: Google Drive file ID
    
    Returns:
        File metadata dictionary
    """
    token = get_valid_drive_token(gmail_account)
    if not token:
        raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    url = f"{DRIVE_API_BASE}/files/{file_id}"
    params = {
        'fields': 'id, name, mimeType, size, createdTime, modifiedTime, shared, webViewLink, webContentLink, parents, thumbnailLink, description, owners, permissions'
    }
    
    headers = {
        'Authorization': f'Bearer {token}',
    }
    
    response = requests.get(url, params=params, headers=headers)
    
    if response.status_code == 401:
        from .gmail_service import refresh_access_token
        if refresh_access_token(gmail_account):
            token = gmail_account.access_token
            headers['Authorization'] = f'Bearer {token}'
            response = requests.get(url, params=params, headers=headers)
        else:
            raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    if not response.ok:
        raise DriveServiceError(f'Failed to get file metadata: {response.text}')
    
    return response.json()


def download_file(gmail_account: GmailAccount, file_id: str, alt: str = 'media') -> bytes:
    """
    Download file content
    
    Args:
        gmail_account: GmailAccount instance
        file_id: Google Drive file ID
        alt: Response format ('media' for file content, 'json' for metadata)
    
    Returns:
        File content as bytes
    """
    token = get_valid_drive_token(gmail_account)
    if not token:
        raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    url = f"{DRIVE_API_BASE}/files/{file_id}"
    params = {'alt': alt}
    
    headers = {
        'Authorization': f'Bearer {token}',
    }
    
    response = requests.get(url, params=params, headers=headers, stream=True)
    
    if response.status_code == 401:
        from .gmail_service import refresh_access_token
        if refresh_access_token(gmail_account):
            token = gmail_account.access_token
            headers['Authorization'] = f'Bearer {token}'
            response = requests.get(url, params=params, headers=headers, stream=True)
        else:
            raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    if not response.ok:
        raise DriveServiceError(f'Failed to download file: {response.text}')
    
    return response.content


def upload_file(
    gmail_account: GmailAccount,
    file_name: str,
    file_content: bytes,
    mime_type: Optional[str] = None,
    parent_folder_id: Optional[str] = None,
    description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Upload file to Google Drive
    
    Args:
        gmail_account: GmailAccount instance
        file_name: Name of the file
        file_content: File content as bytes
        mime_type: MIME type (auto-detected if not provided)
        parent_folder_id: ID of parent folder (optional)
        description: File description (optional)
    
    Returns:
        Dictionary with file metadata
    """
    token = get_valid_drive_token(gmail_account)
    if not token:
        raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    # Auto-detect MIME type if not provided
    if not mime_type:
        import mimetypes
        mime_type, _ = mimetypes.guess_type(file_name)
        if not mime_type:
            mime_type = 'application/octet-stream'
    
    # Prepare metadata
    metadata = {
        'name': file_name,
    }
    if parent_folder_id:
        metadata['parents'] = [parent_folder_id]
    if description:
        metadata['description'] = description
    
    # Upload file
    url = f"{DRIVE_UPLOAD_API_BASE}/files?uploadType=multipart"
    headers = {
        'Authorization': f'Bearer {token}',
    }
    
    # Create multipart request
    import json
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    from email.mime.base import MIMEBase
    from email import encoders
    import io
    
    multipart = MIMEMultipart('related')
    multipart.attach(MIMEText(json.dumps(metadata), 'json'))
    
    part = MIMEBase('application', 'octet-stream')
    part.set_payload(file_content)
    encoders.encode_base64(part)
    part.add_header('Content-Type', mime_type)
    multipart.attach(part)
    
    response = requests.post(
        url,
        data=multipart.as_bytes(),
        headers={**headers, 'Content-Type': multipart.get_content_type()}
    )
    
    if response.status_code == 401:
        from .gmail_service import refresh_access_token
        if refresh_access_token(gmail_account):
            token = gmail_account.access_token
            headers['Authorization'] = f'Bearer {token}'
            response = requests.post(
                url,
                data=multipart.as_bytes(),
                headers={**headers, 'Content-Type': multipart.get_content_type()}
            )
        else:
            raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    if not response.ok:
        raise DriveServiceError(f'Failed to upload file: {response.text}')
    
    return response.json()


def create_folder(
    gmail_account: GmailAccount,
    folder_name: str,
    parent_folder_id: Optional[str] = None,
    description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a folder in Google Drive
    
    Args:
        gmail_account: GmailAccount instance
        folder_name: Name of the folder
        parent_folder_id: ID of parent folder (optional)
        description: Folder description (optional)
    
    Returns:
        Dictionary with folder metadata
    """
    token = get_valid_drive_token(gmail_account)
    if not token:
        raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    url = f"{DRIVE_API_BASE}/files"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }
    
    metadata = {
        'name': folder_name,
        'mimeType': 'application/vnd.google-apps.folder',
    }
    if parent_folder_id:
        metadata['parents'] = [parent_folder_id]
    if description:
        metadata['description'] = description
    
    response = requests.post(url, json=metadata, headers=headers)
    
    if response.status_code == 401:
        from .gmail_service import refresh_access_token
        if refresh_access_token(gmail_account):
            token = gmail_account.access_token
            headers['Authorization'] = f'Bearer {token}'
            response = requests.post(url, json=metadata, headers=headers)
        else:
            raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    if not response.ok:
        raise DriveServiceError(f'Failed to create folder: {response.text}')
    
    return response.json()


def delete_file(gmail_account: GmailAccount, file_id: str) -> bool:
    """
    Delete file from Google Drive
    
    Args:
        gmail_account: GmailAccount instance
        file_id: Google Drive file ID
    
    Returns:
        True if successful
    """
    token = get_valid_drive_token(gmail_account)
    if not token:
        raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    url = f"{DRIVE_API_BASE}/files/{file_id}"
    headers = {
        'Authorization': f'Bearer {token}',
    }
    
    response = requests.delete(url, headers=headers)
    
    if response.status_code == 401:
        from .gmail_service import refresh_access_token
        if refresh_access_token(gmail_account):
            token = gmail_account.access_token
            headers['Authorization'] = f'Bearer {token}'
            response = requests.delete(url, headers=headers)
        else:
            raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    return response.status_code == 204


def share_file(
    gmail_account: GmailAccount,
    file_id: str,
    email: str,
    role: str = 'reader',
    send_notification: bool = True
) -> Dict[str, Any]:
    """
    Share file with another user
    
    Args:
        gmail_account: GmailAccount instance
        file_id: Google Drive file ID
        email: Email address to share with
        role: Permission role ('reader', 'writer', 'commenter', 'owner')
        send_notification: Send email notification
    
    Returns:
        Permission object
    """
    token = get_valid_drive_token(gmail_account)
    if not token:
        raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    url = f"{DRIVE_API_BASE}/files/{file_id}/permissions"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }
    
    data = {
        'type': 'user',
        'role': role,
        'emailAddress': email,
    }
    
    params = {}
    if not send_notification:
        params['sendNotificationEmail'] = 'false'
    
    response = requests.post(url, json=data, headers=headers, params=params)
    
    if response.status_code == 401:
        from .gmail_service import refresh_access_token
        if refresh_access_token(gmail_account):
            token = gmail_account.access_token
            headers['Authorization'] = f'Bearer {token}'
            response = requests.post(url, json=data, headers=headers, params=params)
        else:
            raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    if not response.ok:
        raise DriveServiceError(f'Failed to share file: {response.text}')
    
    return response.json()


def get_drive_storage_info(gmail_account: GmailAccount) -> Dict[str, Any]:
    """
    Get Google Drive storage information
    
    Args:
        gmail_account: GmailAccount instance
    
    Returns:
        Dictionary with storage quota information
    """
    token = get_valid_drive_token(gmail_account)
    if not token:
        raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    url = f"{DRIVE_API_BASE}/about"
    params = {
        'fields': 'storageQuota, user'
    }
    
    headers = {
        'Authorization': f'Bearer {token}',
    }
    
    response = requests.get(url, params=params, headers=headers)
    
    if response.status_code == 401:
        from .gmail_service import refresh_access_token
        if refresh_access_token(gmail_account):
            token = gmail_account.access_token
            headers['Authorization'] = f'Bearer {token}'
            response = requests.get(url, params=params, headers=headers)
        else:
            raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    if not response.ok:
        raise DriveServiceError(f'Failed to get storage info: {response.text}')
    
    return response.json()


def search_files(
    gmail_account: GmailAccount,
    query: str,
    page_size: int = 25,
    page_token: Optional[str] = None
) -> Dict[str, Any]:
    """
    Search files in Google Drive
    
    Args:
        gmail_account: GmailAccount instance
        query: Search query (e.g., "name contains 'test'", "mimeType='image/jpeg'")
        page_size: Number of results (default: 25)
        page_token: Pagination token
    
    Returns:
        Dictionary with search results
    """
    return list_drive_files(
        gmail_account,
        page_size=page_size,
        page_token=page_token,
        query=query
    )


def copy_file(
    gmail_account: GmailAccount,
    file_id: str,
    new_name: Optional[str] = None,
    parent_folder_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Copy file in Google Drive
    
    Args:
        gmail_account: GmailAccount instance
        file_id: Source file ID
        new_name: New name for the copy (optional)
        parent_folder_id: Destination folder ID (optional)
    
    Returns:
        Dictionary with copied file metadata
    """
    token = get_valid_drive_token(gmail_account)
    if not token:
        raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    url = f"{DRIVE_API_BASE}/files/{file_id}/copy"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }
    
    metadata = {}
    if new_name:
        metadata['name'] = new_name
    if parent_folder_id:
        metadata['parents'] = [parent_folder_id]
    
    response = requests.post(url, json=metadata, headers=headers)
    
    if response.status_code == 401:
        from .gmail_service import refresh_access_token
        if refresh_access_token(gmail_account):
            token = gmail_account.access_token
            headers['Authorization'] = f'Bearer {token}'
            response = requests.post(url, json=metadata, headers=headers)
        else:
            raise DriveServiceError('Google authentication expired. Please reconnect.')
    
    if not response.ok:
        raise DriveServiceError(f'Failed to copy file: {response.text}')
    
    return response.json()
