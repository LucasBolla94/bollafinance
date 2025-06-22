"use client";

import { useState } from "react";
import IncomeForm from "./IncomeForm";
import ExpenseForm from "./ExpenseForm";

export default function AddButtons() {
  const [showIncome, setShowIncome] = useState(false);
  const [showExpense, setShowExpense] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setShowIncome(!showIncome)}
          className="btn-primary"
        >
          Adicionar Income
        </button>
        <button
          onClick={() => setShowExpense(!showExpense)}
          className="btn-secondary"
        >
          Adicionar Expense
        </button>
      </div>

      {showIncome && <IncomeForm onClose={() => setShowIncome(false)} />}
      {showExpense && <ExpenseForm onClose={() => setShowExpense(false)} />}
    </div>
  );
}
