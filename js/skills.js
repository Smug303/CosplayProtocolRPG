// =============================================================================
// Cosplay Protocol: Save the RPG - Database of Heroes, Enemies, Skills and Items
// Complete stats, expanded skills database (4+ skills per hero) and item effects
// =============================================================================

const HEROES_DATA = [
  {
    id: 'paladin',
    name: 'Paladino',
    role: 'Vanguarda / Tank',
    description: 'Armadura de EVA prateada e escudo de papelão.',
    maxHp: 110,
    currentHp: 110,
    maxMp: 30,
    currentMp: 30,
    atk: 14,
    def: 18,
    matk: 8,
    speed: 10,
    isHero: true,
    skills: [
      {
        id: 'taunt',
        name: 'Taunt',
        mpCost: 10,
        targetType: 'self',
        description: 'Atrai 100% dos ataques dos fiscais por 2 turnos.',
        sfx: 'playBuff',
        execute: (user, target, battle) => {
          user.addBuff('TAUNT', 2, '#38bdf8', { isTaunt: true });
          return `${user.name} ativou Taunt! Fiscais burocratas só atacarão o Paladino!`;
        }
      },
      {
        id: 'escudo_improvisado',
        name: 'Escudo Improvisado',
        mpCost: 8,
        targetType: 'self',
        description: 'Reduz todo o dano recebido em 50% por 2 turnos.',
        sfx: 'playShieldBash',
        execute: (user, target, battle) => {
          user.addBuff('ESCUDO', 2, '#60a5fa', { damageReduction: 0.5 });
          return `${user.name} ergueu o Escudo de Papelão! Dano reduzido em 50%!`;
        }
      },
      {
        id: 'pancada_escudo',
        name: 'Pancada c/ Escudo',
        mpCost: 12,
        targetType: 'single_enemy',
        description: 'Golpe baseado na DEF com 50% de chance de Stun no alvo.',
        sfx: 'playShieldBash',
        execute: (user, target, battle) => {
          const dmg = Math.max(5, Math.floor(user.def * 1.8 + Math.random() * 8 - target.getEffectiveDef() * 0.4));
          target.takeDamage(dmg);
          let extra = '';
          if (Math.random() < 0.5) {
            target.addBuff('STUN', 1, '#facc15', { isStunned: true });
            extra = ' e ATORDOU o fiscal!';
          }
          return `${user.name} golpeou com o Escudo causando ${dmg} de dano${extra}`;
        }
      },
      {
        id: 'intervencao_heroica',
        name: 'Intervenção Heróica',
        mpCost: 15,
        targetType: 'single_ally',
        description: 'Protege um aliado com barreira e cura 30 HP dele.',
        sfx: 'playHeal',
        execute: (user, target, battle) => {
          const heal = 30;
          target.healHp(heal);
          target.addBuff('DEF+', 2, '#34d399', { defMultiplier: 1.4 });
          return `${user.name} protegeu ${target.name}, curando ${heal} HP e +40% DEF!`;
        }
      }
    ]
  },
  {
    id: 'barbarian',
    name: 'Bárbaro',
    role: 'DPS Físico',
    description: 'Espada gigante de espuma e fúria de convenção.',
    maxHp: 130,
    currentHp: 130,
    maxMp: 20,
    currentMp: 20,
    atk: 26,
    def: 9,
    matk: 5,
    speed: 12,
    isHero: true,
    skills: [
      {
        id: 'golpe_pesado',
        name: 'Golpe Pesado',
        mpCost: 6,
        targetType: 'single_enemy',
        description: 'Ataque maciço com 2.2x de dano de espada de espuma.',
        sfx: 'playHeavyHit',
        execute: (user, target, battle) => {
          const baseAtk = user.getEffectiveAtk() * 2.2;
          const dmg = Math.max(10, Math.floor(baseAtk + Math.random() * 10 - target.getEffectiveDef() * 0.5));
          target.takeDamage(dmg);
          return `${user.name} desferiu um Golpe Pesado devastador de ${dmg} de dano!`;
        }
      },
      {
        id: 'furia_convencao',
        name: 'Fúria de Convenção',
        mpCost: 8,
        targetType: 'self',
        description: '+45% ATK por 3 turnos (-10% DEF).',
        sfx: 'playBuff',
        execute: (user, target, battle) => {
          user.addBuff('FÚRIA', 3, '#f97316', { atkMultiplier: 1.45, defMultiplier: 0.9 });
          return `${user.name} entrou em Fúria de Convenção! ATK aumentou em +45%!`;
        }
      },
      {
        id: 'giro_espuma',
        name: 'Giro de Espuma',
        mpCost: 14,
        targetType: 'all_enemies',
        description: 'Gira a espada colossal atingindo todos os burocratas.',
        sfx: 'playSwordSlash',
        execute: (user, targets, battle) => {
          let totalDmg = 0;
          targets.forEach(t => {
            if (t.isAlive()) {
              const dmg = Math.max(8, Math.floor(user.getEffectiveAtk() * 1.3 + Math.random() * 6 - t.getEffectiveDef() * 0.4));
              t.takeDamage(dmg);
              totalDmg += dmg;
            }
          });
          return `${user.name} girou a Espada de Espuma acertando todos os burocratas!`;
        }
      },
      {
        id: 'grito_guerra',
        name: 'Grito de Guerra',
        mpCost: 10,
        targetType: 'all_enemies',
        description: 'Intimida os fiscais burocratas: -20% ATK e DEF por 2 turnos.',
        sfx: 'playDebuff',
        execute: (user, targets, battle) => {
          targets.forEach(t => {
            if (t.isAlive()) {
              t.addBuff('MEDO', 2, '#a855f7', { atkMultiplier: 0.8, defMultiplier: 0.8 });
            }
          });
          return `${user.name} soltou um Grito Intimidador! Fiscais perderam 20% ATK e DEF!`;
        }
      }
    ]
  },
  {
    id: 'mage',
    name: 'Arquimaga',
    role: 'DPS Elemental',
    description: 'Túnica mística e cajado com LED de alta potência.',
    maxHp: 65,
    currentHp: 65,
    maxMp: 90,
    currentMp: 90,
    atk: 7,
    def: 6,
    matk: 30,
    speed: 11,
    isHero: true,
    skills: [
      {
        id: 'fireball',
        name: 'Fireball',
        mpCost: 18,
        targetType: 'all_enemies',
        description: 'Esfera de fogo místico que atinge todos os inimigos.',
        sfx: 'playFireball',
        execute: (user, targets, battle) => {
          let extraMult = user.hasBuff('LED_OVERLOAD') ? 1.6 : 1.0;
          user.removeBuff('LED_OVERLOAD');
          targets.forEach(t => {
            if (t.isAlive()) {
              const dmg = Math.max(12, Math.floor(user.matk * 1.4 * extraMult + Math.random() * 8 - t.getEffectiveDef() * 0.3));
              t.takeDamage(dmg);
            }
          });
          return `${user.name} conjurou Fireball em área explodindo os fiscais!`;
        }
      },
      {
        id: 'thunder',
        name: 'Thunder',
        mpCost: 14,
        targetType: 'single_enemy',
        description: 'Relâmpago concentrado em alvo único de alto poder.',
        sfx: 'playThunder',
        execute: (user, target, battle) => {
          let extraMult = user.hasBuff('LED_OVERLOAD') ? 1.6 : 1.0;
          user.removeBuff('LED_OVERLOAD');
          const dmg = Math.max(18, Math.floor(user.matk * 2.4 * extraMult + Math.random() * 12 - target.getEffectiveDef() * 0.3));
          target.takeDamage(dmg);
          return `${user.name} invocou Thunder eletrocutando o fiscal por ${dmg} de dano!`;
        }
      },
      {
        id: 'nevasca',
        name: 'Nevasca Gelo Seco',
        mpCost: 16,
        targetType: 'all_enemies',
        description: 'Dano de gelo em área e atrasa a velocidade dos fiscais.',
        sfx: 'playIceBlizzard',
        execute: (user, targets, battle) => {
          targets.forEach(t => {
            if (t.isAlive()) {
              const dmg = Math.max(10, Math.floor(user.matk * 1.1 + Math.random() * 6 - t.getEffectiveDef() * 0.2));
              t.takeDamage(dmg);
              t.addBuff('SLOW', 2, '#38bdf8', { speedMultiplier: 0.6 });
            }
          });
          return `${user.name} cobriu a arena de Gelo Seco causando dano e Lentidão!`;
        }
      },
      {
        id: 'sobrecarga_led',
        name: 'Sobrecarga de LED',
        mpCost: 12,
        targetType: 'self',
        description: '+60% de dano na próxima magia e cega os inimigos.',
        sfx: 'playBuff',
        execute: (user, target, battle) => {
          user.addBuff('LED_OVERLOAD', 2, '#c084fc', { matkMultiplier: 1.6 });
          battle.enemies.forEach(e => {
            if (e.isAlive()) e.addBuff('CEGO', 2, '#e2e8f0', { missChance: 0.25 });
          });
          return `${user.name} sobrecarregou o LED do cajado! +60% M.DANO e fiscais ofuscados!`;
        }
      }
    ]
  },
  {
    id: 'priestess',
    name: 'Sacerdotisa',
    role: 'Curandeira / Suporte',
    description: 'Veste cerimonial e báculo curativo com bônus de buffs.',
    maxHp: 75,
    currentHp: 75,
    maxMp: 75,
    currentMp: 75,
    atk: 7,
    def: 10,
    matk: 22,
    speed: 9,
    isHero: true,
    skills: [
      {
        id: 'cura',
        name: 'Cura',
        mpCost: 12,
        targetType: 'single_ally',
        description: 'Restaura 65 HP de um aliado selecionado.',
        sfx: 'playHeal',
        execute: (user, target, battle) => {
          const heal = Math.floor(65 + user.matk * 0.5 + Math.random() * 8);
          target.healHp(heal);
          return `${user.name} canalizou Cura em ${target.name}, restaurando +${heal} HP!`;
        }
      },
      {
        id: 'reviver',
        name: 'Reviver Cosplayer',
        mpCost: 30,
        targetType: 'single_ally_dead',
        description: 'Revive um aliado caído com 50% do HP máximo.',
        sfx: 'playHeal',
        execute: (user, target, battle) => {
          if (target.isAlive()) return `${target.name} não está nocauteado!`;
          const reviveHp = Math.floor(target.maxHp * 0.5);
          target.currentHp = reviveHp;
          return `${user.name} usou Reviver! ${target.name} voltou à batalha com ${reviveHp} HP!`;
        }
      },
      {
        id: 'encaminhamento',
        name: 'Encaminhamento',
        mpCost: 10,
        targetType: 'single_ally',
        description: '+40% de DEF para um aliado por 3 turnos.',
        sfx: 'playBuff',
        execute: (user, target, battle) => {
          target.addBuff('DEF+', 3, '#10b981', { defMultiplier: 1.4 });
          return `${user.name} aplicou Encaminhamento em ${target.name} (+40% DEF)!`;
        }
      },
      {
        id: 'bencao_energetica',
        name: 'Bênção Energética',
        mpCost: 14,
        targetType: 'single_ally',
        description: 'Restaura 28 MP de um aliado à sua escolha.',
        sfx: 'playBuff',
        execute: (user, target, battle) => {
          const mpHeal = 28;
          target.healMp(mpHeal);
          return `${user.name} concedeu Bênção Energética a ${target.name} (+${mpHeal} MP)!`;
        }
      },
      {
        id: 'prece_convencao',
        name: 'Prece da Convenção',
        mpCost: 22,
        targetType: 'all_allies',
        description: 'Restaura 40 HP de todos os membros do grupo.',
        sfx: 'playHeal',
        execute: (user, targets, battle) => {
          targets.forEach(hero => {
            if (hero.isAlive()) {
              hero.healHp(40);
            }
          });
          return `${user.name} fez a Prece da Convenção! Curou +40 HP de todo o grupo!`;
        }
      }
    ]
  }
];

