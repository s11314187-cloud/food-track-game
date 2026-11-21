let currentStoryStep = 0;
let typewriterTimer = null;
let modalDelayTimer = null;
let currentFullText = "";
let isTypewriting = false;
let pendingAction = null;
let activePhase = 1;

let currentBookPage = 1;
const totalBookPages = 3;

let gameStats = {
    harvested: 0,
    cleaned: 0,
    bakedPerfect: 0,
    damaged: 0
};

window.onload = function() {
    initGlobalKeyListener();
    resetBookPage();
    document.getElementById('historyBookModal').classList.add('active');
};

function clearToolCursors() {
    document.body.classList.remove('cursor-shovel', 'cursor-brush');
}

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

function startStoryFromBook() {
    document.getElementById('historyBookModal').classList.remove('active');
    document.getElementById('storyModal').classList.add('active');
    currentStoryStep = 0;
    renderStoryStep();
}

const shanhuaFullScript = [
    { speaker: "", text: "神秘列車緩緩停靠在新化區。\n玩家與穿著地瓜裝的小丸一起走下列車，街道上飄來陣陣香氣，遠處還傳來炭火燃燒的劈啪聲。", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "", bgImg: "" },
    { speaker: "小丸", text: "「咦？這是什麼味道？聞起來好香喔！好像是剛烤好的地瓜！」", marukoImg: "小丸/吉祥物地瓜裝_睜眼開口.png", managerImg: "", bgImg: "" },
    { speaker: "", text: "(循著香氣尋找，小丸和玩家來到一間古早味烤地瓜攤。攤位旁放著一座有些年紀的老烤窯，老闆正皺著眉頭，仔細檢查裡面的地瓜。)", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫_差分3.png", bgImg: "" },
    { speaker: "小丸", text: "「老闆，你怎麼愁眉苦臉的？這些地瓜看起來快烤好了呀！」", marukoImg: "小丸/吉祥物地瓜裝_睜眼開口.png", managerImg: "地瓜田/地瓜農夫_差分3.png", bgImg: "" },
    { speaker: "老闆", text: "「唉，說來不好意思。這座烤窯是我家留下來的老東西，最近我才重新整理好，想烤出以前家裡那種香甜的地瓜。沒想到試了好幾次，不是外皮焦掉，就是裡面還沒熟透。」", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫_差分3.png", bgImg: "" },
    { speaker: "小丸", text: "「烤地瓜也有這麼多學問嗎？」", marukoImg: "小丸/吉祥物地瓜裝_閉眼開口.png", managerImg: "地瓜田/地瓜農夫_差分2.png", bgImg: "" },
    { speaker: "老闆", text: "「當然！火候、翻面的時間，每一樣都很重要。以前家裡的長輩只要看看顏色、聽聽炭火的聲音，就知道什麼時候該翻面。換成我自己來，卻怎麼也抓不準。」", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫_差分3.png", bgImg: "" },
    { speaker: "", text: "(小丸好奇地靠近烤窯，發現裡面的地瓜有些已經開始變色，有些卻還是淡黃色。)", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫_差分2.png", bgImg: "" },
    { speaker: "小丸", text: "「原來如此！如果翻面時間不對，就可能讓地瓜受熱不均勻。」", marukoImg: "小丸/吉祥物地瓜裝_睜眼開口.png", managerImg: "地瓜田/地瓜農夫_差分1.png", bgImg: "" },
    { speaker: "老闆", text: "「沒錯！我已經浪費了好幾批地瓜，卻還是找不到最適合的烘烤方式。如果今天再失敗，真的不知道該怎麼辦了。」", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫_差分3.png", bgImg: "" },
    { speaker: "小丸", text: "「我們來得正是時候！要不要幫老闆一起試試看？」", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫_差分2.png", bgImg: "",
        choices: [
            { 
                text: "「聽起來很有趣！我想試試看能不能抓準火候！」", 
                speaker: "小丸 & 老闆",
                nextText: "小丸：「嘿嘿！有信心是好事！只要仔細觀察、一步一步來，就有機會成功！」\n\n老闆：「哈哈，有這份幹勁就很好！不過別太心急，烤地瓜最需要的就是耐心。」", 
                marukoImg: "小丸/吉祥物地瓜裝_睜眼開口.png",
                managerImg: "地瓜田/地瓜農夫.png"
            },
            { 
                text: "「可是我們沒有烤過地瓜耶，真的能幫得上忙嗎？」", 
                speaker: "小丸 & 老闆",
                nextText: "小丸：「別擔心！我們可以從最簡單的步驟開始學起，只要仔細觀察，就一定有機會掌握技巧！」\n\n老闆：「沒錯！我第一次學的時候也常常失敗。願意嘗試就很好，我會教你們怎麼做。」", 
                marukoImg: "小丸/吉祥物地瓜裝_閉眼開口.png",
                managerImg: "地瓜田/地瓜農夫_差分1.png"
            }
        ]
    },
    { speaker: "", text: "(老闆看見玩家願意幫忙，便將一個竹籃交給小丸，裡面放著採收用的小鏟子、清洗用的刷子，以及烤地瓜用的長夾。)", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫_差分1.png", bgImg: "" },
    { speaker: "老闆", text: "「既然你們願意幫忙，那就拜託了！不過，地瓜不能直接拿去烤。我們得先從農田裡把地瓜挖出來，再仔細清洗，最後才能放進烤窯。」", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫.png", bgImg: "" },
    { speaker: "小丸", text: "「原來還有這麼多步驟！那我們就從挖地瓜開始吧！」", marukoImg: "小丸/吉祥物地瓜裝_睜眼開口.png", managerImg: "地瓜田/地瓜農夫_差分1.png", bgImg: "" },
    { speaker: "老闆", text: "「很好！記得每個步驟都要仔細，因為只要其中一個環節做不好，最後烤出來的地瓜就可能不夠漂亮。」", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫.png", bgImg: "" },
    { speaker: "小丸", text: "「準備好了嗎？新化地瓜職人挑戰，現在開始！」", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫_差分1.png", bgImg: "", triggerGamePhase: 1 },

    { speaker: "小丸", text: "「第一關完成！接下來要把地瓜洗乾淨，才能準備進烤窯喔！」", marukoImg: "小丸/吉祥物地瓜裝_睜眼開口.png", managerImg: "", bgImg: "" },
    { speaker: "老闆", text: "「剛挖出來的地瓜還沾著不少泥土，要先清洗乾淨，才能放進烤窯。注意喔，表面和凹陷處的泥巴都要刷掉！」", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫.png", bgImg: "" },
    { speaker: "小丸", text: "「交給我們吧！我要讓每一顆地瓜都乾乾淨淨的！」", marukoImg: "小丸/吉祥物地瓜裝_睜眼開口.png", managerImg: "地瓜田/地瓜農夫_差分1.png", bgImg: "", triggerGamePhase: 2 },

    { speaker: "老闆", text: "「做得不錯！地瓜洗乾淨了，接下來就是真正考驗技術的時候了！」", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫.png", bgImg: "" },
    { speaker: "小丸", text: "「最後一關！我們一定要烤出金黃香甜的地瓜！」", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫_差分1.png", bgImg: "" },
    { speaker: "老闆", text: "「前面兩關都完成了，最後就是烘烤。烤地瓜最重要的就是控制火候，並在適當的時間翻面。火太小會烤不熟，火太大又容易烤焦，可要仔細注意喔！」", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫.png", bgImg: "劇情/冰店.jpg" },
    { speaker: "小丸", text: "「這次要一顆一顆細心烘烤！讓每一顆都烤得剛剛好！」", marukoImg: "小丸/吉祥物地瓜裝_睜眼開口.png", managerImg: "地瓜田/地瓜農夫_差分1.png", bgImg: "", triggerGamePhase: 3 },

    { speaker: "", text: "(老闆小心翼翼地將剛烤好的地瓜夾出來，稍微放涼後，分給玩家與小丸品嚐。)", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫_差分1.png", bgImg: "" },
    { speaker: "老闆", text: "「今天真的多虧了你們！這些地瓜就請你們吃，也算是我謝謝你們的心意。」", marukoImg: "小丸/吉祥物地瓜裝_睜眼開口.png", managerImg: "地瓜田/地瓜農夫.png", bgImg: "" },
    { speaker: "小丸", text: "「謝謝老闆！這可是我們親手幫忙製作的地瓜，吃起來一定特別香甜！」", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫_差分1.png", bgImg: "" },
    { speaker: "", text: "(玩家與小丸品嚐著熱呼呼的烤地瓜。外皮微微焦香，剝開後露出綿密柔軟的金黃色果肉。)", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "", propImg: "地瓜田/撥開的地瓜.png", bgImg: "" },
    { speaker: "", text: "(小丸看了看玩家手中的神秘地圖，發現原本暗淡的新化區已經亮起了金黃色光芒，地圖上還有許多尚未點亮區域。)", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "", bgImg: "" },
    { speaker: "小丸", text: "「你看！新化區終於亮起來了！看來我們成功完成這裡的探索任務了！」", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "", bgImg: "" },
    { speaker: "老闆", text: "「真神奇！這張地圖似乎會隨著你們完成每個地區的任務，逐漸恢復原本的光芒。」", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫.png", bgImg: "" },
    { speaker: "", text: "(小丸看着地圖，發現新化區旁邊突然出現了一道微弱的光線，正慢慢延伸到另一個尚未點亮的區域。)", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "", bgImg: "" },
    { speaker: "小丸", text: "「咦？你們看！地圖好像出現新的路線了！」", marukoImg: "小丸/吉祥物地瓜裝_睜眼開口.png", managerImg: "地瓜田/地瓜農夫_差分1.png", bgImg: "" },
    { speaker: "老闆", text: "「看來這張地圖正在一步步帶領你們探索台南。記得，每個地方都有自己的故事和美食，別忘了好好感受這趟旅程。」", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "地瓜田/地瓜農夫.png", bgImg: "",
        choices: [
            { 
                text: "「太好了！我們趕快看看下一站在哪裡吧！」", 
                speaker: "小丸",
                nextText: "「嘿嘿！我也很好奇！不知道下一個地方又有什麼好吃的美食在等著我們！」", 
                marukoImg: "小丸/吉祥物地瓜裝_睜眼開口.png" 
            },
            { 
                text: "「沒問題!我們會好好享受這趟旅程」", 
                speaker: "小丸",
                nextText: "「對啊！每完成一個地方的探索，地圖就會出現新的變化，感覺就像在解開一個大秘密！」", 
                marukoImg: "小丸/吉祥物地瓜裝.png" 
            }
        ]
    },
    { speaker: "", text: "(地圖上的新區域亮起，旁邊同時浮現出一張小小的列車車票。)", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "", bgImg: "", showTicketModal: true },
    { speaker: "", text: "(小丸興奮地拿起車票，上面清楚印著下一個目的地的名稱。)", marukoImg: "小丸/吉祥物地瓜裝.png", managerImg: "", bgImg: "" },
    { speaker: "小丸", text: "「太棒了！地圖幫我們找到下一站了！快點，我們趕快去搭列車吧！」", marukoImg: "小丸/吉祥物地瓜裝_睜眼開口.png", managerImg: "", bgImg: "" },
    {
        title: "前往下一站",
        speaker: "系統提示",
        text: "新化區關卡完成，請準備搭乘火車，展開新的冒險！",
        marukoImg: "",
        charImg: "",
        bgImg: "",
        isFinalStoryEnd: true
    }
];

function initGlobalKeyListener() {
    window.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        e.stopPropagation();
        if (e.repeat) return;

        const gameModal = document.getElementById('gameModal');
        if (gameModal && gameModal.classList.contains('show')) {
            closeModal();
            return;
        }

        const minigameView = document.getElementById('minigameView');
        if (minigameView && getComputedStyle(minigameView).display !== 'none') return;

        const historyModal = document.getElementById('historyBookModal');
        if (historyModal && historyModal.classList.contains('active')) return;

        const storyModal = document.getElementById('storyModal');
        if (!storyModal || !storyModal.classList.contains('active')) return;

        const choicesEl = document.getElementById('storyChoices');
        if (choicesEl && getComputedStyle(choicesEl).display !== 'none') return;

        const startPhaseBtn = document.getElementById('startPhaseBtn');
        if (startPhaseBtn && getComputedStyle(startPhaseBtn).display !== 'none') {
            startCurrentPhase();
            return;
        }

        nextDialogue();
    }, true);
}

function handleStoryClick() {
    const choicesEl = document.getElementById('storyChoices');
    if (choicesEl && choicesEl.style.display !== 'none') return;
    const startPhaseBtn = document.getElementById('startPhaseBtn');
    if (startPhaseBtn && startPhaseBtn.style.display !== 'none') return;
    nextDialogue();
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
    }, 28);
}

let isChoiceAnswered = false;

function handleStepTextComplete(step) {
    const speakerEl = document.getElementById('speakerName');
    const marukoEl = document.getElementById('storyCharMaruko');
    const managerEl = document.getElementById('storyCharManager');
    const choicesEl = document.getElementById('storyChoices');
    const nextBtn = document.getElementById('nextDialogueBtn');
    const startPhaseBtn = document.getElementById('startPhaseBtn');

    if (step.choices && !isChoiceAnswered) {
        choicesEl.innerHTML = '';
        choicesEl.style.display = 'flex';
        step.choices.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'story-choice-btn';
            btn.innerText = c.text;
            btn.onclick = (event) => {
                event.stopPropagation();
                isChoiceAnswered = true;
                choicesEl.innerHTML = '';
                choicesEl.style.display = 'none';

                if (c.speaker !== undefined) {
                    if (c.speaker.trim() === "") {
                        speakerEl.style.display = 'none';
                    } else {
                        speakerEl.innerText = c.speaker;
                        speakerEl.style.display = 'block';
                    }
                }
                if (c.marukoImg) marukoEl.src = c.marukoImg;
                if (c.managerImg) managerEl.src = c.managerImg;

                startTypewriter(c.nextText, () => {
                    nextBtn.style.display = 'inline-block';
                });
            };
            choicesEl.appendChild(btn);
        });
    } else if (step.triggerGamePhase) {
        activePhase = step.triggerGamePhase;
        startPhaseBtn.style.display = 'inline-block';
    } else if (step.propImg) {
        modalDelayTimer = setTimeout(() => {
            modalDelayTimer = null;
            showRewardModal('potato');
            nextBtn.style.display = 'inline-block';
        }, 900);
    } else if (step.showTicketModal) {
        modalDelayTimer = setTimeout(() => {
            modalDelayTimer = null;
            showRewardModal('ticket');
            nextBtn.style.display = 'inline-block';
        }, 900);
    } else {
        nextBtn.style.display = 'inline-block';
    }
}

function renderStoryStep() {
    isChoiceAnswered = false;
    if (modalDelayTimer) {
        clearTimeout(modalDelayTimer);
        modalDelayTimer = null;
    }
    const step = shanhuaFullScript[currentStoryStep];
    const speakerEl = document.getElementById('speakerName');
    const choicesEl = document.getElementById('storyChoices');
    const nextBtn = document.getElementById('nextDialogueBtn');
    const startPhaseBtn = document.getElementById('startPhaseBtn');

    if (!step.speaker || step.speaker.trim() === "" || step.text.startsWith("（")) {
        speakerEl.style.display = 'none';
    } else {
        speakerEl.innerText = step.speaker;
        speakerEl.style.display = 'block';
    }
    
    const marukoEl = document.getElementById('storyCharMaruko');
    if (step.marukoImg) {
        marukoEl.src = step.marukoImg;
        marukoEl.style.display = 'block';
    } else {
        marukoEl.style.display = 'none';
    }

    const managerEl = document.getElementById('storyCharManager');
    if (step.managerImg) {
        managerEl.src = step.managerImg;
        managerEl.style.display = 'block';
    } else {
        managerEl.style.display = 'none';
    }

    const propDisplayEl = document.getElementById('storyPropDisplay');
    if (propDisplayEl) propDisplayEl.style.display = 'none';

    choicesEl.style.display = 'none';
    nextBtn.style.display = 'none';
    startPhaseBtn.style.display = 'none';

    startTypewriter(step.text, () => {
        handleStepTextComplete(step);
    });
}

let lastEnterTime = 0;

function nextDialogue(e) {
    if (e) e.stopPropagation();
    const now = Date.now();
    if (now - lastEnterTime < 180) return;
    lastEnterTime = now;

    if (modalDelayTimer) return;
    const step = shanhuaFullScript[currentStoryStep];

    if (isTypewriting) {
        if (typewriterTimer) clearInterval(typewriterTimer);
        typewriterTimer = null;
        isTypewriting = false;
        document.getElementById('dialogueText').innerText = currentFullText;
        handleStepTextComplete(step);
        return;
    }

    const choicesEl = document.getElementById('storyChoices');
    const startPhaseBtn = document.getElementById('startPhaseBtn');
    if ((choicesEl && choicesEl.style.display !== 'none') ||
        (startPhaseBtn && startPhaseBtn.style.display !== 'none')) {
        return;
    }

    if (step && step.isFinalStoryEnd) {
        finishShanhuaAndReturnMap();
        return;
    }

    currentStoryStep++;
    if (currentStoryStep < shanhuaFullScript.length) {
        renderStoryStep();
    }
}

function finishShanhuaAndReturnMap() {
    clearInterval(timerInterval);
    stopNeedleLoop();
    clearToolCursors();
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'STAGE_CLEARED', region: '新化' }, '*');
        return;
    }
    document.getElementById('storyModal').classList.remove('active');
    document.getElementById('minigameView').style.display = 'none';
    resetBookPage();
    document.getElementById('historyBookModal').classList.add('active');
}

function startCurrentPhase(e) {
    if (e) e.stopPropagation();
    if (document.activeElement) document.activeElement.blur();

    const startPhaseBtn = document.getElementById('startPhaseBtn');
    if (startPhaseBtn) startPhaseBtn.style.display = 'none';

    document.getElementById('storyModal').classList.remove('active');
    document.getElementById('minigameView').style.display = 'flex';

    document.getElementById('stage1Area').style.display = 'none';
    document.getElementById('stage2Area').style.display = 'none';
    document.getElementById('stage3Area').style.display = 'none';

    showGameInstructionModal();
}

function showGameInstructionModal(e) {
    if (e) e.stopPropagation();

    const imgWrap = document.getElementById('modalImgWrap');
    if (imgWrap) imgWrap.style.display = 'none';

    if (activePhase === 1) {
        document.getElementById('modalTitle').innerText = '第一關：挖地瓜挑戰說明';
        document.getElementById('modalText').innerHTML = `
            <div style="text-align:left; line-height:1.8;">
                <p style="color:#ffd700; font-weight:bold; margin-bottom:8px;">【操作簡介】</p>
                <p>1. 先點擊右下角 <b>「鏟子圖標」</b> 裝備鏟子。</p>
                <p>2. 點擊土堆<b>一次</b>，鏟子會自動挖開土層露出地瓜。</p>
                <p>3. 用滑鼠<b>按住地瓜往上拖拉</b>，拉出來即可在 <b>60秒內採收 4 顆地瓜</b>！</p>
            </div>
        `;
    } else if (activePhase === 2) {
        document.getElementById('modalTitle').innerText = '第二關：地瓜清潔說明';
        document.getElementById('modalText').innerHTML = `
            <div style="text-align:left; line-height:1.8;">
                <p style="color:#ffd700; font-weight:bold; margin-bottom:8px;">【操作簡介】</p>
                <p>1. 先點擊右下角 <b>「刷子圖標」</b></p>
                <p>2. <b>一顆一顆依序清洗</b></p>
                <p>3. 將 <b>4 顆地瓜</b> 刷洗成乾淨的樣子即可通關！</p>
            </div>
        `;
    } else if (activePhase === 3) {
        document.getElementById('modalTitle').innerText = '第三關：火候大師挑戰說明';
        document.getElementById('modalText').innerHTML = `
            <div style="text-align:left; line-height:1.8;">
                <p style="color:#ffd700; font-weight:bold; margin-bottom:8px;">【操作簡介】</p>
                <p>1. 左側直立溫度計中，<b>請按下方按鈕維持在黃色區。</b></p>
                <p>2. <b>一顆一顆烘烤</b>，共有 <b>5 種熟度階段</b>，熟度達 <b>50%</b>時記得<b>點擊地瓜翻面</b>。</p>
                <p>3. 完美烤熟 <b>3 顆地瓜</b> 即可通關！</p>
            </div>
        `;
    }

    document.getElementById('modalBtn').innerText = '開始遊戲';
    pendingAction = 'startMinigameFromModal';
    document.getElementById('gameModal').classList.add('show');
}

/* ==================== 第一關：先點鏟子 -> 點一次土堆自動挖開 -> 按住往上拉晃動拔出 (60秒) ==================== */
let timerInterval;
let gameTimeLeft = 60;
let isShovelEquipped = false;

function equipShovel() {
    isShovelEquipped = true;
    document.body.classList.add('cursor-shovel');
    const tool = document.getElementById('shovelTool');
    const label = document.getElementById('shovelToolLabel');
    const hint = document.getElementById('stage1Hint');
    if (tool) tool.classList.add('equipped');
    if (label) label.innerText = '已裝備鏟子';
    if (hint) hint.innerText = '點擊土堆挖開土層，露出地瓜後「按住往上拖拉」拔出！';
}

function initStage1() {
    clearToolCursors();
    isShovelEquipped = false;

    document.getElementById('stageTitle').innerText = "第一關：地瓜採收大作戰";
    document.getElementById('stage1Area').style.display = 'flex';
    document.getElementById('stage2Area').style.display = 'none';
    document.getElementById('stage3Area').style.display = 'none';
    document.getElementById('timerBox').style.display = 'block';

    const tool = document.getElementById('shovelTool');
    const label = document.getElementById('shovelToolLabel');
    const hint = document.getElementById('stage1Hint');
    if (tool) tool.classList.remove('equipped');
    if (label) label.innerText = '點擊裝備鏟子';
    if (hint) hint.innerText = '請先點擊右下角「鏟子圖標」！';

    gameTimeLeft = 60;
    gameStats.harvested = 0;
    document.getElementById('timerText').innerText = gameTimeLeft;
    document.getElementById('scoreText').innerText = `0 / 4`;

    const grid = document.getElementById('dirtGrid');
    grid.innerHTML = '';

    const moundData = [
        { type: 'potato', state: 'hidden' },
        { type: 'stone',  state: 'hidden' },
        { type: 'potato', state: 'hidden' },
        { type: 'empty',  state: 'hidden' },
        { type: 'potato', state: 'hidden' },
        { type: 'stone',  state: 'hidden' },
        { type: 'potato', state: 'hidden' },
        { type: 'empty',  state: 'hidden' }
    ];

    moundData.forEach((data, index) => {
        const el = document.createElement('div');
        el.className = 'dirt-mound';
        el.innerHTML = `🌱 土堆 ${index + 1}`;
        el.onclick = () => handleMoundClick(el, data);
        grid.appendChild(el);
    });

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        gameTimeLeft--;
        document.getElementById('timerText').innerText = gameTimeLeft;
        if (gameTimeLeft <= 0) {
            clearInterval(timerInterval);
            checkStage1Result();
        }
    }, 1000);
}

function handleMoundClick(el, data) {
    if (data.state !== 'hidden') return;

    if (!isShovelEquipped) {
        const hint = document.getElementById('stage1Hint');
        if (hint) hint.innerText = '請先點擊右下角的「鏟子圖標」才能挖土喔！';
        return;
    }

    data.state = 'digging';
    el.classList.add('dug-open');
    el.innerHTML = `
        <img src="地瓜田/鏟子.png" class="auto-dig-shovel" alt="挖掘動畫">
        <span style="color:#ffd700; font-weight:bold;">挖掘中...</span>
    `;

    setTimeout(() => {
        if (data.type === 'potato') {
            data.state = 'revealed';
            el.innerHTML = `
                <img src="地瓜田/剛拔出來的地瓜.png" class="pullable-potato" alt="地瓜">
                <div class="mound-hint-text">⬆按住往上拉拔出！</div>
            `;
            const potatoImg = el.querySelector('.pullable-potato');
            attachPullUpHandler(el, potatoImg, data);
        } else if (data.type === 'stone') {
            data.state = 'done';
            el.innerHTML = `<div style="font-size:40px;">🪨</div><small style="color:#ccc;">挖到石頭了</small>`;
        } else {
            data.state = 'done';
            el.innerHTML = `<small style="color:#bbb;">空的土堆</small>`;
        }
    }, 550);
}

function attachPullUpHandler(moundEl, potatoImg, data) {
    let isDragging = false;
    let startY = 0;

    const onPointerDown = (e) => {
        if (data.state !== 'revealed') return;
        e.stopPropagation();
        e.preventDefault();
        isDragging = true;
        startY = e.clientY;
        potatoImg.classList.add('pulling');
        if (potatoImg.setPointerCapture) {
            potatoImg.setPointerCapture(e.pointerId);
        }
    };

    const onPointerMove = (e) => {
        if (!isDragging || data.state !== 'revealed') return;
        const deltaY = e.clientY - startY;
        const clampedY = Math.max(-75, Math.min(10, deltaY));
        potatoImg.style.setProperty('--pull-y', `${clampedY}px`);
        potatoImg.style.transform = `translateY(${clampedY}px)`;

        if (clampedY <= -48) {
            isDragging = false;
            data.state = 'done';
            potatoImg.classList.remove('pulling');
            gameStats.harvested++;
            document.getElementById('scoreText').innerText = `${gameStats.harvested} / 4`;
            moundEl.innerHTML = `成功拔出地瓜！`;
            moundEl.style.opacity = '0.65';

            if (gameStats.harvested >= 4) {
                clearInterval(timerInterval);
                setTimeout(checkStage1Result, 350);
            }
        }
    };

    const onPointerUp = () => {
        if (!isDragging) return;
        isDragging = false;
        potatoImg.classList.remove('pulling');
        if (data.state === 'revealed') {
            potatoImg.style.setProperty('--pull-y', '0px');
            potatoImg.style.transform = 'translateY(0px)';
        }
    };

    potatoImg.addEventListener('pointerdown', onPointerDown);
    potatoImg.addEventListener('pointermove', onPointerMove);
    potatoImg.addEventListener('pointerup', onPointerUp);
    potatoImg.addEventListener('pointercancel', onPointerUp);
}

function checkStage1Result() {
    clearToolCursors();
    if (gameStats.harvested >= 4) {
        showModal("第一關挑戰成功！", `太好了！在時間內成功拔出 ${gameStats.harvested} 顆地瓜！`, "準備進入清洗階段！", () => {
            document.getElementById('minigameView').style.display = 'none';
            document.getElementById('storyModal').classList.add('active');
            nextDialogue();
        });
    } else {
        showModal(" 採收失敗", "時間到了，但採收的地瓜不足 4 顆！", "重新開始", initStage1);
    }
}

/* ==================== 第二關：一開始是圖1(髒掉的地瓜_2.png)，移動滑鼠刷洗降低髒污透明度變成圖2(生地瓜.png) ==================== */
let isBrushEquipped = false;
let currentWashIndex = 0;

function equipBrush() {
    isBrushEquipped = true;
    document.body.classList.add('cursor-brush');
    const tool = document.getElementById('spongeTool');
    const label = document.getElementById('brushToolLabel');
    const hint = document.getElementById('stage2Hint');
    if (tool) tool.classList.add('equipped');
    if (label) label.innerText = '刷子使用中';
    if (hint) hint.innerText = ' 移動滑鼠刷洗地瓜表面，刷子會隨之晃動並清除髒污！';
}

function initStage2() {
    clearToolCursors();
    isBrushEquipped = false;
    currentWashIndex = 0;
    gameStats.cleaned = 0;

    document.getElementById('stageTitle').innerText = "第二關：地瓜清潔任務";
    document.getElementById('stage1Area').style.display = 'none';
    document.getElementById('stage2Area').style.display = 'flex';
    document.getElementById('stage3Area').style.display = 'none';

    document.getElementById('timerBox').style.display = 'none';
    document.getElementById('scoreText').innerText = `0 / 4`;

    const tool = document.getElementById('spongeTool');
    const label = document.getElementById('brushToolLabel');
    const hint = document.getElementById('stage2Hint');
    if (tool) tool.classList.remove('equipped');
    if (label) label.innerText = '點擊裝備刷子';
    if (hint) hint.innerText = ' 請先點擊右下角「刷子圖標」，再移動滑鼠刷洗地瓜！';

    renderSingleWashPotato();
}

function renderSingleWashPotato() {
    const container = document.getElementById('washContainer');
    container.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'single-potato-card';

    // 圖2：洗好的乾淨生地瓜（底層）
    const cleanImg = document.createElement('img');
    cleanImg.src = '地瓜田/生地瓜.png';
    cleanImg.className = 'single-clean-potato';
    cleanImg.id = 'singleCleanPotato';
    cleanImg.alt = '洗好的生地瓜';

    // 圖1：髒掉的地瓜_2.png 畫布（上層，滑鼠滑過降低該處髒污透明度）
    const canvas = document.createElement('canvas');
    canvas.width = 260;
    canvas.height = 260;
    canvas.className = 'dirty-potato-canvas';
    const ctx = canvas.getContext('2d');

    const dirtyImg = new Image();
    dirtyImg.src = '地瓜田/髒掉的地瓜.png';
    dirtyImg.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(dirtyImg, 0, 0, canvas.width, canvas.height);
    };

    const zones = [
        { x: 105, y: 60,  opacity: 1.0 },
        { x: 118, y: 100, opacity: 1.0 },
        { x: 130, y: 135, opacity: 1.0 },
        { x: 140, y: 175, opacity: 1.0 },
        { x: 150, y: 215, opacity: 1.0 }
    ];

    let isCompleted = false;
    let lastScrubTime = 0;
    let lastBrushAnimTime = 0;
    let lastX = null;
    let lastY = null;

    // 只有當玩家移動滑鼠時才會觸發刷子晃動與降低髒污透明度
    const handleScrubMove = (e) => {
        if (isCompleted) return;

        if (!isBrushEquipped) {
            const hint = document.getElementById('stage2Hint');
            if (hint) hint.innerText = ' 請先點擊右下角的「刷子圖標」！';
            return;
        }

        const now = performance.now();
        if (lastX !== null && Math.hypot(e.clientX - lastX, e.clientY - lastY) < 4) return;
        if (now - lastScrubTime < 42) return;
        lastScrubTime = now;
        lastX = e.clientX;
        lastY = e.clientY;

        if (now - lastBrushAnimTime > 160) {
            lastBrushAnimTime = now;
            spawnScrubBrushEffect(e.clientX, e.clientY);
        }

        const rect = canvas.getBoundingClientRect();
        const moveX = ((e.clientX - rect.left) / rect.width) * canvas.width;
        const moveY = ((e.clientY - rect.top) / rect.height) * canvas.height;

        // 降低被清洗處的髒污透明度，逐步顯現底層圖2（生地瓜.png）
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        const grad = ctx.createRadialGradient(moveX, moveY, 8, moveX, moveY, 48);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.28)');
        grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(moveX, moveY, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        zones.forEach(z => {
            const dist = Math.hypot(moveX - z.x, moveY - z.y);
            if (dist < 58 && z.opacity > 0) {
                z.opacity = Math.max(0, +(z.opacity - 0.14).toFixed(2));
            }
        });

        const remainSum = zones.reduce((acc, z) => acc + z.opacity, 0);
        const cleanPercent = Math.round((1 - remainSum / zones.length) * 100);
        const badge = document.getElementById('singleWashBadge');
        if (badge) badge.innerText = `第 ${currentWashIndex + 1} / 4 顆地瓜 － 清潔度：${cleanPercent}%`;

        if (remainSum <= 0) {
            isCompleted = true;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cleanImg.classList.add('sparkle');
            if (badge) badge.innerText = `✨ 第 ${currentWashIndex + 1} 顆地瓜洗淨完成！`;

            gameStats.cleaned++;
            document.getElementById('scoreText').innerText = `${gameStats.cleaned} / 4`;

            setTimeout(() => {
                currentWashIndex++;
                if (currentWashIndex < 4) {
                    renderSingleWashPotato();
                } else {
                    checkStage2Result();
                }
            }, 650);
        }
    };

    canvas.addEventListener('pointermove', handleScrubMove);

    card.appendChild(cleanImg);
    card.appendChild(canvas);

    const badge = document.createElement('div');
    badge.className = 'wash-progress-badge';
    badge.id = 'singleWashBadge';
    badge.innerText = `第 ${currentWashIndex + 1} / 4 顆地瓜 － 清潔度：0%`;

    container.appendChild(card);
    container.appendChild(badge);
}

function spawnScrubBrushEffect(x, y) {
    const brush = document.createElement('img');
    brush.src = '地瓜田/洗具刷子.png';
    brush.className = 'floating-scrub-brush';
    brush.style.left = `${x}px`;
    brush.style.top = `${y}px`;
    document.body.appendChild(brush);
    setTimeout(() => brush.remove(), 310);
}

function checkStage2Result() {
    clearToolCursors();
    showModal("洗滌完成！", "4 顆地瓜都已經洗得乾乾淨淨囉！", "準備送進老烤窯！", () => {
        document.getElementById('minigameView').style.display = 'none';
        document.getElementById('storyModal').classList.add('active');
        document.getElementById('timerBox').style.display = 'block';
        nextDialogue();
    });
}

/* ==================== 第三關：左邊直立溫度計(轉90度)、右邊地瓜(5種熟度.png)、下面按鈕 ==================== */
// 烤箱溫度計2.png 轉 90 度後：
// 0~18% 與 82~100% 為兩端綠色(火太小)
// 19~36% 與 64~81% 為黃色(火候剛好)
// 37~63% 為中央橘紅色(火太大)
let tempVal = 28;
let targetTemp = 28;
let tempDriftSpeed = 0;
let needleAnimId = null;
let lastNeedleTime = 0;
let nextChangeTime = 0;
let currentOvenIndex = 0;
let currentOvenItem = null;

function stopNeedleLoop() {
    if (needleAnimId) {
        cancelAnimationFrame(needleAnimId);
        needleAnimId = null;
    }
}

function getTempZone(val) {
    if (val <= 18 || val >= 82) return 'green';  // 兩端綠色：火太小
    if (val >= 38 && val <= 62) return 'red';    // 中央紅色：火太大
    return 'yellow';                             // 黃色區：火候剛好
}

function updateNeedleDisplay() {
    const pointerEl = document.getElementById('tempPointer');
    if (pointerEl) {
        // 對應溫度計綠框範圍（left: 11% ~ 89%）
        const leftPercent = 11 + (tempVal / 100) * 78;
        pointerEl.style.left = `${leftPercent}%`;
    }

    const zone = getTempZone(tempVal);
    const statusTextEl = document.getElementById('tempStatusText');
    if (statusTextEl) {
        if (zone === 'green') {
            statusTextEl.style.color = '#a3e635';
            statusTextEl.innerText = "🟢 綠色區：火太小！";
        } else if (zone === 'yellow') {
            statusTextEl.style.color = '#facc15';
            statusTextEl.innerText = "🟡 黃色區：火候剛好！";
        } else {
            statusTextEl.style.color = '#ef4444';
            statusTextEl.innerText = "🔴 紅色區：火太大！";
        }
    }
}

function startIrregularNeedleLoop() {
    stopNeedleLoop();
    lastNeedleTime = performance.now();
    nextChangeTime = lastNeedleTime + 450;

    function loop(now) {
        const dt = Math.min((now - lastNeedleTime) / 1000, 0.1);
        lastNeedleTime = now;

        if (now >= nextChangeTime) {
            // 指針會隨機往中央紅區(火太大)或兩端綠區(火太小)偏移
            const r = Math.random();
            if (r < 0.55) {
                targetTemp = 42 + Math.random() * 16; // 往中央紅區
            } else if (r < 0.78) {
                targetTemp = 3 + Math.random() * 13;  // 往下端綠區
            } else {
                targetTemp = 84 + Math.random() * 13; // 往上端綠區
            }
            tempDriftSpeed = 22 + Math.random() * 28;
            nextChangeTime = now + (450 + Math.random() * 550);
        }

        const diff = targetTemp - tempVal;
        const step = Math.sign(diff) * Math.min(Math.abs(diff), tempDriftSpeed * dt);
        const jitter = (Math.random() - 0.5) * 24 * dt;

        tempVal = Math.max(2, Math.min(98, tempVal + step + jitter));
        updateNeedleDisplay();

        needleAnimId = requestAnimationFrame(loop);
    }

    needleAnimId = requestAnimationFrame(loop);
}

// 5 種熟度階段（全部使用 .png 檔名）
function updatePotatoDonenessVisual(item) {
    const imgEl = document.getElementById('singleOvenImg');
    const badgeEl = document.getElementById('singleOvenBadge');
    const slotEl = document.getElementById('singleOvenSlot');
    if (!imgEl || !badgeEl || !slotEl) return;

    if (item.status === 'burnt') {
        imgEl.style.filter = 'none';
        imgEl.src = item.flipped ? "地瓜田/烤焦地瓜_背面.png" : "地瓜田/烤焦地瓜.png";
        badgeEl.innerText = "烤焦了！";
        badgeEl.className = "oven-status-badge burnt";
        slotEl.className = "oven-slot single-big burnt";
        return;
    }

    if (item.progress < 25) {
        imgEl.src = "地瓜田/生地瓜.png";
        badgeEl.innerText = `生冷地瓜 ${item.progress}%）`;
    } else if (item.progress < 50) {
        imgEl.src = item.flipped ? "地瓜田/過程2背面.png" : "地瓜田/過程2.png";
        badgeEl.innerText = `微熱上色 ${item.progress}%）`;
    } else if (!item.flipped) {
        imgEl.src = "地瓜田/過程3.png";
        badgeEl.innerText = `正面半熟 50% － 點擊翻面！`;
    } else if (item.progress < 80) {
        imgEl.src = item.progress < 65 ? "地瓜田/過程3背面.png" : "地瓜田/過程4背面.png";
        badgeEl.innerText = ` ${item.progress}%）`;
    } else if (item.progress < 100) {
        imgEl.src = "地瓜田/過程4背面.png";
        badgeEl.innerText = `即將全熟 ${item.progress}%）`;
    } else {
        imgEl.src = "地瓜田/熟地瓜背面.png";
        imgEl.style.filter = "drop-shadow(0 0 14px rgba(255, 215, 0, 0.85))";
        badgeEl.innerText = `熟度 5/5`;
        badgeEl.className = "oven-status-badge done";
        slotEl.className = "oven-slot single-big done";
    }
}

function renderSingleOvenPotato() {
    const slots = document.getElementById('ovenSlots');
    slots.innerHTML = '';

    currentOvenItem = { progress: 0, flipped: false, status: 'baking', overheat: 0 };

    const slot = document.createElement('div');
    slot.className = 'oven-slot single-big';
    slot.id = 'singleOvenSlot';
    slot.innerHTML = `
        <div style="position:absolute; top:14px; color:#ffd700; font-size:16px; font-weight:bold;"> 正在烘烤：第 ${currentOvenIndex + 1} / 3 顆地瓜</div>
        <img src="地瓜田/生地瓜.png" class="oven-potato-img" id="singleOvenImg" alt="烤地瓜">
        <div class="oven-status-badge" id="singleOvenBadge">熟度 1/5（生冷地瓜 0%）</div>
    `;

    slot.onclick = () => {
        if (!currentOvenItem || currentOvenItem.status !== 'baking') return;
        if (currentOvenItem.progress >= 50 && !currentOvenItem.flipped) {
            currentOvenItem.flipped = true;
            slot.classList.add('flipped');
            updatePotatoDonenessVisual(currentOvenItem);
        }
    };

    slots.appendChild(slot);
    updatePotatoDonenessVisual(currentOvenItem);
}

function initStage3() {
    clearToolCursors();
    document.getElementById('stageTitle').innerText = "第三關：地瓜火候大師 ";
    document.getElementById('stage1Area').style.display = 'none';
    document.getElementById('stage2Area').style.display = 'none';
    document.getElementById('stage3Area').style.display = 'flex';
    document.getElementById('timerBox').style.display = 'block';

    gameTimeLeft = 75;
    gameStats.bakedPerfect = 0;
    gameStats.damaged = 0;
    currentOvenIndex = 0;
    tempVal = 28; // 初始在黃色安全區
    targetTemp = 28;
    document.getElementById('timerText').innerText = gameTimeLeft;
    document.getElementById('scoreText').innerText = `0 / 3`;

    renderSingleOvenPotato();
    startIrregularNeedleLoop();

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        gameTimeLeft--;
        document.getElementById('timerText').innerText = gameTimeLeft;

        if (currentOvenItem && currentOvenItem.status === 'baking') {
            const zone = getTempZone(tempVal);
            const badgeEl = document.getElementById('singleOvenBadge');

            if (zone === 'red') {
                currentOvenItem.overheat++;
                if (badgeEl) badgeEl.innerText = ` (${currentOvenItem.overheat}/4)`;
                if (currentOvenItem.overheat >= 4) {
                    currentOvenItem.status = 'burnt';
                    gameStats.damaged++;
                    updatePotatoDonenessVisual(currentOvenItem);
                    advanceNextOvenPotato();
                }
            } else if (zone === 'yellow') {
                currentOvenItem.overheat = Math.max(0, currentOvenItem.overheat - 1);

                if (!currentOvenItem.flipped && currentOvenItem.progress >= 50) {
                    updatePotatoDonenessVisual(currentOvenItem);
                } else {
                    currentOvenItem.progress = Math.min(100, currentOvenItem.progress + 10);
                    updatePotatoDonenessVisual(currentOvenItem);

                    if (currentOvenItem.progress >= 100 && currentOvenItem.flipped) {
                        currentOvenItem.status = 'done';
                        gameStats.bakedPerfect++;
                        document.getElementById('scoreText').innerText = `${gameStats.bakedPerfect} / 3`;
                        updatePotatoDonenessVisual(currentOvenItem);
                        advanceNextOvenPotato();
                    }
                }
            } else {
                currentOvenItem.overheat = Math.max(0, currentOvenItem.overheat - 1);
                if (badgeEl) badgeEl.innerText = `（熟度 ${currentOvenItem.progress}%）`;
            }
        }

        if (gameTimeLeft <= 0) {
            clearInterval(timerInterval);
            stopNeedleLoop();
            checkStage3Result();
        }
    }, 1000);
}

function advanceNextOvenPotato() {
    setTimeout(() => {
        currentOvenIndex++;
        if (currentOvenIndex < 3) {
            renderSingleOvenPotato();
        } else {
            clearInterval(timerInterval);
            stopNeedleLoop();
            checkStage3Result();
        }
    }, 850);
}

function adjustHeat(val) {
    tempVal = Math.max(2, Math.min(98, tempVal + val));
    targetTemp = tempVal;
    nextChangeTime = performance.now() + 450;
    updateNeedleDisplay();
}

function checkStage3Result() {
    if (gameStats.bakedPerfect >= 2) {
        let title = gameStats.bakedPerfect === 3 ? "地瓜職人滿分評價！" : "烤地瓜高手！";
        let text = gameStats.bakedPerfect === 3
            ? "太厲害了！烤出了香甜金黃的極品烤地瓜！"
            : `順利烤出 ${gameStats.bakedPerfect} 顆香噴噴的烤地瓜！老街道地美味出爐囉！`;

        showModal(title, text, "品嚐烤地瓜", () => {
            document.getElementById('minigameView').style.display = 'none';
            document.getElementById('storyModal').classList.add('active');
            nextDialogue();
        });
    } else {
        showModal("烘烤失敗", `完美烤熟的地瓜不足 2 顆（成功 ${gameStats.bakedPerfect} 顆、烤焦 ${gameStats.damaged} 顆）！小丸：「維持在黃色火候區並記得翻面，再試一次吧！」`, "重新挑戰烘烤", initStage3);
    }
}

function showModal(title, text, btnText, action, imgSrc = "") {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalText').innerText = text;
    document.getElementById('modalBtn').innerText = btnText;

    const imgWrap = document.getElementById('modalImgWrap');
    const imgEl = document.getElementById('modalImg');
    if (imgWrap && imgEl) {
        if (imgSrc) {
            imgEl.src = imgSrc;
            imgWrap.style.display = 'flex';
        } else {
            imgWrap.style.display = 'none';
            imgEl.src = "";
        }
    }

    pendingAction = action;
    document.getElementById('gameModal').classList.add('show');
}

function closeModal() {
    document.getElementById('gameModal').classList.remove('show');
    if (pendingAction) {
        const action = pendingAction;
        pendingAction = null;

        if (action === 'startMinigameFromModal') {
            if (activePhase === 1) initStage1();
            else if (activePhase === 2) initStage2();
            else if (activePhase === 3) initStage3();
        } else if (typeof action === 'function') {
            action();
        }
    }
}

function showRewardModal(type) {
    if (type === 'potato') {
        showModal(
            "香噴噴的烤地瓜！",
            "剛出爐的烤地瓜熱氣騰騰，外皮微微焦香，剝開後露出綿密柔軟的金黃色果肉！",
            "品嘗",
            () => { nextDialogue(); },
            "地瓜田/撥開的地瓜.png"
        );
    } else if (type === 'ticket') {
        showModal("獲得神秘列車車票！", "", "收下", () => {
            nextDialogue();
        }, "劇情/車票_新化.png");
    }
}