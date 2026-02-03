import { Container, Graphics } from 'pixi.js'

export class Treat {
  constructor(game, x, y, type = 'fish') {
    this.game = game
    this.x = x
    this.y = y
    this.type = type
    this.container = new Container()
    this.container.x = x
    this.container.y = y
    this.eaten = false

    // Treat characteristics
    this.traits = {
      fish: {
        name: '생선',
        attractRange: 200,
        happiness: 10,
        energy: 5,
        special: null
      },
      churu: {
        name: '츄르',
        attractRange: 350,  // 모든 고양이가 미쳐!
        happiness: 20,
        energy: 10,
        special: 'excited'  // 흥분 상태
      },
      dry: {
        name: '건조간식',
        attractRange: 150,
        happiness: 5,
        energy: 3,
        special: null
      },
      catnip: {
        name: '캣닢',
        attractRange: 250,
        happiness: 15,
        energy: -5,  // 에너지 소모
        special: 'zoomies'  // 폭주!
      }
    }

    this.draw()
    this.animate()
  }

  getTraits() {
    return this.traits[this.type]
  }

  draw() {
    const sprite = new Graphics()
    const s = 3

    switch (this.type) {
      case 'fish':
        this.drawFish(sprite, s)
        break
      case 'churu':
        this.drawChuru(sprite, s)
        break
      case 'dry':
        this.drawDry(sprite, s)
        break
      case 'catnip':
        this.drawCatnip(sprite, s)
        break
    }

    this.sprite = sprite
    this.container.addChild(sprite)
  }

  drawFish(sprite, s) {
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
        if (cell) sprite.rect(rx * s, ry * s, s, s)
      })
    })
    sprite.fill(0xD4A060)
    sprite.rect(6 * s, 1 * s, s, s)
    sprite.rect(7 * s, 0 * s, s, s)
    sprite.rect(7 * s, 2 * s, s, s)
    sprite.rect(7 * s, 3 * s, s * 2, s)
    sprite.rect(7 * s, 4 * s, s, s)
    sprite.fill(0x000000)
    sprite.rect(1 * s, 2 * s, s, s)
    sprite.pivot.set(10, 7)
  }

  drawChuru(sprite, s) {
    // 츄르 튜브
    sprite.fill(0xFF69B4)  // 핑크색 튜브
    sprite.roundRect(0, 0, s * 10, s * 4, 3)

    // 츄르 내용물
    sprite.fill(0xFFE4B5)
    sprite.roundRect(s * 9, s * 1, s * 3, s * 2, 2)

    // 줄무늬
    sprite.fill(0xFF1493)
    sprite.rect(s * 2, 0, s, s * 4)
    sprite.rect(s * 5, 0, s, s * 4)

    sprite.pivot.set(s * 5, s * 2)
  }

  drawDry(sprite, s) {
    // 건조간식 (작은 별 모양들)
    const colors = [0xC4A060, 0xD4B070, 0xB49050]

    for (let i = 0; i < 5; i++) {
      sprite.fill(colors[i % 3])
      const ox = (i % 3) * s * 3
      const oy = Math.floor(i / 3) * s * 3
      sprite.circle(ox + s * 1.5, oy + s * 1.5, s * 1.2)
    }

    sprite.pivot.set(s * 4, s * 2)
  }

  drawCatnip(sprite, s) {
    // 캣닢 잎
    sprite.fill(0x228B22)  // 초록색
    const leaf = [
      [0,0,1,1,0,0],
      [0,1,1,1,1,0],
      [1,1,1,1,1,1],
      [0,1,1,1,1,0],
      [0,0,1,1,0,0],
    ]
    leaf.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell) sprite.rect(rx * s, ry * s, s, s)
      })
    })

    // 줄기
    sprite.fill(0x006400)
    sprite.rect(s * 2.5, s * 5, s, s * 3)

    // 반짝임 (마법 효과)
    sprite.fill(0x90EE90)
    sprite.rect(s * 1, s * 1, s * 0.8, s * 0.8)
    sprite.rect(s * 4, s * 2, s * 0.8, s * 0.8)

    sprite.pivot.set(s * 3, s * 4)
  }

  animate() {
    // 간식 타입별 애니메이션
    const animateTreat = () => {
      if (this.eaten) return

      switch (this.type) {
        case 'churu':
          // 반짝반짝
          this.container.alpha = 0.8 + Math.sin(Date.now() / 100) * 0.2
          break
        case 'catnip':
          // 빙글빙글 + 위아래
          this.container.rotation = Math.sin(Date.now() / 300) * 0.2
          this.container.y = this.y + Math.sin(Date.now() / 200) * 2
          break
        case 'fish':
          // 가끔 펄떡
          if (Math.random() < 0.005) {
            this.container.rotation = 0.3
            setTimeout(() => {
              if (!this.eaten) this.container.rotation = 0
            }, 100)
          }
          break
      }

      requestAnimationFrame(animateTreat)
    }
    animateTreat()
  }

  // 먹혔을 때 효과
  onEaten(cat) {
    this.eaten = true
    const traits = this.getTraits()

    // 행복도/에너지 적용
    cat.happiness = Math.min(100, cat.happiness + traits.happiness)

    // 특수 효과
    if (traits.special === 'zoomies') {
      cat.startZoomies()
      this.game.createTextEffect(cat.x, cat.y - 30, '캣닢이다냥!', 0x228B22)
    } else if (traits.special === 'excited') {
      this.game.createTextEffect(cat.x, cat.y - 30, '츄르다!!', 0xFF69B4)
      this.game.createEffect(cat.x, cat.y, 'heart')
      this.game.createEffect(cat.x - 15, cat.y - 10, 'heart')
      this.game.createEffect(cat.x + 15, cat.y - 10, 'heart')
    }
  }
}
