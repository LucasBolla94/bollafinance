"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";

/* ---------- tipos auxiliares ---------- */
type DocSnap = QueryDocumentSnapshot<DocumentData>;
type TotalsRef = {
  incomeDocs: DocSnap[];
  expenseDocs: DocSnap[];
  incomeLoaded: boolean;
  expenseLoaded: boolean;
};

export default function BalanceCards() {
  /* estados exibidos na UI */
  const [weekTotal, setWeekTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [walletTotal, setWalletTotal] = useState(0);

  /* mantém docs entre re-renders */
  const totalsRef = useRef<TotalsRef>({
    incomeDocs: [],
    expenseDocs: [],
    incomeLoaded: false,
    expenseLoaded: false,
  });

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) return; // sem usuário logado

      /* listener helper */
      const makeListener = (colName: "incomes" | "expenses") =>
        onSnapshot(
          query(collection(db, colName), where("owner", "==", user.uid)),
          (snap) => {
            if (colName === "incomes") {
              totalsRef.current.incomeDocs = snap.docs;
              totalsRef.current.incomeLoaded = true;
            } else {
              totalsRef.current.expenseDocs = snap.docs;
              totalsRef.current.expenseLoaded = true;
            }
            if (
              totalsRef.current.incomeLoaded &&
              totalsRef.current.expenseLoaded
            ) {
              computeBalances();
            }
          }
        );

      const unsubIncome = makeListener("incomes");
      const unsubExpense = makeListener("expenses");

      /* limpa listeners ao desmontar */
      return () => {
        unsubIncome();
        unsubExpense();
      };
    });

    return () => unsubAuth();
  }, []);

  /* ---------- cálculo principal ---------- */
  function computeBalances() {
    const { incomeDocs, expenseDocs } = totalsRef.current;

    const sumDocs = (docs: DocSnap[]) =>
      docs.reduce(
        (acc, d) =>
          acc + (typeof d.data().amount === "number" ? d.data().amount : 0),
        0
      );

    const totalIncome = sumDocs(incomeDocs);
    const totalExpense = sumDocs(expenseDocs);
    setWalletTotal(totalIncome - totalExpense);

    const now = new Date();

    /* ⬇️ semana de domingo (0) a sábado (6) */
    const weekRange = {
      start: startOfWeek(now, { weekStartsOn: 0 }),
      end: endOfWeek(now, { weekStartsOn: 0 }),
    };

    const monthRange = { start: startOfMonth(now), end: endOfMonth(now) };

    const sumWithin = (docs: DocSnap[], range: typeof weekRange) =>
      docs.reduce((acc, d) => {
        const ts = d.data().date as Timestamp;
        const dt = ts.toDate();
        return isWithinInterval(dt, range)
          ? acc + (d.data().amount as number)
          : acc;
      }, 0);

    const weekIncome = sumWithin(incomeDocs, weekRange);
    const weekExpense = sumWithin(expenseDocs, weekRange);
    setWeekTotal(weekIncome - weekExpense);

    const monthIncome = sumWithin(incomeDocs, monthRange);
    const monthExpense = sumWithin(expenseDocs, monthRange);
    setMonthTotal(monthIncome - monthExpense);
  }

  /* ---------- UI ---------- */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card label="Saldo da Semana" value={weekTotal} color="text-green-600" />
      <Card label="Saldo do Mês" value={monthTotal} color="text-blue-600" />
      <Card label="Total Carteira" value={walletTotal} color="text-black" />
    </div>
  );
}

/* card reutilizável */
function Card({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow text-center">
      <h2 className="text-sm text-gray-500">{label}</h2>
      <p className={`text-xl font-bold ${color}`}>£{value.toFixed(2)}</p>
    </div>
  );
}
