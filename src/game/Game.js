import { Container, Graphics, Text } from 'pixi.js'
import { Cat } from './Cat.js'
import { Treat } from './Treat.js'
import { Toy } from './Toy.js'
import { TimeSystem } from './TimeSystem.js'
import { SocialSystem } from './SocialSystem.js'
import { EventSystem } from './EventSystem.js'
import { CatGenerator } from './CatGenerator.js'

export class Game {
  constructor(app) {
    this.app = app
    this.cats = []
    this.treats = []
    this.furniture = []
    this.currentTool = 'pet'
    this.toy = null
    this.weather = 'sunny'

    // V3 Systems
    this.timeSystem = new TimeSystem(this)
    this.socialSystem = new SocialSystem(this)
    this.eventSystem = new EventSystem(this)
  }

  async init() {
    // Create layers
    this.backgroundLayer = new Container()
    this.furnitureLayer = new Container()
    this.catLayer = new Container()
    this.effectLayer = new Container()
    this.lightingLayer = new Container()
    this.uiLayer = new Container()

    this.app.stage.addChild(this.backgroundLayer)
    this.app.stage.addChild(this.furnitureLayer)
    this.app.stage.addChild(this.catLayer)
    this.app.stage.addChild(this.effectLayer)
    this.app.stage.addChild(this.lightingLayer)
    this.app.stage.addChild(this.uiLayer)

    // Draw cafe background
    this.drawCafeBackground()

    // Setup furniture (interactable spots)
    this.setupFurniture()

    // Setup lighting overlay for day/night
    this.setupLighting()

    // Setup time display
    this.setupTimeUI()

    // Create toy (hidden initially)
    this.toy = new Toy(this)
    this.effectLayer.addChild(this.toy.container)

    // Spawn initial cats (procedurally generated!)
    this.spawnCat()
    setTimeout(() => this.spawnCat(), 1500)
    setTimeout(() => this.spawnCat(), 3000)

    // Setup interactions
    this.setupInteractions()

    // Game loop
    this.app.ticker.add((ticker) => this.update(ticker.deltaTime))
  }

  setupLighting() {
    this.lightingOverlay = new Graphics()
    this.lightingOverlay.alpha = 0
    this.lightingLayer.addChild(this.lightingOverlay)
    this.updateLighting()
  }

  updateLighting() {
    const periodInfo = this.timeSystem.getPeriodInfo()
    const overlay = this.lightingOverlay

    overlay.clear()
    overlay.fill(periodInfo.color)
    overlay.rect(0, 0, 1200, 800)

    // Adjust alpha based on ambient level (inverted - darker = more overlay)
    overlay.alpha = (1 - periodInfo.ambient) * 0.4
  }

  setupTimeUI() {
    // Time display background
    const timeBg = new Graphics()
    timeBg.fill(0x5A4A35)
    timeBg.roundRect(1050, 50, 130, 50, 8)
    timeBg.fill(0x6B4423)
    timeBg.roundRect(1055, 55, 120, 40, 5)
    this.uiLayer.addChild(timeBg)

    // Time text
    this.timeText = new Text({
      text: '08:00',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
        fill: 0xFFF8DC,
        fontWeight: 'bold'
      }
    })
    this.timeText.x = 1075
    this.timeText.y = 60
    this.uiLayer.addChild(this.timeText)

