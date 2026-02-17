import { Elysia, t } from "elysia";
import { wsService } from "./websocket.service";
import jwt from "@elysiajs/jwt";
import { prisma } from "../../../prisma/db";

export const websocket = new Elysia({ prefix: "/ws" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "secreto",
    })
  )

  .ws("/chat", {
    query: t.Object({
      token: t.String(),
    }),

    // Quando a conexão é estabelecida
    async open(ws) {
      try {
        console.log(" Nova conexão WebSocket tentando...");
        
        const token = ws.data.query.token;
        
        if (!token) {
          console.error(" Token não fornecido");
          ws.close(4001, "Token não fornecido");
          return;
        }

        const payload: any = await ws.data.jwt.verify(token);

        if (!payload) {
          console.error(" Token inválido ou expirado");
          ws.close(4002, "Token inválido");
          return;
        }

        console.log(" WebSocket autenticado:", { userId: payload.id, role: payload.role });

        // Armazenar dados do usuário no WebSocket nativo
        const rawWs: any = ws.raw;
        rawWs.data = {
          ...rawWs.data,
          userId: payload.id,
          role: payload.role,
          id: crypto.randomUUID(),
        };

        wsService.addConnection(ws.raw as any);

        // Enviar mensagem de boas-vindas ao chat
        ws.send(
          JSON.stringify({
            event: "connected",
            data: {
              message: "Conectado ao servidor de chat",
              userId: payload.id,
              role: payload.role,
            },
            timestamp: new Date().toISOString(),
          })
        );
      } catch (error) {
        console.error(" Erro ao autenticar WebSocket:", error);
        ws.close(4003, "Erro de autenticação");
      }
    },

    // Quando receber uma mensagem
    async message(ws, message: any) {
      try {
        // Parse da mensagem se for string
        const parsedMessage = typeof message === 'string' ? JSON.parse(message) : message;
        const { event, data } = parsedMessage;

        if (event === "ping") {
          ws.send(JSON.stringify({ event: "pong", timestamp: new Date().toISOString() }));
          return;
        }

        if (event === "join_chat") {
          const { orderId } = data;
          if (!orderId) return;

          // Se inscrever no tópico do pedido
          ws.raw.subscribe(`order_${orderId}`);

          // Buscar histórico de mensagens
          const messages = await prisma.message.findMany({
            where: { orderId },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, name: true, role: true } } }
          });

          // Enviar histórico
          ws.send(JSON.stringify({
            event: "chat_history",
            data: { messages, orderId },
            timestamp: new Date().toISOString()
          }));

          console.log(` Usuário ${(ws.raw.data as any).userId} entrou no chat do pedido ${orderId}`);
        }

        if (event === "send_message") {
          const { orderId, content } = data;
          if (!orderId || !content) return;

          // Persistir mensagem
          const newMessage = await prisma.message.create({
            data: {
              content,
              orderId,
              senderId: (ws.raw.data as any).userId as string,
            },
            include: { sender: { select: { id: true, name: true, role: true } } }
          });

          const msgPayload = JSON.stringify({
            event: "new_message",
            data: newMessage,
            timestamp: new Date().toISOString()
          });

          ws.raw.publish(`order_${orderId}`, msgPayload);
          ws.send(msgPayload);
        }

      } catch (error) {
        console.error(" Erro no processamento da mensagem:", error);
      }
    },

    // Quando a conexão é fechada
    close(ws, code, message) {
      console.log(` WebSocket fechado: ${code} - ${message}`);
      wsService.removeConnection(ws.raw as any);
    },

    idleTimeout: 600, 
    maxPayloadLength: 16 * 1024 * 1024, 
  });
