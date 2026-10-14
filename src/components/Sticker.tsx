/** Illustration décorative : l'autocollant CARCALL tel qu'il apparaît sur un pare-brise. Le motif n'est pas un vrai QR code. */
export function Sticker({ className = "" }: { className?: string }) {
  const cells: string[] = [];
  const n = 13;
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const finder = (x < 4 && y < 4) || (x > 8 && y < 4) || (x < 4 && y > 8);
      if (finder) continue;
      if ((x * 7 + y * 13 + x * y) % 5 < 2) cells.push(`M${x * 10 + 15} ${y * 10 + 15}h8v8h-8z`);
    }
  const finders = [[15, 15], [105, 15], [15, 105]];
  return (
    <svg viewBox="0 0 160 200" className={className} role="img" aria-label="Autocollant CARCALL avec QR code">
      <rect width="160" height="200" rx="14" fill="#0B1F3A" />
      <rect x="8" y="8" width="144" height="144" rx="8" fill="#fff" />
      <path d={cells.join("")} fill="#0B1F3A" />
      {finders.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="40" height="40" fill="#0B1F3A" />
          <rect x={x + 6} y={y + 6} width="28" height="28" fill="#fff" />
          <rect x={x + 12} y={y + 12} width="16" height="16" fill="#14B8A6" />
        </g>
      ))}
      <text x="80" y="176" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="14" fill="#14B8A6">CARCALL</text>
      <text x="80" y="191" textAnchor="middle" fontFamily="Arial" fontSize="8" fill="#fff">Scannez pour prévenir le propriétaire</text>
    </svg>
  );
}
