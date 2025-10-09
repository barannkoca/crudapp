'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
// Recharts kaldırıldı - Chart.js kullanıyoruz

// Chart.js bileşenleri
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartJSTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar as ChartJSBar, Pie as ChartJSPie, Line as ChartJSLine } from 'react-chartjs-2';

// Chart.js kayıt
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartJSTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface AnalyticsData {
  overview: {
    totalCustomers: number;
    totalOpportunities: number;
    totalUsers: number;
  };
  opportunitiesByType: Array<{ _id: string; count: number }>;
  opportunitiesByStatus: Array<{ _id: string; count: number }>;
  genderDistribution: Array<{ _id: string; count: number }>;
  countryDistribution: Array<{ _id: string; count: number }>;
  monthlyStats: Array<{ _id: { year: number; month: number }; count: number }>;
}

interface RevenueData {
  revenueStats: Array<{ _id: { currency: string; paymentStatus: string }; totalAmount: number; count: number }>;
  monthlyRevenue: Array<{ _id: { year: number; month: number; currency: string; paymentStatus: string }; totalAmount: number }>;
  revenueByType: Array<{ _id: { islemTuru: string; currency: string }; totalAmount: number; count: number }>;
  pendingPayments: Array<{ _id: string; totalAmount: number; count: number }>;
  monthlyDetailedRevenue: Array<{ 
    _id: { 
      year: number; 
      month: number; 
      islem_turu: string; 
      odeme_durumu: string; 
      currency: string 
    }; 
    totalAmount: number; 
    count: number 
  }>;
}

interface MonthlyRevenueData {
  monthlyData: Array<{
    year: number;
    month: number;
    monthName: string;
    totalRevenue: number;
    receivedAmount: number;
    expenseAmount: number;
    netRevenue: number;
    pendingPayments: number;
    byType: { [key: string]: { total: number; received: number; expense: number; net: number } };
  }>;
  summary: {
    totalRevenue: number;
    totalReceived: number;
    totalExpense: number;
    totalNet: number;
    totalPending: number;
  };
}

interface CustomerData {
  customerRegistrationTrend: Array<{ _id: { year: number; month: number }; count: number }>;
  genderDistribution: Array<{ _id: string; count: number }>;
  countryDistribution: Array<{ _id: string; count: number }>;
  mostActiveCustomers: Array<{ _id: string; ad: string; soyad: string; opportunityCount: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<MonthlyRevenueData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'customers'>('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setOverviewError(null);
      setCustomersError(null);
      const [overviewRes, revenueRes, monthlyRevenueRes, customersRes] = await Promise.all([
        fetch('/api/analytics/overview'),
        fetch('/api/analytics/revenue'),
        fetch('/api/analytics/monthly-revenue'),
        fetch('/api/analytics/customers')
      ]);

      const [overview, revenue, monthlyRevenue, customers] = await Promise.all([
        overviewRes.json(),
        revenueRes.json(),
        monthlyRevenueRes.json(),
        customersRes.json()
      ]);

      if (overview.success) setAnalyticsData(overview.data); else setOverviewError('Genel Bakış verileri getirilemedi.');
      if (revenue.success) {
        console.log('Revenue data:', revenue.data);
        setRevenueData(revenue.data);
      }
      if (monthlyRevenue.success) {
        console.log('Monthly revenue data:', monthlyRevenue.data);
        setMonthlyRevenueData(monthlyRevenue.data);
      }
      if (customers.success) setCustomerData(customers.data); else setCustomersError('Müşteri Analizi verileri getirilemedi.');
    } catch (error) {
      console.error('Analytics data fetch error:', error);
      if (!analyticsData) setOverviewError('Genel Bakış verileri yüklenemedi.');
      if (!customerData) setCustomersError('Müşteri Analizi verileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency === 'TRY' ? 'TRY' : currency === 'USD' ? 'USD' : 'EUR'
    }).format(amount);
  };

