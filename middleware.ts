import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Rol bazlı erişim kontrolü için tip tanımı
type Role = "user" | "admin";

// Rol kontrolü için yardımcı fonksiyon
const hasRequiredRole = (userRole: string | undefined, requiredRole: Role): boolean => {
  if (requiredRole === "admin") {
    return userRole === "admin";
  }
  return userRole === "user" || userRole === "admin";
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Public routes - Herkesin erişebileceği rotalar
  const publicRoutes = [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/about",
    "/contact",
  ];
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // API route kontrolü
  if (path.startsWith("/api/")) {
    // Token kontrolü
    if (!token) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    // Admin-only API rotaları
    const adminOnlyApiRoutes = [
      "/api/admin",
      "/api/users",
      "/api/settings",
    ];
    if (adminOnlyApiRoutes.some(route => path.startsWith(route))) {
      if (!hasRequiredRole(token.role as string, "admin")) {
        return NextResponse.json(
          { error: "Bu işlem için admin yetkisi gerekiyor" },
          { status: 403 }
        );
      }
    }

    // Kullanıcı API rotaları
    const userApiRoutes = [
      "/api/records",
      "/api/profile",
    ];
    if (userApiRoutes.some(route => path.startsWith(route))) {
      if (!hasRequiredRole(token.role as string, "user")) {
        return NextResponse.json(
          { error: "Bu işlem için giriş yapmanız gerekiyor" },
          { status: 401 }
        );
      }
    }

    return NextResponse.next();
  }

  // Sayfa rotaları kontrolü
  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Admin-only sayfalar
  const adminOnlyPages = [
    "/admin",
    "/settings",
    "/users",
  ];
  if (adminOnlyPages.some(route => path.startsWith(route))) {
    if (!hasRequiredRole(token.role as string, "admin")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Kullanıcı sayfaları
  const userPages = [
    "/dashboard",
    "/profile",
    "/records",
  ];
  if (userPages.some(route => path.startsWith(route))) {
    if (!hasRequiredRole(token.role as string, "user")) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  return NextResponse.next();
}

// Middleware'in uygulanacağı rotalar
export const config = {
  matcher: [
    // API rotaları
    "/api/:path*",
    
    // Admin sayfaları
    "/admin/:path*",
    "/settings/:path*",
    "/users/:path*",
    
    // Kullanıcı sayfaları
    "/dashboard/:path*",
    "/profile/:path*",
    "/records/:path*",
    
    // Auth sayfaları hariç
    "/((?!auth|_next/static|_next/image|favicon.ico).*)",
  ]
}; 