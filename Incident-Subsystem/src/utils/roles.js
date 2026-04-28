export const ROLE_LABELS = Object.freeze({
  admin: "Admin",
  staff1: "Staff 1",
  staff2: "Staff 2",
  staff3: "Staff 3",
  resident: "Resident",
  super_admin: "Admin",
});

export const normalizeRole = (role) => String(role || "").trim().toLowerCase();

export const getRoleLabel = (role) => {
  const normalized = normalizeRole(role);
  return ROLE_LABELS[normalized] || (normalized ? normalized : "Unknown");
};

export const ADMIN_CREATE_ACCOUNT_ROLES = Object.freeze([
  "admin",
  "staff1",
  "staff2",
  "staff3",
]);

export const getAdminCreateAccountRoleOptions = () =>
  ADMIN_CREATE_ACCOUNT_ROLES.map((value) => ({
    value,
    label: getRoleLabel(value),
  }));

export const getRoleHomePath = (role) => {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case "admin":
    case "super_admin":
      return "/admin";
    case "staff1":
      return "/admin";
    case "staff2":
      return "/admin";
    case "staff3":
      return "/admin";
    default:
      return "/sub-system-2";
  }
};

