import { useTranslation } from "react-i18next";

export function VerificationAlert() {
  const { t } = useTranslation();
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-sm mt-4"
      role="alert"
    >
      <p className="font-bold">{t("SETTINGS$EMAIL_VERIFICATION_REQUIRED")}</p>
      <p className="text-sm">
        {t("SETTINGS$EMAIL_VERIFICATION_RESTRICTION_MESSAGE")}
      </p>
    </div>
  );
}
