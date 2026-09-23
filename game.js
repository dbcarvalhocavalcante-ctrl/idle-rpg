const SAVE_KEY = "idleRPG_complete_v3";

const OFFLINE_CAP = 8 * 60 * 60 * 1000;

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

let enemy = null;

let battleActive = false;

let battleTimer = null;

let lastSaved = Date.now();


// ==========================================
// ELEMENTOS
// ==========================================

const $ = id =>
    document.getElementById(id);

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
        price: 50
    },

    {
        id: "armor1",
        name: "Armadura de Couro",
        slot: "armor",
        rarity: "common",
        icon: "🛡️",
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
        price: 100
    },

    {
        id: "sword2",
        name: "Lâmina Arcana",
        slot: "weapon",
        rarity: "epic",
        icon: "🗡️",
        damage: 18,
        price: 250
    },

    {
        id: "armor2",
        name: "Armadura do Guardião",
        slot: "armor",
        rarity: "epic",
        icon: "🛡️",
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
        price: 600
    }

];


// ==========================================
// XP
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
        const id of Object.values(player.equipment)
    ) {

        const item =
            items.find(x => x.id === id);

        if (item) {

            damage += item.damage || 0;

            defense += item.defense || 0;

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

    const boss =
        player.phase % 10 === 0;

    if (boss) {

        const n =
            Math.floor(player.phase / 10);

        const hp =
            Math.floor(
                300 *
                Math.pow(1.18, n - 1)
            );

        enemy = {

            name: "Rei Demônio",

            emoji: "👑",

            maxHp: hp,

            hp: hp,

            damage:
                Math.floor(
                    25 *
                    Math.pow(1.15, n - 1)
                ),

            rewardGold:
                Math.floor(
                    150 *
                    Math.pow(1.2, n - 1)
                ),

            rewardXp:
                Math.floor(
                    250 *
                    Math.pow(1.2, n - 1)
                ),

            boss: true

        };

    } else {

        const type =
            enemies[
                Math.min(
                    Math.floor(
                        (player.phase - 1) / 3
                    ),
                    enemies.length - 1
                )
            ];

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

    const b =
        bonuses();

    player.damage =
        b.damage;

    player.defense =
        b.defense;


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


    els.playerHp.textContent =
        Math.max(
            0,
            Math.floor(player.hp)
        );

    els.playerMaxHp.textContent =
        player.maxHp;


    els.heroHpText.textContent =
        `${Math.max(
            0,
            Math.floor(player.hp)
        )}/${player.maxHp}`;


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


        els.playerHealth.style.width =
            Math.max(
                0,
                player.hp /
                player.maxHp *
                100
            ) + "%";


        els.enemyHealth.style.width =
            Math.max(
                0,
                enemy.hp /
                enemy.maxHp *
                100
            ) + "%";

    }


    els.xpBar.style.width =
        Math.min(
            100,
            player.xp /
            xpNeed() *
            100
        ) + "%";


    els.xpNeeded.textContent =
        xpNeed() -
        player.xp;


    els.auto.textContent =
        player.auto
            ? "🤖 Auto: ON"
            : "🤖 Auto: OFF";


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

        lastSaved =
            Date.now();

        localStorage.setItem(

            SAVE_KEY,

            JSON.stringify({

                player,

                savedAt: lastSaved

            })

        );

    } catch (error) {

        console.error(error);

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


                const elapsed = Math.min(

                    OFFLINE_CAP,

                    Math.max(

                        0,

                        Date.now() -
                        (data.savedAt ||
                         Date.now())

                    )

                );


                if (elapsed > 60000) {

                    const minutes =
                        Math.floor(
                            elapsed / 60000
                        );

                    const gold =
                        Math.floor(
                            minutes * 2
                        );

                    player.gold +=
                        gold;

                    els.offline.textContent =
                        `Você ficou ${minutes} min offline e recebeu 💰 ${gold} ouro.`;

                } else {

                    els.offline.textContent =
                        "Nenhuma recompensa offline pendente.";

                }

            }

        }

    } catch (error) {

        console.error(error);

    }


    if (
        player.hp >
        player.maxHp
    ) {

        player.hp =
            player.maxHp;

    }


    createEnemy();

}


// ==========================================
// INICIAR BATALHA
// ==========================================

function startBattle() {

    if (battleActive) {

        return;

    }


    battleActive =
        true;


    els.start.disabled =
        true;


    els.start.textContent =
        "⚔️ Lutando...";


    els.message.textContent =
        "⚔️ A batalha começou!";


    battleTimer =
        setInterval(
            round,
            1000
        );

}


// ==========================================
// RODADA
// ==========================================

