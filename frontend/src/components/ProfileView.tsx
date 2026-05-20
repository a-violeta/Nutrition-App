import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ProgrammeType } from '@/types/nutrition';
import { useAuthStore } from "@/lib/auth-store";
import { getProgramme } from '@/lib/nutrition-store';
import { Settings, ChevronRight, LogOut, Pencil, Trash2, X, Check, Camera } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const API = "";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        }
      })
      .catch(() => {});
  }, [user?.id]);

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
    setLoading(true);
    setError(null);
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
      if (!res.ok) {
        setError("Could not remove photo.");
        return;
      }
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
      if (res.ok) {
        logout();
      } else {
        setError("Error deleting account.");
      }
    } catch {
      setError("Could not connect to server.");
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

  const avatarSrc = editPhotoBase64 ?? user.photo_url ?? user.avatarDataUrl ?? null;

  return (
    <div className="pb-24 px-4 pt-4">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Profile</h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">

            {/* Avatar */}
            <div className="relative">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={`${user.name} avatar`}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-2xl text-primary-foreground font-heading font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              {editing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <Camera size={18} className="text-white" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Nume + email + butoane foto */}
            <div>
              <p className="font-heading font-semibold text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {editing && (
                <div className="flex gap-3 mt-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-primary hover:underline"
                  >
                    Change photo
                  </button>
                  {user.photo_url && (
                    <button
                      onClick={handleDeletePhoto}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Buton edit / close */}
          <button
            onClick={() => {
              setEditing(!editing);
              setError(null);
              setEditPhotoBase64(null);
            }}
            className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
          >
            {editing
              ? <X size={18} className="text-muted-foreground" />
              : <Pencil size={18} className="text-muted-foreground" />}
          </button>
        </div>

        {/* Formular editare */}
        {editing && (
          <div className="mt-4 flex flex-col gap-3">
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="Name"
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
              placeholder="New password (if needed)"
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
            />
            {editPhotoBase64 && (
              <p className="text-xs text-green-500">✓ Photo selected — press Save to upload it</p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Check size={16} />
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        )}
      </motion.div>

      {/* Setări & logout */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button
          onClick={async () => {
            await updateProgramme(null);
            navigate("/");
          }}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings size={20} className="text-muted-foreground" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Current Programme</p>
              
              {prog ? (
                <p className="text-xs text-muted-foreground">{prog.icon} {prog.name}</p>
              ) : (
                <p className="text-xs text-muted-foreground italic">No programme selected</p>
              )}

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

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center justify-between p-4 border-t border-border hover:bg-secondary/50 transition-colors"
        >
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
            <p className="text-sm text-muted-foreground mb-6">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-border py-2 text-sm text-foreground hover:bg-secondary/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 rounded-lg bg-destructive text-destructive-foreground py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Yes, delete"}
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
