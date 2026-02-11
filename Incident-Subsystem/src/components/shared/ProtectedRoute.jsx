import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, isAdmin } from "../../services/sub-system-3/loginService";

/**
 * General auth guard — redirects to /login if not logged in.
 */
const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

/**
 * Admin-only guard — redirects regular users to /.
 */
export const AdminRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

/**
 * User-only guard — redirects admins to /admin.
 */
export const UserRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (isAdmin()) {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
