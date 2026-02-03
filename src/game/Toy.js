import { Container, Graphics } from 'pixi.js'

export class Toy {
  constructor(game) {
    this.game = game
    this.x = 0
    this.y = 0
    this.vx = 0
    this.vy = 0
    this.targetX = 0
    this.targetY = 0
    this.visible = false
    this.container = new Container()

    this.currentToy = 'feather'
    this.sprite = null

    // Physics state
    this.isThrown = false
    this.friction = 0.98
    this.bounce = 0.6

    // Mouse toy state
    this.isScurrying = false
    this.scurryTimer = 0
    this.scurryTarget = { x: 0, y: 0 }

    // Toy characteristics
    this.characteristics = {
      feather: {
        name: '깃털',
        attractRange: 200,
        chaseSpeed: 1.2,
        excitementGain: 1,
        tireRate: 0.5,
        catchable: true,
        playStyle: 'chase',
        interactionType: 'drag',  // 마우스 따라다님
        description: '흔들어서 놀아주세요'
      },
      laser: {
        name: '레이저',
        attractRange: 350,
        chaseSpeed: 2.0,
        excitementGain: 2,
        tireRate: 1.5,
        catchable: false,
        playStyle: 'chase',
        interactionType: 'drag',  // 마우스 따라다님
        description: '빠르게 움직여보세요'
      },
      yarn: {
        name: '털실공',
        attractRange: 150,
        chaseSpeed: 0.8,
        excitementGain: 0.5,
        tireRate: 0.3,
        catchable: true,
        playStyle: 'bat',
        interactionType: 'throw', // 던지기
        description: '클릭해서 던지세요'
      },
      fishToy: {
        name: '물고기',
        attractRange: 250,
        chaseSpeed: 1.0,
        excitementGain: 1.5,
        tireRate: 0.8,
        catchable: true,
        playStyle: 'pounce',
        interactionType: 'fling', // 드래그해서 날리기
        description: '드래그해서 날리세요'
      },
      mouse: {
        name: '쥐돌이',
        attractRange: 300,
        chaseSpeed: 1.5,
        excitementGain: 1.8,
        tireRate: 1.0,
        catchable: true,
        playStyle: 'stalk',
        interactionType: 'place', // 클릭한 곳에 놓으면 도망다님
        description: '클릭하면 쥐가 도망가요'
      }
    }

    // Fling state
    this.isDragging = false
    this.dragStart = { x: 0, y: 0 }

    this.draw()
    this.container.visible = false
  }

  setType(type) {
    if (this.characteristics[type]) {
      this.currentToy = type
      this.isThrown = false
      this.isScurrying = false
      this.vx = 0
      this.vy = 0
      this.draw()
    }
  }

  getCharacteristics() {
    return this.characteristics[this.currentToy]
  }

  getInteractionType() {
    return this.characteristics[this.currentToy].interactionType
  }

  // Called on pointer down
  onPointerDown(x, y) {
    const type = this.getInteractionType()

    switch (type) {
      case 'throw':
        // Yarn - throw to position
        this.throwTo(x, y)
        break
      case 'fling':
        // Fish - start drag
        this.isDragging = true
        this.dragStart = { x, y }
        this.x = x
        this.y = y
        this.isThrown = false
        break
      case 'place':
        // Mouse - place and scurry
        this.placeAndScurry(x, y)
        break
    }
  }

  // Called on pointer up
  onPointerUp(x, y) {
    const type = this.getInteractionType()

    if (type === 'fling' && this.isDragging) {
      // Calculate fling velocity
      const dx = x - this.dragStart.x
      const dy = y - this.dragStart.y
      this.vx = dx * 0.3
      this.vy = dy * 0.3
      this.isThrown = true
      this.isDragging = false

      if (Math.hypot(this.vx, this.vy) > 2) {
        this.game.createTextEffect(this.x, this.y - 20, '휙!', 0x4ECDC4)
      }
    }
  }

  throwTo(x, y) {
    // Throw yarn to position
    const dx = x - this.x
    const dy = y - this.y
    const dist = Math.hypot(dx, dy)

    if (dist > 10) {
      const speed = Math.min(dist * 0.15, 15)
      this.vx = (dx / dist) * speed
      this.vy = (dy / dist) * speed
      this.isThrown = true
      this.game.createTextEffect(this.x, this.y - 20, '데굴~', 0xFF6B6B)
    }
  }

