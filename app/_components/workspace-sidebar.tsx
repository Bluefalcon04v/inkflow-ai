import { Icon } from "../inkflow-workspace";

type WorkspaceSidebarProps = {
  open: boolean;
  isNewNote: boolean;
  onNewNote: () => void;
  onOpenExisting: () => void;
  onCloudClick: () => void;
};

export function WorkspaceSidebar({ open, isNewNote, onNewNote, onOpenExisting, onCloudClick }: WorkspaceSidebarProps) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <button className="new-note" onClick={onNewNote}><Icon name="plus" size={18} /> New note</button>
      <nav>
        <p className="nav-label">Workspace</p>
        <button className="nav-item active"><Icon name="edit" /> Notes <span>{isNewNote ? 5 : 4}</span></button>
        <button className="nav-item"><Icon name="shapes" /> Diagrams</button>
        <button className="nav-item"><Icon name="math" /> Equations</button>
        <p className="nav-label with-space">Recent</p>
        {isNewNote && <button className="recent active"><i className="note-dot lavender" /><span><b>Untitled note</b><small>Editing now</small></span></button>}
        <button className={`recent ${isNewNote ? "" : "active"}`} onClick={onOpenExisting}><i className="note-dot purple" /><span><b>Physics — Wave Motion</b><small>Edited just now</small></span></button>
        <button className="recent"><i className="note-dot coral" /><span><b>Product brainstorm</b><small>Yesterday</small></span></button>
        <button className="recent"><i className="note-dot yellow" /><span><b>Calculus notes</b><small>Jul 12</small></span></button>
      </nav>
      <div className="sidebar-bottom">
        <div className="storage-line"><span>Local session</span><b>Not saved to cloud</b></div>
        <div className="storage-bar"><i /></div>
        <button className="upgrade" onClick={onCloudClick}><Icon name="cloud" /> Enable cloud saving <Icon name="chevron" size={15} /></button>
      </div>
    </aside>
  );
}
