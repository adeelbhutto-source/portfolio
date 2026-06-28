'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export type PushStatus = 'unsupported' | 'denied' | 'default' | 'granted';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const ok = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(ok);
    if (ok) setStatus(Notification.permission as PushStatus);
  }, []);

  async function subscribe() {
    if (!supported) return;
    try {
      const { publicKey } = await apiFetch<{ publicKey: string }>('/account/vapid-public-key');
      const permission = await Notification.requestPermission();
      setStatus(permission as PushStatus);
      if (permission !== 'granted') return;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const json = sub.toJSON();
      await apiFetch('/account/push-subscription', {
        method: 'POST',
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });
    } catch {
      // Push subscription failed — user can retry from Account page
    }
  }

  return { supported, status, subscribe };
}
