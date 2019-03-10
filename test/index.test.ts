import hotkeyz from '../src'

jest.useFakeTimers()

const keydown = (key: string, modifier: object = {}) =>
  ({ key, ...modifier } as KeyboardEvent)

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

it('has more friendly name for special keys', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({
    'up, right, down, left, esc, space': callback
  })

  onKeyDown(keydown('ArrowUp'))
  jest.runAllTimers()

  onKeyDown(keydown('ArrowRight'))
  jest.runAllTimers()

  onKeyDown(keydown('ArrowDown'))
  jest.runAllTimers()

  onKeyDown(keydown('ArrowLeft'))
  jest.runAllTimers()

  onKeyDown(keydown('Escape'))
  jest.runAllTimers()

  onKeyDown(keydown(' '))
  jest.runAllTimers()

  expect(callback).toHaveBeenCalledTimes(6)
})
