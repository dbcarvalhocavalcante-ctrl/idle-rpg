// ==========================================
// IDLE RPG - SISTEMA PRINCIPAL
// ==========================================

// ---------- JOGADOR ----------

let player = {
    level: 1,
    xp: 0,
    gold: 0,

    maxHp: 100,
    hp: 100,

    damage: 10,

    phase: 1
};


// ---------- INIMIGO ----------

let enemy = null;


// ---------- CONTROLE ----------

let battleActive = false;
let battleTimer = null;

const SAVE_KEY = "idleRPG_save";


// ---------- ELEMENTOS DA TELA ----------

const goldElement = document.getElementById("gold");
const xpElement = document.getElementById("xp");
const levelElement = document.getElementById("level");

const playerHpElement = document.getElementById("playerHp");
const enemyHpElement = document.getElementById("enemyHp");

const playerHealthBar =
    document.getElementById("playerHealth");

const enemyHealthBar =
    document.getElementById("enemyHealth");

const messageElement =
    document.getElementById("message");

const startButton =
    document.getElementById("startButton");

const enemyNameElement =
    document.getElementById("enemyName");


// ==========================================
// CRIAR INDICADOR DE FASE
// ==========================================

const statsContainer =
    document.querySelector(".stats");

const phaseElement =
    document.createElement("span");

phaseElement.innerHTML =
    "🗺️ Fase: <b id='phase'>1</b>";

statsContainer.appendChild(phaseElement);

const phaseNumberElement =
    document.getElementById("phase");


// ==========================================
// LISTA DE INIMIGOS
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
// CRIAR INIMIGO DA FASE
// ==========================================

function createEnemy() {

    const phase = player.phase;

    // Boss a cada 10 fases
    const isBoss = phase % 10 === 0;

    if (isBoss) {

        const bossHp =
            Math.floor(300 * Math.pow(1.18, phase / 10 - 1));

        const bossDamage =
            Math.floor(25 * Math.pow(1.15, phase / 10 - 1));

        const bossGold =
            Math.floor(150 * Math.pow(1.20, phase / 10 - 1));

        const bossXp =
            Math.floor(250 * Math.pow(1.20, phase / 10 - 1));

        enemy = {
            name: "👑 BOSS - Rei Demônio",
            maxHp: bossHp,
            hp: bossHp,
            damage: bossDamage,
            rewardGold: bossGold,
            rewardXp: bossXp,
            boss: true
        };

    } else {

        const index =
            Math.min(
                Math.floor((phase - 1) / 3),
                enemyTypes.length - 1
            );

        const type = enemyTypes[index];

        const multiplier =
            Math.pow(1.12, phase - 1);

        enemy = {

            name: type.name,

            maxHp:
                Math.floor(type.baseHp * multiplier),

            hp:
                Math.floor(type.baseHp * multiplier),

            damage:
                Math.floor(type.baseDamage * multiplier),

            rewardGold:
                Math.floor(type.baseGold * multiplier),

            rewardXp:
                Math.floor(type.baseXp * multiplier),

            boss: false
        };
    }

    updateEnemyScreen();
}


// ==========================================
// ATUALIZAR INIMIGO NA TELA
// ==========================================

function updateEnemyScreen() {

    enemyNameElement.textContent =
        enemy.name;

    updateScreen();
}


// ==========================================
// ATUALIZAR TELA
// ==========================================

function updateScreen() {

    goldElement.textContent =
        Math.floor(player.gold);

    xpElement.textContent =
        Math.floor(player.xp);

    levelElement.textContent =
        player.level;

    phaseNumberElement.textContent =
        player.phase;

    playerHpElement.textContent =
        Math.max(0, Math.floor(player.hp));

    enemyHpElement.textContent =
        Math.max(0, Math.floor(enemy.hp));

    playerHealthBar.style.width =
        Math.max(
            0,
            player.hp / player.maxHp * 100
        ) + "%";

    enemyHealthBar.style.width =
        Math.max(
            0,
            enemy.hp / enemy.maxHp * 100
        ) + "%";
}


// ==========================================
// INICIAR BATALHA
// ==========================================

function startBattle() {

    if (battleActive) {
        return;
    }

    battleActive = true;

    startButton.textContent =
        "⚔️ Lutando...";

    messageElement.textContent =
        "⚔️ A batalha começou!";

    battleTimer =
        setInterval(battleRound, 1000);

}


// ==========================================
// RODADA DE COMBATE
// ==========================================

