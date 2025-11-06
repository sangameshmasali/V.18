import { 
  Users, 
  GraduationCap, 
  Building, 
  DollarSign,
  Activity,
  Clock,
  MapPin,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAdmin } from '../contexts/AdminContext';

function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function Dashboard() {
  const { activityLogs, getFilteredData } = useData();
  const { admin } = useAdmin();

  const { students, teachers, branches } = getFilteredData();

  const activeStudents = students.filter(s => s.status === 'active').length;
  const activeTeachers = teachers.filter(t => t.status === 'active').length;
  const activeBranches = branches.filter(b => b.status === 'active').length;
  
  // Calculate fee statistics
  const totalCollectedFees = students.reduce((sum, student) => sum + student.feesPaid, 0);
  const totalPendingFees = students.reduce((sum, student) => sum + student.feesRemaining, 0);
  const totalExpectedRevenue = students.reduce((sum, student) => sum + student.monthlyFee, 0);

  const recentActivities = activityLogs.slice(0, 5);

  const stats = [
    {
      title: 'Active Students',
      value: activeStudents,
      icon: Users,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Active Teachers',
      value: activeTeachers,
      icon: GraduationCap,
      color: 'from-indigo-600 to-indigo-700',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Active Branches',
      value: activeBranches,
      icon: Building,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Monthly Revenue',
      value: `₹${totalExpectedRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-600 to-green-700',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ];

  // Calculate branch-wise fee statistics
  const branchFeeStats = branches.map(branch => {
    const branchStudents = students.filter(s => s.branch === branch.name);
    const collectedFees = branchStudents.reduce((sum, student) => sum + student.feesPaid, 0);
    const pendingFees = branchStudents.reduce((sum, student) => sum + student.feesRemaining, 0);
    const totalFees = branchStudents.reduce((sum, student) => sum + student.monthlyFee, 0);
    const collectionRate = totalFees > 0 ? (collectedFees / totalFees) * 100 : 0;
    
    return {
      ...branch,
      collectedFees,
      pendingFees,
      totalFees,
      collectionRate,
      studentCount: branchStudents.length
    };
  });
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {admin?.name}!
        </h1>
        <p className="text-gray-600 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Logged in at {(() => {
            const dt = toDate(admin?.loginTime);
            return dt ? dt.toLocaleTimeString() : '—';
          })()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-8 w-8 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
              <div className={`h-2 bg-gradient-to-r ${stat.color}`} />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fee Collection Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <CreditCard className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Fee Collection Overview</h2>
          </div>
          
          {/* Overall Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Collected</p>
                  <p className="text-2xl font-bold text-green-900">₹{totalCollectedFees.toLocaleString()}</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Total Pending</p>
                  <p className="text-2xl font-bold text-red-900">₹{totalPendingFees.toLocaleString()}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Branch-wise Fee Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Branch-wise Collection</h3>
            {branchFeeStats.map((branchStat, idx) => (
              <div key={branchStat.id ?? branchStat.name ?? `branch-${idx}`} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{branchStat.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    branchStat.collectionRate >= 80 ? 'bg-green-100 text-green-800' :
                    branchStat.collectionRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {branchStat.collectionRate.toFixed(1)}% collected
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Collected</p>
                    <p className="font-semibold text-green-600">₹{branchStat.collectedFees.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pending</p>
                    <p className="font-semibold text-red-600">₹{branchStat.pendingFees.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Students</p>
                    <p className="font-semibold text-gray-900">{branchStat.studentCount}</p>
                  </div>
                </div>
                
                {/* Collection Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        branchStat.collectionRate >= 80 ? 'bg-green-600' :
                        branchStat.collectionRate >= 60 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(branchStat.collectionRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1">
          <div className="flex items-center mb-6">
            <Activity className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
          </div>
          
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activities</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity, idx) => (
                <div key={activity.id ?? `activity-${idx}`} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {activity.adminName.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.details}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      by {activity.adminName} • {(() => {
                        const t = toDate(activity.timestamp);
                        return t ? t.toLocaleString() : '—';
                      })()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Branch Overview - Only for Super Admin */}
      {admin?.role === 'super_admin' && (
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <MapPin className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Branch Overview</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch, idx) => (
                <div key={branch.id ?? branch.name ?? `branch-overview-${idx}`} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      branch.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {branch.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{branch.address}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Capacity: {branch.currentStudents}/{branch.capacity}</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(branch.currentStudents / branch.capacity) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-600">
                        {Math.round((branch.currentStudents / branch.capacity) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}