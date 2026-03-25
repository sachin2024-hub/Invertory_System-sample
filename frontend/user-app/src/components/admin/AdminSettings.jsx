import { useMemo, useState } from 'react';

export default function AdminSettings({ user }) {
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('GMT+8 (Philippines)');
  const [storeName, setStoreName] = useState('Sari-Sari Store');
  const [storeAddress, setStoreAddress] = useState('123 Barangay St, Example City');

  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(true);
  const [newUserAlert, setNewUserAlert] = useState(false);

  const canSave = useMemo(() => {
    return Boolean(language && timezone && storeName.trim().length > 0 && storeAddress.trim().length > 0);
  }, [language, timezone, storeName, storeAddress]);

  const handleSave = (e) => {
    e.preventDefault();
    // UI-only for now. If you want, we can persist to backend later.
    alert('Settings saved (demo UI).');
  };

  return (
    <div className="manage-section">
      <div className="section-header">
        <h3>Settings</h3>
        <button type="button" className="btn-primary" onClick={handleSave} disabled={!canSave}>
          Save Changes
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div className="settings-grid">
          <div className="settings-col">
            <div className="settings-field">
              <label>Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="English">English</option>
                <option value="Cebuano">Cebuano</option>
                <option value="Filipino">Filipino</option>
              </select>
            </div>

            <div className="settings-field">
              <label>Timezone</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option value="GMT+8 (Philippines)">GMT+8 (Philippines)</option>
                <option value="GMT+0 (UTC)">GMT+0 (UTC)</option>
                <option value="GMT+9">GMT+9</option>
              </select>
            </div>

            <div className="settings-field">
              <label>Store Information</label>
              <input value={storeName} onChange={(e) => setStoreName(e.target.value)} type="text" />
            </div>

            <div className="settings-field">
              <label>Address</label>
              <input value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} type="text" />
            </div>

            <div className="settings-note">
              Signed in as <strong>{user?.email || user?.name || 'Admin'}</strong>
            </div>
          </div>

          <div className="settings-col">
            <div className="settings-field">
              <label>Notification Settings</label>

              <div className="toggle-row">
                <span>Low Stock Alert</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={lowStockAlert}
                    onChange={(e) => setLowStockAlert(e.target.checked)}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="toggle-row">
                <span>New Order Alert</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={newOrderAlert}
                    onChange={(e) => setNewOrderAlert(e.target.checked)}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="toggle-row">
                <span>New User Alert</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={newUserAlert}
                    onChange={(e) => setNewUserAlert(e.target.checked)}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

