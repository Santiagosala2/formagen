
"use client";
import { services } from '@/services';
import { redirect, usePathname } from 'next/navigation';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Message } from '@/services/common';

export const AuthContext = createContext<{ email: string } | null>(null);

const protectedRoutes = [
  '/dashboard',
  '/dashboard/forms',
  '/dashboard/admin',
  '/build',
  '/submit'
]


const AuthProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const [adminUserEmail, setAdminUserEmail] = useState("")
  const isProtectedRoute = protectedRoutes.includes(pathname) || protectedRoutes.includes("/" + pathname.split("/")[1])
  const [isAuthenticated, setIsAuthenticated] = useState(false)


  const checkSession = async () => {
    const session = await services.admin.getSession()
    if ((session as Message).statusCode === 401 || (session as Message).statusCode === 404) {
      redirect("/")
    }
    setIsAuthenticated(true)
    setAdminUserEmail((session as { email: string }).email)
    if (!isProtectedRoute) {
      redirect("/dashboard/forms")
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  if (!isAuthenticated && isProtectedRoute) {
    return null
  }

  return (
    <AuthContext.Provider value={{ email: adminUserEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider