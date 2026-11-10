import React from 'react'

// Small inline SVG icon set. They inherit colour from the text (currentColor) and size from font-size.
const Svg = ({ children, fill, ...rest }) => (
  <svg
    className="ic"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill={fill ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    {children}
  </svg>
)

export const PauseIcon = () => (
  <Svg fill stroke="none">
    <rect x="6" y="4.5" width="4.2" height="15" rx="1.2" />
    <rect x="13.8" y="4.5" width="4.2" height="15" rx="1.2" />
  </Svg>
)

export const PlayIcon = () => (
  <Svg fill>
    <path d="M7 4.6v14.8a1 1 0 0 0 1.5.86l12-7.4a1 1 0 0 0 0-1.72l-12-7.4A1 1 0 0 0 7 4.6z" />
  </Svg>
)

export const SoundOnIcon = () => (
  <Svg>
    <path d="M4 9.5v5h3.6l4.6 3.8V5.7L7.6 9.5z" fill="currentColor" />
    <path d="M15.8 9a4.2 4.2 0 0 1 0 6" />
    <path d="M18.4 6.4a8 8 0 0 1 0 11.2" />
  </Svg>
)

export const SoundOffIcon = () => (
  <Svg>
    <path d="M4 9.5v5h3.6l4.6 3.8V5.7L7.6 9.5z" fill="currentColor" />
    <path d="M16 9.5l5 5M21 9.5l-5 5" />
  </Svg>
)

export const OrbIcon = () => (
  <Svg>
    <path d="M12 2.5l7 9.5-7 9.5L5 12z" fill="currentColor" fillOpacity=".25" />
    <path d="M5 12h14M12 2.5v19" strokeWidth="1.4" opacity=".7" />
  </Svg>
)

export const RouteIcon = () => (
  <Svg>
    <path d="M9 3L4.5 21M15 3l4.5 18" />
    <path d="M12 5v3M12 11v3M12 17v3" />
  </Svg>
)

export const MagnetIcon = () => (
  <Svg>
    <path d="M6 3v8.2a6 6 0 0 0 12 0V3h-4v8.2a2 2 0 0 1-4 0V3z" fill="currentColor" fillOpacity=".25" />
    <path d="M6 7h4M14 7h4" />
  </Svg>
)

export const ShieldIcon = () => (
  <Svg>
    <path d="M12 2.8l7.5 2.8v5.7c0 4.6-3.2 8.3-7.5 9.9-4.3-1.6-7.5-5.3-7.5-9.9V5.6z" fill="currentColor" fillOpacity=".25" />
    <path d="M8.6 12l2.5 2.5 4.4-4.8" />
  </Svg>
)

export const GlobeIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5s1.2-6.1 3.8-8.5z" />
  </Svg>
)

export const RestartIcon = () => (
  <Svg>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.3-5.4" />
    <path d="M4.5 4.5v4.2h4.2" />
  </Svg>
)

export const CoinIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="8.5" fill="currentColor" fillOpacity=".25" />
    <circle cx="12" cy="12" r="5.2" strokeWidth="1.5" />
    <path d="M12 9.2v5.6" strokeWidth="1.8" />
  </Svg>
)

export const HomeIcon = () => (
  <Svg>
    <path d="M4 11.2L12 4l8 7.2" />
    <path d="M6.2 9.8V19a1 1 0 0 0 1 1h3.1v-5h3.4v5h3.1a1 1 0 0 0 1-1V9.8" />
  </Svg>
)

export const RunnerIcon = () => (
  <Svg>
    <circle cx="14.5" cy="4.8" r="2.2" fill="currentColor" />
    <path d="M8 21l3.2-5.4 2.6 1.6V21" />
    <path d="M12.8 8.4L10 12.6l-3.6-1.2M12.8 8.4l3.6 2.4 3.2-.4M10 12.6l3.6 3.4" />
  </Svg>
)

export const UserIcon = () => (
  <Svg>
    <circle cx="12" cy="8.2" r="3.7" />
    <path d="M4.6 20c.6-3.8 3.6-6 7.4-6s6.8 2.2 7.4 6" />
  </Svg>
)

export const LockIcon = () => (
  <Svg>
    <rect x="5.2" y="10.6" width="13.6" height="9.8" rx="2" fill="currentColor" fillOpacity=".25" />
    <path d="M8.2 10.6V8a3.8 3.8 0 0 1 7.6 0v2.6" />
  </Svg>
)

export const CheckIcon = () => (
  <Svg>
    <path d="M5 12.6l4.4 4.4L19 7.4" strokeWidth="2.6" />
  </Svg>
)

export const HelpIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.6 9.6a2.5 2.5 0 1 1 3.6 2.2c-.8.5-1.2 1-1.2 1.9" />
    <path d="M12 16.9v.1" strokeWidth="2.6" />
  </Svg>
)

export const MusicIcon = () => (
  <Svg>
    <path d="M9 17.5V5.6l10-2v11.9" />
    <circle cx="6.6" cy="17.6" r="2.7" fill="currentColor" fillOpacity=".25" />
    <circle cx="16.6" cy="15.6" r="2.7" fill="currentColor" fillOpacity=".25" />
  </Svg>
)
