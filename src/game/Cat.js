import { Container, Graphics, Text } from 'pixi.js'
import { CatGenerator } from './CatGenerator.js'

export class Cat {
  constructor(game, genetics = null) {
    this.game = game
    this.genetics = genetics || CatGenerator.generate()
    this.id = this.genetics.id

    this.container = new Container()
    this.container.eventMode = 'static'
    this.container.cursor = 'pointer'

    // Position
    this.x = 400
    this.y = 500
    this.vx = 0
    this.vy = 0
    this.direction = 1
    this.baseScale = 0.9 + this.genetics.bodySize * 0.3

    // State
    this.state = 'idle'
    this.stateTimer = 0
    this.targetX = null
    this.targetY = null
    this.targetTreat = null
    this.targetFurniture = null
    this.targetCat = null // For social behaviors
    this.isEating = false
    this.isPetted = false
    this.pettedTimer = 0
    this.currentPetZone = null
    this.happiness = 50
    this.onFurniture = null
    this.zoomieTimer = 0

    // Age system
    this.age = {
      days: 0,
      stage: 'young', // kitten, young, adult, senior
    }

    this.createStatusText()
    this.drawCat()
    this.setupHitZones()
    this.setupEvents()
    this.scheduleNextAction()
  }

  createStatusText() {
    this.statusText = new Text({
      text: '',
      style: {
        fontFamily: 'Courier New',
        fontSize: 14,
        fill: 0xFF6B9D,
        fontWeight: 'bold',
        stroke: { color: 0xFFFFFF, width: 3 }
      }
    })
    this.statusText.anchor.set(0.5)
    this.statusText.visible = false
    this.game.effectLayer.addChild(this.statusText)

    // Name tag (always visible, readable)
    this.nameTag = new Text({
      text: this.genetics.name,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        fill: 0x4A4A4A,
        fontWeight: 'bold',
        stroke: { color: 0xFFFFFF, width: 4 }
      }
    })
    this.nameTag.anchor.set(0.5)
    this.game.effectLayer.addChild(this.nameTag)
  }

  getRarityColor() {
    const colors = {
      common: 0x808080,
      uncommon: 0x4CAF50,
      rare: 0x2196F3,
      legendary: 0xFFD700,
    }
    return colors[this.genetics.rarity] || 0x808080
  }

  drawCat() {
    if (this.sprite) {
      this.container.removeChild(this.sprite)
      this.sprite.destroy()
    }

    this.sprite = new Graphics()
    const s = 4 // Pixel size
    const g = this.genetics

    // Convert HSL colors to hex
    const bodyColor = CatGenerator.hslToHex(g.baseColor)
    const patternColor = g.patternColor ? CatGenerator.hslToHex(g.patternColor) : bodyColor
    const eyeColor = CatGenerator.hslToHex(g.eyeColor)

    // Lighter belly
    const bellyColor = CatGenerator.hslToHex({
      h: g.baseColor.h,
      s: g.baseColor.s * 0.7,
      l: Math.min(95, g.baseColor.l * 1.2)
    })

    // === BODY ===
    this.sprite.fill(bodyColor)
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

    // Belly
    this.sprite.fill(bellyColor)
    this.sprite.rect(4 * s, 8 * s, s * 2, s * 2)

    // === HEAD ===
    this.sprite.fill(bodyColor)
    const earSize = g.earSize
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

    // Ears
    if (earSize > 0.95) {
      this.sprite.rect(1 * s, 0, s, s)
      this.sprite.rect(8 * s, 0, s, s)
    }

    // Inner ears (pink)
    this.sprite.fill(0xFFB6C1)
    this.sprite.rect(2 * s, 1 * s, s * 0.6, s * 0.6)
    this.sprite.rect(7 * s, 1 * s, s * 0.6, s * 0.6)

    // === PATTERN ===
    this.drawPattern(s, bodyColor, patternColor)

    // === EYES ===
    const eyeS = s * g.eyeSize
    this.sprite.fill(0x000000)
    this.sprite.rect(3 * s, 3 * s, eyeS, eyeS)
    this.sprite.rect(6 * s, 3 * s, eyeS, eyeS)

    // Eye shine
    this.sprite.fill(0xFFFFFF)
    this.sprite.rect(3 * s, 3 * s, eyeS * 0.4, eyeS * 0.4)

    // === NOSE & MOUTH ===
    this.sprite.fill(0xFFB6C1)
    this.sprite.rect(4.7 * s, 4.2 * s, s * 0.6, s * 0.4)

    this.sprite.fill(0x404040)
    this.sprite.rect(4.3 * s, 4.7 * s, s * 0.3, s * 0.3)
    this.sprite.rect(5.4 * s, 4.7 * s, s * 0.3, s * 0.3)

    // === TAIL ===
    const tailLen = Math.floor(g.tailLength * 4)
    this.sprite.fill(bodyColor)
    for (let i = 0; i < tailLen; i++) {
      this.sprite.rect((9 + i) * s, (10 - i * 0.7) * s, s, s)
    }

    // === PAWS ===
    this.sprite.fill(bodyColor)
    this.sprite.rect(2 * s, 11 * s, s * 2, s)
    this.sprite.rect(6 * s, 11 * s, s * 2, s)

    // Paw pads
    this.sprite.fill(0xFFB6C1)
    this.sprite.rect(2.3 * s, 11.3 * s, s * 0.4, s * 0.4)
    this.sprite.rect(6.3 * s, 11.3 * s, s * 0.4, s * 0.4)

    // === FLUFFINESS ===
    if (g.fluffiness > 0.7) {
      // Extra fluffy - add tufts
      this.sprite.fill(bodyColor)
      this.sprite.rect(0 * s, 3 * s, s * 0.5, s)
      this.sprite.rect(9.5 * s, 3 * s, s * 0.5, s)
      // Fluffy chest
      this.sprite.rect(4 * s, 5.5 * s, s * 2, s * 0.5)
    }

    // Blush when happy
    if (this.happiness > 70) {
      this.sprite.fill(0xFFB6C1)
      this.sprite.circle(2.5 * s, 4 * s, s * 0.4)
      this.sprite.circle(7.5 * s, 4 * s, s * 0.4)
    }

    // Age appearance
    this.applyAgeAppearance(s)

    // Rarity sparkle for legendary
    if (g.rarity === 'legendary' && Math.random() < 0.3) {
      this.sprite.fill(0xFFD700)
      this.sprite.rect(Math.random() * 8 * s, Math.random() * 10 * s, s * 0.3, s * 0.3)
    }

    this.sprite.pivot.set(5 * s, 6 * s)
    this.container.addChild(this.sprite)
  }

  drawPattern(s, bodyColor, patternColor) {
    const type = this.genetics.patternType
    const intensity = this.genetics.patternIntensity

    if (type === 'solid') return

    this.sprite.fill(patternColor)

    if (type === 'tabby') {
      // M on forehead + stripes
      this.sprite.rect(4 * s, 1.5 * s, s * 0.4, s * 0.5)
      this.sprite.rect(5 * s, 1.8 * s, s * 0.4, s * 0.3)
      this.sprite.rect(6 * s, 1.5 * s, s * 0.4, s * 0.5)
      // Body stripes
      if (intensity > 0.3) {
        this.sprite.rect(3 * s, 7 * s, s * 0.5, s)
        this.sprite.rect(6 * s, 8 * s, s * 0.5, s)
      }
    } else if (type === 'tuxedo') {
      // White chest and paws
      this.sprite.fill(0xFFFFFF)
      this.sprite.rect(4 * s, 5 * s, s * 2, s)
      this.sprite.rect(4 * s, 7 * s, s * 2, s * 2)
      this.sprite.rect(2 * s, 11 * s, s * 2, s)
      this.sprite.rect(6 * s, 11 * s, s * 2, s)
    } else if (type === 'calico') {
      // Random patches
      this.sprite.rect(2 * s, 2 * s, s, s)
      this.sprite.rect(7 * s, 7 * s, s, s)
      this.sprite.fill(0x303030)
      this.sprite.rect(8 * s, 3 * s, s, s)
      this.sprite.rect(3 * s, 8 * s, s, s)
    } else if (type === 'spots') {
      this.sprite.rect(3 * s, 7 * s, s, s)
      this.sprite.rect(7 * s, 8 * s, s, s)
      this.sprite.rect(5 * s, 9 * s, s, s)
    } else if (type === 'bicolor') {
      // Half and half
      this.sprite.rect(6 * s, 2 * s, s * 4, s * 4)
      this.sprite.rect(6 * s, 7 * s, s * 4, s * 4)
    }
  }

  applyAgeAppearance(s) {
    // Kitten: smaller
    // Senior: slightly duller, maybe gray whiskers
    if (this.age.stage === 'senior') {
      this.sprite.fill(0xCCCCCC)
      this.sprite.rect(1 * s, 5 * s, s * 2, s * 0.2)
      this.sprite.rect(7 * s, 5 * s, s * 2, s * 0.2)
    }
  }

  setupHitZones() {
    const s = 4 * this.baseScale
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
    // Personality affects reactions
    const p = this.genetics.personality
    const friendlyMod = p.friendliness > 0.5 ? 1.5 : 0.8

    const reactions = {
      head: { text: ['그르릉~', '냐~', '기분좋다냥'], effect: 'heart', happiness: 5 * friendlyMod },
      chin: { text: ['그르르릉~', '행복해~', '최고다냥'], effect: 'heart', happiness: 8 * friendlyMod },
      back: { text: ['좋다~', '응응~', '더해줘~'], effect: 'star', happiness: 4 * friendlyMod },
      belly: { text: ['앗!', '깜짝이야!', '거긴..!'], effect: 'sweat', happiness: p.boldness > 0.5 ? 2 : -3, risky: p.boldness < 0.5 },
      tail: { text: ['싫다냥!', '꼬리는 안돼!', '냐앙!'], effect: 'spark', happiness: -3 }
    }

    const reaction = reactions[zone] || reactions.back
    const text = reaction.text[Math.floor(Math.random() * reaction.text.length)]

    this.statusText.text = text
    this.statusText.visible = true
    this.statusText.style.fill = reaction.risky ? 0xFFAA00 : 0xFF6B9D

    this.game.createEffect(this.x, this.y, reaction.effect)
    this.happiness = Math.max(0, Math.min(100, this.happiness + reaction.happiness))

    if (this.happiness > 70 || this.happiness < 30) {
      this.drawCat()
    }

    if (zone === 'belly' && reaction.risky && Math.random() < 0.3) {
      this.game.createTextEffect(this.x, this.y - 20, '예민하다냥!', 0xFFAA00)
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

  runAwayFrom(fromX, fromY) {
    const dx = this.x - fromX
    const dy = this.y - fromY
    const dist = Math.hypot(dx, dy) || 1

    this.targetX = this.x + (dx / dist) * 150
    this.targetY = this.y + (dy / dist) * 100
    this.clampTarget()
    this.state = 'walking'
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

  // Social behaviors
  startGrooming(otherCat) {
    this.state = 'grooming'
    this.targetCat = otherCat
    this.stateTimer = 120
    this.statusText.text = '쓰담쓰담'
    this.statusText.visible = true
  }

  sleepNear(otherCat) {
    this.targetX = otherCat.x + (Math.random() - 0.5) * 50
    this.targetY = otherCat.y + (Math.random() - 0.5) * 30
    this.clampTarget()
    this.state = 'walking'
    // Will sleep when arrives
    this.targetCat = otherCat
  }

  startZoomies() {
    this.state = 'zoomies'
    this.zoomieTimer = 180 + Math.random() * 120
  }

  scheduleNextAction() {
    const p = this.genetics.personality
    const timeMods = this.game.timeSystem ? this.game.timeSystem.getBehaviorModifiers() : { sleepChance: 0.15, activityMultiplier: 1 }

    this.stateTimer = Math.random() * 150 + 80

    // Personality + time affects behavior choice
    const roll = Math.random()
    const activityThreshold = 0.3 * timeMods.activityMultiplier * p.energy

    if (roll < timeMods.sleepChance * (1 - p.energy)) {
      this.state = 'sleeping'
      this.stateTimer = 200 + Math.random() * 200
    } else if (roll < 0.3) {
      this.state = 'idle'
    } else if (roll < 0.5) {
      this.state = 'sitting'
    } else if (roll < 0.8) {
      // Check social behavior
      if (this.game.socialSystem && Math.random() < p.friendliness) {
        this.trySocialBehavior()
      } else {
        this.state = 'walking'
        this.targetX = Math.random() * 900 + 150
        this.targetY = Math.random() * 300 + 400
      }
    } else {
      this.tryGoToFurniture()
    }
  }

  trySocialBehavior() {
    if (!this.game.socialSystem) {
      this.state = 'walking'
      this.targetX = Math.random() * 900 + 150
      this.targetY = Math.random() * 300 + 400
      return
    }

    const bestFriend = this.game.socialSystem.getBestFriend(this.id)
    if (bestFriend) {
      const friend = this.game.cats.find(c => c.id === bestFriend.id)
      if (friend && Math.random() < 0.5) {
        // Go to friend
        this.targetX = friend.x + (Math.random() - 0.5) * 80
        this.targetY = friend.y + (Math.random() - 0.5) * 50
        this.clampTarget()
        this.state = 'walking'
        return
      }
    }

    // Default walking
    this.state = 'walking'
    this.targetX = Math.random() * 900 + 150
    this.targetY = Math.random() * 300 + 400
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
    this.state = 'walking'
    this.targetX = Math.random() * 900 + 150
    this.targetY = Math.random() * 300 + 400
  }

  update(delta, modifiers = {}) {
    const p = this.genetics.personality
    const timeModifiers = {
      activityMultiplier: modifiers.activityMultiplier || 1,
      sleepChance: modifiers.sleepChance || 0.15,
      hungerMultiplier: modifiers.hungerMultiplier || 1,
      socialMultiplier: modifiers.socialMultiplier || 1,
    }

    // Zoomies
    if (this.state === 'zoomies') {
      this.zoomieTimer -= delta
      if (this.zoomieTimer <= 0) {
        this.state = 'idle'
        this.scheduleNextAction()
      } else {
        // Random fast movement
        if (Math.random() < 0.05) {
          this.targetX = Math.random() * 900 + 150
          this.targetY = Math.random() * 300 + 400
        }
        // Fast!
        if (this.targetX !== null) {
          const dx = this.targetX - this.x
          const dy = this.targetY - this.y
          const dist = Math.hypot(dx, dy)
          if (dist > 10) {
            this.vx = (dx / dist) * 5
            this.vy = (dy / dist) * 5
            this.direction = dx > 0 ? 1 : -1
          }
        }
      }
    }

    // Toy chasing - each toy type has different behavior
    const toyTypes = ['feather', 'laser', 'yarn', 'fishToy', 'mouse']
    const isToyActive = toyTypes.includes(this.game.currentTool) && this.game.toy.visible

    if (isToyActive && this.state !== 'zoomies' && this.state !== 'sleeping') {
      const toy = this.game.toy
      const chars = toy.getCharacteristics()
      const toyDist = Math.hypot(toy.x - this.x, toy.y - this.y)
      const chaseRange = chars.attractRange + p.playfulness * 50

      if (toyDist < chaseRange) {
        // Play style affects behavior
        switch (chars.playStyle) {
          case 'chase':
            // Direct chase
            if (toyDist > 30) {
              this.state = 'playing'
              this.playStyle = 'chase'
              this.targetX = toy.x
              this.targetY = toy.y
            } else if (chars.catchable && Math.random() < 0.02) {
              // Caught it!
              this.game.createTextEffect(this.x, this.y - 30, '잡았다!', 0x4CAF50)
              this.game.createEffect(this.x, this.y, 'star')
              this.happiness = Math.min(100, this.happiness + 10)
            } else if (!chars.catchable && toyDist < 20) {
              // Laser frustration
              if (Math.random() < 0.01) {
                this.game.createTextEffect(this.x, this.y - 30, '어딨냥?!', 0xFF6347)
              }
            }
            break

          case 'pounce':
            // Wait then pounce
            if (toyDist > 80) {
              this.state = 'playing'
              this.playStyle = 'stalk'
              // Move closer slowly
              this.targetX = this.x + (toy.x - this.x) * 0.3
              this.targetY = this.y + (toy.y - this.y) * 0.3
            } else if (toyDist > 30) {
              // Wiggle butt then pounce!
              if (!this.pounceTimer) {
                this.pounceTimer = 30
                this.state = 'crouching'
              }
            }
            break

          case 'bat':
            // Gentle batting at yarn
            if (toyDist < 60 && toyDist > 20) {
              this.state = 'playing'
              this.playStyle = 'bat'
              // Stay near, bat occasionally
              if (Math.random() < 0.03) {
                this.game.createEffect(this.x, this.y, 'star')
                this.game.createTextEffect(this.x, this.y - 30, '통통~', 0xFF6B6B)
              }
            } else if (toyDist >= 60) {
              this.state = 'playing'
              this.targetX = toy.x
              this.targetY = toy.y
            }
            break

          case 'stalk':
            // Stealthy approach for mouse
            if (toyDist > 100) {
              this.state = 'playing'
              this.playStyle = 'stalk'
              // Slow, deliberate movement
              this.targetX = this.x + (toy.x - this.x) * 0.2
              this.targetY = this.y + (toy.y - this.y) * 0.2
            } else if (toyDist > 40) {
              // Crouch and wait
              this.state = 'crouching'
              if (Math.random() < 0.02) {
                // Sudden pounce!
                this.state = 'playing'
                this.playStyle = 'chase'
                this.targetX = toy.x
                this.targetY = toy.y
                this.game.createTextEffect(this.x, this.y - 30, '냥!', 0x9E9E9E)
              }
            } else if (chars.catchable && Math.random() < 0.03) {
              this.game.createTextEffect(this.x, this.y - 30, '사냥 성공!', 0x4CAF50)
              this.game.createEffect(this.x, this.y, 'heart')
              this.happiness = Math.min(100, this.happiness + 15)
            }
            break
        }

        // Tire based on toy
        this.tiredness = (this.tiredness || 0) + chars.tireRate * 0.01
        if (this.tiredness > 1 && Math.random() < 0.01) {
          this.state = 'idle'
          this.tiredness = 0
          this.game.createTextEffect(this.x, this.y - 30, '지쳤다냥...', 0x9090FF)
        }
      }
    } else {
      this.tiredness = Math.max(0, (this.tiredness || 0) - 0.005)
    }

    // Pounce timer
    if (this.pounceTimer) {
      this.pounceTimer--
      if (this.pounceTimer <= 0) {
        this.pounceTimer = null
        this.state = 'playing'
        this.playStyle = 'chase'
        this.targetX = this.game.toy.x
        this.targetY = this.game.toy.y
        this.game.createTextEffect(this.x, this.y - 30, '냥냥!', 0x4ECDC4)
      }
    }

    // Social avoidance
    if (this.game.socialSystem && this.state === 'walking') {
      for (const other of this.game.cats) {
        if (other.id !== this.id) {
          const dist = Math.hypot(other.x - this.x, other.y - this.y)
          if (dist < 100 && this.game.socialSystem.shouldAvoid(this.id, other.id)) {
            this.runAwayFrom(other.x, other.y)
            break
          }
        }
      }
    }

    // State machine
    if (this.state === 'walking' || this.state === 'playing' || this.state === 'crouching') {
      if (this.state === 'crouching') {
        // Stay still, wiggle butt
        this.vx = 0
        this.vy = 0
      } else if (this.targetX !== null) {
        const dx = this.targetX - this.x
        const dy = this.targetY - this.y
        const dist = Math.hypot(dx, dy)

        if (dist > 8) {
          let baseSpeed = this.state === 'playing' ? 3 : 1.5

          // Adjust speed based on toy and play style
          if (this.state === 'playing' && this.game.toy.visible) {
            const chars = this.game.toy.getCharacteristics()
            baseSpeed *= chars.chaseSpeed

            // Stalk is slower
            if (this.playStyle === 'stalk') baseSpeed *= 0.5
          }

          const speed = baseSpeed * (0.8 + p.energy * 0.4)
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
          } else if (this.targetCat && this.state !== 'playing') {
            // Arrived near friend, maybe sleep
            if (this.targetCat.state === 'sleeping') {
              this.state = 'sleeping'
              this.stateTimer = 150 + Math.random() * 150
              this.statusText.text = '쿨쿨...'
              this.statusText.visible = true
            }
            this.targetCat = null
          } else if (this.state !== 'playing') {
            this.scheduleNextAction()
          }
        }
      }
    } else if (this.state === 'grooming') {
      this.stateTimer -= delta
      if (this.stateTimer <= 0) {
        this.statusText.visible = false
        this.targetCat = null
        this.state = 'idle'
        this.scheduleNextAction()
      }
    } else if (this.state === 'idle' || this.state === 'sitting' || this.state === 'sleeping') {
      this.vx = 0
      this.vy = 0
      this.stateTimer -= delta

      if (this.stateTimer <= 0) {
        this.leaveFurniture()
        this.statusText.visible = false
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

    // Age affects size
    let scale = this.baseScale
    if (this.age.stage === 'kitten') scale *= 0.7
    if (this.age.stage === 'senior') scale *= 0.95

    this.container.scale.x = this.direction * scale
    this.container.scale.y = scale

    // Update text positions
    this.statusText.x = this.x
    this.statusText.y = this.y - 50
    this.nameTag.x = this.x
    this.nameTag.y = this.y + 35

    // Animations
    if (this.state === 'walking' || this.state === 'playing') {
      this.container.y += Math.sin(Date.now() / 80) * 2
    }
    if (this.state === 'zoomies') {
      this.container.y += Math.sin(Date.now() / 40) * 4
    }
    if (this.state === 'crouching') {
      // Wiggle butt before pounce
      this.container.scale.y = scale * 0.8
      this.container.x += Math.sin(Date.now() / 50) * 1.5
    }
    if (this.state === 'idle' || this.state === 'sitting') {
      this.container.scale.y = scale * (1 + Math.sin(Date.now() / 500) * 0.02)
    }
    if (this.state === 'sleeping') {
      this.container.scale.y = scale * (1 + Math.sin(Date.now() / 800) * 0.03)
      if (Math.random() < 0.005) {
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
        this.statusText.text = this.state === 'sleeping' ? '쿨쿨~' : '포근해~'
        this.statusText.visible = true
        this.stateTimer = 200 + Math.random() * 200
      } else if (f.type === 'tower') {
        this.state = 'sitting'
        this.y = f.y - 30
        this.statusText.text = '높다냥!'
        this.statusText.visible = true
        this.stateTimer = 150 + Math.random() * 150
      } else if (f.type === 'bowl') {
        this.state = f.bowlType === 'water' ? 'drinking' : 'eating'
        this.statusText.text = f.bowlType === 'water' ? '찹찹~' : '냠냠~'
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
    }
  }

  startEating() {
    this.state = 'eating'
    this.isEating = true
    this.stateTimer = 100
    this.vx = 0
    this.vy = 0
    this.statusText.text = '냠냠냠~'
    this.statusText.visible = true
    this.statusText.style.fill = 0xFFAA00
  }

  finishEating() {
    if (this.targetTreat) {
      // 간식 종류에 따른 효과 적용
      this.targetTreat.onEaten(this)
      this.game.removeTreat(this.targetTreat)
      this.targetTreat = null
    }
    this.isEating = false
    this.statusText.visible = false
    this.state = 'idle'
    this.leaveFurniture()
    this.scheduleNextAction()

    this.game.createEffect(this.x, this.y, 'heart')
    this.game.createTextEffect(this.x, this.y - 20, '맛있다냥~', 0xFF6B9D)
  }

  // Age system
  ageOneDay() {
    this.age.days++

    // Stage transitions
    if (this.age.days >= 5 && this.age.stage === 'kitten') {
      this.age.stage = 'young'
      this.game.createTextEffect(this.x, this.y - 30, 'Grew up!', 0x4CAF50)
    } else if (this.age.days >= 30 && this.age.stage === 'young') {
      this.age.stage = 'adult'
    } else if (this.age.days >= 100 && this.age.stage === 'adult') {
      this.age.stage = 'senior'
      this.drawCat() // Redraw with gray whiskers
    }
  }
}
