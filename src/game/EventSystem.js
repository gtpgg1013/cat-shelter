// Event System - Random events, new cats, special moments

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
    }

    // Weather change
    if (rand < 0.001) {
      this.scheduleEvent('weatherChange', 30)
      this.lastEventTime = 0
    }

    // Random zoomies (cat suddenly runs around)
    if (rand < 0.002) {
      this.triggerZoomies()
      this.lastEventTime = 0
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
}
