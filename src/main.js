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

init().then(() => {
  setupSaveStatusDisplay()
  // Start auto-save if no save data exists
  if (game?.saveSystem && !game.saveSystem.hasSaveData()) {
    game.saveSystem.startAutoSave()
  }
}).catch(console.error)
