export interface MnnrClientOptions {
  apiUrl: string;
  sdkSecret: string;
  defaultUserId?: string;
}

export interface TrackEventPayload {
  event: string;
  userId?: string;
  properties?: Record<string, unknown>;
  occurredAt?: Date;
}

export class MnnrClient {
  private readonly apiUrl: string;
  private readonly sdkSecret: string;
  private readonly defaultUserId?: string;

  constructor(options: MnnrClientOptions) {
    if (!options.apiUrl) {
      throw new Error('apiUrl is required');
    }
    if (!options.sdkSecret) {
      throw new Error('sdkSecret is required');
    }

    this.apiUrl = options.apiUrl.replace(/\/$/, '');
    this.sdkSecret = options.sdkSecret;
    this.defaultUserId = options.defaultUserId;
  }

  async track(payload: TrackEventPayload): Promise<void> {
    const body = {
      event: payload.event,
      userId: payload.userId ?? this.defaultUserId,
      properties: payload.properties ?? {},
      occurredAt: payload.occurredAt?.toISOString()
    };

    const response = await fetch(`${this.apiUrl}/api/sdk/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.sdkSecret}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error?.error || `Failed to track event (${response.status} ${response.statusText})`
      );
    }
  }
}

export default MnnrClient;
