import { Container, Graphics } from 'pixi.js'

export class Treat {
  constructor(game, x, y) {
    this.game = game
    this.x = x
    this.y = y
    this.container = new Container()
    this.container.x = x
    this.container.y = y

    this.draw()
  }

  draw() {
    const sprite = new Graphics()
    const s = 3 // pixel size

    // Fish treat pattern
    sprite.fill(0xE8C080)

    const fish = [
      [0,0,1,1,1,0,0],
      [0,1,1,1,1,1,0],
      [1,1,1,1,1,1,1],
      [0,1,1,1,1,1,0],
      [0,0,1,1,1,0,0],
    ]

    fish.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell) {
          sprite.rect(rx * s, ry * s, s, s)
        }
      })
    })

    // Tail
    sprite.fill(0xD4A060)
    sprite.rect(6 * s, 1 * s, s, s)
    sprite.rect(7 * s, 0 * s, s, s)
    sprite.rect(7 * s, 2 * s, s, s)
    sprite.rect(7 * s, 3 * s, s * 2, s)
    sprite.rect(7 * s, 4 * s, s, s)

    // Eye
    sprite.fill(0x000000)
    sprite.rect(1 * s, 2 * s, s, s)

    // Center
    sprite.pivot.set(10, 7)

    this.container.addChild(sprite)
  }
}
