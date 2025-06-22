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
      className="bg-white rounded-xl shadow-md p-4 mt-4 flex flex-col gap-4 max-w-md mx-auto w-full"
    >
      <h2 className="text-lg font-semibold text-green-600 text-center">
        Adicionar Income
      </h2>

      {/* Campo: Nome */}
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Nome
        </label>
        <input
          id="name"
          type="text"
          placeholder="Ex: Salário, Freelancer"
          className="input"
          inputMode="text"
          autoCapitalize="words"
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Campo: Valor */}
      <div className="flex flex-col gap-1">
        <label htmlFor="amount" className="text-sm font-medium text-gray-700">
          Valor (£)
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

      {/* Campo: Data */}
      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm font-medium text-gray-700">
          Data
        </label>
        <DatePicker
          selected={date}
          onChange={(d) => setDate(d)}
          className="input"
          dateFormat="dd/MM/yyyy"
          placeholderText="Selecionar data"
          showPopperArrow={false}
          maxDate={new Date()}
          id="date"
        />
      </div>

      {/* Campo: Notas */}
      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium text-gray-700">
          Notas
        </label>
        <textarea
          id="notes"
          className="input min-h-[80px] resize-none"
          placeholder="Informações adicionais (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button type="submit" className="btn-primary w-full sm:w-1/2">
          Salvar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary w-full sm:w-1/2"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
