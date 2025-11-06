"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { 
  Crown, 
  User, 
  Mail, 
  Calendar,
  Clock,
  FileText,
  Brain,
  CheckCircle2,
  Settings,
  Bell,
  Shield,
  Download,
  LogOut,
  Loader2,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getCases } from "@/lib/supabase/client-actions"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    cases: 0,
    quizzes: 0,
    studyHours: 0,
  })
  const [formData, setFormData] = useState({
    name: "Law Student",
    email: "student@law.edu",
  })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    profileVisible: false,
    dataCollection: true,
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      
      if (authUser) {
        setUser(authUser)
        setFormData({
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || "Law Student",
          email: authUser.email || "",
        })

        // Get profile data
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }

        // Get stats
        try {
          const casesList = await getCases(authUser.id)
          setStats(prev => ({ ...prev, cases: casesList?.length || 0 }))
        } catch (err) {
          console.error("Error loading stats:", err)
        }
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase.auth.updateUser({
        data: { full_name: formData.name }
      })
      
      await supabase
        .from("profiles")
        .update({ full_name: formData.name })
        .eq("id", user.id)

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error("Error saving profile:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const subscriptionDetails = {
    free: {
      name: "Free Plan",
      icon: "🆓",
      color: "from-firm-black-700 to-firm-black-800",
      features: [
        "Upload up to 5 cases per month",
        "Access to basic flashcards",
        "2 mock tests per month",
        "Community forum access",
      ],
      nextBilling: "Always Free",
    },
    pro: {
      name: "Pro Plan",
      icon: "👑",
      color: "from-firm-red-600 to-firm-red-700",
      features: [
        "Unlimited case uploads",
        "Advanced AI analysis",
        "Unlimited mock tests",
        "AI-powered study recommendations",
        "Priority email support",
      ],
      nextBilling: "$9.99/month",
    },
    enterprise: {
      name: "Enterprise Plan",
      icon: "🏢",
      color: "from-firm-red-500 to-firm-red-600",
      features: [
        "Everything in Pro, plus:",
        "Unlimited team members",
        "Custom case templates",
        "Advanced reporting & analytics",
        "API access",
        "Dedicated account manager",
      ],
      nextBilling: "$49.99/month",
    },
  }

  const currentTier = profile?.subscription_tier || "free"
  const current = subscriptionDetails[currentTier as keyof typeof subscriptionDetails] || subscriptionDetails.free
  const accountCreated = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"

  if (loading) {
    return null
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-firm-black-950 via-firm-black-900 to-firm-black-950">
      <div className="p-6 md:p-8 space-y-8 max-w-[1800px] mx-auto">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-firm-red-600/20 bg-gradient-to-br from-firm-black-900 via-firm-black-800 to-firm-black-900 p-8 md:p-10">
          {/* Animated Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-firm-red-600/10 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-firm-red-600/20 rounded-2xl border-2 border-firm-red-600/30 shadow-lg shadow-firm-red-600/20">
                <User className="w-10 h-10 text-firm-red-500" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                  <span className="text-firm-red-500">Profile</span>
                </h1>
                <p className="text-lg text-gray-400 mt-2">
                  Manage your account, subscription, and preferences
                </p>
              </div>
            </div>
            
            <Badge className="bg-firm-black-800 text-gray-300 border-2 border-firm-red-600/30 px-4 py-2 text-sm font-bold">
              <Crown className="w-4 h-4 mr-2 text-firm-red-500" />
              {current.name}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="account" className="w-full space-y-6">
          <TabsList className="bg-firm-black-800/50 border-2 border-firm-black-700 p-1.5">
            <TabsTrigger 
              value="account" 
              className="data-[state=active]:bg-firm-red-600 data-[state=active]:text-white font-bold"
            >
              <User className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger 
              value="subscription" 
              className="data-[state=active]:bg-firm-red-600 data-[state=active]:text-white font-bold"
            >
              <Crown className="w-4 h-4 mr-2" />
              Subscription
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-firm-red-600 data-[state=active]:text-white font-bold"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
              <CardHeader className="border-b border-firm-black-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-firm-red-600/20 rounded-lg">
                    <User className="w-5 h-5 text-firm-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-white">Personal Information</CardTitle>
                    <CardDescription className="text-gray-500 mt-1">Update your profile details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold text-gray-300">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 border-2 border-firm-black-700 bg-firm-black-800 text-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-firm-red-600/30 focus-visible:border-firm-red-600/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-gray-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="pl-10 border-2 border-firm-black-700 bg-firm-black-900 text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-600">Email cannot be changed</p>
                </div>
                <Button 
                  onClick={handleSave}
                  disabled={saving || saved}
                  className="w-full bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30 h-11"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Saved!
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
              <CardHeader className="border-b border-firm-black-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-firm-red-600/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-firm-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-white">Account Statistics</CardTitle>
                    <CardDescription className="text-gray-500 mt-1">Your learning journey at a glance</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-5 border-2 border-firm-black-700 bg-firm-black-800/50 rounded-xl hover:border-firm-red-600/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-firm-red-600 to-firm-red-700 shadow-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Account Created</p>
                        <p className="font-bold text-white">{accountCreated}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-5 border-2 border-firm-black-700 bg-firm-black-800/50 rounded-xl hover:border-firm-red-600/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-firm-black-700 to-firm-black-800 border-2 border-firm-red-600/30 shadow-lg">
                        <Clock className="w-5 h-5 text-firm-red-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Total Study Hours</p>
                        <p className="font-bold text-white">{stats.studyHours} hours</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-5 border-2 border-firm-black-700 bg-firm-black-800/50 rounded-xl hover:border-firm-red-600/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-firm-red-600 to-firm-red-700 shadow-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Cases Analyzed</p>
                        <p className="font-bold text-white">{stats.cases}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-5 border-2 border-firm-black-700 bg-firm-black-800/50 rounded-xl hover:border-firm-red-600/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-firm-black-700 to-firm-black-800 border-2 border-firm-red-600/30 shadow-lg">
                        <Brain className="w-5 h-5 text-firm-red-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Quizzes Completed</p>
                        <p className="font-bold text-white">{stats.quizzes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card className={`border-2 border-firm-red-600/30 bg-gradient-to-br from-firm-red-600/5 via-firm-black-900 to-firm-black-900`}>
              <CardHeader className="border-b border-firm-black-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${current.color} shadow-lg`}>
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2 font-black text-white">
                        {current.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400 mt-1">Your current subscription plan</CardDescription>
                    </div>
                  </div>
                  <Badge className="px-3 py-1 bg-firm-red-600 text-white border-0 font-bold">
                    Active
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
              <CardHeader className="border-b border-firm-black-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-firm-red-600/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-firm-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-white">Plan Features</CardTitle>
                    <CardDescription className="text-gray-500 mt-1">Everything included in your plan</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {current.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-lg border-2 border-firm-black-700 bg-firm-black-800/50 hover:border-firm-red-600/50 transition-all">
                      <CheckCircle2 className="w-5 h-5 text-firm-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
              <CardHeader className="border-b border-firm-black-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-firm-red-600/20 rounded-lg">
                    <Crown className="w-5 h-5 text-firm-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-white">Billing</CardTitle>
                    <CardDescription className="text-gray-500 mt-1">Manage your subscription and billing</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-5 border-2 border-firm-black-700 bg-firm-black-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Next Billing Date</p>
                      <p className="font-bold text-white">{current.nextBilling}</p>
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30 h-11"
                  onClick={() => router.push("/dashboard/pricing")}
                >
                  {currentTier !== "free" ? (
                    <>
                      <Settings className="w-5 h-5 mr-2" />
                      Manage Subscription
                    </>
                  ) : (
                    <>
                      <Crown className="w-5 h-5 mr-2" />
                      Upgrade Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-2 border-firm-black-800 bg-gradient-to-br from-firm-black-900 to-firm-black-800">
              <CardHeader className="border-b border-firm-black-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-firm-red-600/20 rounded-lg">
                    <Bell className="w-5 h-5 text-firm-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-white">Privacy Settings</CardTitle>
                    <CardDescription className="text-gray-500 mt-1">Control your privacy and notifications</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-5 border-2 border-firm-black-700 bg-firm-black-800/50 rounded-xl hover:border-firm-red-600/50 transition-all">
                  <div className="flex items-center gap-3 flex-1">
                    <Bell className="w-5 h-5 text-firm-red-500" />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-white">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive study reminders and updates</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-5 border-2 border-firm-black-700 bg-firm-black-800/50 rounded-xl hover:border-firm-red-600/50 transition-all">
                  <div className="flex items-center gap-3 flex-1">
                    <Shield className="w-5 h-5 text-firm-red-500" />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-white">Profile Visibility</p>
                      <p className="text-xs text-gray-500">Allow other users to see your profile</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.profileVisible}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, profileVisible: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-5 border-2 border-firm-black-700 bg-firm-black-800/50 rounded-xl hover:border-firm-red-600/50 transition-all">
                  <div className="flex items-center gap-3 flex-1">
                    <Sparkles className="w-5 h-5 text-firm-red-500" />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-white">Data Collection</p>
                      <p className="text-xs text-gray-500">Help improve FIRM AI with usage data</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.dataCollection}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, dataCollection: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-firm-red-600/30 bg-gradient-to-br from-firm-red-600/5 via-firm-black-900 to-firm-black-900">
              <CardHeader className="border-b border-firm-black-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-firm-red-600/20 rounded-lg">
                    <Zap className="w-5 h-5 text-firm-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-white">Danger Zone</CardTitle>
                    <CardDescription className="text-gray-400 mt-1">Irreversible actions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-firm-black-700 bg-firm-black-800 text-white hover:bg-firm-black-700 h-11 font-bold"
                  onClick={() => {
                    // TODO: Implement data download
                    alert("Data download feature coming soon!")
                  }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download My Data
                </Button>
                <Button 
                  className="w-full bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30 h-11"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
