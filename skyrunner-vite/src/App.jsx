import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createGame } from './game/createGame.js'
import { loadProfile, saveProfile, bankRun, buy, resetAll } from './profile.js'
import {
  PauseIcon, PlayIcon, SoundOnIcon, SoundOffIcon, OrbIcon, RouteIcon,
  MagnetIcon, ShieldIcon, RestartIcon, HomeIcon, RunnerIcon, MusicIcon,
} from './Icons.jsx'
import { TopBar, NavBar, Home, Shop, ProfileScreen, HelpModal, OverCard } from './Menu.jsx'

const MIN_LOADING_MS = 450 // avoid a one-frame flash of the loader on fast machines

function Boot() {
  // Same markup as the static loader in index.html, so there is no visual jump when React takes over.
  return (
    <div className="boot" role="status" aria-live="polite">
      <h1 className="boot-logo">Sky<span>Runner</span></h1>
      <div className="boot-bar"><i /></div>
      <p className="boot-txt">Loading the skyline</p>
    </div>
  )
}

export default function App() {
  const stageRef = useRef(null)
  const gameRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState('menu') // menu | play | over
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(false)
  const [music, setMusic] = useState(true)
  const [banner, setBanner] = useState(null) // { n, bonus, id } while the LEVEL banner is on screen
  const [hud, setHud] = useState({ score: 0, orbs: 0, speed: 0, level: 1, lvlPct: 0 })
  const [best, setBest] = useState(0)
  const [result, setResult] = useState(null)
  const [reward, setReward] = useState(null) // coins/XP for the finished run, null until banked
  const [power, setPower] = useState({ magnet: 0, dbl: 0, shield: false })

  const [profile, setProfile] = useState(loadProfile)
  const [screen, setScreen] = useState('home') // home | chars | roads | profile
  const [preview, setPreview] = useState({ char: null, road: null })
  const [help, setHelp] = useState(false)
  const [toast, setToast] = useState('')

  // refs let the game (created once) always see the latest UI state
  const profileRef = useRef(profile)
  profileRef.current = profile
  const bankedRun = useRef(0)
  const canStartRef = useRef(false)
  canStartRef.current = (phase === 'over' && reward !== null) || (phase === 'menu' && screen === 'home' && !help)

  useEffect(() => { saveProfile(profile) }, [profile])
  useEffect(() => { if (phase === 'play') setReward(null); else setBanner(null) }, [phase])
  useEffect(() => {
    if (!banner) return undefined
    const t = setTimeout(() => setBanner(null), 2500)
    return () => clearTimeout(t)
  }, [banner])
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(t)
  }, [toast])

  // A finished run is turned into coins and XP exactly once, however the player leaves it.
  const bankOnce = useCallback((r) => {
    if (!r || bankedRun.current === r.runId) return null
    bankedRun.current = r.runId
    const out = bankRun(profileRef.current, r)
    profileRef.current = out.profile
    setProfile(out.profile)
    return out.reward
  }, [])

  useEffect(() => {
    let game = null
    let cancelled = false
    const t0 = performance.now()
    // Let the loader paint first: building the 3D scene blocks the main thread for a moment.
    const timer = setTimeout(() => {
      if (cancelled) return
      const p = profileRef.current
      game = createGame(stageRef.current, {
        road: p.road,
        character: p.char,
        canStart: () => canStartRef.current,
        onState: setPhase,
        onHud: (score, orbs, speed, level, lvlPct) => setHud({ score, orbs, speed, level, lvlPct }),
        onOver: (r) => { setResult(r); setReward(r.canRevive ? null : bankOnce(r)) },
        onBest: setBest,
        onPower: setPower,
        onPaused: setPaused,
        onMuted: setMuted,
        onMusic: setMusic,
        onLevel: (n, bonus) => setBanner({ n, bonus, id: performance.now() }),
        onReady: () => setTimeout(() => !cancelled && setReady(true), Math.max(0, MIN_LOADING_MS - (performance.now() - t0))),
      })
      gameRef.current = game
      if (location.hash === '#debug') window.__game = game
    }, 60)
    return () => {
      cancelled = true
      clearTimeout(timer)
      if (game) game.dispose()
      gameRef.current = null
    }
  }, [bankOnce])

  // The 3D scene behind the menu previews whatever runner / road you are looking at.
  const activeChar = screen === 'chars' && preview.char ? preview.char : profile.char
  const activeRoad = screen === 'roads' && preview.road ? preview.road : profile.road
  useEffect(() => { const g = gameRef.current; if (g && ready && phase === 'menu') g.setCharacter(activeChar) }, [ready, phase, activeChar])
  useEffect(() => { const g = gameRef.current; if (g && ready && phase === 'menu') g.setRoad(activeRoad) }, [ready, phase, activeRoad])

  /* ---------- actions ---------- */
  const start = () => gameRef.current && gameRef.current.start()
  const go = (s) => { setScreen(s); setPreview({ char: null, road: null }) }
  const rename = (name) => setProfile((p) => ({ ...p, name }))
  const equip = (kind, id) => setProfile((p) => ({ ...p, [kind]: id }))
  const purchase = (kind, id) => {
    const next = buy(profileRef.current, kind === 'char' ? 'char' : 'road', id)
    if (!next) return
    const done = { ...next, [kind]: id } // a new unlock is equipped straight away
    profileRef.current = done
    setProfile(done)
  }
  const resetProgress = () => { resetAll(); location.reload() }

  const toggleMusic = (e) => { gameRef.current && gameRef.current.setMusic(!music); e.currentTarget.blur() }
  const toggleSound = (e) => { gameRef.current && gameRef.current.setMuted(!muted); e.currentTarget.blur() }
  const togglePause = (e) => {
    const g = gameRef.current
    if (g) paused ? g.resume() : g.pause()
    e.currentTarget.blur() // keep Space/Enter for the game, not for the focused button
  }
  const reviveRun = () => gameRef.current && gameRef.current.revive()
  const endRun = () => setReward(bankOnce(result))
  // leave the finished run for a menu screen (home, roads or chars)
  const goTo = (to = 'home') => { const g = gameRef.current; if (g) g.toMenu(); setScreen(to); setPreview({ char: null, road: null }); setReward(null) }
  const restartRun = () => { // restarting from pause still pays out what you earned so far
    const g = gameRef.current
    if (!g) return
    bankOnce(g.quit())
    g.start()
  }
  const quitTo = (to = 'home') => { // leave a paused run: coins are paid out, then the chosen menu screen opens
    const g = gameRef.current
    const sum = g && g.quit()
    if (!sum) return
    const rw = bankOnce(sum)
    setScreen(to)
    setPreview({ char: null, road: null })
    setToast(rw && rw.coins + rw.bonus > 0 ? `Run saved: +${rw.coins + rw.bonus} coins` : '')
  }

  // a plain element, not a component: the HUD re-renders every frame and a nested component would remount (and drop clicks)
  const soundBtn = (
    <button
      type="button"
      className="iconbtn"
      onClick={toggleSound}
      aria-pressed={muted}
      aria-label={muted ? 'Sound off, turn on (M)' : 'Sound on, turn off (M)'}
      title={muted ? 'Sound off (M)' : 'Sound on (M)'}
    >
      {muted ? <SoundOffIcon /> : <SoundOnIcon />}
    </button>
  )

  return (
    <>
      <div id="stage" ref={stageRef} />

      {!ready && <Boot />}

      {ready && phase === 'menu' && (
        <div className="menu">
          <TopBar profile={profile} onProfile={() => go('profile')} sound={soundBtn} />
          {screen === 'home' && <Home profile={profile} best={best} onRun={start} onGo={go} onHelp={() => setHelp(true)} />}
          {screen === 'chars' && (
            <Shop
              kind="char" owned={profile.ownedChars} equipped={profile.char} preview={preview.char} coins={profile.coins}
              onPreview={(id) => setPreview((s) => ({ ...s, char: id }))}
              onEquip={(id) => equip('char', id)} onBuy={(id) => purchase('char', id)}
            />
          )}
          {screen === 'roads' && (
            <Shop
              kind="road" owned={profile.ownedRoads} equipped={profile.road} preview={preview.road} coins={profile.coins}
              onPreview={(id) => setPreview((s) => ({ ...s, road: id }))}
              onEquip={(id) => equip('road', id)} onBuy={(id) => purchase('road', id)}
            />
          )}
          {screen === 'profile' && <ProfileScreen profile={profile} best={best} onRename={rename} onHelp={() => setHelp(true)} onReset={resetProgress} muted={muted} music={music} onSound={toggleSound} onMusic={toggleMusic} />}
          <NavBar screen={screen} onGo={go} />
          {toast && <div className="toast" role="status">{toast}</div>}
          {help && <HelpModal onClose={() => setHelp(false)} />}
        </div>
      )}

      {ready && phase === 'play' && (
        <div className="hud">
          <div>
            <div className="lbl"><RouteIcon /> Distance</div>
            <div className="big">{hud.score}</div>
            <div className="lbl" style={{ marginTop: 6 }}>Best {best}</div>
            <div className="lvl">
              <div className="lbl">Level {hud.level}</div>
              <div className="meter"><i style={{ width: `${hud.lvlPct}%` }} /></div>
            </div>
          </div>
          <div className="r">
            <div className="lbl">Sky orbs <OrbIcon /></div>
            <div className="big orbs">{hud.orbs}</div>
            <div className="meter"><i style={{ width: `${Math.max(0, hud.speed)}%` }} /></div>
            <div className="chips">
              {power.magnet > 0 && <span className="chip magnet"><MagnetIcon /> Magnet {power.magnet}s</span>}
              {power.dbl > 0 && <span className="chip dbl"><b className="x2">×2</b> Orbs {power.dbl}s</span>}
              {power.shield && <span className="chip shield"><ShieldIcon /> Shield</span>}
            </div>
          </div>
        </div>
      )}

      {ready && phase === 'play' && !paused && (
        <div className="tools">
          {soundBtn}
          <button type="button" className="iconbtn" onClick={togglePause} aria-label="Pause (P)" title="Pause (P)">
            <PauseIcon />
          </button>
        </div>
      )}

      {ready && phase === 'play' && !paused && banner && (
        <div className="levelbanner" key={banner.id} role="status">
          <div className="lb-big">Level {banner.n}</div>
          <div className="lb-sub">Level {banner.n - 1} complete · +{banner.bonus} orbs</div>
        </div>
      )}

      {ready && phase === 'play' && paused && (
        <div className="card" role="dialog" aria-modal="true" aria-label="Game paused">
          <div className="box">
            <h1 className="logo" style={{ fontSize: 'clamp(38px,10vw,56px)' }}>Paused</h1>
            <p className="sub">Take a breath</p>
            <button type="button" className="go" onClick={togglePause} autoFocus><PlayIcon /> Resume</button>
            <div className="row">
              <button type="button" className="theme" onClick={restartRun}><RestartIcon /> Restart</button>
              <button type="button" className="theme" onClick={() => quitTo('home')}><HomeIcon /> Quit to home</button>
            </div>
            <div className="row">
              <button type="button" className="theme" onClick={() => quitTo('roads')}><RouteIcon /> Change road</button>
              <button type="button" className="theme" onClick={() => quitTo('chars')}><RunnerIcon /> Change runner</button>
            </div>
            <div className="row">
              <button type="button" className="theme" onClick={toggleSound} aria-pressed={muted}>
                {muted ? <SoundOffIcon /> : <SoundOnIcon />} Sound {muted ? 'off' : 'on'}
              </button>
              <button type="button" className="theme" onClick={toggleMusic} aria-pressed={!music}><MusicIcon /> Music {music ? 'on' : 'off'}</button>
            </div>
            <p className="hint"><b>P</b> / <b>Esc</b> to resume · leaving the run still pays your coins</p>
          </div>
        </div>
      )}

      {ready && phase === 'over' && result && (
        <OverCard
          result={result} reward={reward} profile={profile}
          onRevive={reviveRun} onEnd={endRun} onRun={start}
          onHome={() => goTo('home')} onRoad={() => goTo('roads')} onRunner={() => goTo('chars')}
        />
      )}
    </>
  )
}
