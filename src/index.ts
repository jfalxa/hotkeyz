type Keys = { [key: string]: Function }

const MODIFIERS = ['meta', 'ctrl', 'alt', 'shift']

function eventToKey(e: KeyboardEvent) {
  const modifiers = MODIFIERS.filter(key => e[key + 'Key'] === true)
  const key = e.key

  return modifiers.length > 0 ? `${modifiers.join(' + ')} - ${key}` : key
}

function normalizeKey(combo: string) {
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

function normalizeKeys(keys: Keys): Keys {
  const normalized: Keys = {}

  Object.keys(keys).forEach(key => {
    normalized[normalizeKey(key)] = keys[key]
  })

  return normalized
}

export default function keyz(config: Keys) {
  const keys = normalizeKeys(config)

  return (e: KeyboardEvent) => {
    const key = eventToKey(e)

    if (key in keys) {
      keys[key](e)
    }
  }
}
