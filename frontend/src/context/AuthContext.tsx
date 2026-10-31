import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'ADMIN' | 'SECURITY_ANALYST' | 'SOC_OPERATOR' | 'OT_OPERATOR' | 'VIEWER';

export interface UserProfile {
  id: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  setRole: (role: UserRole) => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  canApproveResponse: () => boolean;
  canExecuteSimulation: () => boolean;
  canModifyAssets: () => boolean;
  canAdministerSystem: () => boolean;
}

const defaultUser: UserProfile = {
  id: 1,
  username: 'soc_analyst',
  name: 'Alex Mercer',
  email: 'a.mercer@icsshield.internal',
  role: 'SECURITY_ANALYST',
  department: 'ICS Cybersecurity Operations',
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  role: 'SECURITY_ANALYST',
  setRole: () => {},
  hasRole: () => true,
  canApproveResponse: () => true,
  canExecuteSimulation: () => true,
  canModifyAssets: () => true,
  canAdministerSystem: () => true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('ics_user_role');
    return (saved as UserRole) || 'SECURITY_ANALYST';
  });

  const [user, setUser] = useState<UserProfile>({
    ...defaultUser,
    role: role,
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('ics_user_role', newRole);
    setUser((prev) => ({ ...prev, role: newRole }));
  };

  useEffect(() => {
    setUser((prev) => ({ ...prev, role }));
  }, [role]);

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    return allowedRoles.includes(role);
  };

  const canApproveResponse = (): boolean => {
    return ['ADMIN', 'SECURITY_ANALYST'].includes(role);
  };

  const canExecuteSimulation = (): boolean => {
    return ['ADMIN', 'SECURITY_ANALYST', 'SOC_OPERATOR'].includes(role);
  };

  const canModifyAssets = (): boolean => {
    return ['ADMIN', 'OT_OPERATOR'].includes(role);
  };

  const canAdministerSystem = (): boolean => {
    return role === 'ADMIN';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        hasRole,
        canApproveResponse,
        canExecuteSimulation,
        canModifyAssets,
        canAdministerSystem,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
