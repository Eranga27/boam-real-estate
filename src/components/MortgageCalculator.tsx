'use client';

import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { Input } from './ui/Input';

interface MortgageCalculatorProps {
  propertyPrice: number;
}

export default function MortgageCalculator({ propertyPrice }: MortgageCalculatorProps) {
  const [price, setPrice] = useState(propertyPrice);
  const [downPayment, setDownPayment] = useState(propertyPrice * 0.2); // 20% default
  const [interestRate, setInterestRate] = useState(5.5); // 5.5% default
  const [loanTerm, setLoanTerm] = useState(30); // 30 years default
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  useEffect(() => {
    const principal = price - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    if (principal <= 0 || monthlyRate === 0 || numberOfPayments === 0) {
      setMonthlyPayment(0);
      return;
    }

    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    setMonthlyPayment(payment);
  }, [price, downPayment, interestRate, loanTerm]);

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <Calculator className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Mortgage Calculator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Price ($)</label>
          <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Down Payment ($)</label>
          <Input type="number" value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Interest Rate (%)</label>
          <Input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Loan Term (Years)</label>
          <select 
            value={loanTerm} 
            onChange={e => setLoanTerm(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value={15}>15 Years</option>
            <option value={20}>20 Years</option>
            <option value={30}>30 Years</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Estimated Monthly Payment</p>
          <p className="text-3xl font-bold text-gray-900">${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">Principal & Interest</p>
          <p className="text-sm font-semibold text-primary">Based on {interestRate}% rate</p>
        </div>
      </div>
    </div>
  );
}
