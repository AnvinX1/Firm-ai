import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getOrCreateCustomer, createCheckoutSession } from "@/lib/stripe"
import { getPlanById } from "@/lib/products"

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: "Plan ID required" }, { status: 400 })
    }

    const plan = getPlanById(planId)
    if (!plan || !plan.priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer(user.email || "", user.user_metadata?.name)

    // Get base URL for redirect
    const baseUrl = request.nextUrl.origin
    const redirectUrl = `${baseUrl}/dashboard/pricing?session_id={CHECKOUT_SESSION_ID}`

    // Create checkout session
    const session = await createCheckoutSession(customer.id, plan.priceId, redirectUrl)

    // Update user's Stripe customer ID
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ stripe_customer_id: customer.id })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating profile:", updateError)
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
