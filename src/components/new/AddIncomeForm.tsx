"use client";

import { useEffect, useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

type Company = {
  id: string;
  name: string;
};

export default function AddIncomeForm() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);

  // 🔄 Carrega empresas do usuário autenticado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(collection(db, "company"), where("user", "==", user.uid));
        const unsub = onSnapshot(q, (snap) => {
          const list = snap.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          }));
          setCompanies(list);
        });
        return () => unsub();
      }
    });

    return () => unsubscribe();
  }, []);

  // 📸 Preview da imagem local
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  // ✅ Submete o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !date) return;

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);

    try {
      let imgUrl = "";

      // ⬆️ Upload da imagem no Storage
      if (imageFile) {
        const storageRef = ref(storage, `incomes/${user.uid}/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imgUrl = await getDownloadURL(snapshot.ref);
      }

      // 📝 Salva no Firestore com campo "user"
      await addDoc(collection(db, "incomes"), {
        name,
        amount: parseFloat(amount),
        date: new Date(date),
        company,
        notes,
        img: imgUrl || null,
        user: user.uid, // ✅ Agora com 'user'
        createdAt: serverTimestamp(),
      });

      // 🔄 Limpa o formulário
      setSuccess(true);
      setName("");
      setAmount("");
      setDate("");
      setCompany("");
      setNotes("");
      setImageFile(null);
      setPreviewUrl(null);

      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error("Error saving income:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md p-4 md:p-6 space-y-4 max-w-xl mx-auto"
    >
      <h2 className="text-xl font-bold text-gray-800 text-center">➕ Add Income</h2>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="Amount (£)"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <input
          type="date"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <select
          className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        >
          <option value="">Select Company (optional)</option>
          {companies.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Notes (optional)"
          className="w-full p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Income Picture (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 rounded p-2"
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="mt-2 rounded-lg max-h-40 object-cover mx-auto shadow"
            />
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition"
        disabled={loading}
      >
        {loading ? "Saving..." : "💾 Save Income"}
      </button>

      {success && (
        <div className="text-green-600 text-sm text-center font-medium mt-2">
          ✅ Saved successfully!
        </div>
      )}
    </form>
  );
}
