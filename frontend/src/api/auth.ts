//  aici ne batem capul cu rularea locala vs rularea in docker
// variabila API_URL difera pt fiecare mod
// putem sa o retinem intr un .env si sa ne complicam cu alte fisiere
// sau sa modificam in fisierul asta de fiecare data cand rulam in alt mod:
//local:
//const API_URL = "http://localhost:8000/auth"
//pt docker:
//const API_URL = "/auth"
// sau alegem API_URL in functie de window location asta
const API_URL =
  window.location.port === "8080"
    ? "http://localhost:8000/auth"   // MOD LOCAL (vite dev)
    : "/auth";                       // MOD DOCKER (dist servit de backend)

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  photo_url?: string;
}) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Registration failed");
  }

  return res.json();
}

export async function loginUser(email: string, password: string) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Login failed");
  }

  return res.json();
}

export async function fetchCurrentUser(token: string) {
  const res = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Invalid token");

  return res.json();
}
