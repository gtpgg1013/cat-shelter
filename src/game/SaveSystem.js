import { authManager } from '../auth/clerk.js'

const STORAGE_KEY = 'catShelter_saveData'
const SAVE_VERSION = '4.0'

export class SaveSystem {
  constructor(game) {
    this.game = game
    this.autoSaveInterval = null
    this.lastSaveTime = 0
    this.isDirty = false
    this.saveStatus = 'idle' // idle, saving, saved, error
    this.onStatusChange = null
  }

  // Serialize entire game state
  serialize() {
    const cats = this.game.cats.map(cat => cat.toJSON())
    const relationships = this.game.socialSystem?.toJSON() || {}

    return {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      cats,
      relationships,
      progress: {
        totalDays: this.game.eventSystem?.totalDays || 0,
        visitedCats: this.game.eventSystem?.visitedCatsCount || 0
      }
    }
  }

  // Deserialize and restore game state
  async deserialize(data) {
    if (!data || data.version !== SAVE_VERSION) {
      console.warn('Save data version mismatch or invalid')
      return false
    }

    try {
      // Clear existing cats (including their UI elements)
      for (const cat of [...this.game.cats]) {
        // Remove cat container from catLayer
        if (cat.container.parent) {
          cat.container.parent.removeChild(cat.container)
        }
        // Remove statusText and nameTag from effectLayer
        if (cat.statusText?.parent) {
          cat.statusText.parent.removeChild(cat.statusText)
        }
        if (cat.nameTag?.parent) {
          cat.nameTag.parent.removeChild(cat.nameTag)
        }
      }
      this.game.cats = []

      // Restore cats
      for (const catData of data.cats) {
        const cat = this.game.createCatFromData(catData)
        if (cat) {
          this.game.cats.push(cat)
          this.game.catLayer.addChild(cat.container)
        }
      }

      // Restore relationships
      if (this.game.socialSystem && data.relationships) {
        this.game.socialSystem.fromJSON(data.relationships)
      }

      // Restore progress
      if (this.game.eventSystem && data.progress) {
        this.game.eventSystem.totalDays = data.progress.totalDays || 0
        this.game.eventSystem.visitedCatsCount = data.progress.visitedCats || 0
      }

      return true
    } catch (error) {
      console.error('Failed to deserialize save data:', error)
      return false
    }
  }

  // Save to both local storage and cloud
  async save(force = false) {
    if (!force && !this.isDirty) return true

    this.setStatus('saving')

    const data = this.serialize()
    console.log('Saving data:', data.cats.length, 'cats')

    // Always save to local storage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      console.log('Saved to localStorage')
    } catch (e) {
      console.error('LocalStorage save failed:', e)
    }

    // Save to cloud if signed in
    if (authManager.isSignedIn()) {
      const success = await authManager.saveData(data)
      if (success) {
        console.log('Saved to cloud')
        this.setStatus('saved')
        this.isDirty = false
        this.lastSaveTime = Date.now()
        return true
      } else {
        console.error('Cloud save failed')
        this.setStatus('error')
        return false
      }
    } else {
      this.setStatus('saved')
      this.isDirty = false
      this.lastSaveTime = Date.now()
      return true
    }
  }

  // Load from cloud (priority) or local storage
  async load() {
    let data = null

    // Try cloud first if signed in
    if (authManager.isSignedIn()) {
      data = authManager.loadData()
      if (data) {
        console.log('Loaded from cloud:', data.cats?.length, 'cats')
      }
    }

    // Fall back to local storage
    if (!data) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          data = JSON.parse(stored)
          console.log('Loaded from localStorage:', data.cats?.length, 'cats')
        }
      } catch (e) {
        console.error('LocalStorage load failed:', e)
      }
    }

    if (data) {
      const result = await this.deserialize(data)
      console.log('Deserialize result:', result, '- cats in game:', this.game.cats.length)
      return result
    }

    return false
  }

  // Check if save data exists
  hasSaveData() {
    if (authManager.isSignedIn()) {
      const cloudData = authManager.loadData()
      if (cloudData) return true
    }

    try {
      return !!localStorage.getItem(STORAGE_KEY)
    } catch (e) {
      return false
    }
  }

  // Delete save data
  async deleteSave() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Failed to delete local save:', e)
    }

    if (authManager.isSignedIn()) {
      await authManager.saveData(null)
    }
  }

  // Start auto-save (every 5 minutes)
  startAutoSave() {
    this.stopAutoSave()
    this.autoSaveInterval = setInterval(() => {
      if (this.isDirty) {
        this.save()
      }
    }, 5 * 60 * 1000) // 5 minutes

    // Save on important events
    window.addEventListener('beforeunload', () => {
      if (this.isDirty) {
        this.save(true)
      }
    })
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
  }

  // Mark as needing save
  markDirty() {
    this.isDirty = true
  }

  // Set and broadcast status
  setStatus(status) {
    this.saveStatus = status
    if (this.onStatusChange) {
      this.onStatusChange(status)
    }

    // Auto-clear 'saved' status after 3 seconds
    if (status === 'saved') {
      setTimeout(() => {
        if (this.saveStatus === 'saved') {
          this.setStatus('idle')
        }
      }, 3000)
    }
  }

  // Get save info for display
  getSaveInfo() {
    const hasSave = this.hasSaveData()
    let lastSaved = null

    if (authManager.isSignedIn()) {
      const cloudData = authManager.loadData()
      if (cloudData?.savedAt) {
        lastSaved = new Date(cloudData.savedAt)
      }
    }

    if (!lastSaved) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data = JSON.parse(stored)
          if (data.savedAt) {
            lastSaved = new Date(data.savedAt)
          }
        }
      } catch (e) {}
    }

    return {
      hasSave,
      lastSaved,
      catCount: hasSave ? this.getCatCountFromSave() : 0
    }
  }

  getCatCountFromSave() {
    if (authManager.isSignedIn()) {
      const cloudData = authManager.loadData()
      if (cloudData?.cats) return cloudData.cats.length
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        return data.cats?.length || 0
      }
    } catch (e) {}

    return 0
  }
}
