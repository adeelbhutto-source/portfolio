'use client';
/**
 * Offline write queue using IndexedDB.
 * Queues failed API mutations when offline and replays them when back online.
 */
import { useEffect, useRef } from 'react';
import { API_URL } from '@/lib/env';

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body: string;
  timestamp: number;
}

const DB_NAME = 'pcp-offline';
const STORE = 'queue';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function enqueue(item: QueuedRequest) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dequeueAll(): Promise<QueuedRequest[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      store.clear();
      resolve(req.result as QueuedRequest[]);
    };
    req.onerror = () => reject(req.error);
  });
}

export function useOfflineQueue() {
  const baseUrl = API_URL;
  const replayingRef = useRef(false);

  async function replay() {
    if (replayingRef.current || !navigator.onLine) return;
    replayingRef.current = true;
    try {
      const items = await dequeueAll();
      for (const item of items) {
        try {
          await fetch(`${baseUrl}${item.url}`, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: item.body,
          });
        } catch {
          await enqueue(item);
        }
      }
    } finally {
      replayingRef.current = false;
    }
  }

  useEffect(() => {
    window.addEventListener('online', replay);
    if (navigator.onLine) replay();
    return () => window.removeEventListener('online', replay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function queuedFetch(url: string, method: string, body: object) {
    if (!navigator.onLine) {
      await enqueue({
        id: `${Date.now()}-${Math.random()}`,
        url,
        method,
        body: JSON.stringify(body),
        timestamp: Date.now(),
      });
      throw new Error('You\'re offline — this will sync automatically when you reconnect.');
    }
    const res = await fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Request failed');
    }
    return res.json();
  }

  return { queuedFetch };
}
