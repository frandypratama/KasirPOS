"use client"
import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import { auth } from "@/lib/firebase";

function Signin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      console.log("Login berhasil:", user);

      // Redirect setelah berhasil login
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

      switch (error.code) {
        case "auth/invalid-credential":
          setError("Email atau password salah.");
          break;

        case "auth/user-not-found":
          setError("User tidak ditemukan.");
          break;

        case "auth/wrong-password":
          setError("Password salah.");
          break;

        case "auth/invalid-email":
          setError("Format email tidak valid.");
          break;

        case "auth/user-disabled":
          setError("Akun ini telah dinonaktifkan.");
          break;

        case "auth/too-many-requests":
          setError(
            "Terlalu banyak percobaan login. Coba lagi nanti."
          );
          break;

        default:
          setError(
            "Login gagal. Silakan periksa email dan password."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center ">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-lg bg-white shadow-sm"
      >
        {/* HEADER */}
        <div className="border-b-2 border-b-[#e6eeff] pb-4 pt-8 text-center">
          <h2 className="text-3xl font-bold text-[#102b88]">
            Full Stack POS
          </h2>

          <p className="text-sm text-[#454642]">
            Terminal Authentication
          </p>
        </div>

        {/* FORM */}
        <div className="flex flex-col gap-4 p-8 text-[#121c2a]">
          
          {/* EMAIL */}
          <div className="flex flex-col gap-1">
            <label
              className="text-sm"
              htmlFor="email"
            >
              Email
            </label>

            <div className="flex flex-row items-center gap-2 rounded-lg bg-[#c5c5d4] px-2 py-2">
              <User size={20} />

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full bg-transparent outline-none placeholder:text-slate-500 focus:ring-0"
                disabled={loading}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-row justify-between text-sm">
              <label htmlFor="password">
                Password
              </label>

              <button
                type="button"
                className="text-blue-700 hover:underline"
                onClick={() => {
                  // nanti bisa dibuat reset password
                  console.log("Forgot password");
                }}
              >
                Forgot password?
              </button>
            </div>

            <div className="flex flex-row items-center gap-2 rounded-lg bg-[#c5c5d4] px-2 py-2">
              <Lock size={20} />

              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full bg-transparent outline-none placeholder:text-slate-500 focus:ring-0"
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full cursor-pointer justify-center gap-1 rounded-lg bg-blue-900 py-2 font-bold text-white transition duration-300 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              "Signing in..."
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Signin;