  const formatMonth = (month: number) => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[month - 1];
  };

  // Aylık veri için tüm işlem türlerini birleştir (eksik aylarda 0 doldurmak için)
  const allMonthlyTypes = monthlyRevenueData
    ? Array.from(
        new Set(
          monthlyRevenueData.monthlyData.flatMap((m) => Object.keys(m.byType || {}))
        )
      )
    : [];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📊 Analitik Dashboard</h1>
        <p className="text-gray-600">İş verilerinizin kapsamlı analizi</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'overview', label: 'Genel Bakış', icon: '📈' },
          { key: 'revenue', label: 'Gelir Analizi', icon: '💰' },
          { key: 'customers', label: 'Müşteri Analizi', icon: '👥' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {!analyticsData ? (
            <Card>
              <CardHeader>
                <CardTitle>Genel Bakış</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {overviewError || 'Henüz veri bulunamadı.'}
                </p>
              </CardContent>
            </Card>
          ) : (
          <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  👥 Toplam Müşteri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {analyticsData.overview.totalCustomers.toLocaleString('tr-TR')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  📋 Toplam İşlem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {analyticsData.overview.totalOpportunities.toLocaleString('tr-TR')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  👤 Kullanıcı Sayısı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {analyticsData.overview.totalUsers.toLocaleString('tr-TR')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* İşlem Türü Dağılımı */}
            <Card>
              <CardHeader>
                <CardTitle>İşlem Türü Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartJSPie
                    data={{
                      labels: analyticsData.opportunitiesByType.map(item => 
                        item._id === 'calisma_izni' ? 'Çalışma İzni' :
                        item._id === 'ikamet_izni' ? 'İkamet İzni' : 'Diğer İşlemler'
                      ),
                      datasets: [{
                        data: analyticsData.opportunitiesByType.map(item => item.count),
                        backgroundColor: COLORS,
                        borderWidth: 2,
                        borderColor: '#fff'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Durum Dağılımı */}
            <Card>
              <CardHeader>
                <CardTitle>İşlem Durumu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartJSBar
                    data={{
                      labels: analyticsData.opportunitiesByStatus.map(item => 
                        item._id === 'beklemede' ? 'Beklemede' :
                        item._id === 'islemde' ? 'İşlemde' :
                        item._id === 'onaylandi' ? 'Onaylandı' :
                        item._id === 'reddedildi' ? 'Reddedildi' :
                        item._id === 'tamamlandi' ? 'Tamamlandı' : 'İptal Edildi'
                      ),
                      datasets: [{
                        label: 'İşlem Sayısı',
                        data: analyticsData.opportunitiesByStatus.map(item => item.count),
                        backgroundColor: COLORS,
                        borderColor: COLORS,
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cinsiyet Dağılımı */}
            <Card>
              <CardHeader>
                <CardTitle>Müşteri Cinsiyet Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartJSPie
                    data={{
                      labels: analyticsData.genderDistribution.map(item => item._id),
                      datasets: [{
                        data: analyticsData.genderDistribution.map(item => item.count),
                        backgroundColor: ['#FF6384', '#36A2EB'],
                        borderWidth: 2,
                        borderColor: '#fff'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Aylık Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Aylık İşlem Trendi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartJSLine
                    data={{
                      labels: analyticsData.monthlyStats.map(item => 
                        `${formatMonth(item._id.month)} ${item._id.year}`
                      ),
                      datasets: [{
                        label: 'İşlem Sayısı',
                        data: analyticsData.monthlyStats.map(item => item.count),
                        borderColor: '#36A2EB',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        tension: 0.4,
                        fill: true
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          </>
          )}
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && monthlyRevenueData && (
        <div className="space-y-8">
          {/* Gelir Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  💰 Toplam Gelir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(monthlyRevenueData.summary.totalRevenue, 'TRY')}
                </div>
                <p className="text-sm text-gray-600 mt-1">Anlaşılan toplam ücret</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  ✅ Alınan Ödeme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(monthlyRevenueData.summary.totalReceived, 'TRY')}
                </div>
                <p className="text-sm text-gray-600 mt-1">Tahsil edilen miktar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-purple-600">
                  📈 Net Gelir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {formatCurrency(monthlyRevenueData.summary.totalNet, 'TRY')}
                </div>
                <p className="text-sm text-gray-600 mt-1">Alınan - Gider</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-600">
                  ⏳ Bekleyen Ödeme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {formatCurrency(monthlyRevenueData.summary.totalPending, 'TRY')}
                </div>
                <p className="text-sm text-gray-600 mt-1">Tahsil edilecek miktar</p>
              </CardContent>
            </Card>
          </div>

          {/* Aylık Gelir Trendi */}
          <Card>
            <CardHeader>
              <CardTitle>Aylık Gelir Trendi</CardTitle>
              <CardDescription>Son 12 ayın detaylı gelir analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartJSLine
                  data={{
                    labels: monthlyRevenueData.monthlyData.map(month => 
                      `${month.monthName} ${month.year}`
                    ),
                    datasets: [
                      {
                        label: 'Toplam Gelir',
                        data: monthlyRevenueData.monthlyData.map(month => month.totalRevenue),
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: false
                      },
                      {
                        label: 'Alınan Ödeme',
                        data: monthlyRevenueData.monthlyData.map(month => month.receivedAmount),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: false
                      },
                      {
                        label: 'Net Gelir',
                        data: monthlyRevenueData.monthlyData.map(month => month.netRevenue),
                        borderColor: '#8B5CF6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.4,
                        fill: false
                      },
                      {
                        label: 'Bekleyen Ödeme',
                        data: monthlyRevenueData.monthlyData.map(month => month.pendingPayments),
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: false
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return formatCurrency(value as number, 'TRY');
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* İşlem Türü Bazında Aylık Analiz */}
          <Card>
            <CardHeader>
              <CardTitle>İşlem Türü Bazında Aylık Analiz</CardTitle>
              <CardDescription>Her işlem türü için aylık gelir dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartJSBar
                  data={{
                    labels: monthlyRevenueData.monthlyData.map(month => 
                      `${month.monthName} ${month.year}`
                    ),
                    datasets: allMonthlyTypes.map((type, index) => ({
                      label: type === 'calisma_izni' ? 'Çalışma İzni' :
                             type === 'ikamet_izni' ? 'İkamet İzni' : 'Diğer İşlemler',
                      data: monthlyRevenueData.monthlyData.map(month => 
                        month.byType[type]?.net || 0
                      ),
                      backgroundColor: COLORS[index % COLORS.length],
                      borderColor: COLORS[index % COLORS.length],
                      borderWidth: 1
                    }))
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return formatCurrency(value as number, 'TRY');
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Aylık Detaylı Tablo */}
          <Card>
            <CardHeader>
              <CardTitle>Aylık Detaylı Rapor</CardTitle>
              <CardDescription>Her ay için detaylı gelir analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Ay</th>
                      <th className="text-right p-3 font-medium">Toplam Gelir</th>
                      <th className="text-right p-3 font-medium">Alınan</th>
                      <th className="text-right p-3 font-medium">Gider</th>
                      <th className="text-right p-3 font-medium">Net Gelir</th>
                      <th className="text-right p-3 font-medium">Bekleyen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyRevenueData.monthlyData.map((month, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">
                          {month.monthName} {month.year}
                        </td>
                        <td className="p-3 text-right text-blue-600 font-medium">
                          {formatCurrency(month.totalRevenue, 'TRY')}
                        </td>
                        <td className="p-3 text-right text-green-600 font-medium">
                          {formatCurrency(month.receivedAmount, 'TRY')}
                        </td>
                        <td className="p-3 text-right text-red-600 font-medium">
                          {formatCurrency(month.expenseAmount, 'TRY')}
                        </td>
                        <td className="p-3 text-right text-purple-600 font-bold">
                          {formatCurrency(month.netRevenue, 'TRY')}
                        </td>
                        <td className="p-3 text-right text-orange-600 font-medium">
                          {formatCurrency(month.pendingPayments, 'TRY')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-8">
          {!customerData ? (
            <Card>
              <CardHeader>
                <CardTitle>Müşteri Analizi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {customersError || 'Henüz veri bulunamadı.'}
                </p>
              </CardContent>
            </Card>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* En Aktif Müşteriler */}
            <Card>
              <CardHeader>
                <CardTitle>En Aktif Müşteriler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customerData.mostActiveCustomers.map((customer, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">
                          {customer.ad} {customer.soyad}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {customer.opportunityCount} işlem
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ülke Dağılımı */}
            <Card>
              <CardHeader>
                <CardTitle>Ülke Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartJSBar
                    data={{
                      labels: customerData.countryDistribution.map(item => item._id),
                      datasets: [{
                        label: 'Müşteri Sayısı',
                        data: customerData.countryDistribution.map(item => item.count),
                        backgroundColor: COLORS,
                        borderColor: COLORS,
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          )}
        </div>
      )}
    </div>
  );
}
