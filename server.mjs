import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
if (dev) process.env.WATCHPACK_POLLING = "true";
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
await app.prepare();

const httpServer = createServer((request, response) => handle(request, response));
const io = new Server(httpServer, { cors: { origin: dev ? true : false } });
const forwardedEvents = [
  "stroke:start",
  "stroke",
  "undo",
  "clear",
  "enter",
  "enhance-note",
  "enhance-note-result",
  "enhance-sketch",
  "enhance-sketch-result",
];

io.on("connection", (client) => {
  client.on("join-session", ({ session, role }) => {
    if (typeof session !== "string" || !/^[a-f0-9]{32}$/.test(session)) return;
    client.data.session = session;
    client.data.role = role;
    client.join(session);
    if (role === "phone") client.to(session).emit("phone:connected");
  });
  for (const event of forwardedEvents) {
    client.on(event, (payload = {}) => {
      if (client.data.session) client.to(client.data.session).emit(event, payload);
    });
  }
  client.on("disconnect", () => {
    if (client.data.session && client.data.role === "phone") client.to(client.data.session).emit("phone:disconnected");
  });
});

httpServer.listen(port, hostname, () => console.log(`> InkFlow ready at http://${hostname}:${port}`));
