"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { Icon } from "../inkflow-workspace";
import { prepareInkImage } from "../_lib/prepare-ink-image";

type BlankNoteSheetProps = {
  phoneConnected: boolean;
  onConnectPhone: () => void;
  remoteCanvasRef: RefObject<HTMLCanvasElement | null>;
  recognizedText: string;
  recognizing: boolean;
  onRecognize: (image: string) => Promise<boolean>;
  onTextChange: (text: string) => void;
  recognitionError: string;
  darkMode: boolean;
  onEnter: () => void;
};

export function BlankNoteSheet({ phoneConnected, onConnectPhone, remoteCanvasRef, recognizedText, recognizing, onRecognize, onTextChange, recognitionError, darkMode, onEnter }: BlankNoteSheetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const pauseTimer = useRef<number | null>(null);
  const [mode, setMode] = useState<"type" | "draw">("type");
  const [drawingTool, setDrawingTool] = useState<"pen" | "eraser">("pen");

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    if (canvas.width === rect.width * ratio && canvas.height === rect.height * ratio) return;

    const snapshot = document.createElement("canvas");
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    snapshot.getContext("2d")?.drawImage(canvas, 0, 0);
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const context = canvas.getContext("2d");
    context?.scale(ratio, ratio);
    if (snapshot.width && snapshot.height) context?.drawImage(snapshot, 0, 0, rect.width, rect.height);
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    drawing.current = true;
    lastPoint.current = getPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    const context = event.currentTarget.getContext("2d");
    if (context && drawingTool === "pen") {
      context.globalCompositeOperation = "source-over";
      context.fillStyle = darkMode ? "#f1edf7" : "#29243b";
      context.beginPath();
      context.arc(lastPoint.current.x, lastPoint.current.y, 1.5, 0, Math.PI * 2);
      context.fill();
    }
  };

  const scheduleRecognition = () => {
    if (pauseTimer.current) window.clearTimeout(pauseTimer.current);
    pauseTimer.current = window.setTimeout(async () => {
      if (drawingTool === "eraser") return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const image = prepareInkImage(canvas);
      if (!image) return;
      const converted = await onRecognize(image);
      if (converted) {
        clearDrawing();
        setMode("type");
      }
    }, 4000);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const nextPoint = getPoint(event);
    context.beginPath();
    context.moveTo(lastPoint.current.x, lastPoint.current.y);
    context.lineTo(nextPoint.x, nextPoint.y);
    context.strokeStyle = drawingTool === "eraser" ? "rgba(0,0,0,1)" : darkMode ? "#f1edf7" : "#29243b";
    context.globalCompositeOperation = drawingTool === "eraser" ? "destination-out" : "source-over";
    context.lineWidth = drawingTool === "eraser" ? 20 : Math.max(2, event.pressure * 4);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
    lastPoint.current = nextPoint;
    scheduleRecognition();
  };

  const finishDrawing = () => {
    drawing.current = false;
    scheduleRecognition();
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <article className="paper blank-note">
      <div className="paper-date">16 JULY 2026 <span>•</span> NEW NOTE</div>
      <input className="note-title-input" aria-label="Note title" placeholder="Untitled note" autoFocus />
      <div className={`mobile-tip ${phoneConnected ? "connected" : ""}`}>
        <span className="mobile-tip-icon"><Icon name={phoneConnected ? "wifi" : "scan"} size={19} /></span>
        <div>
          <b>{phoneConnected ? "Your phone is connected" : "Write more naturally from your phone"}</b>
          <p>{phoneConnected ? "Your handwriting will appear here as you write." : "Open InkFlow in your mobile browser—no app or installation needed."}</p>
        </div>
        {!phoneConnected && <button onClick={onConnectPhone}>Connect phone <Icon name="arrow" size={15} /></button>}
      </div>
      <div className="input-mode-bar" aria-label="Writing input mode">
        <div>
          <button className={mode === "type" ? "active" : ""} onClick={() => setMode("type")}><Icon name="text" size={17} /> Type</button>
          <button className={mode === "draw" && drawingTool === "pen" ? "active" : ""} onClick={() => { setMode("draw"); setDrawingTool("pen"); }}><Icon name="pen" size={17} /> Draw</button>
          <button className={mode === "draw" && drawingTool === "eraser" ? "active" : ""} onClick={() => { setMode("draw"); setDrawingTool("eraser"); }}><Icon name="eraser" size={17} /> Erase</button>
          <button onClick={onEnter}><span className="enter-symbol">↵</span> Enter</button>
        </div>
        <span>{recognizing ? "Reading handwriting…" : mode === "type" ? "Keyboard enabled" : "Pauses convert ink to text"}</span>
        <button className="clear-drawing" onClick={clearDrawing}>Clear ink</button>
      </div>
      {recognitionError && <div className="recognition-error" role="alert"><Icon name="sparkle" size={16} /><span><b>Handwriting could not be converted</b>{recognitionError}</span></div>}
      <div className={`note-input-surface ${mode === "draw" ? "drawing-active" : "typing-active"}`}>
        <textarea className="note-body-input" aria-label="Note body" placeholder="Type or draw—handwriting will become text…" value={recognizedText} onChange={(event) => onTextChange(event.target.value)} />
        <canvas ref={remoteCanvasRef} className="remote-ink-canvas" aria-label="Handwriting received from phone" />
        <canvas
          ref={canvasRef}
          className="local-drawing-canvas"
          aria-label="Drawing area"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={finishDrawing}
          onPointerCancel={finishDrawing}
        />
        {mode === "draw" && <div className="drawing-hint">Draw anywhere on the page</div>}
      </div>
      <div className="page-number">1</div>
    </article>
  );
}
