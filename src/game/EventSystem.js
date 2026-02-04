// Event System - Random events, new cats, special moments

import { CatGenerator } from './CatGenerator.js'

export class EventSystem {
  constructor(game) {
    this.game = game
    this.lastEventTime = 0
    this.eventCooldown = 300 // Minimum frames between events
    this.pendingEvents = []
  }

  update(delta) {
    this.lastEventTime += delta

    // Process pending events
    this.processPendingEvents()

    // Random events
    if (this.lastEventTime > this.eventCooldown) {
      this.maybeSpawnEvent()
    }
  }

  maybeSpawnEvent() {
    const rand = Math.random()

    // New cat visitor (rare)
    if (rand < 0.0005 && this.game.cats.length < 8) {
      this.scheduleEvent('newCatVisitor', 60)
      this.lastEventTime = 0
      return
    }

    // Legendary visitor (very rare!)
    if (rand < 0.0001 && this.game.cats.length < 10) {
      this.scheduleEvent('legendaryVisitor', 60)
      this.lastEventTime = 0
      return
    }

    // Weather change
    if (rand < 0.001) {
      this.scheduleEvent('weatherChange', 30)
      this.lastEventTime = 0
      return
    }

    // Random zoomies (cat suddenly runs around)
    if (rand < 0.002) {
      this.triggerZoomies()
      this.lastEventTime = 0
      return
    }

    // Nap party (multiple cats sleep together)
    if (rand < 0.0015) {
      this.triggerNapParty()
      this.lastEventTime = 0
      return
    }

    // Stretch time (cats stretch together)
    if (rand < 0.003) {
      this.triggerStretchTime()
      this.lastEventTime = 0
      return
    }

    // Grooming session
    if (rand < 0.002) {
      this.triggerGroomingSession()
      this.lastEventTime = 0
      return
    }

    // Hungry hint
    if (rand < 0.003) {
      this.triggerHungryHint()
      this.lastEventTime = 0
      return
    }

    // Cat choir (meowing together)
    if (rand < 0.001) {
      this.triggerCatChoir()
      this.lastEventTime = 0
      return
    }
  }

  scheduleEvent(type, delay = 0) {
    this.pendingEvents.push({
      type,
      triggerTime: Date.now() + delay * 16, // Convert frames to ms roughly
    })
  }

  processPendingEvents() {
    const now = Date.now()
    const ready = this.pendingEvents.filter(e => now >= e.triggerTime)

    for (const event of ready) {
      this.executeEvent(event)
    }

    this.pendingEvents = this.pendingEvents.filter(e => now < e.triggerTime)
  }

  executeEvent(event) {
    switch (event.type) {
      case 'newCatVisitor':
        this.spawnNewCatVisitor()
        break
      case 'legendaryVisitor':
        this.spawnLegendaryVisitor()
        break
      case 'weatherChange':
        this.changeWeather()
        break
      default:
        console.log('Unknown event:', event.type)
    }
  }

  spawnNewCatVisitor() {
    // New cat appears at the edge
    this.game.spawnCat()
    const newCat = this.game.cats[this.game.cats.length - 1]

    // Start from door area
    newCat.x = 50
    newCat.y = 600

    // Announce
    this.game.createTextEffect(200, 300, '새 고양이가 왔어요!', 0x4CAF50)
    console.log(`New cat visitor: ${newCat.genetics.name} (${newCat.genetics.rarity})`)
  }

  changeWeather() {
    // Simple weather toggle (could expand)
    const weathers = ['sunny', 'cloudy', 'rainy']
    const newWeather = weathers[Math.floor(Math.random() * weathers.length)]
    this.game.weather = newWeather

    if (newWeather === 'rainy') {
      // Cats gather near window
      this.catsGatherAtWindow()
    }
  }

  catsGatherAtWindow() {
    // Some cats go to window area
    const windowX = 250
    const windowY = 350

    for (const cat of this.game.cats) {
      if (Math.random() < 0.4 && cat.state === 'idle') {
        cat.targetX = windowX + Math.random() * 200
        cat.targetY = windowY + Math.random() * 100
        cat.state = 'walking'
      }
    }
  }

  triggerZoomies() {
    // Random cat gets the zoomies!
    if (this.game.cats.length === 0) return

    const cat = this.game.cats[Math.floor(Math.random() * this.game.cats.length)]

    if (cat.state === 'sleeping' || cat.state === 'eating') return

    cat.startZoomies()
    this.game.createTextEffect(cat.x, cat.y - 30, '폭주다냥!', 0xFF6B9D)
  }

  onNewDay(day) {
    console.log(`Day ${day} events triggered`)

    // Guaranteed new cat every 3 days
    if (day % 3 === 0 && this.game.cats.length < 10) {
      this.scheduleEvent('newCatVisitor', 180)
    }

    // Cats age
    for (const cat of this.game.cats) {
      cat.ageOneDay()
    }
  }

  // Birthday check
  checkBirthdays() {
    for (const cat of this.game.cats) {
      if (cat.age.days % 30 === 0 && cat.age.days > 0) {
        this.celebrateBirthday(cat)
      }
    }
  }

