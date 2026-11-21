let pendingAction = null;

let typewriterTimer = null;
let currentFullText = "";
let isTypewriting = false;
let isChoiceAnswered = false;
let modalDelayTimer = null;

window.onload = function() {
    initGlobalKeyListener();
    resetBookPage();
    document.getElementById('historyBookModal').classList.add('active');
};

function initGlobalKeyListener() {
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.repeat) return;
            const gameModal = document.getElementById('gameModal');
            if (gameModal && gameModal.classList.contains('show')) {
                closeModal();
                return;
            }

            const storyModal = document.getElementById('storyModal');
            if (!storyModal || !storyModal.classList.contains('active')) return;

            const choicesEl = document.getElementById('storyChoices');
            if (choicesEl && choicesEl.style.display !== 'none') return;

            const startGameBtn = document.getElementById('startMinigameFromStoryBtn');
            if (startGameBtn && startGameBtn.style.display !== 'none') {
                showGameInstructionModal(e);
                return;
            }

            nextDialogue(e);
        }
    });
}

function handleStoryClick() {
    const choicesEl = document.getElementById('storyChoices');
    if (choicesEl && choicesEl.style.display !== 'none') return;

    const startGameBtn = document.getElementById('startMinigameFromStoryBtn');
    if (startGameBtn && startGameBtn.style.display !== 'none') return;

    nextDialogue();
}

let currentBookPage = 1;
const totalBookPages = 3;

function changeBookPage(direction) {
    const currentPageEl = document.getElementById(`bookPage${currentBookPage}`);
    if (currentPageEl) currentPageEl.classList.remove('active');

    currentBookPage += direction;
    if (currentBookPage < 1) currentBookPage = 1;
    if (currentBookPage > totalBookPages) currentBookPage = totalBookPages;

    const newPageEl = document.getElementById(`bookPage${currentBookPage}`);
    if (newPageEl) newPageEl.classList.add('active');

    document.getElementById('pageIndicator').innerText = `${currentBookPage} / ${totalBookPages}`;
    document.getElementById('prevPageBtn').style.display = currentBookPage === 1 ? 'none' : 'inline-block';
    document.getElementById('nextPageBtn').style.display = currentBookPage === totalBookPages ? 'none' : 'inline-block';

    const startStoryBtn = document.getElementById('startStoryBtn');
    if (startStoryBtn) {
        startStoryBtn.style.display = currentBookPage === totalBookPages ? 'inline-block' : 'none';
    }
}

function resetBookPage() {
    currentBookPage = 1;
    for (let i = 1; i <= totalBookPages; i++) {
        const page = document.getElementById(`bookPage${i}`);
        if (page) page.classList.remove('active');
    }
    const page1 = document.getElementById('bookPage1');
    if (page1) page1.classList.add('active');

    document.getElementById('pageIndicator').innerText = `1 / ${totalBookPages}`;
    document.getElementById('prevPageBtn').style.display = 'none';
    document.getElementById('nextPageBtn').style.display = 'inline-block';
    
    const startStoryBtn = document.getElementById('startStoryBtn');
    if (startStoryBtn) startStoryBtn.style.display = 'none';
}

let currentStoryStep = 0;

