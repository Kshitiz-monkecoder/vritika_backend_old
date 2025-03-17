export interface SalesPersonOtpRequests {
  phoneNumber: string;
}

export interface SalesPersonVerifyOtpRequests {
  _id: string;
  phoneNumber: string;
  otp: string;
}

export interface SalesPersonCreateRequests {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  selfie: string; // Image URL or base64 string for selfie
  aadharCardNumber: string;
  aadharCardFront: string; // URL or base64 string for Aadhar front side
  aadharCardBack: string; // URL or base64 string for Aadhar back side
  panCardNumber: string;
  panCardFront: string; // URL or base64 string for PAN card front side
  bankAccountNumber: string;
  bankIfscCode: string;
  bankAccountName: string;
  cancelChequePhoto: string;
}
