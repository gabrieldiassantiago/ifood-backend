import { ServerWebSocket } from "bun";

interface WebSocketData {
  id?: string;
  userId?: string;
  role?: string;
}

class WebSocketService {
  private connections = new Set<ServerWebSocket<WebSocketData>>();

  addConnection(ws: ServerWebSocket<WebSocketData>) {
    this.connections.add(ws);
  }

  removeConnection(ws: ServerWebSocket<WebSocketData>) {
    this.connections.delete(ws);
  }

  broadcastToAdmins(event: string, data: any) {
    let sent = 0;
    this.connections.forEach((ws) => {
      try {
        const wsData = (ws as any).data;
        if (wsData?.role === "ADMIN") {
          ws.send(
            JSON.stringify({
              event,
              data,
              timestamp: new Date().toISOString(),
            })
          );
          sent++;
        }
      } catch (error) {
        console.error("Erro ao enviar mensagem WebSocket:", error);
      }
    });
  }

  sendToUser(userId: string, event: string, data: any) {
    this.connections.forEach((ws) => {
      try {
        const wsData = (ws as any).data;
        if (wsData?.userId === userId) {
          ws.send(
            JSON.stringify({
              event,
              data,
              timestamp: new Date().toISOString(),
            })
          );
        }
      } catch (error) {
        console.error("Erro ao enviar mensagem WebSocket:", error);
      }
    });
  }

  broadcast(event: string, data: any) {
    this.connections.forEach((ws) => {
      try {
        ws.send(
          JSON.stringify({
            event,
            data,
            timestamp: new Date().toISOString(),
          })
        );
      } catch (error) {
        console.error("Erro ao enviar mensagem WebSocket:", error);
      }
    });
    console.log(`📡 Broadcast '${event}' enviado para ${this.connections.size} cliente(s)`);
  }

  getConnectionCount(): number {
    return this.connections.size;
  }
}

export const wsService = new WebSocketService();
