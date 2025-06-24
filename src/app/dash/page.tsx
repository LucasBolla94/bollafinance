import BalanceCards from "@/components/dash/BalanceCards";
import AddButtons from "@/components/dash/AddButtons";
import SmartList from "@/components/dash/SmartList";

export default function DashPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center sm:text-left">
        Financial Dashboard
      </h1>

      {/* Cards com saldos */}
      <BalanceCards />

      {/* Ações: Adicionar Income/Expense */}
      <section className="mt-2 mb-8">
        <AddButtons />
      </section>

      {/* Lista inteligente com paginação */}
      <section className="mt-4">
        <SmartList />
      </section>
    </main>
  );
}
