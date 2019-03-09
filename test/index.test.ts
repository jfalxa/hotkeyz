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

  expect(callback).toHaveBeenCalledTimes(1)
})

it('reacts to a combo of keys', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({ 'shift - space': callback })

  onKeyDown(keydown('space'))
  jest.runAllTimers()

  onKeyDown(keydown('space', { shiftKey: true }))

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

  expect(callback).toHaveBeenCalledTimes(3)
})

it('can work with key sequences', () => {
  const callback = jest.fn()

  const onKeyDown = hotkeyz({
    'a b c': callback
  })

  onKeyDown(keydown('a'))
  onKeyDown(keydown('b'))
  onKeyDown(keydown('c'))

  expect(callback).toHaveBeenCalledTimes(1)
})
