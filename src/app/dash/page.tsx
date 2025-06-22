import BalanceCards from "@/components/dash/BalanceCards";
import AddButtons from "@/components/dash/AddButtons";

export default function DashPage() {
  return (
    <main className="min-h-screen p-4 bg-gray-100">
      <h1 className="text-xl font-semibold mb-4">Painel Financeiro</h1>

      <BalanceCards />

      <AddButtons />
    </main>
  );
}
