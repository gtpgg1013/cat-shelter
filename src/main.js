import { Application } from 'pixi.js'
import { Game } from './game/Game.js'
import { authManager } from './auth/clerk.js'

let game = null

async function init() {
  // Initialize Clerk auth first
  await authManager.init()

  // Setup auth UI
  setupAuthUI()

  // Create Pixi Application
  const app = new Application()

  await app.init({
    width: 1200,
    height: 800,
    backgroundColor: 0x8B7355,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
  })

  // Add canvas to DOM
  document.getElementById('game-container').appendChild(app.canvas)

  // Scale for pixel art crispness
  app.stage.eventMode = 'static'

  // Create game instance
  game = new Game(app)
  await game.init()

  // Setup toolbar
  setupToolbar(game)

  // Check for existing save data
  checkSaveData()
}

function setupAuthUI() {
  const loginBtn = document.getElementById('login-btn')
  const logoutBtn = document.getElementById('logout-btn')
  const userInfo = document.getElementById('user-info')
  const userName = document.getElementById('user-name')
  const saveBtn = document.getElementById('save-btn')
  const saveStatus = document.getElementById('save-status')

  // Update UI based on auth state
  function updateAuthUI() {
    if (authManager.isSignedIn()) {
      loginBtn.style.display = 'none'
      userInfo.style.display = 'flex'
      saveBtn.style.display = 'block'
      userName.textContent = authManager.getUserName() + '님'
    } else {
      loginBtn.style.display = 'block'
      userInfo.style.display = 'none'
      saveBtn.style.display = 'none'
    }
  }

  // Auth change listener
  authManager.onAuthChange = (user) => {
    updateAuthUI()
    if (user && game?.saveSystem) {
      checkSaveData()
    }
  }

  // Login button
  loginBtn.addEventListener('click', () => {
    authManager.signIn()
  })

  // Logout button
  logoutBtn.addEventListener('click', () => {
    authManager.signOut()
  })

  // Manual save button
  saveBtn.addEventListener('click', () => {
    if (game?.saveSystem) {
      game.saveSystem.save(true)
    }
  })

  // Initial UI state
  updateAuthUI()
}

function checkSaveData() {
  if (!game?.saveSystem) return

  const saveInfo = game.saveSystem.getSaveInfo()

  if (saveInfo.hasSave) {
    showLoadModal(saveInfo)
  }
}

function showLoadModal(saveInfo) {
  const modal = document.getElementById('load-modal')
  const infoEl = document.getElementById('save-info')
  const continueBtn = document.getElementById('continue-btn')
  const newBtn = document.getElementById('new-btn')

  // Format save info
  let infoText = `고양이 ${saveInfo.catCount}마리`
  if (saveInfo.lastSaved) {
    const date = saveInfo.lastSaved
    infoText += ` | 마지막 저장: ${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  infoEl.textContent = infoText

  modal.style.display = 'flex'

  // Continue with saved data
  continueBtn.onclick = async () => {
    modal.style.display = 'none'
    await game.saveSystem.load()
    game.saveSystem.startAutoSave()
  }

  // Start fresh
  newBtn.onclick = async () => {
    modal.style.display = 'none'
    await game.saveSystem.deleteSave()
    game.saveSystem.startAutoSave()
  }
}

function setupToolbar(game) {
  const buttons = document.querySelectorAll('.tool-btn')

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      game.setTool(btn.dataset.tool)
    })
  })
}

// Update save status display
function setupSaveStatusDisplay() {
  if (!game?.saveSystem) return

  const saveStatus = document.getElementById('save-status')

  game.saveSystem.onStatusChange = (status) => {
    saveStatus.className = status
    switch (status) {
      case 'saving':
        saveStatus.textContent = '저장 중...'
        break
      case 'saved':
        saveStatus.textContent = '저장됨'
        break
      case 'error':
        saveStatus.textContent = '저장 실패'
        break
      default:
        saveStatus.textContent = ''
    }
  }
}

// Show cat profile modal
function showCatProfile(cat) {
  const modal = document.getElementById('cat-profile-modal')
  const g = cat.genetics
  const p = g.personality

  // Avatar
  document.getElementById('profile-avatar').textContent = '🐱'

  // Name and rarity
  document.getElementById('profile-name').textContent = g.name
  const rarityBadge = document.getElementById('profile-rarity')
  rarityBadge.textContent = g.rarity
  rarityBadge.className = `rarity-badge ${g.rarity}`

  // Stats
  const colorNames = {
    orange: '오렌지', cream: '크림', brown: '브라운',
    gray: '그레이', black: '블랙', white: '화이트'
  }
  const patternNames = {
    solid: '단색', tabby: '태비', calico: '삼색',
    tuxedo: '턱시도', spots: '점박이', bicolor: '투톤'
  }
  const stageNames = {
    kitten: '아기', young: '청년', adult: '성인', senior: '노년'
  }

  document.getElementById('profile-color').textContent = colorNames[g.baseColorType] || g.baseColorType
  document.getElementById('profile-pattern').textContent = patternNames[g.patternType] || g.patternType
  document.getElementById('profile-age').textContent = `${stageNames[cat.age.stage]} (${cat.age.days}일)`
  document.getElementById('profile-happiness').style.width = `${cat.happiness}%`

  // Personality traits
  const traitsEl = document.getElementById('profile-traits')
  const traitNames = {
    curiosity: '호기심', energy: '에너지', friendliness: '친화성',
    playfulness: '장난기', boldness: '대담함'
  }
  traitsEl.innerHTML = ''
  for (const [key, value] of Object.entries(p)) {
    const tag = document.createElement('span')
    tag.className = `trait-tag ${value > 0.7 ? 'high' : value < 0.3 ? 'low' : ''}`
    tag.textContent = `${traitNames[key]} ${Math.round(value * 100)}%`
    traitsEl.appendChild(tag)
  }

  // Friends
  const friendsEl = document.getElementById('profile-friends')
  friendsEl.innerHTML = ''
  if (game?.socialSystem) {
    const social = game.socialSystem.getCatSocialInfo(cat.id)
    if (social.friends.length > 0) {
      social.friends.slice(0, 3).forEach((friend, i) => {
        const friendCat = game.cats.find(c => c.id === friend.id)
        if (friendCat) {
          const tag = document.createElement('span')
          tag.className = `friend-tag ${i === 0 ? 'best' : ''}`
          tag.textContent = friendCat.genetics.name
          friendsEl.appendChild(tag)
        }
      })
    } else {
      friendsEl.innerHTML = '<span class="no-friends">아직 친구가 없어요</span>'
    }
  }

  modal.style.display = 'flex'
}

function setupProfileModal() {
  const modal = document.getElementById('cat-profile-modal')
  const closeBtn = document.getElementById('profile-close')

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none'
  })

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none'
    }
  })
}

// Expose showCatProfile to game
window.showCatProfile = showCatProfile

init().then(() => {
  setupSaveStatusDisplay()
  setupProfileModal()
  // Start auto-save if no save data exists
  if (game?.saveSystem && !game.saveSystem.hasSaveData()) {
    game.saveSystem.startAutoSave()
  }
}).catch(console.error)
