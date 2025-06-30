"use client";

import { useState } from "react";
import Summary from "@/components/new/Summary";
import Chart from "@/components/dash/Chart"; // ✅ certifique-se de que o caminho esteja correto
import AddIncomeForm from "@/components/new/AddIncomeForm";
import AddExpenseForm from "@/components/new/AddExpenseForm";
import AddFixBillForm from "@/components/new/AddFixBillForm";
import SettingsBills from "@/components/new/SettingsBills";
import SmartList from "@/components/new/SmartList";
import AddCompanyForm from "@/components/new/AddCompanyForm";

export default function NewPage() {
  const [activeForm, setActiveForm] = useState<null | string>(null);

  const renderForm = () => {
    switch (activeForm) {
      case "income":
        return <AddIncomeForm />;
      case "expense":
        return <AddExpenseForm />;
      case "bill":
        return <AddFixBillForm />;
      case "settings":
        return <SettingsBills />;
      case "company":
        return <AddCompanyForm />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* ✅ Resumo do usuário */}
      <Summary />

      {/* ✅ Gráfico logo abaixo do resumo */}
      <Chart />

      {/* ✅ Botões de ação */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={() => setActiveForm("income")}
        >
          Add Income
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          onClick={() => setActiveForm("expense")}
        >
          Add Expense
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => setActiveForm("bill")}
        >
          Add Fix Bill
        </button>
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          onClick={() => setActiveForm("settings")}
        >
          Settings Bills
        </button>
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
          onClick={() => setActiveForm("company")}
        >
          Add Company
        </button>
      </div>

      {/* ✅ Renderiza o formulário ativo dinamicamente */}
      <div className="mt-4">{renderForm()}</div>

      {/* ✅ Lista inteligente de transações */}
      <SmartList />
    </div>
  );
}
