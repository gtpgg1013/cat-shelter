// Social System - Cat relationships and emergent behavior

export class SocialSystem {
  constructor(game) {
    this.game = game
    this.relationships = {} // { catId: { otherCatId: { affinity, lastInteraction } } }
  }

  // Initialize relationship between two cats
  initRelationship(cat1, cat2) {
    if (!this.relationships[cat1.id]) {
      this.relationships[cat1.id] = {}
    }
    if (!this.relationships[cat2.id]) {
      this.relationships[cat2.id] = {}
    }

    // Initial affinity based on personalities
    const compatibility = this.calculateCompatibility(cat1, cat2)
    const initialAffinity = (compatibility - 0.5) * 40 // -20 to +20

    this.relationships[cat1.id][cat2.id] = {
      affinity: initialAffinity,
      lastInteraction: Date.now(),
      interactions: 0,
    }
    this.relationships[cat2.id][cat1.id] = {
      affinity: initialAffinity,
      lastInteraction: Date.now(),
      interactions: 0,
    }
  }

  calculateCompatibility(cat1, cat2) {
    const p1 = cat1.genetics.personality
    const p2 = cat2.genetics.personality

    // Similar energy levels get along
    const energyMatch = 1 - Math.abs(p1.energy - p2.energy)

    // Friendly cats like everyone
    const friendlyBonus = (p1.friendliness + p2.friendliness) / 2

    // Playful cats like other playful cats
    const playMatch = 1 - Math.abs(p1.playfulness - p2.playfulness)

    return (energyMatch * 0.3 + friendlyBonus * 0.4 + playMatch * 0.3)
  }

  getRelationship(cat1Id, cat2Id) {
    if (!this.relationships[cat1Id] || !this.relationships[cat1Id][cat2Id]) {
      return null
    }
    return this.relationships[cat1Id][cat2Id]
  }

  getAffinity(cat1Id, cat2Id) {
    const rel = this.getRelationship(cat1Id, cat2Id)
    return rel ? rel.affinity : 0
  }

  modifyAffinity(cat1Id, cat2Id, delta) {
    const rel1 = this.getRelationship(cat1Id, cat2Id)
    const rel2 = this.getRelationship(cat2Id, cat1Id)

    if (rel1) {
      rel1.affinity = Math.max(-100, Math.min(100, rel1.affinity + delta))
      rel1.lastInteraction = Date.now()
      rel1.interactions++
    }
    if (rel2) {
      // Slightly different change for the other cat
      rel2.affinity = Math.max(-100, Math.min(100, rel2.affinity + delta * 0.8))
      rel2.lastInteraction = Date.now()
      rel2.interactions++
    }
  }

  // Called every frame
  update(delta) {
    const cats = this.game.cats

    // Check proximity and interactions
    for (let i = 0; i < cats.length; i++) {
      for (let j = i + 1; j < cats.length; j++) {
        const cat1 = cats[i]
        const cat2 = cats[j]

        // Initialize if needed
        if (!this.getRelationship(cat1.id, cat2.id)) {
          this.initRelationship(cat1, cat2)
        }

        const distance = Math.hypot(cat1.x - cat2.x, cat1.y - cat2.y)

        // Proximity effects
        if (distance < 50) {
          // Very close - increase affinity slowly
          this.modifyAffinity(cat1.id, cat2.id, 0.01 * delta)

          // Maybe trigger social behavior
          this.maybeTriggerSocialBehavior(cat1, cat2, distance)
        } else if (distance < 150) {
          // Medium distance - slight affinity increase
          this.modifyAffinity(cat1.id, cat2.id, 0.002 * delta)
        }
      }
    }
  }

  maybeTriggerSocialBehavior(cat1, cat2, distance) {
    const affinity = this.getAffinity(cat1.id, cat2.id)

    // High affinity behaviors
    if (affinity > 50) {
      // Grooming
      if (Math.random() < 0.001 && cat1.state === 'idle' && cat2.state === 'idle') {
        this.startGrooming(cat1, cat2)
      }
      // Sleep together
      if (Math.random() < 0.002 && cat1.state === 'sleeping' && cat2.state !== 'sleeping') {
        cat2.sleepNear(cat1)
      }
    }

    // Low affinity behaviors
    if (affinity < -30) {
      // Hiss/avoid
      if (Math.random() < 0.005 && distance < 80) {
        this.triggerConflict(cat1, cat2)
      }
    }
  }

  startGrooming(groomer, groomee) {
    if (groomer.state !== 'idle' || groomee.state !== 'idle') return

    groomer.startGrooming(groomee)
    this.modifyAffinity(groomer.id, groomee.id, 5)

    // Create effect
    this.game.createEffect(groomee.x, groomee.y, 'heart')
  }

  triggerConflict(cat1, cat2) {
    // Both cats move away from each other
    const dx = cat1.x - cat2.x
    const dy = cat1.y - cat2.y
    const dist = Math.hypot(dx, dy) || 1

    cat1.runAwayFrom(cat2.x, cat2.y)
    cat2.runAwayFrom(cat1.x, cat1.y)

    this.modifyAffinity(cat1.id, cat2.id, -3)

    // Hiss effect
    this.game.createTextEffect(cat1.x, cat1.y - 20, '샤악!', 0xFF6347)
  }

  // Get social info for a cat
  getCatSocialInfo(catId) {
    const relationships = this.relationships[catId] || {}
    const friends = []
    const rivals = []

    for (const [otherId, rel] of Object.entries(relationships)) {
      if (rel.affinity > 30) {
        friends.push({ id: otherId, affinity: rel.affinity })
      } else if (rel.affinity < -30) {
        rivals.push({ id: otherId, affinity: rel.affinity })
      }
    }

    return {
      friends: friends.sort((a, b) => b.affinity - a.affinity),
      rivals: rivals.sort((a, b) => a.affinity - b.affinity),
    }
  }

  // Find best friend
  getBestFriend(catId) {
    const info = this.getCatSocialInfo(catId)
    return info.friends[0] || null
  }

  // Should cat follow another cat?
  shouldFollow(followerId, targetId) {
    const affinity = this.getAffinity(followerId, targetId)
    return affinity > 40 && Math.random() < 0.3
  }

  // Should cat avoid another cat?
  shouldAvoid(avoiderId, targetId) {
    const affinity = this.getAffinity(avoiderId, targetId)
    return affinity < -20 && Math.random() < 0.5
  }
}
