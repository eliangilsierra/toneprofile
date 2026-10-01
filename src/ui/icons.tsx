import type { SVGProps } from "react";

// Minimal hand-drawn icon set (1.5px strokes on a 20px grid). Decorative by default.
type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Icon({ title, children, ...props }: IconProps) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const ArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 10h12M11 5l5 5-5 5" />
  </Icon>
);
export const User = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="7" r="3" />
    <path d="M4 16.5c.9-2.6 3.2-4 6-4s5.1 1.4 6 4" />
  </Icon>
);
export const Play = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.5 4.5v11l9-5.5z" fill="currentColor" />
  </Icon>
);
export const Stop = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5.5" y="5.5" width="9" height="9" rx="1" fill="currentColor" />
  </Icon>
);
export const ArrowLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16 10H4M9 5l-5 5 5 5" />
  </Icon>
);
export const Check = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 10.5l4 4 8-9" />
  </Icon>
);
export const Close = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 5l10 10M15 5L5 15" />
  </Icon>
);
export const Alert = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 3l8 14H2L10 3z" />
    <path d="M10 8v4M10 14.5v.5" />
  </Icon>
);
export const Info = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="7.5" />
    <path d="M10 9v5M10 6v.5" />
  </Icon>
);
export const Upload = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 13V3M6 7l4-4 4 4M3 13v3h14v-3" />
  </Icon>
);
export const Download = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 3v10M6 9l4 4 4-4M3 13v3h14v-3" />
  </Icon>
);
export const Printer = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 7V3h8v4M6 14H3V8h14v6h-3M6 11h8v6H6z" />
  </Icon>
);
export const Search = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="9" r="5.5" />
    <path d="M13 13l4 4" />
  </Icon>
);
export const External = (p: IconProps) => (
  <Icon {...p}>
    <path d="M11 3h6v6M17 3l-8 8M14 12v5H3V6h5" />
  </Icon>
);
export const Retry = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16 10a6 6 0 11-2-4.5M16 3v3.5h-3.5" />
  </Icon>
);
export const Waveform = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 10h2M6 6v8M9 3v14M12 7v6M15 5v10M18 10h0" />
  </Icon>
);
export const Plus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 4v12M4 10h12" />
  </Icon>
);
