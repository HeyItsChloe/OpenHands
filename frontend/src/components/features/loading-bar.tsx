import OpenHandsLogoWhite from "#/assets/branding/openhands-logo-white.svg?react";

function LoadingBar() {
  return (
    <div>
      {/* Loading */}
      <OpenHandsLogoWhite className="fixed top-4" width={106} height={72} />

      <div className="w-full h-2 bg-gray-300 rounded overflow-hidden">
        <div className="h-full bg-blue-500 animate-pulse w-1/3" />
      </div>
    </div>
  );
}

export default LoadingBar;
