"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  FileText,
  Brain,
  BarChart3,
  MessageSquare,
  Calendar,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  Scale,
  Zap,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/sidebar-context"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/dashboard/cases", label: "Cases", icon: FileText },
  { href: "/dashboard/quizzes", label: "Quizzes", icon: Brain },
  { href: "/dashboard/mock-tests", label: "Mock Tests", icon: BarChart3 },
  { href: "/dashboard/tutor", label: "AI Tutor", icon: MessageSquare },
  { href: "/dashboard/planner", label: "Planner", icon: Calendar },
]

const bottomNavItems = [
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/pricing", label: "Upgrade", icon: Crown },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
        const { data: profileData } = await supabase
          .from("profiles")
          .select("subscription_tier, full_name")
          .eq("id", authUser.id)
          .single()
        if (profileData) {
          setProfile(profileData)
        }
      }
    }
    loadUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const subscriptionTier = profile?.subscription_tier || "free"
  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || "User"
  const userEmail = user?.email || ""

  return (
    <aside
      className={cn(
        "bg-gradient-to-b from-firm-black-950 via-firm-black-900 to-firm-black-950 border-r-2 border-firm-black-800 h-screen flex flex-col transition-all duration-300 ease-in-out shadow-2xl relative",
        isCollapsed ? "w-20" : "w-72",
        "z-50"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 z-50 w-6 h-6 bg-firm-red-600 hover:bg-firm-red-700 rounded-full flex items-center justify-center shadow-lg shadow-firm-red-600/50 transition-all duration-300 border-2 border-firm-black-800"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-white" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-white" />
        )}
      </button>

      {/* Logo/Brand Section */}
      <div className="p-6 border-b-2 border-firm-black-800">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="p-2.5 bg-firm-red-600 rounded-xl shadow-lg shadow-firm-red-600/30 group-hover:shadow-firm-red-600/50 transition-all">
            <Scale className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white tracking-tight">
                FIRM <span className="text-firm-red-500">AI</span>
              </span>
              <span className="text-xs text-gray-500 font-medium">Legal Intelligence</span>
            </div>
          )}
        </Link>
      </div>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="px-4 py-6 border-b-2 border-firm-black-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-firm-red-600 to-firm-red-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-firm-red-600/30">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
          </div>
          <Badge className="w-full justify-center bg-firm-red-600/20 hover:bg-firm-red-600/30 text-firm-red-500 border-firm-red-600/30 font-bold uppercase tracking-wide">
            <Crown className="w-3 h-3 mr-1" />
            {subscriptionTier}
          </Badge>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-firm-black-700 scrollbar-track-firm-black-900">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-firm-red-600 text-white shadow-lg shadow-firm-red-600/30"
                  : "text-gray-400 hover:text-white hover:bg-firm-black-800/50",
                isCollapsed && "justify-center px-3"
              )}
            >
              {/* Glow effect on hover */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-firm-red-600 to-firm-red-700 opacity-100" />
              )}
              
              <Icon className={cn(
                "w-5 h-5 relative z-10 flex-shrink-0",
                isActive ? "text-white" : "text-gray-500 group-hover:text-firm-red-500"
              )} />
              
              {!isCollapsed && (
                <span className={cn(
                  "relative z-10 font-semibold",
                  isActive && "text-white"
                )}>
                  {item.label}
                </span>
              )}

              {/* Active indicator */}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full relative z-10" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t-2 border-firm-black-800 space-y-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isUpgrade = item.label === "Upgrade"
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-firm-red-600 text-white shadow-lg shadow-firm-red-600/30"
                  : isUpgrade
                  ? "bg-gradient-to-r from-firm-red-600/20 to-firm-red-700/10 text-firm-red-500 border-2 border-firm-red-600/30 hover:border-firm-red-600/50"
                  : "text-gray-400 hover:text-white hover:bg-firm-black-800/50",
                isCollapsed && "justify-center px-3"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive 
                  ? "text-white" 
                  : isUpgrade 
                  ? "text-firm-red-500" 
                  : "text-gray-500 group-hover:text-firm-red-500"
              )} />
              
              {!isCollapsed && (
                <span className={cn(
                  "font-semibold",
                  isUpgrade && "text-firm-red-500"
                )}>
                  {item.label}
                </span>
              )}

              {isUpgrade && !isCollapsed && (
                <Zap className="ml-auto w-4 h-4 text-firm-red-500" />
              )}
            </Link>
          )
        })}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-400 hover:text-firm-red-500 hover:bg-firm-red-600/10 transition-all duration-200",
            isCollapsed && "justify-center px-3"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-semibold">Logout</span>}
        </button>
      </div>

      {/* Collapsed User Avatar */}
      {isCollapsed && (
        <div className="px-3 py-4 border-t-2 border-firm-black-800">
          <div className="w-full aspect-square bg-gradient-to-br from-firm-red-600 to-firm-red-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-firm-red-600/30">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
    </aside>
  )
}
