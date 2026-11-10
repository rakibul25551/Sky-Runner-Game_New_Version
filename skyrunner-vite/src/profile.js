import { CHARACTERS, ROADS } from './catalog.js'

// Player profile: saved in localStorage. (The best score is kept by the game engine under its own key.)
const KEY = 'skyrunner.profile.v1'

export const defaultProfile = () => ({
  name: 'Runner',
  coins: 0,
  xp: 0,
  runs: 0,
  totalDist: 0,
  totalOrbs: 0,
  char: 'nova',
  road: 'day',
  ownedChars: ['nova'],
  ownedRoads: ['day'],
})

const num = (v) => (Number.isFinite(+v) && +v > 0 ? Math.floor(+v) : 0)

function sanitize(raw) {
  const d = defaultProfile()
  const p = { ...d, ...(raw && typeof raw === 'object' ? raw : {}) }
  p.name = String(p.name || d.name).trim().slice(0, 14) || d.name
  ;['coins', 'xp', 'runs', 'totalDist', 'totalOrbs'].forEach((k) => { p[k] = num(p[k]) })
  p.ownedChars = [...new Set(['nova', ...(Array.isArray(p.ownedChars) ? p.ownedChars : [])])].filter((id) => CHARACTERS[id])
  p.ownedRoads = [...new Set(['day', ...(Array.isArray(p.ownedRoads) ? p.ownedRoads : [])])].filter((id) => ROADS[id])
  if (!p.ownedChars.includes(p.char)) p.char = 'nova'
  if (!p.ownedRoads.includes(p.road)) p.road = 'day'
  return p
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return sanitize(JSON.parse(raw))
  } catch (e) { /* storage blocked or corrupt: start fresh */ }
  return defaultProfile()
}

export function saveProfile(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch (e) { /* ignore */ }
}

export function resetAll() {
  try { localStorage.removeItem(KEY); localStorage.removeItem('skyrunner.best') } catch (e) { /* ignore */ }
}

/* ---------- levels ---------- */
export const xpNeeded = (level) => 120 + (level - 1) * 40 // xp to go from `level` to `level + 1`

export function levelInfo(xp) {
  let level = 1
  let rest = xp
  while (rest >= xpNeeded(level)) { rest -= xpNeeded(level); level++ }
  const need = xpNeeded(level)
  return { level, into: rest, need, pct: Math.round((rest / need) * 100) }
}

export const levelBonus = (level) => 40 + level * 10 // coins granted on reaching `level`

/* ---------- banking a finished run ---------- */
// r = { score, dist, orbs, runId }. Returns the new profile plus a breakdown the UI can show.
export function bankRun(p, r) {
  const road = ROADS[p.road] || ROADS.day
  const perk = (CHARACTERS[p.char] || CHARACTERS.nova).perk || {}
  const orbCoins = r.orbs
  const distCoins = Math.floor(r.dist / 100)
  const mul = road.coinMul * (perk.coinMul || 1)
  const coins = Math.round((orbCoins + distCoins) * mul)
  const xp = Math.floor(r.score / 6)

  const before = levelInfo(p.xp).level
  const after = levelInfo(p.xp + xp).level
  let bonus = 0
  for (let l = before + 1; l <= after; l++) bonus += levelBonus(l)

  const profile = {
    ...p,
    coins: p.coins + coins + bonus,
    xp: p.xp + xp,
    runs: p.runs + 1,
    totalDist: p.totalDist + r.dist,
    totalOrbs: p.totalOrbs + r.orbs,
  }
  return {
    profile,
    reward: { orbCoins, distCoins, mul: Math.round(mul * 100) / 100, coins, bonus, xp, levelsGained: after - before, level: after },
  }
}

/* ---------- shop ---------- */
// kind: 'char' | 'road'. Returns the new profile, or null if it cannot be bought.
export function buy(p, kind, id) {
  const item = kind === 'char' ? CHARACTERS[id] : ROADS[id]
  const key = kind === 'char' ? 'ownedChars' : 'ownedRoads'
  if (!item || p[key].includes(id) || p.coins < item.price) return null
  return { ...p, coins: p.coins - item.price, [key]: [...p[key], id] }
}

/* ---------- milestones (progress towards the next goal, no extra storage needed) ---------- */
const nextGoal = (value, steps) => steps.find((s) => value < s) || steps[steps.length - 1]
export function milestones(p, best) {
  const rows = [
    ['Total distance', p.totalDist, [500, 2000, 5000, 10000, 25000, 50000], 'm'],
    ['Runs finished', p.runs, [5, 20, 50, 100, 250], ''],
    ['Orbs collected', p.totalOrbs, [100, 500, 1500, 5000, 15000], ''],
    ['Best score', best, [500, 1500, 3000, 6000, 12000], ''],
  ]
  return rows.map(([label, value, steps, unit]) => {
    const goal = nextGoal(value, steps)
    return { label, value, goal, unit, pct: Math.min(100, Math.round((value / goal) * 100)) }
  })
}
