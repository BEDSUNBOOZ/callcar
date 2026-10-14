import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2 font-bold tracking-tight" aria-label="CARCALL, accueil">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <rect width="28" height="28" rx="7" fill="#14B8A6" />
        <path d="M7 8h5v5H7zM16 8h5v5h-5zM7 17h5v3H7zM16 16h2v2h-2zM19 19h2v2h-2zM16 20h2v1h-2z" fill="#0B1F3A" />
      </svg>
      <span className={light ? "text-white" : "text-night"}>CARCALL</span>
    </Link>
  );
}
