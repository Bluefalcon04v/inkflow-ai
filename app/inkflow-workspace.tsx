"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BlankNoteSheet } from "./_components/blank-note-sheet";
import { SketchStudio } from "./_components/sketch-studio";
import { WorkspaceSidebar } from "./_components/workspace-sidebar";
import { prepareInkImage } from "./_lib/prepare-ink-image";
import { socket } from "./_lib/socket-client";
import QRCodeGenerator from "qrcode";
import Image from "next/image";

type IconName =
  | "arrow"
  | "back"
  | "check"
  | "chevron"
  | "cloud"
  | "download"
  | "edit"
  | "eraser"
  | "image"
  | "math"
  | "menu"
  | "mic"
  | "more"
  | "pen"
  | "plus"
  | "redo"
  | "scan"
  | "shapes"
  | "sparkle"
  | "text"
  | "undo"
  | "upload"
  | "wifi"
  | "x";

const paths: Record<IconName, React.ReactNode> = {
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  back: (
    <>
      <path d="m15 18-6-6 6-6" />
    </>
  ),
  check: (
    <>
      <path d="m5 12 4 4L19 6" />
    </>
  ),
  chevron: (
    <>
      <path d="m9 18 6-6-6-6" />
    </>
  ),
  cloud: (
    <>
      <path d="M17.5 19H6a4 4 0 0 1-.7-7.94A7 7 0 0 1 18.7 9.2 5 5 0 0 1 17.5 19Z" />
      <path d="m9 13 3-3 3 3M12 10v6" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </>
  ),
  eraser: (
    <>
      <path d="m7 21-4-4L16 4a2 2 0 0 1 3 0l1 1a2 2 0 0 1 0 3L7 21Z" />
      <path d="m6 14 4 4M7 21h13" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="m21 15-5-5L5 20" />
    </>
  ),
  math: (
    <>
      <path d="M4 6h7M7.5 3v6M15 5l5 5m0-5-5 5M4 16h7M15 16h5M17.5 13.5v.01M17.5 18.5v.01" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  pen: (
    <>
      <path d="m14 4 6 6L8 22H2v-6Z" />
      <path d="m12 6 6 6M2 22l5-2-3-3Z" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  redo: (
    <>
      <path d="m15 7 4 4-4 4" />
      <path d="M19 11H9a5 5 0 0 0-5 5" />
    </>
  ),
  scan: (
    <>
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8" />
    </>
  ),
  shapes: (
    <>
      <circle cx="7" cy="7" r="4" />
      <rect x="12" y="12" width="8" height="8" rx="1" />
    </>
  ),
  sparkle: (
    <>
      <path d="m12 3 1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8ZM19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z" />
    </>
  ),
  text: (
    <>
      <path d="M5 5h14M12 5v14M8 19h8" />
    </>
  ),
  undo: (
    <>
      <path d="m9 7-4 4 4 4" />
      <path d="M5 11h10a5 5 0 0 1 5 5" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4m0 0L8 8m4-4 4 4M5 20h14" />
    </>
  ),
  wifi: (
    <>
      <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01" />
    </>
  ),
  x: (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const qr = [
  "111111101011101111111",
  "100000101010101000001",
  "101110101110101011101",
  "101110100101101011101",
  "101110101011101011101",
  "100000101110101000001",
  "111111101010101111111",
  "000000001101100000000",
  "101110111011101101011",
  "011001000111000110100",
  "110111111001111011101",
  "001001000110001001000",
  "111011101101111010111",
  "000000001011001010100",
  "111111101101111010101",
  "100000100110001110100",
  "101110101011111011111",
  "101110100110100010000",
  "101110101101111011101",
  "100000100010001010100",
  "111111101101111010111",
];

function QRCode() {
  return (
    <div className="qr" aria-label="Session QR preview">
      {qr.flatMap((row, y) =>
        [...row].map((cell, x) => (
          <i className={cell === "1" ? "filled" : ""} key={`${x}-${y}`} />
        ))
      )}
    </div>
  );
}

function createSessionId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replaceAll("-", "");
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("Copy is not supported by this browser");
}

function downloadFile(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
}

function fileSafeTitle(title: string, fallback: string) {
  return (
    title
      .trim()
      .replace(/[^a-z0-9-_ ]/gi, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) || fallback
  );
}

function currentNoteTimestamp() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export default function InkflowWorkspace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const laptopCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const strokes = useRef<
    Array<{ tool: "pen" | "eraser"; points: Array<{ x: number; y: number }> }>
  >([]);
  const activeStroke = useRef<{
    tool: "pen" | "eraser";
    points: Array<{ x: number; y: number }>;
  } | null>(null);
  const recognitionInFlight = useRef(false);
  const sketchSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoStack = useRef<
    Array<{ phone: ImageData; laptop: ImageData | null }>
  >([]);
  const remoteUndoStack = useRef<ImageData[]>([]);
  const remoteInkVersion = useRef(0);
  const [sidebar, setSidebar] = useState(true);
  const [pairing, setPairing] = useState(false);
  const [phone, setPhone] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [inked, setInked] = useState(false);
  const [refining, setRefining] = useState(false);
  const [refined, setRefined] = useState(false);
  const [toast, setToast] = useState("");
  const [isNewNote, setIsNewNote] = useState(true);
  const [noteTitle, setNoteTitle] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [recognitionError, setRecognitionError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [remotePhone, setRemotePhone] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [pairingUrl, setPairingUrl] = useState("");
  const [mode, setMode] = useState<"notes" | "sketch">("notes");
  const modeRef = useRef<"notes" | "sketch">("notes");
  const [enhancingSketchMode, setEnhancingSketchMode] = useState<
    "local" | "cloud" | null
  >(null);
  const [enhancedSketch, setEnhancedSketch] = useState("");
  const [enhancedSketchMode, setEnhancedSketchMode] = useState<
    "local" | "cloud"
  >("cloud");
  const [sketchAiModalOpen, setSketchAiModalOpen] = useState(false);
  const [sketchSourcePreview, setSketchSourcePreview] = useState("");
  const [sketchError, setSketchError] = useState("");
  const [sketchProgress, setSketchProgress] = useState("");
  const [sketchProgressStage, setSketchProgressStage] = useState<
    "local" | "pollinations" | "pixazo" | "complete" | ""
  >("");
  const [sketchColor, setSketchColor] = useState("#24203a");
  const [sketchUndoCount, setSketchUndoCount] = useState(0);
  const [persistenceReady, setPersistenceReady] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [noteTimestamp, setNoteTimestamp] = useState(currentNoteTimestamp);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const savedNote = JSON.parse(
          window.localStorage.getItem("inkflow-note") ?? "null"
        ) as { title?: string; text?: string; timestamp?: string } | null;
        if (savedNote) {
          setNoteTitle(savedNote.title ?? "");
          setRecognizedText(savedNote.text ?? "");
          if (savedNote.timestamp) setNoteTimestamp(savedNote.timestamp);
        }
        setEnhancedSketch(
          window.localStorage.getItem("inkflow-enhanced-sketch") ?? ""
        );
        if (window.localStorage.getItem("inkflow-enhanced-sketch-on-canvas") === "true")
          setEnhancedSketchMode("local");
      } catch {
        // Ignore malformed or unavailable browser storage and keep the live state.
      } finally {
        setPersistenceReady(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!persistenceReady) return;
    try {
      window.localStorage.setItem(
        "inkflow-note",
        JSON.stringify({
          title: noteTitle,
          text: recognizedText,
          timestamp: noteTimestamp,
        })
      );
    } catch {
      // The note remains editable if private browsing disables storage.
    }
  }, [noteTitle, noteTimestamp, persistenceReady, recognizedText]);

  useEffect(() => {
    if (!persistenceReady || mode !== "sketch") return;
    try {
      if (enhancedSketch)
        window.localStorage.setItem(
          "inkflow-enhanced-sketch",
          enhancedSketch
        );
      else window.localStorage.removeItem("inkflow-enhanced-sketch");
      window.localStorage.setItem(
        "inkflow-enhanced-sketch-on-canvas",
        String(Boolean(enhancedSketch) && enhancedSketchMode === "local")
      );
    } catch {
      // The original canvas remains usable if browser storage is full.
    }
  }, [enhancedSketch, enhancedSketchMode, mode, persistenceReady]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDarkMode(window.localStorage.getItem("inkflow-theme") === "dark");
      const requestedTab = new URL(window.location.href).searchParams.get(
        "tab"
      );
      const savedTab = window.localStorage.getItem("inkflow-workspace");
      if (
        requestedTab === "sketch" ||
        (requestedTab !== "notes" && savedTab === "sketch")
      ) {
        modeRef.current = "sketch";
        setMode("sketch");
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    setDarkMode((current) => {
      const next = !current;
      window.localStorage.setItem("inkflow-theme", next ? "dark" : "light");
      return next;
    });
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    ctx?.scale(ratio, ratio);
  }, []);

  const resizeLaptopCanvas = useCallback(() => {
    const canvas = laptopCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    if (
      canvas.width === rect.width * ratio &&
      canvas.height === rect.height * ratio
    )
      return;
    const snapshot = document.createElement("canvas");
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    snapshot.getContext("2d")?.drawImage(canvas, 0, 0);
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const context = canvas.getContext("2d");
    context?.scale(ratio, ratio);
    if (snapshot.width && snapshot.height)
      context?.drawImage(snapshot, 0, 0, rect.width, rect.height);
  }, []);

  const saveSketchCanvas = useCallback(() => {
    if (modeRef.current !== "sketch") return;
    const canvas = laptopCanvasRef.current;
    if (!canvas) return;
    try {
      window.localStorage.setItem(
        "inkflow-sketch-canvas",
        canvas.toDataURL("image/png")
      );
    } catch {
      // Keep drawing even if the browser's local storage quota is exhausted.
    }
  }, []);

  const scheduleSketchSave = useCallback(() => {
    if (modeRef.current !== "sketch") return;
    if (sketchSaveTimer.current) clearTimeout(sketchSaveTimer.current);
    sketchSaveTimer.current = setTimeout(saveSketchCanvas, 250);
  }, [saveSketchCanvas]);

  useEffect(() => {
    resizeLaptopCanvas();
    window.addEventListener("resize", resizeLaptopCanvas);
    return () => window.removeEventListener("resize", resizeLaptopCanvas);
  }, [isNewNote, mode, resizeLaptopCanvas]);

  useEffect(() => {
    if (!persistenceReady || mode !== "sketch") return;
    const saved = window.localStorage.getItem("inkflow-sketch-canvas");
    const canvas = laptopCanvasRef.current;
    if (!saved || !canvas) return;
    const frame = requestAnimationFrame(() => {
      const image = new window.Image();
      image.onload = () => {
        const context = canvas.getContext("2d");
        if (!context) return;
        remoteUndoStack.current = [
          context.createImageData(canvas.width, canvas.height),
        ];
        const rect = canvas.getBoundingClientRect();
        context.drawImage(image, 0, 0, rect.width, rect.height);
        setSketchUndoCount(1);
      };
      image.src = saved;
    });
    return () => cancelAnimationFrame(frame);
  }, [mode, persistenceReady]);

  useEffect(
    () => () => {
      if (sketchSaveTimer.current) clearTimeout(sketchSaveTimer.current);
    },
    []
  );

  useEffect(() => {
    if (!phone) return;
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [phone, resizeCanvas]);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const startInk = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    lastPoint.current = point(event);
    activeStroke.current = { tool, points: [lastPoint.current] };
    strokes.current.push(activeStroke.current);
    const phoneContext = event.currentTarget.getContext("2d");
    const laptopCanvas = laptopCanvasRef.current;
    const laptopContext = laptopCanvas?.getContext("2d");
    if (phoneContext) {
      undoStack.current.push({
        phone: phoneContext.getImageData(
          0,
          0,
          event.currentTarget.width,
          event.currentTarget.height
        ),
        laptop:
          laptopCanvas && laptopContext
            ? laptopContext.getImageData(
                0,
                0,
                laptopCanvas.width,
                laptopCanvas.height
              )
            : null,
      });
      if (undoStack.current.length > 20) undoStack.current.shift();
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const mapToLaptop = (
    sourceCanvas: HTMLCanvasElement,
    targetCanvas: HTMLCanvasElement,
    sourcePoint: { x: number; y: number }
  ) => {
    const sourceRect = sourceCanvas.getBoundingClientRect();
    const targetRect = targetCanvas.getBoundingClientRect();
    const scale = Math.min(
      targetRect.width / sourceRect.width,
      targetRect.height / sourceRect.height
    );
    const offsetX = (targetRect.width - sourceRect.width * scale) / 2;
    const offsetY = (targetRect.height - sourceRect.height * scale) / 2;
    return {
      x: offsetX + sourcePoint.x * scale,
      y: offsetY + sourcePoint.y * scale,
      scale,
    };
  };

  const moveInk = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = event.currentTarget.getContext("2d");
    if (!ctx) return;
    const next = point(event);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(next.x, next.y);
    ctx.strokeStyle = tool === "eraser" ? "#fffdf8" : "#24203a";
    ctx.lineWidth = tool === "eraser" ? 18 : 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    const laptopCanvas = laptopCanvasRef.current;
    const laptopContext = laptopCanvas?.getContext("2d");
    if (laptopCanvas && laptopContext) {
      const from = mapToLaptop(
        event.currentTarget,
        laptopCanvas,
        lastPoint.current
      );
      const to = mapToLaptop(event.currentTarget, laptopCanvas, next);
      laptopContext.beginPath();
      laptopContext.moveTo(from.x, from.y);
      laptopContext.lineTo(to.x, to.y);
      laptopContext.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
      laptopContext.strokeStyle = darkMode ? "#f1edf7" : "#29243b";
      laptopContext.lineWidth = (tool === "eraser" ? 18 : 3) * from.scale;
      laptopContext.lineCap = "round";
      laptopContext.lineJoin = "round";
      laptopContext.stroke();
    }
    activeStroke.current?.points.push(next);
    lastPoint.current = next;
    setInked(true);
    setRefined(false);
    scheduleSketchSave();
  };

  const clearInk = () => {
    remoteInkVersion.current += 1;
    const canvas = canvasRef.current;
    if (canvas) {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.width;
      canvas.getContext("2d")?.scale(ratio, ratio);
    }
    const laptopCanvas = laptopCanvasRef.current;
    if (laptopCanvas) {
      const ratio = window.devicePixelRatio || 1;
      laptopCanvas.width = laptopCanvas.width;
      laptopCanvas.getContext("2d")?.scale(ratio, ratio);
    }
    strokes.current = [];
    undoStack.current = [];
    remoteUndoStack.current = [];
    setInked(false);
    setRefined(false);
    setEnhancedSketch("");
    setSketchError("");
    setSketchProgress("");
    setSketchProgressStage("");
    setSketchAiModalOpen(false);
    setSketchSourcePreview("");
    setSketchUndoCount(0);
  };

  const changeMode = (nextMode: "notes" | "sketch") => {
    if (modeRef.current === nextMode) return;
    if (modeRef.current === "sketch") saveSketchCanvas();
    const retainedEnhancedSketch =
      enhancedSketch ||
      window.localStorage.getItem("inkflow-enhanced-sketch") ||
      "";
    modeRef.current = nextMode;
    setMode(nextMode);
    window.localStorage.setItem("inkflow-workspace", nextMode);
    const url = new URL(window.location.href);
    if (nextMode === "sketch") url.searchParams.set("tab", "sketch");
    else url.searchParams.delete("tab");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`
    );
    setPairing(false);
    setRemotePhone(false);
    clearInk();
    setEnhancedSketch(retainedEnhancedSketch);
  };

  const clearSketch = () => {
    if (sketchSaveTimer.current) {
      clearTimeout(sketchSaveTimer.current);
      sketchSaveTimer.current = null;
    }
    clearInk();
    window.localStorage.removeItem("inkflow-sketch-canvas");
    window.localStorage.removeItem("inkflow-enhanced-sketch");
    window.localStorage.removeItem("inkflow-enhanced-sketch-on-canvas");
    socket.emit("clear", {});
    notify("Canvas cleared");
  };

  const startLaptopSketch = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    if (modeRef.current !== "sketch") return;
    const canvas = event.currentTarget;
    const context = canvas.getContext("2d");
    if (!context) return;
    remoteUndoStack.current.push(
      context.getImageData(0, 0, canvas.width, canvas.height)
    );
    if (remoteUndoStack.current.length > 20)
      remoteUndoStack.current.shift();
    setSketchUndoCount(remoteUndoStack.current.length);
    setEnhancedSketch("");
    setSketchError("");
    setSketchProgress("");
    setSketchProgressStage("");
    drawing.current = true;
    lastPoint.current = point(event);
    canvas.setPointerCapture(event.pointerId);
    socket.emit("stroke:start", {});
  };

  const moveLaptopSketch = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    if (!drawing.current || modeRef.current !== "sketch") return;
    const canvas = event.currentTarget;
    const context = canvas.getContext("2d");
    if (!context) return;
    const next = point(event);
    context.beginPath();
    context.moveTo(lastPoint.current.x, lastPoint.current.y);
    context.lineTo(next.x, next.y);
    context.globalCompositeOperation = "source-over";
    context.strokeStyle = sketchColor;
    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
    const rect = canvas.getBoundingClientRect();
    socket.emit("stroke", {
      from: {
        x: lastPoint.current.x / rect.width,
        y: lastPoint.current.y / rect.height,
      },
      to: { x: next.x / rect.width, y: next.y / rect.height },
      tool: "pen",
      color: sketchColor,
      width: 3,
      opacity: 1,
    });
    lastPoint.current = next;
    remoteInkVersion.current += 1;
    scheduleSketchSave();
  };

  const stopLaptopSketch = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    drawing.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    scheduleSketchSave();
  };

  const undoRemoteSketch = (sendToPhone: boolean) => {
    const canvas = laptopCanvasRef.current;
    const previous = remoteUndoStack.current.pop();
    if (!canvas || !previous) return;
    canvas.getContext("2d")?.putImageData(previous, 0, 0);
    setSketchUndoCount(remoteUndoStack.current.length);
    setEnhancedSketch("");
    setSketchError("");
    setSketchProgress("");
    setSketchProgressStage("");
    remoteInkVersion.current += 1;
    saveSketchCanvas();
    if (sendToPhone) socket.emit("undo", {});
    notify("Last stroke undone");
  };

  const undoInk = () => {
    const previous = undoStack.current.pop();
    const phoneCanvas = canvasRef.current;
    const laptopCanvas = laptopCanvasRef.current;
    if (!previous || !phoneCanvas) return;
    phoneCanvas.getContext("2d")?.putImageData(previous.phone, 0, 0);
    if (previous.laptop && laptopCanvas)
      laptopCanvas.getContext("2d")?.putImageData(previous.laptop, 0, 0);
    strokes.current.pop();
    setInked(undoStack.current.length > 0);
    notify("Last stroke undone");
  };

  const insertLineBreak = () => {
    setRecognizedText((current) => current.replace(/[ \t]+$/, "") + "\n");
    notify("New line added");
  };

  const downloadNote = () => {
    const title = noteTitle.trim() || "Untitled note";
    const contents = `${title}\n${noteTimestamp}\n\n${recognizedText}`;
    const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
    downloadFile(
      URL.createObjectURL(blob),
      `${fileSafeTitle(title, "inkflow-note")}.txt`
    );
    notify("Note downloaded");
  };

  const appendUploadedText = (text: string) => {
    const cleaned = text.trim();
    if (!cleaned) throw new Error("No readable text was found in this file.");
    setRecognizedText((current) =>
      current.trim() ? `${current.trimEnd()}\n\n${cleaned}` : cleaned
    );
  };

  const uploadNoteFile = async (file: File) => {
    if (uploading) return;
    setUploading(true);
    setUploadError("");
    try {
      if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
        setUploadStatus("Reading text file…");
        appendUploadedText(await file.text());
      } else if (file.type.startsWith("image/")) {
        setUploadStatus("Reading image locally with Tesseract…");
        const image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("The image could not be read."));
          reader.readAsDataURL(file);
        });
        const Tesseract = await import("tesseract.js");
        const worker = await Tesseract.createWorker("eng");
        let localText = "";
        try {
          const localResult = await worker.recognize(image);
          localText = localResult.data.text.trim();
        } catch {
          // OCR.space can still recover text if local recognition fails.
        } finally {
          await worker.terminate();
        }

        setUploadStatus("Checking OCR.space for a refined result…");
        let finalText = localText;
        try {
          const response = await fetch("/api/recognize-handwriting", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image }),
          });
          const result = (await response.json()) as { text?: string };
          if (response.ok && result.text?.trim()) finalText = result.text.trim();
        } catch {
          // Tesseract remains the offline fallback when OCR.space is unavailable.
        }
        appendUploadedText(finalText);
      } else {
        throw new Error("Choose a TXT file or an image file.");
      }
      setUploadOpen(false);
      setUploadStatus("");
      notify("Uploaded text added to the note");
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "The file could not be imported."
      );
      setUploadStatus("");
    } finally {
      setUploading(false);
    }
  };

  const downloadSketch = () => {
    if (enhancedSketch) {
      downloadFile(
        enhancedSketch,
        enhancedSketch.startsWith("data:image/jpeg")
          ? "inkflow-enhanced-sketch.jpg"
          : "inkflow-enhanced-sketch.png"
      );
      notify("Enhanced sketch downloaded");
      return;
    }
    const canvas = laptopCanvasRef.current;
    if (!canvas) return;
    const flattened = document.createElement("canvas");
    flattened.width = canvas.width;
    flattened.height = canvas.height;
    const context = flattened.getContext("2d");
    if (!context) return;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, flattened.width, flattened.height);
    context.drawImage(canvas, 0, 0);
    downloadFile(flattened.toDataURL("image/png"), "inkflow-sketch.png");
    notify("Sketch downloaded");
  };

  const recognizeRemoteInk = async () => {
    const canvas = laptopCanvasRef.current;
    if (!canvas) return false;
    const image = prepareInkImage(canvas);
    if (!image) return false;
    const versionBeingRead = remoteInkVersion.current;
    const converted = await recognizeHandwriting(image);

    // Do not erase strokes that arrived while the previous image was being read.
    if (converted && versionBeingRead === remoteInkVersion.current) {
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      remoteUndoStack.current = [];
      setSketchUndoCount(0);
      socket.emit("clear", { reason: "converted" });
      return true;
    }

    // Recognition can be busy with another request. Retry the latest ink after it settles.
    if (
      versionBeingRead !== remoteInkVersion.current ||
      recognitionInFlight.current
    ) {
      // New strokes remain on the canvas until the user explicitly enhances them.
    }
    return false;
  };

  const startSocketPairing = async () => {
    const session = createSessionId();
    const url = `${window.location.origin}/write?session=${session}&mode=${mode}`;
    setPairing(true);
    setRemotePhone(false);
    setPairingUrl(url);
    setQrImage(await QRCodeGenerator.toDataURL(url, { width: 292, margin: 1 }));
    socket.off("phone:connected");
    socket.off("phone:disconnected");
    socket.off("phone:status");
    socket.off("stroke:start");
    socket.off("stroke");
    socket.off("undo");
    socket.off("clear");
    socket.off("enter");
    socket.off("enhance-note");
    socket.off("enhance-sketch");
    socket.on("phone:status", (payload?: { connected?: boolean }) => {
      const connected = payload?.connected === true;
      setRemotePhone(connected);
      if (connected) {
        setPairing(false);
        notify("Phone connected through socket");
      }
    });
    socket.on("stroke:start", () => {
      const canvas = laptopCanvasRef.current;
      const context = canvas?.getContext("2d");
      if (canvas && context) {
        remoteUndoStack.current.push(
          context.getImageData(0, 0, canvas.width, canvas.height)
        );
        if (remoteUndoStack.current.length > 20)
          remoteUndoStack.current.shift();
        setSketchUndoCount(remoteUndoStack.current.length);
      }
    });
    socket.on(
      "stroke",
      (payload: {
        from: { x: number; y: number };
        to: { x: number; y: number };
        tool?: string;
        color?: string;
        width?: number;
        opacity?: number;
      }) => {
        const canvas = laptopCanvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;
        const rect = canvas.getBoundingClientRect();
        context.beginPath();
        context.moveTo(
          payload.from.x * rect.width,
          payload.from.y * rect.height
        );
        context.lineTo(payload.to.x * rect.width, payload.to.y * rect.height);
        context.globalCompositeOperation =
          payload.tool === "eraser" ? "destination-out" : "source-over";
        context.globalAlpha =
          modeRef.current === "sketch" ? payload.opacity ?? 1 : 1;
        context.strokeStyle =
          modeRef.current === "sketch"
            ? payload.color ?? "#24203a"
            : darkMode
            ? "#f1edf7"
            : "#29243b";
        context.lineWidth =
          payload.tool === "eraser"
            ? 24
            : modeRef.current === "sketch"
            ? Math.min(Math.max(payload.width ?? 4, 1), 32)
            : 3;
        context.lineCap = "round";
        context.stroke();
        context.globalAlpha = 1;
        remoteInkVersion.current += 1;
        scheduleSketchSave();
      }
    );
    socket.on("undo", () => {
      undoRemoteSketch(false);
    });
    socket.on("clear", (payload?: { reason?: string }) => {
      clearInk();
      if (modeRef.current === "sketch" && payload?.reason !== "converted") {
        window.localStorage.removeItem("inkflow-sketch-canvas");
        window.localStorage.removeItem("inkflow-enhanced-sketch");
      }
    });
    socket.on("enter", insertLineBreak);
    socket.on("enhance-note", async () => {
      if (modeRef.current !== "notes") return;
      const converted = await recognizeRemoteInk();
      socket.emit("enhance-note-result", { converted });
    });
    socket.on(
      "enhance-sketch",
      async (payload?: { mode?: "local" | "cloud" }) => {
        if (modeRef.current !== "sketch") return;
        const enhancementMode = payload?.mode === "local" ? "local" : "cloud";
        const enhanced = await enhanceSketch(enhancementMode);
        socket.emit("enhance-sketch-result", {
          enhanced,
          mode: enhancementMode,
        });
      }
    );
    const join = () => socket.emit("join-session", { session, role: "laptop" });
    socket.off("connect");
    socket.on("connect", join);
    if (!socket.connected) socket.connect();
    else join();
  };

  const copyPairingLink = async () => {
    if (!pairingUrl) return;
    try {
      await copyText(pairingUrl);
      notify("Pairing link copied");
    } catch {
      notify(
        "Could not copy automatically. Select and copy the link manually."
      );
    }
  };

  const openSketchAiModal = () => {
    const canvas = laptopCanvasRef.current;
    if (!canvas || !remoteUndoStack.current.length) {
      setSketchError("Draw something before creating an AI image.");
      return;
    }
    const preview = document.createElement("canvas");
    preview.width = canvas.width;
    preview.height = canvas.height;
    const context = preview.getContext("2d");
    if (!context) return;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, preview.width, preview.height);
    context.drawImage(canvas, 0, 0);
    setEnhancedSketchMode("cloud");
    setSketchSourcePreview(preview.toDataURL("image/png"));
    setSketchProgress("");
    setSketchProgressStage("");
    setSketchError("");
    setSketchAiModalOpen(true);
  };

  const closeSketchAiModal = () => {
    if (
      enhancedSketch &&
      enhancedSketchMode === "cloud" &&
      sketchProgressStage === "complete"
    ) {
      setEnhancedSketchMode("local");
      notify("Generated image placed on the canvas");
    }
    setSketchAiModalOpen(false);
  };

  const enhanceSketch = async (
    enhancementMode: "local" | "cloud",
    description = ""
  ) => {
    const canvas = laptopCanvasRef.current;
    if (!canvas || !remoteUndoStack.current.length) {
      setSketchError(
        "Draw something on your phone before using AI enhancement."
      );
      return false;
    }
    setEnhancingSketchMode(enhancementMode);
    setSketchError("");
    setSketchProgressStage("local");
    setSketchProgress("Preparing and cleaning your sketch locally");
    try {
      const flattened = document.createElement("canvas");
      flattened.width = canvas.width;
      flattened.height = canvas.height;
      const context = flattened.getContext("2d");
      if (!context) throw new Error("The sketch canvas is unavailable.");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, flattened.width, flattened.height);
      context.filter =
        enhancementMode === "local"
          ? "contrast(1.16) saturate(1.18)"
          : "contrast(1.08) saturate(1.06)";
      context.drawImage(canvas, 0, 0);
      context.filter = "none";
      if (enhancementMode === "local") {
        setEnhancedSketchMode("local");
        setEnhancedSketch(flattened.toDataURL("image/png"));
        setSketchProgressStage("complete");
        setSketchProgress("Local polish complete");
        notify("Sketch polished locally — nothing was uploaded");
        return true;
      }
      setEnhancedSketchMode("cloud");
      setSketchSourcePreview(flattened.toDataURL("image/png"));
      setSketchAiModalOpen(true);
      const mask = document.createElement("canvas");
      mask.width = flattened.width;
      mask.height = flattened.height;
      const maskContext = mask.getContext("2d");
      if (!maskContext) throw new Error("The generation mask is unavailable.");
      maskContext.fillStyle = "#fff";
      maskContext.fillRect(0, 0, mask.width, mask.height);
      const response = await fetch("/api/enhance-sketch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: flattened.toDataURL("image/png"),
          mask: mask.toDataURL("image/png"),
          description,
        }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? "The sketch could not be enhanced.");
      }
      if (!response.body) throw new Error("The enhancement stream was unavailable.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffered = "";
      let completed = false;
      while (true) {
        const { done, value } = await reader.read();
        buffered += decoder.decode(value, { stream: !done });
        const lines = buffered.split("\n");
        buffered = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as {
            type: "progress" | "result" | "error";
            stage?: "local" | "pollinations" | "pixazo" | "complete";
            message: string;
            image?: string;
            provider?: "pollinations" | "pixazo";
            warning?: string;
          };
          if (event.stage) setSketchProgressStage(event.stage);
          setSketchProgress(event.message);
          if (event.type === "error") throw new Error(event.message);
          if (event.type === "result" && event.image) {
            setEnhancedSketch(event.image);
            completed = true;
            if (event.warning) setSketchError(event.warning);
            notify(
              event.provider === "pixazo"
                ? "Final Pixazo image is ready"
                : "Intermediate Pollinations image is ready"
            );
          }
        }
        if (done) break;
      }
      if (!completed) throw new Error("The AI pipeline returned no image.");
      return true;
    } catch (error) {
      setSketchError(
        error instanceof Error
          ? error.message
          : "The sketch could not be enhanced."
      );
      return false;
    } finally {
      setEnhancingSketchMode(null);
    }
  };

  const recognizeHandwriting = async (image: string) => {
    if (recognitionInFlight.current) return false;
    recognitionInFlight.current = true;
    setRefining(true);
    setRecognitionError("");
    try {
      const response = await fetch("/api/recognize-handwriting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const result = await response.json();
      let text = result.text as string | undefined;
      let hints = (result.hints ?? []) as Array<{
        line: number;
        characters: string;
        guidance: string;
      }>;
      let unclear = (result.unclear ?? []) as Array<{
        line: number;
        characters: string;
        guidance: string;
      }>;
      let usedLocalOcr = false;

      if (!response.ok) {
        const Tesseract = await import("tesseract.js");
        const worker = await Tesseract.createWorker("eng");
        await worker.setParameters({
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
          preserve_interword_spaces: "1",
        });
        const localResult = await worker.recognize(image);
        await worker.terminate();
        text = localResult.data.text.replace(/\s+/g, " ").trim();
        const recognizedLines = (localResult.data.blocks ?? [])
          .flatMap((block) => block.paragraphs)
          .flatMap((paragraph) => paragraph.lines);
        hints = recognizedLines.flatMap((line, lineIndex) =>
          line.words
            .filter((word) => word.confidence < 60 && word.text.trim())
            .map((word) => ({
              line: lineIndex + 1,
              characters: word.text.trim(),
              guidance:
                "This is the closest match; check it against what you intended.",
            }))
        );
        if (localResult.data.confidence < 35 && text) {
          text = `[unclear: ${text}]`;
          if (!unclear.length)
            unclear = [
              {
                line: 1,
                characters: text,
                guidance:
                  "Rewrite this section larger with clearly separated letters.",
              },
            ];
          hints = [];
        }
        usedLocalOcr = true;
      }

      if (!text)
        throw new Error(
          "No readable characters were found. Rewrite the first word larger, keep letters separate, and pause after completing it."
        );
      const formattedText = text.charAt(0).toUpperCase() + text.slice(1);
      setRecognizedText((current) => {
        const unclearSection = /\[unclear:[^\]]+\]/i;
        if (unclearSection.test(current))
          return current.replace(unclearSection, formattedText);
        if (!current) return formattedText;
        if (current.endsWith("\n") || current.endsWith(" "))
          return current + formattedText;
        return `${current} ${formattedText}`;
      });
      if (unclear.length) {
        const details = unclear
          .slice(0, 4)
          .map(
            (issue) =>
              `Line ${issue.line}, “${issue.characters}”: ${issue.guidance}`
          )
          .join(" • ");
        setRecognitionError(
          `Readable text was converted. Please rewrite ${
            unclear.length === 1 ? "this part" : "these parts"
          }: ${details}${
            unclear.length > 4
              ? ` • Plus ${
                  unclear.length - 4
                } more marked [unclear] in the note.`
              : ""
          }`
        );
      } else if (hints.length) {
        const details = hints
          .slice(0, 3)
          .map(
            (hint) =>
              `Line ${hint.line}: guessed “${hint.characters}” — ${hint.guidance}`
          )
          .join(" • ");
        setRecognitionError(
          `The sentence was completed using context. ${details}${
            hints.length > 3
              ? ` • Plus ${hints.length - 3} more best guesses.`
              : ""
          }`
        );
      }
      notify(
        usedLocalOcr
          ? "Handwriting converted locally — no credits used"
          : "Handwriting converted to text"
      );
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Recognition failed";
      setRecognitionError(
        message === "Handwriting recognition is not configured."
          ? "Add OCR_SPACE_API_KEY to .env.local, then restart the development server."
          : message
      );
      notify(message);
      return false;
    } finally {
      recognitionInFlight.current = false;
      setRefining(false);
    }
  };

  const refine = () => {
    const sourceCanvas = canvasRef.current;
    if (!sourceCanvas) return;
    const image = prepareInkImage(sourceCanvas);
    if (!image) return;
    void recognizeHandwriting(image).then((converted) => {
      if (!converted) return;
      clearInk();
      setRefined(true);
    });
  };

  const createNewItem = () => {
    if (sketchSaveTimer.current) {
      clearTimeout(sketchSaveTimer.current);
      sketchSaveTimer.current = null;
    }
    setPairing(false);
    setRecognitionError("");
    setSketchError("");
    clearInk();
    if (modeRef.current === "notes") {
      setIsNewNote(true);
      setNoteTitle("");
      setRecognizedText("");
      setNoteTimestamp(currentNoteTimestamp());
      window.localStorage.removeItem("inkflow-note");
      notify("New blank note created");
    } else {
      window.localStorage.removeItem("inkflow-sketch-canvas");
      window.localStorage.removeItem("inkflow-enhanced-sketch");
      socket.emit("clear", {});
      notify("New blank sketch created");
    }
  };

  return (
    <main className={`app-shell ${darkMode ? "dark-theme" : ""}`}>
      <div className="main-grid">
        <WorkspaceSidebar
          open={sidebar}
          isNewNote={isNewNote}
          mode={mode}
          onNewNote={createNewItem}
          onModeChange={changeMode}
          onCloudClick={() => notify("Cloud saving is planned for V2")}
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
          phoneConnected={phone || remotePhone}
          onConnectPhone={() => void startSocketPairing()}
        />

        <section className="workspace">
          <button
            className="workspace-menu-button"
            onClick={() => setSidebar(!sidebar)}
            aria-label="Toggle sidebar"
          >
            <Icon name="menu" size={19} />
          </button>
          {mode === "notes" && !isNewNote && (
            <div className={`workspace-sync-badge ${phone || remotePhone ? "live" : ""}`}>
              <span />
              {phone || remotePhone ? "Live sync" : "Saved locally"}
            </div>
          )}
          {mode === "notes" && isNewNote && (
            <div className="note-screen-bar">
              <div className="note-screen-meta">
                <input
                  aria-label="Note title"
                  placeholder="Untitled note"
                  value={noteTitle}
                  onChange={(event) => setNoteTitle(event.target.value)}
                />
                <time suppressHydrationWarning>{noteTimestamp}</time>
              </div>
              <div className="note-screen-actions">
                <div
                  className={`note-live-status ${
                    phone || remotePhone ? "connected" : ""
                  }`}
                >
                  <span className={refining ? "status-pulse" : ""} />
                  {refining
                    ? "Reading handwriting…"
                    : phone || remotePhone
                      ? sketchUndoCount > 0
                        ? "Ink ready"
                        : "Phone connected · Ready to write"
                      : "Phone not connected"}
                </div>
                {phone || remotePhone ? (
                  <button
                    className="screen-enhance-button"
                    onClick={() => void recognizeRemoteInk()}
                    disabled={sketchUndoCount === 0 || refining}
                  >
                    <Icon name="sparkle" size={14} />
                    {refining ? "Enhancing…" : "Enhance"}
                  </button>
                ) : (
                  <button
                    className="screen-connect-button"
                    onClick={() => void startSocketPairing()}
                  >
                    <Icon name="scan" size={15} /> Connect phone
                  </button>
                )}
                <button
                  className="screen-upload-button"
                  onClick={() => {
                    setUploadError("");
                    setUploadStatus("");
                    setUploadOpen(true);
                  }}
                >
                  <Icon name="upload" size={14} /> <span>Upload</span>
                </button>
                <button
                  className="screen-download-button"
                  onClick={downloadNote}
                  disabled={!noteTitle.trim() && !recognizedText.trim()}
                >
                  <Icon name="download" size={14} /> <span>Download</span>
                </button>
                <div className={`workspace-sync-badge inline ${phone || remotePhone ? "live" : ""}`}>
                  <span />
                  {phone || remotePhone ? "Live sync" : "Saved locally"}
                </div>
              </div>
            </div>
          )}

          <div
            className={`paper-wrap ${
              mode === "sketch"
                ? "sketch-wrap"
                : isNewNote
                  ? "new-note-wrap"
                  : ""
            }`}
          >
            {mode === "sketch" ? (
              <SketchStudio
                canvasRef={laptopCanvasRef}
                phoneConnected={phone || remotePhone}
                onConnectPhone={() => void startSocketPairing()}
                onEnhance={(enhancementMode) =>
                  void enhanceSketch(enhancementMode)
                }
                onOpenAiModal={openSketchAiModal}
                onGenerateAi={(description) =>
                  void enhanceSketch("cloud", description)
                }
                onClear={clearSketch}
                onUndo={() => undoRemoteSketch(true)}
                onDownload={downloadSketch}
                onPointerDown={startLaptopSketch}
                onPointerMove={moveLaptopSketch}
                onPointerUp={stopLaptopSketch}
                canUndo={sketchUndoCount > 0}
                enhancingMode={enhancingSketchMode}
                enhancedImage={enhancedSketch}
                enhancedImageMode={enhancedSketchMode}
                error={sketchError}
                progress={sketchProgress}
                progressStage={sketchProgressStage}
                aiModalOpen={sketchAiModalOpen}
                sourcePreview={sketchSourcePreview}
                onCloseAiModal={closeSketchAiModal}
                selectedColor={sketchColor}
                onColorChange={setSketchColor}
              />
            ) : isNewNote ? (
              <BlankNoteSheet
                phoneConnected={phone || remotePhone}
                remoteCanvasRef={laptopCanvasRef}
                recognizedText={recognizedText}
                onTextChange={setRecognizedText}
                recognitionError={recognitionError}
              />
            ) : (
              <article className="paper">
                <canvas
                  ref={laptopCanvasRef}
                  className="remote-ink-canvas full-page-ink"
                  aria-label="Handwriting received from phone"
                />
                <div className="paper-date">
                  16 JULY 2026 <span>•</span> PHYSICS
                </div>
                <h2>Wave Motion</h2>
                <p className="lead">
                  A wave is a disturbance that transfers <mark>energy</mark>{" "}
                  from one place to another without transferring matter.
                </p>
                <div className="note-callout">
                  <Icon name="sparkle" size={15} />
                  <span>AI organized your writing into a definition</span>
                </div>
                <h3>Key terms</h3>
                <div className="terms">
                  <div>
                    <span className="term-no">01</span>
                    <p>
                      <b>Amplitude (A)</b>
                      <small>
                        Maximum displacement from the equilibrium position.
                      </small>
                    </p>
                  </div>
                  <div>
                    <span className="term-no">02</span>
                    <p>
                      <b>Frequency (f)</b>
                      <small>Number of complete oscillations per second.</small>
                    </p>
                  </div>
                  <div>
                    <span className="term-no">03</span>
                    <p>
                      <b>Wavelength (λ)</b>
                      <small>
                        Distance between two consecutive points in phase.
                      </small>
                    </p>
                  </div>
                </div>
                <div className="content-row">
                  <div className="equation-block">
                    <div className="block-tag">
                      <Icon name="math" size={14} /> Equation recognized
                    </div>
                    <p>v = f λ</p>
                    <small>wave speed = frequency × wavelength</small>
                  </div>
                  <div className="wave-card">
                    <svg viewBox="0 0 280 100" preserveAspectRatio="none">
                      <path d="M5 52 C35 5, 55 5, 82 52 S130 99, 158 52 S205 5, 233 52 S260 98, 278 53" />
                      <path className="axis" d="M2 52H278" />
                    </svg>
                    <span className="amp">A</span>
                    <span className="lambda">← &nbsp; λ &nbsp; →</span>
                    <div className="block-tag">
                      <Icon name="shapes" size={14} /> Diagram cleaned
                    </div>
                  </div>
                </div>
                {refined && (
                  <div className="fresh-note">
                    <span>
                      <Icon name="sparkle" size={16} />
                    </span>
                    <div>
                      <b>AI refinement complete</b>
                      <p>
                        Spacing corrected · equation detected · diagram aligned
                      </p>
                    </div>
                    <button onClick={() => setRefined(false)}>
                      <Icon name="x" size={16} />
                    </button>
                  </div>
                )}
                <div className="page-number">1</div>
              </article>
            )}
          </div>
        </section>
      </div>

      {uploadOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={() => !uploading && setUploadOpen(false)}
        >
          <section
            className="upload-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setUploadOpen(false)}
              disabled={uploading}
              aria-label="Close upload"
            >
              <Icon name="x" />
            </button>
            <div className="pair-icon">
              <Icon name="upload" size={23} />
            </div>
            <h2>Import into this note</h2>
            <p>
              TXT files are inserted directly. Images are read locally with
              Tesseract first, with OCR.space used only when available.
            </p>
            <label className={`upload-dropzone ${uploading ? "busy" : ""}`}>
              {uploading ? <span className="spinner" /> : <Icon name="image" size={25} />}
              <b>{uploading ? uploadStatus || "Reading file…" : "Choose an image or TXT file"}</b>
              <small>PNG, JPG, WEBP, GIF, BMP, or TXT</small>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,text/plain,.txt"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadNoteFile(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            {uploadError && (
              <div className="upload-error" role="alert">
                <Icon name="x" size={15} /> {uploadError}
              </div>
            )}
            <small className="upload-privacy">
              Tesseract runs in your browser. Your image is sent to OCR.space
              only for the optional refinement step.
            </small>
          </section>
        </div>
      )}

      {pairing && (
        <div className="modal-backdrop" onMouseDown={() => setPairing(false)}>
          <section
            className="pair-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setPairing(false)}>
              <Icon name="x" />
            </button>
            <div className="pair-icon">
              <Icon name="scan" size={24} />
            </div>
            <h2>
              Turn your phone into a{" "}
              {mode === "sketch" ? "sketchpad" : "writing pad"}
            </h2>
            <p>
              Scan this code with your phone camera.{" "}
              {mode === "sketch"
                ? "Draw with brushes and colors live on your laptop."
                : "No app or account needed."}
            </p>
            <div className="qr-frame">
              {qrImage ? (
                <Image
                  unoptimized
                  className="real-qr"
                  src={qrImage}
                  alt="Scan to connect your phone"
                  width={146}
                  height={146}
                />
              ) : (
                <QRCode />
              )}
              <i className="qr-logo">
                <span />
              </i>
            </div>
            <div className="pair-code">
              <span>Socket session</span>
              <b>{pairingUrl.split("=").at(-1)?.slice(0, 6).toUpperCase()}</b>
              <button onClick={() => void copyPairingLink()}>Copy link</button>
            </div>
            <div className="secure-note">
              <span />
              <div>
                <b>Private, temporary connection</b>
                <small>This session disappears when you disconnect.</small>
              </div>
            </div>
          </section>
        </div>
      )}

      {phone && (
        <div className="phone-panel">
          <div className="phone-head">
            <div>
              <span className="live-dot" />
              <span>
                <b>Connected</b>
                <small>Wave Motion & Oscillations</small>
              </span>
            </div>
            <button onClick={() => setPhone(false)}>
              <Icon name="x" />
            </button>
          </div>
          <div className="phone-tools">
            <button
              className={tool === "pen" ? "active" : ""}
              onClick={() => setTool("pen")}
            >
              <Icon name="pen" />
            </button>
            <button
              className={tool === "eraser" ? "active" : ""}
              onClick={() => setTool("eraser")}
            >
              <Icon name="eraser" />
            </button>
            <button onClick={clearInk}>
              <Icon name="x" />
            </button>
            <button
              className="phone-enter"
              onClick={insertLineBreak}
              aria-label="Start a new line"
            >
              ↵
            </button>
            <span />
            <button
              onClick={undoInk}
              disabled={!inked}
              aria-label="Undo last stroke"
            >
              <Icon name="undo" />
            </button>
          </div>
          <div className="canvas-wrap">
            <div className="canvas-hint">
              {inked
                ? "Pause when you’re done"
                : "Write here with your finger or stylus"}
            </div>
            <canvas
              ref={canvasRef}
              onPointerDown={startInk}
              onPointerMove={moveInk}
              onPointerUp={() => (drawing.current = false)}
              onPointerCancel={() => (drawing.current = false)}
            />
          </div>
          <div className="phone-foot">
            <div>
              <span className={inked ? "pulse" : ""} />
              <p>
                <b>{inked ? "Ink captured" : "Ready to write"}</b>
                <small>
                  {inked
                    ? "Ready when you are"
                    : "Your strokes stay in this session"}
                </small>
              </p>
            </div>
            <button disabled={!inked || refining} onClick={refine}>
              {refining ? (
                <span className="spinner" />
              ) : (
                <Icon name="sparkle" size={17} />
              )}
              {refining ? "Enhancing" : "Enhance notes"}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <Icon name="check" size={17} />
          {toast}
        </div>
      )}
    </main>
  );
}
