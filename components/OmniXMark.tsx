export function OmniXMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <ellipse cx="32" cy="32" rx="23" ry="11" stroke="currentColor" strokeWidth="2.4" opacity=".45" transform="rotate(-18 32 32)" />
      <g fill="currentColor">
        <rect x="12" y="28" width="18" height="8" rx="4" transform="rotate(45 32 32)" />
        <rect x="34" y="28" width="18" height="8" rx="4" transform="rotate(45 32 32)" />
        <rect x="12" y="28" width="18" height="8" rx="4" transform="rotate(-45 32 32)" />
        <rect x="34" y="28" width="18" height="8" rx="4" transform="rotate(-45 32 32)" />
        <path d="M32 26c1 3.7 2.3 5 6 6-3.7 1-5 2.3-6 6-1-3.7-2.3-5-6-6 3.7-1 5-2.3 6-6Z" />
      </g>
    </svg>
  );
}
