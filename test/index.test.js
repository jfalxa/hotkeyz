import keycode from 'keycode'
import hotkeyz from '../src'

jest.useFakeTimers()

const keydown = (key, modifier = {}) =>
  new KeyboardEvent('keydown', {
    keyCode: keycode(key),
    ...modifier
  })

it('reacts to a keyboard event', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({ space: callback })

  onKeyDown(keydown('space'))
  jest.runAllTimers()

  onKeyDown(keydown('up'))
  jest.runAllTimers()

  expect(callback).toHaveBeenCalledTimes(1)
})

it('reacts to a combo of keys', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({ 'shift - space': callback })

  onKeyDown(keydown('space'))
  jest.runAllTimers()

  onKeyDown(keydown('space', { shiftKey: true }))
  jest.runAllTimers()

  expect(callback).toHaveBeenCalledTimes(1)
})

it('reacts to a combos written in any order of keys', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({
    'shift + alt - space': callback
  })

  onKeyDown(keydown('space', { shiftKey: true }))
  jest.runAllTimers()

  onKeyDown(keydown('space', { altKey: true, shiftKey: true }))
  jest.runAllTimers()

  expect(callback).toHaveBeenCalledTimes(1)
})

it('throws an error when writing malformed key sequences', () => {
  expect(() => hotkeyz({ 'shift + alt': () => {} })).toThrow(
    'Missing key in combo: shift + alt'
  )
})

it('can list many combos at once', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({
    'a, b, shift - c': callback
  })

  onKeyDown(keydown('a'))
  jest.runAllTimers()

  onKeyDown(keydown('b'))
  jest.runAllTimers()

  onKeyDown(keydown('c'))
  jest.runAllTimers()

  onKeyDown(keydown('c', { shiftKey: true }))
  jest.runAllTimers()

  onKeyDown(keydown('d'))
  jest.runAllTimers()

  expect(callback).toHaveBeenCalledTimes(3)
})

it('can work with key sequences', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({
    'a b c': callback
  })

  onKeyDown(keydown('c'))
  onKeyDown(keydown('b'))
  onKeyDown(keydown('a'))

  jest.runAllTimers()

  expect(callback).not.toHaveBeenCalled()

  onKeyDown(keydown('a'))
  onKeyDown(keydown('b'))
  onKeyDown(keydown('c'))

  jest.runAllTimers()

  expect(callback).toHaveBeenCalledTimes(1)
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
  jest.runAllTimers()

  onKeyDown(keydown('right'))
  jest.runAllTimers()

  onKeyDown(keydown('down'))
  jest.runAllTimers()

  onKeyDown(keydown('down'))
  jest.runAllTimers()

  onKeyDown(keydown('Escape'))
  jest.runAllTimers()

  onKeyDown(keydown(' '))
  jest.runAllTimers()

  expect(callback).toHaveBeenCalledTimes(6)
})

it('ignores single mod key presses', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({
    'shift - a': callback
  })

  onKeyDown(keydown('shift'))
  jest.runAllTimers()

  expect(callback).not.toHaveBeenCalled()
})

it('handles special characters', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({
    'shift - /': callback,
    'shift - .': callback,
    'shift - `': callback
  })

  onKeyDown(keydown('/', { shiftKey: true }))
  jest.runAllTimers()

  onKeyDown(keydown('.', { shiftKey: true }))
  jest.runAllTimers()

  onKeyDown(keydown('`', { shiftKey: true }))
  jest.runAllTimers()

  expect(callback).toHaveBeenCalledTimes(3)
})
