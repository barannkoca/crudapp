"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function page() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Session yükleniyorsa bekle
    if (session) {
      redirect("/dashboard");
    } else {
      redirect("/auth/signin");
    }
  }, [session, status]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center min-h-[60vh]"
    >
      <div className="text-center">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-xl font-medium text-gray-700">Yükleniyor...</p>
        <p className="text-sm text-gray-500 mt-2">Lütfen bekleyin</p>
      </div>
    </motion.div>
  );
}