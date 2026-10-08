const ROTATION = { down: 0, left: 90, up: 180, right: 270 } as const;

export function ArrowIcon({ direction }: { direction: keyof typeof ROTATION }) {
  return (
    <svg
      viewBox="0 0 16 24"
      width="16"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      style={{ transform: `rotate(${ROTATION[direction]}deg)` }}
    >
      <path d="M8 1v21M2 16l6 6 6-6" />
    </svg>
  );
}
