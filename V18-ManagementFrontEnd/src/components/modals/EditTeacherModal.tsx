import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAdmin } from '../../contexts/AdminContext';

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    subjects: string[];
    branches: string[];
  };
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

export const EditTeacherModal: React.FC<EditTeacherModalProps> = ({ isOpen, onClose, teacher }) => {
  const { updateTeacher, getFilteredData } = useData();
  const { admin: currentAdmin } = useAdmin();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subjects: [] as string[],
    branches: [] as string[]
  });

      const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        subjects: [...teacher.subjects],
        branches: [...teacher.branches]
      });
    }
  }, [teacher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.subjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }

    if (formData.branches.length === 0) {
      alert('Please select at least one branch');
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      alert('Enter a valid 10-digit phone number starting with 6, 7, 8, or 9');
      return;
    }

    // For branch admins, ensure they can only assign to their branch
  if (currentAdmin?.role === 'branch_admin' && currentAdmin.branchId) {
      const allowedBranch = getFilteredData().branches.find(b => b.id === currentAdmin.branchId)?.name;
      if (allowedBranch && !formData.branches.includes(allowedBranch)) {
        alert('You can only assign teachers to your branch');
        return;
      }
    }

    if (!teacher) {
      alert('No teacher selected');
      return;
    }
    updateTeacher(teacher.id, formData);
    onClose();
  };

  const toggleArrayField = (field: 'subjects' | 'branches', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Edit Teacher</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter teacher's full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter phone number"
                required
              />
              {phoneError && (
                <p className="text-xs text-red-600 mt-1">{phoneError}</p>
              )}
            </div>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Subjects * (Select subjects teacher can teach)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SUBJECT_OPTIONS.map(subject => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleArrayField('subjects', subject)}
                  className={`flex items-center justify-between p-3 text-sm rounded-lg border-2 transition-all duration-200 ${
                    formData.subjects.includes(subject)
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <span>{subject}</span>
                  {formData.subjects.includes(subject) ? (
                    <Minus className="h-4 w-4 text-purple-600" />
                  ) : (
                    <Plus className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Branch Assignments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Branch Assignments * (Select branches where teacher will work)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getFilteredData().branches.map(branch => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => toggleArrayField('branches', branch.name)}
                  className={`flex items-center justify-between p-3 text-sm rounded-lg border-2 transition-all duration-200 ${
                    formData.branches.includes(branch.name)
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <span>{branch.name}</span>
                  {formData.branches.includes(branch.name) ? (
                    <Minus className="h-4 w-4 text-purple-600" />
                  ) : (
                    <Plus className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Update Teacher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};