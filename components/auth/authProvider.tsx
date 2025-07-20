
"use client";
import { services } from '@/services';
import { redirect, usePathname } from 'next/navigation';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Message } from '@/services/common';

export const AuthContext = createContext<{ email: string, isAdmin: boolean } | null>(null);

const protectedRoutes = [
  '/dashboard',
  '/dashboard/forms',
  '/dashboard/admin',
  '/build',
  '/submit'
]

const externalRoutes = [
  '/submit',
  '/access'
]


const AuthProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState("")
  const isProtectedRoute = protectedRoutes.includes(pathname) || protectedRoutes.includes("/" + pathname.split("/")[1])
  const isExternalRoute = externalRoutes.includes(pathname) || externalRoutes.includes("/" + pathname.split("/")[1])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setAdmin] = useState(false)

  const checkExternalAccess = async () => {
    const userSession = await services.user.getSession()
    if ((userSession as Message).statusCode === 401 || (userSession as Message).statusCode === 404) {
      return false
    }
    setIsAuthenticated(true)
    setUserEmail((userSession as { email: string }).email)
    return true
  }

  const checkSession = async () => {
    if (isExternalRoute) {
      const externalAccess = await checkExternalAccess()
      if (externalAccess) return
    }
    const adminsession = await services.admin.getSession()
    const notAdminAccess = (adminsession as Message).statusCode === 401 || (adminsession as Message).statusCode === 404
    if (notAdminAccess && isExternalRoute) {
      redirect(`/access?redirect=${pathname}`)
    }
    if (notAdminAccess) {
      redirect("/")
    }
    setAdmin(true)
    setIsAuthenticated(true)
    setUserEmail((adminsession as { email: string }).email)
    if (!isProtectedRoute && !isExternalRoute) {
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
    <AuthContext.Provider value={{ email: userEmail, isAdmin: isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider