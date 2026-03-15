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

/**
 * Maps a character's gender + role/name to an emoji avatar.
 * Detects role from name prefix (Gen., Dr., Barr., etc.) and portfolio/title.
 */
function getAvatarEmoji(gender?: string, role?: string, name?: string): string {
  const female = gender === "Female";

  // Check name prefix
  if (name) {
    if (/^(Gen\.|Brig\.|Col\.|Maj\.|Capt\.|Lt\.)/.test(name)) return female ? "👩🏿‍✈️" : "👨🏿‍✈️";
    if (/^(AIG|DIG|CP |CSP |ASP |Inspector)/.test(name)) return female ? "👮🏿‍♀️" : "👮🏿‍♂️";
    if (/^(Dr\.|Prof\.)/.test(name)) {
      if (role && /health|medical|hospital|doctor|physician/i.test(role)) return female ? "👩🏿‍⚕️" : "👨🏿‍⚕️";
      return female ? "👩🏿‍🎓" : "👨🏿‍🎓";
    }
    if (/^(Barr\.|Justice |Judge )/.test(name)) return female ? "👩🏿‍⚖️" : "👨🏿‍⚖️";
    if (/^(Gov\.)/.test(name)) return female ? "👩🏿‍💼" : "👨🏿‍💼";
  }

  // Check role/portfolio keywords
  if (role) {
    const r = role.toLowerCase();
    if (/military|defence|army|navy|air force|security adviser|national security/i.test(r)) return female ? "👩🏿‍✈️" : "👨🏿‍✈️";
    if (/justice|attorney|judiciary|legal|solicitor|chief judge/i.test(r)) return female ? "👩🏿‍⚖️" : "👨🏿‍⚖️";
    if (/health|medical|hospital/i.test(r)) return female ? "👩🏿‍⚕️" : "👨🏿‍⚕️";
    if (/education|university|academic/i.test(r)) return female ? "👩🏿‍🎓" : "👨🏿‍🎓";
    if (/police|inspector|intelligence/i.test(r)) return female ? "👮🏿‍♀️" : "👮🏿‍♂️";
    if (/engineer|works|infrastructure|construction|housing/i.test(r)) return female ? "👷🏿‍♀️" : "👷🏿‍♂️";
    if (/agriculture|farm/i.test(r)) return female ? "👩🏿‍🌾" : "👨🏿‍🌾";
    if (/journalist|media|press|spokesman|spokesperson/i.test(r)) return female ? "👩🏿‍💻" : "👨🏿‍💻";
  }

  // Default: politician / office worker
  return female ? "👩🏿‍💼" : "👨🏿‍💼";
}

interface CharacterAvatarProps {
  name: string;
  initials: string;
  size?: "sm" | "md" | "lg";
  /** Character gender — enables emoji avatar when provided */
  gender?: string;
  /** Character role/portfolio — refines emoji selection */
  role?: string;
}

export function CharacterAvatar({ name, initials, size = "sm", gender, role }: CharacterAvatarProps) {
  // When gender is known, render emoji avatar
  if (gender) {
    const emoji = getAvatarEmoji(gender, role, name);
    const sizeClass = size === "lg"
      ? "h-14 w-14 text-3xl"
      : size === "md"
      ? "h-10 w-10 text-2xl"
      : "h-8 w-8 text-xl";

    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center flex-shrink-0 border border-border/50`}
        style={{ background: "rgba(255,255,255,0.06)" }}
        title={name}
      >
        <span className="leading-none" role="img" aria-label={`${gender} character`}>{emoji}</span>
      </div>
    );
  }

  // Fallback: coloured circle with initials (for inbox senders, social accounts, etc.)
  const colorIndex = hashCode(name) % AVATAR_COLORS.length;
  const bgColor = AVATAR_COLORS[colorIndex];
  const sizeClass = size === "lg" ? "h-12 w-12 text-base" : size === "md" ? "h-9 w-9 text-sm" : "h-7 w-7 text-xs";

  return (
    <div className={`${bgColor} ${sizeClass} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials.slice(0, 2)}
    </div>
  );
}