  placeAndScurry(x, y) {
    this.x = x
    this.y = y
    this.isScurrying = true
    this.scurryTimer = 180 // 3 seconds of scurrying
    this.pickNewScurryTarget()
    this.game.createTextEffect(x, y - 20, '찍찍!', 0x9E9E9E)
  }

  pickNewScurryTarget() {
    // Random direction, stay in bounds
    const angle = Math.random() * Math.PI * 2
    const dist = 80 + Math.random() * 120
    this.scurryTarget.x = Math.max(100, Math.min(1100, this.x + Math.cos(angle) * dist))
    this.scurryTarget.y = Math.max(350, Math.min(750, this.y + Math.sin(angle) * dist))
  }

  moveTo(x, y) {
    this.targetX = x
    this.targetY = y
  }

  setVisible(visible) {
    this.visible = visible
    this.container.visible = visible
    if (!visible) {
      this.isThrown = false
      this.isScurrying = false
      this.isDragging = false
    }
  }

  draw() {
    if (this.sprite) {
      this.container.removeChild(this.sprite)
      this.sprite.destroy()
    }

    this.sprite = new Graphics()
    const s = 3

    switch (this.currentToy) {
      case 'feather':
        this.drawFeather(s)
        break
      case 'laser':
        this.drawLaser(s)
        break
      case 'yarn':
        this.drawYarn(s)
        break
      case 'fishToy':
        this.drawFish(s)
        break
      case 'mouse':
        this.drawMouse(s)
        break
    }

    this.container.addChild(this.sprite)
  }

