import keycode from 'keycode'

keycode.aliases.meta = keycode.codes.command

const MODS = ['meta', 'ctrl', 'alt', 'shift']
const MOD_KEYS = MODS.map(keycode)

const COMBO_RX = /((([^ ]+(\s*\+\s*[^ ]+)*)\s*\-\s*)?[^ ]+)/g

function isValid(combo) {
  return combo.includes('-') || !MODS.includes(combo)
}

function normalizeCombo(combo, _, combos) {
  if (!isValid(combo)) {
    throw new Error('Missing key in combo: ' + combos.join(' '))
  } else if (!combo.includes('-') || combo === '-') {
    return combo.trim()
  }

  const members = combo.split('-')

  // sort modifiers in standard order
  const mods = members[0]
    .split('+')
    .map(mod => mod.trim())
    .sort((a, b) => MODS.indexOf(a) - MODS.indexOf(b))
    .join(' + ')

  const key = members[1].trim()

  return `${mods} - ${key}`
}

function normalizeHotkeys(hotkeys) {
  const hotkeyMap = new Map()

  Object.keys(hotkeys).forEach(command => {
    command.split(',').forEach(cmd => {
      const hotkey = cmd.match(COMBO_RX).map(normalizeCombo)
      const callback = hotkeys[command]

      hotkeyMap.set(hotkey, callback)
    })
  })

  return hotkeyMap
}

function eventToCombos(event) {
  const key = event.key
  const keyCode = keycode(event) ? keycode(event).replace(/\s+/g, '-') : key
  const mods = MODS.filter(mod => event[mod + 'Key']).join(' + ')

  // mods are ignored when shifted key values are used, e.g: `A` shouldn't be `shift - A`
  const keyCombo = mods && key === keyCode ? `${mods} - ${key}` : key
  const keyCodeCombo = mods ? `${mods} - ${keyCode}` : keyCode

  return [keyCombo, keyCodeCombo]
}

function initSequence(time) {
  let keys = []
  let keyCodes = []
  let timeout = null

  function reset() {
    keys = []
    keyCodes = []
  }

  function add(event) {
    if (timeout) {
      clearTimeout(timeout)
    }

    const combos = eventToCombos(event)

    keys.push(combos[0])
    keyCodes.push(combos[1])

    timeout = setTimeout(reset, time)

    return [keys, keyCodes]
  }

  return { add, reset }
}

function match(sequence, command) {
  return sequence.slice(-command.length).join(' ') === command.join(' ')
}

function findCommands(sequences, commands) {
  return commands.filter(command =>
    sequences.some(sequence => match(sequence, command))
  )
}

export default function hotkeyz(config, time = 1000) {
  const hotkeys = normalizeHotkeys(config)
  const sequence = initSequence(time)

  const commands = Array.from(hotkeys.keys())

  return event => {
    if (MOD_KEYS.includes(event.keyCode)) {
      return
    }

    const sequences = sequence.add(event)
    const matches = findCommands(sequences, commands)

    // stop the event normal behavior only if it matches a hotkey
    if (matches.length > 0) {
      event.preventDefault()
      event.stopPropagation()

      matches.forEach(command => hotkeys.get(command)(event))

      // reset the sequence buffer if one was executed
      if (matches.some(command => command.length > 1)) {
        sequence.reset()
      }
    }
  }
}
