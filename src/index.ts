type Keys = { [key: string]: Function }

const MODS = ['meta', 'ctrl', 'alt', 'shift']

const FRIENDLY_KEYS = {
  ' ': 'space',
  Escape: 'esc',
  ArrowUp: 'up',
  ArrowRight: 'right',
  ArrowDown: 'down',
  ArrowLeft: 'left'
}

const COMBO_RX = (() => {
  const word = `[\\w]+`
  const separator = char => `[\\s]*\\${char}[\\s]*`
  const mods = `(${word}(${separator('+')}${word})*)`
  const combo = `((${mods}${separator('-')})?${word})`

  return new RegExp(combo, 'g')
})()

function friendlyKey(key: string) {
  return key in FRIENDLY_KEYS ? FRIENDLY_KEYS[key] : key.toLowerCase()
}

function toCombo(e: KeyboardEvent) {
  const key = friendlyKey(e.key)
  const mods = MODS.filter(mod => e[mod + 'Key'])

  return mods.length > 0 ? `${mods.join(' + ')} - ${key}` : key
}

function normalizeCombo(combos: string) {
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

function normalizeCombos(keys: Keys): Keys {
  const normalized: Keys = {}

  Object.keys(keys).forEach(key =>
    key.split(',').forEach(combo => {
      normalized[normalizeCombo(combo)] = keys[key]
    })
  )

  return normalized
}

function initSequence(time: number) {
  let sequence = ''
  let timeout = null

  return (chunk: string) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    sequence = sequence ? [sequence, chunk].join(' ') : chunk
    timeout = setTimeout(() => (sequence = ''), time)

    return sequence
  }
}

export default function hotkeyz(config: Keys) {
  const combos = normalizeCombos(config)
  const sequence = initSequence(1000)

  return (e: KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const combo = toCombo(e)
    const seq = sequence(combo)

    if (seq in combos) {
      combos[seq](e)
    }
  }
}
