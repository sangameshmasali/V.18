import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Calendar, Receipt } from 'lucide-react';
import { useData, Student } from '../../contexts/DataContext';

interface FeePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export function FeePaymentModal({ isOpen, onClose, student }: FeePaymentModalProps) {
  const { updateStudentFees } = useData();
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || paymentAmount <= 0) return;
    
    updateStudentFees(student.id, paymentAmount);
    onClose();
    setPaymentAmount(0);
    setNotes('');
  };

  if (!isOpen || !student) return null;

  const remainingBalance = student.feesRemaining;
  const maxPayment = Math.min(remainingBalance, remainingBalance);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Collect Fee Payment</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                {student.name.charAt(0)}
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-gray-900">{student.name}</h3>
                <p className="text-sm text-gray-600">{student.grade} • {student.branch}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Monthly Fee:</span>
                <p className="font-semibold text-gray-900">₹{student.monthlyFee.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Already Paid:</span>
                <p className="font-semibold text-green-600">₹{student.feesPaid.toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Remaining Balance:</span>
                <p className={`font-bold text-lg ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{remainingBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {remainingBalance > 0 ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (₹) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    required
                    min="1"
                    max={maxPayment}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Math.min(parseInt(e.target.value) || 0, maxPayment))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum payment: ₹{maxPayment.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Debit/Credit Card</option>
                  <option value="upi">UPI Payment</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any notes about this payment..."
                />
              </div>

              {paymentAmount > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <Receipt className="h-4 w-4 mr-2" />
                    Payment Summary
                  </h4>
                  <div className="space-y-1 text-sm text-green-800">
                    <div className="flex justify-between">
                      <span>Payment Amount:</span>
                      <span className="font-semibold">₹{paymentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="capitalize">{paymentMethod.replace('_', ' ')}</span>
                    </div>
                    <div className="border-t border-green-200 pt-1 flex justify-between font-semibold">
                      <span>New Balance:</span>
                      <span>₹{Math.max(0, remainingBalance - paymentAmount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentAmount <= 0}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">Fees Fully Paid!</h3>
              <p className="text-green-700">This student has paid all monthly fees.</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}