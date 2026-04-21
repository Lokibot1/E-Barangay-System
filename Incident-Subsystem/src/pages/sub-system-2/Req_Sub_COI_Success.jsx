import React from "react";
import DocumentSubmissionSuccessPage from "../../components/sub-system-2/DocumentSubmissionSuccessPage";

const Req_Sub_COI_Success = () => (
  <DocumentSubmissionSuccessPage
    documentKey="coi"
    serviceTitle="Certificate of Indigency"
    successMessage="Your request for a Certificate of Indigency has been received and is now queued for processing."
    requirements="Valid ID and personal appearance for pickup."
    fee="PHP 0.00"
    validityLabel="Processing time: 1 to 3 working days"
  />
);

export default Req_Sub_COI_Success;
