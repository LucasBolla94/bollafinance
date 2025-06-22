"use client";

import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
      className="bg-white rounded-xl shadow p-4 mt-4 flex flex-col gap-3"
    >
      <h2 className="text-lg font-semibold text-green-600">Adicionar Income</h2>

      <input
        type="text"
        placeholder="Nome"
        className="input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="number"
        step="0.01"
        placeholder="Valor (£)"
        className="input"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <DatePicker
        selected={date}
        onChange={(d) => setDate(d)}
        className="input"
        dateFormat="dd/MM/yyyy"
        placeholderText="Data"
      />

      <textarea
        className="input"
        placeholder="Notas"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex justify-between mt-2">
        <button type="submit" className="btn-primary w-[48%]">
          Salvar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary w-[48%] text-center"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
