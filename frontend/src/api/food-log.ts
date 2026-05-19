const API = "/food-log";

function getHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ── GET: jurnalul pe o zi ─────────────────────────────────────────────────
export async function fetchFoodLog(token: string, date?: string) {
  const query = date ? `?log_date=${date}` : "";
  const res = await fetch(`${API}/${query}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Could not fetch food log.");
  return res.json(); // array de FoodLogEntry
}

// ── POST: adaugă o intrare ────────────────────────────────────────────────
export async function addFoodLog(
  token: string,
  entry: {
    food_id: number;
    quantity: number;
    meal_type: "breakfast" | "lunch" | "dinner" | "snack";
    date?: string; // YYYY-MM-DD, default today
  }
) {
  const res = await fetch(`${API}/`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("Could not add food log entry.");
  return res.json();
}

// ── DELETE: șterge o intrare ──────────────────────────────────────────────
export async function deleteFoodLog(token: string, entryId: number) {
  const res = await fetch(`${API}/${entryId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Could not delete food log entry.");
  return;
}
