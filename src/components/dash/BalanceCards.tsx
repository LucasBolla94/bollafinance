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

type DocSnap = QueryDocumentSnapshot<DocumentData>;
type TotalsRef = {
  incomeDocs: DocSnap[];
  expenseDocs: DocSnap[];
  incomeLoaded: boolean;
  expenseLoaded: boolean;
};

export default function BalanceCards() {
  const [weekTotal, setWeekTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [walletTotal, setWalletTotal] = useState(0);
  const [monthIncomeCount, setMonthIncomeCount] = useState(0);
  const [monthExpenseCount, setMonthExpenseCount] = useState(0);

  const totalsRef = useRef<TotalsRef>({
    incomeDocs: [],
    expenseDocs: [],
    incomeLoaded: false,
    expenseLoaded: false,
  });

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;

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

      return () => {
        unsubIncome();
        unsubExpense();
      };
    });

    return () => unsubAuth();
  }, []);

  function computeBalances() {
    const { incomeDocs, expenseDocs } = totalsRef.current;
    const now = new Date();
    const weekRange = {
      start: startOfWeek(now, { weekStartsOn: 0 }),
      end: endOfWeek(now, { weekStartsOn: 0 }),
    };
    const monthRange = { start: startOfMonth(now), end: endOfMonth(now) };

    const sumDocs = (docs: DocSnap[]) =>
      docs.reduce((acc, d) => acc + (d.data().amount || 0), 0);

    const filterByDate = (docs: DocSnap[], range: typeof monthRange) =>
      docs.filter((d) =>
        isWithinInterval((d.data().date as Timestamp).toDate(), range)
      );

    const weekIncome = sumDocs(filterByDate(incomeDocs, weekRange));
    const weekExpense = sumDocs(filterByDate(expenseDocs, weekRange));
    setWeekTotal(weekIncome - weekExpense);

    const monthIncomeDocs = filterByDate(incomeDocs, monthRange);
    const monthExpenseDocs = filterByDate(expenseDocs, monthRange);

    const monthIncome = sumDocs(monthIncomeDocs);
    const monthExpense = sumDocs(monthExpenseDocs);
    setMonthTotal(monthIncome - monthExpense);

    setMonthIncomeCount(monthIncomeDocs.length);
    setMonthExpenseCount(monthExpenseDocs.length);

    const totalIncome = sumDocs(incomeDocs);
    const totalExpense = sumDocs(expenseDocs);
    setWalletTotal(totalIncome - totalExpense);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 animate-fadeIn">
      <Card label="Weekly Balance" value={weekTotal} color="text-green-600" />
      <Card label="Monthly Balance" value={monthTotal} color="text-blue-600" />
      <Card label="Wallet Total" value={walletTotal} color="text-black" />
      <CardInfo
        label="Monthly Incomes"
        count={monthIncomeCount}
        color="bg-green-100 text-green-800"
      />
      <CardInfo
        label="Monthly Expenses"
        count={monthExpenseCount}
        color="bg-red-100 text-red-800"
      />
    </div>
  );
}

/* Card de valor monetário */
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
    <div className="bg-white p-4 rounded-lg shadow text-center border border-gray-100">
      <h2 className="text-sm text-gray-500 mb-1">{label}</h2>
      <p className={`text-xl font-bold ${color}`}>£{value.toFixed(2)}</p>
    </div>
  );
}

/* Card de contador de entradas */
function CardInfo({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className={`p-4 rounded-lg shadow text-center ${color}`}>
      <h2 className="text-sm font-medium">{label}</h2>
      <p className="text-xl font-bold">{count}</p>
    </div>
  );
}
