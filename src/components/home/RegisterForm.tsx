'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();

  // Estados do formulário
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    allowPromotions: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.acceptTerms) {
      setError('You must accept the Terms of Service.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      // Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      // Atualiza nome no perfil
      await updateProfile(user, {
        displayName: `${form.name} ${form.lastName}`,
      });

      // Salva no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: form.name,
        lastName: form.lastName,
        email: form.email,
        acceptTerms: true,
        allowPromotions: form.allowPromotions,
        createdAt: serverTimestamp(),
      });

      router.push('/dash'); // redireciona após login
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-4 mt-6">
      <h2 className="text-2xl font-bold text-center text-gray-800">Create your account</h2>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="flex flex-col space-y-1">
        <label className="text-sm text-gray-600">Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="input"
          placeholder="John"
          autoComplete="given-name"
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-sm text-gray-600">Last Name</label>
        <input
          type="text"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          required
          className="input"
          placeholder="Doe"
          autoComplete="family-name"
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-sm text-gray-600">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="input"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-sm text-gray-600">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="input"
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-sm text-gray-600">Re-type Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          className="input"
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="acceptTerms"
          checked={form.acceptTerms}
          onChange={handleChange}
          required
        />
        <label className="text-sm text-gray-700">
          I accept the <a href="#" className="text-blue-600 underline">Terms of Service</a>
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="allowPromotions"
          checked={form.allowPromotions}
          onChange={handleChange}
        />
        <label className="text-sm text-gray-700">
          I want to receive news, tips and promotions.
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition duration-300"
      >
        {loading ? 'Creating account...' : 'Register'}
      </button>
    </form>
  );
}
