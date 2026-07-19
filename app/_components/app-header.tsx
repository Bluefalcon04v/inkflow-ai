import { Icon } from "../inkflow-workspace";

type AppHeaderProps = {
  phoneConnected: boolean;
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
};

export function AppHeader({ phoneConnected, onToggleSidebar, darkMode, onToggleTheme }: AppHeaderProps) {
  return (
    <header className="topbar">
      <div className="brand-wrap">
        <button className="icon-button mobile-menu" onClick={onToggleSidebar} aria-label="Toggle sidebar"><Icon name="menu" /></button>
        <div className="brand-mark"><span /></div>
        <span className="brand">InkFlow <b>AI</b></span>
      </div>
      <div className="sync"><span className="sync-dot" /><span>{phoneConnected ? "Live sync active" : "All changes saved locally"}</span></div>
      <div className="top-actions">
        <button className="theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`} aria-pressed={darkMode}>
          <span aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
          <small>{darkMode ? "Light" : "Dark"}</small>
        </button>
        <button className="avatar" aria-label="Open profile">AK</button>
      </div>
    </header>
  );
}
