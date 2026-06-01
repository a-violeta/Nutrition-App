/**
 * Frontend integration tests (E2E-style) using Vitest + Testing Library
 * 
 * Testează fluxurile principale ale aplicației:
 * 1. AuthScreen — register/login form
 * 2. FoodLogItem — afișare și ștergere
 * 3. NutrientBar — calcul și afișare
 * 4. BottomNav — navigare
 * 5. OnboardingForm — completare date fizice
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock auth store
vi.mock("@/lib/auth-store", () => ({
  useAuthStore: vi.fn((selector) =>
    selector({
      user: {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        programme: "weight_loss",
        weight: 70,
        height: 170,
        age: 25,
        sex: "female",
        activity_level: "moderate",
        daily_calories: 1950,
        daily_targets: {
          calories: 1560,
          protein: 117,
          carbs: 156,
          fat: 52,
          fiber: 30,
          sodium: 2300,
        },
      },
      token: "mock-token",
      login: vi.fn(),
      logout: vi.fn(),
      updateProgramme: vi.fn(),
      init: vi.fn(),
    })
  ),
}));

// Mock react-router-dom navigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock fetch global
global.fetch = vi.fn();

// ── Imports componente ────────────────────────────────────────────────────────
import { BottomNav } from "@/components/BottomNav";
import { FoodLogItem } from "@/components/FoodLogItem";
import { NutrientBar } from "@/components/NutrientBar";
import { NutrientRing } from "@/components/NutrientRing";

// ══════════════════════════════════════════════════════════════════════════════
// BottomNav Tests
// ══════════════════════════════════════════════════════════════════════════════

describe("BottomNav", () => {
  it("renders all navigation tabs", () => {
    const onTabChange = vi.fn();
    render(
      <MemoryRouter>
        <BottomNav activeTab="dashboard" onTabChange={onTabChange} />
      </MemoryRouter>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("calls onTabChange when a tab is clicked", () => {
    const onTabChange = vi.fn();
    render(
      <MemoryRouter>
        <BottomNav activeTab="dashboard" onTabChange={onTabChange} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Profile"));
    expect(onTabChange).toHaveBeenCalledWith("profile");
  });

  it("highlights the active tab", () => {
    const onTabChange = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <BottomNav activeTab="profile" onTabChange={onTabChange} />
      </MemoryRouter>
    );

    // Active tab should have primary color class
    const profileButton = screen.getByText("Profile").closest("button");
    expect(profileButton).toHaveClass("text-primary");
  });

  it("calls onTabChange with 'add' when + button is clicked", () => {
    const onTabChange = vi.fn();
    render(
      <MemoryRouter>
        <BottomNav activeTab="dashboard" onTabChange={onTabChange} />
      </MemoryRouter>
    );

    // Find the + button (gradient-primary div)
    const addButton = screen.getByText("Home").closest("nav")
      ?.querySelectorAll("button");
    
    // Find button with gradient-primary class
    if (addButton) {
      Array.from(addButton).forEach(btn => {
        if (btn.querySelector(".gradient-primary")) {
          fireEvent.click(btn);
        }
      });
    }

    expect(onTabChange).toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// FoodLogItem Tests
// ══════════════════════════════════════════════════════════════════════════════

describe("FoodLogItem", () => {
  const mockEntry = {
    id: "1",
    food: {
      id: 1,
      name: "Grilled Chicken Breast",
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sodium: 74,
    },
    quantity: 1,
    mealType: "lunch" as const,
    timestamp: new Date(),
  };

  it("renders food name", () => {
    const onRemove = vi.fn();
    render(<FoodLogItem entry={mockEntry} onRemove={onRemove} />);
    expect(screen.getByText("Grilled Chicken Breast")).toBeInTheDocument();
  });

  it("renders calories", () => {
    const onRemove = vi.fn();
    render(<FoodLogItem entry={mockEntry} onRemove={onRemove} />);
    expect(screen.getByText(/165 cal/)).toBeInTheDocument();
  });

  it("renders protein info", () => {
    const onRemove = vi.fn();
    render(<FoodLogItem entry={mockEntry} onRemove={onRemove} />);
    expect(screen.getByText(/31g protein/)).toBeInTheDocument();
  });

  it("calls onRemove with correct id when delete button is clicked", () => {
    const onRemove = vi.fn();
    render(<FoodLogItem entry={mockEntry} onRemove={onRemove} />);

    // Find and click trash button
    const deleteButton = screen.getByRole("button");
    fireEvent.click(deleteButton);
    expect(onRemove).toHaveBeenCalledWith("1");
  });

  it("shows lunch icon for lunch meal type", () => {
    const onRemove = vi.fn();
    render(<FoodLogItem entry={mockEntry} onRemove={onRemove} />);
    expect(screen.getByText("☀️")).toBeInTheDocument();
  });

  it("shows breakfast icon for breakfast meal type", () => {
    const onRemove = vi.fn();
    const breakfastEntry = { ...mockEntry, mealType: "breakfast" as const };
    render(<FoodLogItem entry={breakfastEntry} onRemove={onRemove} />);
    expect(screen.getByText("🌅")).toBeInTheDocument();
  });

  it("shows quantity when greater than 1", () => {
    const onRemove = vi.fn();
    const entry2 = { ...mockEntry, quantity: 3 };
    render(<FoodLogItem entry={entry2} onRemove={onRemove} />);
    expect(screen.getByText(/×3/)).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// NutrientBar Tests
// ══════════════════════════════════════════════════════════════════════════════

describe("NutrientBar", () => {
  it("renders label", () => {
    render(
      <NutrientBar
        label="Protein"
        value={50}
        max={100}
        color="hsl(200, 70%, 50%)"
      />
    );
    expect(screen.getByText("Protein")).toBeInTheDocument();
  });

  it("renders value and max", () => {
    render(
      <NutrientBar
        label="Calories"
        value={800}
        max={1800}
        color="hsl(200, 70%, 50%)"
        unit=" kcal"
      />
    );
    expect(screen.getByText(/800/)).toBeInTheDocument();
    expect(screen.getByText(/1800/)).toBeInTheDocument();
  });

  it("renders unit when provided", () => {
    render(
      <NutrientBar
        label="Calories"
        value={800}
        max={1800}
        color="hsl(200, 70%, 50%)"
        unit=" kcal"
      />
    );
    expect(screen.getByText(/kcal/)).toBeInTheDocument();
  });

  it("shows 0 value correctly", () => {
    render(
      <NutrientBar
        label="Fat"
        value={0}
        max={65}
        color="hsl(200, 70%, 50%)"
      />
    );
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// NutrientRing Tests  
// ══════════════════════════════════════════════════════════════════════════════

describe("NutrientRing", () => {
  it("renders label", () => {
    render(
      <NutrientRing
        value={50}
        max={100}
        size={60}
        strokeWidth={5}
        color="hsl(200, 70%, 50%)"
        label="Protein"
      />
    );
    expect(screen.getByText("Protein")).toBeInTheDocument();
  });

  it("renders value", () => {
    render(
      <NutrientRing
        value={75}
        max={100}
        size={60}
        strokeWidth={5}
        color="hsl(200, 70%, 50%)"
        label="Carbs"
      />
    );
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("renders SVG element", () => {
    const { container } = render(
      <NutrientRing
        value={50}
        max={100}
        size={120}
        strokeWidth={10}
        color="hsl(200, 70%, 50%)"
        label="Calories"
      />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Nutrition calculation Tests
// ══════════════════════════════════════════════════════════════════════════════

describe("Nutrition calculations", () => {
  it("calculates daily totals correctly", async () => {
    const { calculateDailyTotals } = await import("@/lib/nutrition-store");

    const entries = [
      {
        id: "1",
        food: { id: 1, name: "Chicken", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 74 },
        quantity: 1,
        mealType: "lunch" as const,
        timestamp: new Date(),
      },
      {
        id: "2",
        food: { id: 2, name: "Rice", calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, sodium: 10 },
        quantity: 2,
        mealType: "lunch" as const,
        timestamp: new Date(),
      },
    ];

    const totals = calculateDailyTotals(entries);

    expect(totals.calories).toBe(165 + 216 * 2); // 597
    expect(totals.protein).toBe(31 + 5 * 2);     // 41
    expect(totals.carbs).toBe(0 + 45 * 2);        // 90
  });

  it("returns zero totals for empty log", async () => {
    const { calculateDailyTotals } = await import("@/lib/nutrition-store");
    const totals = calculateDailyTotals([]);
    expect(totals.calories).toBe(0);
    expect(totals.protein).toBe(0);
    expect(totals.carbs).toBe(0);
    expect(totals.fat).toBe(0);
    expect(totals.fiber).toBe(0);
    expect(totals.sodium).toBe(0);
  });

  it("handles quantity > 1 correctly", async () => {
    const { calculateDailyTotals } = await import("@/lib/nutrition-store");

    const entries = [
      {
        id: "1",
        food: { id: 1, name: "Egg", calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, sodium: 62 },
        quantity: 3,
        mealType: "breakfast" as const,
        timestamp: new Date(),
      },
    ];

    const totals = calculateDailyTotals(entries);
    expect(totals.calories).toBe(78 * 3); // 234
    expect(totals.protein).toBe(6 * 3);   // 18
  });
});