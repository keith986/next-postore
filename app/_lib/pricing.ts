export type PlanId   = "starter" | "pro" | "enterprise";
export type PosType  = "retail" | "restaurant" | "salon" | "wholesale" | "pharmacy";

export interface Plan {
  id:          PlanId;
  name:        string;
  description: string;
  features:    string[];
  highlight:   boolean;
  badge?:      string;
}

export interface PosPrice {
  posType:  PosType;
  label:    string;
  prices:   Record<PlanId, number>;
}

export const PLANS: Plan[] = [
  {
    id:          "starter",
    name:        "Starter",
    description: "Perfect for small businesses just getting started.",
    highlight:   false,
    features: [
      "Up to 2 staff accounts",
      "500 products",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    id:          "pro",
    name:        "Pro",
    description: "For growing businesses that need more power.",
    highlight:   true,
    badge:       "Most Popular",
    features: [
      "Up to 10 staff accounts",
      "Unlimited products",
      "Advanced analytics",
      "Priority support",
      "Custom subdomain",
    ],
  },
  {
    id:          "enterprise",
    name:        "Enterprise",
    description: "For large businesses with advanced needs.",
    highlight:   false,
    features: [
      "Unlimited staff accounts",
      "Unlimited products",
      "Full analytics suite",
      "24/7 dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
];

export const POS_PRICES: PosPrice[] = [
  {
    posType: "retail",
    label:   "Retail Store",
    prices:  { starter: 999, pro: 1999, enterprise: 3999 },
  },
  {
    posType: "restaurant",
    label:   "Restaurant / Food",
    prices:  { starter: 1299, pro: 2499, enterprise: 4999 },
  },
  {
    posType: "salon",
    label:   "Salon / Service",
    prices:  { starter: 999, pro: 1999, enterprise: 3999 },
  },
  {
    posType: "wholesale",
    label:   "Wholesale",
    prices:  { starter: 1499, pro: 2999, enterprise: 5999 },
  },
  {
    posType: "pharmacy",
    label:   "Pharmacy / Medicine",
    prices:  { starter: 1299, pro: 2499, enterprise: 4999 },
  },
];

export function getPrice(posType: PosType, plan: PlanId): number {
  const pos = POS_PRICES.find(p => p.posType === posType);
  return pos?.prices[plan] ?? 999;
}