const storyScript = [
    {
        title: "一、抵達玉井：認識當地特產",
        speaker: "小丸",
        text: "「我們終於到玉井啦！這裡是台南很有名的芒果產地喔！你知道玉井最具代表性的農產品之一是什麼嗎？」",
        marukoImg: "小丸/吉祥物1_舉手開口.png",
        charImg: "",
        bgImg: "背景/街道.png",
        choices: [
            { text: "「 當然知道！是芒果！」", nextText: "「答對了！真厲害！玉井的氣候和地形適合芒果生長，這裡的芒果香甜多汁，也是許多人夏天最期待的美味呢！」", marukoImg: "小丸/吉祥物_跳.png" },
            { text: "「 不知道耶！快告訴我！」", nextText: "「答案就是芒果啦！玉井因為芒果產業而聞名，還有好多以芒果製作的特色美食喔！」", marukoImg: "小丸/吉祥物1_睜眼開口.png" }
        ]
    },
    {
        title: "一、抵達玉井：前往冰店",
        speaker: "小丸",
        text: "「聽說前面有一家很有名的芒果冰老店！我們去看看吧！」",
        marukoImg: "小丸/吉祥物1_流口水.png",
        charImg: "",
        bgImg: "背景/街道.png"
    },
    {
        title: "二、芒果冰店：店長求助",
        speaker: "小丸",
        text: "「哇！人好多啊！咦？今天怎麼只有店長一個人在忙？」",
        marukoImg: "小丸/吉祥物1_睜眼閉口.png",
        charImg: "劇情/芒果冰店長.png",
        bgImg: "劇情/冰店.png"
    },
    {
        title: "二、芒果冰店：店長求助",
        speaker: "店長",
        text: "「唉……今天果園的採收人員和店裡的員工剛好都請假了，客人又突然變多，我一個人實在忙不過來。」",
        marukoImg: "小丸/吉祥物1_睜眼閉口.png",
        charImg: "劇情/芒果冰店長_差分.png",
        bgImg: "劇情/冰店.png"
    },
    {
        title: "二、芒果冰店：店長求助",
        speaker: "小丸",
        text: "「店長，別擔心！我們可以幫忙！你願意幫助店長嗎？」",
        marukoImg: "小丸/吉祥物1_舉手開口.png",
        charImg: "劇情/芒果冰店長.png",
        bgImg: "劇情/冰店.png",
        choices: [
            { 
                text: " 「沒問題！我們來幫忙吧！」", 
                speaker: "店長",
                nextText: "「真的嗎？太感謝你們了！果園就在店後面，麻煩你們幫忙採收一些芒果吧！」", 
                marukoImg: "小丸/吉祥物_跳.png", 
                charImg: "劇情/芒果冰店長_差分.png" 
            },
            { 
                text: " 「可以啊！完成後有芒果冰吃嗎？」", 
                speaker: "小丸 & 店長",
                nextText: "小丸：「哈哈！你果然是為了芒果冰來的！」\n店長：「沒問題！只要你們幫忙完成任務，我就請你們吃一碗招牌芒果冰！」", 
                marukoImg: "小丸/吉祥物1_流口水.png", 
                charImg: "劇情/芒果冰店長_差分.png" 
            }
        ]
    },
    {
        title: "二、芒果冰店：準備挑戰",
        speaker: "小丸",
        text: "「交給我們吧！你準備好了嗎？」",
        marukoImg: "小丸/吉祥物_跳.png",
        charImg: "劇情/芒果冰店長.png",
        bgImg: "劇情/冰店.png",
        isGameTrigger: true
    },
    {
        title: "四、任務完成：香甜的芒果冰",
        speaker: "",
        text: "（店長將新鮮芒果切成塊，放在剉冰上，再淋上濃郁的芒果醬。）",
        marukoImg: "小丸/吉祥物1_流口水.png",
        charImg: "劇情/芒果冰店長.png",
        bgImg: "劇情/冰店.png"
    },
    {
        title: "四、任務完成：香甜的芒果冰",
        speaker: "店長",
        text: "「完成了！這就是我們玉井的招牌芒果冰！今天多虧你們幫忙，才能順利完成工作。」",
        marukoImg: "小丸/吉祥物1_彎眉開口.png",
        charImg: "劇情/芒果冰店長_差分.png",
        bgImg: "劇情/冰店.png"
    },
    {
        title: "四、任務完成：香甜的芒果冰",
        speaker: "店長",
        text: "「這碗芒果冰就送給你們，當作感謝的禮物！希望你們能記住玉井的味道，也把這裡的故事分享給更多人！」",
        marukoImg: "小丸/吉祥物1_睜眼閉口.png",
        charImg: "劇情/芒果冰店長_差分.png",
        bgImg: "劇情/冰店.png",
        showMangoIceModal: true
    },
    {
        title: "五、神祕地圖：下一站的線索",
        speaker: "",
        text: "（玩家收下伴手禮時，店長注意到玩家手上的神祕地圖。）",
        marukoImg: "小丸/吉祥物1_睜眼閉口.png",
        charImg: "劇情/芒果冰店長.png",
        bgImg: "劇情/冰店.png"
    },
    {
        title: "五、神祕地圖：下一站的線索",
        speaker: "店長",
        text: "「咦？這張地圖……我好像在哪裡看過！」",
        marukoImg: "小丸/吉祥物1_睜眼閉口.png",
        charImg: "劇情/芒果冰店長.png",
        bgImg: "劇情/冰店.png"
    },
    {
        title: "五、神祕地圖：下一站的線索",
        speaker: "小丸",
        text: "「店長，你認識這張地圖嗎？」",
        marukoImg: "小丸/吉祥物1_舉手開口.png",
        charImg: "劇情/芒果冰店長.png",
        bgImg: "劇情/冰店.png"
    },
    {
        title: "五、神祕地圖：下一站的線索",
        speaker: "店長",
        text: "「很久以前，曾經有一位旅人拿著一模一樣的地圖來到這裡。他離開前特別留下一張火車票，並交代我，如果未來有人帶著這張地圖來訪，就把火車票交給對方。」",
        marukoImg: "小丸/吉祥物1_睜眼閉口.png",
        charImg: "劇情/芒果冰店長.png",
        bgImg: "劇情/冰店.png"
    },
    {
        title: "五、神祕地圖：下一站的線索",
        speaker: "店長",
        text: "「我想，這張票應該就是為你們準備的。」",
        marukoImg: "小丸/吉祥物1_睜眼閉口.png",
        charImg: "劇情/芒果冰店長_差分.png",
        bgImg: "劇情/冰店.png",
        choices: [
            { 
                text: "「 原來如此！謝謝店長，我會繼續這趟旅程！」", 
                speaker: "店長",
                nextText: "「祝你們一路順利！希望你們能找到地圖背後的祕密！」", 
                marukoImg: "小丸/吉祥物1_瞇眼開口.png" 
            },
            { 
                text: "「 下一站會是哪裡呢？我已經迫不及待了！」", 
                speaker: "小丸",
                nextText: "「嘿嘿！答案就在地圖裡！我們搭上火車，就能前往下一個目的地了！」", 
                marukoImg: "小丸/吉祥物_跳.png" 
            }
        ],
        showTicketModalAfterChoice: true
    },
    {
        title: "五、神祕地圖：下一站的線索",
        speaker: "系統提示",
        text: "玉井區探索完成！獲得玉井特色伴手禮與下一站火車票！",
        marukoImg: "小丸/吉祥物_跳.png",
        charImg: "",
        bgImg: "劇情/冰店.png"
    },
    {
        title: "五、神祕地圖：下一站的線索",
        speaker: "小丸",
        text: "「我們成功找回玉井的色彩了！不過，地圖上還有好多地方等著我們去探索呢！」",
        marukoImg: "小丸/吉祥物1_彎眉開口.png",
        charImg: "",
        bgImg: "劇情/冰店.png"
    },
    
    {
        title: "五、神祕地圖：前往下一站",
        speaker: "系統提示",
        text: "玉井區關卡完成",
        marukoImg: "",
        charImg: "",
        bgImg: "劇情/冰店.png",
        isFinalStoryEnd: true
    }
];

