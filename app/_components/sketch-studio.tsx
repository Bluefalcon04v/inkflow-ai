"use client";

import Image from "next/image";
import { useState, type PointerEvent, type RefObject } from "react";
import { Icon } from "../inkflow-workspace";

type SketchStudioProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  phoneConnected: boolean;
  onConnectPhone: () => void;
  onEnhance: (mode: "local" | "cloud") => void;
  onOpenAiModal: () => void;
  onGenerateAi: (description: string) => void;
  onClear: () => void;
  onUndo: () => void;
  onDownload: () => void;
  onPointerDown: (event: PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLCanvasElement>) => void;
  canUndo: boolean;
  enhancingMode: "local" | "cloud" | null;
  enhancedImage: string;
  enhancedImageMode: "local" | "cloud";
  error: string;
  progress: string;
  progressStage: "local" | "pollinations" | "pixazo" | "complete" | "";
  aiModalOpen: boolean;
  sourcePreview: string;
  onCloseAiModal: () => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
};

const colors = ["#24203a", "#7357dd", "#ec5f75", "#f4a340", "#2eaa71", "#2586d9", "#ffffff"];

export function SketchStudio({ canvasRef, phoneConnected, onConnectPhone, onEnhance, onOpenAiModal, onGenerateAi, onClear, onUndo, onDownload, onPointerDown, onPointerMove, onPointerUp, canUndo, enhancingMode, enhancedImage, enhancedImageMode, error, progress, progressStage, aiModalOpen, sourcePreview, onCloseAiModal, selectedColor, onColorChange }: SketchStudioProps) {
  const enhancing = enhancingMode !== null;
  const [description, setDescription] = useState("");
  return (
    <article className="sketch-studio">
      <div className="sketch-toolbar">
        <div className="sketch-toolbar-info">
          <div className="sketch-tool-copy"><span className="sketch-tool-icon"><Icon name="pen" size={16} /></span><span><b>Live canvas</b><small>Choose a color or draw from your phone</small></span></div>
          <div className="sketch-swatches" aria-label="Laptop drawing colors">{colors.map((color) => <button key={color} className={selectedColor === color ? "active" : ""} style={{ background: color }} aria-label={`Use ${color}`} aria-pressed={selectedColor === color} onClick={() => onColorChange(color)} />)}</div>
        </div>
        <div className="sketch-actions">
          <button className="sketch-undo-button" onClick={onUndo} disabled={enhancing || !canUndo} aria-label="Undo last stroke" title="Undo"><Icon name="undo" size={16} /></button>
          <button className="sketch-clear-button" onClick={onClear} disabled={enhancing} aria-label="Clear canvas" title="Clear"><Icon name="x" size={16} /></button>
          <button className="sketch-download-button" onClick={onDownload} disabled={!canUndo && !enhancedImage} aria-label="Download sketch" title="Download"><Icon name="download" size={16} /></button>
          {!phoneConnected && <button className="sketch-connect-button" onClick={onConnectPhone}><Icon name="scan" size={15} /><span>Connect phone</span></button>}
          {canUndo && <button className="sketch-local-button" onClick={() => onEnhance("local")} disabled={enhancing}>
            {enhancingMode === "local" ? <span className="spinner" /> : <Icon name="sparkle" size={16} />}
            <span>{enhancingMode === "local" ? "Polishing…" : "Polish locally"}</span>
          </button>}
          {canUndo && <button className="sketch-ai-button" onClick={onOpenAiModal} disabled={enhancing}>
            {enhancingMode === "cloud" ? <span className="spinner" /> : <Icon name="sparkle" size={16} />}
            <span>{enhancingMode === "cloud" ? "Enhancing…" : "Enhance with AI"}</span>
          </button>}
          <div className={`workspace-sync-badge inline ${phoneConnected ? "live" : ""}`}><span />{phoneConnected ? "Live sync" : "Saved locally"}</div>
        </div>
      </div>

      {error && <div className="sketch-error" role="alert"><Icon name="sparkle" size={16} />{error}</div>}

      <div className={`sketch-canvas-frame ${enhancing ? "is-enhancing" : ""}`}>
        <canvas ref={canvasRef} aria-label="Draw a sketch on the laptop or mirror strokes from your phone" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} />
        {enhancedImage && enhancedImageMode === "local" && <Image unoptimized fill sizes="(max-width: 900px) 90vw, 900px" src={enhancedImage} alt="Locally polished version of your sketch" />}
        {!canUndo && <div className="sketch-canvas-hint"><Icon name={phoneConnected ? "wifi" : "pen"} size={20} /><b>{phoneConnected ? "Draw here or on your phone" : "Start drawing on this canvas"}</b><small>{phoneConnected ? "Laptop and phone strokes stay mirrored live." : "Use your mouse or trackpad, or connect a phone from the sidebar."}</small></div>}
        {enhancingMode === "local" && <div className="sketch-generating"><span className="spinner" /><b>Polishing on this device</b><small>Improving contrast, color, and presentation without uploading…</small></div>}
      </div>
      <div className="sketch-status"><span className={phoneConnected ? "live-dot" : ""} />{phoneConnected ? "Phone connected · strokes are mirrored instantly" : "Connect a phone to begin"}<i />Local polish stays private · Cloud AI runs only when selected</div>

      {aiModalOpen && <div className="modal-backdrop sketch-ai-modal-backdrop" onMouseDown={() => { if (!enhancing) onCloseAiModal(); }}>
        <section className="sketch-ai-modal" role="dialog" aria-modal="true" aria-labelledby="sketch-ai-title" onMouseDown={(event) => event.stopPropagation()}>
          <header><div><span className="sketch-ai-modal-icon"><Icon name="sparkle" size={18} /></span><span><b id="sketch-ai-title">Create from your sketch</b><small>{enhancing ? "AI generation is actively running" : enhancedImage ? "Your detailed image is ready" : "Generation stopped"}</small></span></div><button onClick={onCloseAiModal} disabled={enhancing} aria-label="Close image generator" title={enhancing ? "Wait for generation to finish" : "Close"}><Icon name="x" size={16} /></button></header>
          <div className="sketch-ai-compare">
            <div className="sketch-ai-preview raw"><span>Raw sketch</span>{sourcePreview ? <Image unoptimized fill sizes="360px" src={sourcePreview} alt="Your raw sketch" /> : <div className="sketch-ai-empty"><Icon name="pen" size={20} />Preparing preview…</div>}</div>
            <div className="sketch-ai-arrow"><Icon name="sparkle" size={17} /></div>
            <div className="sketch-ai-preview final"><span>Final image</span>{enhancedImage && enhancedImageMode === "cloud" ? <Image unoptimized fill sizes="360px" src={enhancedImage} alt="AI-generated detailed image" /> : <div className="sketch-ai-empty">{enhancing ? <><span className="spinner" />Creating details…</> : "No image generated"}</div>}</div>
          </div>
          <div className="sketch-ai-progress-copy"><b>{progress || "Preparing your sketch"}</b><small>{enhancing ? "Please keep this page open. The pipeline is working and may take a few moments." : error || "Completed successfully."}</small></div>
          <label className="sketch-ai-description"><span>What did you draw?</span><input value={description} onChange={(event) => setDescription(event.target.value)} disabled={enhancing} placeholder="Example: A small house beside a tree under the sun" /><small>A short description helps Pixazo understand simple shapes correctly.</small></label>
          <ol className="sketch-pipeline modal" aria-label="AI enhancement progress"><li className={progressStage === "local" || progressStage === "pixazo" || progressStage === "complete" ? "done" : "active"}><span>1</span>Local cleanup</li><li className={progressStage === "pixazo" ? "active" : progressStage === "complete" ? "done" : ""}><span>2</span>Pixazo image</li></ol>
          <footer><button className="sketch-modal-close" onClick={onCloseAiModal} disabled={enhancing}>Close</button>{!enhancing && <button className="sketch-modal-create" onClick={() => onGenerateAi(description)} disabled={!description.trim()}><Icon name="sparkle" size={15} />{enhancedImage ? "Create again" : "Create image"}</button>}<button className="sketch-modal-download" onClick={onDownload} disabled={!enhancedImage || enhancing}><Icon name="download" size={15} />Download image</button></footer>
        </section>
      </div>}
    </article>
  );
}
