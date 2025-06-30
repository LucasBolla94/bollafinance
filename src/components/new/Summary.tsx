'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { addDays } from 'date-fns';

export default function Summary() {
  const [name, setName] = useState('');
  const [walletTotal, setWalletTotal] = useState(0);
  const [projected7Days, setProjected7Days] = useState(0);
  const [missingToGreen, setMissingToGreen] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    let incomeUnsub: () => void;
    let expenseUnsub: () => void;

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setName(user.displayName || 'User');
        const uid = user.uid;

        const qIncome = query(collection(db, 'incomes'), where('user', '==', uid));
        const qExpense = query(collection(db, 'expenses'), where('user', '==', uid));

        const next7days = Timestamp.fromDate(addDays(new Date(), 7));

        let latestIncome = 0;
        let latestExpense = 0;
        let projected = 0;

        incomeUnsub = onSnapshot(qIncome, (snap) => {
          latestIncome = 0;
          projected = 0;
          snap.forEach((doc) => {
            const data = doc.data();
            const amount = parseFloat(data.amount || 0);
            const date = data.date?.toDate?.();
            latestIncome += amount;

            if (date && date <= next7days.toDate()) {
              projected += amount;
            }
          });

          setProjected7Days(projected);
          setWalletTotal(latestIncome - latestExpense);
          setMissingToGreen(Math.max(0, latestExpense - latestIncome));
        });

        expenseUnsub = onSnapshot(qExpense, (snap) => {
          latestExpense = 0;
          snap.forEach((doc) => {
            latestExpense += parseFloat(doc.data().amount || 0);
          });

          setWalletTotal(latestIncome - latestExpense);
          setMissingToGreen(Math.max(0, latestExpense - latestIncome));
        });
      }
    });

    return () => {
      unsubscribe();
      if (incomeUnsub) incomeUnsub();
      if (expenseUnsub) expenseUnsub();
    };
  }, []);

  if (!hasMounted) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 space-y-4 text-center">
      <h2 className="text-xl font-semibold text-gray-800">
        👋 Welcome, <span className="text-blue-600">{name}</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm sm:text-base">
        <div className="bg-green-50 rounded-lg p-4 shadow-inner">
          <p className="font-bold text-green-700 text-sm">💼 Wallet Balance</p>
          <p className="text-2xl font-extrabold text-green-600">
            £{walletTotal.toFixed(2)}
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 shadow-inner">
          <p className="font-bold text-blue-700 text-sm">📅 Projected (7 Days)</p>
          <p className="text-2xl font-extrabold text-blue-600">
            £{projected7Days.toFixed(2)}
          </p>
        </div>

        <div className="bg-red-50 rounded-lg p-4 shadow-inner">
          <p className="font-bold text-red-700 text-sm">📉 Missing to Green</p>
          <p className="text-2xl font-extrabold text-red-600">
            £{missingToGreen.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
