import { Container, Graphics } from 'pixi.js'

export class Toy {
  constructor(game) {
    this.game = game
    this.x = 0
    this.y = 0
    this.targetX = 0
    this.targetY = 0
    this.visible = false
    this.container = new Container()

    this.draw()
    this.container.visible = false
  }

  draw() {
    const sprite = new Graphics()
    const s = 3 // pixel size

    // Feather toy (깃털)
    // String
    sprite.fill(0x8B4513)
    sprite.rect(0, 0, s, s * 8)

    // Feather
    sprite.fill(0xFF6B9D)
    const feather = [
      [0,0,1,0,0],
      [0,1,1,1,0],
      [1,1,1,1,1],
      [0,1,1,1,0],
      [0,1,1,1,0],
      [0,0,1,0,0],
    ]

    feather.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell) {
          sprite.rect((rx - 2) * s, (ry + 8) * s, s, s)
        }
      })
    })

    // Sparkle accents
    sprite.fill(0xFFFFFF)
    sprite.rect(-1 * s, 10 * s, s, s)
    sprite.rect(1 * s, 11 * s, s, s)

    // Center at feather
    sprite.pivot.set(0, 12 * s)

    this.container.addChild(sprite)
  }

  moveTo(x, y) {
    this.targetX = x
    this.targetY = y
  }

  setVisible(visible) {
    this.visible = visible
    this.container.visible = visible
  }

  update(delta) {
    if (!this.visible) return

    // Smooth follow mouse
    this.x += (this.targetX - this.x) * 0.2
    this.y += (this.targetY - this.y) * 0.2

    this.container.x = this.x
    this.container.y = this.y

    // Slight swing animation
    this.container.rotation = Math.sin(Date.now() / 150) * 0.3
  }
}
