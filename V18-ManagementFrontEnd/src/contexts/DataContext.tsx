import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAdmin } from './AdminContext';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  grade: string;
  subjects: string[];
  branch: string;
  monthlyFee: number;
  feesPaid: number;
  feesRemaining: number;
  registrationDate: Date;
  onboardedBy: string;
  status: 'active' | 'inactive';
  classType: 'regular' | 'vacation';
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  branches: string[];
  qualifications: string[];
  experience: number;
  salary: number;
  joinDate: Date;
  onboardedBy: string;
  status: 'active' | 'inactive';
  classType: 'regular' | 'vacation';
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  capacity: number;
  currentStudents: number;
  establishedDate: Date;
  status: 'active' | 'inactive';
  admin?: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  };
}

export interface ActivityLog {
  id: string;
  action: string;
  adminName: string;
  timestamp: Date;
  details: string;
}

export interface Receipt {
  id: string;
  studentId: string;
  receiptNumber: string;
  issueDate: Date;
  totalAmount: number;
  paymentMethod: string;
}

interface DataContextType {
  students: Student[];
  teachers: Teacher[];
  branches: Branch[];
  activityLogs: ActivityLog[];
  receipts: Receipt[];
  addStudent: (student: Omit<Student, 'id' | 'registrationDate' | 'onboardedBy'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  updateStudentFees: (id: string, paidAmount: number) => void;
  addTeacher: (teacher: Omit<Teacher, 'id' | 'joinDate' | 'onboardedBy'>) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  addBranch: (branch: Omit<Branch, 'id' | 'establishedDate'>) => void;
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  addReceipt: (receipt: Omit<Receipt, 'id'>) => Promise<Receipt>;
  getStudentReceipts: (studentId: string) => Receipt[];
  getFilteredData: () => {
    students: Student[];
    teachers: Teacher[];
    branches: Branch[];
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);
// Use Vite's import.meta.env for accessing environment variables in the browser
const API_URL = import.meta.env.VITE_API_URL + '/api';//"http://localhost:5000/api";//import.meta.env.VITE_API_URL ?? 

export function DataProvider({ children }: { children: ReactNode }) {
  const { admin } = useAdmin();
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  // ---- Helper to parse dates ----
const parseStudent = (s: any): Student => ({
  id: s._id || s.id || Date.now().toString(),
  name: s.name || '',
  email: s.email || '',
  phone: s.phone || '',
  grade: s.grade || '',
  subjects: s.subjects || [],
  branch: s.branch || '',
  monthlyFee: s.monthlyFee ?? 0,
  feesPaid: s.feesPaid ?? 0,
  feesRemaining: s.feesRemaining ?? (s.monthlyFee - (s.feesPaid ?? 0)),
  registrationDate: new Date(s.registrationDate),
  onboardedBy: s.onboardedBy || 'Unknown',
  status: s.status || 'active',
  classType: s.classType || 'regular',
});



const parseTeacher = (t: any): Teacher => ({
  id: t._id || t.id,
  name: t.name,
  email: t.email,
  phone: t.phone,
  subjects: t.subjects || [],
  branches: t.branches || [],
  qualifications: t.qualifications || [],
  experience: t.experience || 0,
  salary: t.salary || 0,
  joinDate: new Date(t.joinDate),
  onboardedBy: t.onboardedBy,
  status: t.status,
  classType: t.classType,
});

 const parseBranch = (b: any): Branch => ({
  id: b._id || b.id,
  name: b.name,
  address: b.address,
  phone: b.phone,
  manager: b.manager,
  capacity: b.capacity,
  currentStudents: b.currentStudents,
  status: b.status,
  establishedDate: new Date(b.establishedDate),
  admin: b.admin
    ? {
        name: b.admin.name,
        email: b.admin.email,
        phone: b.admin.phone,
        password: b.admin.password,
      }
    : undefined,
});


  const parseLog = (l: any): ActivityLog => ({
    ...l,
    timestamp: new Date(l.timestamp),
  });

  // Helper to parse receipt dates
  const parseReceipt = (r: any): Receipt => ({
    ...r,
    id: r._id || r.id,
    issueDate: new Date(r.issueDate)
  });

  // ---- Initial load ----
  useEffect(() => {
    fetch(`${API_URL}/students`)
      .then(res => res.json())
      .then(data => setStudents(data.map(parseStudent)));

    fetch(`${API_URL}/teachers`)
      .then(res => res.json())
      .then(data => setTeachers(data.map(parseTeacher)));

    fetch(`${API_URL}/branches`)
      .then(res => res.json())
      .then(data => setBranches(data.map(parseBranch)));

    fetch(`${API_URL}/logs`)
      .then(res => res.json())
      .then(data => setActivityLogs(data.map(parseLog)));

    // Attempt to fetch receipts, but don't fail if endpoint doesn't exist yet
    fetch(`${API_URL}/receipts`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) {
            console.warn('Receipts endpoint not available yet');
            return [];
          }
          throw new Error(`Failed to fetch receipts: ${res.status}`);
        }
        return res.json();
      })
      .then(data => Array.isArray(data) ? setReceipts(data.map(parseReceipt)) : setReceipts([]))
      .catch(error => {
        console.error('Error fetching receipts:', error);
        setReceipts([]);
      });
  }, []);

  // ---- Students ----
  const addStudent = async (studentData: Omit<Student, 'id' | 'registrationDate' | 'onboardedBy'>) => {
    // Branch admin can only add students to their branch
    if (admin?.role === 'branch_admin' && admin.branchName) {
      // Find the branch by ID and check if it matches admin's branch
      const selectedBranch = branches.find(b => b.name === studentData.branch);
      if (!selectedBranch || selectedBranch.name !== admin.branchName) {
        alert('You can only add students to your assigned branch');
        return;
      }
    }
   
    // Get the actual branch name from the branch ID
    const selectedBranch = branches.find(b => b.name === studentData.branch);
    if (!selectedBranch) {
      alert('You can only add students to your assigned branch');
      return;
    }
   
    const newStudent: Student = {
      ...studentData,
      branch: selectedBranch.name, // Use the actual branch name
      id: Date.now().toString(),
      registrationDate: new Date(),
      onboardedBy: admin?.name || 'Unknown',
      feesPaid: studentData.feesPaid || 0,
      feesRemaining: studentData.monthlyFee - (studentData.feesPaid || 0),
    };
    const res = await fetch(`${API_URL}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStudent),
    });
    const savedStudent = parseStudent(await res.json());
    setStudents(prev => [savedStudent, ...prev]);
    logActivity("Student Added", `Added new student: ${savedStudent.name}`);
  };

  const addReceipt = async (receiptData: Omit<Receipt, 'id'>): Promise<Receipt> => {
    try {
      // Try to save to backend
      const res = await fetch(`${API_URL}/receipts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receiptData)
      });

      if (!res.ok) {
        if (res.status === 404) {
          // If endpoint doesn't exist, create a local receipt
          console.warn('Receipts endpoint not available, storing receipt locally');
          const localReceipt: Receipt = {
            ...receiptData,
            id: Date.now().toString()
          };
          setReceipts(prev => [localReceipt, ...prev]);
          logActivity('Receipt Generated (Local)', `Generated receipt ${localReceipt.receiptNumber} for student ID: ${localReceipt.studentId}`);
          return localReceipt;
        }
        throw new Error('Failed to add receipt');
      }
      
      const savedReceipt = parseReceipt(await res.json());
      setReceipts(prev => [savedReceipt, ...prev]);
      logActivity('Receipt Generated', `Generated receipt ${savedReceipt.receiptNumber} for student ID: ${savedReceipt.studentId}`);
      return savedReceipt;
    } catch (err) {
      console.error('Error adding receipt:', err);
      // If there's any error, fall back to local storage
      const localReceipt: Receipt = {
        ...receiptData,
        id: Date.now().toString()
      };
      setReceipts(prev => [localReceipt, ...prev]);
      logActivity('Receipt Generated (Local)', `Generated receipt ${localReceipt.receiptNumber} for student ID: ${localReceipt.studentId}`);
      return localReceipt;
    }
  };

  const getStudentReceipts = (studentId: string): Receipt[] => {
    return receipts.filter(r => r.studentId === studentId);
  };

  // Filter data based on admin role and branch access
  const getFilteredData = () => {
    if (admin?.role === 'super_admin') {
      return { students, teachers, branches };
    } else if (admin?.role === 'branch_admin' && admin.branchName) {
      return {
        students: students.filter(s => s.branch === admin.branchName),
        teachers: teachers.filter(t => t.branches.includes(admin.branchName ?? "")),
        branches: branches.filter(b => b.name === admin.branchName),
      };
    }
    return { students: [], teachers: [], branches: [] };
  };

  const logActivity = (action: string, details: string) => {
    if (admin) {
      const log: ActivityLog = {
        id: Date.now().toString(),
        action,
        adminName: admin.name,
        timestamp: new Date(),
        details,
      };
      setActivityLogs(prev => [log, ...prev].slice(0, 100)); // Keep last 100 logs
    }
  };

 