const ITEMS_DATA = [
  {
    id: 'energy_drink',
    name: 'Energy Drink',
    count: 3,
    targetType: 'single_ally',
    description: 'Bebida energética de convenção. Restaura 40 MP.',
    sfx: 'playBuff',
    execute: (target) => {
      target.healMp(40);
      return `Usou Energy Drink em ${target.name}! +40 MP restaurados!`;
    }
  },
  {
    id: 'silver_tape',
    name: 'Fita Silver Tape',
    count: 3,
    targetType: 'single_ally',
    description: 'Conserta qualquer cosplay quebrado. Restaura 75 HP.',
    sfx: 'playHeal',
    execute: (target) => {
      target.healHp(75);
      return `Aplicou Silver Tape em ${target.name}! +75 HP consertados!`;
    }
  },
  {
    id: 'cracha_vip',
    name: 'Crachá VIP',
    count: 1,
    targetType: 'single_ally',
    description: 'Acesso VIP total. Remove debuffs e dá imunidade por 1 turno.',
    sfx: 'playBuff',
    execute: (target) => {
      target.buffs = [];
      target.addBuff('VIP', 1, '#fbbf24', { damageReduction: 0.9 });
      return `${target.name} mostrou o Crachá VIP! Debuffs limpos e invulnerável!`;
    }
  }
];

