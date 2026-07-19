"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { socket } from "../_lib/socket-client";

type Point = { x: number; y: number };

type MobileToolIconName =
  | "pen"
  | "marker"
  | "eraser"
  | "enter"
  | "undo"
  | "clear";

function MobileToolIcon({ name }: { name: MobileToolIconName }) {
  const paths: Record<MobileToolIconName, React.ReactNode> = {
    pen: <><path d="m4 20 4.2-1 10.5-10.5a2.1 2.1 0 0 0-3-3L5.2 16Z" /><path d="m14.5 6.5 3 3" /></>,
    marker: <><path d="m9 11 6 6" /><path d="m4 20 4.5-1.5L19 8a2.1 2.1 0 0 0-3-3L5.5 15.5Z" /><path d="M13 20h7" /></>,
    eraser: <><path d="m7 20-3-3a2 2 0 0 1 0-2.8L14.2 4a2 2 0 0 1 2.8 0l3 3a2 2 0 0 1 0 2.8L9.8 20Z" /><path d="m12 6 6 6" /><path d="M7 20h13" /></>,
    enter: <><path d="M20 5v6a3 3 0 0 1-3 3H5" /><path d="m9 10-4 4 4 4" /></>,
    undo: <><path d="m9 7-5 5 5 5" /><path d="M4 12h9a7 7 0 0 1 7 7" /></>,
    clear: <><path d="M5 5l14 14" /><path d="M19 5 5 19" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

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
  const [hasInk, setHasInk] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [enhancingSketch, setEnhancingSketch] = useState<"local" | "cloud" | null>(null);
  const colors = [
    "#24203a",
    "#7357dd",
    "#ec5f75",
    "#f4a340",
    "#2eaa71",
    "#2586d9",
    "#ffffff",
  ];

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.width;
    canvas.getContext("2d")?.scale(ratio, ratio);
  };

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
      clearCanvas();
      undoStack.current = [];
      setHasInk(false);
      setEnhancing(false);
      if (payload?.reason === "converted" && mode === "notes")
        setStatus("Converted — ready for your next note");
    };
    const undoFromLaptop = () => undoLocalStroke();
    const enhancementResult = (payload?: { converted?: boolean }) => {
      if (payload?.converted) return;
      setEnhancing(false);
      setStatus("Could not enhance — try again");
    };
    const sketchEnhancementResult = (payload?: {
      enhanced?: boolean;
      mode?: "local" | "cloud";
    }) => {
      setEnhancingSketch(null);
      setStatus(
        payload?.enhanced
          ? payload.mode === "local"
            ? "Polished locally on laptop"
            : "AI enhancement complete"
          : "Could not enhance — try again"
      );
    };
    socket.on("connect", connected);
    socket.on("disconnect", disconnected);
    socket.on("clear", clearAfterConversion);
    socket.on("undo", undoFromLaptop);
    socket.on("enhance-note-result", enhancementResult);
    socket.on("enhance-sketch-result", sketchEnhancementResult);
    if (!socket.connected) socket.connect();
    else connected();
    return () => {
      socket.off("connect", connected);
      socket.off("disconnect", disconnected);
      socket.off("clear", clearAfterConversion);
      socket.off("undo", undoFromLaptop);
      socket.off("enhance-note-result", enhancementResult);
      socket.off("enhance-sketch-result", sketchEnhancementResult);
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
    setHasInk(true);
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
  const enhanceNote = () => {
    if (!hasInk || enhancing) return;
    setEnhancing(true);
    setStatus("Enhancing on laptop…");
    socket.emit("enhance-note", {});
  };
  const enhanceSketch = (enhancementMode: "local" | "cloud") => {
    if (!hasInk || enhancingSketch) return;
    setEnhancingSketch(enhancementMode);
    setStatus(
      enhancementMode === "local"
        ? "Polishing locally on laptop…"
        : "Local cleanup → Pixazo image…"
    );
    socket.emit("enhance-sketch", { mode: enhancementMode });
  };

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
          {mode === "sketch" && (
            <div className="mobile-sketch-header-actions">
              <em>LIVE</em>
              <button
                className="mobile-header-local"
                onClick={() => enhanceSketch("local")}
                disabled={!hasInk || enhancingSketch !== null}
              >
                ✦ {enhancingSketch === "local" ? "Polishing…" : "Local"}
              </button>
              <button
                className="mobile-header-ai"
                onClick={() => enhanceSketch("cloud")}
                disabled={!hasInk || enhancingSketch !== null}
              >
                ✦ {enhancingSketch === "cloud" ? "Enhancing…" : "Enhance"}
              </button>
            </div>
          )}
          {mode === "notes" && (
            <button
              className="mobile-header-enhance"
              onClick={enhanceNote}
              disabled={!hasInk || enhancing}
            >
              ✦ {enhancing ? "Enhancing…" : "Enhance"}
            </button>
          )}
        </div>
      </header>
      <div className="mobile-writer-tools">
        <button
          className={tool === "pen" ? "active" : ""}
          onClick={() => setTool("pen")}
        >
          <MobileToolIcon name="pen" /><span>Pen</span>
        </button>
        {mode === "sketch" && (
          <button
            className={tool === "marker" ? "active" : ""}
            onClick={() => setTool("marker")}
          >
            <MobileToolIcon name="marker" /><span>Marker</span>
          </button>
        )}
        <button
          className={tool === "eraser" ? "active" : ""}
          onClick={() => setTool("eraser")}
        >
          <MobileToolIcon name="eraser" /><span>Erase</span>
        </button>
        {mode === "notes" && (
          <button onClick={() => command("enter")}>
            <MobileToolIcon name="enter" /><span>Enter</span>
          </button>
        )}
        <button
          onClick={() => {
            undoLocalStroke();
            command("undo");
          }}
        >
          <MobileToolIcon name="undo" /><span>Undo</span>
        </button>
        <button
          onClick={() => {
            clearCanvas();
            undoStack.current = [];
            setHasInk(false);
            command("clear");
          }}
        >
          <MobileToolIcon name="clear" /><span>Clear</span>
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
          ? "Draw freely, then polish locally or create a detailed image with Pixazo."
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
