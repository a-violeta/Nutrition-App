import { cn } from '@/lib/utils';

interface NutrientBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  unit?: string;
}

export function NutrientBar({ label, value, max, color, unit = 'g' }: NutrientBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const isOver = value > max;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn('font-medium', isOver ? 'text-destructive' : 'text-foreground')}>
          {Math.round(value)}{unit} / {max}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
