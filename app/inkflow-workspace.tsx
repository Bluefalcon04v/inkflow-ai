"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type IconName =
  | "arrow" | "back" | "check" | "chevron" | "cloud" | "download"
  | "edit" | "eraser" | "image" | "math" | "menu" | "mic" | "more"
  | "pen" | "plus" | "redo" | "scan" | "search" | "settings" | "shapes"
  | "sparkle" | "text" | "undo" | "upload" | "wifi" | "x";

const paths: Record<IconName, React.ReactNode> = {
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  back: <><path d="m15 18-6-6 6-6" /></>,
  check: <><path d="m5 12 4 4L19 6" /></>,
  chevron: <><path d="m9 18 6-6-6-6" /></>,
  cloud: <><path d="M17.5 19H6a4 4 0 0 1-.7-7.94A7 7 0 0 1 18.7 9.2 5 5 0 0 1 17.5 19Z" /><path d="m9 13 3-3 3 3M12 10v6" /></>,
  download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
  eraser: <><path d="m7 21-4-4L16 4a2 2 0 0 1 3 0l1 1a2 2 0 0 1 0 3L7 21Z" /><path d="m6 14 4 4M7 21h13" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></>,
  math: <><path d="M4 6h7M7.5 3v6M15 5l5 5m0-5-5 5M4 16h7M15 16h5M17.5 13.5v.01M17.5 18.5v.01" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" /></>,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  pen: <><path d="m14 4 6 6L8 22H2v-6Z" /><path d="m12 6 6 6M2 22l5-2-3-3Z" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  redo: <><path d="m15 7 4 4-4 4" /><path d="M19 11H9a5 5 0 0 0-5 5" /></>,
  scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.2.36.5.7.9.88.34.16.7.24 1.08.22H21v4h-.1A1.7 1.7 0 0 0 19.4 15Z" /></>,
  shapes: <><circle cx="7" cy="7" r="4" /><rect x="12" y="12" width="8" height="8" rx="1" /></>,
  sparkle: <><path d="m12 3 1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8ZM19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z" /></>,
  text: <><path d="M5 5h14M12 5v14M8 19h8" /></>,
  undo: <><path d="m9 7-4 4 4 4" /><path d="M5 11h10a5 5 0 0 1 5 5" /></>,
  upload: <><path d="M12 16V4m0 0L8 8m4-4 4 4M5 20h14" /></>,
  wifi: <><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01" /></>,
  x: <><path d="m6 6 12 12M18 6 6 18" /></>,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const qr = [
  "111111101011101111111", "100000101010101000001", "101110101110101011101",
  "101110100101101011101", "101110101011101011101", "100000101110101000001",
  "111111101010101111111", "000000001101100000000", "101110111011101101011",
  "011001000111000110100", "110111111001111011101", "001001000110001001000",
  "111011101101111010111", "000000001011001010100", "111111101101111010101",
  "100000100110001110100", "101110101011111011111", "101110100110100010000",
  "101110101101111011101", "100000100010001010100", "111111101101111010111",
];

function QRCode() {
  return <div className="qr" aria-label="Session QR preview">{qr.flatMap((row, y) => [...row].map((cell, x) => <i className={cell === "1" ? "filled" : ""} key={`${x}-${y}`} />))}</div>;
}

export default function InkflowWorkspace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const [sidebar, setSidebar] = useState(true);
  const [pairing, setPairing] = useState(false);
  const [phone, setPhone] = useState(false);
  const [font, setFont] = useState("Natural Ink");
  const [fontMenu, setFontMenu] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [inked, setInked] = useState(false);
  const [refining, setRefining] = useState(false);
  const [refined, setRefined] = useState(false);
  const [toast, setToast] = useState("");

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
    event.currentTarget.setPointerCapture(event.pointerId);
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
    lastPoint.current = next;
    setInked(true);
    setRefined(false);
  };

  const clearInk = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setInked(false);
    setRefined(false);
  };

  const refine = () => {
    setRefining(true);
    window.setTimeout(() => {
      setRefining(false);
      setRefined(true);
      notify("Ink refined — math and structure detected");
    }, 1200);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <button className="icon-button mobile-menu" onClick={() => setSidebar(!sidebar)} aria-label="Toggle sidebar"><Icon name="menu" /></button>
          <div className="brand-mark"><span /></div>
          <span className="brand">InkFlow <b>AI</b></span>
        </div>
        <div className="sync"><span className="sync-dot" /><span>{phone ? "Live sync active" : "All changes saved locally"}</span></div>
        <div className="top-actions">
          <button className="icon-button" aria-label="Search"><Icon name="search" /></button>
          <button className="icon-button" aria-label="Settings"><Icon name="settings" /></button>
          <button className="avatar">KS</button>
        </div>
      </header>

      <div className="main-grid">
        <aside className={`sidebar ${sidebar ? "open" : ""}`}>
          <button className="new-note" onClick={() => notify("New blank note created")}><Icon name="plus" size={18} /> New note</button>
          <nav>
            <p className="nav-label">Workspace</p>
            <button className="nav-item active"><Icon name="edit" /> Notes <span>4</span></button>
            <button className="nav-item"><Icon name="shapes" /> Diagrams</button>
            <button className="nav-item"><Icon name="math" /> Equations</button>
            <p className="nav-label with-space">Recent</p>
            <button className="recent active"><i className="note-dot purple" /><span><b>Physics — Wave Motion</b><small>Edited just now</small></span></button>
            <button className="recent"><i className="note-dot coral" /><span><b>Product brainstorm</b><small>Yesterday</small></span></button>
            <button className="recent"><i className="note-dot yellow" /><span><b>Calculus notes</b><small>Jul 12</small></span></button>
          </nav>
          <div className="sidebar-bottom">
            <div className="storage-line"><span>Local session</span><b>Not saved to cloud</b></div>
            <div className="storage-bar"><i /></div>
            <button className="upgrade" onClick={() => notify("Cloud saving is planned for V2")}><Icon name="cloud" /> Enable cloud saving <Icon name="chevron" size={15} /></button>
          </div>
        </aside>

        <section className="workspace">
          <div className="doc-head">
            <div><div className="eyebrow"><span>Notes</span><Icon name="chevron" size={13} /><span>Physics</span></div><h1>Wave Motion & Oscillations</h1></div>
            <div className="doc-actions">
              <button className={`connection ${phone ? "connected" : ""}`} onClick={() => setPairing(true)}><Icon name={phone ? "wifi" : "scan"} size={18} />{phone ? "Phone connected" : "Connect phone"}</button>
              <button className="icon-button bordered" onClick={() => notify("Export prepared as PDF")} aria-label="Export"><Icon name="download" /></button>
              <button className="icon-button bordered" aria-label="More"><Icon name="more" /></button>
            </div>
          </div>

          <div className="toolbar">
            <div className="tool-group">
              <button className="tool active"><Icon name="pen" /></button><button className="tool"><Icon name="text" /></button><button className="tool"><Icon name="eraser" /></button>
            </div>
            <span className="divider" />
            <button className="font-picker" onClick={() => setFontMenu(!fontMenu)}><span className="font-aa">Aa</span><span><small>Writing style</small><b>{font}</b></span><span className="down">⌄</span></button>
            {fontMenu && <div className="font-menu">
              {["Natural Ink", "Study Script", "Clean Print"].map((item) => <button key={item} onClick={() => { setFont(item); setFontMenu(false); }}><span className={`sample ${item === "Clean Print" ? "print" : ""}`}>Ag</span><span>{item}</span>{font === item && <Icon name="check" size={16} />}</button>)}
              <button className="upload-font" onClick={() => notify("Handwriting sample uploader opened")}><Icon name="upload" size={17} /> Add my handwriting</button>
            </div>}
            <span className="divider" />
            <button className="tool"><Icon name="undo" /></button><button className="tool faded"><Icon name="redo" /></button>
            <span className="toolbar-spacer" />
            <button className="ai-button" onClick={() => { setRefined(true); notify("Note cleaned and organized"); }}><Icon name="sparkle" size={17} /> Refine page</button>
          </div>

          <div className="paper-wrap">
            <article className={`paper ${font === "Clean Print" ? "clean-font" : font === "Study Script" ? "study-font" : ""}`}>
              <div className="paper-date">16 JULY 2026 <span>•</span> PHYSICS</div>
              <h2>Wave Motion</h2>
              <p className="lead">A wave is a disturbance that transfers <mark>energy</mark> from one place to another without transferring matter.</p>
              <div className="note-callout"><Icon name="sparkle" size={15} /><span>AI organized your writing into a definition</span></div>
              <h3>Key terms</h3>
              <div className="terms">
                <div><span className="term-no">01</span><p><b>Amplitude (A)</b><small>Maximum displacement from the equilibrium position.</small></p></div>
                <div><span className="term-no">02</span><p><b>Frequency (f)</b><small>Number of complete oscillations per second.</small></p></div>
                <div><span className="term-no">03</span><p><b>Wavelength (λ)</b><small>Distance between two consecutive points in phase.</small></p></div>
              </div>
              <div className="content-row">
                <div className="equation-block"><div className="block-tag"><Icon name="math" size={14} /> Equation recognized</div><p>v = f λ</p><small>wave speed = frequency × wavelength</small></div>
                <div className="wave-card"><svg viewBox="0 0 280 100" preserveAspectRatio="none"><path d="M5 52 C35 5, 55 5, 82 52 S130 99, 158 52 S205 5, 233 52 S260 98, 278 53" /><path className="axis" d="M2 52H278" /></svg><span className="amp">A</span><span className="lambda">← &nbsp; λ &nbsp; →</span><div className="block-tag"><Icon name="shapes" size={14} /> Diagram cleaned</div></div>
              </div>
              {refined && <div className="fresh-note"><span><Icon name="sparkle" size={16} /></span><div><b>AI refinement complete</b><p>Spacing corrected · equation detected · diagram aligned</p></div><button onClick={() => setRefined(false)}><Icon name="x" size={16} /></button></div>}
              <div className="page-number">1</div>
            </article>
          </div>
        </section>
      </div>

      {pairing && <div className="modal-backdrop" onMouseDown={() => setPairing(false)}>
        <section className="pair-modal" onMouseDown={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setPairing(false)}><Icon name="x" /></button>
          <div className="pair-icon"><Icon name="scan" size={24} /></div>
          <h2>Turn your phone into a writing pad</h2>
          <p>Scan this code with your phone camera. No app or account needed.</p>
          <div className="qr-frame"><QRCode /><i className="qr-logo"><span /></i></div>
          <div className="pair-code"><span>or enter</span><b>INK–7K2</b><button onClick={() => notify("Pairing code copied")}>Copy</button></div>
          <div className="secure-note"><span /><div><b>Private, temporary connection</b><small>This session disappears when you disconnect.</small></div></div>
          <button className="simulate" onClick={() => { setPhone(true); setPairing(false); window.setTimeout(() => setPhone(true), 200); }}>Preview connected phone <Icon name="arrow" size={17} /></button>
        </section>
      </div>}

      {phone && <div className="phone-panel">
        <div className="phone-head"><div><span className="live-dot" /><span><b>Connected</b><small>Wave Motion & Oscillations</small></span></div><button onClick={() => setPhone(false)}><Icon name="x" /></button></div>
        <div className="phone-tools"><button className={tool === "pen" ? "active" : ""} onClick={() => setTool("pen")}><Icon name="pen" /></button><button className={tool === "eraser" ? "active" : ""} onClick={() => setTool("eraser")}><Icon name="eraser" /></button><button onClick={clearInk}><Icon name="x" /></button><span /><button><Icon name="undo" /></button></div>
        <div className="canvas-wrap"><div className="canvas-hint">{inked ? "Pause when you’re done" : "Write here with your finger or stylus"}</div><canvas ref={canvasRef} onPointerDown={startInk} onPointerMove={moveInk} onPointerUp={() => drawing.current = false} onPointerCancel={() => drawing.current = false} /></div>
        <div className="phone-foot"><div><span className={inked ? "pulse" : ""} /><p><b>{inked ? "Ink captured" : "Ready to write"}</b><small>{inked ? "Waiting for your pause…" : "Your strokes stay in this session"}</small></p></div><button disabled={!inked || refining} onClick={refine}>{refining ? <span className="spinner" /> : <Icon name="sparkle" size={17} />}{refining ? "Refining" : "Refine ink"}</button></div>
      </div>}

      {toast && <div className="toast"><Icon name="check" size={17} />{toast}</div>}
    </main>
  );
}
