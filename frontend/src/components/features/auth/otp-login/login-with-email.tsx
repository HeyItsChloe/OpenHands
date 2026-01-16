import { Dispatch, SetStateAction, useState } from "react";
import { TermsAndPrivacyNotice } from "#/components/shared/terms-and-privacy-notice";
import EnterEmailOTP from "./enter-email-otp";
import VerifyEmailOTP from "./verify-email-otp";
import LoginOrgSelector from "./login-org-selector";
import TOSReview from "../tos-review";
import FullScreenModal from "#/components/shared/modals/full-screen-modal";

interface LoginWithEmailProps {
  setIsLogginInWithEmail: Dispatch<SetStateAction<boolean>>;
}

function LoginWithEmail({ setIsLogginInWithEmail }: LoginWithEmailProps) {
  const [isReadyToVerifyEmail, setIsReadyToVerifyEmail] = useState(false);
  const [isOrgSelected, setIsOrgSelected] = useState(false);
  const [isOTPComplete, setIsOTPComplete] = useState(false);
  const [isTOSReviewComplete, setIsTOSReviewComplete] = useState(false);

  // const handleLogin = () => {
  // if all are true - tos, otp, orgselect (useEffect?)
  // trigger login methods when all steps are complete
  // returns loading state
  // redirect to home screen
  // how/where to render loading screen?
  // }

  return (
    <FullScreenModal
      footer={
        !isOTPComplete ? (
          <TermsAndPrivacyNotice className="max-w-[320px] text-[#A3A3A3]" />
        ) : undefined
      }
    >
      {/* Step 1: Enter Email */}
      {!isOTPComplete && !isReadyToVerifyEmail && (
        <EnterEmailOTP
          setIsLogginInWithEmail={setIsLogginInWithEmail}
          setIsReadyToVerifyEmail={setIsReadyToVerifyEmail}
        />
      )}

      {/* Step 2: Verify Email via OTP */}
      {!isOTPComplete && isReadyToVerifyEmail && (
        <VerifyEmailOTP
          setIsReadyToVerifyEmail={setIsReadyToVerifyEmail}
          setIsOTPComplete={setIsOTPComplete}
        />
      )}

      {/* Step 3: Org Selection */}
      {isOTPComplete && !isOrgSelected && (
        <LoginOrgSelector setIsOrgSelected={setIsOrgSelected} />
      )}

      {/* Step 4: TOS Review */}
      {isOTPComplete && isOrgSelected && !isTOSReviewComplete && (
        <TOSReview
          setIsOrgSelected={setIsOrgSelected}
          setIsTOSReviewComplete={setIsTOSReviewComplete}
        />
      )}
    </FullScreenModal>
  );
}

export default LoginWithEmail;
