import { Container, Graphics, Text } from 'pixi.js'

export class Cat {
  constructor(game, type = 'orange') {
    this.game = game
    this.type = type
    this.container = new Container()
    this.container.eventMode = 'static'
    this.container.cursor = 'pointer'

    this.x = 400
    this.y = 500
    this.vx = 0
    this.vy = 0
    this.direction = 1
    this.scale = 1.8

    this.state = 'idle'
    this.stateTimer = 0
    this.targetX = null
    this.targetY = null
    this.targetTreat = null
    this.targetFurniture = null
    this.isEating = false
    this.isPetted = false
    this.pettedTimer = 0
    this.currentPetZone = null
    this.happiness = 50
    this.onFurniture = null // Which furniture cat is using

    this.colors = this.getColors()
    this.createStatusText() // Create status text ONCE, separate from sprite
    this.drawCat()
    this.setupHitZones()
    this.setupEvents()
    this.scheduleNextAction()
  }

  createStatusText() {
    // Status text - added to game's effect layer so it doesn't flip!
    this.statusText = new Text({
      text: '',
      style: {
        fontFamily: 'Courier New',
        fontSize: 16,
        fill: 0xFF6B9D,
        fontWeight: 'bold',
        stroke: { color: 0xFFFFFF, width: 3 }
      }
    })
    this.statusText.anchor.set(0.5)
    this.statusText.visible = false
    this.game.effectLayer.addChild(this.statusText) // Add to effectLayer, not container!
  }

  getColors() {
    // Karpathy-style: minimal but expressive color palettes
    const palettes = {
      // Classic cats
      orange: { body: 0xF4A460, dark: 0xD2691E, light: 0xFFDAAB, nose: 0xFFB6C1, eyes: 0x2E8B57 },
      tuxedo: { body: 0x2D2D2D, dark: 0x1A1A1A, light: 0xFFFFFF, nose: 0xFFB6C1, eyes: 0xFFD700 },
      calico: { body: 0xFFFAF0, dark: 0xF4A460, spots: 0x2D2D2D, nose: 0xFFB6C1, eyes: 0x6B8E23 },
      tabby: { body: 0x8B7355, dark: 0x5D4E37, light: 0xC4A67C, nose: 0xFFB6C1, eyes: 0xDAA520 },
      white: { body: 0xFFFFF0, dark: 0xF0EAD6, light: 0xFFFFFF, nose: 0xFFB6C1, eyes: 0x87CEEB },
      black: { body: 0x1A1A1A, dark: 0x0D0D0D, light: 0x333333, nose: 0x4A4A4A, eyes: 0xFFD700 },
      gray: { body: 0x808080, dark: 0x5A5A5A, light: 0xA9A9A9, nose: 0xFFB6C1, eyes: 0x98FB98 },
      // Fancy cats
      siamese: { body: 0xFAF0E6, dark: 0x8B7355, light: 0xFFFFF0, nose: 0xDDA0DD, eyes: 0x4169E1 },
      russian: { body: 0x708090, dark: 0x4A5568, light: 0x94A3B8, nose: 0x9090A0, eyes: 0x90EE90 },
      cream: { body: 0xFFE4C4, dark: 0xDEB887, light: 0xFFF8DC, nose: 0xFFB6C1, eyes: 0x20B2AA },
      ginger: { body: 0xFF8C00, dark: 0xCC5500, light: 0xFFB347, nose: 0xFFB6C1, eyes: 0x228B22 },
      // Special cats
      void: { body: 0x0D0D0D, dark: 0x000000, light: 0x1A1A1A, nose: 0x2D2D2D, eyes: 0xFF6347 },
      cloud: { body: 0xF8F8FF, dark: 0xE8E8F0, light: 0xFFFFFF, nose: 0xFFC0CB, eyes: 0xDDA0DD },
      peach: { body: 0xFFDAB9, dark: 0xF4A460, light: 0xFFE4E1, nose: 0xFF69B4, eyes: 0x66CDAA },
      silver: { body: 0xC0C0C0, dark: 0x909090, light: 0xE8E8E8, nose: 0xFFB6C1, eyes: 0x4682B4 },
    }
    return palettes[this.type] || palettes.orange
  }

