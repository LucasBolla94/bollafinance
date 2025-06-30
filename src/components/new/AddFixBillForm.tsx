"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddFixBillForm() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [recurrence, setRecurrence] = useState("month");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !date) return;

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "bills"), {
        name,
        amount: parseFloat(amount),
        date: new Date(date),
        recurrence, // "week", "month", "year"
        owner: user.uid,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setName("");
      setAmount("");
      setDate("");
      setRecurrence("month");
    } catch (err) {
      console.error("Error saving bill:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md p-4 md:p-6 space-y-4"
    >
      <h2 className="text-lg font-semibold text-gray-800">Add Fix Bill</h2>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="Amount (£)"
          className="w-full p-2 border rounded"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <input
          type="date"
          className="w-full p-2 border rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <select
          className="w-full p-2 border rounded"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
        >
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Bill"}
      </button>

      {success && (
        <div className="text-green-600 text-sm text-center">Saved successfully!</div>
      )}
    </form>
  );
}
