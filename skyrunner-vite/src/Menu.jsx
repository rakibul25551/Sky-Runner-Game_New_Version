import React, { useEffect, useRef, useState } from 'react'
import Figure from './Figure.jsx'
import { CHARACTER_LIST, ROAD_LIST, CHARACTERS, ROADS } from './catalog.js'
import { levelInfo, milestones } from './profile.js'
import {
  PlayIcon, RunnerIcon, RouteIcon, UserIcon, CoinIcon, LockIcon, CheckIcon, HelpIcon, HomeIcon,
  MusicIcon, SoundOnIcon, SoundOffIcon,
} from './Icons.jsx'

/* Everything on the menu side of the game. These are plain module-level components (never defined inside
   another component) so React keeps their state and DOM while the game re-renders around them. */

/* ---------- top bar + bottom navigation ---------- */
export function TopBar({ profile, onProfile, sound }) {
  const lv = levelInfo(profile.xp)
  return (
    <header className="topbar">
      <button type="button" className="profchip" onClick={onProfile} aria-label={`Profile: ${profile.name}, level ${lv.level}`}>
        <span className="avatar"><Figure id={profile.char} size={34} bust /></span>
        <span className="pc-txt"><b>{profile.name}</b><small>Level {lv.level}</small></span>
        <span className="xpbar" aria-hidden="true"><i style={{ width: `${lv.pct}%` }} /></span>
      </button>
      <div className="topright">
        <span className="coins" role="status" aria-label={`${profile.coins} coins`}><CoinIcon /> {profile.coins}</span>
        {sound}
      </div>
    </header>
  )
}

const TABS = [
  ['home', 'Play', PlayIcon],
  ['chars', 'Runners', RunnerIcon],
  ['roads', 'Roads', RouteIcon],
  ['profile', 'Profile', UserIcon],
]

