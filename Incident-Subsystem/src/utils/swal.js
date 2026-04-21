import SweetAlert from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const mergeCustomClasses = (base = {}, extra = {}) => {
  const keys = new Set([...Object.keys(base), ...Object.keys(extra)]);

  return Array.from(keys).reduce((result, key) => {
    result[key] = [base[key], extra[key]].filter(Boolean).join(" ").trim();
    return result;
  }, {});
};

const getThemeConfig = () => {
  const theme =
    typeof window !== "undefined"
      ? localStorage.getItem("appTheme") || "modern"
      : "modern";

  const isDark = theme === "dark";

  return {
    backdrop: "rgba(15, 23, 42, 0.58)",
    background: isDark ? "#0f172a" : "#ffffff",
    color: isDark ? "#e2e8f0" : "#0f172a",
    customClass: {
      popup: [
        "ebs-swal-popup",
        "rounded-[28px]",
        "border",
        "px-2",
        isDark
          ? "border-slate-700 shadow-[0_24px_65px_-35px_rgba(2,6,23,0.92)]"
          : "border-slate-200 shadow-[0_24px_65px_-35px_rgba(15,23,42,0.4)]",
      ].join(" "),
      title: [
        "font-spartan",
        "text-[1.75rem]",
        "font-bold",
        "tracking-tight",
        isDark ? "text-slate-100" : "text-slate-900",
      ].join(" "),
      htmlContainer: [
        "font-kumbh",
        "text-[0.98rem]",
        "leading-7",
        isDark ? "text-slate-300" : "text-slate-600",
      ].join(" "),
      actions: "gap-3 pt-6",
      confirmButton:
        "rounded-full px-5 py-3 font-kumbh text-sm font-semibold shadow-none focus:outline-none",
      cancelButton:
        "rounded-full px-5 py-3 font-kumbh text-sm font-semibold shadow-none focus:outline-none",
    },
  };
};

const fire = async (options = {}) => {
  if (typeof window === "undefined") {
    return { isConfirmed: true, isDismissed: false };
  }

  const themeConfig = getThemeConfig();
  const hasMessage =
    Boolean(options.title) || Boolean(options.text) || Boolean(options.html);

  return SweetAlert.fire({
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    reverseButtons: false,
    buttonsStyling: true,
    heightAuto: false,
    allowOutsideClick: true,
    ...themeConfig,
    ...(hasMessage ? {} : { text: "Continue?" }),
    ...options,
    customClass: mergeCustomClasses(
      themeConfig.customClass,
      options.customClass || {},
    ),
  });
};

const Swal = { fire };

export default Swal;
