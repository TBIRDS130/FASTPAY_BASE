"""
API request logging middleware.
Persists API call history to ApiRequestLog for monitoring and debugging.
"""
import time
import logging

logger = logging.getLogger(__name__)


def _get_client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR") or ""


def _safe_get_json_body(request, max_bytes=10240):
    content_type = request.META.get("CONTENT_TYPE", "")
    if "application/json" not in content_type.lower():
        return None
    try:
        body = request.body
    except Exception:
        return None
    if not body or len(body) > max_bytes:
        return None
    try:
        import json
        return json.loads(body.decode("utf-8"))
    except Exception:
        return None


def _extract_device_id(request, body_data):
    device_id = request.GET.get("device_id")
    if not device_id:
        device_id = request.META.get("HTTP_X_DEVICE_ID")
    if not device_id and body_data:
        device_id = body_data.get("device_id") or body_data.get("deviceId")
        if not device_id:
            device = body_data.get("device")
            if isinstance(device, str):
                device_id = device
            elif isinstance(device, dict):
                device_id = device.get("device_id") or device.get("deviceId")
    if not device_id:
        path = request.path or ""
        if path.startswith("/api/devices/"):
            parts = [p for p in path.split("/") if p]
            if len(parts) >= 3 and parts[1] == "devices":
                device_id = parts[2]
    return device_id


def _extract_dashboard_user(request, body_data):
    if not (request.path or "").startswith("/api/dashboard-"):
        return None
    if body_data and isinstance(body_data, dict):
        email = body_data.get("email") or body_data.get("user_email")
        if email:
            return email
    return request.GET.get("email") or request.GET.get("user_email")


def _is_localhost(request):
    host = request.get_host() if hasattr(request, "get_host") else ""
    if not host:
        host = request.META.get("HTTP_HOST", "")
    host = host.lower()
    return host.startswith("localhost") or host.startswith("127.0.0.1") or host.startswith("[::1]")


def _get_user_identifier(request, auth_type=None, token_user=None):
    if hasattr(request, "user") and request.user.is_authenticated:
        user = request.user
        parts = []
        user_id = getattr(user, "pk", None) or getattr(user, "id", None)
        if user_id is not None:
            parts.append(f"id={user_id}")
        email = getattr(user, "email", None)
        if email:
            parts.append(f"email={email}")
        username = getattr(user, "username", None)
        if username and username != email:
            parts.append(f"user={username}")
        if not parts:
            parts.append(str(user))
        return " ".join(parts)[:255]

    parts = []
    body_data = _safe_get_json_body(request)
    dashboard_user = _extract_dashboard_user(request, body_data)
    device_id = _extract_device_id(request, body_data)
    if token_user:
        parts.append(f"{auth_type or 'token'}={token_user}")

    header_user = request.META.get("HTTP_X_USER_EMAIL") or request.META.get("HTTP_X_TOKEN_USER")
    if header_user:
        parts.append(f"header={header_user}")

    query_user = request.GET.get("user_email") or request.GET.get("email")
    if query_user:
        parts.append(f"param={query_user}")

    if dashboard_user:
        parts.append(f"dash={dashboard_user}")
    if device_id:
        parts.append(f"device={device_id}")
    if _is_localhost(request):
        parts.append("host=localhost")

    if not parts and auth_type:
        parts.append(f"auth={auth_type}")

    return " ".join(parts)[:255] if parts else None


def _get_auth_details(request):
    """
    Determine auth type and token user for logging.
    Prefers authenticated user, then header-based identity, then query param.
    """
    if hasattr(request, "user") and request.user.is_authenticated:
        return "session", getattr(request.user, "email", None) or str(request.user)

    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if auth_header:
        parts = auth_header.split(None, 1)
        scheme = parts[0].lower()
        token = parts[1] if len(parts) > 1 else ""
        if scheme == "bearer":
            auth_type = "bearer"
        elif scheme == "token":
            auth_type = "token"
        else:
            auth_type = "authorization"
        # If the token looks like an email, capture it
        token_user = token if "@" in token else None
        return auth_type, token_user

    header_user = request.META.get("HTTP_X_USER_EMAIL") or request.META.get("HTTP_X_TOKEN_USER")
    if header_user:
        return "header", header_user

    query_user = request.GET.get("user_email") or request.GET.get("email")
    if query_user:
        return "param", query_user

    return None, None


class ApiRequestLogMiddleware:
    """
    Logs API requests to ApiRequestLog (method, path, status, user, IP, response time).
    Only logs paths under /api/; skips static, admin, schema, etc.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path
        if not path.startswith("/api/"):
            return self.get_response(request)

        start = time.perf_counter()
        response = self.get_response(request)
        elapsed_ms = int((time.perf_counter() - start) * 1000)

        try:
            from .models import ApiRequestLog
            auth_type, token_user = _get_auth_details(request)

            ApiRequestLog.objects.create(
                method=request.method[:10] if request.method else "",
                path=path[:512],
                status_code=response.status_code,
                user_identifier=_get_user_identifier(request, auth_type=auth_type, token_user=token_user),
                client_ip=_get_client_ip(request) or None,
                host=request.get_host()[:255] if request.get_host() else None,
                origin=request.META.get("HTTP_ORIGIN")[:255] if request.META.get("HTTP_ORIGIN") else None,
                referer=request.META.get("HTTP_REFERER")[:1024] if request.META.get("HTTP_REFERER") else None,
                user_agent=request.META.get("HTTP_USER_AGENT"),
                x_forwarded_for=request.META.get("HTTP_X_FORWARDED_FOR")[:512] if request.META.get("HTTP_X_FORWARDED_FOR") else None,
                auth_type=auth_type,
                token_user=token_user,
                response_time_ms=elapsed_ms,
            )
        except Exception as e:
            logger.warning("ApiRequestLogMiddleware: failed to log request: %s", e)

        return response
