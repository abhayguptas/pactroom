import { Response } from 'express';

export interface PactRoomEvent {
  type:
    | 'system_log'
    | 'terminal_output'
    | 'agent_thought'
    | 'agent_message'
    | 'breaking_detected'
    | 'verification_step'
    | 'negotiation_update'
    | 'patch_update'
    | 'consumer_breakage'
    | 'room_decision'
    | 'agent_log';
  payload: any;
  timestamp: string;
}

class SseManager {
  private clients: Set<Response> = new Set();

  addClient(res: Response): () => void {
    this.clients.add(res);

    // Initial greeting / ping
    res.write(`data: ${JSON.stringify({
      type: 'system_log',
      payload: { message: 'Connected to PactRoom Real-Time SSE Stream' },
      timestamp: new Date().toISOString()
    })}\n\n`);

    const cleanup = () => {
      this.clients.delete(res);
    };

    res.on('close', cleanup);
    return cleanup;
  }

  broadcast(type: PactRoomEvent['type'], payload: any): void {
    const event: PactRoomEvent = {
      type,
      payload,
      timestamp: new Date().toISOString()
    };

    const data = `data: ${JSON.stringify(event)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(data);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

export const sseManager = new SseManager();

