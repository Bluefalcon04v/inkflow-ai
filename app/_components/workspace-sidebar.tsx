import { Icon } from "../inkflow-workspace";

type WorkspaceSidebarProps = {
  open: boolean;
  isNewNote: boolean;
  mode: "notes" | "sketch";
  onNewNote: () => void;
  onModeChange: (mode: "notes" | "sketch") => void;
  onCloudClick: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  phoneConnected: boolean;
  onConnectPhone: () => void;
};

export function WorkspaceSidebar({ open, isNewNote, mode, onNewNote, onModeChange, onCloudClick, darkMode, onToggleTheme, phoneConnected, onConnectPhone }: WorkspaceSidebarProps) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-mark"><span /></div>
        <span className="brand">InkFlow <b>AI</b></span>
      </div>
      <button className="new-note" onClick={onNewNote}><Icon name="plus" size={18} /> {mode === "notes" ? "New note" : "New sketch"}</button>
      <div className="sidebar-content">
        <nav>
          <p className="nav-label">Workspace</p>
          <button className={`nav-item ${mode === "notes" ? "active" : ""}`} onClick={() => onModeChange("notes")}><Icon name="edit" /> Notes</button>
          <button className={`nav-item ${mode === "sketch" ? "active" : ""}`} onClick={() => onModeChange("sketch")}><Icon name="shapes" /> Sketch Studio</button>
          <p className="nav-label with-space">Recent</p>
          {mode === "notes" && isNewNote && <div className="recent active"><i className="note-dot lavender" /><span><b>Untitled note</b><small>Editing now</small></span></div>}
          {mode === "sketch" && <div className="recent active"><i className="note-dot coral" /><span><b>Untitled sketch</b><small>Live canvas</small></span></div>}
        </nav>
        {!phoneConnected && (
          <div className="sidebar-connect-guide">
            <div className="sidebar-connect-title">
              <span><Icon name="scan" size={15} /></span>
              <div><b>{mode === "notes" ? "Write from your phone" : "Draw from your phone"}</b><small>Quick connection guide</small></div>
            </div>
            <ol>
              <li><b>1</b><span>Connect your phone</span></li>
              <li><b>2</b><span>{mode === "notes" ? "Write on the phone" : "Draw on the phone"}</span></li>
              <li><b>3</b><span>{mode === "notes" ? "Tap Enhance" : "Polish or enhance"}</span></li>
            </ol>
            <button onClick={onConnectPhone}><Icon name="scan" size={14} /> Connect phone</button>
          </div>
        )}
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-account">
          <button className="sidebar-profile" aria-label="Open profile"><span>AK</span><span><b>AK</b><small>Profile</small></span></button>
          <button className="sidebar-theme" onClick={onToggleTheme} aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`} aria-pressed={darkMode}>
            <span aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>
        <div className="storage-line"><span>Local session</span><b>Not saved to cloud</b></div>
        <div className="storage-bar"><i /></div>
        <button className="upgrade" onClick={onCloudClick}><Icon name="cloud" /> Enable cloud saving <Icon name="chevron" size={15} /></button>
      </div>
    </aside>
  );
}
