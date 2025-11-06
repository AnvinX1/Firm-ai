import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 })
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    const supabase = await createServerClient()

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any

        // Find user by Stripe customer ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", subscription.customer)
          .single()

        if (profile) {
          const status = subscription.status
          const tier = subscription.metadata?.tier || "pro"

          // Update user subscription
          await supabase
            .from("profiles")
            .update({
              stripe_subscription_id: subscription.id,
              subscription_tier: tier,
              subscription_status: status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("id", profile.id)

          // Log subscription event
          await supabase.from("subscription_events").insert({
            user_id: profile.id,
            stripe_event_id: event.id,
            event_type: event.type,
            event_data: subscription,
            processed: true,
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", subscription.customer)
          .single()

        if (profile) {
          // Downgrade to free plan
          await supabase
            .from("profiles")
            .update({
              subscription_tier: "free",
              subscription_status: "canceled",
              stripe_subscription_id: null,
            })
            .eq("id", profile.id)

          await supabase.from("subscription_events").insert({
            user_id: profile.id,
            stripe_event_id: event.id,
            event_type: event.type,
            event_data: subscription,
            processed: true,
          })
        }
        break
      }

      case "invoice.payment_succeeded": {
        // Handle successful payment
        const invoice = event.data.object as any
        console.log(`Payment succeeded for invoice ${invoice.id}`)
        break
      }

      case "invoice.payment_failed": {
        // Handle failed payment
        const invoice = event.data.object as any
        console.log(`Payment failed for invoice ${invoice.id}`)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 })
  }
}
