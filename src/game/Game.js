import { Container, Graphics, Text } from 'pixi.js'
import { Cat } from './Cat.js'
import { Treat } from './Treat.js'
import { Toy } from './Toy.js'

export class Game {
  constructor(app) {
    this.app = app
    this.cats = []
    this.treats = []
    this.furniture = []
    this.currentTool = 'pet'
    this.toy = null
  }

  async init() {
    // Create layers
    this.backgroundLayer = new Container()
    this.furnitureLayer = new Container()
    this.catLayer = new Container()
    this.effectLayer = new Container()
    this.uiLayer = new Container()

    this.app.stage.addChild(this.backgroundLayer)
    this.app.stage.addChild(this.furnitureLayer)
    this.app.stage.addChild(this.catLayer)
    this.app.stage.addChild(this.effectLayer)
    this.app.stage.addChild(this.uiLayer)

    // Draw cafe background
    this.drawCafeBackground()

    // Setup furniture (interactable spots)
    this.setupFurniture()

    // Create toy (hidden initially)
    this.toy = new Toy(this)
    this.effectLayer.addChild(this.toy.container)

    // Spawn initial cats with variety!
    this.spawnCat()
    setTimeout(() => this.spawnCat(), 1500)
    setTimeout(() => this.spawnCat(), 3000)
    setTimeout(() => this.spawnCat(), 4500)
    setTimeout(() => this.spawnCat(), 6000)

    // Setup interactions
    this.setupInteractions()

    // Game loop
    this.app.ticker.add((ticker) => this.update(ticker.deltaTime))
  }

  setupFurniture() {
    // Cushions - cats can sit/sleep here
    this.furniture.push({ type: 'cushion', x: 200, y: 550, occupant: null })
    this.furniture.push({ type: 'cushion', x: 450, y: 620, occupant: null })
    this.furniture.push({ type: 'cushion', x: 700, y: 580, occupant: null })
    this.furniture.push({ type: 'cushion', x: 900, y: 650, occupant: null })
    this.furniture.push({ type: 'cushion', x: 350, y: 720, occupant: null })

    // Cat tower
    this.furniture.push({ type: 'tower', x: 1060, y: 350, occupant: null })
    this.furniture.push({ type: 'tower', x: 85, y: 380, occupant: null })

    // Bowls
    this.furniture.push({ type: 'bowl', bowlType: 'food', x: 80, y: 500, occupant: null })
    this.furniture.push({ type: 'bowl', bowlType: 'water', x: 150, y: 510, occupant: null })
  }

  drawCafeBackground() {
    const bg = new Graphics()
    const W = 1200, H = 800

    // Floor - wooden planks
    bg.fill(0x8B7355)
    bg.rect(0, 0, W, H)

    // Floor pattern
    bg.fill(0x7A6245)
    for (let i = 0; i < 14; i++) {
      bg.rect(0, i * 60, W, 2)
    }

    // Wall
    bg.fill(0xD4C4A8)
    bg.rect(0, 0, W, 250)

    // Wall trim
    bg.fill(0x5A4A35)
    bg.rect(0, 245, W, 10)

    // Window 1 (left)
    bg.fill(0x87CEEB)
    bg.rect(150, 40, 200, 160)
    bg.fill(0x5A4A35)
    bg.rect(145, 35, 210, 8)
    bg.rect(145, 195, 210, 8)
    bg.rect(145, 35, 8, 170)
    bg.rect(347, 35, 8, 170)
    bg.rect(245, 35, 10, 170)

    // Clouds in window 1
    bg.fill(0xFFFFFF)
    bg.circle(190, 90, 20)
    bg.circle(210, 85, 25)
    bg.circle(230, 90, 18)
    bg.circle(290, 110, 22)
    bg.circle(315, 105, 18)

    // Window 2 (center)
    bg.fill(0x87CEEB)
    bg.rect(500, 40, 200, 160)
    bg.fill(0x5A4A35)
    bg.rect(495, 35, 210, 8)
    bg.rect(495, 195, 210, 8)
    bg.rect(495, 35, 8, 170)
    bg.rect(697, 35, 8, 170)
    bg.rect(595, 35, 10, 170)

    // Clouds in window 2
    bg.fill(0xFFFFFF)
    bg.circle(540, 100, 22)
    bg.circle(565, 95, 28)
    bg.circle(630, 85, 20)
    bg.circle(655, 90, 24)

    // Cat tower on right
    bg.fill(0xC4A484)
    bg.rect(1000, 320, 120, 400)
    bg.fill(0xB8956E)
    bg.rect(1010, 260, 100, 70)
    bg.circle(1060, 235, 50)

    // Cat tree on left
    bg.fill(0x8B6914)
    bg.rect(70, 400, 30, 350)
    bg.fill(0xC4A484)
    bg.ellipse(85, 380, 60, 30)
    bg.ellipse(85, 320, 45, 25)

    // Cushions (more of them)
    bg.fill(0xE8A0A0)
    bg.ellipse(200, 550, 70, 35)
    bg.fill(0xA0C8E8)
    bg.ellipse(450, 620, 65, 32)
    bg.fill(0xC8E8A0)
    bg.ellipse(700, 580, 60, 30)
    bg.fill(0xE8D0A0)
    bg.ellipse(900, 650, 55, 28)
    bg.fill(0xD0A0E8)
    bg.ellipse(350, 720, 70, 35)

    // Food bowls
    bg.fill(0x808080)
    bg.ellipse(80, 500, 30, 15)
    bg.fill(0xA67B5B)
    bg.ellipse(80, 497, 25, 10)

    // Water bowl
    bg.fill(0x808080)
    bg.ellipse(150, 510, 28, 14)
    bg.fill(0x7EC8E3)
    bg.ellipse(150, 507, 22, 9)

    // Bookshelf on wall
    bg.fill(0x6B4423)
    bg.rect(850, 50, 150, 180)
    bg.fill(0x8B5A2B)
    bg.rect(860, 60, 130, 8)
    bg.rect(860, 110, 130, 8)
    bg.rect(860, 160, 130, 8)
    // Books
    const bookColors = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF39C12, 0x9B59B6]
    for (let i = 0; i < 5; i++) {
      bg.fill(bookColors[i])
      bg.rect(865 + i * 25, 70, 20, 35)
      bg.rect(870 + i * 24, 120, 18, 35)
    }

