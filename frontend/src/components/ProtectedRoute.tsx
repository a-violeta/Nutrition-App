import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth-store";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.token);

  if (!token) return <Navigate to="/auth" replace />;

  return children;
}
