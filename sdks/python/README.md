# MNNR Python SDK

Reference client for sending analytics events to the `/api/sdk/events` endpoint from background jobs or server-side workloads.

## Installation

Copy `sdks/python/mnnr_client.py` into your project or publish it as a private package:

```bash
pip install git+https://github.com/your-org/mnnr-complete2025#subdirectory=sdks/python
```

## Usage

```python
from datetime import datetime
from mnnr_client import MnnrClient, MnnrClientOptions

client = MnnrClient(
    MnnrClientOptions(
        api_url="https://app.mnnr.com",
        sdk_secret="your_sdk_ingest_secret",
        default_user_id="workspace_123",
    )
)

client.track(
    event="document_signed",
    properties={"plan": "Scale", "region": "eu-central"},
    occurred_at=datetime.utcnow(),
)
```

The client raises `RuntimeError` when ingestion fails so you can retry with your queueing system. Events automatically land in Supabase and PostHog when credentials are configured.
