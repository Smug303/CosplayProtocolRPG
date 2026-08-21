# 🎮 Cosplay Protocol: Save the RPG

> Um RPG tático por turnos em estética retro 16-bit clássica (Final Fantasy NES/SNES) desenvolvido para navegador com zero dependências externas (`npm`), rodando nativamente via HTML5 Canvas e Web Audio API.

---

## 📖 Premissa da História
Uma convenção de cultura pop é invadida por uma organização de fiscais burocratas que tenta proibir e interditar os RPGs no mundo todo. Quatro cosplayers decidem encarnar de verdade os papéis de suas fantasias para derrotar a fiscalização, vencer o temido **Auditor Chefe** e salvar o hobby!

---

## 👥 Personagens e Habilidades

### 🛡️ O Paladino (Vanguarda / Tank)
- **Armadura de EVA prateada e escudo de papelão reforçado.**
- **Habilidades**:
  1. `Taunt` (10 MP): Atrai 100% dos ataques dos fiscais por 2 turnos.
  2. `Escudo Improvisado` (8 MP): Reduz todo dano recebido em 50% por 2 turnos.
  3. `Pancada com Escudo` (12 MP): Dano físico proporcional à DEF + 50% de chance de atordoar (*Stun*) o burocrata.
  4. `Intervenção Heróica` (15 MP): Protege um aliado com barreira e cura 30 HP dele.

### ⚔️ O Bárbaro (DPS Físico)
- **Espada gigante de espuma e traje de couro sintético.**
- **Habilidades**:
  1. `Golpe Pesado` (6 MP): Ataque devastador com 2.2x de dano físico.
  2. `Fúria de Convenção` (8 MP): +45% de ATK por 3 turnos (-10% DEF).
  3. `Giro de Espuma` (14 MP): Gira a espada colossal atingindo **todos os fiscais**.
  4. `Grito de Guerra` (10 MP): Intimida os burocratas, reduzindo ATK e DEF de todos os inimigos em 20% por 2 turnos.

### 🔮 A Arquimaga (DPS Elemental)
- **Túnica mística brilhante e cajado com LED de alta potência.**
- **Habilidades**:
  1. `Fireball` (18 MP): Esfera de fogo que explode todos os inimigos em campo.
  2. `Thunder` (14 MP): Relâmpago concentrado em alvo único com alto multiplicador mágico.
  3. `Nevasca Gelo Seco` (16 MP): Dano mágico de gelo em área e aplica *Slow* (atraso de turno).
  4. `Sobrecarga de LED` (12 MP): Aumenta a próxima magia em +60% e cega os inimigos.

### ✨ A Sacerdotisa (Suporte / Curandeira)
- **Veste cerimonial branca e dourada, báculo leve de PVC.**
- **Habilidades**:
  1. `Cura` (12 MP): Restaura 65 HP de um aliado.
  2. `Reviver` (30 MP): Revive um cosplayer nocauteado com 50% de HP.
  3. `Encaminhamento` (10 MP): Concede +40% de DEF para um aliado por 3 turnos.
  4. `Bênção Energética` (14 MP): Restaura 28 MP de um aliado.
  5. `Prece da Convenção` (22 MP): Restaura 40 HP de todos os membros do grupo simultaneamente.

---

## 🕹️ Controles do Jogo (100% Teclado)

| Tecla | Ação |
| :--- | :--- |
| **Setas ($\leftarrow \uparrow \rightarrow \downarrow$) / WASD** | Navegar pelos menus e selecionar alvos em campo |
| **Tecla Z / Enter / Espaço** | Confirmar comando, selecionar magia e avançar turno |
| **Tecla X / Esc / Backspace** | Cancelar / Voltar ao menu anterior |
| **Tecla M** | Mutar / Desmutar áudio sintetizado |
| **Tecla C** | Ligar / Desligar filtro CRT Scanlines |

---

## 🚀 Como Jogar

Como o jogo foi desenvolvido em **JavaScript Vanilla Puro + Canvas 2D + Web Audio API**, você não precisa instalar o Node.js nem rodar comandos `npm`:

1. Navegue até a pasta do projeto:
   `C:\Users\24026660\Documents\GitHub\CosplayProtocolRPG`
2. **Dê um duplo clique no arquivo `index.html`** para abrir diretamente no seu navegador favorito (Chrome, Edge, Firefox).
3. Pressione **Z** na tela inicial para iniciar a batalha e salvar a convenção!