function startStoryFromBook() {
    if (document.activeElement) document.activeElement.blur();
    document.getElementById('historyBookModal').classList.remove('active');
    document.getElementById('storyModal').classList.add('active');
    currentStoryStep = 0;
    renderStoryStep();
}

function startTypewriter(text, onComplete) {
    if (typewriterTimer) clearInterval(typewriterTimer);
    
    currentFullText = text;
    isTypewriting = true;
    
    const dialogueEl = document.getElementById('dialogueText');
    dialogueEl.innerText = "";
    
    let index = 0;
    typewriterTimer = setInterval(() => {
        if (index < text.length) {
            dialogueEl.innerText += text.charAt(index);
            index++;
        } else {
            clearInterval(typewriterTimer);
            typewriterTimer = null;
            isTypewriting = false;
            if (onComplete) onComplete();
        }
    }, 30);
}

function renderStoryStep() {
    isChoiceAnswered = false;
    if (modalDelayTimer) {
        clearTimeout(modalDelayTimer);
        modalDelayTimer = null;
    }
    const step = storyScript[currentStoryStep];
    document.getElementById('storyTitle').innerText = step.title;
    document.getElementById('speakerName').innerText = step.speaker;
    
    if (step.bgImg) document.getElementById('storyBg').src = step.bgImg;

    const marukoEl = document.getElementById('storyCharMaruko');
    if (marukoEl) {
        if (step.marukoImg) {
            marukoEl.src = step.marukoImg;
            marukoEl.style.display = 'block';
        } else {
            marukoEl.style.display = 'none';
        }
    }

    const charEl = document.getElementById('storyChar');
    if (step.charImg) {
        charEl.src = step.charImg;
        charEl.style.display = 'block';
    } else {
        charEl.style.display = 'none';
    }

    const choicesEl = document.getElementById('storyChoices');
    const nextBtn = document.getElementById('nextDialogueBtn');
    const startGameBtn = document.getElementById('startMinigameFromStoryBtn');

    choicesEl.style.display = 'none';
    nextBtn.style.display = 'none';
    startGameBtn.style.display = 'none';

    startTypewriter(step.text, () => {
        if (step.choices) {
            choicesEl.innerHTML = '';
            choicesEl.style.display = 'flex';

            step.choices.forEach(c => {
                const btn = document.createElement('button');
                btn.className = 'story-choice-btn';
                btn.innerText = c.text;
                btn.onclick = (event) => {
                    event.stopPropagation();
                    btn.blur();
                    isChoiceAnswered = true;
                    if (c.speaker !== undefined) {
                        document.getElementById('speakerName').innerText = c.speaker;
                    }
                    if (c.marukoImg && marukoEl) marukoEl.src = c.marukoImg;
                    if (c.charImg) charEl.src = c.charImg;
                    choicesEl.innerHTML = '';
                    choicesEl.style.display = 'none';

                    startTypewriter(c.nextText, () => {
                        if (step.showTicketModalAfterChoice) {
                            setTimeout(() => {
                                showRewardModal('ticket');
                            }, 600);
                        } else {
                            nextBtn.style.display = 'inline-block';
                        }
                    });
                };
                choicesEl.appendChild(btn);
            });
        } else if (step.isGameTrigger) {
            startGameBtn.style.display = 'inline-block';
        } else if (step.showMangoIceModal) {
            setTimeout(() => {
                showRewardModal('mangoIce');
            }, 600);
        } else {
            nextBtn.style.display = 'inline-block';
        }
    });
}

