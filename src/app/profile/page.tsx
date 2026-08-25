'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, Camera, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user, isAuthenticated, isLoading, updateUser, logout } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (user) {
      setFullName(user.fullName || '');
      setMobileNumber(user.mobileNumber || '');
    }
  }, [user, isAuthenticated, isLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/users/updatedetails`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ fullName, mobileNumber }),
      });
      const data = await res.json();
      
      if (data.success) {
        updateUser({ fullName, mobileNumber });
        setMessage({ text: 'Profile updated successfully', type: 'success' });
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error updating profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/users/updatepassword`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      
      if (data.success) {
        setCurrentPassword('');
        setNewPassword('');
        setMessage({ text: 'Password updated successfully', type: 'success' });
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error updating password', type: 'error' });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/users/upload-profile-picture`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        updateUser({ profilePicture: data.data.profilePicture });
        setMessage({ text: 'Profile picture updated', type: 'success' });
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error uploading image', type: 'error' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/users/delete-account`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
      });
      
      if (res.ok) {
        logout();
        router.push('/');
      }
    } catch (err) {
      setMessage({ text: 'Error deleting account', type: 'error' });
      setIsDeleting(false);
    }
  };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <main className="flex-1 py-24 px-4 bg-navy-50/50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Profile Management</h1>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100"
          >
            <div className="relative inline-block mb-4">
              {user.profilePicture ? (
                <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${user.profilePicture}`} alt={user.fullName} className="w-32 h-32 rounded-full object-cover border-4 border-gray-50" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-bold border-4 border-gray-50">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 cursor-pointer text-primary hover:bg-gray-50 transition-colors">
                <Camera className="w-5 h-5" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
            </div>
            <h2 className="font-semibold text-lg">{user.fullName}</h2>
            <p className="text-gray-500 text-sm mb-4">{user.role}</p>
            <div className="text-xs text-gray-400">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </motion.div>

          {/* Details Section */}
          <div className="md:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <Input 
                      type="text" 
                      icon={<User className="w-5 h-5" />}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <Input 
                      type="tel" 
                      icon={<Phone className="w-5 h-5" />}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <Input 
                    type="email" 
                    icon={<Mail className="w-5 h-5" />}
                    value={user.email}
                    disabled
                    className="bg-gray-50 cursor-not-allowed text-gray-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email address cannot be changed.</p>
                </div>
                <div className="pt-4 text-right">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              <h3 className="text-xl font-semibold mb-6">Security</h3>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <Input 
                    type="password" 
                    icon={<Lock className="w-5 h-5" />}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <Input 
                    type="password" 
                    icon={<Lock className="w-5 h-5" />}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="pt-4 text-right">
                  <Button type="submit" variant="secondary">
                    Update Password
                  </Button>
                </div>
              </form>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-red-50 p-6 md:p-8 rounded-2xl shadow-sm border border-red-100"
            >
              <h3 className="text-xl font-semibold text-red-700 mb-2">Danger Zone</h3>
              <p className="text-red-600/80 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
              
              <Button 
                variant="outline" 
                className="border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 w-full md:w-auto"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </motion.div>

          </div>
        </div>
      </div>
    </main>
  );
}

