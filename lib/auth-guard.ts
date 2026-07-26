import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

// İzin verilen email adresleri
const ALLOWED_EMAILS = [
  'barannkoca@gmail.com',
  'turnalargoc@gmail.com'
];

export async function checkAuthAccess() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return {
      allowed: false,
      error: 'Oturum bulunamadı'
    };
  }
  
  const userEmail = session.user.email;
  
  if (!ALLOWED_EMAILS.includes(userEmail)) {
    console.log(`🚫 API Erişim reddedildi: ${userEmail}`);
    return {
      allowed: false,
      error: 'Erişim yetkiniz bulunmamaktadır'
    };
  }
  
  console.log(`✅ API Erişim izni verildi: ${userEmail}`);
  return {
    allowed: true,
    user: session.user
  };
}

export function createAuthErrorResponse(message: string) {
  return NextResponse.json(
    { 
      error: message,
      code: 'ACCESS_DENIED'
    },
    { status: 403 }
  );
}
