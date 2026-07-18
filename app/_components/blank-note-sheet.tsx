"use client";

import { useEffect, useRef, type RefObject } from "react";
import { Icon } from "../inkflow-workspace";

type BlankNoteSheetProps = {
  phoneConnected: boolean;
  onConnectPhone: () => void;
  remoteCanvasRef: RefObject<HTMLCanvasElement | null>;
  recognizedText: string;
  recognizing: boolean;
  canEnhance: boolean;
  onEnhance: () => void;
  onTextChange: (text: string) => void;
  recognitionError: string;
};

export function BlankNoteSheet({ phoneConnected, onConnectPhone, remoteCanvasRef, recognizedText, recognizing, canEnhance, onEnhance, onTextChange, recognitionError }: BlankNoteSheetProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const currentDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date()).toUpperCase();

  useEffect(() => {
    if (!recognitionError) return;
    const unclear = recognizedText.match(/\[unclear:[^\]]+\]/i);
    const textArea = textAreaRef.current;
    if (!unclear || unclear.index === undefined || !textArea) return;
    textArea.focus({ preventScroll: true });
    textArea.setSelectionRange(unclear.index, unclear.index + unclear[0].length);
  }, [recognizedText, recognitionError]);

  return (
    <article className="paper blank-note">
      <div className="paper-date"><time suppressHydrationWarning>{currentDate}</time> <span>•</span> NEW NOTE</div>
      <input className="note-title-input" aria-label="Note title" placeholder="Untitled note" autoFocus />
      <div className={`mobile-tip ${phoneConnected ? "connected" : ""}`}>
        <span className="mobile-tip-icon"><Icon name={phoneConnected ? "wifi" : "scan"} size={19} /></span>
        <div>
          <b>{phoneConnected ? "Phone connected — start writing" : "Start with your phone"}</b>
          <p>{phoneConnected ? "Write on your phone, then choose Enhance when you are ready to turn it into editable text." : "Connect your phone, write there, and enhance your handwriting when you are ready."}</p>
        </div>
        {!phoneConnected && <button onClick={onConnectPhone}>Connect phone <Icon name="arrow" size={15} /></button>}
      </div>
      {!phoneConnected && <div className="getting-started" aria-label="How to get started">
        <span><b>1</b> Connect your phone</span><i />
        <span><b>2</b> Write on the phone</span><i />
        <span><b>3</b> Tap Enhance</span>
      </div>}
      {phoneConnected && <div className="note-conversion-row">
        <div className="conversion-status"><span className={recognizing ? "status-pulse" : ""} />{recognizing ? "Reading your handwriting…" : canEnhance ? "Ink ready to enhance" : "Ready — write on your phone"}</div>
        <button className="enhance-note-button" onClick={onEnhance} disabled={!canEnhance || recognizing}>
          <Icon name="sparkle" size={15} /> {recognizing ? "Enhancing…" : "Enhance"}
        </button>
      </div>}
      {recognitionError && <div className="recognition-error" role="alert"><Icon name="sparkle" size={16} /><span><b>Recognition feedback</b>{recognitionError}</span></div>}
      <div className="note-input-surface typing-active">
        <textarea ref={textAreaRef} className="note-body-input" aria-label="Note body" placeholder={phoneConnected ? "Your converted handwriting will appear here…" : "Connect your phone above to begin…"} value={recognizedText} onChange={(event) => onTextChange(event.target.value)} />
        <canvas ref={remoteCanvasRef} className="remote-ink-canvas" aria-label="Handwriting received from phone" />
      </div>
      <div className="page-number">1</div>
    </article>
  );
}
