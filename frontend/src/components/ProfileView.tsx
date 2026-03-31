import { motion } from 'framer-motion';
import { ProgrammeType } from '@/types/nutrition';
import { getProgramme } from '@/lib/nutrition-store';
import { Settings, ChevronRight } from 'lucide-react';

interface ProfileViewProps {
  programme: ProgrammeType;
  onChangeProgramme: () => void;
}

export function ProfileView({ programme, onChangeProgramme }: ProfileViewProps) {
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
          <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <p className="font-heading font-semibold text-foreground">User</p>
            <p className="text-sm text-muted-foreground">Track your nutrition journey</p>
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
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        NutriTrack v1.0 · Mock Data Mode
      </p>
    </div>
  );
}
