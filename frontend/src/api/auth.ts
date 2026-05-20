const API_URL = "/auth";                       // MOD DOCKER (dist servit de backend)

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
