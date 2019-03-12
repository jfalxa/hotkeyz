import keycode from 'keycode'

keycode.aliases.meta = 91

const MODS = ['meta', 'ctrl', 'alt', 'shift']
const MOD_KEYS = MODS.map(keycode)

const COMBO_RX = (() => {
  const word = `[^ ,+-]+`
  const space = `\\s*`
  const separator = char => `${space}\\${char}${space}`
  const mods = `(${word}(${separator('+')}${word})*)`
  const combo = `((${mods}${separator('-')})?${word})`

  return new RegExp(combo, 'g')
})()

function eventToCombo(e) {
  const key = keycode(e).replace(/\s+/g, '-')
  const mods = MODS.filter(mod => e[mod + 'Key'])

  return mods.length > 0 ? `${mods.join(' + ')} - ${key}` : key
}

function normalizeCombo(combos) {
  const sequence = combos.match(COMBO_RX).map(combo => {
    if (MODS.includes(combo) || (combo.includes('+') && !combo.includes('-'))) {
      throw new Error('Missing key in combo: ' + combos)
    } else if (!combo.includes('-')) {
      return combo.trim()
    }

    const [modCombo, key] = combo.split('-')

    const mods = modCombo
      .split('+')
      .map(mod => mod.trim())
      .sort((a, b) => MODS.indexOf(a) - MODS.indexOf(b))

    return `${mods.join(' + ')} - ${key.trim()}`
  })

  return sequence.join(' ')
}

function normalizeCombos(keys) {
  const normalized = {}

  Object.keys(keys).forEach(key =>
    key.split(',').forEach(combo => {
      normalized[normalizeCombo(combo)] = keys[key]
    })
  )

  return normalized
}

function initSequence(time) {
  let current = ''
  let timeout = null

  function reset() {
    current = ''
  }

  function sequence(chunk) {
    if (timeout) {
      clearTimeout(timeout)
    }

    current = current ? [current, chunk].join(' ') : chunk
    timeout = setTimeout(reset, time)

    return current
  }

  return { sequence, reset }
}

export default function hotkeyz(config) {
  const combos = normalizeCombos(config)
  const { sequence, reset } = initSequence(1000)

  return e => {
    e.preventDefault()
    e.stopPropagation()

    if (MOD_KEYS.includes(e.keyCode)) {
      return
    }

    const combo = eventToCombo(e)
    const seq = sequence(combo)

    if (seq in combos) {
      combos[seq](e)
      reset()
    }
  }
}
