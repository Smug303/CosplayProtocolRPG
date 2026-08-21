// =============================================================================
// Cosplay Protocol: Save the RPG - Battle Engine & Turn-Based State Machine
// =============================================================================

class Battler {
  constructor(data) {
    Object.assign(this, JSON.parse(JSON.stringify(data)));
    this.skills = data.skills || [];
    this.buffs = [];
    this.isDefending = false;
    this.hitTimer = 0;
    this.animOffset = Math.random() * 10;
  }

  isAlive() {
    return this.currentHp > 0;
  }

  takeDamage(amount) {
    let finalDmg = amount;
    if (this.isDefending) {
      finalDmg = Math.floor(finalDmg * 0.5);
    }
    const shieldBuff = this.buffs.find(b => b.effects && b.effects.damageReduction);
    if (shieldBuff) {
      finalDmg = Math.floor(finalDmg * (1 - shieldBuff.effects.damageReduction));
    }
    finalDmg = Math.max(1, finalDmg);
    this.currentHp = Math.max(0, this.currentHp - finalDmg);
    this.hitTimer = 16;
    return finalDmg;
  }

  healHp(amount) {
    const prev = this.currentHp;
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
    return this.currentHp - prev;
  }

  healMp(amount) {
    const prev = this.currentMp;
    this.currentMp = Math.min(this.maxMp, this.currentMp + amount);
    return this.currentMp - prev;
  }

  useMp(amount) {
    if (this.currentMp >= amount) {
      this.currentMp -= amount;
      return true;
    }
    return false;
  }

  addBuff(tag, duration, color, effects) {
    this.buffs = this.buffs.filter(b => b.tag !== tag);
    this.buffs.push({ tag, duration, color, effects: effects || {} });
  }

  hasBuff(tag) {
    return this.buffs.some(b => b.tag === tag);
  }

  removeBuff(tag) {
    this.buffs = this.buffs.filter(b => b.tag !== tag);
  }

  updateBuffs() {
    this.buffs.forEach(b => b.duration--);
    this.buffs = this.buffs.filter(b => b.duration > 0);
  }

  getEffectiveAtk() {
    let mult = 1.0;
    this.buffs.forEach(b => {
      if (b.effects && b.effects.atkMultiplier) mult *= b.effects.atkMultiplier;
    });
    return Math.floor(this.atk * mult);
  }

  getEffectiveDef() {
    let mult = 1.0;
    this.buffs.forEach(b => {
      if (b.effects && b.effects.defMultiplier) mult *= b.effects.defMultiplier;
    });
    return Math.floor(this.def * mult);
  }
}

class BattleEngine {
  constructor(audio) {
    this.audio = audio;
    this.state = 'TITLE';
    this.currentWave = 1;
    this.heroes = [];
    this.enemies = [];
    this.items = [];

    // Turn flow
    this.activeHeroIndex = 0;
    this.selectedActionIndex = 0;
    this.selectedSubIndex = 0;
    this.selectedTargetIndex = 0;
    this.turnQueue = [];
    this.currentAction = null;

    // Visuals & Combat FX
    this.combatLog = 'Pressione Z para Iniciar';
    this.damagePopups = [];
    this.screenShake = 0;
    this.actionDelayTimer = 0;
    this.waveTransitionTimer = 0;

    this.initBattle();
  }

  initBattle() {
    this.currentWave = 1;
    this.heroes = HEROES_DATA.map(d => new Battler(d));
    this.enemies = ENEMIES_WAVE_1.map(d => new Battler(d));
    this.items = JSON.parse(JSON.stringify(ITEMS_DATA));
    this.damagePopups = [];
    this.combatLog = 'Fiscais burocratas tentam proibir o RPG!';
  }

  startWave2() {
    this.currentWave = 2;
    this.enemies = ENEMIES_WAVE_2.map(d => new Battler(d));
    this.combatLog = 'ALERTA! O Auditor Chefe da Convenção entrou no campo!';
    this.activeHeroIndex = 0;
    this.selectedActionIndex = 0;
    this.selectedSubIndex = 0;
    this.selectedTargetIndex = 0;
    this.state = 'HERO_SELECT_COMMAND';
  }

