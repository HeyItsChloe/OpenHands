import { cn } from "@heroui/react";
import { Dispatch, SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";

interface LoginOrgSelectorProps {
  setIsOrgSelected: Dispatch<SetStateAction<boolean>>;
}

function LoginOrgSelector({ setIsOrgSelected }: LoginOrgSelectorProps) {
  const { t } = useTranslation();
  const buttonLabelClasses = "text-sm font-medium leading-5 px-1";
  const orgs = ["org1", "org2"];
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  const handleSelectOrg = () => {
    // orgId: string
    // set selected org
    // render TOS conditionally
    setIsOrgSelected(true);
  };

  return (
    <div className="flex flex-col block w-[700px] text-left gap-[32px]">
      <span className="text-[39px] font-medium">{t("Login as")}</span>

      {/* multiple orgs should not move container */}
      <div className="flex flex-col gap-[10px]">
        {orgs.map((org: string) => {
          const isSelected = selectedOrg === org;

          return (
            <div
              key={org}
              onClick={() => setSelectedOrg(org)}
              className={cn(`
                                pt-[32px] pb-[32px] px-[20px] w-full rounded-[12px] border-[2px] cursor-pointer
                                ${isSelected ? "border-white" : "border-[#727987]"}
                            `)}
            >
              {org}
            </div>
          );
        })}

        {/* where to store/fetch last selected org? */}
        <div className="flex items-center gap-[8px]">
          <input
            type="checkbox"
            id="remember-org"
            className="h-[16px] w-[16px] rounded-[4px]  border-[#D4D4D4] bg-[#FFFFFF] accent-white"
          />
          <label
            htmlFor="remember-org"
            className="text-[12px] font-[400] text-[#A3A3A3] cursor-pointer"
          >
            {t("Always login to last used")}
          </label>
        </div>
      </div>

      <button
        type="button"
        // pass orgid as arg
        onClick={() => handleSelectOrg()}
        className="flex-1 bg-[#FFFFFF] rounded-[4px] text-[#000000] h-[40px] w-[147px] p-[10px]"
      >
        <span className={buttonLabelClasses}>{t("Login")}</span>
      </button>
    </div>
  );
}

export default LoginOrgSelector;
