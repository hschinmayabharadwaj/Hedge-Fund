import { WebSocketServer } from "ws";
import { redis } from "./redis";

const clients = new Set();

export function initializeWebSocket(server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    clients.add(ws);
    console.log(`[WS] Client connected (${clients.size} total)`);

    ws.on("close", () => {
      clients.delete(ws);
      console.log(`[WS] Client disconnected (${clients.size} total)`);
    });

    ws.on("error", (err) => {
      console.error("[WS] Client error:", err.message);
      clients.delete(ws);
    });

    ws.send(JSON.stringify({ type: "CONNECTED", payload: { clientCount: clients.size }, timestamp: Date.now() }));
  });

  const subscriber = redis.duplicate();
  subscriber.subscribe("market:updates", (err) => {
    if (err) console.error("[WS] Redis subscribe error:", err.message);
  });

  subscriber.on("message", (channel, message) => {
    const deadClients = [];
    clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      } else {
        deadClients.push(client);
      }
    });
    deadClients.forEach((c) => clients.delete(c));
  });

  wss.on("error", (err) => console.error("[WS] Server error:", err.message));

  return wss;
}

export function broadcast(data) {
  const message = JSON.stringify(data);
  const deadClients = [];
  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    } else {
      deadClients.push(client);
    }
  });
  deadClients.forEach((c) => clients.delete(c));
}
