import keycode from 'keycode'
import hotkeyz from '../src'

jest.useFakeTimers()

const codes = {
  '?': keycode('/'),
  '+': keycode('=')
}

const keydown = (key, modifier = {}) =>
  new KeyboardEvent('keydown', {
    key,
    keyCode: key in codes ? codes[key] : keycode(key),
    ...modifier
  })

it('reacts to a keyboard event', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({ space: callback })

  onKeyDown(keydown('space'))
  onKeyDown(keydown('up'))

  expect(callback).toHaveBeenCalledTimes(1)
})

it('reacts to a combo of keys', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({ 'shift - space': callback })

  onKeyDown(keydown('space'))
  onKeyDown(keydown('space', { shiftKey: true }))

  expect(callback).toHaveBeenCalledTimes(1)
})

it('reacts to a combos written in any order of keys', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({
    'shift + alt - space': callback
  })

  onKeyDown(keydown('space', { shiftKey: true }))
  onKeyDown(keydown('space', { altKey: true, shiftKey: true }))

  expect(callback).toHaveBeenCalledTimes(1)
})

it('throws an error when writing malformed key sequences', () => {
  expect(() => hotkeyz({ 'shift + alt': () => {} })).toThrow(
    'Malformed combo: shift + alt'
  )
})

it('can list many combos at once', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({
    'a, b, shift - c': callback
  })

  onKeyDown(keydown('a'))
  onKeyDown(keydown('b'))
  onKeyDown(keydown('c'))
  onKeyDown(keydown('c', { shiftKey: true }))
  onKeyDown(keydown('d'))

  expect(callback).toHaveBeenCalledTimes(3)
})

it('can work with key sequences', () => {
  const callback = jest.fn()
  const callbackA = jest.fn()

  const onKeyDown = hotkeyz({
    a: callbackA,
    'a b c': callback
  })

  onKeyDown(keydown('c'))
  onKeyDown(keydown('b'))
  onKeyDown(keydown('a'))

  jest.runAllTimers()

  expect(callback).not.toHaveBeenCalled()
  expect(callbackA).toHaveBeenCalledTimes(1)

  onKeyDown(keydown('a'))
  onKeyDown(keydown('b'))
  onKeyDown(keydown('c'))

  jest.runAllTimers()

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callbackA).toHaveBeenCalledTimes(2)
})

it('can use modifiers in sequences', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({
    'meta - k meta - l': callback
  })

  onKeyDown(keydown('k'))
  onKeyDown(keydown('l'))

  jest.runAllTimers()

  expect(callback).not.toHaveBeenCalled()

  onKeyDown(keydown('k', { metaKey: true }))
  onKeyDown(keydown('l', { metaKey: true }))

  jest.runAllTimers()

  expect(callback).toHaveBeenCalledTimes(1)
})

it('can use more friendly name for special keys', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({
    'up, right, down, left, esc, space': callback
  })

  onKeyDown(keydown('up'))
  onKeyDown(keydown('right'))
  onKeyDown(keydown('down'))
  onKeyDown(keydown('down'))
  onKeyDown(keydown('Escape'))
  onKeyDown(keydown(' '))

  expect(callback).toHaveBeenCalledTimes(6)
})

it('ignores single mod key presses', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({
    'shift - a': callback
  })

  onKeyDown(keydown('shift'))

  expect(callback).not.toHaveBeenCalled()
})

it('simple hotkeys do not react when modifiers are used', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({ a: callback })

  onKeyDown(keydown('a', { metaKey: true }))

  expect(callback).toHaveBeenCalledTimes(0)

  onKeyDown(keydown('a'))

  expect(callback).toHaveBeenCalledTimes(1)
})

it('handles special characters', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({
    'shift - /': callback,
    'shift - .': callback,
    'shift - `': callback,
    '?': callback
  })

  onKeyDown(keydown('/', { shiftKey: true }))
  onKeyDown(keydown('.', { shiftKey: true }))
  onKeyDown(keydown('`', { shiftKey: true }))
  onKeyDown(keydown('?'))

  expect(callback).toHaveBeenCalledTimes(4)
})

it('handles comma, + and - as keys', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({
    plus: callback,
    minus: callback,
    comma: callback,
    'plus minus': callback,
    'shift - minus': callback
  })

  onKeyDown(keydown('+'))
  onKeyDown(keydown('-'))
  onKeyDown(keydown(','))
  onKeyDown(keydown('-', { shiftKey: true }))

  jest.runAllTimers()

  expect(callback).toHaveBeenCalledTimes(5)
})

it('handles sequences of special chars', () => {
  const callback1 = jest.fn()
  const callback2 = jest.fn()

  const onKeyDown = hotkeyz({
    '?': callback1,
    '? ? ?': callback2
  })

  onKeyDown(keydown('?', { shiftKey: true }))
  onKeyDown(keydown('?', { shiftKey: true }))
  onKeyDown(keydown('?', { shiftKey: true }))

  jest.runAllTimers()

  expect(callback1).toHaveBeenCalledTimes(3)
  expect(callback2).toHaveBeenCalledTimes(1)
})