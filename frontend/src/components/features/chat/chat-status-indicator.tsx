import DebugStackframeDot from "#/icons/debug-stackframe-dot.svg?react";

interface ChatStatusIndicatorProps {
  status: string;
  statusColor: string;
}

function ChatStatusIndicator({
  status,
  statusColor,
}: ChatStatusIndicatorProps) {
  const formatString = (str: string) =>
    str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase(),
    );

  return (
    <div
      id="chat-status-indicator"
      className="
                h-[31px]
                w-fit
                rounded-[100px]
                pt-[20px]
                pr-[16px]
                pb-[20px]
                pl-[5px]
                bg-[#25272D]
                flex
                items-center
                mb-[8px]
                "
    >
      <span className="animate-[pulse_1.2s_ease-in-out_infinite]">
        <DebugStackframeDot className="w-6 h-6 shrink-0" color={statusColor} />
      </span>
      <div className="font-normal text-[11px] leading-[20px]">
        {formatString(status)}
      </div>
    </div>
  );
}

export default ChatStatusIndicator;
