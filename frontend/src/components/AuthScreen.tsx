import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { Mail, Lock, User as UserIcon, Camera, Loader2 } from 'lucide-react';
import { User } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { loginUser, registerUser } from "@/api/auth";
import { useAuthStore } from "@/lib/auth-store";
import { useNavigate } from "react-router-dom";

interface AuthScreenProps {
  //onAuthenticated: (user: User) => void;
}

type Mode = 'login' | 'register';

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email: z.string().trim().email('Invalid email').max(255),
  password: z.string().min(6, 'Password at least 6 characters').max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email').max(255),
  password: z.string().min(1, 'Password required').max(128),
});
//scos: { onAuthenticated }: AuthScreenProps
export function AuthScreen() {
  const auth = useAuthStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarPick = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please pick an image.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Image too large', description: 'Max 2MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'register') {
        const parsed = registerSchema.safeParse({ name, email, password });
        if (!parsed.success) {
          toast({ title: 'Check your details', description: parsed.error.issues[0].message });
          return;
        }
      } else {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast({ title: 'Check your details', description: parsed.error.issues[0].message });
          return;
        }
      }

      // backend connected now
      if (mode === "register") {
        const res = await registerUser({
          name,
          email,
          password,
          photo_url: avatar,
        });

        auth.login(res.access_token, res.user);
        //unde navigam odata ce ne am conectat?
        navigate("/");
      } else {
        const res = await loginUser(email, password);
        auth.login(res.access_token, res.user);
        //unde navigam odata ce ne am conectat?
        navigate("/");
      }
    } catch (err: any){
      toast({
        title: "Authentication failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-heading font-bold text-gradient">NutriTrack</h1>
        <p className="text-muted-foreground mt-2">
          {mode === 'register' ? 'Create your account to get started.' : 'Welcome back. Log in to continue.'}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        <AnimatePresence mode="wait">
          {mode === 'register' && (
            <motion.div
              key="avatar"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center"
            >
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative w-24 h-24 rounded-full glass-card flex items-center justify-center overflow-hidden border border-border hover:border-primary/50 transition-colors"
              >
                {avatar ? (
                  <img src={avatar} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={28} className="text-muted-foreground" />
                )}
                <span className="absolute bottom-0 inset-x-0 text-[10px] py-1 bg-background/70 text-muted-foreground">
                  {avatar ? 'Change' : 'Optional'}
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleAvatarPick(e.target.files[0])}
              />
            </motion.div>
          )}

          {mode === 'register' && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="pl-9 h-12"
                  autoComplete="name"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-9 h-12"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-9 h-12"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-12 gradient-primary text-primary-foreground font-semibold text-base"
        >
          {submitting && <Loader2 className="animate-spin" />}
          {mode === 'register' ? 'Create account' : 'Log in'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
            className="text-primary font-medium hover:underline"
          >
            {mode === 'register' ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-8">
        NutriTrack · Secure Login Enabled
      </p>
    </div>
  );
}
