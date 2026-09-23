let player = {
    level: 1,
    xp: 0,
    gold: 0,
    maxHp: 100,
    hp: 100,
    damage: 10
};

let enemy = {
    name: "Goblin",
    maxHp: 50,
    hp: 50,
    damage: 5,
    rewardGold: 10,
    rewardXp: 20
};

let battleActive = false;
let battleTimer = null;

const goldElement = document.getElementById("gold");
const xpElement = document.getElementById("xp");
const levelElement = document.getElementById("level");

const playerHpElement = document.getElementById("playerHp");
const enemyHpElement = document.getElementById("enemyHp");

const playerHealthBar = document.getElementById("playerHealth");
const enemyHealthBar = document.getElementById("enemyHealth");

const messageElement = document.getElementById("message");
const startButton = document.getElementById("startButton");

function updateScreen() {
    goldElement.textContent = player.gold;
    xpElement.textContent = player.xp;
    levelElement.textContent = player.level;

    playerHpElement.textContent = Math.max(0, player.hp);
    enemyHpElement.textContent = Math.max(0, enemy.hp);

    playerHealthBar.style.width =
        (player.hp / player.maxHp * 100) + "%";

    enemyHealthBar.style.width =
        (enemy.hp / enemy.maxHp * 100) + "%";
}

function startBattle() {

    if (battleActive) {
        return;
    }

    battleActive = true;

    startButton.textContent = "⚔️ Lutando...";

    messageElement.textContent =
        "⚔️ A batalha começou!";

    battleTimer = setInterval(battleRound, 1000);
}

function battleRound() {

    enemy.hp -= player.damage;

    if (enemy.hp <= 0) {
        enemyDefeated();
        return;
    }

    player.hp -= enemy.damage;

    if (player.hp <= 0) {
        playerDefeated();
        return;
    }

    messageElement.textContent =
        "⚔️ Herói causou " +
        player.damage +
        " de dano!";

    updateScreen();
}

function enemyDefeated() {

    clearInterval(battleTimer);

    battleActive = false;

    player.gold += enemy.rewardGold;
    player.xp += enemy.rewardXp;

    messageElement.textContent =
        "🎉 Goblin derrotado! +" +
        enemy.rewardGold +
        " ouro e +" +
        enemy.rewardXp +
        " XP!";

    checkLevelUp();

    setTimeout(() => {

        createNextEnemy();

        player.hp = player.maxHp;

        updateScreen();

        startButton.textContent =
            "⚔️ Próximo inimigo";

    }, 1500);

    updateScreen();
}

function playerDefeated() {

    clearInterval(battleTimer);

    battleActive = false;

    player.hp = player.maxHp;

    messageElement.textContent =
        "💀 O herói foi derrotado!";

    startButton.textContent =
        "🔄 Tentar novamente";

    updateScreen();
}

function createNextEnemy() {

    const enemies = [
        {
            name: "Goblin",
            maxHp: 50,
            damage: 5,
            rewardGold: 10,
            rewardXp: 20
        },
        {
            name: "Orc",
            maxHp: 80,
            damage: 8,
            rewardGold: 18,
            rewardXp: 35
        },
        {
            name: "Troll",
            maxHp: 120,
            damage: 12,
            rewardGold: 30,
            rewardXp: 50
        }
    ];

    const randomEnemy =
        enemies[Math.floor(Math.random() * enemies.length)];

    enemy = {
        ...randomEnemy,
        hp: randomEnemy.maxHp
    };

    document.getElementById("enemyName").textContent =
        enemy.name;
}

function checkLevelUp() {

    const requiredXp = player.level * 100;

    if (player.xp >= requiredXp) {

        player.xp -= requiredXp;

        player.level++;

        player.maxHp += 20;
        player.damage += 5;

        player.hp = player.maxHp;

        messageElement.textContent =
            "🎉 LEVEL UP! Você chegou ao nível " +
            player.level + "!";
    }
}

startButton.addEventListener("click", startBattle);

updateScreen();