function nextDialogue(e) {
    if (e) e.stopPropagation();
    
    if (modalDelayTimer) return;

    const step = storyScript[currentStoryStep];

    if (isTypewriting) {
        if (typewriterTimer) clearInterval(typewriterTimer);
        typewriterTimer = null;
        isTypewriting = false;
        document.getElementById('dialogueText').innerText = currentFullText;
        
        const nextBtn = document.getElementById('nextDialogueBtn');
        const startGameBtn = document.getElementById('startMinigameFromStoryBtn');
        const choicesEl = document.getElementById('storyChoices');
        const marukoEl = document.getElementById('storyCharMaruko');
        const charEl = document.getElementById('storyChar');
        
        if (step.choices && !isChoiceAnswered) {
            choicesEl.innerHTML = '';
            choicesEl.style.display = 'flex';
            step.choices.forEach(c => {
                const btn = document.createElement('button');
                btn.className = 'story-choice-btn';
                btn.innerText = c.text;
                btn.onclick = (event) => {
                    event.stopPropagation();
                    btn.blur();
                    isChoiceAnswered = true;
                    if (c.speaker !== undefined) {
                        document.getElementById('speakerName').innerText = c.speaker;
                    }
                    if (c.marukoImg && marukoEl) marukoEl.src = c.marukoImg;
                    if (c.charImg) charEl.src = c.charImg;
                    choicesEl.innerHTML = '';
                    choicesEl.style.display = 'none';

                    startTypewriter(c.nextText, () => {
                        if (step.showTicketModalAfterChoice) {
                            modalDelayTimer = setTimeout(() => {
                                modalDelayTimer = null;
                                showRewardModal('ticket');
                            }, 600);
                        } else {
                            nextBtn.style.display = 'inline-block';
                        }
                    });
                };
                choicesEl.appendChild(btn);
            });
        } else if (step.isGameTrigger) {
            startGameBtn.style.display = 'inline-block';
        } else if (step.showMangoIceModal) {
            modalDelayTimer = setTimeout(() => {
                modalDelayTimer = null;
                showRewardModal('mangoIce');
            }, 600);
        } else if (step.showTicketModalAfterChoice && isChoiceAnswered) {
            modalDelayTimer = setTimeout(() => {
                modalDelayTimer = null;
                showRewardModal('ticket');
            }, 600);
        } else {
            nextBtn.style.display = 'inline-block';
        }
        return;
    }

    if (step.choices && !isChoiceAnswered) return;

    if (step.isFinalStoryEnd) {
        document.getElementById('storyModal').classList.remove('active');
        finishRegionAndReturnMap();
        return;
    }

    currentStoryStep++;
    if (currentStoryStep < storyScript.length) {
        renderStoryStep();
    }
}

