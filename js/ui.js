// =============================================================================
// Cosplay Protocol: Save the RPG - Retro Final Fantasy UI & Battle HUD Renderer
// High-Legibility & Crisp Retro Typography for 800x600 resolution
// =============================================================================

class UIRenderer {
  constructor(spriteManager) {
    this.spriteManager = spriteManager;
  }

  render(ctx, battle, canvasWidth, canvasHeight, time) {
    ctx.save();

    // Apply Screen Shake
    if (battle.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * battle.screenShake * 2;
      const shakeY = (Math.random() - 0.5) * battle.screenShake * 2;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Evacuated Convention Background
    this.spriteManager.drawBackground(ctx, canvasWidth, canvasHeight, time);

    // If on Title Screen, render Title Screen
    if (battle.state === 'TITLE') {
      this.renderTitleScreen(ctx, canvasWidth, canvasHeight, time);
      ctx.restore();
      return;
    }

    // 2. Draw Characters (Heroes on Left, Enemies on Right)
    this.renderBattlefield(ctx, battle, canvasWidth, canvasHeight, time);

    // 3. Draw Bottom Battle HUD
    this.renderBottomHUD(ctx, battle, canvasWidth, canvasHeight, time);

    // 4. Draw Top Combat Log / Message Banner
    this.renderTopBanner(ctx, battle, canvasWidth, canvasHeight, time);

    // 5. Draw Floating Damage & Status Popups
    this.renderDamagePopups(ctx, battle);

    // 6. Draw Victory or Game Over Overlay
    if (battle.state === 'VICTORY') {
      this.renderVictoryScreen(ctx, canvasWidth, canvasHeight, time);
    } else if (battle.state === 'GAME_OVER') {
      this.renderGameOverScreen(ctx, canvasWidth, canvasHeight, time);
    }

    ctx.restore();
  }

  // Render Heroes and Enemies on battlefield
  renderBattlefield(ctx, battle, width, height, time) {
    // HERO POSITIONS (Left side, classic 4-party diagonal column)
    const heroBaseX = 160;
    const heroBaseY = 115;
    const heroSpacingY = 62;

    battle.heroes.forEach((hero, index) => {
      const x = heroBaseX + (index % 2 === 1 ? 20 : 0);
      const y = heroBaseY + index * heroSpacingY;
      hero.screenX = x;
      hero.screenY = y;

      const isActing = (battle.state.startsWith('HERO') && battle.activeHeroIndex === index);
      const isTargeted = (battle.state === 'HERO_SELECT_TARGET' && !battle.currentAction.targetType.includes('enemy') && battle.selectedTargetIndex === index);

      this.spriteManager.drawCharacter(ctx, hero, x, y, isTargeted, isActing, time);
    });

    // ENEMY POSITIONS (Right side)
    const enemyBaseX = 620;
    const enemyBaseY = 115;
    const enemySpacingY = 72;

    battle.enemies.forEach((enemy, index) => {
      let x = enemyBaseX;
      let y = enemyBaseY + index * enemySpacingY;
      if (enemy.isBoss) {
        x = enemyBaseX - 30;
        y = enemyBaseY + 55;
      }
      enemy.screenX = x;
      enemy.screenY = y;

      const isTargeted = (battle.state === 'HERO_SELECT_TARGET' && battle.currentAction.targetType.includes('enemy') && battle.selectedTargetIndex === index);

      this.spriteManager.drawCharacter(ctx, enemy, x, y, isTargeted, false, time);

      // Enemy Name & HP Bar
      if (enemy.isAlive()) {
        ctx.fillStyle = '#f8fafc';
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillText(enemy.name, x - 45, y - 36);

        // HP Bar
        const barWidth = 85;
        const hpPercent = Math.max(0, enemy.currentHp / enemy.maxHp);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 42, y - 30, barWidth, 6);
        ctx.fillStyle = hpPercent > 0.3 ? '#ef4444' : '#dc2626';
        ctx.fillRect(x - 42, y - 30, barWidth * hpPercent, 6);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 42, y - 30, barWidth, 6);
      }
    });
  }

  // Bottom Box Split: Left = Actions / Submenus | Right = Party Status
  renderBottomHUD(ctx, battle, width, height, time) {
    const hudY = height - 204;
    const hudHeight = 196;
    const leftWidth = 330;
    const rightWidth = width - leftWidth - 20;

    // LEFT BOX: Action Menu / Submenu
    this.drawClassicBox(ctx, 8, hudY, leftWidth, hudHeight);
    
    // RIGHT BOX: Party Status
    this.drawClassicBox(ctx, leftWidth + 12, hudY, rightWidth, hudHeight);

    // RENDER LEFT BOX CONTENT
    if (battle.state === 'HERO_SELECT_SUBMENU') {
      this.renderSubmenu(ctx, battle, 18, hudY + 16, leftWidth - 20);
    } else {
      this.renderCommandMenu(ctx, battle, 20, hudY + 20, leftWidth - 24);
    }

    // RENDER RIGHT BOX CONTENT: Party Status Window
    this.renderPartyStatus(ctx, battle, leftWidth + 24, hudY + 20, rightWidth - 24);
  }

  // Helper: truncate string to fit pixel width
  truncateText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let truncated = text;
    while (truncated.length > 0 && ctx.measureText(truncated + '...').width > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
  }

  // 4 Main Commands Menu (Atacar, Magia, Item, Defender)
  renderCommandMenu(ctx, battle, x, y, width) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('MENU DE AÇÕES', x, y);

    const activeHero = battle.heroes[battle.activeHeroIndex];
    if (activeHero && activeHero.isAlive()) {
      ctx.fillStyle = '#ffd166';
      ctx.fillText(`[${activeHero.name}]`, x + 148, y);
    }

    const commands = [
      { name: 'Atacar',  x: x + 20, y: y + 44, idx: 0 },
      { name: 'Magia',   x: x + 172, y: y + 44, idx: 1 },
      { name: 'Item',    x: x + 20, y: y + 94, idx: 2 },
      { name: 'Defender',x: x + 172, y: y + 94, idx: 3 }
    ];

    commands.forEach(cmd => {
      const isSelected = (battle.state === 'HERO_SELECT_COMMAND' && battle.selectedActionIndex === cmd.idx);
      ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(cmd.name, cmd.x, cmd.y);

      if (isSelected) {
        ctx.fillStyle = '#facc15';
        ctx.fillText('▶', cmd.x - 16, cmd.y);
      }
    });

    // Control hint
    ctx.fillStyle = '#64748b';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('[Z] Confirmar  [X] Voltar', x, y + 140);
  }

  // Submenu for Skills and Items
  renderSubmenu(ctx, battle, x, y, width) {
    const activeHero = battle.heroes[battle.activeHeroIndex];
    const isSkillMenu = (battle.selectedActionIndex === 1);
    const title = isSkillMenu ? `SKILLS: ${activeHero.name}` : 'ITENS DA CONVENÇÃO';
    
    ctx.fillStyle = '#ffd166';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(title, x, y);

    const list = isSkillMenu ? activeHero.skills : battle.items;
    const startY = y + 22;
    const rowHeight = 24;
    const mpColX = x + width - 52; // Fixed MP cost column right-aligned

    list.forEach((item, idx) => {
      const isSelected = (battle.selectedSubIndex === idx);
      const itemY = startY + idx * rowHeight;
      const maxLabelWidth = isSkillMenu ? (mpColX - x - 28) : (width - 22);

      ctx.font = '10px "Press Start 2P", monospace';
      const rawLabel = isSkillMenu ? item.name : `${item.name} x${item.count}`;
      const label = this.truncateText(ctx, rawLabel, maxLabelWidth);

      ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
      ctx.fillText(label, x + 20, itemY);

      if (isSkillMenu) {
        ctx.fillStyle = activeHero.currentMp >= item.mpCost ? '#38bdf8' : '#ef4444';
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillText(`${item.mpCost}MP`, mpColX, itemY);
      }

      if (isSelected) {
        ctx.fillStyle = '#facc15';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('▶', x + 4, itemY);
      }
    });

    // Description - word-wrap to two lines within box
    const currentItem = list[battle.selectedSubIndex];
    if (currentItem && currentItem.description) {
      const descMaxW = width - 4;
      ctx.fillStyle = '#38bdf8';
      ctx.font = '7px "Press Start 2P", monospace';
      const desc = currentItem.description;
      const line1 = this.truncateText(ctx, desc, descMaxW);
      ctx.fillText(line1, x, y + 148);
      if (line1 !== desc) {
        const rest = desc.slice(line1.length - 3).trim();
        ctx.fillText(this.truncateText(ctx, rest, descMaxW), x, y + 160);
      }
    }
  }

  // Right Box: Party Status with HP/MP columns
  renderPartyStatus(ctx, battle, x, y, width) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('STATUS DO TIME', x, y);

    const startY = y + 24;
    const rowHeight = 36;

    // Column X positions, keeping all text inside the box
    const nameW = 110;
    const hpX = x + nameW + 4;
    const mpX = hpX + 130;
    const buffX = mpX + 108;

    battle.heroes.forEach((hero, index) => {
      const heroY = startY + index * rowHeight;
      const isActive = (battle.state.startsWith('HERO') && battle.activeHeroIndex === index);

      // Hero Name (fixed width, truncated)
      ctx.fillStyle = hero.currentHp <= 0 ? '#64748b' : (isActive ? '#ffd166' : '#ffffff');
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText(hero.name.substring(0, 9), x, heroY);

      if (hero.currentHp <= 0) {
        ctx.fillStyle = '#ef4444';
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillText('[KO]', hpX, heroY);
        return;
      }

      // HP
      ctx.fillStyle = hero.currentHp / hero.maxHp < 0.25 ? '#ef4444' : '#ffffff';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText(`${hero.currentHp}/${hero.maxHp}HP`, hpX, heroY);

      // MP
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${hero.currentMp}/${hero.maxMp}MP`, mpX, heroY);

      // Status buff tag (first one only, 4 chars max)
      if (hero.buffs.length > 0) {
        const tag = hero.buffs[0].tag.substring(0, 5);
        ctx.fillStyle = hero.buffs[0].color || '#38bdf8';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText(tag, buffX, heroY);
      }
    });
  }

  // Top Combat Log / Dialog Banner (auto-truncates to fit)
  renderTopBanner(ctx, battle, width, height, time) {
    const bannerHeight = 44;
    this.drawClassicBox(ctx, 8, 8, width - 16, bannerHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    const maxLogWidth = width - 52;
    ctx.fillText(this.truncateText(ctx, battle.combatLog, maxLogWidth), 22, 34);
  }


  // Floating Combat Damage / Heal numbers
  renderDamagePopups(ctx, battle) {
    battle.damagePopups.forEach(popup => {
      if (!popup.target) return;
      ctx.save();
      ctx.globalAlpha = popup.opacity;
      ctx.fillStyle = popup.color;
      ctx.font = 'bold 13px "Press Start 2P", monospace';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(popup.text, popup.target.screenX - 20, popup.target.screenY + popup.yOffset - 40);
      ctx.restore();
    });
  }

  // Classic Final Fantasy Blue Gradient Window
  drawClassicBox(ctx, x, y, width, height) {
    ctx.save();
    // Blue Gradient Background
    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, '#001a66');
    grad.addColorStop(0.5, '#001040');
    grad.addColorStop(1, '#000820');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, width, height);

    // Double Border (Classic FF)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);

    ctx.strokeStyle = '#5588cc';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 4, width - 8, height - 8);
    ctx.restore();
  }

  // Title Screen (Scaled for 800x600)
  renderTitleScreen(ctx, width, height, time) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.textAlign = 'center';
    
    ctx.fillStyle = '#ffd166';
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.shadowColor = '#d97706';
    ctx.shadowBlur = 16;
    ctx.fillText('COSPLAY PROTOCOL', width / 2, height * 0.26);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 10;
    ctx.fillText('★ SAVE THE RPG ★', width / 2, height * 0.35);
    ctx.restore();

    // Chibi Heroes Showcase on Title
    const demoY = height * 0.52;
    this.spriteManager.drawPaladinChibi(ctx, width * 0.30, demoY, 0, false);
    this.spriteManager.drawBarbarianChibi(ctx, width * 0.43, demoY, 0);
    this.spriteManager.drawMageChibi(ctx, width * 0.57, demoY, 0, time);
    this.spriteManager.drawPriestessChibi(ctx, width * 0.70, demoY, 0, time);

    // Story prompt
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Fiscais invadiram a convenção para banir os RPGs!', width / 2, height * 0.68);
    ctx.fillText('Cosplayers: encarnem suas fantasias e salvem o evento!', width / 2, height * 0.73);

    // Blinking Press Z to Start
    const blink = Math.floor(time * 0.003) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '13px "Press Start 2P", monospace';
      ctx.fillText('▶ PRESSIONE [Z] PARA INICIAR ◀', width / 2, height * 0.86);
    }
  }

  // Victory Fanfare Screen
  renderVictoryScreen(ctx, width, height, time) {
    this.drawClassicBox(ctx, width * 0.12, height * 0.22, width * 0.76, height * 0.55);
    ctx.textAlign = 'center';

    ctx.fillStyle = '#facc15';
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 10;
    ctx.fillText('★ VITÓRIA! ★', width / 2, height * 0.36);

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillText('A Convenção e os RPGs foram salvos!', width / 2, height * 0.47);
    ctx.fillText('+999 EXP | +500 Ouro de Convenção', width / 2, height * 0.56);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText('Pressione [Z] para Jogar Novamente', width / 2, height * 0.67);
  }

  // Game Over Screen
  renderGameOverScreen(ctx, width, height, time) {
    this.drawClassicBox(ctx, width * 0.12, height * 0.22, width * 0.76, height * 0.55);
    ctx.textAlign = 'center';

    ctx.fillStyle = '#ef4444';
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 10;
    ctx.fillText('GAME OVER', width / 2, height * 0.36);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('A convenção foi interditada pela fiscalização...', width / 2, height * 0.48);

    ctx.fillStyle = '#ffd166';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText('Pressione [Z] para Tentar Novamente', width / 2, height * 0.63);
  }
}

window.UIRenderer = UIRenderer;
