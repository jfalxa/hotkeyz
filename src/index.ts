type Keys = { [key: string]: Function }

const MODIFIERS = ['meta', 'ctrl', 'alt', 'shift']

const FRIENDLY_KEYS = {
  ' ': 'space',
  Escape: 'esc',
  ArrowUp: 'up',
  ArrowRight: 'right',
  ArrowDown: 'down',
  ArrowLeft: 'left'
}

function friendlyKey(key: string) {
  return key in FRIENDLY_KEYS ? FRIENDLY_KEYS[key] : key.toLowerCase()
}

function toCombo(key: string, e: KeyboardEvent) {
  const modifiers = MODIFIERS.filter(key => e[key + 'Key'] === true)
  return modifiers.length > 0 ? `${modifiers.join(' + ')} - ${key}` : key
}

function normalizeCombo(combo: string) {
  if (combo.includes('+') && !combo.includes('-')) {
    throw new Error('Missing key in combo: ' + combo)
  } else if (!combo.includes('-')) {
    return combo.trim()
  }

  const [modifierCombo, key] = combo.split('-')

  const modifiers = modifierCombo
    .split('+')
    .map(modifier => modifier.trim())
    .sort((a, b) => MODIFIERS.indexOf(a) - MODIFIERS.indexOf(b))

  return `${modifiers.join(' + ')} - ${key.trim()}`
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
  const sequence = initSequence(40)

  return (e: KeyboardEvent) => {
    const key = friendlyKey(e.key)
    const seq = sequence(key)
    const combo = toCombo(seq, e)

    if (combo in combos) {
      combos[combo](e)
    }
  }
}
