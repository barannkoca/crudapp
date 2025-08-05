"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Briefcase, 
  FileCheck, 
  Building2, 
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle,
  Search,
  Plus,
  Bell,
  User
} from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 w-full">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Arama..."
              className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-3 text-sm"
            />
          </div>
          <Button size="icon" variant="ghost">
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <Bell className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 w-full">
        {/* Hoş Geldin Mesajı */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Hoş Geldiniz!</h1>
          <p className="text-muted-foreground">
            CRM uygulamanızın kontrol paneli. Müşterilerinizi ve fırsatlarınızı yönetin.
          </p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Müşteri</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +20.1% geçen aydan
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Fırsatlar</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                +12.3% geçen aydan
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan İzinler</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">456</div>
              <p className="text-xs text-muted-foreground">
                +8.2% geçen aydan
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₺45,231</div>
              <p className="text-xs text-muted-foreground">
                +15.4% geçen aydan
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hızlı Erişim */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Müşteri Yönetimi
              </CardTitle>
              <CardDescription>
                Müşterilerinizi görüntüleyin ve yeni müşteriler ekleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/customers">
                  Müşteri Listesi
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/customers/create">
                  Yeni Müşteri
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Fırsat Yönetimi
              </CardTitle>
              <CardDescription>
                Fırsatlarınızı görüntüleyin ve yeni fırsatlar oluşturun
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/ikamet-izni">
                  İkamet İzni
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/ikamet-izni/create">
                  Yeni İzin
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Son Aktiviteler - Full Width */}
        <div className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Son Aktiviteler</CardTitle>
              <CardDescription>
                Son yapılan işlemler ve güncellemeler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Yeni müşteri eklendi</p>
                    <p className="text-xs text-muted-foreground">Ahmet Yılmaz - 2 saat önce</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">İkamet izni fırsatı oluşturuldu</p>
                    <p className="text-xs text-muted-foreground">Fatma Demir - 4 saat önce</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Çalışma izni tamamlandı</p>
                    <p className="text-xs text-muted-foreground">Mehmet Kaya - 1 gün önce</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
