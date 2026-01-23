import React from "react";

interface VerificationBadgeProps {
  verified?: boolean;
  verifiedAt?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-sm px-2 py-1",
  lg: "text-base px-3 py-1.5"
};

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ verified, verifiedAt, size = "md" }) => {
  if (!verified) return null;

  const formattedDate = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "";

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full bg-green-100 text-green-800 ${SIZE_CLASSES[size]}`}
      title={formattedDate ? `Verified since ${formattedDate}` : "Verified shelter"}
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      Verified
    </span>
  );
};

export default VerificationBadge;
