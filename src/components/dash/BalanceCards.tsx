"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export default function BalanceCards() {
  const [weekTotal, setWeekTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [walletTotal, setWalletTotal] = useState(0);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    async function fetchData() {
      const now = new Date();

      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const getTotal = async (type: "incomes" | "expenses", start?: Date, end?: Date) => {
        const col = collection(db, type);
        let q = query(col, where("owner", "==", uid));
        if (start && end) {
          q = query(col, where("owner", "==", uid), where("date", ">=", start), where("date", "<=", end));
        }
        const snap = await getDocs(q);
        return snap.docs.reduce((acc, doc) => acc + Number(doc.data().amount || 0), 0);
      };

      const weekIncome = await getTotal("incomes", weekStart, weekEnd);
      const weekExpense = await getTotal("expenses", weekStart, weekEnd);
      setWeekTotal(weekIncome - weekExpense);

      const monthIncome = await getTotal("incomes", monthStart, monthEnd);
      const monthExpense = await getTotal("expenses", monthStart, monthEnd);
      setMonthTotal(monthIncome - monthExpense);

      const totalIncome = await getTotal("incomes");
      const totalExpense = await getTotal("expenses");
      setWalletTotal(totalIncome - totalExpense);
    }

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <h2 className="text-sm text-gray-500">Saldo da Semana</h2>
        <p className="text-xl font-bold text-green-600">£{weekTotal.toFixed(2)}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <h2 className="text-sm text-gray-500">Saldo do Mês</h2>
        <p className="text-xl font-bold text-blue-600">£{monthTotal.toFixed(2)}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <h2 className="text-sm text-gray-500">Total da Carteira</h2>
        <p className="text-xl font-bold text-black">£{walletTotal.toFixed(2)}</p>
      </div>
    </div>
  );
}
