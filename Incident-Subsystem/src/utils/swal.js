const stripHtml = (value = "") => String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const buildMessage = ({ title, text, html, icon }) => {
  const parts = [];
  if (icon) {
    parts.push(icon.charAt(0).toUpperCase() + icon.slice(1));
  }
  if (title) {
    parts.push(title);
  }
  if (text) {
    parts.push(text);
  }
  if (html) {
    parts.push(stripHtml(html));
  }
  return parts.filter(Boolean).join("\n\n");
};

const fire = async (options = {}) => {
  if (typeof window === "undefined") {
    return { isConfirmed: true, isDismissed: false };
  }

  const message = buildMessage(options) || "Continue?";

  if (options.showCancelButton) {
    const isConfirmed = window.confirm(message);
    return { isConfirmed, isDismissed: !isConfirmed };
  }

  window.alert(message);
  return { isConfirmed: true, isDismissed: false };
};

const Swal = { fire };

export default Swal;
