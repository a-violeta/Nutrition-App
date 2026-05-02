import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProgrammeType } from '@/types/nutrition';
import { useAuthStore } from "@/lib/auth-store";
import { getProgramme } from '@/lib/nutrition-store';
import { Settings, ChevronRight, LogOut, Pencil, Trash2, X, Check } from 'lucide-react';

interface ProfileViewProps {
  programme: ProgrammeType;
  onChangeProgramme: () => void;
}

const API =
  window.location.port === "8080"
    ? "http://localhost:8000"
    : "";

export function ProfileView({ programme, onChangeProgramme }: ProfileViewProps) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const login = useAuthStore((s) => s.login);

  const prog = getProgramme(programme)!;

  // ── State pentru editare ──────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? "");
  const [editEmail, setEditEmail] = useState(user?.email ?? "");
  const [editPhotoUrl, setEditPhotoUrl] = useState(user?.photo_url ?? "");
  const [editPassword, setEditPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── GET: încarcă profilul fresh din backend ───────────────────────────────
  useEffect(() => {
    if (!user?.id || !token) return;

    fetch(`${API}/users/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          // Actualizăm store-ul cu datele fresh din backend
          login(token!, { ...user, ...data });
          setEditName(data.name);
          setEditEmail(data.email);
          setEditPhotoUrl(data.photo_url ?? "");
        }
      })
      .catch(() => {/* ignorăm erori silențioase la încărcare */});
  }, [user?.id]);

  // ── PUT: salvează modificările ────────────────────────────────────────────
  const handleSave = async () => {
    if (!user?.id || !token) return;
    setLoading(true);
    setError(null);

    const body: Record<string, string> = {};
    if (editName !== user.name) body.name = editName;
    if (editEmail !== user.email) body.email = editEmail;
    if (editPhotoUrl !== (user.photo_url ?? "")) body.photo_url = editPhotoUrl;
    if (editPassword) body.password = editPassword;

    try {
      const res = await fetch(`${API}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.detail ?? "Eroare la salvare.");
        return;
      }

      const updated = await res.json();
      login(token!, { ...user, ...updated });
      setEditing(false);
      setEditPassword("");
    } catch {
      setError("Nu s-a putut conecta la server.");
    } finally {
      setLoading(false);
    }
  };

  // ── DELETE: șterge contul ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!user?.id || !token) return;
    setLoading(true);

    try {
      const res = await fetch(`${API}/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        logout();
      } else {
        setError("Eroare la ștergerea contului.");
      }
    } catch {
      setError("Nu s-a putut conecta la server.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4">
        <p className="text-center text-muted-foreground">Loading user...</p>
      </div>
    );
  }
// Fallback între backend (photo_url) și mock (avatarDataUrl)
  const avatar = user.photo_url ?? user.avatarDataUrl ?? null;

  return (
    <div className="pb-24 px-4 pt-4">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Profile</h1>

      {/* ── Card profil ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {avatar ? (
              <img
                src={avatar}
                alt={`${user.name} avatar`}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-2xl text-primary-foreground font-heading font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-heading font-semibold text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Buton editare */}
          <button
            onClick={() => setEditing(!editing)}
            className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
          >
            {editing ? <X size={18} className="text-muted-foreground" /> : <Pencil size={18} className="text-muted-foreground" />}
          </button>
        </div>

        {/* ── Formular editare ─────────────────────────────────────────────── */}
        {editing && (
          <div className="mt-4 flex flex-col gap-3">
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="Nume"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="Email"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="URL poză de profil (opțional)"
              value={editPhotoUrl}
              onChange={(e) => setEditPhotoUrl(e.target.value)}
            />
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="Parolă nouă (lasă gol dacă nu schimbi)"
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
            />

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Check size={16} />
              {loading ? "Se salvează..." : "Salvează modificările"}
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Setări & logout ───────────────────────────────────────────────── */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button
          onClick={onChangeProgramme}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings size={20} className="text-muted-foreground" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Current Programme</p>
              <p className="text-xs text-muted-foreground">{prog.icon} {prog.name}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center justify-between p-4 border-t border-border hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <LogOut size={20} className="text-destructive" />
            <p className="text-sm font-medium text-destructive">Log out</p>
          </div>
        </button>

        {/* ── Șterge cont ───────────────────────────────────────────────── */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center justify-between p-4 border-t border-border hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Trash2 size={20} className="text-destructive" />
            <p className="text-sm font-medium text-destructive">Șterge contul</p>
          </div>
        </button>
      </div>

      {/* ── Modal confirmare ștergere ─────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-background rounded-2xl p-6 w-full max-w-sm">
            <h2 className="font-heading font-bold text-foreground mb-2">Ștergi contul?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Această acțiune este permanentă și nu poate fi anulată.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-border py-2 text-sm text-foreground hover:bg-secondary/50 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 rounded-lg bg-destructive text-destructive-foreground py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Se șterge..." : "Da, șterge"}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground mt-8">
        NutriTrack v1.0
      </p>
    </div>
  );
}
