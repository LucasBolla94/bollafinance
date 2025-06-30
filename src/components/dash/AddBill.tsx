'use client';

import { useState } from 'react';
import {
  collection,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  FaMoneyBillWave,
  FaStickyNote,
  FaCalendarAlt,
  FaRegEdit,
} from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi'; // substituto para FaRepeat
import { v4 as uuidv4 } from 'uuid';

export default function AddBill({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [recurrence, setRecurrence] = useState('once');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      setError('You must be logged in to add a bill.');
      return;
    }

    if (!name.trim() || !amount || isNaN(parseFloat(amount))) {
      setError('Please fill in all required fields correctly.');
      return;
    }

    try {
      const recurrenceGroupId = uuidv4();

      await addDoc(collection(db, 'bills'), {
        owner: auth.currentUser.uid,
        name: name.trim(),
        amount: parseFloat(amount),
        date: Timestamp.fromDate(date || new Date()),
        recurrence,
        notes: notes.trim(),
        createdAt: Timestamp.now(),
        recurrenceGroupId,
      });

      setError('');
      onClose();
    } catch (err) {
      console.error('Failed to add bill:', err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fadeIn bg-white rounded-xl shadow-lg p-6 mt-6 max-w-md w-full mx-auto flex flex-col gap-5"
    >
      <h2 className="text-center text-xl font-bold text-blue-600 mb-2">
        <FaMoneyBillWave className="inline mr-2" />
        Add New Bill
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label htmlFor="name-b" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <FaRegEdit /> Name
        </label>
        <input
          id="name-b"
          type="text"
          inputMode="text"
          autoCapitalize="words"
          placeholder="Ex: Water Bill"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Amount */}
      <div className="flex flex-col gap-1">
        <label htmlFor="amount-b" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <FaMoneyBillWave /> Amount (£)
        </label>
        <input
          id="amount-b"
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

      {/* Date */}
      <div className="flex flex-col gap-1">
        <label htmlFor="date-b" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <FaCalendarAlt /> Date
        </label>
        <DatePicker
          selected={date}
          onChange={(d) => setDate(d)}
          className="input"
          dateFormat="dd/MM/yyyy"
          placeholderText="Select date"
          showPopperArrow={false}
          id="date-b"
        />
      </div>

      {/* Recurrence */}
      <div className="flex flex-col gap-1">
        <label htmlFor="recurrence-b" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <HiRefresh /> Recurrence
        </label>
        <select
          id="recurrence-b"
          className="input"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
        >
          <option value="once">Once</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="annually">Annually</option>
        </select>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1">
        <label htmlFor="notes-b" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <FaStickyNote /> Notes
        </label>
        <textarea
          id="notes-b"
          className="input min-h-[80px] resize-none"
          placeholder="Optional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button type="submit" className="btn-primary w-full sm:w-1/2">
          Save
        </button>
        <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-1/2">
          Cancel
        </button>
      </div>
    </form>
  );
}
