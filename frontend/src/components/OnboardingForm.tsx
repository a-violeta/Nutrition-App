import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

const API =
  window.location.port === "8080"
    ? "http://localhost:8000"
    : "";

interface OnboardingFormProps {
  onComplete: () => void;
}

const activityOptions = [
  { value: "sedentary", label: "Sedentary", description: "No sport" },
  { value: "light", label: "Lightly active", description: "1-3 days/week" },
  { value: "moderate", label: "Moderately active", description: "3-5 days/week" },
  { value: "active", label: "Very active", description: "6-7 days/week" },
];

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const login = useAuthStore((s) => s.login);

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | ''>('');
  const [activityLevel, setActivityLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!weight || !height || !age || !sex || !activityLevel) {
      setError('Please fill in all fields.');
      return;
    }
    if (!user || !token) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weight: parseFloat(weight),
          height: parseFloat(height),
          age: parseInt(age),
          sex,
          activity_level: activityLevel,
        }),
      });

      if (!res.ok) {
        setError('Could not save your data. Please try again.');
        return;
      }

      const updated = await res.json();
      login(token!, { ...user, ...updated, weight: parseFloat(weight), height: parseFloat(height), age: parseInt(age), sex, activity_level: activityLevel });
      onComplete();
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // Calcul preview calorii
  const previewCalories = () => {
    if (!weight || !height || !age || !sex || !activityLevel) return null;
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (isNaN(w) || isNaN(h) || isNaN(a)) return null;

    const bmr = sex === 'male'
      ? (10 * w) + (6.25 * h) - (5 * a) + 5
      : (10 * w) + (6.25 * h) - (5 * a) - 161;

    const factors: Record<string, number> = {
      sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725,
    };
    return Math.round(bmr * (factors[activityLevel] || 1.2));
  };

  const calories = previewCalories();

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col"
      >
        <div className="mb-8 mt-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Tell us about <span className="text-gradient">yourself</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            We'll calculate your personalized daily calorie and nutrient targets.
          </p>
        </div>

        <div className="space-y-5 flex-1">
          {/* Sex */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Biological sex</label>
            <div className="flex gap-3">
              {(['male', 'female'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSex(s)}
                  className={cn(
                    'flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all capitalize',
                    sex === s
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/30'
                  )}
                >
                  {s === 'male' ? '♂ Male' : '♀ Female'}
                </button>
              ))}
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 25"
              min="10"
              max="100"
              className="w-full h-12 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Weight & Height */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 70"
                min="30"
                max="300"
                className="w-full h-12 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 170"
                min="100"
                max="250"
                className="w-full h-12 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Activity level</label>
            <div className="grid gap-2">
              {activityOptions.map((opt, i) => (
                <motion.button
                  key={opt.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setActivityLevel(opt.value)}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all',
                    activityLevel === opt.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-muted-foreground/30'
                  )}
                >
                  <span className={cn(
                    'text-sm font-medium',
                    activityLevel === opt.value ? 'text-primary' : 'text-foreground'
                  )}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{opt.description}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Preview calorii */}
          {calories && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-4 text-center"
            >
              <p className="text-xs text-muted-foreground mb-1">Your estimated daily calories</p>
              <p className="text-3xl font-heading font-bold text-primary">{calories} kcal</p>
              <p className="text-xs text-muted-foreground mt-1">Targets will be adjusted for your programme</p>
            </motion.div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-xl font-heading font-semibold text-lg gradient-primary text-primary-foreground shadow-lg shadow-primary/30 disabled:opacity-50 transition-all"
          >
            {loading ? 'Saving...' : 'Get started →'}
          </button>

          <button
            onClick={onComplete}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </div>
  );
}