  // --- Input Handlers (Keyboard-driven) ---

  handleInput(key) {
    this.audio.ensureContext();

    if (this.state === 'TITLE') {
      if (key === 'CONFIRM') {
        this.audio.playMenuSelect();
        this.audio.startBattleMusic();
        this.state = 'INTRO';
        this.combatLog = 'Fiscais burocratas tentam proibir o RPG!';
        setTimeout(() => {
          if (this.state === 'INTRO') {
            this.state = 'HERO_SELECT_COMMAND';
            this.findNextActiveHero();
          }
        }, 1200);
      }
      return;
    }

    if (this.state === 'VICTORY' || this.state === 'GAME_OVER') {
      if (key === 'CONFIRM') {
        this.audio.playMenuSelect();
        this.initBattle();
        this.audio.startBattleMusic();
        this.state = 'HERO_SELECT_COMMAND';
        this.findNextActiveHero();
      }
      return;
    }

    if (this.state === 'HERO_SELECT_COMMAND') {
      this.handleCommandMenuInput(key);
    } else if (this.state === 'HERO_SELECT_SUBMENU') {
      this.handleSubmenuInput(key);
    } else if (this.state === 'HERO_SELECT_TARGET') {
      this.handleTargetInput(key);
    }
  }

  handleCommandMenuInput(key) {
    const commandsCount = 4; // 0: Atacar, 1: Magia/Skill, 2: Item, 3: Defender
    if (key === 'UP') {
      this.selectedActionIndex = (this.selectedActionIndex - 2 + commandsCount) % commandsCount;
      this.audio.playMenuMove();
    } else if (key === 'DOWN') {
      this.selectedActionIndex = (this.selectedActionIndex + 2) % commandsCount;
      this.audio.playMenuMove();
    } else if (key === 'LEFT') {
      if (this.selectedActionIndex % 2 === 1) {
        this.selectedActionIndex--;
        this.audio.playMenuMove();
      }
    } else if (key === 'RIGHT') {
      if (this.selectedActionIndex % 2 === 0) {
        this.selectedActionIndex++;
        this.audio.playMenuMove();
      }
    } else if (key === 'CONFIRM') {
      const activeHero = this.heroes[this.activeHeroIndex];
      this.audio.playMenuSelect();

      if (this.selectedActionIndex === 0) {
        // Attack
        this.currentAction = {
          type: 'ATTACK',
          name: 'Atacar',
          targetType: 'single_enemy',
          user: activeHero
        };
        this.state = 'HERO_SELECT_TARGET';
        this.selectedTargetIndex = this.findFirstAliveEnemyIndex();
      } else if (this.selectedActionIndex === 1) {
        // Skills
        this.selectedSubIndex = 0;
        this.state = 'HERO_SELECT_SUBMENU';
      } else if (this.selectedActionIndex === 2) {
        // Items
        this.selectedSubIndex = 0;
        this.state = 'HERO_SELECT_SUBMENU';
      } else if (this.selectedActionIndex === 3) {
        // Defend
        activeHero.isDefending = true;
        activeHero.addBuff('DEFESA', 1, '#38bdf8', { damageReduction: 0.5 });
        this.showPopup(activeHero, 'DEFESA!', '#38bdf8');
        this.combatLog = `${activeHero.name} assumiu postura defensiva!`;
        this.advanceHeroTurn();
      }
    }
  }

