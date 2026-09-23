// ==========================================
// IDLE RPG - GAME.JS
// ==========================================

const SAVE_KEY = "idleRPG_complete_v4";
const OFFLINE_CAP = 8 * 60 * 60 * 1000;

// ==========================================
// JOGADOR
// ==========================================

let player = {
    level: 1,
    xp: 0,
    gold: 0,

    maxHp: 100,
    hp: 100,

    damage: 10,
    defense: 0,

    phase: 1,

    auto: false,

    equipment: {
        weapon: null,
        armor: null,
        ring: null
    },

    inventory: []
};

// ==========================================
// BATALHA
// ==========================================

let enemy = null;
let battleActive = false;
let battleTimer = null;

// ==========================================
// ELEMENTOS HTML
// ==========================================

const $ = id => document.getElementById(id);

const els = {
    gold: $("gold"),
    xp: $("xp"),
    level: $("level"),
    phase: $("phase"),

    damage: $("damage"),
    defense: $("defense"),

    heroHpText: $("heroHpText"),

    playerHp: $("playerHp"),
    playerMaxHp: $("playerMaxHp"),

    enemyHp: $("enemyHp"),
    enemyMaxHp: $("enemyMaxHp"),

    playerHealth: $("playerHealth"),
    enemyHealth: $("enemyHealth"),

    enemyName: $("enemyName"),
    enemyEmoji: $("enemyEmoji"),

    message: $("message"),

    start: $("startButton"),
    auto: $("autoButton"),

    inventory: $("inventory"),
    shop: $("shop"),

    offline: $("offlineText"),

    xpBar: $("xpBar"),
    xpNeeded: $("xpNeeded"),

    weaponName: $("weaponName"),
    armorName: $("armorName"),
    ringName: $("ringName")
};

// ==========================================
// VERIFICAR HTML
// ==========================================

function checkElements() {

    for (const key in els) {

        if (!els[key]) {
            console.error(
                "Elemento HTML não encontrado:",
                key
            );
        }

    }

}

// ==========================================
// INIMIGOS
// ==========================================

const enemies = [

    {
        name: "Goblin",
        emoji: "👹",
        hp: 50,
        damage: 5,
        gold: 10,
        xp: 20
    },

    {
        name: "Orc",
        emoji: "👺",
        hp: 80,
        damage: 8,
        gold: 18,
        xp: 35
    },

    {
        name: "Troll",
        emoji: "👹",
        hp: 120,
        damage: 12,
        gold: 30,
        xp: 50
    },

    {
        name: "Demônio",
        emoji: "😈",
        hp: 180,
        damage: 18,
        gold: 50,
        xp: 80
    }

];

// ==========================================
// ITENS
// ==========================================

const items = [

    {
        id: "sword1",
        name: "Espada de Ferro",
        slot: "weapon",
        rarity: "common",
        icon: "⚔️",
        damage: 5,
        defense: 0,
        price: 50
    },

    {
        id: "armor1",
        name: "Armadura de Couro",
        slot: "armor",
        rarity: "common",
        icon: "🛡️",
        damage: 0,
        defense: 3,
        price: 60
    },

    {
        id: "ring1",
        name: "Anel do Aprendiz",
        slot: "ring",
        rarity: "rare",
        icon: "💍",
        damage: 8,
        defense: 0,
        price: 100
    },

    {
        id: "sword2",
        name: "Lâmina Arcana",
        slot: "weapon",
        rarity: "epic",
        icon: "🗡️",
        damage: 18,
        defense: 0,
        price: 250
    },

    {
        id: "armor2",
        name: "Armadura do Guardião",
        slot: "armor",
        rarity: "epic",
        icon: "🛡️",
        damage: 0,
        defense: 12,
        price: 300
    },

    {
        id: "ring2",
        name: "Anel Lendário",
        slot: "ring",
        rarity: "legendary",
        icon: "💍",
        damage: 30,
        defense: 0,
        price: 600
    }

];

// ==========================================
// XP NECESSÁRIO
// ==========================================

function xpNeed() {

    return player.level * 100;

}

// ==========================================
// BÔNUS DOS EQUIPAMENTOS
// ==========================================

function bonuses() {

    let damage = 10;
    let defense = 0;

    for (
        const slot of
        ["weapon", "armor", "ring"]
    ) {

        const id =
            player.equipment[slot];

        const item =
            items.find(
                x => x.id === id
            );

        if (item) {

            damage +=
                item.damage || 0;

            defense +=
                item.defense || 0;

        }

    }

    return {
        damage,
        defense
    };

}

