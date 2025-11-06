import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const QUALIFICATION_OPTIONS = [
  'Bachelor of Science (B.Sc.)',
  'Master of Science (M.Sc.)',
  'Bachelor of Arts (B.A.)',
  'Master of Arts (M.A.)',
  'Bachelor of Education (B.Ed.)',
  'Master of Education (M.Ed.)',
  'Doctor of Philosophy (PhD)',
  'Teaching Certificate',
  'Professional Development Certificate'
];

export function AddTeacherModal({ isOpen, onClose }: AddTeacherModalProps) {
  const { addTeacher, getFilteredData } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subjects: [] as string[],
    branches: [] as string[],
    qualifications: [] as string[],
    experience: 0,
    salary: 0,
    status: 'active' as 'active' | 'inactive',
    classType: 'regular' as 'regular' | 'vacation',
  });

    const [phoneError, setPhoneError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }
    if (formData.branches.length === 0) {
      alert('Please select at least one branch');
      return;
    }
    if (formData.qualifications.length === 0) {
      alert('Please select at least one qualification');
      return;
    }
    addTeacher(formData);
    onClose();
    setFormData({
      name: '', 
      email: '',
      phone: '',
      subjects: [],
      branches: [],
      qualifications: [],
      experience: 0,
      salary: 0,
      status: 'active',
      classType: 'regular',
    });

    if (!phoneRegex.test(formData.phone)) {
      alert('Enter a valid 10-digit phone number starting with 6, 7, 8, or 9');
      return;
    }
  };

  const toggleArrayField = (field: 'subjects' | 'branches' | 'qualifications', value: string) => {
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
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add New Teacher</h2>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter teacher's full name"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter phone number"
                maxLength={10}
              />
              {phoneError && (
                <p className="text-xs text-red-600 mt-1">{phoneError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience (Years) *
              </label>
              <input
                type=""
                required
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Years of teaching experience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Salary (₹) *
              </label>
              <input
                type=""
                required
                min=""
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Monthly salary amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="regular">Regular Classes</option>
                <option value="vacation">Vacation Classes</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Specify the type of classes this teacher will conduct
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Teaching Subjects * (Select subjects teacher can teach)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SUBJECT_OPTIONS.map(subject => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleArrayField('subjects', subject)}
                  className={`flex items-center justify-between p-3 text-sm rounded-lg border-2 transition-all duration-200 ${
                    formData.subjects.includes(subject)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  <span>{subject}</span>
                  {formData.subjects.includes(subject) ? (
                    <Minus className="h-4 w-4 text-indigo-600" />
                  ) : (
                    <Plus className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Qualifications * (Select teacher's qualifications)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {QUALIFICATION_OPTIONS.map(qualification => (
                <button
                  key={qualification}
                  type="button"
                  onClick={() => toggleArrayField('qualifications', qualification)}
                  className={`flex items-center justify-between p-3 text-sm rounded-lg border-2 transition-all duration-200 ${
                    formData.qualifications.includes(qualification)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <span>{qualification}</span>
                  {formData.qualifications.includes(qualification) ? (
                    <Minus className="h-4 w-4 text-green-600" />
                  ) : (
                    <Plus className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              ))}
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
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              Add Teacher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}