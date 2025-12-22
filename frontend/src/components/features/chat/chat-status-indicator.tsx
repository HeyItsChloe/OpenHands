import DebugStackframeDot from "#/icons/debug-stackframe-dot.svg?react";

interface ChatStatusIndicatorProps {
  status: string;
  statusColor: string;
}

function ChatStatusIndicator({
  status,
  statusColor,
}: ChatStatusIndicatorProps) {
  return (
    <div
      data-testid="chat-status-indicator"
      className="h-[31px] w-fit rounded-[100px] pt-[20px] pr-[16px] pb-[20px] pl-[5px] bg-[#25272D] flex items-center mb-[8px]"
    >
      <span className="animate-[pulse_1.2s_ease-in-out_infinite]">
        <DebugStackframeDot className="w-6 h-6 shrink-0" color={statusColor} />
      </span>
      <span className="font-normal text-[11px] leading-[20px] normal-case">
        {status}
      </span>
    </div>
  );
}

export default ChatStatusIndicator;