    // Clock on wall
    bg.fill(0xFFF8DC)
    bg.circle(780, 100, 35)
    bg.fill(0x5A4A35)
    bg.circle(780, 100, 30)
    bg.fill(0xFFF8DC)
    bg.circle(780, 100, 26)
    bg.fill(0x333333)
    bg.rect(778, 100, 4, -18)
    bg.rect(780, 98, 12, 3)

    this.backgroundLayer.addChild(bg)

    // Add cafe name - wooden sign style matching wall
    const signBg = new Graphics()
    // Shadow
    signBg.fill(0x4A3A25)
    signBg.roundRect(22, 82, 200, 45, 8)
    // Main board
    signBg.fill(0x6B4423)
    signBg.roundRect(20, 80, 200, 45, 8)
    // Inner lighter area
    signBg.fill(0x8B5A2B)
    signBg.roundRect(25, 85, 190, 35, 5)
    this.backgroundLayer.addChild(signBg)

    const title = new Text({
      text: 'Pixel Cat Cafe',
      style: {
        fontFamily: 'Courier New',
        fontSize: 20,
        fill: 0xFFF8DC,
        fontWeight: 'bold'
      }
    })
    title.x = 45
    title.y = 92
    this.backgroundLayer.addChild(title)

    // Cat count display
    this.catCountText = new Text({
      text: '',
      style: {
        fontFamily: 'Courier New',
        fontSize: 14,
        fill: 0x5A4A35
      }
    })
    this.catCountText.x = 1050
    this.catCountText.y = 20
    this.uiLayer.addChild(this.catCountText)
  }

  updateCatCount() {
    const sleeping = this.cats.filter(c => c.state === 'sleeping').length
    const playing = this.cats.filter(c => c.state === 'playing').length
    this.catCountText.text = `Cats: ${this.cats.length} | Sleeping: ${sleeping} | Playing: ${playing}`
  }

  setupInteractions() {
    const stage = this.app.stage
    stage.eventMode = 'static'
    stage.hitArea = this.app.screen

    stage.on('pointermove', (e) => {
      if (this.currentTool === 'toy') {
        this.toy.moveTo(e.global.x, e.global.y)
      }
    })

    stage.on('pointerdown', (e) => {
      if (this.currentTool === 'treat') {
        this.placeTreat(e.global.x, e.global.y)
      }
    })
  }

  spawnCat() {
    // 16 different cat types for variety!
    const catTypes = [
      'orange', 'tuxedo', 'calico', 'tabby', 'white',
      'black', 'gray', 'siamese', 'russian', 'cream',
      'ginger', 'void', 'cloud', 'peach', 'silver'
    ]
    // Avoid duplicates if possible
    const existingTypes = this.cats.map(c => c.type)
    let available = catTypes.filter(t => !existingTypes.includes(t))
    if (available.length === 0) available = catTypes

    const type = available[Math.floor(Math.random() * available.length)]
    const cat = new Cat(this, type)
    cat.x = Math.random() * 900 + 150
    cat.y = Math.random() * 300 + 400
    this.cats.push(cat)
    this.catLayer.addChild(cat.container)
  }

  placeTreat(x, y) {
    // Only place treats on the floor area
    if (y < 300) return

    const treat = new Treat(this, x, y)
    this.treats.push(treat)
    this.catLayer.addChild(treat.container)

    // Attract nearest cat
    let nearestCat = null
    let nearestDist = Infinity
    for (const cat of this.cats) {
      const dist = Math.hypot(cat.x - x, cat.y - y)
      if (dist < nearestDist && !cat.isEating) {
        nearestDist = dist
        nearestCat = cat
      }
    }
    if (nearestCat) {
      nearestCat.goToTreat(treat)
    }
  }

  removeTreat(treat) {
    const idx = this.treats.indexOf(treat)
    if (idx > -1) {
      this.treats.splice(idx, 1)
      this.catLayer.removeChild(treat.container)
    }
  }

  setTool(tool) {
    this.currentTool = tool
    this.toy.setVisible(tool === 'toy')

    // Update cursor
    document.body.style.cursor = tool === 'pet' ? 'grab' : 'default'
  }

  createHeartEffect(x, y) {
    this.createEffect(x, y, 'heart')
  }

  createEffect(x, y, type = 'heart') {
    const effect = new Graphics()
    const size = 4

    const patterns = {
      heart: {
        color: 0xFF6B9D,
        shape: [
          [0,1,1,0,0,1,1,0],
          [1,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1],
          [0,1,1,1,1,1,1,0],
          [0,0,1,1,1,1,0,0],
          [0,0,0,1,1,0,0,0],
        ]
      },
      star: {
        color: 0xFFD700,
        shape: [
          [0,0,0,1,0,0,0],
          [0,0,1,1,1,0,0],
          [1,1,1,1,1,1,1],
          [0,1,1,1,1,1,0],
          [0,1,0,0,0,1,0],
          [1,0,0,0,0,0,1],
        ]
      },
      zzz: {
        color: 0x9090FF,
        shape: [
          [1,1,1,1],
          [0,0,1,0],
          [0,1,0,0],
          [1,1,1,1],
        ]
      },
      music: {
        color: 0x90EE90,
        shape: [
          [0,0,1,1],
          [0,0,1,0],
          [0,0,1,0],
          [1,1,1,0],
          [1,1,0,0],
        ]
      },
      sweat: {
        color: 0x87CEEB,
        shape: [
          [0,1,0],
          [1,1,1],
          [1,1,1],
          [0,1,0],
        ]
      },
      spark: {
        color: 0xFFFFAA,
        shape: [
          [0,0,1,0,0],
          [0,0,1,0,0],
          [1,1,1,1,1],
          [0,0,1,0,0],
          [0,0,1,0,0],
        ]
      }
    }

    const p = patterns[type] || patterns.heart
    effect.fill(p.color)

    p.shape.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell) {
          effect.rect(rx * size, ry * size, size, size)
        }
      })
    })

    effect.x = x - (p.shape[0].length * size) / 2
    effect.y = y - 50
    this.effectLayer.addChild(effect)

    // Animate
    let life = 60
    const animate = () => {
      life--
      effect.y -= 0.8
      effect.alpha = life / 60
      if (type === 'star' || type === 'spark') {
        effect.rotation += 0.05
      }
      if (life <= 0) {
        this.effectLayer.removeChild(effect)
        this.app.ticker.remove(animate)
      }
    }
    this.app.ticker.add(animate)
  }

  createTextEffect(x, y, text, color = 0xFF6B9D) {
    const label = new Text({
      text: text,
      style: {
        fontFamily: 'Courier New',
        fontSize: 14,
        fill: color,
        fontWeight: 'bold'
      }
    })
    label.anchor.set(0.5)
    label.x = x
    label.y = y - 40
    this.effectLayer.addChild(label)

    let life = 50
    const animate = () => {
      life--
      label.y -= 0.6
      label.alpha = life / 50
      if (life <= 0) {
        this.effectLayer.removeChild(label)
        this.app.ticker.remove(animate)
      }
    }
    this.app.ticker.add(animate)
  }

  update(delta) {
    for (const cat of this.cats) {
      cat.update(delta)
    }
    this.toy.update(delta)
    this.updateCatCount()
  }
}