const updateStudent = async (id: string, updates: Partial<Student>) => {
  const student = students.find(s => s.id === id);
  if (!student) {
    console.error("Student not found:", id);
    return;
  }

  if (admin?.role === 'branch_admin' && admin.branchName && student.branch !== admin.branchName) {
    alert('You can only edit students from your assigned branch');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/students/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updates),
});
const updatedStudent = await res.json();
setStudents(prev =>
  prev.map(s => (s.id === updatedStudent._id ? parseStudent(updatedStudent) : s))
);


    logActivity('Student Updated', `Updated student with ID: ${id}`);
  } catch (err) {
    console.error("Error updating student:", err);
    alert("Something went wrong while updating student");
  }
};
const updateStudentFees = async (id: string, paidAmount: number) => {
  const student = students.find(s => s.id === id);
  if (admin?.role === 'branch_admin' && admin.branchName && student?.branch !== admin.branchName) {
    alert('You can only update fees for students from your assigned branch');
    return;
  }

  if (!student) return;

  const newFeesPaid = student.feesPaid + paidAmount;
  const newFeesRemaining = Math.max(0, student.monthlyFee - newFeesPaid);

  const updatedStudent = {
    ...student,
    feesPaid: newFeesPaid,
    feesRemaining: newFeesRemaining,
  };

  try {
    const res = await fetch(`${API_URL}/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feesPaid: newFeesPaid, feesRemaining: newFeesRemaining }),
    });

    if (!res.ok) {
      alert("Failed to update fees in the database");
      return;
    }

    // Update local state
    setStudents(prev =>
      prev.map(s => (s.id === id ? updatedStudent : s))
    );

    logActivity('Fee Payment', `Payment of ₹${paidAmount} recorded for student ID: ${id}`);
  } catch (err) {
    console.error("Error updating fees:", err);
    alert("Something went wrong while updating fees");
  }
};


  const addTeacher = async (teacherData: Omit<Teacher, 'id' | 'joinDate' | 'onboardedBy'>) => {
  // Branch admin can only add teachers to their branch
  if (admin?.role === 'branch_admin' && admin.branchName) {
    const hasInvalidBranch = teacherData.branches.some(branchName => branchName !== admin.branchName);
    if (hasInvalidBranch || teacherData.branches.length === 0) {
      alert('You can only add teachers to your assigned branch');
      return;
    }
  }

  const newTeacher: Teacher = {
    ...teacherData,
    id: Date.now().toString(),
    joinDate: new Date(),
    onboardedBy: admin?.name || 'Unknown',
  };

  // ✅ POST to backend API
  const res = await fetch(`${API_URL}/teachers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTeacher),
  });

  if (!res.ok) {
    alert("Failed to add teacher");
    return;
  }

  const savedTeacher = parseTeacher(await res.json());
  setTeachers(prev => [savedTeacher, ...prev]);
  logActivity('Teacher Added', `Added new teacher: ${savedTeacher.name}`);
};


