// app/profile/page.tsx (Updated file)
"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Check, Crown, Zap } from "lucide-react"

const freeFeatures = ["5 min limit", "Basic formats", "1 conversion/day"];
const basicFeatures = ["30 min limit", "All formats", "Unlimited conversions", "Priority support"];
const premiumFeatures = ["Unlimited duration", "All formats", "Unlimited conversions", "API access", "Advanced analytics"];

export default function ProfilePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen bg-black text-white">Loading...</div>
  }
  if (!session) {
    redirect("/login")
  }

  const subscription = session.user?.subscription || "free";
  const features = subscription === "basic" ? basicFeatures : subscription === "premium" ? premiumFeatures : freeFeatures;

  const getIcon = () => {
    if (subscription === "premium") return <Crown className="w-8 h-8 text-yellow-400" />;
    if (subscription === "basic") return <Zap className="w-6 h-6 text-blue-400" />;
    return <User className="w-6 h-6 text-white/60" />;
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Your Profile</h1>
          <p className="text-xl text-white/60">Manage your account and subscription.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info Card */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">Personal Information</CardTitle>
              <CardDescription className="text-white/60">Your account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {session.user?.image && (
                <div className="flex justify-center">
                  <img
                    src={session.user.image}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full border border-white/20"
                  />
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-white/80">Name</h3>
                  <p className="text-white">{session.user?.name || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-white/80">Email</h3>
                  <p className="text-white">{session.user?.email}</p>
                </div>
              </div>
              <Button asChild className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link href="/profile/edit">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="bg-white/5 border-white/10 relative overflow-hidden group">
            {subscription !== "free" && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black font-bold">
                {subscription.charAt(0).toUpperCase() + subscription.slice(1)}
              </Badge>
            )}
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {getIcon()}
              </div>
              <CardTitle className="capitalize">{subscription}</CardTitle>
              <CardDescription className="text-white/60">Your current plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-white/80">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-white text-black hover:bg-white/90"
                onClick={() => redirect("/pricing")}
              >
                {subscription === "free" ? "Upgrade Plan" : "Manage Subscription"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button asChild variant="ghost" className="text-white/60 hover:text-white">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}