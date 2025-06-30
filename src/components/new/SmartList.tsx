"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  DocumentData,
} from "firebase/firestore";

type Entry = {
  id: string;
  name: string;
  amount: number;
  type: "income" | "expense" | "bill";
  date: Date;
  notes?: string;
};

export default function SmartList() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const uid = user.uid;

      const types = ["incomes", "expenses", "bills"];
      const allEntries: Entry[] = [];

      for (const type of types) {
        const q = query(
          collection(db, type),
          where("owner", "==", uid),
          orderBy("date", "desc"),
          limit(5)
        );
        const snap = await getDocs(q);
        snap.docs.forEach((doc) => {
          const data = doc.data();
          allEntries.push({
            id: doc.id,
            name: data.name,
            amount: data.amount,
            type: type.slice(0, -1) as Entry["type"],
            date: data.date?.toDate?.() || new Date(),
            notes: data.notes || "",
          });
        });
      }

      // Ordenar tudo por data desc
      allEntries.sort((a, b) => b.date.getTime() - a.date.getTime());

      setEntries(allEntries.slice(0, 10));
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Incomes, Expenses & Bills
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-500">No records found.</p>
      ) : (
        <ul className="divide-y">
          {entries.map((entry) => (
            <li key={entry.id} className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{entry.name}</p>
                  <p className="text-sm text-gray-500">
                    {entry.date.toLocaleDateString()} | {entry.type.toUpperCase()}
                    {entry.notes && ` | ${entry.notes}`}
                  </p>
                </div>
                <span
                  className={`font-bold ${
                    entry.type === "income"
                      ? "text-green-600"
                      : entry.type === "expense"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  £{entry.amount.toFixed(2)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
