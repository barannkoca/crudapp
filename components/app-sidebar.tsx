"use client"

import * as React from "react"
import { 
  Users, 
  FileText, 
  Building2, 
  UserPlus, 
  PlusCircle, 
  Home,
  Settings,
  LogOut,
  Briefcase,
  FileCheck,
  Calendar,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Navigation data
const navigationData = {
  navMain: [
    {
      title: "Ana Sayfa",
      url: "/dashboard",
      icon: Home,
      items: []
    },
    {
      title: "Müşteriler",
      url: "/customers",
      icon: Users,
      items: [
        {
          title: "Müşteri Listesi",
          url: "/customers",
        },
        {
          title: "Yeni Müşteri",
          url: "/customers/create",
        },
      ],
    },
    {
      title: "Fırsatlar",
      url: "#",
      icon: Briefcase,
      items: [
        {
          title: "İkamet İzni",
          url: "/ikamet-izni",
        },
        {
          title: "Çalışma İzni",
          url: "/calisma-izni",
        },
        {
          title: "Diğer İşlemler",
          url: "/diger-islemler",
        },
      ],
    },
    {
      title: "İzinler",
      url: "#",
      icon: FileCheck,
      items: [
        {
          title: "İkamet İzni Oluştur",
          url: "/ikamet-izni/create",
        },
        {
          title: "Çalışma İzni Oluştur",
          url: "/calisma-izni/create",
        },
        {
          title: "Diğer İşlem Oluştur",
          url: "/diger-islemler/create",
        },
      ],
    },
    {
      title: "Analitik",
      url: "/analytics",
      icon: BarChart3,
      items: [],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(url)
  }

  const isSubItemActive = (url: string) => {
    return pathname === url
  }

  return (
    <Sidebar {...props} className="h-screen bg-sidebar text-sidebar-foreground" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <FileText className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">CRUD App</span>
                  <span className="text-xs">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navigationData.navMain.map((item) => {
              const IconComponent = item.icon
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} className="font-medium">
                      <IconComponent className="size-4" />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isSubItemActive(subItem.url)}>
                            <Link href={subItem.url}>{subItem.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
        
        {/* Alt Menü */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/settings">
                  <Settings className="size-4" />
                  Ayarlar
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/api/auth/signout">
                  <LogOut className="size-4" />
                  Çıkış
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
