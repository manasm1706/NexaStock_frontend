import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  showWordmark?: boolean;
  size?: number;
};

/**
 * NexaStock mark — an abstract "N" formed by two flowing nodes connected
 * by a kinetic supply line. Represents warehouse → store → intelligence flow.
 */
export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={cn("shrink-0", className)}
      aria-label="NexaStock"
    >
      <defs>
        <linearGradient id="nx-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.78 0.18 258)" />
          <stop offset="55%" stopColor="oklch(0.66 0.22 268)" />
          <stop offset="100%" stopColor="oklch(0.62 0.24 290)" />
        </linearGradient>
        <linearGradient id="nx-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.85 0.16 258)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="oklch(0.62 0.24 290)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {/* Outer rounded badge */}
      <rect x="1" y="1" width="38" height="38" rx="11"
        fill="url(#nx-grad)" />
      <rect x="1" y="1" width="38" height="38" rx="11"
        fill="black" fillOpacity="0.0" stroke="white" strokeOpacity="0.18" />
      {/* Abstract N: two nodes + diagonal flow */}
      <g>
        <circle cx="12" cy="12" r="3.2" fill="white" />
        <circle cx="28" cy="28" r="3.2" fill="white" />
        <path d="M12 12 L12 28 L28 12 L28 28"
          stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* kinetic accent */}
        <path d="M12 28 L28 12" stroke="url(#nx-line)" strokeWidth="2.6" strokeLinecap="round" opacity="0.95" />
      </g>
    </svg>
  );
}

export function Logo({ className, showWordmark = true, size = 30 }: Props) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className="font-semibold tracking-tight text-[1.05rem] text-foreground">
          Nexa<span className="text-foreground/70">Stock</span>
        </span>
      )}
    </div>
  );
}
