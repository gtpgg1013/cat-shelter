import { Clerk } from '@clerk/clerk-js'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

class AuthManager {
  constructor() {
    this.clerk = null
    this.isReady = false
    this.user = null
    this.onAuthChange = null
  }

  async init() {
    if (!CLERK_PUBLISHABLE_KEY) {
      console.warn('Clerk publishable key not found. Running in offline mode.')
      this.isReady = true
      return
    }

    this.clerk = new Clerk(CLERK_PUBLISHABLE_KEY)
    await this.clerk.load()

    this.isReady = true
    this.user = this.clerk.user

    // Listen for auth changes
    this.clerk.addListener(({ user }) => {
      this.user = user
      if (this.onAuthChange) {
        this.onAuthChange(user)
      }
    })

    return this.user
  }

  isSignedIn() {
    return !!this.user
  }

  getUser() {
    return this.user
  }

  getUserName() {
    if (!this.user) return null
    return this.user.firstName || this.user.username || '집사'
  }

  async signIn() {
    if (!this.clerk) return
    await this.clerk.openSignIn()
  }

  async signOut() {
    if (!this.clerk) return
    await this.clerk.signOut()
  }

  // Save data to Clerk user metadata
  async saveData(data) {
    if (!this.user) {
      console.warn('Not signed in. Cannot save to cloud.')
      return false
    }

    try {
      const compressed = JSON.stringify(data)

      // Check size limit (8KB)
      if (compressed.length > 8000) {
        console.warn('Data too large for Clerk metadata. Trimming old data...')
        // Keep only essential data
        data = this.trimData(data)
      }

      await this.user.update({
        unsafeMetadata: {
          shelterData: data
        }
      })

      return true
    } catch (error) {
      console.error('Failed to save to Clerk:', error)
      return false
    }
  }

  // Load data from Clerk user metadata
  loadData() {
    if (!this.user) return null

    try {
      return this.user.unsafeMetadata?.shelterData || null
    } catch (error) {
      console.error('Failed to load from Clerk:', error)
      return null
    }
  }

  // Trim data to fit size limit
  trimData(data) {
    const trimmed = { ...data }

    // Keep only last 15 cats
    if (trimmed.cats && trimmed.cats.length > 15) {
      trimmed.cats = trimmed.cats.slice(-15)
    }

    // Remove old relationship data for deleted cats
    if (trimmed.relationships) {
      const catIds = new Set(trimmed.cats.map(c => c.id))
      const newRel = {}
      for (const id of Object.keys(trimmed.relationships)) {
        if (catIds.has(id)) {
          newRel[id] = {}
          for (const otherId of Object.keys(trimmed.relationships[id])) {
            if (catIds.has(otherId)) {
              newRel[id][otherId] = trimmed.relationships[id][otherId]
            }
          }
        }
      }
      trimmed.relationships = newRel
    }

    return trimmed
  }

  // Mount user button to element
  mountUserButton(element) {
    if (!this.clerk || !element) return

    if (this.isSignedIn()) {
      this.clerk.mountUserButton(element)
    }
  }
}

export const authManager = new AuthManager()
