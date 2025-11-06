import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useData, Student } from '../../contexts/DataContext';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

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

export function EditStudentModal({ isOpen, onClose, student }: EditStudentModalProps) {
  const { updateStudent, updateStudentFees, getFilteredData } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    grade: '',
    subjects: [] as string[],
    branch: '',
    monthlyFee: 0,
    status: 'active' as 'active' | 'inactive',
    classType: 'regular' as 'regular' | 'vacation',
    additionalPayment: 0,
  });

  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        phone: student.phone,
        grade: student.grade,
        subjects: [...student.subjects],
        branch: student.branch,
        monthlyFee: student.monthlyFee,
        status: student.status,
        classType: student.classType,
        additionalPayment: 0,
      });
    }
  }, [student]);

  const calculateFee = () => {
    const total = formData.classType === 'vacation' ? 15000 : 8000;
    setFormData(prev => ({ ...prev, monthlyFee: total }));
  };

  useEffect(() => {
    calculateFee();
  }, [formData.subjects, formData.classType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    
    if (formData.subjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }

     if (!phoneRegex.test(formData.phone)) {
      alert('Enter a valid 10-digit phone number starting with 6, 7, 8, or 9');
      return;
    }
    
    updateStudent(student.id, formData);
    
    // Record additional payment if any
    if (formData.additionalPayment > 0) {
      updateStudentFees(student.id, formData.additionalPayment);
    }
    
    onClose();
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

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

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Student</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter student's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
                maxLength={10}
              />
              {phoneError && (
                <p className="text-xs text-red-600 mt-1">{phoneError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level *
              </label>
              <select
                required
                value={formData.grade}
                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select grade level</option>
                {GRADE_OPTIONS.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Location *
              </label>
              <select
                required
                value={formData.branch}
                onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select branch</option>
                {getFilteredData().branches.map(branch => (
                  <option key={branch.id} value={branch.name}>{branch.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Type *
              </label>
              <select
                required
                value={formData.classType}
                onChange={(e) => setFormData(prev => ({ ...prev, classType: e.target.value as 'regular' | 'vacation' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="regular">Regular Classes</option>
                <option value="vacation">Vacation Classes</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Vacation classes have 50% higher fees than regular classes
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Fee Payment (₹)
              </label>
              <input
                type=""
                //min="0"
                max={formData.monthlyFee - (student?.feesPaid || 0)}
                value={formData.additionalPayment === 0 ? '' : formData.additionalPayment}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  additionalPayment: Math.min(
                    parseInt(e.target.value) || 0, 
                    prev.monthlyFee - (student?.feesPaid || 0)
                  )
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter payment amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add payment towards monthly fees (max: ₹{((formData.monthlyFee - (student?.feesPaid || 0)) || 0).toLocaleString()})
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
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

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Fee Calculation</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>Class Type:</span>
                <span className="capitalize">{formData.classType} Classes</span>
              </div>
              <div className="flex justify-between">
                <span>Selected Subjects:</span>
                <span>{formData.subjects.length} subjects</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Fee:</span>
                <span>₹{formData.monthlyFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Already Paid:</span>
                <span>₹{(student?.feesPaid || 0).toLocaleString()}</span>
              </div>
              {formData.additionalPayment > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>New Payment:</span>
                  <span>₹{formData.additionalPayment.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-blue-200 pt-1 font-semibold flex justify-between">
                <span>Remaining Balance:</span>
                <span className={`${
                  (formData.monthlyFee - (student?.feesPaid || 0) - (formData.additionalPayment || 0)) > 0 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  ₹{Math.max(0, formData.monthlyFee - (student?.feesPaid || 0) - (formData.additionalPayment || 0)).toLocaleString()}
                </span>
              </div>
              {(formData.monthlyFee - (student?.feesPaid || 0) - (formData.additionalPayment || 0)) <= 0 && (
                <div className="text-center text-green-700 font-semibold text-sm mt-2">
                  ✅ Fees Fully Paid!
                </div>
              )}
            </div>
          </div>

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
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              Update Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}