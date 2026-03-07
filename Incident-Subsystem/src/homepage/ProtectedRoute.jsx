/**
 * ProtectedRoute.jsx
 * Route guards for authentication and role-based access.
 *
 * Location: src/homepage/ProtectedRoute.jsx
 */

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, isAdmin } from "./services/loginService";

/**
 * General auth guard — redirects to /login if not logged in.
 * Used for routes that both Admin and User can access.
 */
const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

/**
 * Admin-only guard — redirects regular users to /dashboard or /sub-system-2.
 * This prevents regular residents from accessing the Admin Panel.
 */
export const AdminRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin()) {
    // If authenticated but NOT an admin, kick them back to the user area
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

/**
 * User-only guard — redirects admins to /admin.
 * This prevents Admins from seeing the "Resident-only" registration or tracking views.
 */
export const UserRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (isAdmin()) {
    // If authenticated and IS an admin, redirect to admin home
    return <Navigate to="/admin" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;