export function NavBar({ screen, onGo }) {
  return (
    <nav className="nav" aria-label="Main menu">
      {TABS.map(([id, label, Icon]) => (
        <button key={id} type="button" className={screen === id ? 'on' : ''} aria-current={screen === id ? 'page' : undefined} onClick={() => onGo(id)}>
          <Icon /><span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

/* ---------- home (front page) ---------- */
export function Home({ profile, best, onRun, onGo, onHelp }) {
  const road = ROADS[profile.road]
  const char = CHARACTERS[profile.char]
  return (
    <main className="screen home">
      <h1 className="logo">Sky<span>Runner</span></h1>
      <p className="sub">Escape the floating city</p>
      <button type="button" className="go" onClick={onRun}><PlayIcon /> Run</button>
      <div className="row picks">
        <button type="button" className="pick" onClick={() => onGo('roads')}>
          <small>Road</small><b>{road.name}</b><em>{road.tags.join(' · ')}</em>
        </button>
        <button type="button" className="pick" onClick={() => onGo('chars')}>
          <small>Runner</small><b>{char.name}</b><em>{char.perkText}</em>
        </button>
      </div>
      <p className="hint">Best score <b>{best}</b></p>
      <button type="button" className="linkbtn" onClick={onHelp}><HelpIcon /> How to play</button>
    </main>
  )
}

/* ---------- shop (runners and roads share one layout) ---------- */
function RoadArt({ road, big }) {
  const gid = `rg-${road.id}-${big ? 'b' : 's'}`
  return (
    <svg viewBox="0 0 120 80" className={`roadart${big ? ' big' : ''}`} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={road.swatch[0]} />
          <stop offset="1" stopColor={road.swatch[1]} />
        </linearGradient>
      </defs>
      <rect width="120" height="80" fill={`url(#${gid})`} />
      <path d="M53 36h14l32 44H21z" fill={road.swatch[2]} />
      <path d="M60 36v44M56.5 36L41 80M63.5 36L79 80" stroke="#fff" strokeOpacity=".35" strokeWidth="1.2" fill="none" />
    </svg>
  )
}

export function Shop({ kind, owned, equipped, preview, coins, onPreview, onEquip, onBuy }) {
  const screenRef = useRef(null)
  // after picking a tile the showcase (at the top) must be visible, otherwise on a phone the change happens off-screen
  const pick = (id) => {
    onPreview(id)
    const el = screenRef.current
    if (el) el.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  const isChar = kind === 'char'
  const items = isChar ? CHARACTER_LIST : ROAD_LIST
  const item = items.find((i) => i.id === preview) || items.find((i) => i.id === equipped)
  const isOwned = owned.includes(item.id)
  const isEquipped = equipped === item.id
  const short = Math.max(0, item.price - coins)
  return (
    <main className="screen shop" ref={screenRef}>
      <header className="screen-head">
        <h2>{isChar ? 'Runners' : 'Roads'}</h2>
        <p>{isChar ? 'Unlock new runners with coins. Every runner has a perk.' : 'Unlock new roads with coins. Harder roads pay more coins.'}</p>
      </header>

      <section className="showcase" aria-live="polite">
        <div className="showart">{isChar ? <Figure id={item.id} size={104} /> : <RoadArt road={item} big />}</div>
        <div className="showinfo">
          <h3>{item.name}</h3>
          {isChar
            ? <p className="perk"><CheckIcon /> {item.perkText}</p>
            : <div className="tags">{item.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>}
          <p className="blurb">{item.blurb}</p>
          {isEquipped && <button type="button" className="go" disabled><CheckIcon /> Equipped</button>}
          {!isEquipped && isOwned && <button type="button" className="go" onClick={() => onEquip(item.id)}>Equip</button>}
          {!isOwned && (
            <button type="button" className="go buy" disabled={short > 0} onClick={() => onBuy(item.id)}>
              <CoinIcon /> Unlock · {item.price}
            </button>
          )}
          {!isOwned && short > 0 && <p className="need">Need {short} more coins. Collect orbs on a run to earn them.</p>}
        </div>
      </section>

      <ul className="grid">
        {items.map((it) => {
          const has = owned.includes(it.id)
          const sel = it.id === item.id
          return (
            <li key={it.id}>
              <button type="button" className={`tile${sel ? ' sel' : ''}${has ? '' : ' locked'}`} aria-pressed={sel} onClick={() => pick(it.id)}>
                <span className="tile-art">{isChar ? <Figure id={it.id} size={52} /> : <RoadArt road={it} />}</span>
                <b>{it.name}</b>
                <span className="tile-state">
                  {equipped === it.id ? <><CheckIcon /> Equipped</> : has ? 'Owned' : <><LockIcon /> <CoinIcon /> {it.price}</>}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </main>
  )
}

/* ---------- profile ---------- */
export function ProfileScreen({ profile, best, onRename, onHelp, onReset, muted, music, onSound, onMusic }) {
  const lv = levelInfo(profile.xp)
  const [draft, setDraft] = useState(profile.name)
  const [confirm, setConfirm] = useState(false)
  const commit = () => {
    const n = draft.trim().slice(0, 14) || 'Runner'
    setDraft(n)
    onRename(n)
  }
  const stats = [
    ['Best score', best],
    ['Runs', profile.runs],
    ['Distance', `${profile.totalDist} m`],
    ['Orbs collected', profile.totalOrbs],
    ['Runners', `${profile.ownedChars.length} / ${CHARACTER_LIST.length}`],
    ['Roads', `${profile.ownedRoads.length} / ${ROAD_LIST.length}`],
  ]
  return (
    <main className="screen profile">
      <section className="idcard">
        <div className="bigavatar"><Figure id={profile.char} size={74} bust /></div>
        <div className="idinfo">
          <input
            className="nameinput" value={draft} maxLength={14} autoComplete="off" spellCheck={false}
            aria-label="Player name" onChange={(e) => setDraft(e.target.value)} onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
          />
          <div className="lvline"><b>Level {lv.level}</b><span>{lv.into} / {lv.need} XP</span></div>
          <div className="xpbar big" aria-hidden="true"><i style={{ width: `${lv.pct}%` }} /></div>
        </div>
      </section>

      <dl className="stats">
        {stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>

      <section className="miles">
        <h3>Next goals</h3>
        {milestones(profile, best).map((m) => (
          <div key={m.label} className="mile">
            <div className="mile-top"><span>{m.label}</span><span>{m.value}{m.unit && ` ${m.unit}`} / {m.goal}{m.unit && ` ${m.unit}`}</span></div>
            <div className="xpbar" aria-hidden="true"><i style={{ width: `${m.pct}%` }} /></div>
          </div>
        ))}
      </section>

      <section className="settings">
        <h3>Settings</h3>
        <div className="row">
          <button type="button" className="theme" onClick={onSound} aria-pressed={muted}>{muted ? <SoundOffIcon /> : <SoundOnIcon />} Sound {muted ? 'off' : 'on'}</button>
          <button type="button" className="theme" onClick={onMusic} aria-pressed={!music}><MusicIcon /> Music {music ? 'on' : 'off'}</button>
        </div>
      </section>

      <div className="row">
        <button type="button" className="theme" onClick={onHelp}><HelpIcon /> How to play</button>
        {!confirm && <button type="button" className="theme danger" onClick={() => setConfirm(true)}>Reset progress</button>}
      </div>
      {confirm && (
        <div className="confirm" role="alertdialog" aria-label="Confirm reset">
          <p>This erases your coins, unlocks, level and best score.</p>
          <div className="row">
            <button type="button" className="theme danger" onClick={onReset}>Yes, erase everything</button>
            <button type="button" className="theme" onClick={() => setConfirm(false)} autoFocus>Cancel</button>
          </div>
        </div>
      )}
    </main>
  )
}

/* ---------- how to play ---------- */
export function HelpModal({ onClose }) {
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose() }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="card" role="dialog" aria-modal="true" aria-label="How to play" onClick={onClose}>
      <div className="box" onClick={(e) => e.stopPropagation()}>
        <h1 className="logo" style={{ fontSize: 'clamp(30px,8vw,44px)' }}>How to play</h1>
        <div className="keys">
          <b>← → / A D</b><span>change lane</span>
          <b>↑ / W / Space</b><span>jump</span>
          <b>↓ / S</b><span>slide (in the air: dive)</span>
          <b>P / Esc</b><span>pause</span>
          <b>M</b><span>sound on / off</span>
          <b>Levels</b><span>run through the glowing gate to start the next level: bonus orbs, a short safe moment, a faster beat</span>
          <b>Phone</b><span>swipe, tap to jump</span>
          <b>Pick-ups</b><span>magnet pulls orbs · x2 doubles orbs · shield saves you once</span>
          <b>Coins</b><span>orbs you collect become coins after the run. Spend them on runners and roads</span>
        </div>
        <button type="button" className="go" onClick={onClose} autoFocus>Got it</button>
      </div>
    </div>
  )
}

/* ---------- run over ---------- */
export function OverCard({ result, reward, profile, onRevive, onEnd, onRun, onHome, onRoad, onRunner }) {
  const revivePhase = result.canRevive && !reward
  const record = result.newBest || (result.canRevive && result.score > result.best)
  const lv = levelInfo(profile.xp)
  const title = revivePhase ? 'Down, not out' : record ? 'New record' : 'Grounded'
  const sub = revivePhase ? `Spend ${result.reviveCost} orbs to keep running` : record ? 'The city is behind you' : 'The city keeps floating'
  return (
    <div className="card" role="dialog" aria-modal="true" aria-label="Run over">
      <div className="box">
        <h1 className="logo" style={{ fontSize: 'clamp(32px,9vw,48px)' }}>{title}</h1>
        <p className="sub">{sub}</p>
        <div className="stat">
          <div><div className="n">{result.score}</div><div className="l">Score</div></div>
          <div><div className="n">{result.dist}</div><div className="l">Metres</div></div>
          <div><div className="n">{result.level}</div><div className="l">Level</div></div>
          <div><div className="n" style={{ color: 'var(--gold)' }}>{result.orbs}</div><div className="l">Orbs</div></div>
        </div>

        {revivePhase && (
          <>
            <button type="button" className="go revive" onClick={onRevive} autoFocus>Revive · −{result.reviveCost} orbs</button>
            <div><button type="button" className="theme" onClick={onEnd}>End run &amp; collect coins</button></div>
          </>
        )}

        {!revivePhase && reward && (
          <>
            <div className="reward">
              <div className="rw-line"><span>Orbs collected</span><b>+{reward.orbCoins}</b></div>
              <div className="rw-line"><span>Distance bonus</span><b>+{reward.distCoins}</b></div>
              {reward.mul !== 1 && <div className="rw-line"><span>Road &amp; runner bonus</span><b>×{reward.mul}</b></div>}
              {reward.bonus > 0 && <div className="rw-line gold"><span>Level up bonus</span><b>+{reward.bonus}</b></div>}
              <div className="rw-total"><CoinIcon /> +{reward.coins + reward.bonus} coins</div>
              <div className="rw-xp"><span>Level {lv.level}{reward.levelsGained > 0 ? ' · Level up!' : ''}</span><span>+{reward.xp} XP</span></div>
              <div className="xpbar" aria-hidden="true"><i style={{ width: `${lv.pct}%` }} /></div>
            </div>
            <button type="button" className="go" onClick={onRun} autoFocus>Run again</button>
            <div className="row">
              <button type="button" className="theme" onClick={onRoad}><RouteIcon /> Change road</button>
              <button type="button" className="theme" onClick={onRunner}><RunnerIcon /> Change runner</button>
              <button type="button" className="theme" onClick={onHome}><HomeIcon /> Home</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
