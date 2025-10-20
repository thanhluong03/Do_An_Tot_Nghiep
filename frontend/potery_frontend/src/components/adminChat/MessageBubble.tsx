import React from "react";

interface Props {
  content: string;
  senderType: "ADMIN" | "USER";
  sentAt?: string;
}

export const MessageBubble: React.FC<Props> = ({
  content,
  senderType,
  sentAt,
}) => {
  const formattedTime = sentAt
    ? new Date(sentAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const isAdmin = senderType === "ADMIN";

  return (
    <div className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
      <div
        className={`px-4 py-2 rounded-2xl max-w-[70%] break-words shadow-sm ${
          isAdmin
            ? "bg-orange-500 text-white"
            : "bg-white text-gray-800 border border-orange-200"
        }`}
      >
        {content}
      </div>
      {sentAt && (
        <span className="text-xs text-gray-400 mt-1">{formattedTime}</span>
      )}
    </div>
  );
};
