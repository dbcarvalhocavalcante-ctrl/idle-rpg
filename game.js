// ==========================================
// IDLE RPG - SISTEMA PRINCIPAL
// ==========================================

const SAVE_KEY = "idleRPG_save_v2";

let player = {
    level: 1,
    xp: 0,
    gold: 0,
    maxHp: 100,
    hp: 100,
    damage: 10,
    phase: 1
};

let enemy = null;
let battleActive = false;
let battleTimer = null;


// ==========================================
// ELEMENTOS
// ==========================================

const goldElement = document.getElementById("gold");
const xpElement = document.getElementById("xp");
const levelElement = document.getElementById("level");

const playerHpElement = document.getElementById("playerHp");
const enemyHpElement = document.getElementById("enemyHp");

const playerHealthBar = document.getElementById("playerHealth");
const enemyHealthBar = document.getElementById("enemyHealth");

const messageElement = document.getElementById("message");

const startButton = document.getElementById("startButton");

const enemyNameElement = document.getElementById("enemyName");


// ==========================================
// FASE
// ==========================================

const statsContainer = document.querySelector(".stats");

const phaseContainer = document.createElement("span");

phaseContainer.innerHTML = "🗺️ Fase: <b id='phase'>1</b>";

statsContainer.appendChild(phaseContainer);

const phaseElement = document.getElementById("phase");


// ==========================================
// INIMIGOS
// ==========================================

const enemyTypes = [
    {
        name: "Goblin",
        baseHp: 50,
        baseDamage: 5,
        baseGold: 10,
        baseXp: 20
    },
    {
        name: "Orc",
        baseHp: 80,
        baseDamage: 8,
        baseGold: 18,
        baseXp: 35
    },
    {
        name: "Troll",
        baseHp: 120,
        baseDamage: 12,
        baseGold: 30,
        baseXp: 50
    },
    {
        name: "Demônio",
        baseHp: 180,
        baseDamage: 18,
        baseGold: 50,
        baseXp: 80
    }
];


// ==========================================
// CRIAR INIMIGO
// ==========================================

function createEnemy() {

    const phase = player.phase;

    const isBoss = phase % 10 === 0;

    if (isBoss) {

        const hp = Math.floor(
            300 * Math.pow(1.18, phase / 10 - 1)
        );

        const damage = Math.floor(
            25 * Math.pow(1.15, phase / 10 - 1)
        );

        const gold = Math.floor(
            150 * Math.pow(1.20, phase / 10 - 1)
        );

        const xp = Math.floor(
            250 * Math.pow(1.20, phase / 10 - 1)
        );

        enemy = {
            name: "👑 BOSS - Rei Demônio",
            maxHp: hp,
            hp: hp,
            damage: damage,
            rewardGold: gold,
            rewardXp: xp,
            boss: true
        };

    } else {

        const index = Math.min(
            Math.floor((phase - 1) / 3),
            enemyTypes.length - 1
        );

        const type = enemyTypes[index];

        const multiplier = Math.pow(
            1.12,
            phase - 1
        );

        const hp = Math.floor(
            type.baseHp * multiplier
        );

        enemy = {
            name: type.name,
            maxHp: hp,
            hp: hp,
            damage: Math.floor(
                type.baseDamage * multiplier
            ),
            rewardGold: Math.floor(
                type.baseGold * multiplier
            ),
            rewardXp: Math.floor(
                type.baseXp * multiplier
            ),
            boss: false
        };
    }

    updateScreen();
}


// ==========================================
// ATUALIZAR TELA
// ==========================================

function updateScreen() {

    if (!enemy) return;

    goldElement.textContent = Math.floor(player.gold);

    xpElement.textContent = Math.floor(player.xp);

    levelElement.textContent = player.level;

    phaseElement.textContent = player.phase;

    playerHpElement.textContent =
        Math.max(0, Math.floor(player.hp));

    enemyHpElement.textContent =
        Math.max(0, Math.floor(enemy.hp));

    playerHealthBar.style.width =
        Math.max(
            0,
            (player.hp / player.maxHp) * 100
        ) + "%";

    enemyHealthBar.style.width =
        Math.max(
            0,
            (enemy.hp / enemy.maxHp) * 100
        ) + "%";

    enemyNameElement.textContent = enemy.name;
}


// ==========================================
// SALVAR
// ==========================================

function saveGame() {

    try {

        const saveData = {
            player: player,
            savedAt: Date.now()
        };

        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(saveData)
        );

    } catch (error) {

        console.error("Erro ao salvar:", error);
    }
}


