/**
 * ProtectedRoute.jsx
 * Route guards for authentication and role-based access.
 *
 * Location: src/homepage/ProtectedRoute.jsx
 *
 * Import in App.jsx:
 *   import ProtectedRoute, { AdminRoute, UserRoute } from "./homepage/ProtectedRoute";
 */

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, isAdmin } from "./services/loginService"; // ← relative: same homepage/ folder

/**
 * General auth guard — redirects to /login if not logged in.
 */
const ProtectedRoute = () => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <Outlet />;
};

/**
 * Admin-only guard — redirects regular users to /sub-system-2.
 */
export const AdminRoute = () => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/sub-system-2" replace />;
  return <Outlet />;
};

/**
 * User-only guard — redirects admins to /admin.
 */
export const UserRoute = () => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (isAdmin()) return <Navigate to="/admin" replace />;
  return <Outlet />;
};

export default ProtectedRoute;