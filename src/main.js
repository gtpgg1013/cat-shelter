import { Application, Container } from 'pixi.js'
import { Game } from './game/Game.js'

async function init() {
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
  const game = new Game(app)
  await game.init()

  // Setup toolbar
  setupToolbar(game)
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

init().catch(console.error)
