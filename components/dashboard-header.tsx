"use client"

import { Bell, Search, Menu, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useSidebar } from "@/components/sidebar-context"
import { useState } from "react"

interface DashboardHeaderProps {
  user: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { toggleSidebar } = useSidebar()
  const [hasNotifications] = useState(true)

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-firm-black-950 via-firm-black-900 to-firm-black-950 border-b-2 border-firm-black-800 shadow-xl">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Mobile Menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden text-gray-400 hover:text-white hover:bg-firm-black-800"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Search Bar */}
          <div className="relative max-w-md w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search cases, quizzes, topics..."
              className="pl-10 bg-firm-black-800/50 border-firm-black-700 text-white placeholder:text-gray-500 focus:border-firm-red-600/50 focus:ring-firm-red-600/20"
            />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Action Button */}
          <Button
            size="sm"
            className="hidden sm:flex items-center gap-2 bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30"
          >
            <Zap className="w-4 h-4" />
            <span>Analyze Case</span>
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-firm-black-800 relative"
            >
              <Bell className="w-5 h-5" />
              {hasNotifications && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-firm-red-600 rounded-full ring-2 ring-firm-black-900 animate-pulse" />
              )}
            </Button>
          </div>

          {/* User Badge */}
          <Badge className="hidden sm:flex items-center gap-2 px-3 py-2 bg-firm-black-800 border-firm-black-700 text-white hover:border-firm-red-600/50 transition-colors cursor-pointer">
            <div className="w-6 h-6 bg-gradient-to-br from-firm-red-600 to-firm-red-700 rounded-full flex items-center justify-center text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="font-medium text-sm">
              {user?.email?.split("@")[0] || "User"}
            </span>
          </Badge>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="px-6 pb-4 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 bg-firm-black-800/50 border-firm-black-700 text-white placeholder:text-gray-500 focus:border-firm-red-600/50 focus:ring-firm-red-600/20"
          />
        </div>
      </div>
    </header>
  )
}