function round() {

    if (!battleActive) {

        return;

    }


    enemy.hp -=
        player.damage;


    if (enemy.hp <= 0) {

        win();

        return;

    }


    const received =
        Math.max(
            1,
            enemy.damage -
            player.defense
        );


    player.hp -=
        received;


    if (player.hp <= 0) {

        lose();

        return;

    }


    els.message.textContent =
        `⚔️ Você causou ${player.damage} e recebeu ${received} de dano.`;


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


    player.gold +=
        enemy.rewardGold;


    player.xp +=
        enemy.rewardXp;


    let text =
        `🎉 ${
            enemy.boss
                ? "BOSS "
                : ""
        }${enemy.name} derrotado! +${
            enemy.rewardGold
        } ouro, +${
            enemy.rewardXp
        } XP.`;


    checkLevel();


    player.phase++;


    player.hp =
        player.maxHp;


    const drop =
        dropItem();


    if (drop) {

        player.inventory.push(
            drop.id
        );

        text +=
            ` 🎁 Drop: ${drop.name}!`;

    }


    els.message.textContent =
        text;


    save();

    update();


    els.start.textContent =
        "⏳ Próxima batalha...";


    setTimeout(
        () => {

            createEnemy();

            els.start.disabled =
                false;

            els.start.textContent =
                "⚔️ Próxima batalha";


            if (player.auto) {

                startBattle();

            }

        },
        900
    );

}


// ==========================================
// DERROTA
// ==========================================

function lose() {

    clearInterval(
        battleTimer
    );

    battleTimer =
        null;

    battleActive =
        false;


    player.hp =
        player.maxHp;


    els.message.textContent =
        "💀 Você foi derrotado!";


    els.start.disabled =
        false;


    els.start.textContent =
        "🔄 Tentar novamente";


    save();

    update();

}


// ==========================================
// LEVEL UP
// ==========================================

function checkLevel() {

    while (
        player.xp >=
        xpNeed()
    ) {

        player.xp -=
            xpNeed();


        player.level++;


        player.maxHp +=
            20;


        player.hp =
            player.maxHp;

    }

}


// ==========================================
// DROP
// ==========================================

function dropItem() {

    const chance =
        Math.random();


    if (chance > 0.28) {

        return null;

    }


    const pool =
        items.filter(
            i =>
                i.price <=
                Math.max(
                    100,
                    player.phase * 50
                )
        );


    return pool[
        Math.floor(
            Math.random() *
            pool.length
        )
    ] || null;

}


// ==========================================
// INVENTÁRIO
// ==========================================

function renderInventory() {

    if (
        !player.inventory.length
    ) {

        els.inventory.innerHTML =
            "<div class='item'>Seu inventário está vazio.</div>";

        return;

    }


    els.inventory.innerHTML =
        player.inventory
            .map(
                (id, index) => {

                    const item =
                        items.find(
                            x =>
                                x.id ===
                                id
                        );


                    if (!item) {

                        return "";

                    }


                    const equipped =
                        player.equipment[
                            item.slot
                        ] ===
                        item.id;


                    return `

                    <div class="item ${item.rarity}">

                        ${item.icon}

                        <b>${item.name}</b>

                        <br>

                        <small>

                            ${
                                item.damage
                                    ? `+${item.damage} ataque `
                                    : ""
                            }

                            ${
                                item.defense
                                    ? `+${item.defense} defesa`
                                    : ""
                            }

                        </small>

                        <button
                            data-equip="${index}"
                        >

                            ${
                                equipped
                                    ? "Desequipar"
                                    : "Equipar"
                            }

                        </button>

                    </div>

                    `;

                }
            )
            .join("");

}


// ==========================================
// LOJA
// ==========================================

function renderShop() {

    els.shop.innerHTML =
        items
            .map(
                item => `

                <div class="item ${item.rarity}">

                    ${item.icon}

                    <b>${item.name}</b>

                    <br>

                    <small>

                        ${
                            item.damage
                                ? `+${item.damage} ataque `
                                : ""
                        }

                        ${
                            item.defense
                                ? `+${item.defense} defesa`
                                : ""
                        }

                    </small>

                    <br>

                    💰 ${item.price}

                    <button
                        data-buy="${item.id}"
                    >

                        Comprar

                    </button>

                </div>

                `
            )
            .join("");

}


// ==========================================
// BOTÃO DE BATALHA
// ==========================================

els.start.addEventListener(
    "click",
    startBattle
);


// ==========================================
// AUTO-BATALHA
// ==========================================

els.auto.addEventListener(
    "click",
    () => {

        player.auto =
            !player.auto;


        save();

        update();


        if (
            player.auto &&
            !battleActive
        ) {

            startBattle();

        }

    }
);


// ==========================================
// EQUIPAR
// ==========================================

els.inventory.addEventListener(
    "click",
    event => {

        const index =
            event.target.dataset.equip;


        if (
            index === undefined
        ) {

            return;

        }


        const item =
            items.find(
                x =>
                    x.id ===
                    player.inventory[
                        index
                    ]
            );


        if (!item) {

            return;

        }


        if (
            player.equipment[
                item.slot
            ] ===
            item.id
        ) {

            player.equipment[
                item.slot
            ] = null;

        } else {

            player.equipment[
                item.slot
            ] = item.id;

        }


        save();

        update();

    }
);


// ==========================================
// COMPRAR
// ==========================================

els.shop.addEventListener(
    "click",
    event => {

        const id =
            event.target.dataset.buy;


        if (!id) {

            return;

        }


        const item =
            items.find(
                x =>
                    x.id === id
            );


        if (
            player.gold <
            item.price
        ) {

            els.message.textContent =
                "💰 Ouro insuficiente.";

            return;

        }


        player.gold -=
            item.price;


        player.inventory.push(
            item.id
        );


        els.message.textContent =
            `🛒 ${item.name} comprado!`;


        save();

        update();

    }
);
// INICIAR O JOGO
load();


// ==========================================
// APAGA
