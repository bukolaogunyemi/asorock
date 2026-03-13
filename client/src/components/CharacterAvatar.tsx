const AVATAR_COLORS = [
  "bg-emerald-600", "bg-blue-600", "bg-amber-600", "bg-red-600",
  "bg-purple-600", "bg-pink-600", "bg-cyan-600", "bg-orange-600",
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface CharacterAvatarProps {
  name: string;
  initials: string;
  size?: "sm" | "md" | "lg";
}

export function CharacterAvatar({ name, initials, size = "sm" }: CharacterAvatarProps) {
  const colorIndex = hashCode(name) % AVATAR_COLORS.length;
  const bgColor = AVATAR_COLORS[colorIndex];
  const sizeClass = size === "lg" ? "h-12 w-12 text-base" : size === "md" ? "h-9 w-9 text-sm" : "h-7 w-7 text-xs";

  return (
    <div className={`${bgColor} ${sizeClass} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials.slice(0, 2)}
    </div>
  );
}
