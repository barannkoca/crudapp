"use client";
import Link from "next/link";
import Image from 'next/image'
import {useState, useEffect} from'react';
import { signIn, signOut, useSession, getProviders } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        signOut({callbackUrl: "/"});
    };

    return (
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src="/file.svg"
                            width={32}
                            height={32}
                            alt="CrudApp Logo"
                            className="w-8 h-8"
                        />
                        <span className="text-xl font-semibold text-gray-900">CrudApp</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {session ? (
                            <>
                                <Link 
                                    href="/createform" 
                                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                                >
                                    Kayıt Oluştur
                                </Link>
                                <Link 
                                    href="/records" 
                                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                                >
                                    Kayıtları Gör
                                </Link>

                                <button 
                                    onClick={handleLogout} 
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium"
                                >
                                    Çıkış Yap
                                </button>
                            </>
                        ) : (
                            <Link 
                                href="/auth/signin"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                            >
                                Giriş Yap
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                            <svg
                                className="w-6 h-6 text-gray-600"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isMenuOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 space-y-4">
                        {session ? (
                            <>
                                <Link 
                                    href="/createform" 
                                    className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Kayıt Oluştur
                                </Link>
                                <Link href="/records">
                                    <Button variant="ghost">Kayıtları Gör</Button>
                                </Link>
                                <button 
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium"
                                >
                                    Çıkış Yap
                                </button>
                            </>
                        ) : (
                            <Link 
                                href="/auth/signin"
                                className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-center"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Giriş Yap
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}