import type { SSEDelayUpdate, SSERouteUpdate } from '@/types';

type SSEEventType = 'delay' | 'route';
type SSECallback<T> = (data: T) => void;

class SSEClient {
  private eventSource: EventSource | null = null;
  private url: string;
  private reconnectInterval: number = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private listeners: Map<SSEEventType, Set<SSECallback<any>>> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  connect(token?: string) {
    if (this.eventSource) {
      return; // Already connected
    }

    const urlWithAuth = token ? `${this.url}?token=${token}` : this.url;
    this.eventSource = new EventSource(urlWithAuth);

    this.eventSource.onopen = () => {
      console.log('[SSE] Connected');
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('[SSE] Error:', error);
      this.eventSource?.close();
      this.eventSource = null;
      this.scheduleReconnect(token);
    };

    // Listen for delay updates
    this.eventSource.addEventListener('delay', (event) => {
      try {
        const data: SSEDelayUpdate = JSON.parse(event.data);
        this.notifyListeners('delay', data);
      } catch (error) {
        console.error('[SSE] Failed to parse delay event:', error);
      }
    });

    // Listen for route updates
    this.eventSource.addEventListener('route', (event) => {
      try {
        const data: SSERouteUpdate = JSON.parse(event.data);
        this.notifyListeners('route', data);
      } catch (error) {
        console.error('[SSE] Failed to parse route event:', error);
      }
    });

    // Listen for generic messages
    this.eventSource.onmessage = (event) => {
      console.log('[SSE] Message:', event.data);
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect(token?: string) {
    if (this.reconnectTimer) {
      return; // Already scheduled
    }

    console.log(`[SSE] Reconnecting in ${this.reconnectInterval}ms...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(token);
    }, this.reconnectInterval);
  }

  subscribe<T = any>(
    eventType: SSEEventType,
    callback: SSECallback<T>
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  private notifyListeners(eventType: SSEEventType, data: any) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }
}

// Create singleton instance
const SSE_URL = process.env.NEXT_PUBLIC_SSE_URL || 'http://localhost:3001/api/sse/delays';
export const sseClient = new SSEClient(SSE_URL);

// Hook for using SSE in React components
export function useSSE() {
  return sseClient;
}
