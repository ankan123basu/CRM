// Circular seal, in the spirit of the certification badges in prosperr.io's
// footer. Used only for claims that are true of this CRM (role-based access,
// audit trail) — never for certifications the CRM does not hold.
import { useId } from 'react'

export function Seal({ ring, center, sub }: { ring: string; center: string; sub?: string }) {
  const id = useId().replace(/:/g, '')
  // One pass around the ring, stretched to the exact circumference (2π·45 ≈ 283).
  const text = `${ring} • Prosperr CRM • `
  return (
    <svg viewBox="0 0 120 120" className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0" role="img" aria-label={`${center}: ${ring}`}>
      <defs>
        <path id={`ring-${id}`} d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
      </defs>
      <circle cx="60" cy="60" r="58" fill="#ffffff" />
      <circle cx="60" cy="60" r="54" fill="none" stroke="#053f1a" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="34" fill="#053f1a" />
      <text fontSize="8.2" fontWeight="600" fill="#053f1a" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
        <textPath href={`#ring-${id}`} startOffset="0" textLength="280" lengthAdjust="spacing">{text.toUpperCase()}</textPath>
      </text>
      <text x="60" y={sub ? 60 : 64} textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>{center}</text>
      {sub && <text x="60" y="73" textAnchor="middle" fontSize="7" fontWeight="500" fill="#c4cbc6" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>{sub}</text>}
    </svg>
  )
}
