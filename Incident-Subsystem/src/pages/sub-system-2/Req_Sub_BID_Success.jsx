import React from "react";
import DocumentSubmissionSuccessPage from "../../components/sub-system-2/DocumentSubmissionSuccessPage";
import gcashInstapayQr from "../../assets/images/gcash-instapay-qr.jpg";

const Req_Sub_BID_Success = () => (
  <DocumentSubmissionSuccessPage
    documentKey="bid"
    serviceTitle="Barangay ID"
    successMessage="Your application for a Barangay ID has been received and is now awaiting review."
    requirements="Valid ID, proof of billing, and personal appearance."
    fee="PHP 20.00 (Voter), PHP 30.00 (Non-voter)"
    validityLabel="Validity: 1 year"
    sideQrImageSrc={gcashInstapayQr}
    sideQrTitle="GCash QR"
    sideQrCaption="Scan to pay via GCash / InstaPay"
  />
);

export default Req_Sub_BID_Success;