function showGameInstructionModal(e) {
    if (e) e.stopPropagation();
    document.getElementById('modalTitle').innerText = '採芒果挑戰說明';
    document.getElementById('modalText').innerHTML = `
        <div style="text-align:left; line-height:1.7;">
            <p style="color:#ffd700; font-weight:bold; margin-bottom:8px;">【操作簡介】</p>
            <p>1. 使用鍵盤 <b>A / D</b> 或 <b>左 / 右方向鍵</b> 移動籃子。</p>
            <p>2. 接住掉落的 <b>芒果</b>（成功收集 5 顆即可通關）。</p>
            <p>3. 接錯其他水果會扣除愛心生命數，扣完則挑戰失敗！</p>
        </div>
    `;
    document.getElementById('modalBtn').innerText = '開始遊戲';
    pendingAction = 'startMinigameFromModal';
    document.getElementById('gameModal').classList.add('show');
}
function startMinigameFromStory() {
    document.getElementById('storyModal').classList.remove('active');
    startMinigame();
}

function showRewardModal(type) {
    if (type === 'mangoIce') {
        document.getElementById('modalTitle').innerText = '獲得招牌芒果冰！';
        document.getElementById('modalText').innerHTML = `
            <div style="text-align:center;">
                <img src="劇情/芒果冰.jpg" style="height:220px; object-fit:contain; margin-bottom:10px;" alt="芒果冰" onerror="this.src='劇情/芒果冰.png'">
                <p>店長送給你一碗香甜可口的【玉井招牌芒果冰】！</p>
            </div>
        `;
        document.getElementById('modalBtn').innerText = '收下';
        pendingAction = 'continueStoryAfterReward';
    } else if (type === 'ticket') {
        document.getElementById('modalTitle').innerText = '獲得神秘火車票！';
        document.getElementById('modalText').innerHTML = `
            <div style="text-align:center;">
                <img src="劇情/車票_新化.png" style="height:220px; object-fit:contain; margin-bottom:10px;" alt="火車票">
                <p>獲得代表【新化站】的神祕火車票</p>
            </div>
        `;
        document.getElementById('modalBtn').innerText = '收下';
        pendingAction = 'continueStoryAfterReward';
    }
    document.getElementById('gameModal').classList.add('show');
}

