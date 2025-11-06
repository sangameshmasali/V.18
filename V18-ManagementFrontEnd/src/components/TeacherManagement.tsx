import { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit3,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  Award,
  Clock
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAdmin } from '../contexts/AdminContext';
import { AddTeacherModal } from './modals/AddTeacherModal';
import { EditTeacherModal } from './modals/EditTeacherModal';

export function TeacherManagement() {
  const { branches, getFilteredData } = useData();
  const { admin } = useAdmin();
  const { teachers } = getFilteredData();

  // Branch admin can only see their branch
  const availableBranches = admin?.role === 'super_admin' ? branches : 
    branches.filter(b => b.name === admin?.branchName);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [classTypeFilter, setClassTypeFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
    const matchesBranch = branchFilter === 'all' || teacher.branches.includes(branchFilter);
    const matchesClassType = classTypeFilter === 'all' || teacher.classType === classTypeFilter;
    
    return matchesSearch && matchesStatus && matchesBranch && matchesClassType;
  });

  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setIsEditModalOpen(true);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Management</h1>
          <p className="text-gray-600">Manage teacher records and assignments</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Teacher
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Branches</option>
            {availableBranches.map((branch, idx) => (
              <option key={branch.id ?? `${branch.name}-${idx}`} value={branch.name}>{branch.name}</option>
            ))}
          </select>

          <select
            value={classTypeFilter}
            onChange={(e) => setClassTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Class Types</option>
            <option value="regular">Regular Classes</option>
            <option value="vacation">Vacation Classes</option>
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <GraduationCap className="h-4 w-4 mr-2" />
            {filteredTeachers.length} teacher(s)
          </div>
        </div>
      </div>

      {/* Teacher List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
            <div className="col-span-3">Teacher</div>
            <div className="col-span-2 hidden md:block">Contact</div>
            <div className="col-span-2 hidden lg:block">Subjects</div>
            <div className="col-span-2 hidden lg:block">Branches</div>
            <div className="col-span-2 hidden xl:block">Details</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>

        {/* Teacher Rows */}
        <div className="divide-y divide-gray-200">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Teacher Info */}
                <div className="col-span-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {teacher.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-gray-900">{teacher.name}</div>
                      <div className="text-xs text-gray-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {teacher.experience} years exp.
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          teacher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {teacher.status}
                        </span>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          teacher.classType === 'vacation' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {teacher.classType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="col-span-2 hidden md:block">
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <Mail className="h-3 w-3 mr-2 text-gray-400" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Phone className="h-3 w-3 mr-2 text-gray-400" />
                      {teacher.phone}
                    </div>
                  </div>
                </div>

                {/* Subjects */}
                <div className="col-span-2 hidden lg:block">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-700">Teaching:</div>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.slice(0, 2).map((subject, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                      {teacher.subjects.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{teacher.subjects.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Branches */}
                <div className="col-span-2 hidden lg:block">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-700">Locations:</div>
                    <div className="flex flex-wrap gap-1">
                      {teacher.branches.slice(0, 2).map((branch, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full"
                        >
                          {branch}
                        </span>
                      ))}
                      {teacher.branches.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{teacher.branches.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="col-span-2 hidden xl:block">
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <DollarSign className="h-3 w-3 mr-2 text-gray-400" />
                      ${teacher.salary}/month
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                      {teacher.joinDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Award className="h-3 w-3 mr-2 text-amber-500" />
                      {teacher.qualifications.length} qualification(s)
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleEditTeacher(teacher)}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile View - Additional Info */}
              <div className="mt-3 md:hidden">
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-3">
                  <div>
                    <div className="flex items-center mb-1">
                      <Mail className="h-3 w-3 mr-2 text-gray-400" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-2 text-gray-400" />
                      {teacher.phone}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <DollarSign className="h-3 w-3 mr-2 text-gray-400" />
                      ₹{teacher.salary.toLocaleString()}/month
                    </div>
                    <div className="flex items-center">
                      <Award className="h-3 w-3 mr-2 text-amber-500" />
                      {teacher.qualifications.length} qualifications
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">Subjects:</div>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">Branches:</div>
                    <div className="flex flex-wrap gap-1">
                      {teacher.branches.map((branch, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full"
                        >
                          {branch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or add a new teacher.</p>
          </div>
        )}
      </div>

      <AddTeacherModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      
      <EditTeacherModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        teacher={selectedTeacher ?? undefined}
      />
    </div>
  );
}