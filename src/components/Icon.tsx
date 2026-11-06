type IconName = "timer" | "board" | "plus" | "grip" | "trash" | "play" | "pause" | "reset";

const paths: Record<IconName, React.ReactNode> = {
  timer: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2M9 2h6M12 2v3" /></>,
  board: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M12 3v18M3 12h18" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  grip: <><path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" strokeWidth="3" /></>,
  trash: <><path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7" /></>,
  play: <path d="m8 4 12 8-12 8Z" />,
  pause: <path d="M8 4v16M16 4v16" />,
  reset: <><path d="M3 4v6h6M3 10a9 9 0 1 1 1 8" /></>,
};

export default function Icon({ name }: { name: IconName }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
