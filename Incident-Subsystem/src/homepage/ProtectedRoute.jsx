/**
 * ProtectedRoute.jsx
 * Route guards for authentication and role-based access.
 *
 * Location: src/homepage/ProtectedRoute.jsx
 */

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  canAccessAdminPanel,
  canAccessStaffPanel,
  getDefaultAuthenticatedPath,
  isAuthenticated,
} from "./services/loginService";
import { requiresSecondFactor } from "../utils/securityCenter";

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
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (!canAccessAdminPanel()) {
    return <Navigate to={getDefaultAuthenticatedPath()} replace />;
  }

  if (requiresSecondFactor()) {
    return (
      <Navigate
        to="/second-factor"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }
  
  return <Outlet />;
};

export const StaffRoute = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (canAccessAdminPanel()) {
    return <Navigate to="/admin" replace />;
  }

  if (!canAccessStaffPanel()) {
    return <Navigate to="/sub-system-2" replace />;
  }

  if (requiresSecondFactor()) {
    return (
      <Navigate
        to="/second-factor"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
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
  
  if (canAccessStaffPanel()) {
    return <Navigate to={getDefaultAuthenticatedPath()} replace />;
  }
  
  return <Outlet />;
};

export const PermissionRoute = ({
  allowed,
  redirectTo = getDefaultAuthenticatedPath(),
}) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const isAllowed =
    typeof allowed === "function" ? allowed() : Boolean(allowed);

  if (!isAllowed) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
          redirectTo,
        }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
