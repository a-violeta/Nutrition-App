import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from "@/lib/auth-store";
import { getProgramme } from '@/lib/nutrition-store';
import { Settings, ChevronRight, LogOut, Pencil, Trash2, X, Check, Camera, Activity } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { registerForPushNotifications, unregisterPushNotifications } from '@/lib/push';
import { sendTestPush } from '@/api/push';
import { cn } from '@/lib/utils';

const API = import.meta.env.DEV ? "http://localhost:8000" : "";

const activityOptions = [
  { value: "sedentary", label: "Sedentary", description: "No sport" },
  { value: "light", label: "Lightly active", description: "1-3 days/week" },
  { value: "moderate", label: "Moderately active", description: "3-5 days/week" },
  { value: "active", label: "Very active", description: "6-7 days/week" },
];

export function ProfileView() {
  const user = useAuthStore((s) => s.user);
  const programme = user?.programme ?? null;
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const login = useAuthStore((s) => s.login);
  const updateProgramme = useAuthStore((s) => s.updateProgramme);
  const navigate = useNavigate();

  const prog = programme ? getProgramme(programme) : null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? "");
  const [editEmail, setEditEmail] = useState(user?.email ?? "");
  const [editPhotoBase64, setEditPhotoBase64] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState("");

  // Body metrics editing
  const [editingMetrics, setEditingMetrics] = useState(false);
  const [editWeight, setEditWeight] = useState(String(user?.weight ?? ''));
  const [editHeight, setEditHeight] = useState(String(user?.height ?? ''));
  const [editAge, setEditAge] = useState(String(user?.age ?? ''));
  const [editSex, setEditSex] = useState<'male' | 'female' | ''>(user?.sex as 'male' | 'female' ?? '');
  const [editActivityLevel, setEditActivityLevel] = useState(user?.activity_level ?? '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notifications_enabled ?? false);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!user?.id || !token) return;
    fetch(`${API}/users/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          login(token!, { ...user, ...data });
          setEditName(data.name);
          setEditEmail(data.email);
          setEditWeight(String(data.weight ?? ''));
          setEditHeight(String(data.height ?? ''));
          setEditAge(String(data.age ?? ''));
          setEditSex(data.sex ?? '');
          setEditActivityLevel(data.activity_level ?? '');
        }
      })
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    setNotificationsEnabled(user?.notifications_enabled ?? false);
  }, [user?.notifications_enabled]);

  const handleEnableNotifications = async () => {
    if (!token || !user) return;
    setLoading(true);
    setPushStatusMessage(null);
    try {
      await registerForPushNotifications(token);
      setNotificationsEnabled(true);
      login(token, { ...user, notifications_enabled: true });
      setPushStatusMessage("Notifications enabled.");
    } catch (err) {
      setPushStatusMessage(err instanceof Error ? err.message : "Could not enable notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    if (!token || !user) return;
    setLoading(true);
    setPushStatusMessage(null);
    try {
      await unregisterPushNotifications(token);
      setNotificationsEnabled(false);
      login(token, { ...user, notifications_enabled: false });
      setPushStatusMessage("Notifications disabled.");
    } catch (err) {
      setPushStatusMessage(err instanceof Error ? err.message : "Could not disable notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!token) return;
    setLoading(true);
    setPushStatusMessage(null);
    try {
      await sendTestPush(token);
      setPushStatusMessage("Test notification sent.");
    } catch (err) {
      setPushStatusMessage(err instanceof Error ? err.message : "Could not send test notification.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Photo is too large. Maximum 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEditPhotoBase64(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user?.id || !token) return;
    setError(null);
    if (!editName.trim()) { setError("Username cannot be empty."); return; }
    if (!editEmail.trim()) { setError("Email cannot be empty."); return; }
    setLoading(true);
    const body: Record<string, string> = {};
    if (editName !== user.name) body.name = editName;
    if (editEmail !== user.email) body.email = editEmail;
    if (editPhotoBase64) body.photo_url = editPhotoBase64;
    if (editPassword) body.password = editPassword;
    try {
      const res = await fetch(`${API}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail ?? "Error saving.");
        return;
      }
      const updated = await res.json();
      login(token!, { ...user, ...updated });
      setEditing(false);
      setEditPassword("");
      setEditPhotoBase64(null);
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMetrics = async () => {
    if (!user?.id || !token) return;
    if (!editWeight || !editHeight || !editAge || !editSex || !editActivityLevel) {
      setMetricsError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setMetricsError(null);
    try {
      const res = await fetch(`${API}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          weight: parseFloat(editWeight),
          height: parseFloat(editHeight),
          age: parseInt(editAge),
          sex: editSex,
          activity_level: editActivityLevel,
        }),
      });
      if (!res.ok) {
        setMetricsError("Error saving metrics.");
        return;
      }
      const updated = await res.json();
      // Fetch user complet cu daily_targets calculate
      const refreshed = await fetch(`${API}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const refreshedData = await refreshed.json();
      login(token!, { ...user, ...refreshedData });
      setEditingMetrics(false);
    } catch {
      setMetricsError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user?.id || !token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ photo_url: "" }),
      });
      if (!res.ok) { setError("Could not remove photo."); return; }
      const updated = await res.json();
      login(token!, { ...user, ...updated, photo_url: null });
      setEditPhotoBase64(null);
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.id || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { logout(); } else { setError("Error deleting account."); }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-4"><p className="text-center text-muted-foreground">Loading user...</p></div>;
  }

  const avatarSrc = editPhotoBase64 ?? user.photo_url ?? user.avatarDataUrl ?? null;

  // Preview calorii
  const previewCalories = () => {
    const w = parseFloat(editWeight);
    const h = parseFloat(editHeight);
    const a = parseInt(editAge);
    if (!w || !h || !a || !editSex || !editActivityLevel) return null;
    const bmr = editSex === 'male'
      ? (10 * w) + (6.25 * h) - (5 * a) + 5
      : (10 * w) + (6.25 * h) - (5 * a) - 161;
    const factors: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
    return Math.round(bmr * (factors[editActivityLevel] || 1.2));
  };
  const calories = editingMetrics ? previewCalories() : null;

  return (
    <div className="pb-24 px-4 pt-4">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Profile</h1>

      {/* ── Card profil ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarSrc ? (
                <img src={avatarSrc} alt={`${user.name} avatar`} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-2xl text-primary-foreground font-heading font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              {editing && (
                <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <Camera size={18} className="text-white" />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
            <div>
              <p className="font-heading font-semibold text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {editing && (
                <div className="flex gap-3 mt-1">
                  <button onClick={() => fileInputRef.current?.click()} className="text-xs text-primary hover:underline">Change photo</button>
                  {user.photo_url && (
                    <button onClick={handleDeletePhoto} className="text-xs text-destructive hover:underline">Remove photo</button>
                  )}
                </div>
              )}
            </div>
          </div>
          <button onClick={() => { setEditing(!editing); setError(null); setEditPhotoBase64(null); }} className="p-2 rounded-full hover:bg-secondary/50 transition-colors">
            {editing ? <X size={18} className="text-muted-foreground" /> : <Pencil size={18} className="text-muted-foreground" />}
          </button>
        </div>
        {editing && (
          <div className="mt-4 flex flex-col gap-3">
            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" placeholder="Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" placeholder="Email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" placeholder="New password (if needed)" type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
            {editPhotoBase64 && <p className="text-xs text-green-500">✓ Photo selected — press Save to upload it</p>}
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button onClick={handleSave} disabled={loading} className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              <Check size={16} />
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Body Metrics ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            <p className="text-sm font-semibold text-foreground">Body Metrics</p>
          </div>
          <button onClick={() => { setEditingMetrics(!editingMetrics); setMetricsError(null); }} className="p-2 rounded-full hover:bg-secondary/50 transition-colors">
            {editingMetrics ? <X size={18} className="text-muted-foreground" /> : <Pencil size={18} className="text-muted-foreground" />}
          </button>
        </div>

        {!editingMetrics ? (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Weight", value: user.weight ? `${user.weight} kg` : "—" },
              { label: "Height", value: user.height ? `${user.height} cm` : "—" },
              { label: "Age", value: user.age ? `${user.age} years` : "—" },
              { label: "Sex", value: user.sex ? (user.sex === 'male' ? '♂ Male' : '♀ Female') : "—" },
              { label: "Activity", value: activityOptions.find(a => a.value === user.activity_level)?.label ?? "—" },
              { label: "Daily calories", value: user.daily_calories ? `${user.daily_calories} kcal` : "—" },
            ].map((item) => (
              <div key={item.label} className="bg-secondary/30 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Sex */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Biological sex</label>
              <div className="flex gap-2">
                {(['male', 'female'] as const).map((s) => (
                  <button key={s} onClick={() => setEditSex(s)} className={cn('flex-1 py-2 rounded-lg border-2 text-xs font-medium transition-all capitalize', editSex === s ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground')}>
                    {s === 'male' ? '♂ Male' : '♀ Female'}
                  </button>
                ))}
              </div>
            </div>
            {/* Age */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Age</label>
              <input type="number" value={editAge} onChange={(e) => setEditAge(e.target.value)} placeholder="e.g. 25" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
            </div>
            {/* Weight & Height */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</label>
                <input type="number" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} placeholder="e.g. 70" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Height (cm)</label>
                <input type="number" value={editHeight} onChange={(e) => setEditHeight(e.target.value)} placeholder="e.g. 170" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
              </div>
            </div>
            {/* Activity */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Activity level</label>
              <div className="grid gap-2">
                {activityOptions.map((opt) => (
                  <button key={opt.value} onClick={() => setEditActivityLevel(opt.value)} className={cn('flex items-center justify-between p-2 rounded-lg border-2 text-left transition-all', editActivityLevel === opt.value ? 'border-primary bg-primary/10' : 'border-border')}>
                    <span className={cn('text-xs font-medium', editActivityLevel === opt.value ? 'text-primary' : 'text-foreground')}>{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Preview calorii */}
            {calories && (
              <div className="bg-primary/10 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Estimated daily calories</p>
                <p className="text-xl font-heading font-bold text-primary">{calories} kcal</p>
              </div>
            )}
            {metricsError && <p className="text-xs text-destructive">{metricsError}</p>}
            <button onClick={handleSaveMetrics} disabled={loading} className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              <Check size={16} />
              {loading ? "Saving..." : "Save metrics"}
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Notificări ───────────────────────────────────────────────────── */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-sm font-medium text-foreground">Browser notifications</p>
            <p className="text-xs text-muted-foreground">Enable push alerts for meal logging and reminders.</p>
          </div>
          <button onClick={notificationsEnabled ? handleDisableNotifications : handleEnableNotifications} disabled={loading} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
            {notificationsEnabled ? "Disable" : "Enable"}
          </button>
        </div>
        {pushStatusMessage && <p className="text-xs text-muted-foreground mb-3">{pushStatusMessage}</p>}
        {notificationsEnabled && (
          <button onClick={handleSendTestNotification} disabled={loading} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50">
            Send test notification
          </button>
        )}
      </div>

      {/* ── Setări & logout ──────────────────────────────────────────────── */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button onClick={async () => { await updateProgramme(null); navigate("/"); }} className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3">
            <Settings size={20} className="text-muted-foreground" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Current Programme</p>
              {prog ? <p className="text-xs text-muted-foreground">{prog.icon} {prog.name}</p> : <p className="text-xs text-muted-foreground italic">No programme selected</p>}
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>
        <button onClick={logout} className="w-full flex items-center justify-between p-4 border-t border-border hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3">
            <LogOut size={20} className="text-destructive" />
            <p className="text-sm font-medium text-destructive">Log out</p>
          </div>
        </button>
        <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-between p-4 border-t border-border hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3">
            <Trash2 size={20} className="text-destructive" />
            <p className="text-sm font-medium text-destructive">Delete account</p>
          </div>
        </button>
      </div>

      {/* Modal confirmare ștergere cont */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-background rounded-2xl p-6 w-full max-w-sm">
            <h2 className="font-heading font-bold text-foreground mb-2">Delete your account?</h2>
            <p className="text-sm text-muted-foreground mb-6">This action is permanent and cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-lg border border-border py-2 text-sm text-foreground hover:bg-secondary/50 transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={loading} className="flex-1 rounded-lg bg-destructive text-destructive-foreground py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground mt-8">NutriTrack v1.0</p>
    </div>
  );
}
