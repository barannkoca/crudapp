"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccessDeniedPage() {
  const { data: session } = useSession();

  useEffect(() => {
    // 5 saniye sonra otomatik çıkış yap
    const timer = setTimeout(() => {
      signOut({ callbackUrl: "/auth/signin" });
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <CardTitle className="text-xl font-semibold text-red-600">
            Erişim Reddedildi
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Bu uygulamaya erişim yetkiniz bulunmamaktadır.
          </p>
          
          {session?.user?.email && (
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Giriş yapan kullanıcı:</p>
              <p className="font-medium text-gray-700">{session.user.email}</p>
            </div>
          )}
          
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>İzin verilen email adresleri:</strong>
            </p>
            <ul className="text-sm text-yellow-700 mt-1">
              <li>• barannkoca@gmail.com</li>
              <li>• turkuazgocdanismanlik@gmail.com</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-500">
            5 saniye sonra otomatik olarak çıkış yapılacaktır.
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="flex-1"
            >
              Şimdi Çıkış Yap
            </Button>
            <Button
              onClick={() => window.history.back()}
              className="flex-1"
            >
              Geri Dön
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
