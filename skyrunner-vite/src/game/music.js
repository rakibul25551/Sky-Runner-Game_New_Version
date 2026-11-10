// Original game music, generated live with the Web Audio API. No audio files, nothing copied from any song.
// An 8-bar loop in an upbeat "arcade / EDM runner" style: four-on-the-floor kick, clap, off-beat hats,
// pumping bass, a detuned lead hook with echo, pads, a 16th-note arp in the second half, and a fill + crash every 8 bars.
// Every road has its own key, tempo and sound; the tempo creeps up with each level.
//
// To change the feel, edit STYLES (tempo, key, chords, instrument shapes) and HOOKS (the lead melodies) below.

const MAJ = [0, 2, 4, 5, 7, 9, 11]
const MIN = [0, 2, 3, 5, 7, 8, 10]
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12)

// key: MIDI note of the tonic. prog: chord roots as scale-degree indices (one chord per bar, the 4 chords repeat twice).
// lead / bass: oscillator shapes. leadVol: loudness of the hook. lift: semitones the lead sits above the key.
const STYLES = {
  day:   { bpm: 128, key: 60, scale: MAJ, prog: [0, 4, 5, 3], lead: 'sawtooth', bass: 'sawtooth', leadVol: 0.5,  lift: 12, cut: 4200 },
  dusk:  { bpm: 130, key: 57, scale: MIN, prog: [0, 5, 2, 6], lead: 'square',   bass: 'sawtooth', leadVol: 0.42, lift: 12, cut: 3600 },
  frost: { bpm: 116, key: 62, scale: MIN, prog: [0, 3, 5, 2], lead: 'triangle', bass: 'sine',     leadVol: 0.85, lift: 12, cut: 5200 },
  ember: { bpm: 142, key: 52, scale: MIN, prog: [0, 0, 5, 6], lead: 'sawtooth', bass: 'sawtooth', leadVol: 0.45, lift: 24, cut: 3000 },
}

// Lead hooks: [step in the bar (0-15), scale degree counted from the chord root, length in steps]
const HOOKS = [
  [[0, 4, 2], [3, 4, 1], [4, 5, 2], [6, 4, 2], [8, 2, 3], [12, 4, 1], [13, 5, 1], [14, 7, 2]], // 0: the main phrase
  [[0, 7, 2], [3, 5, 1], [4, 4, 2], [6, 5, 2], [8, 4, 3], [12, 2, 2], [14, 4, 2]], // 1: answer
  [[0, 4, 1], [2, 4, 1], [4, 7, 2], [7, 5, 1], [8, 9, 3], [12, 7, 2], [14, 5, 2]], // 2: higher, more excited
  [[0, 5, 2], [3, 7, 1], [4, 9, 2], [6, 7, 2], [8, 5, 2], [11, 4, 1], [12, 2, 4]], // 3: resolves
]
const BAR_HOOK = [0, 1, 0, 3, 2, 1, 2, 3] // 8-bar loop: bars 4-7 are the "drop" with the higher hook
// bass pattern per bar: [step, semitone offset from the chord root]
const BASS = [[0, 0], [3, 0], [6, 12], [8, 0], [10, 0], [11, 7], [14, 12]]