const updateTeacher = async (id: string, updates: Partial<Teacher>) => {
  const teacher = teachers.find(t => t.id === id);
  if (!teacher) {
    alert("Teacher not found");
    return;
  }

  // Restrict branch admins to their own branch
  if (admin?.role === 'branch_admin' && admin.branchName && !teacher.branches.includes(admin.branchName)) {
    alert('You can only edit teachers from your assigned branch');
    return;
  }

  try {
    // ✅ Send update to backend
    const res = await fetch(`${API_URL}/teachers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      alert("Failed to update teacher");
      return;
    }

    // ✅ Update local state
    setTeachers(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );

    logActivity("Teacher Updated", `Updated teacher: ${teacher.name}`);
  } catch (err) {
    console.error("Error updating teacher:", err);
    alert("Something went wrong while updating teacher");
  }
};


const addBranch = async (
  branchData: Omit<Branch, 'id' | 'establishedDate'> & {
    admin?: { name: string; email: string; phone?: string; password?: string };
  },
) => {
  if (admin?.role !== 'super_admin') {
    alert('Only Super Admins can add new branches');
    return;
  }

  // Send branch data (including admin info and password) to backend
  await fetch(`${API_URL}/branches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...branchData,
      establishedDate: new Date(),
      admin: branchData.admin ? {
        name: branchData.admin.name,
        email: branchData.admin.email,
        phone: branchData.admin.phone,
        password: branchData.admin.password // <-- Add this line!
      } : undefined
    }),
  });

  // Fetch latest branches from backend
  const res = await fetch(`${API_URL}/branches`);
  const data = await res.json();
  setBranches(data.map(parseBranch));
  logActivity('Branch Added', `Added new branch: ${branchData.name}`);
};


const updateBranch = async (
  id: string,
  updates: Partial<
    Branch & {
      admin?: { name: string; email: string; phone?: string; password?: string };
    }
  >,
) => {
  if (admin?.role !== 'super_admin') {
    alert('Only Super Admins can update branches');
    return;
  }

  await fetch(`${API_URL}/branches/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  // Fetch latest branches from backend
  const res = await fetch(`${API_URL}/branches`);
  const data = await res.json();
  setBranches(data.map(parseBranch));
  logActivity('Branch Updated', `Updated branch with ID: ${id}`);
};
  return (
    <DataContext.Provider value={{
      students,
      teachers,
      branches,
      activityLogs,
      receipts,
      addStudent,
      updateStudent,
      updateStudentFees,
      addTeacher,
      updateTeacher,
      addBranch,
      updateBranch,
      addReceipt,
      getStudentReceipts,
      getFilteredData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
}