function startMinigame() {
    document.getElementById('minigameView').style.display = 'block';
    document.body.classList.add('hide-cursor');
    initGame();
}

let gameInterval, fruitSpawner;
let playerX = 330;
let playerY = 390;
const playerSpeed = 7;
let lives = 3;
let mangoCount = 0;
const targetMango = 5;
let keys = {};
let fruits = [];
let collectedFruitList = [];
let isGameOverState = false;

const fruitTypes = [
    { name: '芒果', img: '水果關卡/芒果.png', isMango: true },
    { name: '草莓', img: '水果關卡/草莓.png', isMango: false },
    { name: '香蕉', img: '水果關卡/香蕉.png', isMango: false },
    { name: '葡萄', img: '水果關卡/葡萄.png', isMango: false },
    { name: '蘋果', img: '水果關卡/蘋果.png', isMango: false }
];

function initGame() {
    lives = 3;
    mangoCount = 0;
    const container = document.getElementById('minigameView');
    const viewWidth = container ? container.clientWidth : window.innerWidth;
    const viewHeight = container ? container.clientHeight : window.innerHeight;

    playerX = (viewWidth - 240) / 2;
    playerY = viewHeight - 250;
    collectedFruitList = [];
    keys = {};
    isGameOverState = false;
    updateHUD();
    
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    clearInterval(fruitSpawner);
    cancelAnimationFrame(gameInterval);
    fruitSpawner = setInterval(spawnFruits, 1200);
    gameInterval = requestAnimationFrame(updateGame);
}

function handleKeyDown(e) { keys[e.key.toLowerCase()] = true; }
function handleKeyUp(e) { keys[e.key.toLowerCase()] = false; }

function spawnFruits() {
    const container = document.getElementById('minigameView');
    if (!container || container.style.display === 'none' || isGameOverState) return;
    
    const viewWidth = container.clientWidth || window.innerWidth;
    const count = Math.floor(Math.random() * 2) + 1;
    let spawnedXList = [];

    for (let i = 0; i < count; i++) {
        let startX;
        let attempts = 0;
        
        do {
            startX = 40 + Math.random() * Math.max(100, viewWidth - 180);
            attempts++;
        } while (
            spawnedXList.some(x => Math.abs(x - startX) < 150) && attempts < 15
        );

        spawnedXList.push(startX);

        const fruit = document.createElement('div');
        fruit.className = 'falling-fruit';
        
        const randomFruit = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
        fruit.style.left = startX + 'px';
        fruit.style.top = '-100px';
        
        fruit.innerHTML = `<img src="${randomFruit.img}" alt="${randomFruit.name}">`;
        container.appendChild(fruit);

        fruits.push({
            element: fruit,
            x: startX,
            y: -100,
            speed: 1.5 + Math.random() * 0.9,
            isMango: randomFruit.isMango,
            img: randomFruit.img
        });
    }
}

function updateGame() {
    if (isGameOverState) return;
    const container = document.getElementById('minigameView');
    const containerWidth = container ? container.clientWidth : window.innerWidth;
    const containerHeight = container ? container.clientHeight : window.innerHeight;

    if (keys['a'] || keys['arrowleft']) playerX -= playerSpeed;
    if (keys['d'] || keys['arrowright']) playerX += playerSpeed;

    playerX = Math.max(0, Math.min(containerWidth - 240, playerX));
    playerY = containerHeight - 250;

    const catEl = document.getElementById('playerCat');
    if (catEl) {
        catEl.style.left = playerX + 'px';
        catEl.style.top = playerY + 'px';
    }

    for (let i = fruits.length - 1; i >= 0; i--) {
        let f = fruits[i];
        f.y += f.speed;
        f.element.style.top = f.y + 'px';

        const fruitCenterX = f.x + 50; 
        const fruitCenterY = f.y + 50;

        if (
            fruitCenterY >= playerY + 10 &&
            fruitCenterY <= playerY + 75 &&
            fruitCenterX >= playerX + 35 &&
            fruitCenterX <= playerX + 195
        ) {
            if (f.isMango) {
                mangoCount++;
                collectedFruitList.push(f.img);
                updateHUD();

                f.element.remove();
                fruits.splice(i, 1);

                if (mangoCount >= targetMango) {
                    isGameOverState = true;
                    cancelAnimationFrame(gameInterval);
                    clearInterval(fruitSpawner);
                    gameWin();
                    return;
                }
            } else {
                lives--;
                updateHUD();

                f.element.remove();
                fruits.splice(i, 1);

                if (lives <= 0) {
                    isGameOverState = true;
                    cancelAnimationFrame(gameInterval);
                    clearInterval(fruitSpawner);
                    gameOver();
                    return;
                }
            }
            continue;
        }

        if (f.y > containerHeight) {
            f.element.remove();
            fruits.splice(i, 1);
        }
    }

    gameInterval = requestAnimationFrame(updateGame);
}

