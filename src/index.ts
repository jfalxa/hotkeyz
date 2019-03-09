type Keys = { [key: string]: Function }

const MODIFIERS = ['meta', 'ctrl', 'alt', 'shift']

function eventToKey(e: KeyboardEvent) {
  const modifiers = MODIFIERS.filter(key => e[key + 'Key'] === true)
  const key = e.key

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

export default function keyz(config: Keys) {
  const keys = normalizeCombos(config)

  return (e: KeyboardEvent) => {
    const key = eventToKey(e)

    if (key in keys) {
      keys[key](e)
    }
  }
}
