'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { format, isThisWeek, isThisMonth } from 'date-fns';
import { onAuthStateChanged } from 'firebase/auth';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type DailyData = {
  [date: string]: {
    income: number;
    expense: number;
  };
};

export default function Chart() {
  const [uid, setUid] = useState<string | null>(null);
  const [dailyData, setDailyData] = useState<DailyData>({});
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [clientReady, setClientReady] = useState(false); // evita hydration

  // Só ativa no client
  useEffect(() => {
    setClientReady(true);
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return () => unsub();
  }, []);

  // 🔁 Fetch de incomes/expenses
  useEffect(() => {
    if (!uid) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [incomeSnap, expenseSnap] = await Promise.all([
          getDocs(query(collection(db, 'incomes'), where('user', '==', uid))),
          getDocs(query(collection(db, 'expenses'), where('user', '==', uid))),
        ]);

        const temp: DailyData = {};

        incomeSnap.forEach((doc) => {
          const data = doc.data();
          const date = (data.date as Timestamp)?.toDate?.();
          if (!date) return;
          const isValid = (period === 'week' && isThisWeek(date)) || (period === 'month' && isThisMonth(date));
          if (!isValid) return;
          const dateStr = format(date, 'dd/MM');
          if (!temp[dateStr]) temp[dateStr] = { income: 0, expense: 0 };
          temp[dateStr].income += parseFloat(data.amount || 0);
        });

        expenseSnap.forEach((doc) => {
          const data = doc.data();
          const date = (data.date as Timestamp)?.toDate?.();
          if (!date) return;
          const isValid = (period === 'week' && isThisWeek(date)) || (period === 'month' && isThisMonth(date));
          if (!isValid) return;
          const dateStr = format(date, 'dd/MM');
          if (!temp[dateStr]) temp[dateStr] = { income: 0, expense: 0 };
          temp[dateStr].expense += parseFloat(data.amount || 0);
        });

        setDailyData(temp);
      } catch (err) {
        console.error('🔥 Chart Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid, period]);

  const labels = Object.keys(dailyData).sort((a, b) => {
    const [dayA, monthA] = a.split('/').map(Number);
    const [dayB, monthB] = b.split('/').map(Number);
    return new Date(2025, monthA - 1, dayA).getTime() - new Date(2025, monthB - 1, dayB).getTime();
  });

  const incomeData = labels.map((d) => dailyData[d].income);
  const expenseData = labels.map((d) => dailyData[d].expense);

  if (!clientReady || !uid) {
    return null; // Evita render SSR até tudo estar certo
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl p-4 shadow-md mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          📈 Financial Overview
          <span className="text-sm text-gray-500">
            ({period === 'week' ? 'This Week' : 'This Month'})
          </span>
        </h2>
        <select
          className="mt-2 sm:mt-0 px-3 py-2 rounded border border-gray-300 text-sm bg-white shadow-sm"
          value={period}
          onChange={(e) => setPeriod(e.target.value as 'week' | 'month')}
        >
          <option value="week">📅 This Week</option>
          <option value="month">🗓️ This Month</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">📊 Loading chart...</p>
      ) : (
        <div className="relative w-full h-[360px] sm:h-[400px]">
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: '💸 Incomes (£)',
                  data: incomeData,
                  backgroundColor: 'rgba(34,197,94,0.6)',
                  borderColor: 'rgba(34,197,94,1)',
                  borderWidth: 1,
                },
                {
                  label: '💰 Expenses (£)',
                  data: expenseData,
                  backgroundColor: 'rgba(239,68,68,0.6)',
                  borderColor: 'rgba(239,68,68,1)',
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '#333',
                    font: { size: 12 },
                    padding: 12,
                    usePointStyle: true,
                  },
                },
              },
              scales: {
                x: {
                  ticks: { color: '#333', font: { size: 11 } },
                  grid: { display: false },
                },
                y: {
                  ticks: { color: '#333', font: { size: 11 } },
                  grid: { color: 'rgba(0,0,0,0.05)' },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
