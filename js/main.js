// =============================================================================
// Cosplay Protocol: Save the RPG - Main Entry Point & Game Loop
// =============================================================================

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // Crisp retro pixel art rendering
  ctx.imageSmoothingEnabled = false;

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  // Initialize Subsystems
  const audio = new AudioSynth();
  const spriteManager = new SpriteManager();
  const battle = new BattleEngine(audio);
  const ui = new UIRenderer(spriteManager);
  const input = new InputManager(battle, audio);

  let lastTime = performance.now();

  function gameLoop(currentTime) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Update Battle State & Animations
    battle.update(dt);

    // Clear Canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Render Everything
    ui.render(ctx, battle, CANVAS_WIDTH, CANVAS_HEIGHT, currentTime);

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
});