function updateHUD() {
    const scoreText = document.getElementById('scoreText');
    if (scoreText) scoreText.innerText = `已接芒果: ${mangoCount} / ${targetMango}`;
    
    const heartsContainer = document.getElementById('heartsContainer');
    if (heartsContainer) {
        let heartsHTML = '';
        for (let i = 0; i < lives; i++) {
            heartsHTML += `<img src="水果關卡/生命數.png" class="heart-icon" alt="heart">`;
        }
        heartsContainer.innerHTML = heartsHTML;
    }

    const collectedContainer = document.getElementById('collectedFruits');
    if (collectedContainer) {
        const mangoPositions = [
            { left: 42, top: -5 },
            { left: 2,  top: 0 },
            { left: 82, top: 0 },
            { left: 22, top: 8 },
            { left: 62, top: 8 }
        ];

        let fruitsHTML = '';
        collectedFruitList.forEach((imgSrc, index) => {
            const pos = mangoPositions[index] || { left: 42, top: -5 };
            fruitsHTML += `<img src="${imgSrc}" class="mango-in-basket" style="left: ${pos.left}px; top: ${pos.top}px;" alt="collected mango">`;
        });
        collectedContainer.innerHTML = fruitsHTML;
    }
}

function gameWin() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    fruits.forEach(f => f.element.remove());
    fruits = [];
    document.body.classList.remove('hide-cursor');

    document.getElementById('modalTitle').innerText = '採收成功！';
    document.getElementById('modalText').innerText = '太棒了！你成功採集了 5 顆新鮮芒果，快拿去交給店長吧！';
    document.getElementById('modalBtn').innerText = '確定';
    pendingAction = 'winGameReturnStory';
    document.getElementById('gameModal').classList.add('show');
}

function gameOver() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    fruits.forEach(f => f.element.remove());
    fruits = [];
    document.body.classList.remove('hide-cursor');

    document.getElementById('modalTitle').innerText = '採收失敗';
    document.getElementById('modalText').innerText = '別灰心，再試一次」';
    document.getElementById('modalBtn').innerText = `再試一次`;
    pendingAction = 'retryGame';
    document.getElementById('gameModal').classList.add('show');
}

function closeModal() {
    document.getElementById('gameModal').classList.remove('show');
    
    if (pendingAction === 'startMinigameFromModal') {
        startMinigameFromStory();
        pendingAction = null;
    } else if (pendingAction === 'winGameReturnStory') {
        document.getElementById('minigameView').style.display = 'none';
        document.getElementById('storyModal').classList.add('active');
        currentStoryStep = 7; 
        renderStoryStep();
        pendingAction = null;
    } else if (pendingAction === 'retryGame') {
        startMinigame();
    } else if (pendingAction === 'continueStoryAfterReward') {
        nextDialogue();
        pendingAction = null;
    }
}

function finishRegionAndReturnMap() {
    document.body.classList.remove('hide-cursor');

    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'STAGE_CLEARED', region: '玉井' }, '*');
        return;
    }

    document.getElementById('minigameView').style.display = 'none';
    resetBookPage();
    document.getElementById('historyBookModal').classList.add('active');
}