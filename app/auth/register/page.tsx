"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Kayıt işlemi başarısız');
      }

      // Kayıt başarılı, giriş yap
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Giriş başarısız. Lütfen tekrar deneyin.');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        {/* Başlık */}
        <h2 className="text-2xl font-semibold text-gray-900 text-center">Kayıt Ol</h2>

        {/* Hata mesajı */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Kayıt Formu */}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="space-y-4">
            <input
              name="name"
              type="text"
              placeholder="Ad Soyad"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
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
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </div>
        </form>

        {/* Giriş Linki */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Zaten hesabın var mı?{" "}
          <Link href="/auth/signin" className="text-gray-900 hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
} 