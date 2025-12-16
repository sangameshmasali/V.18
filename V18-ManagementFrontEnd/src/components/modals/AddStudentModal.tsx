import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, GraduationCap, BookOpen, MapPin, DollarSign, UserCheck, Calendar, CreditCard, Plus, Minus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const SUBJECT_OPTIONS = [
  'Mathematics',
  'Science',
  'English',
  'PU Mathematics',
  'Physics',
  'Chemistry',
  'Biology'
];

const GRADE_OPTIONS = [
  '8th Grade',
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade'
];

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
  const { addStudent, getFilteredData } = useData();
  const { branches } = getFilteredData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    grade: '',
    subjects: [] as string[],
    branchId: '',
    status: 'active' as 'active' | 'inactive',
    classType: 'regular' as 'regular' | 'vacation',
    initialPayment: 0
  });

  const [monthlyFee, setMonthlyFee] = useState(0);
  const [remainingFees, setRemainingFees] = useState(0);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    const fee = formData.classType === 'vacation' ? 15000 : 8000;
    setMonthlyFee(fee);
    setRemainingFees(fee - formData.initialPayment);
  }, [formData.classType, formData.initialPayment]);

  // Regex: starts with 6-9, then 9 digits (total 10), only digits
  const phoneRegex = /^[6-9][0-9]{9}$/;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only digits
    setFormData(prev => ({ ...prev, phone: value }));
    if (value.length === 0) {
      setPhoneError('');
    } else if (!phoneRegex.test(value)) {
      setPhoneError('Enter a valid 10-digit phone number starting with 6, 7, 8, or 9');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.grade || !formData.branchId) {
      alert('Please fill in all required fields');
      return;
    }
    if (!phoneRegex.test(formData.phone)) {
      alert('Enter a valid 10-digit phone number starting with 6, 7, 8, or 9');
      return;
    }

    if (formData.subjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }

    if (formData.initialPayment > monthlyFee) {
      alert('Initial payment cannot exceed monthly fee');
      return;
    }

    const selectedBranch = branches.find(b => b.id === formData.branchId);
    if (!selectedBranch) {
      alert('Please select a valid branch');
      return;
    }

    const studentData = {
      ...formData,
      branch: selectedBranch.name,
      monthlyFee,
      feesPaid: formData.initialPayment,
      feesRemaining: remainingFees
    };

    addStudent(studentData);
    onClose();
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      grade: '',
      subjects: [],
      branchId: '',
      status: 'active',
      classType: 'regular',
      initialPayment: 0
    });
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <User className="w-6 h-6 mr-2 text-indigo-600" />
            Add New Student
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Enter student's full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="student@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number *
              </label>
              <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${phoneError ? 'border-red-500' : ''}`}
                  placeholder="9876543210"
                  required
                  maxLength={10}
                />
              {phoneError && (
                <p className="text-xs text-red-600 mt-1">{phoneError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="w-4 h-4 inline mr-1" />
                Grade Level *
              </label>
              <select
                required
                value={formData.grade}
                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">Select grade level</option>
                {GRADE_OPTIONS.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Class Type *
              </label>
              <select
                value={formData.classType}
                onChange={(e) => setFormData(prev => ({ ...prev, classType: e.target.value as 'regular' | 'vacation' }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              >
                <option value="regular">Regular Classes</option>
                <option value="vacation">Vacation Classes</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Regular: ₹8,000/month • Vacation: ₹15,000/month
              </p>
            </div>
          </div>

          {/* Subjects Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Subjects * (Select subjects to enroll in)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SUBJECT_OPTIONS.map(subject => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleSubject(subject)}
                  className={`flex items-center justify-between p-3 text-sm rounded-lg border-2 transition-all duration-200 ${
                    formData.subjects.includes(subject)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <span>{subject}</span>
                  {formData.subjects.includes(subject) ? (
                    <Minus className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Plus className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
            {formData.subjects.length > 0 && (
              <p className="text-sm text-blue-600 mt-2">
                Selected: {formData.subjects.join(', ')}
              </p>
            )}
          </div>

          {/* Branch and Class Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Branch *
              </label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select a branch</option>
                {getFilteredData().branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserCheck className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Fee Information */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Fee Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Fee
                </label>
                <div className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 font-semibold">
                  ₹{monthlyFee.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.classType === 'vacation' ? 'Vacation classes' : 'Regular classes'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  Initial Payment (Optional)
                </label>
                <input
                  type=""
                  max={monthlyFee}
                  value={formData.initialPayment === 0 ? '' : formData.initialPayment}
                  onChange={(e) => {
                    //const v = e.target.value;
                    // when empty, keep state as 0 but show empty string in input
                    //const num = v === '' ? 0 : Number(v);
                    setFormData(prev => ({ ...prev, 
                                                    initialPayment: Math.min(
                                                      parseInt(e.target.value) || 0, 
                                                      monthlyFee
                  )
                }))
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all input-no-spin"
                  placeholder="Enter initial payment"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Amount to collect during registration
                </p>
              </div>
            </div>

            {formData.initialPayment > 0 && (
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Monthly Fee:</span>
                  <span className="font-semibold">₹{monthlyFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Initial Payment:</span>
                  <span className="font-semibold text-green-600">₹{formData.initialPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-800 font-medium">Remaining Balance:</span>
                  <span className="font-bold text-red-600">₹{remainingFees.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center"
            >
              <User className="w-4 h-4 mr-2" />
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}