export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  priceInCents: number
  price: number
  features: string[]
  priceId: string
  tier: "free" | "pro" | "enterprise"
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free Plan",
    description: "Perfect for getting started",
    priceInCents: 0,
    price: 0,
    tier: "free",
    priceId: "",
    features: [
      "Upload up to 5 cases per month",
      "Access to basic flashcards (limited)",
      "2 mock tests per month",
      "Community forum access",
      "Email support",
      "Basic analytics",
    ],
  },
  {
    id: "pro",
    name: "Pro Plan",
    description: "Best for serious law students",
    priceInCents: 999, // $9.99/month
    price: 9.99,
    tier: "pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    features: [
      "Unlimited case uploads",
      "Advanced AI case analysis",
      "Unlimited mock tests",
      "AI-powered study recommendations",
      "Priority email support",
      "Advanced analytics & progress tracking",
      "Access to all flashcard sets",
      "Weekly study reports",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    description: "For law firms and institutions",
    priceInCents: 4999, // $49.99/month
    price: 49.99,
    tier: "enterprise",
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "",
    features: [
      "Everything in Pro, plus:",
      "Unlimited team members",
      "Custom case templates",
      "Advanced reporting & analytics",
      "API access",
      "Dedicated account manager",
      "Phone & email support",
      "Custom integrations",
      "SSO authentication",
    ],
  },
]

export function getPlanById(id: string) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id)
}

export function getPlanByTier(tier: string) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.tier === tier)
}