// ==========================================
// CARREGAR
// ==========================================

function loadGame() {

    try {

        const saved = localStorage.getItem(SAVE_KEY);

        if (saved) {

            const data = JSON.parse(saved);

            if (data.player) {

                player = {
                    ...player,
                    ...data.player
                };
            }
        }

    } catch (error) {

        console.error("Erro ao carregar:", error);
    }

    createEnemy();

    messageElement.textContent =
        savedExists()
            ? "💾 Progresso carregado!"
            : "Prepare-se para a batalha!";
}


// ==========================================
// VERIFICAR SAVE
// ==========================================

function savedExists() {

    try {

        return localStorage.getItem(SAVE_KEY) !== null;

    } catch (error) {

        return false;
    }
}


// ==========================================
// INICIAR BATALHA
// ==========================================

function startBattle() {

    if (battleActive) {
        return;
    }

    if (!enemy) {
        createEnemy();
    }

    battleActive = true;

    startButton.disabled = true;

    startButton.textContent =
        "⚔️ Lutando...";

    messageElement.textContent =
        "⚔️ A batalha começou!";

    battleTimer = setInterval(
        battleRound,
        1000
    );
}


// ==========================================
// RODADA
// ==========================================

function battleRound() {

    if (!battleActive || !enemy) {
        return;
    }

    // HERÓI ATACA
    enemy.hp -= player.damage;

    // INIMIGO MORRE
    if (enemy.hp <= 0) {

        enemy.hp = 0;

        updateScreen();

        enemyDefeated();

        return;
    }

    // INIMIGO ATACA
    player.hp -= enemy.damage;

    // HERÓI MORRE
    if (player.hp <= 0) {

        player.hp = 0;

        updateScreen();

        playerDefeated();

        return;
    }

    messageElement.textContent =
        "⚔️ Você causou " +
        player.damage +
        " de dano!";

    updateScreen();

    saveGame();
}


// ==========================================
// INIMIGO DERROTADO
// ==========================================

function enemyDefeated() {

    clearInterval(battleTimer);

    battleTimer = null;

    battleActive = false;

    player.gold += enemy.rewardGold;

    player.xp += enemy.rewardXp;

    if (enemy.boss) {

        messageElement.textContent =
            "👑 BOSS DERROTADO! +" +
            enemy.rewardGold +
            " ouro!";

    } else {

        messageElement.textContent =
            "🎉 " +
            enemy.name +
            " derrotado! +" +
            enemy.rewardGold +
            " ouro!";
    }

    checkLevelUp();

    player.phase++;

    player.hp = player.maxHp;

    saveGame();

    updateScreen();

    startButton.textContent =
        "⏳ Próxima batalha...";

    startButton.disabled = true;

    setTimeout(function () {

        createEnemy();

        startButton.disabled = false;

        startButton.textContent =
            "⚔️ Próxima batalha";

    }, 1200);
}


// ==========================================
// JOGADOR DERROTADO
// ==========================================

function playerDefeated() {

    clearInterval(battleTimer);

    battleTimer = null;

    battleActive = false;

    player.hp = player.maxHp;

    messageElement.textContent =
        "💀 Você foi derrotado!";

    startButton.disabled = false;

    startButton.textContent =
        "🔄 Tentar novamente";

    saveGame();

    updateScreen();
}


// ==========================================
// LEVEL UP
// ==========================================

function checkLevelUp() {

    let requiredXp =
        player.level * 100;

    let leveledUp = false;

    while (player.xp >= requiredXp) {

        player.xp -= requiredXp;

        player.level++;

        player.maxHp += 20;

        player.damage += 5;

        player.hp = player.maxHp;

        requiredXp =
            player.level * 100;

        leveledUp = true;
    }

    if (leveledUp) {

        messageElement.textContent =
            "🎉 LEVEL UP! Nível " +
            player.level + "!";
    }
}


// ==========================================
// SALVAMENTO AUTOMÁTICO
// ==========================================

window.addEventListener(
    "beforeunload",
    function () {
        saveGame();
    }
);

document.addEventListener(
    "visibilitychange",
    function () {

        if (document.visibilityState === "hidden") {
            saveGame();
        }
    }
);


// ==========================================
// BOTÃO
// ==========================================

if (startButton) {

    startButton.addEventListener(
        "click",
        function () {
            startBattle();
        }
    );

} else {

    console.error(
        "ERRO: botão startButton não encontrado."
    );
}


// ==========================================
// INICIAR JOGO
// ==========================================

loadGame();
