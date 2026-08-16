import { Buffer } from 'buffer';

const MIXPANEL_TOKEN =
  process.env.EXPO_PUBLIC_MIXPANEL_TOKEN ?? 'd89803ed4879e7ea62e0ff89cbd2cbbf';
const TRACK_URL = 'https://api.mixpanel.com/track';

let anonId: string | null = null;
let distinctId: string | null = null;

function currentId(): string {
  if (distinctId) return distinctId;
  if (!anonId) {
    anonId = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
  return anonId;
}

function newAnonId(): void {
  anonId = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sendEvent(event: string, properties: Record<string, unknown>): void {
  const data = JSON.stringify([
    {
      event,
      properties: {
        token: MIXPANEL_TOKEN,
        distinct_id: currentId(),
        time: Math.floor(Date.now() / 1000),
        ...properties,
      },
    },
  ]);
  const encoded = Buffer.from(data, 'utf-8').toString('base64');
  fetch(`${TRACK_URL}/?strict=1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(encoded)}`,
  }).catch(() => {
    // analytics must never break the app
  });
}

export function track(eventName: string, properties?: Record<string, unknown>): void {
  sendEvent(eventName, properties ?? {});
}

export function identifyUser(userId: string): void {
  if (distinctId === userId) return;
  const current = currentId();
  if (current !== userId) {
    sendEvent('$identify', {
      distinct_id: current,
      $identified_id: userId,
    });
  }
  distinctId = userId;
}

export function resetUser(): void {
  distinctId = null;
  newAnonId();
}
