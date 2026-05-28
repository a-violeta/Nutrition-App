const API = "/push";

type VapidResponse = {
  publicKey: string;
};

export async function getVapidPublicKey() {
  const res = await fetch(`${API}/vapid-public-key`);
  if (!res.ok) {
    throw new Error("Could not load VAPID public key.");
  }
  return (await res.json()) as VapidResponse;
}

export async function createPushSubscription(token: string, subscription: PushSubscription) {
  const res = await fetch(`${API}/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subscription),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Could not save push subscription.");
  }

  return res.json();
}

export async function removePushSubscription(token: string) {
  const res = await fetch(`${API}/unsubscribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Could not remove push subscription.");
  }

  return res.json();
}

export async function sendTestPush(token: string) {
  const res = await fetch(`${API}/send-test`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Could not send test push notification.");
  }

  return res.json();
}

type PushSubscription = {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
};
