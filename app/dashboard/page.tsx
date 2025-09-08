"use client"

import { useEffect, useState } from "react"
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
  User,
  FileText,
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function Page() {
  const [stats, setStats] = useState({
    customers: {
      total: 0,
      recentlyAdded: 0
    },
    opportunities: {
      total: 0,
      byStatus: {},
      byType: {},
      recentlyAdded: 0
    },
    payments: {
      totalRevenue: 0,        // Toplam anlaşılan ücret
      receivedAmount: 0,      // Alınan ödeme miktarı
      expenseAmount: 0,       // Gider miktarı
      netRevenue: 0,          // Net gelir (alınan - gider)
      pendingPayments: 0      // Bekleyen ödemeler (toplam - alınan)
    }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Paralel olarak tüm istatistikleri çek
      const [customerStats, opportunityStats, paymentStats, activities] = await Promise.all([
        fetch('/api/customers/stats').then(res => res.json()),
        fetch('/api/opportunities/stats').then(res => res.json()),
        fetch('/api/opportunities/payment-stats').then(res => res.json()),
        fetch('/api/opportunities/recent').then(res => res.json())
      ]);

      // Payment stats'ı yeni sisteme göre işle
      const paymentData = paymentStats.data || {};
      
      setStats({
        customers: customerStats.data || { total: 0, recentlyAdded: 0 },
        opportunities: opportunityStats.data || { total: 0, byStatus: {}, byType: {}, recentlyAdded: 0 },
        payments: {
          totalRevenue: paymentData.totalRevenue || 0,
          receivedAmount: paymentData.receivedAmount || 0,
          expenseAmount: paymentData.expenseAmount || 0,
          netRevenue: paymentData.netRevenue || 0,
          pendingPayments: paymentData.pendingPayments || 0
        }
      });
      setRecentActivities(activities.data || []);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      toast.error('İstatistikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (status: string) => {
    return (stats.opportunities.byStatus as Record<string, number>)[status] || 0;
  };

  const getTypeCount = (type: string) => {
    return (stats.opportunities.byType as Record<string, number>)[type] || 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

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
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Müşteri</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.customers.total.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Son 7 günde {stats.customers.recentlyAdded} yeni müşteri
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Fırsat</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.opportunities.total.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Son 7 günde {stats.opportunities.recentlyAdded} yeni fırsat
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan İşlemler</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : getStatusCount('tamamlandi').toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Beklemede: {getStatusCount('beklemede')} | İşlemde: {getStatusCount('islemde')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Gelir</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.payments.netRevenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {loading ? '...' : formatCurrency(stats.payments.netRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Alınan: {formatCurrency(stats.payments.receivedAmount)} | Gider: {formatCurrency(stats.payments.expenseAmount)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Ödemeler</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {loading ? '...' : formatCurrency(stats.payments.pendingPayments)}
              </div>
              <p className="text-xs text-muted-foreground">
                <Link href="/bekleyen-odemeler" className="hover:underline text-blue-600">
                  Toplam: {formatCurrency(stats.payments.totalRevenue)} →
                </Link>
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
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <DollarSign className="h-5 w-5" />
                Bekleyen Ödemeler
              </CardTitle>
              <CardDescription>
                Ödeme bekleyen işlemlerin detayları
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Yükleniyor...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Bekleyen Tutar:</span>
                    <span className="text-lg font-bold text-orange-600">
                      {formatCurrency(stats.payments.pendingPayments)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ödenen Tutar:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(stats.payments.receivedAmount)}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <Button asChild variant="outline" className="w-full border-orange-600 text-orange-600 hover:bg-orange-50">
                      <Link href="/bekleyen-odemeler">
                        Bekleyen Ödemeleri Görüntüle
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* İkinci Satır - İşlem Türleri */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-700">
                <FileText className="h-5 w-5" />
                İkamet İzni
              </CardTitle>
              <CardDescription>
                İkamet izni fırsatlarını yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-700">
                <Link href="/ikamet-izni">
                  İkamet İzni Listesi
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-cyan-600 text-cyan-600 hover:bg-cyan-50">
                <Link href="/ikamet-izni/create">
                  Yeni İkamet İzni
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <ClipboardList className="h-5 w-5" />
                Diğer İşlemler
              </CardTitle>
              <CardDescription>
                Diğer işlem türlerini yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                <Link href="/diger-islemler">
                  İşlem Listesi
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50">
                <Link href="/diger-islemler/create">
                  Yeni İşlem
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
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Yükleniyor...</p>
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Henüz aktivite bulunmuyor</p>
                  </div>
                ) : (
                  recentActivities.map((activity: any, index: number) => (
                    <div key={activity.id || index} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.type === 'calisma_izni' && 'Çalışma İzni'}
                          {activity.type === 'ikamet_izni' && 'İkamet İzni'}
                          {activity.type === 'diger' && 'Diğer İşlem'}
                          {' '}{activity.status === 'tamamlandi' ? 'tamamlandı' : 'güncellendi'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.customerName} - {new Date(activity.updatedAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
