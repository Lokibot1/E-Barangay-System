import { PHP_API_BASE_URL } from "../../config/runtimeApi";
import { requestJson } from "../../services/shared/http";

const APPROVAL_EMAIL_URL = `${PHP_API_BASE_URL}/notifications/send-verification-approved-email.php`;

export const sendVerificationApprovedEmail = async ({
  email,
  name,
  barangayId,
  username,
  temporaryPassword,
  verificationUrl,
}) => {
  return requestJson(APPROVAL_EMAIL_URL, {
    method: "POST",
    includeJson: true,
    body: JSON.stringify({
      email,
      name,
      barangay_id: barangayId,
      username,
      temporary_password: temporaryPassword,
      verification_url: verificationUrl,
    }),
    errorMessage: "Failed to send approval email.",
  });
};
