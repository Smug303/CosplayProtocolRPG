// =============================================================================
// Cosplay Protocol: Save the RPG - Miniature Pixel Art Sprite & Scenery Renderer
// Classic Final Fantasy (NES/SNES) style side-view chibi sprites & evacuated convention background
// =============================================================================

class SpriteManager {
  constructor() {
    this.imageCache = {};
    this.useProceduralSprites = true; // High-detail classic FF miniature pixel art
  }

  // Draw evacuated convention hall background (Optimized for 800x600)
  drawBackground(ctx, width, height, time) {
    // 1. Dark upper arena ceiling and lights
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.54);
    skyGrad.addColorStop(0, '#0a0b16');
    skyGrad.addColorStop(0.7, '#16192c');
    skyGrad.addColorStop(1, '#232742');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.54);

    // Overhead convention trusses & spotlights
    ctx.fillStyle = '#111424';
    ctx.fillRect(0, 0, width, 20);
    ctx.fillRect(60, 0, 10, 45);
    ctx.fillRect(240, 0, 10, 45);
    ctx.fillRect(400, 0, 10, 45);
    ctx.fillRect(580, 0, 10, 45);
    ctx.fillRect(740, 0, 10, 45);

    // Spotlight cones (subtle)
    ctx.save();
    ctx.globalAlpha = 0.08 + Math.sin(time * 0.002) * 0.02;
    ctx.fillStyle = '#70a5ff';
    ctx.beginPath();
    ctx.moveTo(245, 45);
    ctx.lineTo(120, height * 0.54);
    ctx.lineTo(340, height * 0.54);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ff88ff';
    ctx.beginPath();
    ctx.moveTo(585, 45);
    ctx.lineTo(480, height * 0.54);
    ctx.lineTo(700, height * 0.54);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Distant Empty Convention Stands / Booths (Evacuated)
    const standY = height * 0.26;
    
    // Stand 1 (Left - RPG Booth)
    ctx.fillStyle = '#2d3352';
    ctx.fillRect(40, standY, 180, 90);
    ctx.fillStyle = '#3f4770';
    ctx.fillRect(40, standY, 180, 18); // Table top
    // RPG Banner
    ctx.fillStyle = '#8b263e';
    ctx.fillRect(50, standY - 30, 160, 24);
    ctx.fillStyle = '#ffd166';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('RPG ADVENTURE', 60, standY - 14);
    // Overturned chair & scattered books
    ctx.fillStyle = '#1a1d2e';
    ctx.fillRect(28, standY + 55, 16, 24);
    ctx.fillStyle = '#ef476f';
    ctx.fillRect(80, standY + 5, 18, 8); // Book
    ctx.fillStyle = '#06d6a0';
    ctx.fillRect(120, standY + 4, 20, 9); // Book

    // Stand 2 (Center - Stage / Main Banner)
    ctx.fillStyle = '#1f2438';
    ctx.fillRect(280, standY - 20, 240, 110);
    ctx.fillStyle = '#118ab2';
    ctx.fillRect(290, standY - 48, 220, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillText('★ FANTASY CON 2026 ★', 305, standY - 30);
    // Big D20 Dice Display (Prop on floor)
    ctx.fillStyle = '#9d4edd';
    ctx.beginPath();
    ctx.moveTo(385, standY + 40);
    ctx.lineTo(405, standY + 20);
    ctx.lineTo(425, standY + 40);
    ctx.lineTo(416, standY + 62);
    ctx.lineTo(394, standY + 62);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c77dff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('20', 400, standY + 46);

    // Stand 3 (Right - Cosplay Workshop Booth)
    ctx.fillStyle = '#2d3352';
    ctx.fillRect(580, standY, 180, 90);
    ctx.fillStyle = '#3f4770';
    ctx.fillRect(580, standY, 180, 18);
    // Banner
    ctx.fillStyle = '#4361ee';
    ctx.fillRect(590, standY - 30, 160, 24);
    ctx.fillStyle = '#ffbe0b';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('COSPLAY ZONE', 612, standY - 14);
    // Crafting foam roll prop
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(620, standY + 5, 24, 8);

    // Caution / Hazard Tape hanging on stands (Evacuation & Bureaucrat Interdiction)
    ctx.save();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.moveTo(20, standY + 40);
    ctx.lineTo(250, standY + 60);
    ctx.moveTo(550, standY + 55);
    ctx.lineTo(780, standY + 35);
    ctx.stroke();
    ctx.restore();

    // 3. Lower Convention Floor (Perspective Grid Tiles)
    const floorY = height * 0.42;
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, height);
    floorGrad.addColorStop(0, '#1c2237');
    floorGrad.addColorStop(1, '#0e111d');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, width, height - floorY);

    // Floor tile grid lines (retro perspective)
    ctx.strokeStyle = '#283250';
    ctx.lineWidth = 1.5;
    for (let y = floorY; y < height; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    // Vertical perspective lines
    const vanishX = width / 2;
    for (let x = -100; x <= width + 100; x += 75) {
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(vanishX + (x - vanishX) * 0.35, floorY);
      ctx.stroke();
    }

    // Scattered papers / flyers on floor from evacuation
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(150, floorY + 20, 8, 5);
    ctx.fillRect(350, floorY + 35, 7, 5);
    ctx.fillRect(620, floorY + 16, 9, 6);
    ctx.fillRect(450, floorY + 55, 8, 6);

    // Yellow Caution Tape on floor
    ctx.save();
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(250, floorY + 90);
    ctx.lineTo(550, floorY + 75);
    ctx.lineTo(550, floorY + 80);
    ctx.lineTo(250, floorY + 95);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Draw Final Fantasy style 16-bit miniature chibi characters (Scaled for 800x600)
  drawCharacter(ctx, char, x, y, isTargeted, isActing, time) {
    ctx.save();

    // Scale chibi sprites by 1.25 for sharp presence in 800x600
    ctx.translate(x, y);
    ctx.scale(1.25, 1.25);

    // Calculate animation offsets
    const breathe = Math.sin(time * 0.005 + (char.animOffset || 0)) * 1.5;
    let drawX = 0;
    let drawY = breathe;

    // Step forward when acting (Final Fantasy signature step)
    if (isActing) {
      drawX += char.isHero ? 25 : -25;
    }

    // Recoil when taking damage
    if (char.hitTimer > 0) {
      drawX += (char.isHero ? -8 : 8) * (char.hitTimer / 20);
      ctx.filter = 'brightness(2.5) contrast(1.5)';
    }

    // Defeated / KO Pose
    if (char.currentHp <= 0) {
      this.drawDeadChibi(ctx, char, drawX, drawY + 12);
      ctx.restore();
      return;
    }

    // Defending stance / Shield effect
    if (char.isDefending) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.arc(drawX, drawY, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hero / Enemy specific miniature sprite rendering with full fallback safety
    const id = (char.id || '').toLowerCase();
    if (id.includes('paladin')) {
      this.drawPaladinChibi(ctx, drawX, drawY, breathe, char.isDefending);
    } else if (id.includes('barbarian') || id.includes('barbaro')) {
      this.drawBarbarianChibi(ctx, drawX, drawY, breathe);
    } else if (id.includes('mage') || id.includes('maga')) {
      this.drawMageChibi(ctx, drawX, drawY, breathe, time);
    } else if (id.includes('priestess') || id.includes('sacerdotisa')) {
      this.drawPriestessChibi(ctx, drawX, drawY, breathe, time);
    } else if (id.includes('boss') || char.isBoss) {
      this.drawBossAuditor(ctx, drawX, drawY, breathe, time);
    } else {
      this.drawBureaucratChibi(ctx, drawX, drawY, breathe, char.variant);
    }

    // Active character indicator cursor (Blinking finger / arrow)
    if (isActing) {
      const arrowX = char.isHero ? drawX - 32 : drawX + 32;
      const arrowBounce = Math.sin(time * 0.01) * 3;
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      if (char.isHero) {
        ctx.moveTo(arrowX + arrowBounce, drawY - 5);
        ctx.lineTo(arrowX + arrowBounce + 10, drawY);
        ctx.lineTo(arrowX + arrowBounce, drawY + 5);
      } else {
        ctx.moveTo(arrowX - arrowBounce, drawY - 5);
        ctx.lineTo(arrowX - arrowBounce - 10, drawY);
        ctx.lineTo(arrowX - arrowBounce, drawY + 5);
      }
      ctx.closePath();
      ctx.fill();
    }

    // Target Selection Cursor (Red/Yellow reticle)
    if (isTargeted) {
      const cursorPulse = 1 + Math.sin(time * 0.015) * 0.2;
      ctx.strokeStyle = '#ef476f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(drawX, drawY - 2, 24 * cursorPulse, 0, Math.PI * 2);
      ctx.stroke();

      // Flashing pointer
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.moveTo(drawX, drawY - 34 - Math.sin(time * 0.015) * 4);
      ctx.lineTo(drawX - 6, drawY - 44 - Math.sin(time * 0.015) * 4);
      ctx.lineTo(drawX + 6, drawY - 44 - Math.sin(time * 0.015) * 4);
      ctx.closePath();
      ctx.fill();
    }

    // Status condition badges over head
    this.drawStatusBadges(ctx, char, drawX, drawY - 36);

    ctx.restore();
  }

  // --- Chibi Miniature Heroes (Final Fantasy Style) ---

  // 1. PALADIN (Silver EVA Armor, Cardboard Shield, Silver Blade)
  drawPaladinChibi(ctx, x, y, breathe, isDefending) {
    this.drawShadow(ctx, x, y + 20, 16);

    // Cape (Red with ragged bottom)
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(x - 12, y - 6, 8, 22);

    // Legs / Boots (Silver EVA greaves)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x - 6, y + 10, 5, 10);
    ctx.fillRect(x + 2, y + 10, 5, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x - 7, y + 16, 7, 5);
    ctx.fillRect(x + 1, y + 16, 7, 5);

    // Torso (EVA armor + Royal Blue tabard)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x - 8, y - 6, 17, 18);
    ctx.fillStyle = '#1d4ed8'; // Blue tabard
    ctx.fillRect(x - 4, y - 4, 9, 15);
    ctx.fillStyle = '#facc15'; // Gold lion emblem cross
    ctx.fillRect(x - 2, y - 1, 5, 2);
    ctx.fillRect(x - 1, y - 3, 3, 6);

    // Helmet & Head (EVA Knight helm with visor opening)
    ctx.fillStyle = '#cbd5e1'; // Silver Helmet
    ctx.fillRect(x - 8, y - 22, 17, 16);
    ctx.fillStyle = '#334155'; // Visor shadow
    ctx.fillRect(x - 4, y - 16, 12, 6);
    // Face peek (Eyes & friendly smile)
    ctx.fillStyle = '#fcd34d'; // Skin
    ctx.fillRect(x - 3, y - 15, 10, 5);
    ctx.fillStyle = '#1e293b'; // Eye
    ctx.fillRect(x + 2, y - 14, 2, 2);
    // Helmet Plume / Crest (Navy & Gold)
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(x - 4, y - 26, 8, 5);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x - 1, y - 28, 3, 3);

    // Left Arm + Cardboard Shield (Brown corrugated texture)
    const shieldX = isDefending ? x + 6 : x + 8;
    const shieldY = isDefending ? y - 12 : y - 6;
    ctx.fillStyle = '#b45309'; // Cardboard brown
    ctx.fillRect(shieldX, shieldY, 11, 20);
    ctx.fillStyle = '#d97706'; // Shield inner
    ctx.fillRect(shieldX + 2, shieldY + 2, 7, 16);
    ctx.fillStyle = '#2563eb'; // Blue tape cross on shield
    ctx.fillRect(shieldX + 1, shieldY + 8, 9, 4);
    ctx.fillRect(shieldX + 4, shieldY + 3, 3, 14);

    // Right Hand + Silver Sword
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x - 14, y - 4, 5, 5); // Hand
    ctx.fillStyle = '#38bdf8'; // Sword blade
    ctx.fillRect(x - 12, y - 18, 3, 15);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x - 11, y - 18, 1, 15);
    ctx.fillStyle = '#facc15'; // Hilt
    ctx.fillRect(x - 15, y - 3, 7, 2);
  }

  // 2. BARBARIAN (Wild Anime Spiky Hair, Giant Foam Buster Sword, Leather Straps)
  drawBarbarianChibi(ctx, x, y, breathe) {
    this.drawShadow(ctx, x, y + 20, 16);

    // Giant Blue Foam Sword on Back/Hand
    ctx.fillStyle = '#38bdf8'; // Foam blade
    ctx.fillRect(x - 18, y - 26, 7, 34);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x - 18, y - 26, 2, 34);
    ctx.fillStyle = '#cbd5e1'; // Sword edge
    ctx.fillRect(x - 12, y - 26, 2, 34);
    ctx.fillStyle = '#475569'; // Crossguard
    ctx.fillRect(x - 20, y + 8, 11, 3);
    ctx.fillStyle = '#78350f'; // Grip
    ctx.fillRect(x - 16, y + 11, 3, 7);

    // Fur Boots & Legs
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 6, y + 10, 5, 10);
    ctx.fillRect(x + 2, y + 10, 5, 10);
    ctx.fillStyle = '#d97706'; // Fur cuffs
    ctx.fillRect(x - 7, y + 8, 6, 4);
    ctx.fillRect(x + 1, y + 8, 6, 4);

    // Muscular Torso & Faux-Leather Kilt
    ctx.fillStyle = '#fcd34d'; // Muscular skin
    ctx.fillRect(x - 7, y - 6, 15, 14);
    ctx.fillStyle = '#78350f'; // Leather harness straps
    ctx.fillRect(x - 7, y - 4, 3, 12);
    ctx.fillRect(x + 5, y - 4, 3, 12);
    ctx.fillStyle = '#451a03'; // Kilt
    ctx.fillRect(x - 7, y + 5, 15, 5);
    ctx.fillStyle = '#b45309'; // Fur pauldron on left shoulder
    ctx.fillRect(x + 6, y - 8, 6, 7);

    // Head & Wild Orange Spiky Hair
    ctx.fillStyle = '#fcd34d'; // Face
    ctx.fillRect(x - 6, y - 18, 13, 12);
    // Fierce Eyes & Grin
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 1, y - 13, 3, 2);
    ctx.fillStyle = '#dc2626'; // Red Headband
    ctx.fillRect(x - 7, y - 17, 15, 3);

    // Wild Orange Hair spikes
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(x - 10, y - 25, 6, 9);
    ctx.fillRect(x - 5, y - 28, 7, 11);
    ctx.fillRect(x + 1, y - 27, 8, 10);
    ctx.fillRect(x + 6, y - 22, 5, 8);
    ctx.fillStyle = '#f97316'; // Highlight hair
    ctx.fillRect(x - 4, y - 26, 4, 7);
  }

  // 3. ARCHMAGE (Purple Robe, Glowing LED Staff, Mysterious Ribbon)
  drawMageChibi(ctx, x, y, breathe, time) {
    this.drawShadow(ctx, x, y + 20, 15);

    // Flowing Magenta/Purple Robe
    ctx.fillStyle = '#6b21a8'; // Dark purple robe body
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 6);
    ctx.lineTo(x + 8, y - 6);
    ctx.lineTo(x + 12, y + 20);
    ctx.lineTo(x - 12, y + 20);
    ctx.closePath();
    ctx.fill();

    // Gold decorative trims
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x - 11, y + 17, 22, 3);
    ctx.fillRect(x - 2, y - 6, 4, 23);

    // Capelet / Shoulder mantle
    ctx.fillStyle = '#9333ea';
    ctx.fillRect(x - 9, y - 7, 18, 8);

    // Head & Dark Hair
    ctx.fillStyle = '#fcd34d'; // Face
    ctx.fillRect(x - 5, y - 17, 11, 11);
    ctx.fillStyle = '#1e293b'; // Eye
    ctx.fillRect(x + 1, y - 13, 2, 2);
    ctx.fillStyle = '#4c1d95'; // Dark purple hair & ribbons
    ctx.fillRect(x - 8, y - 22, 16, 8);
    ctx.fillRect(x - 9, y - 17, 4, 14); // Hair strand
    ctx.fillRect(x + 5, y - 17, 4, 10);

    // LED Mage Staff (Pulsating glowing crystal tip)
    const staffX = x + 12;
    ctx.fillStyle = '#78350f'; // Wooden pole
    ctx.fillRect(staffX, y - 24, 3, 42);

    // LED Crystal (Pulsates with sine wave)
    const ledGlow = 0.6 + Math.sin(time * 0.008) * 0.4;
    ctx.save();
    ctx.fillStyle = `rgba(56, 189, 248, ${ledGlow})`;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(staffX + 1.5, y - 26, 6, 0, Math.PI * 2);
    ctx.fill();
    // Inner white hot LED core
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(staffX, y - 28, 3, 4);
    ctx.restore();
  }

  // 4. PRIESTESS (White & Gold Robe, Braided Hair, Golden Staff)
  drawPriestessChibi(ctx, x, y, breathe, time) {
    this.drawShadow(ctx, x, y + 20, 15);

    // White & Gold Flowing Vestments
    ctx.fillStyle = '#f8fafc'; // White dress
    ctx.beginPath();
    ctx.moveTo(x - 7, y - 6);
    ctx.lineTo(x + 7, y - 6);
    ctx.lineTo(x + 11, y + 20);
    ctx.lineTo(x - 11, y + 20);
    ctx.closePath();
    ctx.fill();

    // Gold Lace Embroidery
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x - 10, y + 17, 20, 3);
    ctx.fillRect(x - 2, y - 6, 4, 23);
    ctx.fillRect(x - 6, y + 10, 12, 2);

    // Blue/Gold Ribbon sash
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x - 6, y + 3, 12, 3);

    // Head & Long Braided Brown Hair
    ctx.fillStyle = '#fcd34d'; // Face
    ctx.fillRect(x - 5, y - 17, 11, 11);
    ctx.fillStyle = '#1e293b'; // Gentle Eye
    ctx.fillRect(x + 1, y - 13, 2, 2);
    ctx.fillStyle = '#92400e'; // Warm brown hair
    ctx.fillRect(x - 7, y - 22, 14, 7);
    ctx.fillRect(x - 8, y - 16, 4, 18); // Braid hanging down
    // Golden Tiara / Circlet
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x - 6, y - 20, 12, 3);
    ctx.fillStyle = '#38bdf8'; // Blue gem in center
    ctx.fillRect(x - 1, y - 21, 2, 3);

    // Golden PVC Holy Staff with Ring Halo
    const staffX = x + 11;
    ctx.fillStyle = '#d97706'; // Golden pole
    ctx.fillRect(staffX, y - 22, 2, 40);
    // Staff Halo Ring
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(staffX + 1, y - 24, 6, 0, Math.PI * 2);
    ctx.stroke();
    // Glowing holy orb inside ring
    ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
    ctx.beginPath();
    ctx.arc(staffX + 1, y - 24, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. BUROCRATA FISCAL (Gray Suit, Sunglasses, Clipboard, Hazard Tape)
  drawBureaucratChibi(ctx, x, y, breathe, variant) {
    this.drawShadow(ctx, x, y + 20, 16);

    // Black Shoes & Gray Slacks
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 6, y + 16, 5, 4);
    ctx.fillRect(x + 2, y + 16, 5, 4);
    ctx.fillStyle = '#475569'; // Suit pants
    ctx.fillRect(x - 6, y + 8, 5, 9);
    ctx.fillRect(x + 2, y + 8, 5, 9);

    // Gray Business Suit Jacket
    ctx.fillStyle = '#64748b'; // Gray jacket
    ctx.fillRect(x - 8, y - 6, 17, 15);
    ctx.fillStyle = '#ffffff'; // White shirt collar
    ctx.fillRect(x - 2, y - 6, 5, 7);
    ctx.fillStyle = '#dc2626'; // Red tie
    ctx.fillRect(x - 1, y - 3, 3, 8);

    // Yellow Hazard Tape wrapped across torso
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 2);
    ctx.lineTo(x + 8, y + 6);
    ctx.lineTo(x + 8, y + 9);
    ctx.lineTo(x - 8, y + 1);
    ctx.closePath();
    ctx.fill();

    // Head, Receding Gray Hair & Dark Sunglasses
    ctx.fillStyle = '#fcd34d'; // Face
    ctx.fillRect(x - 6, y - 18, 13, 12);
    ctx.fillStyle = '#94a3b8'; // Balding Gray Hair
    ctx.fillRect(x - 7, y - 21, 15, 5);
    ctx.fillRect(x + 5, y - 17, 3, 8);
    // Dark Black Sunglasses
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 5, y - 14, 11, 4);
    ctx.fillStyle = '#38bdf8'; // Glasses glare
    ctx.fillRect(x - 4, y - 13, 2, 1);
    ctx.fillRect(x + 1, y - 13, 2, 1);

    // Left Arm holding Clipboard with Fine Notice
    const clipX = x - 14;
    ctx.fillStyle = '#b45309'; // Wooden clipboard
    ctx.fillRect(clipX, y - 4, 8, 13);
    ctx.fillStyle = '#ffffff'; // Fine paper
    ctx.fillRect(clipX + 1, y - 2, 6, 9);
    ctx.fillStyle = '#dc2626'; // Red stamp on fine
    ctx.fillRect(clipX + 2, y + 2, 4, 3);
  }

  // 6. AUDITOR CHEFE (Boss - Charcoal Pinstripe Suit, Red Visor, Golden Briefcase, Giant Stamp)
  drawBossAuditor(ctx, x, y, breathe, time) {
    this.drawShadow(ctx, x, y + 24, 22);

    // Legs / Polished Black Shoes
    ctx.fillStyle = '#09090b';
    ctx.fillRect(x - 8, y + 20, 7, 5);
    ctx.fillRect(x + 2, y + 20, 7, 5);
    ctx.fillStyle = '#27272a'; // Charcoal trousers
    ctx.fillRect(x - 8, y + 10, 7, 11);
    ctx.fillRect(x + 2, y + 10, 7, 11);

    // Double Breasted Charcoal Suit with Gold Buttons
    ctx.fillStyle = '#18181b';
    ctx.fillRect(x - 11, y - 8, 23, 19);
    ctx.fillStyle = '#ffffff'; // White shirt
    ctx.fillRect(x - 3, y - 8, 7, 8);
    ctx.fillStyle = '#991b1b'; // Crimson silk tie
    ctx.fillRect(x - 2, y - 4, 5, 11);
    ctx.fillStyle = '#facc15'; // Gold cufflinks/buttons
    ctx.fillRect(x - 6, y + 2, 2, 2);
    ctx.fillRect(x + 4, y + 2, 2, 2);

    // Gold Briefcase in hand
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x + 12, y + 4, 11, 10);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 14, y + 2, 7, 3);

    // Head, Sleek Silver Hair & Glowing Red Visor
    ctx.fillStyle = '#fcd34d'; // Face
    ctx.fillRect(x - 8, y - 22, 17, 14);
    ctx.fillStyle = '#cbd5e1'; // Slicked silver hair
    ctx.fillRect(x - 9, y - 26, 19, 6);
    ctx.fillRect(x + 7, y - 22, 3, 9);

    // Menacing Glowing Red Visor / Glasses
    const redGlow = 0.8 + Math.sin(time * 0.01) * 0.2;
    ctx.save();
    ctx.fillStyle = `rgba(239, 68, 68, ${redGlow})`;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.fillRect(x - 7, y - 17, 15, 5);
    ctx.restore();

    // Giant Red "REJEITADO" (REJECTED) Stamp Weapon
    const stampX = x - 18;
    ctx.fillStyle = '#7f1d1d'; // Stamp handle
    ctx.fillRect(stampX - 2, y - 16, 5, 14);
    ctx.fillStyle = '#ef4444'; // Heavy rubber stamp block
    ctx.fillRect(stampX - 5, y - 2, 11, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(stampX - 3, y + 1, 7, 2);
  }

  // Knocked Out / Fallen Chibi Pose
  drawDeadChibi(ctx, char, x, y) {
    this.drawShadow(ctx, x, y + 6, 18);
    ctx.save();
    ctx.fillStyle = char.isHero ? '#475569' : '#334155';
    ctx.fillRect(x - 16, y - 2, 32, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x - 14, y - 8, 10, 8);
    ctx.fillStyle = '#0f172a';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText('x_x', x - 13, y - 1);
    ctx.restore();
  }

  // Ground shadow oval
  drawShadow(ctx, x, y, radius) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Status badges over character (DEF+, ATK+, TAUNT, SILENCE, STUN)
  drawStatusBadges(ctx, char, x, y) {
    if (!char.buffs || char.buffs.length === 0) return;
    let badgeX = x - (char.buffs.length * 11);
    char.buffs.forEach(buff => {
      ctx.fillStyle = buff.color || '#38bdf8';
      ctx.fillRect(badgeX, y, 20, 10);
      ctx.fillStyle = '#000000';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.fillText(buff.tag || 'UP', badgeX + 2, y + 7);
      badgeX += 22;
    });
  }
}

window.SpriteManager = SpriteManager;
