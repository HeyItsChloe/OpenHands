import { ReactNode } from "react";
import OpenHandsLogoWhite from "#/assets/branding/openhands-logo-white.svg?react";

interface ModalProps {
  children: ReactNode;
  show?: boolean;
  className?: string;
  footer?: ReactNode;
}

function FullScreenModal({
  children,
  show = true,
  className = "",
  footer,
}: ModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Logo fixed at top */}
      <OpenHandsLogoWhite className="fixed top-4" width={106} height={72} />

      {/* Modal content */}
      <div
        className={`flex flex-col gap-4 rounded-lg text-white w-[475px] items-center ${className}`}
      >
        {children}

        {/* Optional footer */}
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}

export default FullScreenModal;