function battleRound() {

    // Herói ataca
    enemy.hp -= player.damage;

    if (enemy.hp <= 0) {

        enemyDefeated();

        return;
    }


    // Inimigo ataca
    player.hp -= enemy.damage;

    if (player.hp <= 0) {

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

    battleActive = false;


    // Recompensas
    player.gold += enemy.rewardGold;

    player.xp += enemy.rewardXp;


    if (enemy.boss) {

        messageElement.textContent =
            "👑 BOSS DERROTADO! +" +
            enemy.rewardGold +
            " ouro e +" +
            enemy.rewardXp +
            " XP!";

    } else {

        messageElement.textContent =
            "🎉 " +
            enemy.name +
            " derrotado! +" +
            enemy.rewardGold +
            " ouro e +" +
            enemy.rewardXp +
            " XP!";
    }


    // Level up
    checkLevelUp();


    // Próxima fase
    player.phase++;


    // Recupera vida
    player.hp = player.maxHp;


    saveGame();

    updateScreen();


    setTimeout(() => {

        createEnemy();

        startButton.textContent =
            "⚔️ Próxima batalha";

    }, 1200);
}


// ==========================================
// HERÓI DERROTADO
// ==========================================

function playerDefeated() {

    clearInterval(battleTimer);

    battleActive = false;

    player.hp = player.maxHp;

    messageElement.textContent =
        "💀 Você foi derrotado!";

    startButton.textContent =
        "🔄 Tentar novamente";

    saveGame();

    updateScreen();
}


// ==========================================
// LEVEL UP
// ==========================================

function checkLevelUp() {

    let leveledUp = false;

    let requiredXp =
        player.level * 100;


    while (player.xp >= requiredXp) {

        player.xp -= requiredXp;

        player.level++;

        player.maxHp += 20;

        player.damage += 5;

        player.hp =
            player.maxHp;

        requiredXp =
            player.level * 100;

        leveledUp = true;
    }


    if (leveledUp) {

        messageElement.textContent =
            "🎉 LEVEL UP! Nível " +
            player.level +
            "!";

    }
}


// ==========================================
// SALVAR JOGO
// ==========================================

function saveGame() {

    const saveData = {

        player: player,

        lastSave: Date.now()

    };


    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(saveData)
    );
}


// ==========================================
// CARREGAR JOGO
// ==========================================

