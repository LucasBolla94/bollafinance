import LoginForm from "@/components/home/LoginForm";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-center px-4 bg-gray-50">
      <LoginForm />

      <footer className="mt-10 text-center text-xs text-gray-500">
        Design By Bolla.Network
      </footer>
    </main>
  );
}
