"use client";

import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaMoneyBillWave, FaStickyNote, FaCalendarAlt, FaRegEdit } from "react-icons/fa";

export default function IncomeForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    await addDoc(collection(db, "incomes"), {
      owner: auth.currentUser.uid,
      name,
      amount: parseFloat(amount),
      date: Timestamp.fromDate(date || new Date()),
      notes,
    });

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fadeIn bg-white rounded-xl shadow-lg p-6 mt-6 max-w-md w-full mx-auto flex flex-col gap-5"
    >
      <h2 className="text-center text-xl font-bold text-green-600 mb-2">
        <FaMoneyBillWave className="inline mr-2" />
        Add New Income
      </h2>

      {/* Nome */}
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm text-gray-700 font-medium flex items-center gap-2">
          <FaRegEdit /> Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Ex: Salary, Freelance Job"
          className="input"
          inputMode="text"
          autoCapitalize="words"
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Valor */}
      <div className="flex flex-col gap-1">
        <label htmlFor="amount" className="text-sm text-gray-700 font-medium flex items-center gap-2">
          <FaMoneyBillWave /> Amount (£)
        </label>
        <input
          id="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          className="input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      {/* Data */}
      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm text-gray-700 font-medium flex items-center gap-2">
          <FaCalendarAlt /> Date
        </label>
        <DatePicker
          selected={date}
          onChange={(d) => setDate(d)}
          className="input"
          dateFormat="dd/MM/yyyy"
          placeholderText="Select date"
          showPopperArrow={false}
          maxDate={new Date()}
          id="date"
        />
      </div>

      {/* Notas */}
      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm text-gray-700 font-medium flex items-center gap-2">
          <FaStickyNote /> Notes
        </label>
        <textarea
          id="notes"
          className="input min-h-[80px] resize-none"
          placeholder="Optional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button type="submit" className="btn-primary w-full sm:w-1/2">
          Save
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary w-full sm:w-1/2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