    // Day text
    this.dayText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        fill: 0xD4C4A8
      }
    })
    this.dayText.x = 1130
    this.dayText.y = 63
    this.uiLayer.addChild(this.dayText)

    // Period indicator (Korean)
    this.periodText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        fill: 0xFFE4B5
      }
    })
    this.periodText.x = 1075
    this.periodText.y = 80
    this.uiLayer.addChild(this.periodText)
  }

  updateTimeUI() {
    const periodKorean = {
      dawn: '새벽',
      morning: '아침',
      afternoon: '오후',
      evening: '저녁',
      night: '밤'
    }
    this.timeText.text = this.timeSystem.getTimeString()
    this.dayText.text = this.timeSystem.getDayString()
    this.periodText.text = periodKorean[this.timeSystem.currentPeriod] || ''
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
      text: '고양이 쉼터',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 22,
        fill: 0xFFF8DC,
        fontWeight: 'bold'
      }
    })
    title.x = 55
    title.y = 90
    this.backgroundLayer.addChild(title)

    // Cat count display
    this.catCountText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        fill: 0x5A4A35,
        fontWeight: 'bold'
      }
    })
    this.catCountText.x = 250
    this.catCountText.y = 12
    this.uiLayer.addChild(this.catCountText)
  }

  updateCatCount() {
    const sleeping = this.cats.filter(c => c.state === 'sleeping').length
    const playing = this.cats.filter(c => c.state === 'playing').length
    const zoomies = this.cats.filter(c => c.state === 'zoomies').length
    let text = `고양이 ${this.cats.length}마리 | 자는중 ${sleeping} | 노는중 ${playing}`
    if (zoomies > 0) text += ` | 폭주! ${zoomies}`
    this.catCountText.text = text
  }

  setupInteractions() {
    const stage = this.app.stage
    stage.eventMode = 'static'
    stage.hitArea = this.app.screen

    const toyTypes = ['feather', 'laser', 'yarn', 'fishToy', 'mouse']

    stage.on('pointermove', (e) => {
      if (toyTypes.includes(this.currentTool)) {
        this.toy.moveTo(e.global.x, e.global.y)
      }
    })

    const treatTypes = ['fish', 'churu', 'dry', 'catnip']

    stage.on('pointerdown', (e) => {
      if (treatTypes.includes(this.currentTool)) {
        this.placeTreat(e.global.x, e.global.y, this.currentTool)
      } else if (toyTypes.includes(this.currentTool)) {
        // Handle toy-specific interactions
        this.toy.onPointerDown(e.global.x, e.global.y)
      }
    })

    stage.on('pointerup', (e) => {
      if (toyTypes.includes(this.currentTool)) {
        this.toy.onPointerUp(e.global.x, e.global.y)
      }
    })
  }

  spawnCat(genetics = null) {
    // V3: Procedurally generated cats!
    const cat = new Cat(this, genetics)
    cat.x = Math.random() * 900 + 150
    cat.y = Math.random() * 300 + 400
    this.cats.push(cat)
    this.catLayer.addChild(cat.container)

    // Initialize relationships with existing cats
    for (const otherCat of this.cats) {
      if (otherCat !== cat) {
        this.socialSystem.initRelationship(cat, otherCat)
      }
    }

    console.log(`Spawned: ${cat.genetics.name} (${cat.genetics.rarity} ${cat.genetics.patternType} ${cat.genetics.baseColorType})`)
    return cat
  }

  placeTreat(x, y, type = 'fish') {
    // Only place treats on the floor area
    if (y < 300) return

    const treat = new Treat(this, x, y, type)
    this.treats.push(treat)
    this.catLayer.addChild(treat.container)

    const traits = treat.getTraits()

    // 츄르는 모든 고양이가 반응!
    if (type === 'churu') {
      this.createTextEffect(x, y - 30, '츄르다!', 0xFF69B4)
      // 범위 내 모든 고양이가 달려옴
      for (const cat of this.cats) {
        const dist = Math.hypot(cat.x - x, cat.y - y)
        if (dist < traits.attractRange && !cat.isEating && cat.state !== 'sleeping') {
          cat.goToTreat(treat)
        }
      }
    } else {
      // 다른 간식은 가장 가까운 고양이만
      let nearestCat = null
      let nearestDist = Infinity
      for (const cat of this.cats) {
        const dist = Math.hypot(cat.x - x, cat.y - y)
        if (dist < traits.attractRange && dist < nearestDist && !cat.isEating) {
          nearestDist = dist
          nearestCat = cat
        }
      }
      if (nearestCat) {
        nearestCat.goToTreat(treat)
      }
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

    // Check if it's a toy type
    const toyTypes = ['feather', 'laser', 'yarn', 'fishToy', 'mouse']
    const treatTypes = ['fish', 'churu', 'dry', 'catnip']
    const isToy = toyTypes.includes(tool)
    const isTreat = treatTypes.includes(tool)

    if (isToy) {
      this.toy.setType(tool)
      this.toy.setVisible(true)

      // Set initial position for throw/fling/place toys
      const interactionType = this.toy.getInteractionType()
      if (interactionType === 'throw' || interactionType === 'fling') {
        this.toy.x = 600
        this.toy.y = 600
      }
    } else {
      this.toy.setVisible(false)
    }

    // Update cursor based on tool type
    if (tool === 'pet') {
      document.body.style.cursor = 'grab'
    } else if (isTreat) {
      document.body.style.cursor = 'cell'  // 간식 놓기 커서
    } else if (isToy) {
      const interactionType = this.toy.getInteractionType()
      if (interactionType === 'throw' || interactionType === 'place') {
        document.body.style.cursor = 'crosshair'
      } else if (interactionType === 'fling') {
        document.body.style.cursor = 'move'
      } else {
        document.body.style.cursor = 'default'
      }
    } else {
      document.body.style.cursor = 'default'
    }
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
    // Update V3 systems
    this.timeSystem.update(delta)
    this.socialSystem.update(delta)
    this.eventSystem.update(delta)

    // Get time-based behavior modifiers
    const modifiers = this.timeSystem.getBehaviorModifiers()

    // Update all cats with modifiers
    for (const cat of this.cats) {
      cat.update(delta, modifiers)
    }

    // Update UI and effects
    this.toy.update(delta)
    this.updateCatCount()
    this.updateTimeUI()
    this.updateLighting()
  }

  // Get social info for UI (can be used for tooltips)
  getCatInfo(cat) {
    const social = this.socialSystem.getCatSocialInfo(cat.id)
    return {
      name: cat.genetics.name,
      rarity: cat.genetics.rarity,
      age: cat.age,
      friends: social.friends,
      rivals: social.rivals
    }
  }
}
