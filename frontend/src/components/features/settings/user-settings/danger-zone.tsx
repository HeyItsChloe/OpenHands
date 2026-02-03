import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { BrandButton } from "#/components/features/settings/brand-button";

interface DangerZoneProps {
  onDeleteAccountClick: () => void;
}

export function DangerZone({ onDeleteAccountClick }: DangerZoneProps) {
  const { t } = useTranslation();

  return (
    <div
      className="mt-8 border border-red-600 rounded-lg p-4"
      data-testid="danger-zone"
    >
      <h3 className="text-lg font-semibold text-red-500 mb-4">
        {t(I18nKey.SETTINGS$DANGER_ZONE)}
      </h3>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium">
            {t(I18nKey.SETTINGS$DELETE_ACCOUNT)}
          </span>
          <span className="text-sm text-[#A3A3A3]">
            {t(I18nKey.SETTINGS$DELETE_ACCOUNT_DESCRIPTION)}
          </span>
        </div>
        <BrandButton
          type="button"
          variant="danger"
          onClick={onDeleteAccountClick}
          testId="delete-account-button"
        >
          {t(I18nKey.SETTINGS$DELETE_ACCOUNT)}
        </BrandButton>
      </div>
    </div>
  );
}
