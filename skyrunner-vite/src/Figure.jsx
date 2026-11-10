import React from 'react'
import { CHARACTERS } from './catalog.js'

// Flat SVG portrait of a runner, drawn from the same colours and accessory the 3D model uses.
// `bust` crops to head and shoulders (for small avatars).
export default function Figure({ id = 'nova', size = 96, bust = false, className = '' }) {
  const c = CHARACTERS[id] || CHARACTERS.nova
  const view = bust ? '10 -8 44 56' : '0 -8 64 108'
  const h = bust ? size * (56 / 44) : size * (108 / 64)
  return (
    <svg className={`figure ${className}`} viewBox={view} width={size} height={h} role="img" aria-label={`${c.name} runner`} focusable="false">
      {!bust && <ellipse cx="32" cy="94" rx="15" ry="3.2" fill="#000" opacity=".25" />}
      {/* legs + arms (running pose) */}
      <g fill={c.body}>
        <rect x="24" y="58" width="8" height="28" rx="3" transform="rotate(18 28 58)" />
        <rect x="33" y="58" width="8" height="28" rx="3" transform="rotate(-22 37 58)" />
        <rect x="13" y="35" width="7" height="22" rx="3" transform="rotate(26 16 36)" />
        <rect x="44" y="35" width="7" height="22" rx="3" transform="rotate(-30 47 36)" />
      </g>
      {/* backpack, torso, stripe */}
      <rect x="17" y="34" width="9" height="22" rx="3" fill={c.acc} />
      <rect x="22" y="31" width="20" height="28" rx="5" fill={c.body} />
      <rect x="22" y="47" width="20" height="4.5" fill={c.acc} />
      {/* head + visor */}
      <circle cx="32" cy="19" r="11.5" fill={c.body} />
      <rect x="23.5" y="15.5" width="17" height="7.5" rx="3.5" fill={c.visor} />
      {/* accessory */}
      {c.accessory === 'antenna' && (<g fill={c.acc} stroke={c.acc}><path d="M32 8V-3" strokeWidth="2" /><circle cx="32" cy="-4" r="3" stroke="none" /></g>)}
      {c.accessory === 'horns' && (<g fill={c.acc}><path d="M22 12L18 -2l11 8z" /><path d="M42 12l4-14-11 8z" /></g>)}
      {c.accessory === 'crystal' && <path d="M32 -7l6.5 10L32 11l-6.5-8z" fill={c.acc} opacity=".95" />}
      {c.accessory === 'scarf' && (<g fill={c.acc}><rect x="21" y="29" width="22" height="6" rx="3" /><path d="M20 32L4 41l3 4 17-6z" /></g>)}
      {c.accessory === 'crown' && <path d="M22 9l2-11 6 7 2-9 2 9 6-7 2 11z" fill={c.acc} />}
    </svg>
  )
}
