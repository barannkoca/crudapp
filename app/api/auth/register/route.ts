import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Gerekli alanları kontrol et
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Tüm alanları doldurun' },
        { status: 400 }
      );
    }

    // Şifre uzunluğunu kontrol et
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // MongoDB'ye bağlan
    try {
      await connectDB();
    } catch (error) {
      console.error('MongoDB bağlantı hatası:', error);
      return NextResponse.json(
        { error: 'Veritabanı bağlantısında hata oluştu' },
        { status: 500 }
      );
    }

    // Email kullanımda mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    try {
      const user = await User.create({
        email,
        name,
        password: hashedPassword,
        role: 'user'
      });

      return NextResponse.json({
        message: 'Kullanıcı başarıyla oluşturuldu',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
      });
    } catch (error: any) {
      console.error('Kullanıcı oluşturma hatası:', error);
      
      // MongoDB hata kodlarını kontrol et
      if (error.code === 11000) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kullanımda' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Kullanıcı oluşturulurken bir hata oluştu' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Genel hata:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 