  handleSubmenuInput(key) {
    const activeHero = this.heroes[this.activeHeroIndex];
    const isSkillMenu = (this.selectedActionIndex === 1);
    const list = isSkillMenu ? activeHero.skills : this.items;

    if (key === 'UP') {
      this.selectedSubIndex = (this.selectedSubIndex - 1 + list.length) % list.length;
      this.audio.playMenuMove();
    } else if (key === 'DOWN') {
      this.selectedSubIndex = (this.selectedSubIndex + 1) % list.length;
      this.audio.playMenuMove();
    } else if (key === 'CANCEL') {
      this.audio.playMenuCancel();
      this.state = 'HERO_SELECT_COMMAND';
    } else if (key === 'CONFIRM') {
      if (isSkillMenu) {
        const skill = activeHero.skills[this.selectedSubIndex];
        if (activeHero.currentMp < skill.mpCost) {
          this.audio.playMenuCancel();
          this.combatLog = `MP insuficiente! Requer ${skill.mpCost} MP.`;
          return;
        }
        this.audio.playMenuSelect();
        this.currentAction = {
          type: 'SKILL',
          skill: skill,
          targetType: skill.targetType,
          user: activeHero
        };

        if (skill.targetType === 'self') {
          this.executeHeroSkill(activeHero, [activeHero], skill);
          this.advanceHeroTurn();
        } else if (skill.targetType === 'all_enemies') {
          this.executeHeroSkill(activeHero, this.enemies.filter(e => e.isAlive()), skill);
          this.advanceHeroTurn();
        } else if (skill.targetType === 'all_allies') {
          this.executeHeroSkill(activeHero, this.heroes.filter(h => h.isAlive()), skill);
          this.advanceHeroTurn();
        } else {
          this.state = 'HERO_SELECT_TARGET';
          if (skill.targetType === 'single_enemy') {
            this.selectedTargetIndex = this.findFirstAliveEnemyIndex();
          } else {
            this.selectedTargetIndex = 0;
          }
        }
      } else {
        // Item
        const item = this.items[this.selectedSubIndex];
        if (item.count <= 0) {
          this.audio.playMenuCancel();
          this.combatLog = `Sem estoque de ${item.name}!`;
          return;
        }
        this.audio.playMenuSelect();
        this.currentAction = {
          type: 'ITEM',
          item: item,
          targetType: item.targetType,
          user: activeHero
        };
        this.state = 'HERO_SELECT_TARGET';
        // Default to first alive hero
        this.selectedTargetIndex = this.heroes.findIndex(h => h.isAlive());
        if (this.selectedTargetIndex < 0) this.selectedTargetIndex = 0;
      }
    }
  }


  handleTargetInput(key) {
    const isTargetingEnemies = (this.currentAction.targetType === 'single_enemy');
    const targetList = isTargetingEnemies ? this.enemies : this.heroes;

    if (key === 'UP' || key === 'LEFT') {
      let idx = this.selectedTargetIndex;
      do {
        idx = (idx - 1 + targetList.length) % targetList.length;
      } while (!targetList[idx].isAlive() && this.currentAction.targetType !== 'single_ally_dead');
      this.selectedTargetIndex = idx;
      this.audio.playMenuMove();
    } else if (key === 'DOWN' || key === 'RIGHT') {
      let idx = this.selectedTargetIndex;
      do {
        idx = (idx + 1) % targetList.length;
      } while (!targetList[idx].isAlive() && this.currentAction.targetType !== 'single_ally_dead');
      this.selectedTargetIndex = idx;
      this.audio.playMenuMove();
    } else if (key === 'CANCEL') {
      this.audio.playMenuCancel();
      this.state = this.currentAction.type === 'ATTACK' ? 'HERO_SELECT_COMMAND' : 'HERO_SELECT_SUBMENU';
    } else if (key === 'CONFIRM') {
      this.audio.playMenuSelect();
      const target = targetList[this.selectedTargetIndex];

      if (this.currentAction.type === 'ATTACK') {
        this.executeHeroAttack(this.currentAction.user, target);
        this.advanceHeroTurn();
      } else if (this.currentAction.type === 'SKILL') {
        this.executeHeroSkill(this.currentAction.user, target, this.currentAction.skill);
        this.advanceHeroTurn();
      } else if (this.currentAction.type === 'ITEM') {
        this.executeHeroItem(this.currentAction.user, target, this.currentAction.item);
        this.advanceHeroTurn();
      }
    }
  }

  // --- Action Executions ---

  executeHeroAttack(user, target) {
    user.isDefending = false;
    this.audio.playSwordSlash();
    this.triggerScreenShake(4);
    const baseAtk = user.getEffectiveAtk();
    const rawDmg = Math.max(8, Math.floor(baseAtk + Math.random() * 6 - target.getEffectiveDef() * 0.4));
    const dmg = target.takeDamage(rawDmg);
    this.showPopup(target, `-${dmg}`, '#ef4444');
    this.combatLog = `${user.name} atacou ${target.name} causando ${dmg} de dano!`;
  }

