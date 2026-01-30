"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle, Calendar, ArrowRight, Clock } from "lucide-react"

interface ExpiringOpportunity {
    _id: string;
    musteri: {
        ad: string;
        soyad: string;
        telefon?: string;
    };
    islem_turu: 'calisma_izni' | 'ikamet_izni' | 'diger';
    expirationDate: string;
    daysLeft: number;
}

export function ExpiringOpportunities() {
    const [opportunities, setOpportunities] = useState<ExpiringOpportunity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpiring = async () => {
            try {
                const res = await fetch('/api/opportunities/expiring');
                const data = await res.json();
                if (data.success) {
                    setOpportunities(data.data);
                }
            } catch (error) {
                console.error('Error fetching expiring opportunities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExpiring();
    }, []);

    if (loading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Yaklaşan Bitiş Tarihleri
                    </CardTitle>
                    <CardDescription>Yükleniyor...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (opportunities.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                        <Clock className="h-5 w-5" />
                        Yaklaşan Bitiş Tarihleri
                    </CardTitle>
                    <CardDescription>
                        Yakın zamanda süresi dolacak işlem bulunmuyor.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="h-full border-l-4 border-l-red-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    Yaklaşan Bitiş Tarihleri
                </CardTitle>
                <CardDescription>
                    Önümüzdeki 2 ay içinde süresi dolacak {opportunities.length} işlem var
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {opportunities.map((opp) => (
                        <div key={opp._id} className="flex items-center justify-between p-2 border rounded-lg bg-red-50/50 hover:bg-red-50 transition-colors">
                            <div className="space-y-1">
                                <div className="font-medium text-sm flex items-center gap-2">
                                    {opp.musteri?.ad} {opp.musteri?.soyad}
                                    <Badge variant="outline" className="text-[10px] px-1 h-5 bg-white">
                                        {opp.islem_turu === 'calisma_izni' && 'Çalışma'}
                                        {opp.islem_turu === 'ikamet_izni' && 'İkamet'}
                                        {opp.islem_turu === 'diger' && 'Diğer'}
                                    </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(opp.expirationDate).toLocaleDateString('tr-TR')}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Badge variant={opp.daysLeft < 30 ? "destructive" : "secondary"} className={`text-[10px] px-1 h-5 ${opp.daysLeft >= 30 ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : ""}`}>
                                    {opp.daysLeft} gün
                                </Badge>
                                <Button asChild size="sm" variant="ghost" className="h-5 text-[10px] px-1">
                                    <Link href={`/customers/${(opp.musteri as any)._id || '#'}`}>
                                        Detay <ArrowRight className="ml-1 h-2 w-2" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
