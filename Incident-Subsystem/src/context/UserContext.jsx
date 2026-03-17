import React, { createContext, useContext, useState } from "react";
import { clearAuth, getUser } from "../homepage/services/loginService";

const ADMIN_NOTIFICATIONS_KEY = "adminNotifications";
const USER_NOTIFICATIONS_KEY = "userNotifications";
const COMPLAINT_DRAFT_KEY = "complaint_draft";
const INCIDENT_DRAFT_KEY = "incident_report_draft";
const SIGNUP_DRAFT_KEY = "signup_draft";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: "Juan Dela Cruz",
    role: "Barangay Staff",
  });

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const logout = () => {
    const storedUser = getUser();
    setUser(null);
    clearAuth();

    localStorage.removeItem(ADMIN_NOTIFICATIONS_KEY);
    localStorage.removeItem(COMPLAINT_DRAFT_KEY);
    localStorage.removeItem(INCIDENT_DRAFT_KEY);
    localStorage.removeItem(SIGNUP_DRAFT_KEY);

    if (storedUser?.id) {
      localStorage.removeItem(`${USER_NOTIFICATIONS_KEY}_${storedUser.id}`);
    }
    localStorage.removeItem(USER_NOTIFICATIONS_KEY);
  };

  return (
    <UserContext.Provider value={{ user, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