  executeHeroSkill(user, target, skill) {
    user.isDefending = false;
    user.useMp(skill.mpCost);
    if (this.audio[skill.sfx]) {
      this.audio[skill.sfx]();
    }
    this.triggerScreenShake(6);
    this.combatLog = skill.execute(user, target, this);
  }

  executeHeroItem(user, target, item) {
    if (item.count <= 0) {
      this.combatLog = `Sem estoque de ${item.name}!`;
      return;
    }
    item.count--;
    if (this.audio[item.sfx]) {
      this.audio[item.sfx]();
    }
    const result = item.execute(target);
    this.combatLog = result || `${user.name} usou ${item.name}!`;
    this.showPopup(target, item.id === 'silver_tape' ? '+HP' : item.id === 'energy_drink' ? '+MP' : 'VIP!', '#34d399');
  }


  advanceHeroTurn() {
    this.activeHeroIndex++;
    this.selectedActionIndex = 0;
    this.selectedSubIndex = 0;

    // Check if enemies all died
    if (this.enemies.every(e => !e.isAlive())) {
      this.checkWaveOrVictory();
      return;
    }

    if (this.activeHeroIndex < this.heroes.length) {
      if (this.heroes[this.activeHeroIndex].isAlive()) {
        this.state = 'HERO_SELECT_COMMAND';
      } else {
        this.advanceHeroTurn(); // Skip dead hero
      }
    } else {
      // All heroes acted -> Enemy Turn
      this.state = 'ENEMY_TURN';
      this.executeEnemyTurns();
    }
  }

  findNextActiveHero() {
    for (let i = 0; i < this.heroes.length; i++) {
      if (this.heroes[i].isAlive()) {
        this.activeHeroIndex = i;
        this.state = 'HERO_SELECT_COMMAND';
        return;
      }
    }
  }

  // --- Smart Enemy AI Execution ---

  executeEnemyTurns() {
    const aliveEnemies = this.enemies.filter(e => e.isAlive());
    if (aliveEnemies.length === 0) {
      this.checkWaveOrVictory();
      return;
    }

    let delay = 600;
    aliveEnemies.forEach((enemy, idx) => {
      setTimeout(() => {
        if (!enemy.isAlive() || this.state === 'GAME_OVER' || this.state === 'VICTORY') return;

        // Check stun
        if (enemy.hasBuff('STUN')) {
          this.combatLog = `${enemy.name} está atordoado e não pode agir!`;
          this.showPopup(enemy, 'STUNNED', '#facc15');
          enemy.removeBuff('STUN');
          return;
        }

        // Target picking: check if Paladin has TAUNT
        const aliveHeroes = this.heroes.filter(h => h.isAlive());
        if (aliveHeroes.length === 0) {
          this.triggerGameOver();
          return;
        }

        let targetHero = aliveHeroes.find(h => h.hasBuff('TAUNT'));
        if (!targetHero) {
          // 40% chance to target lowest HP hero, otherwise random
          if (Math.random() < 0.4) {
            targetHero = [...aliveHeroes].sort((a, b) => a.currentHp - b.currentHp)[0];
          } else {
            targetHero = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
          }
        }

        // Enemy Decision
        const randAction = Math.random();
        if (enemy.isBoss) {
          // Boss AI
          if (randAction < 0.4) {
            // Interdição Total (AOE attack)
            this.audio.playThunder();
            this.triggerScreenShake(8);
            aliveHeroes.forEach(h => {
              const dmg = h.takeDamage(Math.floor(18 + Math.random() * 8));
              this.showPopup(h, `-${dmg}`, '#ef4444');
            });
            this.combatLog = `${enemy.name} usou Decreto de Interdição em área!`;
          } else if (randAction < 0.7) {
            // Carimbo de Recusa Crítico
            this.audio.playHeavyHit();
            this.triggerScreenShake(7);
            const dmg = targetHero.takeDamage(Math.floor(enemy.getEffectiveAtk() * 1.6 + Math.random() * 8));
            this.showPopup(targetHero, `CRÍTICO -${dmg}`, '#ef4444');
            this.combatLog = `${enemy.name} carimbou ${targetHero.name} com Carimbo de Recusa!`;
          } else {
            // Normal Bureaucrat Strike
            this.audio.playSwordSlash();
            const dmg = targetHero.takeDamage(Math.floor(enemy.getEffectiveAtk() + Math.random() * 6));
            this.showPopup(targetHero, `-${dmg}`, '#ef4444');
            this.combatLog = `${enemy.name} notificou multa gravíssima em ${targetHero.name}!`;
          }
        } else {
          // Normal Bureaucrat AI
          if (randAction < 0.3) {
            // Aviso Prévio (Debuff)
            this.audio.playDebuff();
            targetHero.addBuff('ATK-', 2, '#a855f7', { atkMultiplier: 0.75 });
            this.showPopup(targetHero, 'ATK DOWN', '#a855f7');
            this.combatLog = `${enemy.name} emitiu Aviso Prévio em ${targetHero.name} (-25% ATK)!`;
          } else {
            // Notificação de Multa
            this.audio.playSwordSlash();
            this.triggerScreenShake(4);
            const dmg = targetHero.takeDamage(Math.floor(enemy.getEffectiveAtk() + Math.random() * 5));
            this.showPopup(targetHero, `-${dmg}`, '#ef4444');
            this.combatLog = `${enemy.name} aplicou Notificação de Multa em ${targetHero.name} (-${dmg} HP)!`;
          }
        }

        // Check if all heroes died
        if (this.heroes.every(h => !h.isAlive())) {
          this.triggerGameOver();
        }
      }, delay);
      delay += 900;
    });

    // Reset for next turn round
    setTimeout(() => {
      if (this.state !== 'GAME_OVER' && this.state !== 'VICTORY' && this.state !== 'WAVE_CLEAR') {
        // Tick down buffs
        this.heroes.forEach(h => h.updateBuffs());
        this.enemies.forEach(e => e.updateBuffs());
        this.activeHeroIndex = 0;
        this.findNextActiveHero();
      }
    }, delay + 400);
  }

