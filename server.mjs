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
  const emitPhoneStatus = async (session) => {
    const clients = await io.in(session).fetchSockets();
    const connected = clients.some((socket) => socket.data.role === "phone");
    io.to(session).emit("phone:status", { connected });
  };

  client.on("join-session", async ({ session, role }) => {
    if (typeof session !== "string" || !/^[a-f0-9]{32}$/.test(session)) return;
    if (role !== "phone" && role !== "laptop") return;
    if (client.data.session && client.data.session !== session)
      await client.leave(client.data.session);
    client.data.session = session;
    client.data.role = role;
    await client.join(session);
    await emitPhoneStatus(session);
  });
  for (const event of forwardedEvents) {
    client.on(event, (payload = {}) => {
      if (client.data.session) client.to(client.data.session).emit(event, payload);
    });
  }
  client.on("disconnect", () => {
    if (client.data.session && client.data.role === "phone")
      void emitPhoneStatus(client.data.session);
  });
});

httpServer.listen(port, hostname, () => console.log(`> InkFlow ready at http://${hostname}:${port}`));