  celebrateBirthday(cat) {
    this.game.createTextEffect(cat.x, cat.y - 40, `${cat.genetics.name} 생일 축하!`, 0xFFD700)
    this.game.createEffect(cat.x - 20, cat.y, 'star')
    this.game.createEffect(cat.x + 20, cat.y, 'star')
    this.game.createEffect(cat.x, cat.y, 'heart')
  }

  // === NEW EVENTS ===

  spawnLegendaryVisitor() {
    // Force spawn a legendary cat!
    let genetics = CatGenerator.generate()

    // Keep trying until we get a legendary
    let attempts = 0
    while (genetics.rarity !== 'legendary' && attempts < 20) {
      genetics = CatGenerator.generate()
      attempts++
    }

    // Force legendary if we couldn't get one
    if (genetics.rarity !== 'legendary') {
      genetics.rarity = 'legendary'
    }

    this.game.spawnCat(genetics)
    const newCat = this.game.cats[this.game.cats.length - 1]
    newCat.x = 50
    newCat.y = 600

    this.game.createTextEffect(200, 300, '전설의 고양이가 나타났다!', 0xFFD700)
    this.game.createEffect(200, 350, 'star')
    this.game.createEffect(250, 320, 'star')
    this.game.createEffect(300, 340, 'star')
  }

  triggerNapParty() {
    // Multiple cats fall asleep together
    const awake = this.game.cats.filter(c => c.state !== 'sleeping' && c.state !== 'eating')
    if (awake.length < 2) return

    // Pick a spot
    const spotX = 400 + Math.random() * 400
    const spotY = 500 + Math.random() * 150

    let count = 0
    for (const cat of awake) {
      if (Math.random() < 0.6 && count < 4) {
        cat.targetX = spotX + (Math.random() - 0.5) * 100
        cat.targetY = spotY + (Math.random() - 0.5) * 50
        cat.clampTarget()
        cat.state = 'walking'

        // Will sleep when arrives
        setTimeout(() => {
          if (cat.state !== 'eating') {
            cat.state = 'sleeping'
            cat.stateTimer = 200 + Math.random() * 200
          }
        }, 2000 + Math.random() * 1000)

        count++
      }
    }

    if (count > 0) {
      this.game.createTextEffect(spotX, spotY - 50, '낮잠 파티~', 0x9090FF)
    }
  }

  triggerStretchTime() {
    // Cats stretch together
    let count = 0
    for (const cat of this.game.cats) {
      if (cat.state === 'idle' || cat.state === 'sitting') {
        this.game.createTextEffect(cat.x, cat.y - 30, '기지개~', 0xFFB6C1)
        count++
      }
    }

    if (count > 0) {
      setTimeout(() => {
        this.game.createTextEffect(600, 300, '스트레칭 시간!', 0x90EE90)
      }, 500)
    }
  }

  triggerGroomingSession() {
    // Find friendly pairs and have them groom
    if (!this.game.socialSystem) return

    for (const cat of this.game.cats) {
      if (cat.state !== 'idle') continue

      const bestFriend = this.game.socialSystem.getBestFriend(cat.id)
      if (bestFriend) {
        const friend = this.game.cats.find(c => c.id === bestFriend.id)
        if (friend && friend.state === 'idle') {
          cat.startGrooming(friend)
          this.game.createTextEffect(cat.x, cat.y - 30, '쓰담쓰담~', 0xFF6B9D)
          this.game.socialSystem.modifyAffinity(cat.id, friend.id, 3)
          return // Only one pair at a time
        }
      }
    }
  }

  triggerHungryHint() {
    // Random cat shows hunger
    const candidates = this.game.cats.filter(c => c.state === 'idle' && c.happiness < 70)
    if (candidates.length === 0) return

    const cat = candidates[Math.floor(Math.random() * candidates.length)]
    const messages = ['배고파냥...', '간식...?', '밥밥밥!', '꼬르륵~']
    const msg = messages[Math.floor(Math.random() * messages.length)]

    this.game.createTextEffect(cat.x, cat.y - 30, msg, 0xFFA500)

    // Cat looks at food bowl area
    cat.targetX = 100
    cat.targetY = 500
    cat.state = 'walking'
  }

  triggerCatChoir() {
    // Multiple cats meow together
    const messages = ['냐~', '냥~', '야옹~', '먀~']
    let delay = 0

    for (const cat of this.game.cats) {
      if (Math.random() < 0.5) {
        setTimeout(() => {
          const msg = messages[Math.floor(Math.random() * messages.length)]
          this.game.createTextEffect(cat.x, cat.y - 30, msg, 0xFF6B9D)
        }, delay)
        delay += 200 + Math.random() * 300
      }
    }

    if (delay > 0) {
      setTimeout(() => {
        this.game.createTextEffect(600, 250, '고양이 합창단!', 0x4ECDC4)
        this.game.createEffect(600, 300, 'music')
      }, delay + 500)
    }
  }
}
