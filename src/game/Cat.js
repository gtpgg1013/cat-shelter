import { Container, Graphics, Text } from 'pixi.js'

export class Cat {
  constructor(game, type = 'orange') {
    this.game = game
    this.type = type
    this.container = new Container()
    this.container.eventMode = 'static'
    this.container.cursor = 'pointer'

    this.x = 400
    this.y = 400
    this.vx = 0
    this.vy = 0
    this.direction = 1 // 1 = right, -1 = left

    this.state = 'idle' // idle, walking, sitting, eating, playing, petted
    this.stateTimer = 0
    this.targetX = null
    this.targetY = null
    this.targetTreat = null
    this.isEating = false
    this.isPetted = false
    this.pettedTimer = 0

    this.colors = this.getColors()
    this.drawCat()
    this.setupEvents()

    // Start with random behavior
    this.scheduleNextAction()
  }

  getColors() {
    const palettes = {
      orange: { body: 0xE8A060, stripes: 0xC87830, ears: 0xFFB070 },
      tuxedo: { body: 0x303030, stripes: 0xFFFFFF, ears: 0x404040 },
      calico: { body: 0xFFFFFF, stripes: 0xE8A060, spots: 0x303030 },
      tabby: { body: 0x808060, stripes: 0x505030, ears: 0x909070 },
      white: { body: 0xFFFFF0, stripes: 0xF0F0E0, ears: 0xFFD0D0 }
    }
    return palettes[this.type] || palettes.orange
  }

