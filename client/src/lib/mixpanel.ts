import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || 'd89803ed4879e7ea62e0ff89cbd2cbbf';

let initialized = false;

function ensureInit() {
  if (initialized) return;
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: import.meta.env.DEV,
  });
  initialized = true;
}

export function track(eventName: string, properties?: Record<string, unknown>) {
  ensureInit();
  mixpanel.track(eventName, properties);
}

export function identifyUser(userId: string) {
  ensureInit();
  mixpanel.identify(userId);
}

export function resetUser() {
  ensureInit();
  mixpanel.reset();
}
