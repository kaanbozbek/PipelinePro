import { Pipeline, Metric } from '../types';

// Mock data generator
const generateMockPipeline = (): Pipeline => ({
  id: Math.random().toString(36).substr(2, 9),
  name: `Pipeline-${Math.floor(Math.random() * 100)}`,
  status: ['running', 'success', 'failed', 'pending'][Math.floor(Math.random() * 4)] as Pipeline['status'],
  startTime: new Date().toISOString(),
  logs: ['Building application...', 'Running tests...', 'Deploying to staging...']
});

class MockWebSocketService {
  private callbacks: ((data: string) => void)[] = [];
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    this.startMockUpdates();
  }

  addEventListener(event: string, callback: (data: any) => void) {
    if (event === 'message') {
      this.callbacks.push(callback);
    }
  }

  removeEventListener(event: string, callback: (data: any) => void) {
    if (event === 'message') {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    }
  }

  private startMockUpdates() {
    this.interval = setInterval(() => {
      const mockData = {
        type: Math.random() > 0.5 ? 'pipeline_update' : 'metrics_update',
        pipeline: generateMockPipeline(),
        metrics: [
          { id: '1', name: 'CPU', value: Math.floor(Math.random() * 100), unit: '%', timestamp: new Date().toISOString() },
          { id: '2', name: 'Memory', value: +(Math.random() * 8).toFixed(1), unit: 'GB', timestamp: new Date().toISOString() },
          { id: '3', name: 'Requests', value: Math.floor(Math.random() * 1000), unit: '/min', timestamp: new Date().toISOString() },
          { id: '4', name: 'Latency', value: Math.floor(Math.random() * 200), unit: 'ms', timestamp: new Date().toISOString() }
        ]
      };

      this.callbacks.forEach(callback => {
        callback({ data: JSON.stringify(mockData) });
      });
    }, 5000);
  }

  close() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

export const createMockWebSocket = () => new MockWebSocketService();