"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { socket } from "../_lib/socket-client";

type Point = { x: number; y: number };

function MobileWriter() {
  const session = useSearchParams().get("session");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const previous = useRef<Point>({ x: 0, y: 0 });
  const [status, setStatus] = useState("Connecting…");
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

  useEffect(() => {
    if (!session) {
      const frame = requestAnimationFrame(() => setStatus("Invalid connection link"));
      return () => cancelAnimationFrame(frame);
    }
    const connected = () => {
      setStatus("Connected to laptop");
      socket.emit("join-session", { session, role: "phone" });
    };
    const disconnected = () => setStatus("Reconnecting…");
    socket.on("connect", connected);
    socket.on("disconnect", disconnected);
    if (!socket.connected) socket.connect(); else connected();
    return () => { socket.off("connect", connected); socket.off("disconnect", disconnected); socket.disconnect(); };
  }, [session]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    previous.current = point(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    socket.emit("stroke:start", {});
  };
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const next = point(event);
    const context = canvas.getContext("2d");
    if (!context) return;
    context.beginPath();
    context.moveTo(previous.current.x, previous.current.y);
    context.lineTo(next.x, next.y);
    context.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    context.strokeStyle = "#29243b";
    context.lineWidth = tool === "eraser" ? 20 : 3;
    context.lineCap = "round";
    context.stroke();
    socket.emit("stroke", { from: { x: previous.current.x / rect.width, y: previous.current.y / rect.height }, to: { x: next.x / rect.width, y: next.y / rect.height }, tool });
    previous.current = next;
  };
  const command = (event: "undo" | "clear" | "enter") => socket.emit(event, {});

  return <main className="mobile-writer">
    <header><div><i /><span><b>InkFlow mobile</b><small>{status}</small></span></div></header>
    <div className="mobile-writer-tools">
      <button className={tool === "pen" ? "active" : ""} onClick={() => setTool("pen")}>✎ Pen</button>
      <button className={tool === "eraser" ? "active" : ""} onClick={() => setTool("eraser")}>⌫ Erase</button>
      <button onClick={() => command("enter")}>↵ Enter</button>
      <button onClick={() => command("undo")}>↶ Undo</button>
      <button onClick={() => { const canvas = canvasRef.current; if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height); command("clear"); }}>Clear</button>
    </div>
    <canvas ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={() => drawing.current = false} onPointerCancel={() => drawing.current = false} />
    <p>Write with your finger or stylus. Your strokes appear live on the laptop.</p>
  </main>;
}

export default function MobileWriterPage() {
  return <Suspense fallback={<main className="mobile-writer"><p>Opening socket session…</p></main>}><MobileWriter /></Suspense>;
}
