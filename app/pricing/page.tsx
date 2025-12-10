"use client"

import { useState } from "react"  // Add this
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Crown, Check, Zap } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: 0,
    description: "For personal use",
    features: ["5 min limit", "Basic formats", "1 conversion/day"],
    popular: false,
    period: "month",
  },
  {
    name: "Basic",
    price: 30,
    description: "For small teams",
    features: ["30 min limit", "All formats", "Unlimited conversions", "Priority support"],
    popular: true,
    period: "month",
  },
  {
    name: "Premium",
    price: 100,
    description: "For professionals",
    features: ["Unlimited duration", "All formats", "Unlimited conversions", "API access", "Advanced analytics"],
    popular: false,
    period: "month",
  },
]

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [billingPeriod, setBillingPeriod] = useState("month")  // Add this line

  const handleSelectPlan = (plan: any) => {
    if (!session) {
      router.push("/login?redirect=/pricing")
      return
    }
    // TODO: Implement subscription logic later
    alert(`Selected ${plan.name} plan - TODO: Integrate payment`)
  }

  const yearlyPrices = plans.map(p => ({ ...p, price: Math.round(p.price * 12 * 0.8) })) // 20% discount for year

  const currentPlans = billingPeriod === "year" ? yearlyPrices : plans

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-6xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold uppercase">Pricing</h1>
          <p className="text-sm text-white/60">Choose the plan that works for you.</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="bg-white/5 border border-white/10 rounded-full p-1 flex">
            <Button
              variant={billingPeriod === "month" ? "default" : "ghost"}
              className="px-6 py-2 rounded-full bg-white text-black"
              onClick={() => setBillingPeriod("month")}
            >
              Monthly
            </Button>
            <Button
              variant={billingPeriod === "year" ? "default" : "ghost"}
              className="px-6 py-2 rounded-full text-white hover:bg-white/10"
              onClick={() => setBillingPeriod("year")}
            >
              Yearly (Save 20%)
            </Button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentPlans.map((plan, idx) => (
            <Card key={plan.name} className="bg-white/5 border-white/10 relative overflow-hidden group flex flex-col h-full">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {plan.name === "Premium" ? <Crown className="w-8 h-8 text-yellow-400" /> : <Zap className="w-6 h-6 text-white/60" />}
                  {plan.popular && (
                    <Badge className="bg-yellow-500 text-black font-bold">
                      Most Popular
                    </Badge>
                  )}
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription className="text-white/60">{plan.description}</CardDescription>
                <div className="text-4xl font-bold text-white mt-4">
                  ${plan.price}
                  {billingPeriod === "year" && <span className="text-lg text-white/60">/year</span>}
                  {billingPeriod === "month" && <span className="text-lg text-white/60">/month</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex flex-col flex-grow">
                <ul className="space-y-2 flex-grow">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-center gap-2 text-white/80">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.popular ? "bg-white text-black hover:bg-white/90" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {session ? "Get Started" : "Sign In to Subscribe"}
                </Button>
                {!session && (
                  <p className="text-xs text-white/60 text-center">
                    <Link href="/login" className="underline hover:text-white">Sign in</Link> to continue
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-sm text-center text-white/60">
          <p>Not sure? Start with <Link href="/" className="underline hover:text-white">Free plan</Link></p>
        </div>
      </div>
    </div>
  )
}