"use client";

import { useEffect, useRef, type RefObject } from "react";
import { Icon } from "../inkflow-workspace";

type BlankNoteSheetProps = {
  phoneConnected: boolean;
  remoteCanvasRef: RefObject<HTMLCanvasElement | null>;
  recognizedText: string;
  onTextChange: (text: string) => void;
  recognitionError: string;
};

export function BlankNoteSheet({ phoneConnected, remoteCanvasRef, recognizedText, onTextChange, recognitionError }: BlankNoteSheetProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
      {recognitionError && <div className="recognition-error" role="alert"><Icon name="sparkle" size={16} /><span><b>Recognition feedback</b>{recognitionError}</span></div>}
      <div className="note-input-surface typing-active">
        <textarea ref={textAreaRef} className="note-body-input" aria-label="Note body" placeholder={phoneConnected ? "Your converted handwriting will appear here…" : "Connect your phone above to begin…"} value={recognizedText} onChange={(event) => onTextChange(event.target.value)} />
        <canvas ref={remoteCanvasRef} className="remote-ink-canvas" aria-label="Handwriting received from phone" />
      </div>
      <div className="page-number">1</div>
    </article>
  );
}
