import { useState } from 'react';
import { 
  Building, 
  Plus, 
  Search, 
  Edit3,
  Phone,
  MapPin,
  Users,
  Calendar,
  User,
  TrendingUp
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { AddBranchModal } from './modals/AddBranchModal';
import { EditBranchModal } from './modals/EditBranchModal';

export function BranchManagement() {
  const { branches } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || branch.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleEditBranch = (branch) => {
    setSelectedBranch(branch);
    setIsEditModalOpen(true);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Branch Management</h1>
          <p className="text-gray-600">Manage tuition center locations</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Branch
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <Building className="h-4 w-4 mr-2" />
            {filteredBranches.length} branch(es)
          </div>
        </div>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBranches.map((branch) => (
          <div key={branch.id ?? branch.name} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white">
                    <Building className="h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
                    <p className="text-sm text-gray-600">Managed by {branch.manager}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  branch.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {branch.status}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-3 text-gray-400" />
                  {branch.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                  Established: {branch.establishedDate.toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-3 text-gray-400" />
                  Manager: {branch.manager}
                </div>
              </div>

              {/* Capacity Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Student Capacity</span>
                  <span className="text-sm text-gray-600">
                    {branch.currentStudents}/{branch.capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((branch.currentStudents / branch.capacity) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {Math.round((branch.currentStudents / branch.capacity) * 100)}% occupied
                  </span>
                  <span className={`text-xs ${
                    (branch.currentStudents / branch.capacity) > 0.8 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {branch.capacity - branch.currentStudents} spots available
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center text-purple-600 mb-1">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-lg font-semibold">{branch.currentStudents}</span>
                  </div>
                  <p className="text-xs text-gray-600">Current Students</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-green-600 mb-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-lg font-semibold">{branch.capacity}</span>
                  </div>
                  <p className="text-xs text-gray-600">Total Capacity</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleEditBranch(branch)}
                  className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBranches.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No branches found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or add a new branch.</p>
        </div>
      )}

      <AddBranchModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      
      <EditBranchModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        branch={selectedBranch}
      />
    </div>
  );
}