from typing import Any, Dict, Optional
from rest_framework.response import Response


def success_response(
    data: Any = None,
    meta: Optional[Dict[str, Any]] = None,
    message: Optional[str] = None,
    status_code: int = 200,
) -> Response:
    payload: Dict[str, Any] = {
        "success": True,
        "data": data,
        "meta": meta or {},
    }
    if message:
        payload["message"] = message
    return Response(payload, status=status_code)


def error_response(
    error: str,
    status_code: int = 400,
    details: Optional[Dict[str, Any]] = None,
) -> Response:
    payload: Dict[str, Any] = {
        "success": False,
        "error": error,
    }
    if details:
        payload["details"] = details
    return Response(payload, status=status_code)
