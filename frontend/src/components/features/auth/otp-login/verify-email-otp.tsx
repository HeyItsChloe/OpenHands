import { Dispatch, SetStateAction, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import WarningIcon from "#/assets/warning.svg?react";

interface VerifyEmailOTPPProps {
  setIsOTPComplete: Dispatch<SetStateAction<boolean>>;
  setIsReadyToVerifyEmail: Dispatch<SetStateAction<boolean>>;
}

function VerifyEmailOTP({
  setIsOTPComplete,
  setIsReadyToVerifyEmail,
}: VerifyEmailOTPPProps) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isOTPIncorrect, setIsOTPIncorrect] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyOTP = (otpValue: string) => {
    console.log("Verifying OTP:", otpValue);
    // TODO: validate OTP -> compare input to emailed OTP value pulled from ?
    if (isOTPIncorrect) {
      // check if pin is correct (isVerified)
      setIsOTPComplete(true);
    } else {
      setIsOTPIncorrect(true);
      // reset form
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    // auto-focus next input
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const otpValue = otp.join("");
    verifyOTP(otpValue);
  };

  const buttonLabelClasses = "text-sm font-medium leading-5 px-1";

  return (
    <>
      <span className="text-[39px] font-medium text-center">
        {t("Enter Code")}
      </span>

      <span className="text-[14px] font-[400] text-[#A3A3A3] w-[355px] text-center">
        {t(
          "An OTP code has been sent to your email address. Enter that code here. Didn’t receive it? Resend Code (link)",
        )}
      </span>

      <div className="flex flex-col gap-[31px] w-full items-center">
        {/* OTP Inputs */}
        <form
          className="flex gap-[8px] w-[210px] mx-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          {otp.map((value, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              inputMode="numeric"
              maxLength={1}
              className="flex-1 bg-[#454545] border border-[#727987] w-[30px] h-[40px] rounded-[5px] text-center"
            />
          ))}
        </form>

        {isOTPIncorrect && (
          <div className="flex items-center bg-[#4A0709] border border-[#FF0006] w-full h-[40px] rounded-[4px] gap-[14px] pr-[14px] pl-[14px]">
            <WarningIcon />
            {/* make error dynamic */}
            <span>{t("That code was invalid, please try again.")}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-[6px] h-[40px] text-[14px] font-[510] w-full">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-[#FFFFFF] rounded-[4px] text-[#000000]"
            disabled={otp.some((d) => d === "")}
          >
            <span className={buttonLabelClasses}>{t("Next")}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReadyToVerifyEmail(false)}
            className="flex-1 border border-[#FFFFFF] rounded-[4px]"
          >
            <span className={buttonLabelClasses}>{t("Back")}</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default VerifyEmailOTP;
