"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { socket } from "../_lib/socket-client";

type Point = { x: number; y: number };

function MobileWriter() {
  const searchParams = useSearchParams();
  const session = searchParams.get("session");
  const mode = searchParams.get("mode") === "sketch" ? "sketch" : "notes";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const previous = useRef<Point>({ x: 0, y: 0 });
  const undoStack = useRef<ImageData[]>([]);
  const [status, setStatus] = useState("Connecting…");
  const [tool, setTool] = useState<"pen" | "marker" | "eraser">("pen");
  const [color, setColor] = useState("#24203a");
  const [width, setWidth] = useState(4);
  const colors = [
    "#24203a",
    "#7357dd",
    "#ec5f75",
    "#f4a340",
    "#2eaa71",
    "#2586d9",
    "#ffffff",
  ];

  const undoLocalStroke = () => {
    const canvas = canvasRef.current;
    const previousImage = undoStack.current.pop();
    if (!canvas || !previousImage) return;
    canvas.getContext("2d")?.putImageData(previousImage, 0, 0);
  };

  useEffect(() => {
    if (!session) {
      const frame = requestAnimationFrame(() =>
        setStatus("Invalid connection link")
      );
      return () => cancelAnimationFrame(frame);
    }
    const connected = () => {
      setStatus("Connected to laptop");
      socket.emit("join-session", { session, role: "phone" });
    };
    const disconnected = () => setStatus("Reconnecting…");
    const clearAfterConversion = (payload?: { reason?: string }) => {
      const canvas = canvasRef.current;
      if (canvas)
        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      undoStack.current = [];
      if (payload?.reason === "converted" && mode === "notes")
        setStatus("Converted — ready for your next note");
    };
    const undoFromLaptop = () => undoLocalStroke();
    socket.on("connect", connected);
    socket.on("disconnect", disconnected);
    socket.on("clear", clearAfterConversion);
    socket.on("undo", undoFromLaptop);
    if (!socket.connected) socket.connect();
    else connected();
    return () => {
      socket.off("connect", connected);
      socket.off("disconnect", disconnected);
      socket.off("clear", clearAfterConversion);
      socket.off("undo", undoFromLaptop);
      socket.disconnect();
    };
  }, [mode, session]);

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
    const context = event.currentTarget.getContext("2d");
    if (context) {
      undoStack.current.push(
        context.getImageData(
          0,
          0,
          event.currentTarget.width,
          event.currentTarget.height
        )
      );
      if (undoStack.current.length > 20) undoStack.current.shift();
    }
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
    context.globalCompositeOperation =
      tool === "eraser" ? "destination-out" : "source-over";
    context.globalAlpha = tool === "marker" ? 0.35 : 1;
    context.strokeStyle = mode === "sketch" ? color : "#29243b";
    context.lineWidth =
      tool === "eraser"
        ? 24
        : mode === "sketch"
        ? tool === "marker"
          ? Math.max(width, 14)
          : width
        : 3;
    context.lineCap = "round";
    context.stroke();
    socket.emit("stroke", {
      from: {
        x: previous.current.x / rect.width,
        y: previous.current.y / rect.height,
      },
      to: { x: next.x / rect.width, y: next.y / rect.height },
      tool,
      color,
      width: tool === "marker" ? Math.max(width, 14) : width,
      opacity: tool === "marker" ? 0.35 : 1,
    });
    context.globalAlpha = 1;
    previous.current = next;
  };
  const command = (event: "undo" | "clear" | "enter") => socket.emit(event, {});

  return (
    <main className={`mobile-writer ${mode === "sketch" ? "mobile-sketch-studio" : "mobile-notes-writer"}`}>
      <header>
        <div>
          <i />
          <span>
            <b>
              {mode === "sketch" ? "Sketch Studio" : "InkFlow Notes"}
            </b>
            <small>{status}</small>
          </span>
          {mode === "sketch" && <em>LIVE ARTBOARD</em>}
        </div>
      </header>
      {mode === "sketch" && <div className="mobile-sketch-heading"><span>Draw on your phone</span><small>Your strokes appear instantly on the laptop canvas</small></div>}
      <div className="mobile-writer-tools">
        <button
          className={tool === "pen" ? "active" : ""}
          onClick={() => setTool("pen")}
        >
          ✎ Pen
        </button>
        {mode === "sketch" && (
          <button
            className={tool === "marker" ? "active" : ""}
            onClick={() => setTool("marker")}
          >
            ▰ Marker
          </button>
        )}
        <button
          className={tool === "eraser" ? "active" : ""}
          onClick={() => setTool("eraser")}
        >
          ⌫ Erase
        </button>
        {mode === "notes" && (
          <button onClick={() => command("enter")}>↵ Enter</button>
        )}
        <button
          onClick={() => {
            undoLocalStroke();
            command("undo");
          }}
        >
          ↶ Undo
        </button>
        <button
          onClick={() => {
            const canvas = canvasRef.current;
            if (canvas)
              canvas
                .getContext("2d")
                ?.clearRect(0, 0, canvas.width, canvas.height);
            undoStack.current = [];
            command("clear");
          }}
        >
          Clear
        </button>
      </div>
      {mode === "sketch" && (
        <div className="mobile-sketch-options">
          <div className="mobile-colors">
            {colors.map((item) => (
              <button
                key={item}
                className={color === item ? "active" : ""}
                style={{ background: item }}
                aria-label={`Use ${item}`}
                onClick={() => {
                  setColor(item);
                  if (tool === "eraser") setTool("pen");
                }}
              />
            ))}
          </div>
          <label>
            Size{" "}
            <input
              type="range"
              min="2"
              max="24"
              value={width}
              onChange={(event) => setWidth(Number(event.target.value))}
            />
          </label>
        </div>
      )}
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={() => (drawing.current = false)}
        onPointerCancel={() => (drawing.current = false)}
      />
      <p>
        {mode === "sketch"
          ? "Draw freely with your finger or stylus. AI will only run when you choose Elevate with AI on the laptop."
          : "Write with your finger or stylus. Your strokes appear live on the laptop."}
      </p>
    </main>
  );
}

export default function MobileWriterPage() {
  return (
    <Suspense
      fallback={
        <main className="mobile-writer">
          <p>Opening socket session…</p>
        </main>
      }
    >
      <MobileWriter />
    </Suspense>
  );
}
