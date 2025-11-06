import { useState } from 'react';
import { Users, Plus, Search, Edit3, Mail, Phone, MapPin, DollarSign, Calendar, User, Download } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAdmin } from '../contexts/AdminContext';
import AddStudentModal from './modals/AddStudentModal';
import { EditStudentModal } from './modals/EditStudentModal';
import { generateReceiptNumber, generateReceiptPDF } from '../utils/pdfGenerator';

export function StudentManagement() {
  const { branches, getFilteredData, getStudentReceipts, addReceipt } = useData();
  const { admin } = useAdmin();
  const { students } = getFilteredData();

  // Branch admin can only see their branch
  const availableBranches = admin?.role === 'super_admin' ? branches : 
    branches.filter(b => b.name === admin?.branchName);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [classTypeFilter, setClassTypeFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesBranch = branchFilter === 'all' || student.branch === branchFilter;
    const matchesClassType = classTypeFilter === 'all' || student.classType === classTypeFilter;
    
    return matchesSearch && matchesStatus && matchesBranch && matchesClassType;
  });

  const handleEditStudent = (student:any) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  // const handleFeePayment = (student:any) => {
  //   setSelectedStudent(student);
  //   //setIsFeeModalOpen(true);
  // };

  const handleDownloadReceipt = async (student) => {
    
    // Check if student already has a receipt
  const existingReceipts = getStudentReceipts(student.id);
    let receiptNumber;

    if (existingReceipts.length > 0) {
      // Use the existing receipt number
      receiptNumber = existingReceipts[0].receiptNumber;
    } else {
      // Generate and save new receipt
      receiptNumber = generateReceiptNumber();
      try {
        await addReceipt({
          studentId: student.id,
          receiptNumber,
          issueDate: new Date(),
          totalAmount: student.feesPaid,
          paymentMethod: 'Multiple'
        });
      } catch (err) {
        console.error('Error saving receipt:', err);
        alert('Error generating receipt. Please try again.');
        return;
      }
    }

    // Generate PDF with receipt data
    const receiptData = {
      student,
      receiptNumber,
      issueDate: new Date(),
      totalAmount: student.feesPaid,
      paymentMethod: 'Multiple'
    };
    
    generateReceiptPDF(receiptData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
          <p className="text-gray-600">Manage student records and enrollment</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Branches</option>
            {availableBranches.map((branch, idx) => (
              <option key={branch.id ?? `${branch.name}-${idx}`} value={branch.name}>{branch.name}</option>
            ))}
          </select>

          <select
            value={classTypeFilter}
            onChange={(e) => setClassTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Class Types</option>
            <option value="regular">Regular Classes</option>
            <option value="vacation">Vacation Classes</option>
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            {filteredStudents.length} student(s)
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
            <div className="col-span-3">Student</div>
            <div className="col-span-2 hidden md:block">Contact</div>
            <div className="col-span-2 hidden lg:block">Academic</div>
            <div className="col-span-2 hidden lg:block">Branch & Class</div>
            <div className="col-span-2 hidden xl:block">Enrollment</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>

        {/* Student Rows */}
        <div className="divide-y divide-gray-200">
          {filteredStudents.map((student) => (
            <div key={student.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Student Info */}
                <div className="col-span-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {student.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-600">{student.grade}</div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="col-span-2 hidden md:block">
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <Mail className="h-3 w-3 mr-2 text-gray-400" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Phone className="h-3 w-3 mr-2 text-gray-400" />
                      {student.phone}
                    </div>
                  </div>
                </div>

                {/* Academic Info */}
                <div className="col-span-2 hidden lg:block">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-700">Subjects:</div>
                    <div className="flex flex-wrap gap-1">
                      {student.subjects.slice(0, 2).map((subject) => (
                        <span
                          key={subject}
                          className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                      {student.subjects.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{student.subjects.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        student.classType === 'vacation' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {student.classType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Branch & Fee */}
                <div className="col-span-2 hidden lg:block">
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="h-3 w-3 mr-2 text-gray-400" />
                      <span className="truncate">{student.branch}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <DollarSign className="h-3 w-3 mr-2 text-gray-400" />
                      ₹{student.monthlyFee.toLocaleString()}/month
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        student.feesRemaining > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {student.feesRemaining > 0 ? `₹${student.feesRemaining.toLocaleString()} due` : 'Paid'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enrollment Info */}
                <div className="col-span-2 hidden xl:block">
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                      {student.registrationDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <User className="h-3 w-3 mr-2 text-gray-400" />
                      <span className="truncate">{student.onboardedBy}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleEditStudent(student)}
                      className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {student.feesRemaining <= 0 && (
                      <button 
                        onClick={() => handleDownloadReceipt(student)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Download Receipt"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile View - Additional Info */}
              <div className="mt-3 md:hidden">
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                  <div>
                    <div className="flex items-center mb-1">
                      <Mail className="h-3 w-3 mr-2 text-gray-400" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-2 text-gray-400" />
                      {student.phone}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <MapPin className="h-3 w-3 mr-2 text-gray-400" />
                      <span className="truncate">{student.branch}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-2 text-gray-400" />
                      ₹{student.monthlyFee.toLocaleString()}/month
                    </div>
                    <div className="flex items-center text-xs mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        student.feesRemaining > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {student.feesRemaining > 0 ? `₹${student.feesRemaining.toLocaleString()} due` : 'Paid'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        student.classType === 'vacation' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {student.classType}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-medium text-gray-700 mb-1">Subjects:</div>
                  <div className="flex flex-wrap gap-1">
                    {student.subjects.map((subject) => (
                      <span
                        key={`${student.id}-${subject}`}
                        className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or add a new student.</p>
          </div>
        )}
      </div>

      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      
      <EditStudentModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        student={selectedStudent}
      />
    </div>
  );
}
