import keyz from '../src'

const keydown = (key: string, modifier: object = {}) =>
  ({ key, ...modifier } as KeyboardEvent)

it('reacts to a keyboard event', () => {
  const callback = jest.fn()

  const onKeyDown = keyz({ space: callback })

  onKeyDown(keydown('space'))
  onKeyDown(keydown('up'))

  expect(callback).toHaveBeenCalledTimes(1)
})

it('reacts to a combo of keys', () => {
  const callback = jest.fn()

  const onKeyDown = keyz({ 'shift - space': callback })

  onKeyDown(keydown('space'))
  onKeyDown(keydown('space', { shiftKey: true }))

  expect(callback).toHaveBeenCalledTimes(1)
})

it('reacts to a combos written in any order of keys', () => {
  const callback = jest.fn()

  const onKeyDown = keyz({
    'shift + alt - space': callback
  })

  onKeyDown(keydown('space', { shiftKey: true }))
  onKeyDown(keydown('space', { altKey: true, shiftKey: true }))

  expect(callback).toHaveBeenCalledTimes(1)
})

it('throws an error when writing malformed key sequences', () => {
  expect(() => keyz({ 'shift + alt': () => {} })).toThrow(
    'Missing key in combo: shift + alt'
  )
})