  checkWaveOrVictory() {
    if (this.currentWave === 1) {
      this.state = 'WAVE_CLEAR';
      this.combatLog = 'Trio de Fiscais derrotado! Preparando para o confronto com o Chefe...';
      this.audio.playBuff();
      setTimeout(() => {
        this.startWave2();
      }, 2500);
    } else {
      this.state = 'VICTORY';
      this.combatLog = 'VITÓRIA! A Convenção e os RPGs foram salvos!';
      this.audio.stopBattleMusic();
      this.audio.playVictory();
    }
  }

  triggerGameOver() {
    this.state = 'GAME_OVER';
    this.combatLog = 'GAME OVER: A fiscalização proibiu o RPG... Pressione Z para tentar novamente.';
    this.audio.stopBattleMusic();
    this.audio.playDebuff();
  }

  findFirstAliveEnemyIndex() {
    const idx = this.enemies.findIndex(e => e.isAlive());
    return idx >= 0 ? idx : 0;
  }

  showPopup(target, text, color) {
    this.damagePopups.push({
      target,
      text,
      color: color || '#ffffff',
      yOffset: 0,
      opacity: 1.0,
      life: 50
    });
  }

  triggerScreenShake(strength) {
    this.screenShake = strength;
  }

  update(dt) {
    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake *= 0.85;
      if (this.screenShake < 0.5) this.screenShake = 0;
    }

    // Damage popups update
    for (let i = this.damagePopups.length - 1; i >= 0; i--) {
      const p = this.damagePopups[i];
      p.yOffset -= 0.6;
      p.life--;
      p.opacity = Math.max(0, p.life / 50);
      if (p.life <= 0) {
        this.damagePopups.splice(i, 1);
      }
    }

    // Tick hit timers on battlers
    this.heroes.forEach(h => {
      if (h.hitTimer > 0) h.hitTimer--;
    });
    this.enemies.forEach(e => {
      if (e.hitTimer > 0) e.hitTimer--;
    });
  }
}

window.BattleEngine = BattleEngine;
window.Battler = Battler;
