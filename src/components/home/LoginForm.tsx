"use client";

import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setShowSuccess(true);
      setTimeout(() => router.push("/dash"), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("E-mail ou senha inválidos.");
        console.error("Login error:", err.message);
      } else {
        setError("Erro desconhecido ao fazer login.");
      }
    }
  }

  return (
    <>
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="animate-fadeIn bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg">
            Login Successful
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-semibold text-center">Entrar</h1>

        <input
          type="email"
          placeholder="E-mail"
          className="input"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          className="input"
          required
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        {error && (
          <p className="text-red-600 text-sm mt-[-4px] text-center">{error}</p>
        )}

        <button type="submit" className="btn-primary">
          Login
        </button>
      </form>
    </>
  );
}
