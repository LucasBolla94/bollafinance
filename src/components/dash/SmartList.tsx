"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { format } from "date-fns";

// Tipagem das entradas do Firestore
type Entry = {
  id: string;
  type: "income" | "expense";
  name: string;
  amount: number;
  date: Timestamp;
  notes?: string;
};

export default function SmartList() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [lastDocs, setLastDocs] = useState<Record<"income" | "expense", QueryDocumentSnapshot<DocumentData> | null>>({
    income: null,
    expense: null,
  });
  const [loading, setLoading] = useState(true);
  const [userUID, setUserUID] = useState<string | null>(null);

  const PAGE_SIZE = 5;

  // Escuta login do usuário para capturar UID
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user?.uid) setUserUID(user.uid);
    });
    return () => unsub();
  }, []);

  // Dispara carregamento ao ter o UID
  useEffect(() => {
    if (userUID) loadEntries(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userUID]);

  // Carrega entradas do Firestore (income e expense)
  async function loadEntries(firstLoad = false) {
    if (!userUID) return;
    setLoading(true);

    const types: ("income" | "expense")[] = ["income", "expense"];

    const fetches = await Promise.all(
      types.map((type) =>
        getDocs(
          query(
            collection(db, type === "income" ? "incomes" : "expenses"),
            where("owner", "==", userUID),
            orderBy("date", "desc"),
            ...(firstLoad || !lastDocs[type]
              ? [limit(PAGE_SIZE)]
              : [startAfter(lastDocs[type]!), limit(PAGE_SIZE)])
          )
        )
      )
    );

    const newEntries: Entry[] = [];

    fetches.forEach((snap, index) => {
      const type = types[index];
      const docs = snap.docs;

      if (docs.length > 0) {
        setLastDocs((prev) => ({ ...prev, [type]: docs[docs.length - 1] }));
      }

      docs.forEach((doc) => {
        const data = doc.data();
        if (
          typeof data.amount === "number" &&
          data.date instanceof Timestamp &&
          typeof data.name === "string"
        ) {
          newEntries.push({
            id: doc.id,
            type,
            name: data.name,
            amount: data.amount,
            date: data.date,
            notes: data.notes || "",
          });
        }
      });
    });

    const merged = firstLoad ? newEntries : [...entries, ...newEntries];
    merged.sort((a, b) => b.date.toMillis() - a.date.toMillis());

    setEntries(merged);
    setLoading(false);
  }

  return (
    <div className="mt-8 bg-white shadow-md rounded-lg w-full max-w-3xl mx-auto overflow-hidden">
      <h2 className="text-lg sm:text-xl font-bold text-center py-4 border-b bg-gray-50 text-gray-800">
        Recent Incomes & Expenses
      </h2>

      {/* Estado: lista vazia */}
      {entries.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-6">No transactions found.</p>
      )}

      {/* Lista de transações */}
      <ul className="divide-y">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 text-sm sm:text-base transition-all hover:bg-gray-50 ${
              entry.type === "income"
                ? "border-l-4 border-green-500"
                : "border-l-4 border-red-500"
            }`}
          >
            <div className="flex-1 pr-4">
              <p className="font-semibold text-gray-800 capitalize">
                {entry.name}
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    entry.type === "income"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {entry.type}
                </span>
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">
                {entry.notes || "No description"}
              </p>
            </div>

            <div className="text-right mt-2 sm:mt-0 sm:ml-4">
              <p
                className={`font-bold ${
                  entry.type === "income"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                £{entry.amount.toFixed(2)}
              </p>
              <p className="text-gray-400 text-xs">
                {format(entry.date.toDate(), "dd/MM/yyyy")}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Estado: carregando */}
      {loading && (
        <div className="py-4 text-center text-sm text-gray-500">Loading...</div>
      )}

      {/* Botão "Load More" */}
      {!loading && (
        <div className="text-center p-4">
          <button
            onClick={() => loadEntries(false)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
