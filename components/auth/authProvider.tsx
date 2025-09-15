
"use client";
import { services } from '@/services';
import { redirect, usePathname } from 'next/navigation';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Message } from '@/services/common';

export const AuthContext = createContext<{ email: string, isAdmin: boolean, id: string } | null>(null);

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

const publicRoutes = [
  '/home',
  '/playground'
]

type UserSession = { email: string, userId: string }

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const [userDetails, setUserDetails] = useState<UserSession>();
  const isProtectedRoute = protectedRoutes.includes(pathname) || protectedRoutes.includes("/" + pathname.split("/")[1])
  const isExternalRoute = externalRoutes.includes(pathname) || externalRoutes.includes("/" + pathname.split("/")[1])
  const isPublicRoute = publicRoutes.includes(pathname) || publicRoutes.includes("/" + pathname.split("/")[1])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setAdmin] = useState(false)

  const checkExternalAccess = async () => {
    const userSession = await services.user.getSession()
    if ((userSession as Message).statusCode === 401 || (userSession as Message).statusCode === 404) {
      return false
    }
    setIsAuthenticated(true)
    setUserDetails(userSession as UserSession)
    return true
  }

  const checkSession = async () => {
    if (isPublicRoute) {
      return
    }
    if (isExternalRoute) {
      const externalAccess = await checkExternalAccess()
      if (externalAccess) return
    }
    const adminSession = await services.admin.getSession()
    const notAdminAccess = (adminSession as Message).statusCode === 401 || (adminSession as Message).statusCode === 404
    if (notAdminAccess && isExternalRoute && pathname.startsWith("/submit")) {
      redirect(`/access?redirect=${pathname}`)
    }
    if (notAdminAccess) {
      redirect("/")
    }
    setAdmin(true)
    setIsAuthenticated(true)
    setUserDetails(adminSession as UserSession)
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
    <AuthContext.Provider value={{ email: (userDetails! ?? {}).email, isAdmin: isAdmin, id: (userDetails! ?? {}).userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider