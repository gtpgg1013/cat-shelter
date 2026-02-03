import { Container, Graphics, Text } from 'pixi.js'
import { Cat } from './Cat.js'
import { Treat } from './Treat.js'
import { Toy } from './Toy.js'

export class Game {
  constructor(app) {
    this.app = app
    this.cats = []
    this.treats = []
    this.currentTool = 'pet'
    this.toy = null
  }

  async init() {
    // Create layers
    this.backgroundLayer = new Container()
    this.catLayer = new Container()
    this.effectLayer = new Container()
    this.uiLayer = new Container()

    this.app.stage.addChild(this.backgroundLayer)
    this.app.stage.addChild(this.catLayer)
    this.app.stage.addChild(this.effectLayer)
    this.app.stage.addChild(this.uiLayer)

    // Draw cafe background
    this.drawCafeBackground()

    // Create toy (hidden initially)
    this.toy = new Toy(this)
    this.effectLayer.addChild(this.toy.container)

    // Spawn initial cats
    this.spawnCat()
    setTimeout(() => this.spawnCat(), 2000)
    setTimeout(() => this.spawnCat(), 4000)

    // Setup interactions
    this.setupInteractions()

    // Game loop
    this.app.ticker.add((ticker) => this.update(ticker.deltaTime))
  }

  drawCafeBackground() {
    const bg = new Graphics()

    // Floor - wooden planks
    bg.fill(0x8B7355)
    bg.rect(0, 0, 800, 600)

    // Floor pattern
    bg.fill(0x7A6245)
    for (let i = 0; i < 10; i++) {
      bg.rect(0, i * 60, 800, 2)
    }

    // Wall
    bg.fill(0xD4C4A8)
    bg.rect(0, 0, 800, 200)

    // Wall trim
    bg.fill(0x5A4A35)
    bg.rect(0, 195, 800, 10)

    // Window
    bg.fill(0x87CEEB)
    bg.rect(300, 30, 200, 140)
    bg.fill(0x5A4A35)
    bg.rect(295, 25, 210, 8)
    bg.rect(295, 165, 210, 8)
    bg.rect(295, 25, 8, 150)
    bg.rect(497, 25, 8, 150)
    bg.rect(395, 25, 10, 150)

    // Clouds in window
    bg.fill(0xFFFFFF)
    bg.circle(340, 80, 20)
    bg.circle(360, 75, 25)
    bg.circle(380, 80, 18)
    bg.circle(440, 100, 22)
    bg.circle(465, 95, 18)

    // Cat tower on right
    bg.fill(0xC4A484)
    bg.rect(650, 250, 100, 300)
    bg.fill(0xB8956E)
    bg.rect(660, 200, 80, 60)
    bg.circle(700, 180, 40)

    // Cushions
    bg.fill(0xE8A0A0)
    bg.ellipse(150, 450, 60, 30)
    bg.fill(0xA0C8E8)
    bg.ellipse(550, 500, 50, 25)
    bg.fill(0xC8E8A0)
    bg.ellipse(100, 550, 45, 22)

    // Food bowls
    bg.fill(0x808080)
    bg.ellipse(50, 400, 25, 12)
    bg.fill(0xA67B5B)
    bg.ellipse(50, 398, 20, 8)

    this.backgroundLayer.addChild(bg)

    // Add cafe name
    const title = new Text({
      text: 'Pixel Cat Cafe',
      style: {
        fontFamily: 'Courier New',
        fontSize: 24,
        fill: 0x5A4A35,
        fontWeight: 'bold'
      }
    })
    title.x = 20
    title.y = 20
    this.uiLayer.addChild(title)
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
    const catTypes = ['orange', 'tuxedo', 'calico', 'tabby', 'white']
    const type = catTypes[Math.floor(Math.random() * catTypes.length)]
    const cat = new Cat(this, type)
    cat.x = Math.random() * 600 + 100
    cat.y = Math.random() * 200 + 350
    this.cats.push(cat)
    this.catLayer.addChild(cat.container)
  }

  placeTreat(x, y) {
    // Only place treats on the floor area
    if (y < 250) return

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
    const heart = new Graphics()
    heart.fill(0xFF6B9D)

    // Draw pixel heart
    const size = 4
    const pattern = [
      [0,1,1,0,0,1,1,0],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,1,1,0,0,0],
    ]

    pattern.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell) {
          heart.rect(rx * size, ry * size, size, size)
        }
      })
    })

    heart.x = x - 16
    heart.y = y - 40
    this.effectLayer.addChild(heart)

    // Animate
    let life = 60
    const animate = () => {
      life--
      heart.y -= 1
      heart.alpha = life / 60
      if (life <= 0) {
        this.effectLayer.removeChild(heart)
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
  }
}
