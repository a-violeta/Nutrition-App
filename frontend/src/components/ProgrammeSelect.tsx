import { useState } from 'react';
import { motion } from 'framer-motion';
import { PROGRAMMES } from '@/data/mock-data';
import { ProgrammeType } from '@/types/nutrition';
import { saveProgramme } from '@/lib/nutrition-store';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ProgrammeSelectProps {
  onSelect: (p: ProgrammeType) => void;
  current?: ProgrammeType | null;
}

export function ProgrammeSelect({ onSelect, current }: ProgrammeSelectProps) {
  const [selected, setSelected] = useState<ProgrammeType | null>(current ?? null);

  const handleConfirm = () => {
    if (selected) {
      saveProgramme(selected);
      onSelect(selected);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col"
      >
        <div className="mb-8 mt-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Choose your <span className="text-gradient">programme</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            We'll tailor your tracking to match your goals
          </p>
        </div>

        <div className="grid gap-3 flex-1">
          {PROGRAMMES.map((prog, i) => (
            <motion.button
              key={prog.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(prog.id)}
              className={cn(
                'relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                selected === prog.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-muted-foreground/30'
              )}
            >
              <span className="text-3xl">{prog.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-foreground">{prog.name}</p>
                <p className="text-sm text-muted-foreground">{prog.description}</p>
              </div>
              {selected === prog.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center"
                >
                  <Check size={14} className="text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          disabled={!selected}
          className={cn(
            'w-full py-4 rounded-xl font-heading font-semibold text-lg mt-6 transition-all',
            selected
              ? 'gradient-primary text-primary-foreground shadow-lg shadow-primary/30'
              : 'bg-muted text-muted-foreground'
          )}
        >
          Get Started
        </motion.button>
      </motion.div>
    </div>
  );
}
