'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isMounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div className={cn(
        "relative w-full max-w-lg rounded-2xl bg-white shadow-float border border-navy-100/90 transition-all duration-300 animate-in fade-in zoom-in-95",
        className
      )}>
        <div className="flex items-center justify-between border-b border-navy-100/60 p-6">
          <h2 className="text-xl font-bold text-navy-900">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full w-9 h-9 p-0 text-navy-700 hover:bg-navy-50">
            <X className="w-5 h-5 text-navy-700" />
          </Button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

