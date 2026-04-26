import { motion } from 'framer-motion';
import { ProgrammeType } from '@/types/nutrition';
import { User } from '@/types/auth';
import { getProgramme } from '@/lib/nutrition-store';
import { Settings, ChevronRight, LogOut } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  programme: ProgrammeType;
  onChangeProgramme: () => void;
  onLogout: () => void;
}

export function ProfileView({ user, programme, onChangeProgramme, onLogout }: ProfileViewProps) {
  const prog = getProgramme(programme)!;

  return (
    <div className="pb-24 px-4 pt-4">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Profile</h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 mb-4"
      >
        <div className="flex items-center gap-4">
          {user.avatarDataUrl ? (
            <img src={user.avatarDataUrl} alt={`${user.name} avatar`} className="w-14 h-14 rounded-full object-cover" />
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
      </motion.div>

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
          onClick={onLogout}
          className="w-full flex items-center justify-between p-4 border-t border-border hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <LogOut size={20} className="text-destructive" />
            <p className="text-sm font-medium text-destructive">Log out</p>
          </div>
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        NutriTrack v1.0 · Mock Data Mode
      </p>
    </div>
  );
}
