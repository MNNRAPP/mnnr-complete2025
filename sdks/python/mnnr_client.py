"""MNNR Python SDK.

Simple wrapper around the analytics ingestion endpoint so backend workloads can
emit structured events without touching HTTP primitives directly.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, Optional

import json
import urllib.request


@dataclass
class MnnrClientOptions:
    api_url: str
    sdk_secret: str
    default_user_id: Optional[str] = None


class MnnrClient:
    def __init__(self, options: MnnrClientOptions) -> None:
        if not options.api_url:
            raise ValueError("api_url is required")
        if not options.sdk_secret:
            raise ValueError("sdk_secret is required")

        self._api_url = options.api_url.rstrip("/")
        self._sdk_secret = options.sdk_secret
        self._default_user_id = options.default_user_id

    def track(
        self,
        *,
        event: str,
        user_id: Optional[str] = None,
        properties: Optional[Dict[str, Any]] = None,
        occurred_at: Optional[datetime] = None,
    ) -> None:
        """Send an analytics event to the ingestion API.

        Raises:
            urllib.error.HTTPError: When the server returns a non-2xx status code.
            urllib.error.URLError: When the request cannot be completed.
        """

        payload = {
            "event": event,
            "userId": user_id or self._default_user_id,
            "properties": properties or {},
        }

        if occurred_at:
            payload["occurredAt"] = occurred_at.isoformat()

        request = urllib.request.Request(
            url=f"{self._api_url}/api/sdk/events",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self._sdk_secret}",
            },
            method="POST",
        )

        with urllib.request.urlopen(request) as response:
            if response.status >= 400:
                body = response.read().decode("utf-8")
                raise RuntimeError(f"Failed to track event: {response.status} {body}")