export function createMusic(getAC) {
  let ac = null
  let filter = null // mood filter (muffles the music in menus)
  let master = null
  let bus = null // everything plays into this, then through the mood filter
  let echo = null
  let noise = null
  let timer = null
  let step = 0
  let next = 0
  let mood = 'menu' // menu | play | over
  let style = STYLES.day
  let tempoMul = 1
  let enabled = true
  let audible = true
  let notes = 0

  function ensure() {
    if (ac) return true
    ac = getAC()
    if (!ac) return false
    master = ac.createGain()
    master.gain.value = 0
    const comp = ac.createDynamicsCompressor() // glues the mix and makes it punchy
    comp.threshold.value = -16
    comp.ratio.value = 5
    comp.attack.value = 0.004
    comp.release.value = 0.16
    filter = ac.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 2600
    bus = ac.createGain()
    bus.connect(filter)
    filter.connect(comp)
    comp.connect(master)
    master.connect(ac.destination)
    // tempo-synced echo for the lead
    echo = ac.createDelay(1)
    const fb = ac.createGain()
    const wet = ac.createGain()
    fb.gain.value = 0.32
    wet.gain.value = 0.3
    echo.connect(fb)
    fb.connect(echo)
    echo.connect(wet)
    wet.connect(bus)
    noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate)
    const d = noise.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    return true
  }

  function apply() {
    if (!ac || !master) return
    const t = ac.currentTime
    const vol = !(enabled && audible) ? 0 : mood === 'play' ? 0.42 : mood === 'menu' ? 0.2 : 0.09
    const cut = mood === 'play' ? 16000 : mood === 'menu' ? 2400 : 650
    master.gain.setTargetAtTime(vol, t, 0.08)
    filter.frequency.setTargetAtTime(cut, t, 0.15)
  }

  /* ---------- instruments ---------- */
  // one oscillator voice; send = how much goes to the echo; detune in cents
  function voice(freq, t, dur, type, vol, lowpass, detune, send, attack) {
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, t)
    if (detune) o.detune.value = detune
    const a = attack || 0.008
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(vol, t + a)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    let out = o
    if (lowpass) {
      const f = ac.createBiquadFilter()
      f.type = 'lowpass'
      f.frequency.setValueAtTime(lowpass, t)
      f.frequency.exponentialRampToValueAtTime(Math.max(300, lowpass * 0.45), t + dur)
      o.connect(f)
      out = f
    }
    out.connect(g)
    g.connect(bus)
    if (send && echo) {
      const s = ac.createGain()
      s.gain.value = send
      g.connect(s)
      s.connect(echo)
    }
    o.start(t)
    o.stop(t + dur + 0.05)
    notes++
  }
  function kick(t, vol) {
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(170, t)
    o.frequency.exponentialRampToValueAtTime(42, t + 0.14)
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
    o.connect(g)
    g.connect(bus)
    o.start(t)
    o.stop(t + 0.3)
    hit(t, 0.015, 'highpass', 3000, vol * 0.25) // click
    notes++
  }
  function hit(t, dur, type, freq, vol, q) {
    const s = ac.createBufferSource()
    const f = ac.createBiquadFilter()
    const g = ac.createGain()
    s.buffer = noise
    f.type = type
    f.frequency.value = freq
    if (q) f.Q.value = q
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    s.connect(f)
    f.connect(g)
    g.connect(bus)
    s.start(t, Math.random() * 0.5, dur + 0.02)
    notes++
  }
  function clap(t, vol) {
    hit(t, 0.02, 'bandpass', 1500, vol, 1.2)
    hit(t + 0.012, 0.02, 'bandpass', 1500, vol * 0.8, 1.2)
    hit(t + 0.026, 0.16, 'bandpass', 1700, vol, 0.9)
  }

  /* ---------- the groove ---------- */
  const degree = (i) => {
    const sc = style.scale
    return sc[((i % 7) + 7) % 7] + 12 * Math.floor(i / 7)
  }
  const stepDur = () => 60 / (style.bpm * tempoMul) / 4

  function playStep(n, t) {
    const bar = Math.floor(n / 16) % 8
    const s = n % 16
    const rd = style.prog[bar % 4]
    const sd = stepDur()
    const full = mood === 'play'
    const drop = bar >= 4
    if (echo) echo.delayTime.value = sd * 3 // dotted-eighth echo

    // drums
    if (mood !== 'over') {
      if (s % 4 === 0) kick(t, full ? 1 : 0.55)
      if (full && (s === 4 || s === 12)) clap(t, 0.5)
      if (full) {
        if (s % 4 === 2) hit(t, 0.11, 'highpass', 7500, 0.26) // open off-beat hat
        else if (s % 2 === 1) hit(t, 0.035, 'highpass', 9000, drop ? 0.14 : 0.08)
        if (drop && s === 0 && bar === 4) hit(t, 1.1, 'highpass', 5000, 0.28) // crash on the drop
        if (bar === 7 && s >= 12) { clap(t, 0.2 + (s - 12) * 0.12); } // snare roll into the loop start
      } else if (s % 8 === 4) {
        hit(t, 0.05, 'highpass', 8000, 0.12)
      }
    }

    // bass: syncopated, punchy, ducks around each kick
    for (const [bs, off] of BASS) {
      if (bs === s) {
        const f = hz(style.key - 24 + degree(rd) + off)
        voice(f, t, sd * 2.4, style.bass, full ? 0.55 : 0.4, 700, 0, 0)
      }
    }

    // pad: soft chord under each bar (all moods, it is what gives the menu its mood)
    if (s === 0) {
      const dur = sd * 15.5
      for (const k of [0, 2, 4]) voice(hz(style.key + 12 + degree(rd + k)), t, dur, 'triangle', full ? 0.07 : 0.1, 1800, k * 3 - 3, 0, 0.12)
    }

    // lead hook: two detuned voices for a fat sound, echoed
    if (mood !== 'over') {
      const hook = HOOKS[BAR_HOOK[bar]]
      for (const [st, d, len] of hook) {
        if (st === s && (full || bar % 2 === 0)) {
          const f = hz(style.key + style.lift + degree(rd + d))
          const v = (full ? 0.2 : 0.14) * style.leadVol
          voice(f, t, sd * len * 0.9, style.lead, v, style.cut, -9, 0.5)
          voice(f, t, sd * len * 0.9, style.lead, v, style.cut, 9, 0.5)
        }
      }
    }

    // arpeggio on 16ths: only in the drop, adds drive
    if (full && drop) {
      const tri = [0, 2, 4, 7, 4, 2]
      voice(hz(style.key + 24 + degree(rd + tri[s % 6])), t, sd * 0.9, 'square', 0.05, 3800, 0, 0.25)
    }
  }

  function tick() {
    if (!ac) return
    if (next < ac.currentTime - 0.05) next = ac.currentTime + 0.05 // never replay a backlog after a pause or mute
    if (!(enabled && audible)) { next = ac.currentTime + 0.05; return }
    const ahead = ac.currentTime + 0.14
    while (next < ahead) {
      playStep(step, next)
      next += stepDur()
      step++
    }
  }

  return {
    // call from a tap / key press: browsers only allow sound after one
    start() {
      if (!ensure()) return
      try { if (ac.state === 'suspended') ac.resume() } catch (e) { /* ignore */ }
      if (!timer) {
        next = ac.currentTime + 0.06
        timer = setInterval(tick, 25)
      }
      apply()
    },
    stop() { clearInterval(timer); timer = null },
    setMood(m) { mood = m; apply() },
    setRoad(id) { style = STYLES[id] || STYLES.day },
    setLevel(n) { tempoMul = 1 + Math.min(0.16, (n - 1) * 0.025) },
    setEnabled(v) { enabled = !!v; apply() },
    setAudible(v) { audible = !!v; apply() },
    stats: () => ({ notes, state: ac ? ac.state : 'none', mood, bpm: Math.round(style.bpm * tempoMul), running: !!timer }),
    dispose() { clearInterval(timer); timer = null },
  }
}
