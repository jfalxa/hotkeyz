import keycode from 'keycode'

keycode.aliases.meta = keycode.codes.command

const MODS = ['meta', 'ctrl', 'alt', 'shift']
const MOD_KEYS = MODS.map(keycode)

const SYMBOLS = {
  plus: '+',
  minus: '-',
  comma: ','
}

const COMBO_RX = (() => {
  const word = `[^ ]+`
  const space = `\\s*`
  const separator = char => `${space}\\${char}${space}`
  const mods = `(${word}(${separator('+')}${word})*)`
  const combo = `((${mods}${separator('-')})?${word})`

  return new RegExp(combo, 'g')
})()

function isValid(combo) {
  const isMod = MODS.includes(combo)
  const hasMods = combo.includes('-')

  return hasMods || !isMod
}

function eventToCombos(event) {
  const key = event.key
  const keyCode = keycode(event).replace(/\s+/g, '-').toLowerCase() // prettier-ignore
  const mods = MODS.filter(mod => event[mod + 'Key']).join(' + ')

  // mods should be ignored when shifted key values are used, e.g: `A` shouldn't be `shift - A`
  const keyCombo = mods && key === keyCode ? `${mods} - ${key}` : key
  const keyCodeCombo = mods ? `${mods} - ${keyCode}` : keyCode

  return [keyCombo, keyCodeCombo]
}

function normalizeKey(raw) {
  const key = raw.trim()
  return key in SYMBOLS ? SYMBOLS[key] : key
}

function normalizeCombo(combo, _, combos) {
  if (!isValid(combo)) {
    throw new Error('Malformed combo: ' + combos.join(' '))
  } else if (!combo.includes('-')) {
    return normalizeKey(combo)
  }

  const modsAndKey = combo.split('-')

  // sort modifiers in standard order
  const mods = modsAndKey[0]
    .split('+')
    .map(mod => mod.trim())
    .sort((a, b) => MODS.indexOf(a) - MODS.indexOf(b))
    .join(' + ')

  const key = normalizeKey(modsAndKey[1])

  return `${mods} - ${key}`
}

function normalizeCommand(command) {
  return command
    .match(COMBO_RX)
    .map(normalizeCombo)
    .join(' ')
}

function normalizeHotkeys(hotkeys) {
  const normalized = {}

  Object.keys(hotkeys).forEach(command => {
    command.split(',').forEach(cmd => {
      normalized[normalizeCommand(cmd)] = hotkeys[command]
    })
  })

  return normalized
}

function initSequence(time) {
  let keys = ''
  let keyCodes = ''
  let timeout = null

  function reset() {
    keys = ''
    keyCodes = ''
  }

  return combos => {
    if (timeout) {
      clearTimeout(timeout)
    }

    const key = combos[0]
    const keyCode = combos[1]

    keys = keys ? `${keys} ${key}` : key
    keyCodes = keyCodes ? `${keyCodes} ${keyCode}` : keyCode

    timeout = setTimeout(reset, time)

    // avoid duplicate callback invocation for the first iteration of a sequence by not returning anything
    return keys === key && keyCodes === keyCode ? null : [keys, keyCodes]
  }
}

export default function hotkeyz(config, time = 1000) {
  const hotkeys = normalizeHotkeys(config)
  const sequence = initSequence(time)

  const isCommand = command => command in hotkeys

  return event => {
    if (MOD_KEYS.includes(event.keyCode)) {
      return
    }

    const combos = eventToCombos(event)
    const sequences = sequence(combos)

    const command = combos.find(isCommand)
    const seqCommand = sequences && sequences.find(isCommand)

    // stop the event normal behaviour only if it matches a hotkey
    if (command || seqCommand) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (command) {
      hotkeys[command](event)
    }

    if (seqCommand) {
      hotkeys[seqCommand](event)
    }
  }
}