// ==========================================
// CRIAR INIMIGO
// ==========================================

function createEnemy() {

    const isBoss =
        player.phase % 10 === 0;

    if (isBoss) {

        const bossLevel =
            Math.floor(
                player.phase / 10
            );

        const hp =
            Math.floor(
                300 *
                Math.pow(
                    1.18,
                    bossLevel - 1
                )
            );

        enemy = {

            name: "Rei Demônio",

            emoji: "👑",

            maxHp: hp,

            hp: hp,

            damage:
                Math.floor(
                    25 *
                    Math.pow(
                        1.15,
                        bossLevel - 1
                    )
                ),

            rewardGold:
                Math.floor(
                    150 *
                    Math.pow(
                        1.20,
                        bossLevel - 1
                    )
                ),

            rewardXp:
                Math.floor(
                    250 *
                    Math.pow(
                        1.20,
                        bossLevel - 1
                    )
                ),

            boss: true

        };

    } else {

        const index =
            Math.min(
                Math.floor(
                    (player.phase - 1) / 3
                ),
                enemies.length - 1
            );

        const type =
            enemies[index];

        const multiplier =
            Math.pow(
                1.12,
                player.phase - 1
            );

        const hp =
            Math.floor(
                type.hp * multiplier
            );

        enemy = {

            name: type.name,

            emoji: type.emoji,

            maxHp: hp,

            hp: hp,

            damage:
                Math.floor(
                    type.damage *
                    multiplier
                ),

            rewardGold:
                Math.floor(
                    type.gold *
                    multiplier
                ),

            rewardXp:
                Math.floor(
                    type.xp *
                    multiplier
                ),

            boss: false

        };

    }

    update();

}

// ==========================================
// ATUALIZAR TELA
// ==========================================

function update() {

    if (!els.gold) {
        return;
    }

    const b = bonuses();

    player.damage =
        b.damage;

    player.defense =
        b.defense;

    // STATUS

    els.gold.textContent =
        Math.floor(player.gold);

    els.xp.textContent =
        Math.floor(player.xp);

    els.level.textContent =
        player.level;

    els.phase.textContent =
        player.phase;

    els.damage.textContent =
        player.damage;

    els.defense.textContent =
        player.defense;

    // VIDA DO HERÓI

    const currentHp =
        Math.max(
            0,
            Math.floor(player.hp)
        );

    els.playerHp.textContent =
        currentHp;

    els.playerMaxHp.textContent =
        player.maxHp;

    els.heroHpText.textContent =
        `${currentHp}/${player.maxHp}`;

    els.playerHealth.style.width =
        Math.max(
            0,
            Math.min(
                100,
                player.hp /
                player.maxHp *
                100
            )
        ) + "%";

    // INIMIGO

    if (enemy) {

        els.enemyHp.textContent =
            Math.max(
                0,
                Math.floor(enemy.hp)
            );

        els.enemyMaxHp.textContent =
            enemy.maxHp;

        els.enemyName.textContent =
            enemy.boss
                ? "👑 " + enemy.name
                : enemy.name;

        els.enemyEmoji.textContent =
            enemy.emoji;

        els.enemyHealth.style.width =
            Math.max(
                0,
                Math.min(
                    100,
                    enemy.hp /
                    enemy.maxHp *
                    100
                )
            ) + "%";

    }

    // XP

    const needed =
        xpNeed();

    const percent =
        Math.min(
            100,
            player.xp /
            needed *
            100
        );

    els.xpBar.style.width =
        percent + "%";

    els.xpNeeded.textContent =
        Math.max(
            0,
            needed - player.xp
        );

    // AUTO

    els.auto.textContent =
        player.auto
            ? "🤖 Auto: ON"
            : "🤖 Auto: OFF";

    // EQUIPAMENTOS

    for (
        const slot of
        ["weapon", "armor", "ring"]
    ) {

        const item =
            items.find(
                x =>
                    x.id ===
                    player.equipment[slot]
            );

        els[slot + "Name"].textContent =
            item
                ? item.name
                : "Vazio";

    }

    renderInventory();
    renderShop();

}

// ==========================================
// SALVAR
// ==========================================

function save() {

    try {

        localStorage.setItem(

            SAVE_KEY,

            JSON.stringify({

                player: player,

                savedAt: Date.now()

            })

        );

    } catch (error) {

        console.error(
            "Erro ao salvar:",
            error
        );

    }

}

// ==========================================
// CARREGAR
// ==========================================

