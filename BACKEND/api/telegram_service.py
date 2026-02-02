import json
import logging
import os
import time
from typing import Iterable, Optional, Sequence, Tuple

import requests

logger = logging.getLogger(__name__)
_LAST_SENT = {}


def _get_bot_token() -> Optional[str]:
    return os.environ.get("TELEGRAM_BOT_TOKEN")


def _parse_chat_ids(value) -> Iterable[str]:
    if not value:
        return []
    if isinstance(value, (list, tuple, set)):
        return [str(cid).strip() for cid in value if str(cid).strip()]
    return [cid.strip() for cid in str(value).split(",") if cid.strip()]


def _get_chat_ids() -> Iterable[str]:
    return _parse_chat_ids(os.environ.get("TELEGRAM_CHAT_IDS", ""))


def _get_bot_configs():
    raw = os.environ.get("TELEGRAM_BOT_CONFIGS")
    if not raw:
        return {}
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("Telegram bot configs invalid JSON")
        return {}
    configs = {}
    if isinstance(data, dict):
        data = [data]
    for entry in data:
        if not isinstance(entry, dict):
            continue
        name = entry.get("name") or entry.get("id")
        token = entry.get("token")
        chat_ids = list(_parse_chat_ids(entry.get("chat_ids")))
        if name and token and chat_ids:
            configs[str(name)] = {"token": str(token), "chat_ids": chat_ids}
    return configs


def _resolve_bot(
    bot_name: Optional[str],
    token: Optional[str],
    chat_ids: Optional[Sequence[str]],
) -> Tuple[Optional[str], Sequence[str]]:
    if token and chat_ids:
        return token, list(_parse_chat_ids(chat_ids))
    if bot_name:
        config = _get_bot_configs().get(bot_name)
        if config:
            return config["token"], config["chat_ids"]
    return _get_bot_token(), list(_get_chat_ids())


def send_telegram_message(
    message: str,
    *,
    bot_name: Optional[str] = None,
    token: Optional[str] = None,
    chat_ids: Optional[Sequence[str]] = None,
    parse_mode: Optional[str] = None,
    disable_preview: bool = True,
    disable_notification: bool = False,
) -> bool:
    token, chat_ids = _resolve_bot(bot_name, token, chat_ids)
    if not token or not chat_ids:
        logger.info("Telegram message skipped: missing bot token or chat ids")
        return False

    ok = True
    for chat_id in chat_ids:
        payload = {
            "chat_id": chat_id,
            "text": message,
            "disable_web_page_preview": disable_preview,
            "disable_notification": disable_notification,
        }
        if parse_mode:
            payload["parse_mode"] = parse_mode
        try:
            response = requests.post(
                f"https://api.telegram.org/bot{token}/sendMessage",
                json=payload,
                timeout=10,
            )
            if not response.ok:
                ok = False
                logger.warning("Telegram message failed: %s", response.text)
        except requests.RequestException as exc:
            ok = False
            logger.warning("Telegram message error: %s", exc)
    return ok


def send_telegram_alert(
    message: str,
    *,
    bot_name: Optional[str] = None,
    token: Optional[str] = None,
    chat_ids: Optional[Sequence[str]] = None,
    throttle_seconds: Optional[int] = None,
    throttle_key: Optional[str] = None,
    parse_mode: Optional[str] = None,
) -> bool:
    throttle_seconds = throttle_seconds or int(
        os.environ.get("TELEGRAM_ALERT_THROTTLE_SECONDS", "60")
    )
    key = throttle_key or message
    now = time.time()
    last_sent = _LAST_SENT.get(key)
    if last_sent and (now - last_sent) < throttle_seconds:
        logger.info("Telegram alert throttled")
        return False
    _LAST_SENT[key] = now

    return send_telegram_message(
        message,
        bot_name=bot_name,
        token=token,
        chat_ids=chat_ids,
        parse_mode=parse_mode,
        disable_preview=True,
    )