// Enemy Database & IA
const ENEMIES_WAVE_1 = [
  {
    id: 'bureaucrat_a',
    name: 'Fiscal Burocrata A',
    maxHp: 85,
    currentHp: 85,
    maxMp: 30,
    currentMp: 30,
    atk: 14,
    def: 8,
    speed: 8,
    isHero: false,
    variant: 1
  },
  {
    id: 'bureaucrat_b',
    name: 'Fiscal Burocrata B',
    maxHp: 95,
    currentHp: 95,
    maxMp: 30,
    currentMp: 30,
    atk: 15,
    def: 9,
    speed: 9,
    isHero: false,
    variant: 2
  },
  {
    id: 'bureaucrat_c',
    name: 'Fiscal Burocrata C',
    maxHp: 80,
    currentHp: 80,
    maxMp: 30,
    currentMp: 30,
    atk: 14,
    def: 8,
    speed: 8,
    isHero: false,
    variant: 3
  }
];

const ENEMIES_WAVE_2 = [
  {
    id: 'bureaucrat_elite_1',
    name: 'Fiscal Auditor Especial',
    maxHp: 110,
    currentHp: 110,
    maxMp: 40,
    currentMp: 40,
    atk: 18,
    def: 12,
    speed: 10,
    isHero: false,
    variant: 1
  },
  {
    id: 'boss_auditor',
    name: 'Auditor Chefe da Convenção',
    maxHp: 280,
    currentHp: 280,
    maxMp: 90,
    currentMp: 90,
    atk: 24,
    def: 16,
    speed: 11,
    isHero: false,
    isBoss: true
  },
  {
    id: 'bureaucrat_elite_2',
    name: 'Fiscal de Interdição',
    maxHp: 110,
    currentHp: 110,
    maxMp: 40,
    currentMp: 40,
    atk: 18,
    def: 12,
    speed: 10,
    isHero: false,
    variant: 2
  }
];

window.HEROES_DATA = HEROES_DATA;
window.ITEMS_DATA = ITEMS_DATA;
window.ENEMIES_WAVE_1 = ENEMIES_WAVE_1;
window.ENEMIES_WAVE_2 = ENEMIES_WAVE_2;
