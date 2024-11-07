import { useState, useEffect, useCallback } from 'react';
import { Pipeline, Metric } from '../types';
import { createMockWebSocket } from '../services/mockWebSocket';

const isDevelopment = import.meta.env.DEV;

export function useWebSocketData() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleWebSocketMessage = useCallback((data: any) => {
    try {
      const parsedData = JSON.parse(data.data);
      
      if (parsedData.type === 'pipeline_update') {
        setPipelines(prev => {
          const index = prev.findIndex(p => p.id === parsedData.pipeline.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = parsedData.pipeline;
            return updated;
          }
          return [...prev, parsedData.pipeline];
        });
      } else if (parsedData.type === 'metrics_update') {
        setMetrics(parsedData.metrics);
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
      setError('Failed to process update');
    }
  }, []);

  useEffect(() => {
    let ws: any;

    try {
      if (isDevelopment) {
        ws = createMockWebSocket();
      } else {
        ws = new WebSocket('wss://your-production-websocket-endpoint');
      }

      ws.addEventListener('message', handleWebSocketMessage);

      return () => {
        if (ws) {
          ws.removeEventListener('message', handleWebSocketMessage);
          if (typeof ws.close === 'function') {
            ws.close();
          }
        }
      };
    } catch (err) {
      console.error('WebSocket connection error:', err);
      setError('Failed to connect to WebSocket');
    }
  }, [handleWebSocketMessage]);

  return { pipelines, metrics, error };
}