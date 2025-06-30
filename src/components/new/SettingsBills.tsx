"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

type Bill = {
  id: string;
  name: string;
  amount: number;
  date: string;
  recurrence: string;
};

export default function SettingsBills() {
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(collection(db, "bills"), where("owner", "==", user.uid));
        const unsub = onSnapshot(q, (snap) => {
          const list: Bill[] = snap.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              amount: data.amount,
              date: new Date(data.date.seconds * 1000).toLocaleDateString(),
              recurrence: data.recurrence,
            };
          });
          setBills(list);
        });
        return () => unsub();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "bills", id));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Your Bills</h2>

      {bills.length === 0 ? (
        <p className="text-gray-500">No bills registered.</p>
      ) : (
        <ul className="divide-y">
          {bills.map((bill) => (
            <li key={bill.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-700">{bill.name}</p>
                <p className="text-sm text-gray-500">
                  £{bill.amount.toFixed(2)} | {bill.date} | {bill.recurrence}
                </p>
              </div>
              <button
                onClick={() => handleDelete(bill.id)}
                className="text-red-600 hover:text-red-800 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