function load() {

    try {

        const raw =
            localStorage.getItem(
                SAVE_KEY
            );

        if (raw) {

            const data =
                JSON.parse(raw);

            if (data.player) {

                player = {

                    ...player,

                    ...data.player,

                    equipment: {

                        ...player.equipment,

                        ...(data.player.equipment || {})

                    },

                    inventory:

                        Array.isArray(
                            data.player.inventory
                        )

                            ? data.player.inventory

                            : []

                };

                // RECOMPENSA OFFLINE

                const savedAt =
                    data.savedAt ||
                    Date.now();

                const elapsed =
                    Math.min(
                        OFFLINE_CAP,
                        Math.max(
                            0,
                            Date.now() -
                            savedAt
                        )
                    );

                if (
                    elapsed >
                    60000
                ) {

                    const minutes =
                        Math.floor(
                            elapsed /
                            60000
                        );

                    const gold =
                        minutes * 2;

                    player.gold +=
                        gold;

                    els.offline.textContent =
                        `Você ficou ${minutes} min offline e recebeu 💰 ${gold} ouro.`;

                } else {

                    els.offline.textContent =
                        "Nenhuma recompensa offline pendente.";

                }

            }

        } else {

            els.offline.textContent =
                "Novo jogo iniciado!";

        }

    } catch (error) {

        console.error(
            "Erro ao carregar:",
            error
        );

    }

    // CORRIGIR VIDA

    if (
        player.hp <= 0 ||
        player.hp > player.maxHp
    ) {

        player.hp =
            player.maxHp;

    }

    // GARANTIR ESTRUTURA

    if (
        !player.equipment
    ) {

        player.equipment = {
            weapon: null,
            armor: null,
            ring: null
        };

    }

    if (
        !Array.isArray(
            player.inventory
        )
    ) {

        player.inventory = [];

    }

    // CRIAR PRIMEIRO INIMIGO

    createEnemy();

    update();

}

// ==========================================
// INICIAR BATALHA
// ==========================================

function startBattle() {

    // Não iniciar duas vezes

    if (battleActive) {
        return;
    }

    // Se não existir inimigo,
    // cria um novo

    if (
        !enemy ||
        enemy.hp <= 0
    ) {

        createEnemy();

    }

    // GARANTIR VIDA

    if (
        player.hp <= 0
    ) {

        player.hp =
            player.maxHp;

    }

    battleActive =
        true;

    els.start.disabled =
        true;

    els.start.textContent =
        "⚔️ Lutando...";

    els.message.textContent =
        "⚔️ A batalha começou!";

    // SEGURANÇA:
    // impedir intervalos duplicados

    if (battleTimer) {

        clearInterval(
            battleTimer
        );

    }

    battleTimer =
        setInterval(
            round,
            1000
        );

}

// ==========================================
// RODADA DE BATALHA
// ==========================================

function round() {

    if (
        !battleActive
    ) {

        return;

    }

    // SEGURANÇA

    if (!enemy) {

        createEnemy();

        return;

    }

    // ATAQUE DO JOGADOR

    enemy.hp -=
        player.damage;

    // INIMIGO MORREU

    if (
        enemy.hp <= 0
    ) {

        enemy.hp = 0;

        update();

        win();

        return;

    }

    // ATAQUE DO INIMIGO

    const received =
        Math.max(
            1,
            enemy.damage -
            player.defense
        );

    player.hp -=
        received;

    // HERÓI MORREU

    if (
        player.hp <= 0
    ) {

        player.hp = 0;

        update();

        lose();

        return;

    }

    // MENSAGEM

    els.message.textContent =
        `⚔️ Você causou ${player.damage} de dano e recebeu ${received}.`;

    update();

    save();

}

// ==========================================
// VITÓRIA
// ==========================================

function win() {

    clearInterval(
        battleTimer
    );

    battleTimer =
        null;

    battleActive =
        false;

    // RECOMPENSAS

    player.gold +=
        enemy.rewardGold;

    player.xp +=
        enemy.rewardXp;

    let message =
        `🎉 ${enemy.boss ? "BOSS " : ""}${enemy.name} derrotado! ` +
        `+${enemy.rewardGold} ouro, ` +
        `+${enemy.rewardXp} XP.`;

    // LEVEL UP

    const oldLevel =
        player.level;

    checkLevel();

    if (
        player.level >
        oldLevel
    ) {

        message +=
            ` 🆙 Nível ${player.level}!`;

    }

    // PRÓXIMA FASE

    player.phase++;

    // RECUPERAR VIDA

    player.hp =
        player.maxHp;

   
