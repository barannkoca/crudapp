"use client";

import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Email/şifre ile giriş
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Google ile giriş
  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      setError('Google ile giriş yapılırken bir hata oluştu.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        {/* Başlık */}
        <h2 className="text-2xl font-semibold text-gray-900 text-center">Giriş Yap</h2>

        {/* Hata mesajı */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Giriş Formu */}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="E-posta"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <input
              name="password"
              type="password"
              placeholder="Şifre"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>

        {/* Alternatif Giriş */}
        <div className="mt-4 flex space-x-4 justify-center space-y-2">
          {/* Google butonu */}
          <button 
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition"
          >
            <FcGoogle className="h-6 w-6" />
          </button>

          {/* GitHub butonu */}
          <button 
            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition"
            disabled
          >
            <FaGithub className="h-6 w-6" />
          </button>
        </div>

        {/* Kayıt Linki */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Hesabın yok mu?{" "}
          <Link href="/auth/register" className="text-gray-900 hover:underline">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}