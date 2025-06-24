'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { format, isThisWeek, isThisMonth } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface DailyData {
  [date: string]: {
    income: number;
    expense: number;
  };
}

export default function Chart() {
  const [dailyData, setDailyData] = useState<DailyData>({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const uid = user.uid;

      const [incomeSnap, expenseSnap] = await Promise.all([
        getDocs(query(collection(db, 'incomes'), where('owner', '==', uid))),
        getDocs(query(collection(db, 'expenses'), where('owner', '==', uid))),
      ]);

      const tempData: DailyData = {};

      incomeSnap.forEach((doc) => {
        const data = doc.data();
        const date = (data.date as Timestamp).toDate();

        if ((period === 'week' && isThisWeek(date)) || (period === 'month' && isThisMonth(date))) {
          const dateStr = format(date, 'dd/MM');
          if (!tempData[dateStr]) tempData[dateStr] = { income: 0, expense: 0 };
          tempData[dateStr].income += data.amount;
        }
      });

      expenseSnap.forEach((doc) => {
        const data = doc.data();
        const date = (data.date as Timestamp).toDate();

        if ((period === 'week' && isThisWeek(date)) || (period === 'month' && isThisMonth(date))) {
          const dateStr = format(date, 'dd/MM');
          if (!tempData[dateStr]) tempData[dateStr] = { income: 0, expense: 0 };
          tempData[dateStr].expense += data.amount;
        }
      });

      setDailyData(tempData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [period]);

  const labels = Object.keys(dailyData).sort((a, b) => {
    const [dayA, monthA] = a.split('/').map(Number);
    const [dayB, monthB] = b.split('/').map(Number);
    return new Date(2025, monthA - 1, dayA).getTime() - new Date(2025, monthB - 1, dayB).getTime();
  });

  const incomeData = labels.map((d) => dailyData[d].income);
  const expenseData = labels.map((d) => dailyData[d].expense);

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl p-4 shadow mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Financial Overview ({period === 'week' ? 'This Week' : 'This Month'})</h2>
        <select
          className="mt-2 sm:mt-0 px-3 py-1 rounded border border-gray-300 text-sm"
          value={period}
          onChange={(e) => setPeriod(e.target.value as 'week' | 'month')}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading chart...</p>
      ) : (
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: 'Incomes (£)',
                data: incomeData,
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1,
              },
              {
                label: 'Expenses (£)',
                data: expenseData,
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
                labels: { color: 'gray' },
              },
            },
            scales: {
              x: {
                ticks: { color: '#333' },
                grid: { display: false },
              },
              y: {
                ticks: { color: '#333' },
                grid: { color: 'rgba(0,0,0,0.05)' },
              },
            },
          }}
        />
      )}
    </div>
  );
}
