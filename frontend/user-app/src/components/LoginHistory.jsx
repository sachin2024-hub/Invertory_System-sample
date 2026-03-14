import { useState, useEffect } from 'react';

const LOGIN_HISTORY_KEY = 'sarisari_login_history';

function formatRelativeTime(iso) {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return email || '—';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return email;
  return `${local.slice(0, 2)}${'*'.repeat(Math.min(local.length - 2, 4))}@${domain}`;
}

export default function LoginHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOGIN_HISTORY_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setHistory(Array.isArray(list) ? list : []);
    } catch {
      setHistory([]);
    }
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="login-history">
      <h3 className="login-history-title">Recent login activity</h3>
      <ul className="login-history-list">
        {history.map((entry, i) => (
          <li key={`${entry.email}-${entry.timestamp}-${i}`} className="login-history-item">
            <span className="login-history-email">{maskEmail(entry.email)}</span>
            <span className="login-history-time">{formatRelativeTime(entry.timestamp)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
