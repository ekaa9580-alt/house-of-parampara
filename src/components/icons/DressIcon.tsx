/** Simple dress / saree silhouette for Women category */
export function DressIcon({
  className,
  strokeWidth = 1.5,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 4h6" />
      <path d="M10 4v2.2L8 9l-3 11h14L16 9l-2-2.8V4" />
      <path d="M8 9h8" />
    </svg>
  );
}
