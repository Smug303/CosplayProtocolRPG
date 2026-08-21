// =============================================================================
// Cosplay Protocol: Save the RPG - Keyboard-Only Input Handler
// =============================================================================

class InputManager {
  constructor(battle, audio) {
    this.battle = battle;
    this.audio = audio;
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      // Prevent scrolling on arrow keys and spacebar
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.battle.handleInput('UP');
          break;

        case 'ArrowDown':
        case 'KeyS':
          this.battle.handleInput('DOWN');
          break;

        case 'ArrowLeft':
        case 'KeyA':
          this.battle.handleInput('LEFT');
          break;

        case 'ArrowRight':
        case 'KeyD':
          this.battle.handleInput('RIGHT');
          break;

        case 'KeyZ':
        case 'Enter':
        case 'Space':
          this.battle.handleInput('CONFIRM');
          break;

        case 'KeyX':
        case 'Escape':
        case 'Backspace':
          this.battle.handleInput('CANCEL');
          break;

        case 'KeyM':
          const isMuted = this.audio.toggleMute();
          this.battle.combatLog = isMuted ? 'ÁUDIO MUTADO' : 'ÁUDIO ATIVADO';
          break;

        case 'KeyC':
          const crt = document.querySelector('.crt-overlay');
          if (crt) {
            crt.classList.toggle('disabled');
            this.battle.combatLog = crt.classList.contains('disabled') ? 'FILTRO CRT DESATIVADO' : 'FILTRO CRT ATIVADO';
          }
          break;
      }
    });
  }
}

window.InputManager = InputManager;
