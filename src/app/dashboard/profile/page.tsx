'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Camera, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        mobileNumber: user.mobileNumber || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/v1/users/updatedetails', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        updateUser(data.data);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and preferences.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-4xl font-bold text-white">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              {/* Note: Profile picture upload requires backend integration not fully implemented yet */}
              <button className="absolute bottom-0 inset-x-0 h-10 bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{user?.role || 'User'}</p>
              <p className="text-xs text-gray-500">Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 w-full">
            <form onSubmit={handleSubmit} className="space-y-5">
              {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    className="pl-10 bg-gray-50 text-gray-500"
                    disabled
                    readOnly
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Email address cannot be changed.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