  drawCat() {
    this.sprite = new Graphics()
    const s = 4 // Pixel size - clean grid
    const c = this.colors

    // === KARPATHY STYLE: Simple, round, expressive ===

    // Body - round and chonky
    this.sprite.fill(c.body)
    const body = [
      [0,0,0,1,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,1,0,0],
    ]
    body.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell) this.sprite.rect(rx * s, (ry + 6) * s, s, s)
      })
    })

    // Belly highlight
    this.sprite.fill(c.light)
    this.sprite.rect(4 * s, 8 * s, s * 2, s * 2)

    // Head - big and round (the key to cuteness!)
    this.sprite.fill(c.body)
    const head = [
      [0,0,1,0,0,0,0,1,0,0],
      [0,1,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,1,0],
    ]
    head.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell) this.sprite.rect(rx * s, ry * s, s, s)
      })
    })

    // Ears - pointy triangles
    this.sprite.fill(c.body)
    this.sprite.rect(2 * s, 0, s, s)
    this.sprite.rect(7 * s, 0, s, s)

    // Inner ears - pink!
    this.sprite.fill(0xFFB6C1)
    this.sprite.rect(2 * s, 1 * s, s * 0.6, s * 0.6)
    this.sprite.rect(7 * s, 1 * s, s * 0.6, s * 0.6)

    // === THE EYES - Cute simple dot eyes! ===
    // Simple black dots - classic cute style
    this.sprite.fill(0x000000)
    this.sprite.rect(3 * s, 3 * s, s, s)
    this.sprite.rect(6 * s, 3 * s, s, s)

    // Tiny white shine - one pixel each
    this.sprite.fill(0xFFFFFF)
    this.sprite.rect(3 * s, 3 * s, s * 0.4, s * 0.4)

    // Nose - tiny triangle/heart shape
    this.sprite.fill(c.nose)
    this.sprite.rect(4.7 * s, 4.2 * s, s * 0.6, s * 0.4)

    // Mouth - simple cute :3
    this.sprite.fill(c.dark)
    this.sprite.rect(4.3 * s, 4.7 * s, s * 0.3, s * 0.3)
    this.sprite.rect(5.4 * s, 4.7 * s, s * 0.3, s * 0.3)

    // Blush marks (optional cute touch)
    if (this.happiness > 70) {
      this.sprite.fill(0xFFB6C1)
      this.sprite.circle(2.5 * s, 4 * s, s * 0.4)
      this.sprite.circle(7.5 * s, 4 * s, s * 0.4)
    }

    // Markings based on type
    this.drawMarkings(s, c)

    // Tail - curved and fluffy
    this.sprite.fill(c.body)
    this.sprite.rect(9 * s, 9 * s, s, s)
    this.sprite.rect(10 * s, 8 * s, s, s)
    this.sprite.rect(10 * s, 7 * s, s, s)
    if (c.dark !== c.body) {
      this.sprite.fill(c.dark)
      this.sprite.rect(10 * s, 6 * s, s, s)
    }

    // Paws - little beans!
    this.sprite.fill(c.body)
    this.sprite.rect(2 * s, 11 * s, s * 2, s)
    this.sprite.rect(6 * s, 11 * s, s * 2, s)
    // Paw pads
    this.sprite.fill(c.nose)
    this.sprite.rect(2.3 * s, 11.3 * s, s * 0.4, s * 0.4)
    this.sprite.rect(3 * s, 11.3 * s, s * 0.4, s * 0.4)
    this.sprite.rect(6.3 * s, 11.3 * s, s * 0.4, s * 0.4)
    this.sprite.rect(7 * s, 11.3 * s, s * 0.4, s * 0.4)

    // Center pivot
    this.sprite.pivot.set(5 * s, 6 * s)
    this.container.addChild(this.sprite)
  }

  drawMarkings(s, c) {
    // Type-specific markings
    if (this.type === 'orange' || this.type === 'ginger') {
      // Stripes
      this.sprite.fill(c.dark)
      this.sprite.rect(5 * s, 1.5 * s, s * 0.5, s * 0.5)
      this.sprite.rect(3 * s, 7 * s, s * 0.5, s)
      this.sprite.rect(6 * s, 8 * s, s * 0.5, s)
    } else if (this.type === 'tabby') {
      // M mark on forehead
      this.sprite.fill(c.dark)
      this.sprite.rect(4 * s, 1.5 * s, s * 0.3, s * 0.5)
      this.sprite.rect(5 * s, 1.8 * s, s * 0.3, s * 0.3)
      this.sprite.rect(6 * s, 1.5 * s, s * 0.3, s * 0.5)
    } else if (this.type === 'calico') {
      // Patches
      this.sprite.fill(c.dark)
      this.sprite.rect(2 * s, 2 * s, s, s)
      this.sprite.rect(7 * s, 7 * s, s, s)
      this.sprite.fill(c.spots)
      this.sprite.rect(8 * s, 3 * s, s, s)
      this.sprite.rect(3 * s, 8 * s, s, s)
    } else if (this.type === 'tuxedo') {
      // White chest
      this.sprite.fill(c.light)
      this.sprite.rect(4 * s, 5 * s, s * 2, s)
      this.sprite.rect(4 * s, 7 * s, s * 2, s * 2)
    } else if (this.type === 'siamese') {
      // Dark points
      this.sprite.fill(c.dark)
      this.sprite.rect(2 * s, 0, s, s)
      this.sprite.rect(7 * s, 0, s, s)
      this.sprite.rect(4 * s, 4.5 * s, s * 2, s)
      this.sprite.rect(2 * s, 11 * s, s * 2, s)
      this.sprite.rect(6 * s, 11 * s, s * 2, s)
    } else if (this.type === 'void') {
      // Red glow eyes for void cat
      this.sprite.fill(0xFF0000)
      this.sprite.rect(3 * s, 2.5 * s, s * 0.5, s * 0.5)
      this.sprite.rect(6 * s, 2.5 * s, s * 0.5, s * 0.5)
    }
  }

  setupHitZones() {
    const s = 4 * this.scale
    this.hitZones = {
      head: { x: -3 * s, y: -6 * s, w: 10 * s, h: 5 * s },
      chin: { x: -1 * s, y: -2 * s, w: 6 * s, h: 3 * s },
      back: { x: -3 * s, y: 0 * s, w: 10 * s, h: 4 * s },
      belly: { x: -1 * s, y: 2 * s, w: 6 * s, h: 4 * s },
      tail: { x: 5 * s, y: 0 * s, w: 6 * s, h: 5 * s }
    }
  }

  getHitZone(localX, localY) {
    for (const [name, zone] of Object.entries(this.hitZones)) {
      if (localX >= zone.x && localX <= zone.x + zone.w &&
          localY >= zone.y && localY <= zone.y + zone.h) {
        return name
      }
    }
    return null
  }

  setupEvents() {
    let isDragging = false
    let lastPetTime = 0

    this.container.on('pointerdown', (e) => {
      if (this.game.currentTool === 'pet') {
        isDragging = true
        const local = this.container.toLocal(e.global)
        const zone = this.getHitZone(local.x * this.direction, local.y)
        this.startPetting(zone)
      }
    })

    this.container.on('pointermove', (e) => {
      if (isDragging && this.game.currentTool === 'pet') {
        const now = Date.now()
        if (now - lastPetTime > 100) {
          const local = this.container.toLocal(e.global)
          const zone = this.getHitZone(local.x * this.direction, local.y)
          this.continuePetting(zone)
          lastPetTime = now
        }
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

  startPetting(zone) {
    this.isPetted = true
    this.pettedTimer = 0
    this.state = 'petted'
    this.currentPetZone = zone
    this.reactToZone(zone)
  }

  continuePetting(zone) {
    if (this.isPetted) {
      this.pettedTimer++
      if (zone !== this.currentPetZone) {
        this.currentPetZone = zone
        this.reactToZone(zone)
      } else if (this.pettedTimer % 20 === 0) {
        this.reactToZone(zone)
      }
    }
  }

  reactToZone(zone) {
    const reactions = {
      head: { text: ['purr~', 'nya~', '^w^'], effect: 'heart', happiness: 5 },
      chin: { text: ['prrrr~', 'bliss~', '>w<'], effect: 'heart', happiness: 8 },
      back: { text: ['nice~', 'mmm~', '=w='], effect: 'star', happiness: 4 },
      belly: { text: ['!!', 'eep!', '>.<'], effect: 'sweat', happiness: -2, risky: true },
      tail: { text: ['!', 'mrow!', '>:c'], effect: 'spark', happiness: -3 }
    }

    const reaction = reactions[zone] || reactions.back
    const text = reaction.text[Math.floor(Math.random() * reaction.text.length)]

    this.statusText.text = text
    this.statusText.visible = true
    this.statusText.style.fill = reaction.risky ? 0xFFAA00 : 0xFF6B9D

    this.game.createEffect(this.x, this.y, reaction.effect)
    this.happiness = Math.max(0, Math.min(100, this.happiness + reaction.happiness))

    // Redraw to update blush
    if (this.happiness > 70 || this.happiness < 30) {
      this.container.removeChild(this.sprite)
      this.sprite.destroy()
      this.sprite = null
      this.drawCat()
    }

    if (zone === 'belly' && Math.random() < 0.3) {
      this.game.createTextEffect(this.x, this.y - 20, 'Sensitive!', 0xFFAA00)
      setTimeout(() => {
        if (this.state === 'petted') {
          this.stopPetting()
          this.runAway()
        }
      }, 500)
    }

    if (zone === 'chin' && this.pettedTimer > 40) {
      this.game.createEffect(this.x + 20, this.y, 'music')
    }
  }

  runAway() {
    this.state = 'walking'
    this.targetX = this.x + (Math.random() > 0.5 ? 1 : -1) * (150 + Math.random() * 100)
    this.targetY = this.y + (Math.random() - 0.5) * 100
    this.clampTarget()
  }

  clampTarget() {
    this.targetX = Math.max(100, Math.min(1100, this.targetX))
    this.targetY = Math.max(350, Math.min(750, this.targetY))
  }

  stopPetting() {
    this.isPetted = false
    this.statusText.visible = false
    this.currentPetZone = null
    if (this.state === 'petted') {
      this.state = 'idle'
      this.scheduleNextAction()
    }
  }

  goToTreat(treat) {
    this.targetTreat = treat
    this.targetX = treat.x
    this.targetY = treat.y
    this.state = 'walking'
  }

  goToFurniture(furniture) {
    this.targetFurniture = furniture
    this.targetX = furniture.x
    this.targetY = furniture.y
    this.state = 'walking'
  }

  scheduleNextAction() {
    this.stateTimer = Math.random() * 150 + 80

    // More varied behaviors
    const roll = Math.random()
    if (roll < 0.3) {
      this.state = 'idle'
    } else if (roll < 0.5) {
      this.state = 'sitting'
    } else if (roll < 0.8) {
      this.state = 'walking'
      this.targetX = Math.random() * 900 + 150
      this.targetY = Math.random() * 300 + 400
    } else {
      // Try to go to furniture
      this.tryGoToFurniture()
    }
  }

  tryGoToFurniture() {
    if (this.game.furniture && this.game.furniture.length > 0) {
      const available = this.game.furniture.filter(f => !f.occupant || f.occupant === this)
      if (available.length > 0) {
        const f = available[Math.floor(Math.random() * available.length)]
        this.goToFurniture(f)
        return
      }
    }
    // Fallback to walking
    this.state = 'walking'
    this.targetX = Math.random() * 900 + 150
    this.targetY = Math.random() * 300 + 400
  }

  update(delta) {
    // Toy chasing
    if (this.game.currentTool === 'toy' && this.game.toy.visible) {
      const toyDist = Math.hypot(this.game.toy.x - this.x, this.game.toy.y - this.y)
      if (toyDist < 250 && toyDist > 40) {
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

        if (dist > 8) {
          const speed = this.state === 'playing' ? 3 : 1.5
          this.vx = (dx / dist) * speed
          this.vy = (dy / dist) * speed
          this.direction = dx > 0 ? 1 : -1
        } else {
          this.vx = 0
          this.vy = 0

          if (this.targetTreat) {
            this.startEating()
          } else if (this.targetFurniture) {
            this.useFurniture()
          } else if (this.state !== 'playing') {
            this.scheduleNextAction()
          }
        }
      }
    } else if (this.state === 'idle' || this.state === 'sitting' || this.state === 'sleeping') {
      this.vx = 0
      this.vy = 0
      this.stateTimer -= delta

      if (this.stateTimer <= 0) {
        this.leaveFurniture()
        this.scheduleNextAction()
      }
    } else if (this.state === 'eating' || this.state === 'drinking') {
      this.stateTimer -= delta
      if (this.stateTimer <= 0) {
        this.finishEating()
      }
    }

    // Apply velocity
    this.x += this.vx * delta
    this.y += this.vy * delta

    // Clamp position
    this.x = Math.max(80, Math.min(1100, this.x))
    this.y = Math.max(350, Math.min(750, this.y))

    // Update container
    this.container.x = this.x
    this.container.y = this.y
    this.container.scale.x = this.direction * this.scale
    this.container.scale.y = this.scale

    // Update status text position (it's in effectLayer, not container)
    this.statusText.x = this.x
    this.statusText.y = this.y - 45

    // Animations
    if (this.state === 'walking' || this.state === 'playing') {
      this.container.y += Math.sin(Date.now() / 80) * 2
    }
    if (this.state === 'idle' || this.state === 'sitting') {
      this.container.scale.y = this.scale * (1 + Math.sin(Date.now() / 500) * 0.02)
    }
    if (this.state === 'sleeping') {
      // Gentle breathing
      this.container.scale.y = this.scale * (1 + Math.sin(Date.now() / 800) * 0.03)
      // Show zzz
      if (Math.random() < 0.01) {
        this.game.createEffect(this.x + 15, this.y - 20, 'zzz')
      }
    }
  }

  useFurniture() {
    const f = this.targetFurniture
    if (f) {
      this.onFurniture = f
      f.occupant = this

      if (f.type === 'cushion') {
        this.state = Math.random() < 0.5 ? 'sitting' : 'sleeping'
        this.statusText.text = this.state === 'sleeping' ? 'zzz...' : 'comfy~'
        this.statusText.visible = true
        this.stateTimer = 200 + Math.random() * 200
      } else if (f.type === 'tower') {
        this.state = 'sitting'
        this.y = f.y - 30 // On top of tower
        this.statusText.text = 'high up!'
        this.statusText.visible = true
        this.stateTimer = 150 + Math.random() * 150
      } else if (f.type === 'bowl') {
        this.state = f.bowlType === 'water' ? 'drinking' : 'eating'
        this.statusText.text = f.bowlType === 'water' ? '*lap lap*' : 'nom~'
        this.statusText.visible = true
        this.stateTimer = 80
      }
    }
    this.targetFurniture = null
  }

  leaveFurniture() {
    if (this.onFurniture) {
      this.onFurniture.occupant = null
      this.onFurniture = null
      this.statusText.visible = false
    }
  }

  startEating() {
    this.state = 'eating'
    this.isEating = true
    this.stateTimer = 100
    this.vx = 0
    this.vy = 0
    this.statusText.text = 'nom nom~'
    this.statusText.visible = true
    this.statusText.style.fill = 0xFFAA00
  }

  finishEating() {
    if (this.targetTreat) {
      this.game.removeTreat(this.targetTreat)
      this.targetTreat = null
    }
    this.isEating = false
    this.statusText.visible = false
    this.state = 'idle'
    this.happiness = Math.min(100, this.happiness + 15)
    this.leaveFurniture()
    this.scheduleNextAction()

    this.game.createEffect(this.x, this.y, 'heart')
    this.game.createTextEffect(this.x, this.y - 20, 'Yummy!', 0xFF6B9D)
  }
}
