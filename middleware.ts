import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// İzin verilen email adresleri
const ALLOWED_EMAILS = [
  'barannkoca@gmail.com',
  'turkuazgocdanismanlik@gmail.com'
];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Token yoksa erişim reddedilir
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Email kontrolü
    const userEmail = token.email as string;

    if (!ALLOWED_EMAILS.includes(userEmail)) {
      console.log(`🚫 Erişim reddedildi: ${userEmail}`);
      return NextResponse.redirect(new URL('/auth/access-denied', req.url));
    }

    console.log(`✅ Erişim izni verildi: ${userEmail}`);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        if (!token) return false;

        const userEmail = token.email as string;
        const isAllowed = ALLOWED_EMAILS.includes(userEmail);

        if (!isAllowed) {
          console.log(`🚫 Middleware: Erişim reddedildi - ${userEmail}`);
        }

        return isAllowed;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth pages (login, register, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|auth|signin|signup|register).*)",
  ],
}; 