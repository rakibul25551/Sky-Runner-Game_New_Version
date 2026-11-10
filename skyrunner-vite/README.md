# SKY RUNNER — Escape the Floating City

3D endless runner. Stack: **Vite + React + Three.js**, plain CSS, JavaScript.

## Just play (no install)
Double-click **`play/index.html`**. It is one self-contained file (game + Three.js + font inlined) and works offline.
(The top-level `index.html` is the Vite source page: it only works through `npm run dev`, not by double-click.)

## Run / build
```
npm install
npm run dev            # develop
npm run build          # output: dist/ (for Vercel / a web server)
npm run build:single   # regenerates play/index.html (double-click version)
```
Deploy on Vercel: `npx vercel --prod` in this folder, or push to GitHub and import the repo (Framework: Vite, build `npm run build`, output `dist`).

## How the game works
**Home** has your profile chip (name, level, XP), your coin balance, the big Run button, and tabs for **Runners**, **Roads** and **Profile**.

**Coins.** Orbs you collect become coins when a run ends (+1 coin per 100 m). Coins are saved in the browser and buy new runners and roads. Quitting from the pause menu still pays out.
`coins = (orbs + distance/100) × road bonus × runner bonus`

**Level.** Every run gives XP (score / 6). Reaching a new level pays a coin bonus (40 + 10 × level).

**Levels inside a run.** Every 750 m a glowing gate appears on the track. Run through it and the next level starts: a big LEVEL banner, bonus orbs (6 + 2 per level, up to 20), a short safe moment and a slightly faster beat. The HUD shows your level and progress to the next one. (`LEVEL_LEN` in `createGame.js`.)

**Change road / runner any time.** From the pause menu or the run-over card use *Change road* / *Change runner*; your coins from the run are paid out first.

**Runners** (each has a perk):
| Runner | Price | Perk |
|---|---|---|
| Nova | free | none |
| Volt | 150 | Magnet lasts 50% longer |
| Blaze | 350 | x2 Orbs lasts 50% longer |
| Glacier | 700 | starts every run with a Shield |
| Shadow | 1200 | Revive costs 6 orbs instead of 12 |
| Royal | 2000 | +25% coins after every run |

**Roads** (each changes the rules):
| Road | Price | Condition | Coins |
|---|---|---|---|
| Sunny Bridge | free | calm | x1 |
| Neon Dusk | 200 | 10% faster | x1.2 |
| Frozen Aurora | 600 | slippery lane changes | x1.4 |
| Ember Run | 1500 | 18% faster, many more obstacles | x1.8 |

Everything above is data in **`src/catalog.js`**: change prices, perks, speeds or add entries there. (A new road also needs a theme in `THEMES` inside `src/game/createGame.js`, a new runner accessory needs a few lines next to `extras`.)

## Music
Original background music generated live in the browser (`src/game/music.js`): bass, drums, a quiet arpeggio and a short lead riff. Each road has its own key, tempo and sound (Sunny Bridge 122 bpm, Neon Dusk 126, Frozen Aurora 108, Ember Run 138) and the tempo rises with each level. It is muffled in the menus, full during a run and quiet after a crash. It stops while paused.
There are two switches: **Sound** (everything, key `M`) and **Music** (only the music; pause menu or Profile > Settings). Browsers only allow sound after a tap or key press, so it starts on your first one.
It is original music, not a copy of any existing song. To change it edit `STYLES` and `MOTIFS` in `music.js`.

## Controls
Arrows or A/D change lane, Up/W/Space jump, Down/S slide (dive in the air), **P / Esc** pause, **M** sound. Phone: swipe, tap to jump, on-screen pause and sound buttons.
The game pauses by itself when the tab is hidden or the window loses focus. Sound on/off is remembered.

## Power-ups and revive
- **Magnet** (10 s): pulls nearby orbs to you.
- **x2 Orbs** (12 s): every orb counts double.
- **Shield**: absorbs one crash or one fall.
- **Revive**: after a crash, spend 12 orbs to continue once per run (a short invulnerability follows).

## Code map
- `src/game/createGame.js` — the whole 3D game (scene, track generator, physics, collisions, particles, sound effects, road rules, runner skins, level gates)
- `src/game/music.js` — the procedural background music
- `src/catalog.js` — runners and roads (prices, perks, road conditions)
- `src/profile.js` — saved profile, levels/XP, banking a run, buying
- `src/App.jsx` — glue: game + profile state, HUD, pause, run-over
- `src/Menu.jsx` — home, runners/roads shop, profile, how-to-play, run-over reward card
- `src/Figure.jsx`, `src/Icons.jsx` — SVG runner portraits and icons
- `src/styles.css`, `index.html` (static loader styles)

## Saved data (localStorage)
`skyrunner.profile.v1` (name, coins, XP, unlocks, selection), `skyrunner.best`, `skyrunner.muted`, `skyrunner.music`. "Reset progress" on the Profile tab clears them.

## Font
Chakra Petch (SIL OFL) is bundled in `src/assets/fonts/` (latin 500/700). Licence: `src/assets/fonts/OFL-LICENSE.txt`. `vite.config.js` sets `assetsInlineLimit` so the font is inlined into the CSS for the single-file build.

## Music
Original music generated in code (`src/game/music.js`): kick + clap + hats, pumping bass, detuned lead hook with echo, pads, and a 16th-note arp in the second half of an 8-bar loop. Each road has its own key and tempo; it speeds up a little each level. Edit `STYLES` (tempo, key, chords, sounds) and `HOOKS` (melodies) to change it.
