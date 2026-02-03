// Time System - Day/Night cycle synced with Korean time (KST)

export class TimeSystem {
  constructor(game) {
    this.game = game

    // Use real Korean time (KST = UTC+9)
    this.timezone = 'Asia/Seoul'
    this.day = 1
    this.lastDay = new Date().getDate()

    // Time periods
    this.periods = {
      dawn: { start: 5, end: 7, color: 0xFFE4E1, ambient: 0.6 },
      morning: { start: 7, end: 12, color: 0xFFFAF0, ambient: 1.0 },
      afternoon: { start: 12, end: 17, color: 0xFFF8DC, ambient: 0.95 },
      evening: { start: 17, end: 20, color: 0xFFE4B5, ambient: 0.7 },
      night: { start: 20, end: 5, color: 0x4A5568, ambient: 0.3 },
    }

    this.currentPeriod = this.getPeriod()
    this.lastPeriod = this.currentPeriod
  }

  // Get current Korean time
  getKoreanTime() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: this.timezone }))
  }

  update(delta) {
    const now = this.getKoreanTime()
    const currentDay = now.getDate()

    // Day changed (midnight rollover)
    if (currentDay !== this.lastDay) {
      this.lastDay = currentDay
      this.day++
      this.onNewDay()
    }

    // Update period
    this.lastPeriod = this.currentPeriod
    this.currentPeriod = this.getPeriod()

    // Period changed
    if (this.currentPeriod !== this.lastPeriod) {
      this.onPeriodChange()
    }
  }

  getHour() {
    return this.getKoreanTime().getHours()
  }

  getMinute() {
    return this.getKoreanTime().getMinutes()
  }

  getTimeString() {
    const h = this.getHour().toString().padStart(2, '0')
    const m = this.getMinute().toString().padStart(2, '0')
    return `${h}:${m}`
  }

  getDayString() {
    const now = this.getKoreanTime()
    const month = now.getMonth() + 1
    const date = now.getDate()
    return `${month}/${date}`
  }

  getPeriod() {
    const hour = this.getHour()

    for (const [name, period] of Object.entries(this.periods)) {
      if (name === 'night') {
        // Night wraps around midnight
        if (hour >= period.start || hour < period.end) {
          return 'night'
        }
      } else {
        if (hour >= period.start && hour < period.end) {
          return name
        }
      }
    }
    return 'morning'
  }

  getPeriodInfo() {
    return this.periods[this.currentPeriod]
  }

  getAmbientColor() {
    const period = this.getPeriodInfo()
    return period.color
  }

  getAmbientLevel() {
    const period = this.getPeriodInfo()
    return period.ambient
  }

  // Get behavior modifier based on time
  getBehaviorModifiers() {
    const hour = this.getHour()

    return {
      // Cats are more active at dawn/dusk
      activityMultiplier: this.currentPeriod === 'dawn' || this.currentPeriod === 'evening' ? 1.5 :
                          this.currentPeriod === 'night' ? 1.3 : // Zoomies!
                          this.currentPeriod === 'afternoon' ? 0.5 : 1.0,

      // Sleep probability
      sleepChance: this.currentPeriod === 'afternoon' ? 0.4 :
                   this.currentPeriod === 'night' ? 0.3 :
                   this.currentPeriod === 'dawn' ? 0.1 : 0.15,

      // Hunger peaks
      hungerMultiplier: (hour === 7 || hour === 18) ? 2.0 : 1.0,

      // Social activity
      socialMultiplier: this.currentPeriod === 'morning' ? 1.3 :
                        this.currentPeriod === 'night' ? 0.7 : 1.0,
    }
  }

  onPeriodChange() {
    console.log(`Time period changed to: ${this.currentPeriod}`)
    // Game will read this and update lighting
  }

  onNewDay() {
    console.log(`New day: ${this.day}`)
    // Trigger daily events
    if (this.game.eventSystem) {
      this.game.eventSystem.onNewDay(this.day)
    }
  }

  // Get seconds for compatibility (returns current second of day)
  getSeconds() {
    const now = this.getKoreanTime()
    return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  }
}
