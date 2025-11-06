import { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { StudentManagement } from './components/StudentManagement';
import { TeacherManagement } from './components/TeacherManagement';
import { BranchManagement } from './components/BranchManagement';
import { Navigation } from './components/Navigation';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { DataProvider } from './contexts/DataContext';
import React from 'react';

function AppContent() {
  const { admin } = useAdmin();
  const [currentView, setCurrentView] = useState('dashboard');

  // Redirect branch admin away from branches view
  React.useEffect(() => {
    if (admin?.role === 'branch_admin' && currentView === 'branches') {
      setCurrentView('dashboard');
    }
  }, [admin, currentView]);

  if (!admin) {
    return <LoginForm />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <StudentManagement />;
      case 'teachers':
        return <TeacherManagement />;
      case 'branches':
        return <BranchManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="pt-16">
        {renderCurrentView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AdminProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AdminProvider>
  );
}

export default App;