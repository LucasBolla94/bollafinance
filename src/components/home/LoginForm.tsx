"use client";

import { useState, useEffect, FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  // 📥 Estados dos inputs
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  // ⚠️ Estados de feedback
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // ✅ Controla renderização no client (evita erro de hydration)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Evita renderização no lado do servidor
  if (!hydrated) return null;

  // 🧠 Submissão do formulário de login
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setShowSuccess(true);
      setTimeout(() => router.push("/dash"), 1500);
    } catch (err: unknown) {
      console.error("Login error:", err);
      if (err instanceof Error) {
        setError("E-mail ou senha inválidos.");
      } else {
        setError("Erro inesperado ao fazer login.");
      }
    }
  }

  return (
    <>
      {/* ✅ Mensagem de sucesso */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="animate-fadeIn bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg">
            Login Successful
          </div>
        </div>
      )}

      {/* 🧾 Formulário de login */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md flex flex-col gap-4 animate-fadeIn"
        aria-label="Login Form"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Entrar
        </h1>

        {/* 📧 Campo: E-mail */}
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="E-mail"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="E-mail"
        />

        {/* 🔒 Campo: Senha */}
        <input
          type="password"
          inputMode="text"
          autoComplete="current-password"
          placeholder="Senha"
          className="input"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
          aria-label="Senha"
        />

        {/* ❌ Mensagem de erro */}
        {error && (
          <p
            className="text-red-600 text-sm mt-[-4px] text-center"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* 🔘 Botão de login */}
        <button
          type="submit"
          className="btn-primary w-full py-3 rounded-lg text-white font-semibold text-base"
        >
          Login
        </button>
      </form>
    </>
  );
}
