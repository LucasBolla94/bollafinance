"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import Image from "next/image";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"; // Heroicons

type Company = {
  id: string;
  name: string;
  img: string;
};

export default function AddCompanyForm() {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editing, setEditing] = useState<Company | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(collection(db, "company"), where("user", "==", user.uid));
        const unsub = onSnapshot(q, (snap) => {
          const list = snap.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            img: doc.data().img,
          }));
          setCompanies(list);
        });
        return () => unsub();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) setPreview(URL.createObjectURL(selected));
    else setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !auth.currentUser) return;

    setLoading(true);
    try {
      let imgURL = editing?.img || "";
      const user = auth.currentUser;

      if (file) {
        const storageRef = ref(storage, `companies/${user.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        imgURL = await getDownloadURL(snapshot.ref);
      }

      if (editing) {
        await updateDoc(doc(db, "company", editing.id), {
          name,
          img: imgURL,
        });
        setEditing(null);
      } else {
        await addDoc(collection(db, "company"), {
          name,
          img: imgURL,
          user: user.uid,
          date: Timestamp.now(),
        });
      }

      setName("");
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error("Error saving company:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: Company) => {
    setEditing(company);
    setName(company.name);
    setPreview(company.img);
    setFile(null);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "company", id));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 space-y-8">
      <h2 className="text-lg font-semibold text-gray-800">
        {editing ? "Edit Company" : "Add Company"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Company Name"
          className="w-full p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border rounded p-2"
        />

        {preview && (
          <div className="w-full flex justify-center">
            <Image
              src={preview}
              alt="Preview"
              width={150}
              height={150}
              className="rounded-lg object-cover mt-2"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
          disabled={loading}
        >
          {loading ? "Saving..." : editing ? "Update Company" : "Add Company"}
        </button>
      </form>

      <div>
        <h3 className="text-md font-semibold text-gray-700 mb-3">
          Your Companies
        </h3>
        {companies.length === 0 ? (
          <p className="text-gray-500">No companies registered.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="group bg-white border rounded-lg p-4 shadow hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
              >
                <Image
                  src={company.img}
                  alt={company.name}
                  width={100}
                  height={100}
                  className="rounded-full object-cover border"
                />
                <p className="mt-3 font-semibold text-gray-800">{company.name}</p>
                <div className="flex gap-4 mt-4 opacity-80 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleEdit(company)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                  >
                    <PencilIcon className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                  >
                    <TrashIcon className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