function loadGame() {

    const saved =
        localStorage.getItem(SAVE_KEY);
// ==========================================
// IDLE RPG - SISTEMA PRINCIPAL
// ==========================================

// ---------- JOGADOR ----------

let player = {
    level: 1,
    xp: 0,
    gold: 0,

    maxHp: 100,
    hp: 100,

    damage: 10,

    phase: 1
};


// ---------- INIMIGO ----------

let enemy = null;


// ---------- CONTROLE ----------

let battleActive = false;
let battleTimer = null;

const SAVE_KEY = "idleRPG_save";


// ---------- ELEMENTOS DA TELA ----------

const goldElement = document.getElementById("gold");
const xpElement = document.getElementById("xp");
const levelElement = document.getElementById("level");

const playerHpElement = document.getElementById("playerHp");
const enemyHpElement = document.getElementById("enemyHp");

const playerHealthBar =
    document.getElementById("playerHealth");

const enemyHealthBar =
    document.getElementById("enemyHealth");

const messageElement =
    document.getElementById("message");

const startButton =
    document.getElementById("startButton");

const enemyNameElement =
    document.getElementById("enemyName");


// ==========================================
// CRIAR INDICADOR DE FASE
// ==========================================

const statsContainer =
    document.querySelector(".stats");

const phaseElement =
    document.createElement("span");

phaseElement.innerHTML =
    "🗺️ Fase: <b id='phase'>1</b>";

statsContainer.appendChild(phaseElement);

const phaseNumberElement =
    document.getElementById("phase");


// ==========================================
// LISTA DE INIMIGOS
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
// CRIAR INIMIGO DA FASE
// ==========================================

function createEnemy() {

    const phase = player.phase;

    // Boss a cada 10 fases
    const isBoss = phase % 10 === 0;

    if (isBoss) {

        const bossHp =
            Math.floor(300 * Math.pow(1.18, phase / 10 - 1));

        const bossDamage =
            Math.floor(25 * Math.pow(1.15, phase / 10 - 1));

        const bossGold =
            Math.floor(150 * Math.pow(1.20, phase / 10 - 1));

        const bossXp =
            Math.floor(250 * Math.pow(1.20, phase / 10 - 1));

        enemy = {
            name: "👑 BOSS - Rei Demônio",
            maxHp: bossHp,
            hp: bossHp,
            damage: bossDamage,
            rewardGold: bossGold,
            rewardXp: bossXp,
            boss: true
        };

    } else {

        const index =
            Math.min(
                Math.floor((phase - 1) / 3),
                enemyTypes.length - 1
            );

        const type = enemyTypes[index];

        const multiplier =
            Math.pow(1.12, phase - 1);

        enemy = {

            name: type.name,

            maxHp:
                Math.floor(type.baseHp * multiplier),

            hp:
                Math.floor(type.baseHp * multiplier),

            damage:
                Math.floor(type.baseDamage * multiplier),

            rewardGold:
                Math.floor(type.baseGold * multiplier),

            rewardXp:
                Math.floor(type.baseXp * multiplier),

            boss: false
        };
    }

    updateEnemyScreen();
}


// ==========================================
// ATUALIZAR INIMIGO NA TELA
// ==========================================

function updateEnemyScreen() {

    enemyNameElement.textContent =
        enemy.name;

    updateScreen();
}


// ==========================================
// ATUALIZAR TELA
// ==========================================

function updateScreen() {

    goldElement.textContent =
        Math.floor(player.gold);

    xpElement.textContent =
        Math.floor(player.xp);

    levelElement.textContent =
        player.level;

    phaseNumberElement.textContent =
        player.phase;

    playerHpElement.textContent =
        Math.max(0, Math.floor(player.hp));

    enemyHpElement.textContent =
        Math.max(0, Math.floor(enemy.hp));

    playerHealthBar.style.width =
        Math.max(
            0,
            player.hp / player.maxHp * 100
        ) + "%";

    enemyHealthBar.style.width =
        Math.max(
            0,
            enemy.hp / enemy.maxHp * 100
        ) + "%";
}


// ==========================================
// INICIAR BATALHA
// ==========================================

function startBattle() {

    if (battleActive) {
        return;
    }

    battleActive = true;

    startButton.textContent =
        "⚔️ Lutando...";

    messageElement.textContent =
        "⚔️ A batalha começou!";

    battleTimer =
        setInterval(battleRound, 1000);

}


// ==========================================
// RODADA DE COMBATE
// ==========================================

function battleRound() {

    // Herói ataca
    enemy.hp -= player.damage;

    if (enemy.hp <= 0) {

        enemyDefeated();

        return;
    }


    // Inimigo ataca
    player.hp -= enemy.damage;

    if (player.hp <= 0) {

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

    battleActive = false;


    // Recompensas
    player.gold += enemy.rewardGold;

    player.xp += enemy.rewardXp;


    if (enemy.boss) {

        messageElement.textContent =
            "👑 BOSS DERROTADO! +" +
            enemy.rewardGold +
            " ouro e +" +
            enemy.rewardXp +
            " XP!";

    } else {

        messageElement.textContent =
            "🎉 " +
            enemy.name +
            " derrotado! +" +
            enemy.rewardGold +
            " ouro e +" +
            enemy.rewardXp +
            " XP!";
    }


    // Level up
    checkLevelUp();


    // Próxima fase
    player.phase++;


    // Recupera vida
    player.hp = player.maxHp;


    saveGame();

    updateScreen();


    setTimeout(() => {

        createEnemy();

        startButton.textContent =
            "⚔️ Próxima batalha";

    }, 1200);
}


// ==========================================
// HERÓI DERROTADO
// ==========================================

function playerDefeated() {

    clearInterval(battleTimer);

    battleActive = false;

    player.hp = player.maxHp;

    messageElement.textContent =
        "💀 Você foi derrotado!";

    startButton.textContent =
        "🔄 Tentar novamente";

    saveGame();

    updateScreen();
}


// ==========================================
// LEVEL UP
// ==========================================

function checkLevelUp() {

    let leveledUp = false;

    let requiredXp =
        player.level * 100;


    while (player.xp >= requiredXp) {

        player.xp -= requiredXp;

        player.level++;

        player.maxHp += 20;

        player.damage += 5;

        player.hp =
            player.maxHp;

        requiredXp =
            player.level * 100;

        leveledUp = true;
    }


    if (leveledUp) {

        messageElement.textContent =
            "🎉 LEVEL UP! Nível " +
            player.level +
            "!";

    }
}


// ==========================================
// SALVAR JOGO
// ==========================================

function saveGame() {

    const saveData = {

        player: player,

        lastSave: Date.now()

    };


    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(saveData)
    );
}


// ==========================================
// CARREGAR JOGO
// ==========================================

function loadGame() {

    const saved =
        localStorage.getItem(SAVE_KEY);


    if (!saved) {

        createEnemy();

        updateScreen();

        return;
    }


    try {

        const saveData =
            JSON.parse(saved);


        if (saveData.player) {

            player = {
                ...player,
                ...saveData.player
            };

        }


        // ==============================
        // PROGRESSO OFFLINE
        // ==============================

        if (saveData.lastSave) {

            const now =
                Date.now();

            let elapsed =
                Math.floor(
                    (now - saveData.lastSave)
                    / 1000
                );


            // Máximo de 8 horas offline
            elapsed =
                Math.min(elapsed, 8 * 60 * 60);


            // Só recompensa se ficou
            // pelo menos 30 segundos fora
            if (elapsed >= 30) {

                calculateOfflineReward(
                    elapsed
                );
            }
        }


        createEnemy();

        updateScreen();

    } catch (error) {

        console.log(
            "Erro ao carregar save:",
            error
        );

        player = {
            level: 1,
            xp: 0,
            gold: 0,
            maxHp: 100,
            hp: 100,
            damage: 10,
            phase: 1
        };

        createEnemy();

        updateScreen();
    }
}


// ==========================================
// RECOMPENSA OFFLINE
// ==========================================

function calculateOfflineReward(seconds) {

    // Estimativa de 1 inimigo derrotado
    // a cada 6 segundos
    const battles =
        Math.floor(seconds / 6);


    if (battles <= 0) {
        return;
    }


    let offlineGold = 0;
    let offlineXp = 0;

    let simulatedPhase =
        player.phase;


    for (
        let i = 0;
        i < battles;
        i++
    ) {

        const isBoss =
            simulatedPhase % 10 === 0;


        if (isBoss) {

            offlineGold +=
                Math.floor(
                    150 *
                    Math.pow(
                        1.20,
                        simulatedPhase / 10 - 1
                    )
                );

            offlineXp +=
                Math.floor(
                    250 *
                    Math.pow(
                        1.20,
                        simulatedPhase / 10 - 1
                    )
                );

        } else {

            const index =
                Math.min(
                    Math.floor(
                        (simulatedPhase - 1) / 3
                    ),
                    enemyTypes.length - 1
                );


            const type =
                enemyTypes[index];


            const multiplier =
                Math.pow(
                    1.12,
                    simulatedPhase - 1
                );


            offlineGold +=
                Math.floor(
                    type.baseGold *
                    multiplier
                );


            offlineXp +=
                Math.floor(
                    type.baseXp *
                    multiplier
                );
        }


        simulatedPhase++;
    }


    player.gold +=
        offlineGold;

    player.xp +=
        offlineXp;

    player.phase =
        simulatedPhase;


    checkLevelUp();


    messageElement.textContent =
        "⏰ Enquanto você estava fora: +" +
        offlineGold +
        " ouro e +" +
        offlineXp +
        " XP!";


    saveGame();
}


// ==========================================
// BOTÃO
// ==========================================

startButton.addEventListener(
    "click",
    startBattle
);


// ==========================================
// INICIALIZAÇÃO
// ==========================================

loadGame();

    if (!saved) {

        createEnemy();

        updateScreen();

        return;
    }


    try {

        const saveData =
            JSON.parse(saved);


        if (saveData.player) {

            player = {
                ...player,
                ...saveData.player
            };

        }


        // ==============================
        // PROGRESSO OFFLINE
        // ==============================

        if (saveData.lastSave) {

            const now =
                Date.now();

            let elapsed =
                Math.floor(
                    (now - saveData.lastSave)
                    / 1000
                );


            // Máximo de 8 horas offline
            elapsed =
                Math.min(elapsed, 8 * 60 * 60);


            // Só recompensa se ficou
            // pelo menos 30 segundos fora
            if (elapsed >= 30) {

                calculateOfflineReward(
                    elapsed
                );
            }
        }


        createEnemy();

        updateScreen();

    } catch (error) {

        console.log(
            "Erro ao carregar save:",
            error
        );

        player = {
            level: 1,
            xp: 0,
            gold: 0,
            maxHp: 100,
            hp: 100,
            damage: 10,
            phase: 1
        };

        createEnemy();

        updateScreen();
    }
}


// ==========================================
// RECOMPENSA OFFLINE
// ==========================================

function calculateOfflineReward(seconds) {

    // Estimativa de 1 inimigo derrotado
    // a cada 6 segundos
    const battles =
        Math.floor(seconds / 6);


    if (battles <= 0) {
        return;
    }


    let offlineGold = 0;
    let offlineXp = 0;

    let simulatedPhase =
        player.phase;

