import BalanceCards from "@/components/dash/BalanceCards";
import AddButtons from "@/components/dash/AddButtons";
import SmartList from "@/components/dash/SmartList";
import Chart from "@/components/dash/Chart";

export default function DashPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col gap-6">
      {/* Título e introdução */}
      <header className="text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-1">
          Financial Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Monitor and manage your incomes and expenses easily.
        </p>
      </header>

      {/* Gráfico interativo */}
      <section className="w-full animate-fadeIn">
        <Chart />
      </section>

      {/* Cards com saldos semanais/mensais */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
        <BalanceCards />
      </section>

      {/* Botões de ação (Add Income/Expense) */}
      <section className="bg-white p-4 rounded-lg shadow-md animate-fadeIn">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h2>
        <AddButtons />
      </section>

      {/* Lista inteligente com entradas recentes */}
      <section className="animate-fadeIn">
        <SmartList />
      </section>
    </main>
  );
}
