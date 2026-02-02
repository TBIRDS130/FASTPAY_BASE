import json

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt

from .activity_logger import get_client_ip
from .models import WebhookEvent


def _normalize_webhook_payload(request):
    payload = request.data
    if isinstance(payload, (dict, list)):
        return payload
    if hasattr(payload, 'dict'):
        try:
            return payload.dict()
        except Exception:
            return dict(payload)
    try:
        return json.loads(request.body.decode('utf-8'))
    except Exception:
        return {"raw": request.body.decode('utf-8', errors='replace')}


def _store_webhook_event(event_type, request, payload):
    try:
        WebhookEvent.objects.create(
            event_type=event_type,
            path=request.path,
            client_ip=get_client_ip(request),
            headers=dict(request.headers),
            payload=payload,
        )
    except Exception:
        # Webhook ingestion should not fail due to logging issues
        pass


def _handle_webhook_event(request, event_type):
    webhook_secret = getattr(settings, "WEBHOOK_SECRET", "")
    if webhook_secret:
        provided_secret = request.headers.get('X-Webhook-Secret') or request.query_params.get('secret')
        if provided_secret != webhook_secret:
            return Response(
                {"detail": "Invalid webhook secret"},
                status=status.HTTP_401_UNAUTHORIZED
            )

    payload = _normalize_webhook_payload(request)
    _store_webhook_event(event_type, request, payload)
    return Response(
        {
            "received": True,
            "event": event_type,
            "payload_type": type(payload).__name__,
        },
        status=status.HTTP_202_ACCEPTED
    )


@csrf_exempt
@api_view(['POST'])
def webhook_receive(request):
    """
    Generic webhook receiver.

    Headers:
    - X-Webhook-Secret: Required when WEBHOOK_SECRET is configured.
    """
    payload = _normalize_webhook_payload(request)
    event_type = payload.get('event') if isinstance(payload, dict) else "generic"
    return _handle_webhook_event(request, event_type)


@csrf_exempt
@api_view(['POST'])
def webhook_failed(request):
    """Webhook for FAILED event."""
    return _handle_webhook_event(request, "FAILED")


@csrf_exempt
@api_view(['POST'])
def webhook_success(request):
    """Webhook for SUCCESS event."""
    return _handle_webhook_event(request, "SUCCESS")


@csrf_exempt
@api_view(['POST'])
def webhook_refund(request):
    """Webhook for REFUND event."""
    return _handle_webhook_event(request, "REFUND")


@csrf_exempt
@api_view(['POST'])
def webhook_dispute(request):
    """Webhook for DISPUTE event."""
    return _handle_webhook_event(request, "DISPUTE")