  drawFeather(s) {
    this.sprite.fill(0x8B4513)
    this.sprite.rect(0, 0, s, s * 8)
    this.sprite.fill(0xFF6B9D)
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
        if (cell) this.sprite.rect((rx - 2) * s, (ry + 8) * s, s, s)
      })
    })
    this.sprite.fill(0xFFFFFF)
    this.sprite.rect(-1 * s, 10 * s, s, s)
    this.sprite.rect(1 * s, 11 * s, s, s)
    this.sprite.pivot.set(0, 12 * s)
  }

  drawLaser(s) {
    this.sprite.fill(0xFF0000)
    this.sprite.circle(0, 0, s * 4)
    this.sprite.fill(0xFF3333)
    this.sprite.circle(0, 0, s * 2.5)
    this.sprite.fill(0xFF6666)
    this.sprite.circle(0, 0, s * 1.5)
    this.sprite.fill(0xFFAAAA)
    this.sprite.circle(0, 0, s * 0.8)
    this.sprite.pivot.set(0, 0)
  }

  drawYarn(s) {
    const yarnColors = [0xFF6B6B, 0xFF8E8E, 0xFFB4B4]
    this.sprite.fill(yarnColors[0])
    this.sprite.circle(0, 0, s * 5)
    this.sprite.fill(yarnColors[1])
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI
      this.sprite.rect(Math.cos(angle) * s * 2 - s/2, Math.sin(angle) * s * 2 - s * 3, s, s * 6)
    }
    this.sprite.fill(yarnColors[2])
    this.sprite.circle(-s * 2, -s * 2, s * 1.5)
    this.sprite.pivot.set(0, 0)
  }

  drawFish(s) {
    this.sprite.fill(0x4ECDC4)
    const fishBody = [
      [0,0,0,1,1,1,0,0],
      [0,0,1,1,1,1,1,0],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [0,0,1,1,1,1,1,0],
      [0,0,0,1,1,1,0,0],
    ]
    fishBody.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell) this.sprite.rect((rx - 4) * s, (ry - 3) * s, s, s)
      })
    })
    this.sprite.fill(0x45B7AA)
    this.sprite.rect(-5 * s, -1 * s, s, s * 2)
    this.sprite.rect(-6 * s, -2 * s, s, s * 4)
    this.sprite.fill(0xFFFFFF)
    this.sprite.rect(2 * s, -1 * s, s * 2, s * 2)
    this.sprite.fill(0x333333)
    this.sprite.rect(3 * s, 0, s, s)
    this.sprite.pivot.set(0, 0)
  }

  drawMouse(s) {
    this.sprite.fill(0x9E9E9E)
    const mouseBody = [
      [0,0,1,1,1,1,0],
      [0,1,1,1,1,1,1],
      [1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1],
      [0,0,1,1,1,1,0],
    ]
    mouseBody.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell) this.sprite.rect((rx - 3) * s, (ry - 2) * s, s, s)
      })
    })
    this.sprite.fill(0xFFB6C1)
    this.sprite.circle(-2 * s, -3 * s, s * 1.5)
    this.sprite.circle(1 * s, -3 * s, s * 1.5)
    this.sprite.fill(0xFF69B4)
    this.sprite.rect(4 * s, 0, s, s)
    this.sprite.fill(0x333333)
    this.sprite.rect(2 * s, -1 * s, s, s)
    this.sprite.fill(0xFFB6C1)
    this.sprite.rect(-4 * s, 0, s, s)
    this.sprite.rect(-5 * s, -1 * s, s, s * 2)
    this.sprite.rect(-6 * s, -1 * s, s, s)
    this.sprite.pivot.set(0, 0)
  }

  update(delta) {
    if (!this.visible) return

    const type = this.getInteractionType()

    // Handle different interaction types
    if (type === 'drag') {
      // Feather, Laser - follow mouse
      let smoothness = this.currentToy === 'laser' ? 0.4 : 0.2
      this.x += (this.targetX - this.x) * smoothness
      this.y += (this.targetY - this.y) * smoothness
    }
    else if (type === 'throw' || type === 'fling') {
      // Yarn, Fish - physics based
      if (this.isThrown) {
        this.x += this.vx * delta
        this.y += this.vy * delta
        this.vx *= this.friction
        this.vy *= this.friction

        // Bounce off walls
        if (this.x < 100 || this.x > 1100) {
          this.vx *= -this.bounce
          this.x = Math.max(100, Math.min(1100, this.x))
        }
        if (this.y < 350 || this.y > 750) {
          this.vy *= -this.bounce
          this.y = Math.max(350, Math.min(750, this.y))
        }

        // Stop when slow enough
        if (Math.hypot(this.vx, this.vy) < 0.3) {
          this.isThrown = false
          this.vx = 0
          this.vy = 0
        }
      } else if (!this.isDragging && type === 'fling') {
        // Fish waiting - gentle bob
        this.y += Math.sin(Date.now() / 300) * 0.3
      } else if (!this.isDragging && type === 'throw') {
        // Yarn waiting at last position - slight wobble
        this.container.rotation = Math.sin(Date.now() / 200) * 0.1
      }

      if (this.isDragging) {
        // Following mouse while dragging
        this.x = this.targetX
        this.y = this.targetY
      }
    }
    else if (type === 'place') {
      // Mouse - scurry behavior
      if (this.isScurrying) {
        this.scurryTimer -= delta

        // Move toward target
        const dx = this.scurryTarget.x - this.x
        const dy = this.scurryTarget.y - this.y
        const dist = Math.hypot(dx, dy)

        if (dist > 5) {
          const speed = 3
          this.x += (dx / dist) * speed * delta
          this.y += (dy / dist) * speed * delta
        } else {
          // Pick new target
          this.pickNewScurryTarget()
        }

        // Random direction changes
        if (Math.random() < 0.02) {
          this.pickNewScurryTarget()
        }

        // Stop scurrying after timer
        if (this.scurryTimer <= 0) {
          this.isScurrying = false
        }
      }
    }

    this.container.x = this.x
    this.container.y = this.y

    // Animations
    switch (this.currentToy) {
      case 'feather':
        this.container.rotation = Math.sin(Date.now() / 150) * 0.3
        break
      case 'laser':
        this.container.x += (Math.random() - 0.5) * 3
        this.container.y += (Math.random() - 0.5) * 3
        this.sprite.alpha = 0.7 + Math.sin(Date.now() / 50) * 0.3
        break
      case 'yarn':
        if (this.isThrown) {
          this.container.rotation += Math.hypot(this.vx, this.vy) * 0.1
        }
        break
      case 'fishToy':
        if (this.isThrown) {
          // Rotate in direction of movement
          this.container.rotation = Math.atan2(this.vy, this.vx)
        } else {
          this.container.rotation = Math.sin(Date.now() / 200) * 0.15
        }
        break
      case 'mouse':
        if (this.isScurrying) {
          // Face movement direction
          const dx = this.scurryTarget.x - this.x
          this.container.scale.x = dx > 0 ? 1 : -1
          // Quick wiggle
          this.container.y += Math.sin(Date.now() / 30) * 1
        } else {
          this.container.rotation = Math.sin(Date.now() / 500) * 0.1
        }
        break
    }
  }
}