  drawCat() {
    this.sprite = new Graphics()
    const s = 4 // pixel size
    const c = this.colors

    // Body
    this.sprite.fill(c.body)

    // Cat body pattern (sitting pose - simplified pixel art)
    const body = [
      [0,0,0,1,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,1,0],
    ]

    body.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell) {
          this.sprite.rect(rx * s, (ry + 4) * s, s, s)
        }
      })
    })

    // Head
    const head = [
      [0,1,1,0,0,1,1,0],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,0],
    ]

    head.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell) {
          this.sprite.rect((rx + 1) * s, ry * s, s, s)
        }
      })
    })

    // Ears
    this.sprite.fill(c.ears)
    this.sprite.rect(1 * s, 0, s, s)
    this.sprite.rect(2 * s, 0, s, s)
    this.sprite.rect(7 * s, 0, s, s)
    this.sprite.rect(8 * s, 0, s, s)

    // Eyes
    this.sprite.fill(0x000000)
    this.sprite.rect(3 * s, 2 * s, s, s)
    this.sprite.rect(6 * s, 2 * s, s, s)

    // Nose
    this.sprite.fill(0xFFB0B0)
    this.sprite.rect(4.5 * s, 3 * s, s, s)

    // Stripes (if applicable)
    if (this.type === 'orange' || this.type === 'tabby') {
      this.sprite.fill(c.stripes)
      this.sprite.rect(2 * s, 6 * s, s, s)
      this.sprite.rect(4 * s, 7 * s, s, s)
      this.sprite.rect(6 * s, 6 * s, s, s)
      this.sprite.rect(8 * s, 7 * s, s, s)
    }

    // Tail
    this.sprite.fill(c.body)
    this.sprite.rect(10 * s, 8 * s, s, s)
    this.sprite.rect(11 * s, 7 * s, s, s)
    this.sprite.rect(12 * s, 6 * s, s, s)

    // Center the sprite
    this.sprite.pivot.set(20, 22)

    this.container.addChild(this.sprite)

    // Purr indicator (hidden by default)
    this.purrText = new Text({
      text: 'purr~',
      style: {
        fontFamily: 'Courier New',
        fontSize: 12,
        fill: 0xFF6B9D
      }
    })
    this.purrText.anchor.set(0.5)
    this.purrText.y = -35
    this.purrText.visible = false
    this.container.addChild(this.purrText)
  }

  setupEvents() {
    let isDragging = false

    this.container.on('pointerdown', (e) => {
      if (this.game.currentTool === 'pet') {
        isDragging = true
        this.startPetting()
      }
    })

    this.container.on('pointermove', (e) => {
      if (isDragging && this.game.currentTool === 'pet') {
        this.continuePetting()
      }
    })

    this.container.on('pointerup', () => {
      isDragging = false
      this.stopPetting()
    })

    this.container.on('pointerupoutside', () => {
      isDragging = false
      this.stopPetting()
    })
  }

  startPetting() {
    this.isPetted = true
    this.pettedTimer = 0
    this.state = 'petted'
    this.purrText.visible = true
  }

  continuePetting() {
    if (this.isPetted) {
      this.pettedTimer++
      if (this.pettedTimer % 30 === 0) {
        this.game.createHeartEffect(this.x, this.y)
      }
    }
  }

  stopPetting() {
    this.isPetted = false
    this.purrText.visible = false
    this.state = 'idle'
    this.scheduleNextAction()
  }

  goToTreat(treat) {
    this.targetTreat = treat
    this.targetX = treat.x
    this.targetY = treat.y
    this.state = 'walking'
  }

  scheduleNextAction() {
    this.stateTimer = Math.random() * 120 + 60

    const actions = ['idle', 'idle', 'walking', 'sitting']
    this.state = actions[Math.floor(Math.random() * actions.length)]

    if (this.state === 'walking') {
      this.targetX = Math.random() * 500 + 100
      this.targetY = Math.random() * 200 + 350
    }
  }

  update(delta) {
    // Check if chasing toy
    if (this.game.currentTool === 'toy' && this.game.toy.visible) {
      const toyDist = Math.hypot(this.game.toy.x - this.x, this.game.toy.y - this.y)
      if (toyDist < 200 && toyDist > 30) {
        this.state = 'playing'
        this.targetX = this.game.toy.x
        this.targetY = this.game.toy.y
      }
    }

    // State machine
    if (this.state === 'walking' || this.state === 'playing') {
      if (this.targetX !== null) {
        const dx = this.targetX - this.x
        const dy = this.targetY - this.y
        const dist = Math.hypot(dx, dy)

        if (dist > 5) {
          const speed = this.state === 'playing' ? 2.5 : 1.2
          this.vx = (dx / dist) * speed
          this.vy = (dy / dist) * speed
          this.direction = dx > 0 ? 1 : -1
        } else {
          this.vx = 0
          this.vy = 0

          // Reached treat?
          if (this.targetTreat) {
            this.startEating()
          } else if (this.state !== 'playing') {
            this.scheduleNextAction()
          }
        }
      }
    } else if (this.state === 'idle' || this.state === 'sitting') {
      this.vx = 0
      this.vy = 0
      this.stateTimer -= delta

      if (this.stateTimer <= 0) {
        this.scheduleNextAction()
      }
    } else if (this.state === 'eating') {
      this.stateTimer -= delta
      if (this.stateTimer <= 0) {
        this.finishEating()
      }
    }

    // Apply velocity
    this.x += this.vx * delta
    this.y += this.vy * delta

    // Clamp to play area
    this.x = Math.max(50, Math.min(600, this.x))
    this.y = Math.max(280, Math.min(550, this.y))

    // Update container position and scale (for direction)
    this.container.x = this.x
    this.container.y = this.y
    this.container.scale.x = this.direction

    // Bobbing animation when walking
    if (this.state === 'walking' || this.state === 'playing') {
      this.container.y += Math.sin(Date.now() / 100) * 2
    }
  }

  startEating() {
    this.state = 'eating'
    this.isEating = true
    this.stateTimer = 90 // eat for 1.5 seconds
    this.vx = 0
    this.vy = 0
  }

  finishEating() {
    if (this.targetTreat) {
      this.game.removeTreat(this.targetTreat)
      this.targetTreat = null
    }
    this.isEating = false
    this.state = 'idle'
    this.scheduleNextAction()

    // Happy heart after eating!
    this.game.createHeartEffect(this.x, this.y)
  }
}
