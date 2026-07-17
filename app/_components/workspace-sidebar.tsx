import { Icon } from "../inkflow-workspace";

type WorkspaceSidebarProps = {
  open: boolean;
  isNewNote: boolean;
  mode: "notes" | "sketch";
  onNewNote: () => void;
  onModeChange: (mode: "notes" | "sketch") => void;
  onCloudClick: () => void;
};

export function WorkspaceSidebar({ open, isNewNote, mode, onNewNote, onModeChange, onCloudClick }: WorkspaceSidebarProps) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <button className="new-note" onClick={() => mode === "notes" ? onNewNote() : onModeChange("sketch")}><Icon name="plus" size={18} /> {mode === "notes" ? "New note" : "New sketch"}</button>
      <nav>
        <p className="nav-label">Workspace</p>
        <button className={`nav-item ${mode === "notes" ? "active" : ""}`} onClick={() => onModeChange("notes")}><Icon name="edit" /> Notes</button>
        <button className={`nav-item ${mode === "sketch" ? "active" : ""}`} onClick={() => onModeChange("sketch")}><Icon name="shapes" /> Sketch Studio</button>
        <p className="nav-label with-space">Recent</p>
        {mode === "notes" && isNewNote && <div className="recent active"><i className="note-dot lavender" /><span><b>Untitled note</b><small>Editing now</small></span></div>}
        {mode === "sketch" && <div className="recent active"><i className="note-dot coral" /><span><b>Untitled sketch</b><small>Live canvas</small></span></div>}
      </nav>
      <div className="sidebar-bottom">
        <div className="storage-line"><span>Local session</span><b>Not saved to cloud</b></div>
        <div className="storage-bar"><i /></div>
        <button className="upgrade" onClick={onCloudClick}><Icon name="cloud" /> Enable cloud saving <Icon name="chevron" size={15} /></button>
      </div>
    </aside>
  );
}
