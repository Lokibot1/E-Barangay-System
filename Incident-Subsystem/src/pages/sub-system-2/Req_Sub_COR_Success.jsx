import React from "react";
import DocumentSubmissionSuccessPage from "../../components/sub-system-2/DocumentSubmissionSuccessPage";

const Req_Sub_COR_Success = () => (
  <DocumentSubmissionSuccessPage
    documentKey="cor"
    serviceTitle="Certificate of Residency"
    successMessage="Your request for a Certificate of Residency has been received and is now queued for review."
    requirements="Valid ID and personal appearance for pickup."
    fee="PHP 0.00"
    validityLabel="Validity: 6 months"
  />
);

export default Req_Sub_COR_Success;
