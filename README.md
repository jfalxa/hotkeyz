# HotKeyz

A tiny (0.7kB) dev-friendly keyboard event listener.

## Installation

`npm install hotkeyz`

## Building the listener

The `hotkeyz` function expects a config object as parameter and will return a function that you can use as a keyboard event listener.

The config object lists the different combos you'd like to react to, they should use valid combos as keys and event callbacks as value.

Combos are composed of modifiers and actual keys and should respect the following rules:

- simple key: `{key}`
- modifier: `{modifier} - {key}`
- many modifiers: `{modifier} + {modifier} [+ ...] - {key}`
- many combos: `{combo}, {combo} [, ...]`
- combo sequence (waits up to 1s between each combo): `{combo} {combo} [...]`

Valid modifiers are:

- `meta`
- `ctrl`
- `alt`
- `shift`

For the arrow keys you can use `up`, `right`, `down`, `left`.
For the escape key you can use `esc`.

```JS
import hotkeyz from 'hotkeyz'

const listener = hotkeyz({
  'a': () => console.log('Pressed A.'),

  'meta - space': () => console.log('Pressed SPACE while holding META.'),

  'shift + alt + ctrl - esc': () => console.log('Pressed ESCAPE while holding SHIFT, ALT and CTRL.'),

  'x, y': e => console.log('Pressed X or Y.', { key: e.key }),

  'a b c': () => console.log('Pressed A, then B, then C.'),

  'meta - k meta - up': e => console.log('Pressed k while holding META, then up while still holding META')
})
```

## Examples

### Vanilla

```JS
const listener = hotkeyz({
  a: () => console.log('a')
 })

document.addEventListener('keydown', listener)
```

### React

```JS

class Hotkeyz extends React.Component {
  doSomething = () => {
    console.log('something was done')
  }

  listener = hotkeyz({
    esc: this.doSomething
  })

  render() {
    return <div onKeyDown={this.listener} />
  }
}
```
