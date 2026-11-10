// Everything that can be unlocked with coins. Shared by the 3D engine (colours, perks, road rules) and the UI.

/* ---------- runners ---------- */
// perk keys the engine understands: magnetMul, doubleMul (power-up duration), startShield, reviveCost (orbs), coinMul (coins after a run)
export const CHARACTERS = {
  nova: {
    id: 'nova', name: 'Nova', price: 0,
    body: '#f4f0ff', acc: '#ff3d8b', visor: '#3cf2ff', accessory: null,
    blurb: 'The all-rounder. No tricks, no weaknesses.', perk: {}, perkText: 'No perk',
  },
  volt: {
    id: 'volt', name: 'Volt', price: 150,
    body: '#ffe27a', acc: '#2a9dff', visor: '#ffffff', accessory: 'antenna',
    blurb: 'Charged up and always pulling orbs closer.', perk: { magnetMul: 1.5 }, perkText: 'Magnet lasts 50% longer',
  },
  blaze: {
    id: 'blaze', name: 'Blaze', price: 350,
    body: '#ffb27a', acc: '#ff4a1a', visor: '#ffe27a', accessory: 'horns',
    blurb: 'Hot-headed and greedy for orbs.', perk: { doubleMul: 1.5 }, perkText: 'x2 Orbs lasts 50% longer',
  },
  glacier: {
    id: 'glacier', name: 'Glacier', price: 700,
    body: '#c8ecff', acc: '#3a8fe0', visor: '#ffffff', accessory: 'crystal',
    blurb: 'Cool under pressure. Arrives with armour on.', perk: { startShield: true }, perkText: 'Starts every run with a Shield',
  },
  shadow: {
    id: 'shadow', name: 'Shadow', price: 1200,
    body: '#3a3560', acc: '#b06bff', visor: '#ff3d8b', accessory: 'scarf',
    blurb: 'Hard to catch, quick to come back.', perk: { reviveCost: 6 }, perkText: 'Revive costs only 6 orbs',
  },
  royal: {
    id: 'royal', name: 'Royal', price: 2000,
    body: '#fff3d0', acc: '#ffb300', visor: '#ff3d8b', accessory: 'crown',
    blurb: 'Runs the city. Gets paid for it.', perk: { coinMul: 1.25 }, perkText: '+25% coins after every run',
  },
}
export const CHARACTER_LIST = Object.values(CHARACTERS)

/* ---------- roads ---------- */
// speed: multiplier on run speed. turn: how quickly you change lane (lower = slippery). hazard: more obstacles, fewer breathers.
// coinMul: bonus on the coins you bank after a run. swatch: [sky top, sky low, road] for the card thumbnail.
export const ROADS = {
  day: {
    id: 'day', name: 'Sunny Bridge', price: 0, tags: ['Calm'],
    blurb: 'Wooden planks high above the clouds. The relaxed way to learn the city.',
    speed: 1, turn: 14, hazard: 1, coinMul: 1, swatch: ['#2c74da', '#a9d8ff', '#c98a4a'],
  },
  dusk: {
    id: 'dusk', name: 'Neon Dusk', price: 200, tags: ['Faster', '+20% coins'],
    blurb: 'Sunset over a glowing skyline. The track runs about 10% faster.',
    speed: 1.1, turn: 14, hazard: 1, coinMul: 1.2, swatch: ['#150b3a', '#ff6a5c', '#2b2352'],
  },
  frost: {
    id: 'frost', name: 'Frozen Aurora', price: 600, tags: ['Slippery', '+40% coins'],
    blurb: 'Ice under your feet. Lane changes slide, so plan your moves early.',
    speed: 1, turn: 6.5, hazard: 1, coinMul: 1.4, swatch: ['#06142e', '#a7defa', '#a6dcf2'],
  },
  ember: {
    id: 'ember', name: 'Ember Run', price: 1500, tags: ['Very fast', 'More hazards', '+80% coins'],
    blurb: 'A burning night road. Faster, packed with obstacles, and it pays the best.',
    speed: 1.18, turn: 14, hazard: 1.5, coinMul: 1.8, swatch: ['#1a0505', '#ff6a1a', '#2a1614'],
  },
}
export const ROAD_LIST = Object.values(ROADS)
