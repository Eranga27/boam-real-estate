'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function VerifyEmail({ params }: { params: { token: string } }) {
  const [message, setMessage] = useState({ text: 'Verifying your email...', type: 'info' });
  const { login } = useAuth();
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const verify = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/auth/verify-email/${params.token}`);
        const data = await res.json();

        if (data.success) {
          setMessage({ text: 'Email verified successfully! Redirecting...', type: 'success' });
          login(data.user, data.token);
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setMessage({ text: data.message || 'Verification failed. The token may be invalid or expired.', type: 'error' });
        }
      } catch (err) {
        setMessage({ text: 'An error occurred during verification. Please try again later.', type: 'error' });
      }
    };

    verify();
  }, [params.token, login, router]);

  return (
    <main className="flex-1 flex items-center justify-center py-20 px-4 bg-light-gray min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <h1 className="text-2xl font-bold text-primary mb-4">Email Verification</h1>
        <div className={`p-4 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' :
          message.type === 'error' ? 'bg-red-50 text-red-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {message.text}
        </div>
      </motion.div>
    </main>
  );
}
