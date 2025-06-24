"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { format } from "date-fns";

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
  const [loading, setLoading] = useState(true);
  const [userUID, setUserUID] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Entry>>({});

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user?.uid) setUserUID(user.uid);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!userUID) return;

    const types: ("income" | "expense")[] = ["income", "expense"];
    const unsubscribes: (() => void)[] = [];

    types.forEach((type) => {
      const q = query(
        collection(db, type === "income" ? "incomes" : "expenses"),
        where("owner", "==", userUID),
        orderBy("date", "desc")
      );

      const unsub = onSnapshot(q, (snap) => {
        const updatedEntries: Entry[] = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            type,
            name: data.name,
            amount: data.amount,
            date: data.date,
            notes: data.notes || "",
          };
        });

        setEntries((prev) => {
          const otherType = type === "income" ? "expense" : "income";
          const others = prev.filter((e) => e.type === otherType);
          return [...others, ...updatedEntries].sort((a, b) => b.date.toMillis() - a.date.toMillis());
        });
        setLoading(false);
      });

      unsubscribes.push(unsub);
    });

    return () => unsubscribes.forEach((u) => u());
  }, [userUID]);

  async function handleSave(id: string, type: "income" | "expense") {
    if (!editData.name || editData.amount === undefined) return;

    const ref = doc(db, type === "income" ? "incomes" : "expenses", id);
    await updateDoc(ref, {
      name: editData.name,
      amount: editData.amount,
      notes: editData.notes || "",
    });

    setEditId(null);
    setEditData({});
  }

  async function handleDelete(id: string, type: "income" | "expense") {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    await deleteDoc(doc(db, type === "income" ? "incomes" : "expenses", id));
  }

  return (
    <div className="mt-8 bg-white shadow-md rounded-lg w-full max-w-3xl mx-auto overflow-hidden">
      <h2 className="text-lg sm:text-xl font-bold text-center py-4 border-b bg-gray-50 text-gray-800">
        Recent Incomes & Expenses
      </h2>

      {entries.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-6">No transactions found.</p>
      )}

      <ul className="divide-y">
        {entries.map((entry) => {
          const isEditing = editId === entry.id;
          return (
            <li
              key={entry.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 text-sm sm:text-base transition-all hover:bg-gray-50 ${
                entry.type === "income"
                  ? "border-l-4 border-green-500"
                  : "border-l-4 border-red-500"
              }`}
            >
              <div className="flex-1 pr-4 space-y-1">
                {isEditing ? (
                  <>
                    <input
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={editData.name || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={editData.amount?.toString() || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          amount: parseFloat(e.target.value),
                        })
                      }
                    />
                    <textarea
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={editData.notes || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, notes: e.target.value })
                      }
                      rows={2}
                    />
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              <div className="text-right min-w-[90px] sm:min-w-[120px]">
                <p
                  className={`font-bold ${
                    entry.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  £{entry.amount.toFixed(2)}
                </p>
                <p className="text-gray-400 text-xs">
                  {format(entry.date.toDate(), "dd/MM/yyyy")}
                </p>
              </div>

              <div className="flex gap-2 mt-2 sm:mt-0">
                {isEditing ? (
                  <button
                    onClick={() => handleSave(entry.id, entry.type)}
                    className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditId(entry.id);
                      setEditData({
                        name: entry.name,
                        amount: entry.amount,
                        notes: entry.notes,
                      });
                    }}
                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(entry.id, entry.type)}
                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {loading && (
        <div className="py-4 text-center text-sm text-gray-500">Loading...</div>
      )}
    </div>
  );
}
