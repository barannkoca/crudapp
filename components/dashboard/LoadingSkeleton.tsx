"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingSkeleton() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                </CardTitle>
                <div className="space-y-1">
                    <Skeleton className="h-4 w-64" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                                <div className="flex items-center gap-1">
                                    <Skeleton className="h-3 w-3 rounded-full" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-4 w-10" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
