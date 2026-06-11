// ===== Item data (FireRed-style names, effects, prices) =====
// kind: 'heal' (restore HP), 'cure' (status), 'orb' (capture device)
// cures: list of statuses removed ('ALL' = any)
const ITEMS = {
  potion:       { name: 'Potion',        kind: 'heal', amount: 20,  price: 300,
                  desc: 'A spray-type medicine. Restores 20 HP.' },
  superpotion:  { name: 'Super Potion',  kind: 'heal', amount: 50,  price: 700,
                  desc: 'A spray-type medicine. Restores 50 HP.' },
  antidote:     { name: 'Antidote',      kind: 'cure', cures: ['PSN'], price: 100,
                  desc: 'Heals a poisoned team member.' },
  paralyzeheal: { name: 'Paralyze Heal', kind: 'cure', cures: ['PAR'], price: 200,
                  desc: 'Heals a paralyzed team member.' },
  awakening:    { name: 'Awakening',     kind: 'cure', cures: ['SLP'], price: 250,
                  desc: 'Awakens a sleeping team member.' },
  burnheal:     { name: 'Burn Heal',     kind: 'cure', cures: ['BRN'], price: 250,
                  desc: 'Heals a burned team member.' },
  iceheal:      { name: 'Ice Heal',      kind: 'cure', cures: ['FRZ'], price: 250,
                  desc: 'Defrosts a frozen team member.' },
  fullheal:     { name: 'Full Heal',     kind: 'cure', cures: ['ALL'], price: 600,
                  desc: 'Heals any status condition.' },
  pokeball:     { name: 'Poke Ball',     kind: 'orb', rate: 1.0, price: 200,
                  desc: 'A device for catching wild creatures.' },
  greatball:    { name: 'Great Ball',    kind: 'orb', rate: 1.5, price: 600,
                  desc: 'A high-performance ball with a better catch rate.' },
};

// What the shop sells, in display order.
const SHOP_STOCK = [
  'potion', 'superpotion', 'pokeball', 'greatball',
  'antidote', 'paralyzeheal', 'awakening', 'burnheal', 'iceheal', 'fullheal',
];
