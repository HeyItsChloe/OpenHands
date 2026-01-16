import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface EnterEmailOTPProps {
  setIsLogginInWithEmail: Dispatch<SetStateAction<boolean>>;
  setIsReadyToVerifyEmail: Dispatch<SetStateAction<boolean>>;
}

function EnterEmailOTP({
  setIsLogginInWithEmail,
  setIsReadyToVerifyEmail,
}: EnterEmailOTPProps) {
  const { t } = useTranslation();

  const handleEnterEmailClick = () => {
    // send user email
    console.log("entered email!");
    setIsReadyToVerifyEmail(true); // render OTP screen
  };

  const buttonLabelClasses = "text-sm font-medium leading-5 px-1";
  return (
    <>
      <span className="text-[39px] font-medium text-center">
        {t("Sign-in with your email")}
      </span>

      <div className="flex flex-col gap-[6px] w-full">
        <label className="font-[400] text-[14px]">
          {t("Your email address")}
          <input
            data-test-id="email-address-input"
            placeholder="name@email.com (i18n)"
            className="w-full h-[40px] bg-[#454545] border border-solid rounded-[5px] px-[10px] pl-[15px]"
          />
        </label>
      </div>

      <div className="flex gap-[6px] h-[40px] text-[14px] weight-[510px] w-full">
        <button
          type="button"
          onClick={handleEnterEmailClick}
          className="flex-1 bg-[#FFFFFF] rounded-[4px] text-[#000000]"
        >
          <span className={buttonLabelClasses}>{t("Verify")}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsLogginInWithEmail(false)}
          className="flex-1 border border-[#FFFFFF] rounded-[4px]"
        >
          <span className={buttonLabelClasses}>{t("Cancel")}</span>
        </button>
      </div>
    </>
  );
}

export default EnterEmailOTP;
