import { cn } from '@/lib/utils';

interface NutrientRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  unit?: string;
  className?: string;
  hideLabel?: boolean; // <--- AM ADĂUGAT ACEASTĂ PROPRIETATE
}

export function NutrientRing({ 
  value, 
  max, 
  size = 80, 
  strokeWidth = 6, 
  color, 
  label, 
  unit = '', 
  className,
  hideLabel = false // <--- AM ADĂUGAT ACEST PARAMETRU
}: NutrientRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  const offset = circumference - percentage * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-heading font-bold text-foreground">{Math.round(value)}</span>
        </div>
      </div>
      
      {/* <--- AICI ASCUNDEM TEXTUL DACĂ hideLabel ESTE TRUE ---> */}
      {!hideLabel && (
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      )}
      
    </div>
  );
}