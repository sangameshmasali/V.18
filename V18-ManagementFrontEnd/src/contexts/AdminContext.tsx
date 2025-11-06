import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'branch_admin';
  loginTime: Date;
  branchId?: string;
  branchName?: string;
}

interface AdminContextType {
  admin: Admin | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);


export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const adminRef = useRef<Admin | null>(null);  // Add ref to track current admin state
  const sessionTimeoutRef = useRef<number | null>(null);
  const INACTIVITY_MS = 5 * 60 * 1000; // 5 minutes
  const lastActivityRef = useRef<number>(0);
  const ACTIVITY_DEBOUNCE_MS = 3000; // don't refresh more often than every 3s

  const STORAGE_KEY = 'v18_admin_session';

  const login = async (email: string, password: string): Promise<boolean> => {
  try {
    // 1️⃣ Check Super Admins from backend
    const superRes = await fetch("http://localhost:5000/api/superadmins/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (superRes.ok) {
      const superAdmin = await superRes.json();
      const loggedIn: Admin = {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: "super_admin",
        loginTime: new Date(),
      };
      setAdmin(loggedIn);
      persistSession(loggedIn);
      startInactivityTimer();
      return true;
    }

    // 2️⃣ If not found, check Branch Admins from backend
    const branchRes = await fetch("http://localhost:5000/api/branchadmins/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (branchRes.ok) {
      const branchAdmin = await branchRes.json();
      const loggedIn: Admin = {
        id: branchAdmin._id,
        name: branchAdmin.name,
        email: branchAdmin.email,
        role: "branch_admin",
        loginTime: new Date(),
        branchId: branchAdmin.branchId,
        branchName: branchAdmin.branchName,
      };
      setAdmin(loggedIn);
      persistSession(loggedIn);
      startInactivityTimer();
      return true;
    }

    // ❌ Invalid credentials
    return false;
  } catch (err) {
    console.error("Login error:", err);
    return false;
  }
};

  const logout = () => {
    setAdmin(null);
    adminRef.current = null;  // Clear admin ref
    clearPersistedSession();
    stopInactivityTimer();
  };

  // ----- Session persistence helpers -----
  function persistSession(a: Admin) {
    const payload = {
      admin: a,
      expiresAt: Date.now() + INACTIVITY_MS,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
  }

  function clearPersistedSession() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }

  function restoreSessionFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { admin: any; expiresAt: number };
      if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
        // JSON.parse converts Date -> string; ensure loginTime is a Date instance
        if (parsed.admin && parsed.admin.loginTime) {
          parsed.admin.loginTime = new Date(parsed.admin.loginTime);
        }
        return parsed as { admin: Admin; expiresAt: number };
      }
      // expired
      localStorage.removeItem(STORAGE_KEY);
      return null;
    } catch (e) {
      return null;
    }
  }

  // ----- Inactivity timer & activity tracking -----
  function stopInactivityTimer() {
    if (sessionTimeoutRef.current) {
      window.clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    removeActivityListeners();
  }

  function startInactivityTimer() {
    stopInactivityTimer();
    // Set timer to auto-logout after inactivity
    sessionTimeoutRef.current = window.setTimeout(() => {
      setAdmin(null);
      clearPersistedSession();
    }, INACTIVITY_MS);
    addActivityListeners();
  }

  function refreshSession() {
    // Use adminRef instead of admin to avoid stale closure issues
    if (!adminRef.current) return;
    persistSession(adminRef.current);
    // reset timer
    if (sessionTimeoutRef.current) {
      window.clearTimeout(sessionTimeoutRef.current);
    }
    sessionTimeoutRef.current = window.setTimeout(() => {
      setAdmin(null);
      clearPersistedSession();
    }, INACTIVITY_MS);
  }

  function onUserActivity() {
    // called on user activity to extend session
    const now = Date.now();
    if (now - lastActivityRef.current > ACTIVITY_DEBOUNCE_MS) {
      lastActivityRef.current = now;
      refreshSession();
    }
  }

  function addActivityListeners() {
    window.addEventListener('mousemove', onUserActivity);
    window.addEventListener('keydown', onUserActivity);
    window.addEventListener('click', onUserActivity);
    window.addEventListener('touchstart', onUserActivity);
    window.addEventListener('touchmove', onUserActivity);
  // removed scroll and mouseover listeners per request
  }

  function removeActivityListeners() {
    window.removeEventListener('mousemove', onUserActivity);
    window.removeEventListener('keydown', onUserActivity);
    window.removeEventListener('click', onUserActivity);
    window.removeEventListener('touchstart', onUserActivity);
    window.removeEventListener('touchmove', onUserActivity);
  // removed scroll and mouseover listeners per request
  }

  // Keep adminRef in sync with admin state
  useEffect(() => {
    adminRef.current = admin;
  }, [admin]);

  // Restore session on mount and listen for storage events (sync across tabs)
  useEffect(() => {
    const restored = restoreSessionFromStorage();
    if (restored) {
      setAdmin(restored.admin);
      startInactivityTimer();
    }

    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      const revived = restoreSessionFromStorage();
      if (revived) {
        setAdmin(revived.admin);
        startInactivityTimer();
      } else {
        // cleared or expired
        setAdmin(null);
        stopInactivityTimer();
      }
    }

    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      stopInactivityTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
