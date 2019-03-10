# HotKeyz

A keyboard event listener on steroids.

## Installation

`npm install hotkeyz`

## Building the listener

The `hotkeyz` function expects a config object as parameter and will return a function that you can use as a keyboard event listener.

The config object lists the different combos you'd like to react to, they should use valid combos as keys and give them a event callback as value.

Combos are composed of modifiers and actual keys and should respect the following rules:

- simple key: `{key}`
- modifier: `{modifier} - {key}`
- many modifiers: `{modifier} + {modifier} + {modifier} - {key}`
- key sequence (waits between each press): `{key} {key} {key}`

```JS
import hotkeyz from 'hotkeyz'

const listener = hotkeyz({
  'a': () => console.log('Pressed A.'),

  'ctrl - space': () => console.log('Pressed SPACE while holding CTRL.'),

  'shift + ctrl - esc': () => console.log('Pressed ESCAPE while holding SHIFT and CTRL.'),

  'a b c': () => console.log('Pressed A, then B, then C.'),

  'x, y': e => console.log('Pressed X or Y.', { key: e.key })
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
