"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "./Auth-provider";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    user,
    loadingUser,
  } = useAuth();

  useEffect(() => {
    // Jangan melakukan apa-apa
    // selama Firebase masih mengecek session
    if (loadingUser) {
      return;
    }

    // Firebase sudah selesai mengecek
    // dan ternyata tidak ada user
    if (!user) {
      router.replace("/login");
    }
  }, [user, loadingUser, router]);

  // Firebase masih mengecek session
  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading...
        </p>
      </div>
    );
  }

  // Tidak ada user
  if (!user) {
    return null;
  }

  // Sudah login
  return <>{children}</>;
}
