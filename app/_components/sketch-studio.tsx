"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { Icon } from "../inkflow-workspace";

type SketchStudioProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  phoneConnected: boolean;
  onConnectPhone: () => void;
  onEnhance: (mode: "local" | "cloud") => void;
  onClear: () => void;
  onUndo: () => void;
  canUndo: boolean;
  enhancingMode: "local" | "cloud" | null;
  enhancedImage: string;
  error: string;
};

const colors = ["#24203a", "#7357dd", "#ec5f75", "#f4a340", "#2eaa71", "#2586d9", "#ffffff"];

export function SketchStudio({ canvasRef, phoneConnected, onConnectPhone, onEnhance, onClear, onUndo, canUndo, enhancingMode, enhancedImage, error }: SketchStudioProps) {
  const enhancing = enhancingMode !== null;
  return (
    <article className="sketch-studio">
      <div className="sketch-toolbar">
        <div className="sketch-toolbar-info">
          <div className="sketch-tool-copy"><span className="sketch-tool-icon"><Icon name="pen" size={16} /></span><span><b>Live canvas</b><small>Brush controls are on your phone</small></span></div>
          <div className="sketch-swatches" aria-label="Available sketch colors">{colors.map((color) => <i key={color} style={{ background: color }} />)}</div>
        </div>
        <div className="sketch-actions">
          <button className="sketch-undo-button" onClick={onUndo} disabled={enhancing || !canUndo}><Icon name="undo" size={15} /><span>Undo</span></button>
          <button className="sketch-clear-button" onClick={onClear} disabled={enhancing}><Icon name="x" size={15} /><span>Clear</span></button>
          {canUndo && <button className="sketch-local-button" onClick={() => onEnhance("local")} disabled={enhancing}>
            {enhancingMode === "local" ? <span className="spinner" /> : <Icon name="sparkle" size={16} />}
            <span>{enhancingMode === "local" ? "Polishing…" : "Polish locally"}</span>
          </button>}
          {canUndo && <button className="sketch-ai-button" onClick={() => onEnhance("cloud")} disabled={enhancing}>
            {enhancingMode === "cloud" ? <span className="spinner" /> : <Icon name="sparkle" size={16} />}
            <span>{enhancingMode === "cloud" ? "Enhancing…" : "Enhance with AI"}</span>
          </button>}
        </div>
      </div>

      {!phoneConnected && <div className="sketch-connect-card">
        <span><Icon name="scan" size={24} /></span>
        <div><small>STEP 1</small><b>Connect your phone to start drawing</b><p>Use your phone as the sketchpad. Every line, color, and brush stroke will appear live on this laptop canvas.</p></div>
        <button onClick={onConnectPhone}>Connect phone <Icon name="arrow" size={15} /></button>
      </div>}

      {error && <div className="sketch-error" role="alert"><Icon name="sparkle" size={16} />{error}</div>}

      <div className={`sketch-canvas-frame ${enhancing ? "is-enhancing" : ""}`}>
        <canvas ref={canvasRef} aria-label="Live sketch received from phone" />
        {enhancedImage && <Image unoptimized fill sizes="(max-width: 900px) 90vw, 900px" src={enhancedImage} alt="Enhanced version of your sketch" />}
        {!enhancedImage && !canUndo && <div className="sketch-canvas-hint"><Icon name={phoneConnected ? "wifi" : "scan"} size={20} /><b>{phoneConnected ? "Phone connected — start drawing" : "Connect your phone to start drawing"}</b><small>{phoneConnected ? "Draw on your phone and every stroke will appear here live." : "Your phone becomes the sketchpad for this laptop canvas."}</small></div>}
        {enhancing && <div className="sketch-generating"><span className="spinner" /><b>{enhancingMode === "local" ? "Polishing on this device" : "Elevating your sketch"}</b><small>{enhancingMode === "local" ? "Improving contrast, color, and presentation without uploading…" : "Refining shapes, colors, depth, and visual balance…"}</small></div>}
      </div>
      <div className="sketch-status"><span className={phoneConnected ? "live-dot" : ""} />{phoneConnected ? "Phone connected · strokes are mirrored instantly" : "Connect a phone to begin"}<i />Local polish stays private · Cloud AI runs only when selected</div>
    </article>
  );
}
