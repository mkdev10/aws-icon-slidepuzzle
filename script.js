// AWSサービスデータ（JSONファイルから読み込み）
let awsServices = [];

// AWSサービスデータを読み込む関数
async function loadAwsServices() {
    try {
        console.log('AWSサービスデータを読み込み中...');
        const response = await fetch('./awsServices.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        awsServices = await response.json();
        console.log(`${awsServices.length}個のAWSサービスを読み込みました`);
        
        // 最初の数個のサービス名をデバッグ出力
        console.log('読み込まれたサービス例:', awsServices.slice(0, 5).map(s => s.name));
        
    } catch (error) {
        console.error('AWSサービスデータの読み込みに失敗しました:', error);
        // フォールバック: 最小限のサービスデータ
        awsServices = [
            {
                name: 'Amazon EC2',
                image: './asset/Res_Amazon-EC2_Instance_48.svg',
                options: ['Amazon EC2', 'Amazon S3', 'AWS Lambda', 'Amazon RDS']
            }
        ];
        console.log('フォールバックデータを使用します');
    }
}

// ゲーム状態
let currentService = null;
let lastServiceIndex = -1; // 前回選択されたサービスのインデックス
let puzzleGrid = [];
let emptyPosition = 8;
let startTime = null;
let gameTimer = null;
let moves = 0;
let isGameActive = false;
let isGaveUp = false;

// DOM要素
const screens = {
    start: document.getElementById('start-screen'),
    puzzle: document.getElementById('puzzle-screen'),
    quiz: document.getElementById('quiz-screen'),
    result: document.getElementById('result-screen')
};

const elements = {
    startBtn: document.getElementById('start-btn'),
    shuffleBtn: document.getElementById('shuffle-btn'),
    giveUpBtn: document.getElementById('give-up-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    puzzleGrid: document.getElementById('puzzle-grid'),
    timer: document.getElementById('timer'),
    movesCounter: document.getElementById('moves'),
    completedImage: document.getElementById('completed-image'),
    quizTitle: document.getElementById('quiz-title'),
    quizOptions: document.getElementById('quiz-options'),
    quizResult: document.getElementById('quiz-result'),
    finalTime: document.getElementById('final-time'),
    finalMoves: document.getElementById('final-moves')
};

// イベントリスナー
elements.startBtn.addEventListener('click', startGame);
elements.shuffleBtn.addEventListener('click', shufflePuzzle);
elements.giveUpBtn.addEventListener('click', giveUp);
elements.playAgainBtn.addEventListener('click', startGame); // resetGameではなくstartGameを呼び出す

// ゲーム開始
async function startGame() {
    // AWSサービスデータが読み込まれていない場合は読み込む
    if (awsServices.length === 0) {
        await loadAwsServices();
    }
    
    // ランダムにサービスを選択（前回と同じサービスを避ける）
    let randomIndex;
    if (awsServices.length > 1) {
        do {
            randomIndex = Math.floor(Math.random() * awsServices.length);
        } while (randomIndex === lastServiceIndex);
    } else {
        randomIndex = 0;
    }
    
    lastServiceIndex = randomIndex;
    currentService = awsServices[randomIndex];
    
    // デバッグ情報をコンソールに出力
    console.log(`選択されたサービス: ${currentService.name} (インデックス: ${randomIndex}/${awsServices.length - 1})`);
    console.log(`利用可能なサービス数: ${awsServices.length}`);
    
    showScreen('puzzle');
    initializePuzzle();
    shufflePuzzle();
    startTimer();
    moves = 0;
    updateMoves();
    isGameActive = true;
    isGaveUp = false;
}

// 画面切り替え
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

// パズル初期化
function initializePuzzle() {
    puzzleGrid = Array.from({length: 9}, (_, i) => i);
    emptyPosition = 8;
    renderPuzzle();
}

// パズル描画
function renderPuzzle() {
    elements.puzzleGrid.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        
        if (puzzleGrid[i] === 8) {
            piece.classList.add('empty');
            piece.textContent = '';
        } else {
            const row = Math.floor(puzzleGrid[i] / 3);
            const col = puzzleGrid[i] % 3;
            piece.style.backgroundImage = `url(${currentService.image})`;
            piece.style.backgroundPosition = `-${col * 120}px -${row * 120}px`;
            piece.addEventListener('click', () => movePiece(i));
        }
        
        elements.puzzleGrid.appendChild(piece);
    }
}

// ピース移動
function movePiece(position) {
    if (!isGameActive) return;
    
    const canMove = isAdjacentToEmpty(position);
    if (canMove) {
        // ピースと空白を交換
        [puzzleGrid[position], puzzleGrid[emptyPosition]] = [puzzleGrid[emptyPosition], puzzleGrid[position]];
        emptyPosition = position;
        
        moves++;
        updateMoves();
        renderPuzzle();
        
        // パズル完成チェック
        if (isPuzzleComplete()) {
            completePuzzle();
        }
    }
}

// 空白に隣接しているかチェック
function isAdjacentToEmpty(position) {
    const row = Math.floor(position / 3);
    const col = position % 3;
    const emptyRow = Math.floor(emptyPosition / 3);
    const emptyCol = emptyPosition % 3;
    
    return (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
           (Math.abs(col - emptyCol) === 1 && row === emptyRow);
}

// パズル完成チェック
function isPuzzleComplete() {
    for (let i = 0; i < 8; i++) {
        if (puzzleGrid[i] !== i) return false;
    }
    return puzzleGrid[8] === 8;
}

// パズル完成時の処理
function completePuzzle() {
    isGameActive = false;
    stopTimer();
    setTimeout(() => {
        showQuiz();
    }, 1000);
}

// ギブアップ機能
function giveUp() {
    if (!isGameActive) return;
    
    // 確認ダイアログを表示
    if (confirm('ギブアップしますか？\n正解のパズルを表示してクイズに進みます。')) {
        // パズルを完成状態にする
        puzzleGrid = Array.from({length: 9}, (_, i) => i);
        emptyPosition = 8;
        isGameActive = false;
        isGaveUp = true;
        
        // パズルを描画
        renderPuzzle();
        
        // 少し待ってからクイズに進む
        setTimeout(() => {
            stopTimer();
            showQuiz();
        }, 1000);
    }
}

// クイズ表示
function showQuiz() {
    showScreen('quiz');
    
    // タイトルを変更
    if (isGaveUp) {
        elements.quizTitle.textContent = 'ギブアップしました！このAWSサービスは何でしょう？';
        elements.quizTitle.style.color = '#dc3545';
    } else {
        elements.quizTitle.textContent = 'このAWSサービスは何でしょう？';
        elements.quizTitle.style.color = '#232F3E';
    }
    
    elements.completedImage.style.backgroundImage = `url(${currentService.image})`;
    
    // 選択肢をシャッフル
    const shuffledOptions = [...currentService.options].sort(() => Math.random() - 0.5);
    
    elements.quizOptions.innerHTML = '';
    shuffledOptions.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'quiz-option';
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectAnswer(option, optionElement));
        elements.quizOptions.appendChild(optionElement);
    });
    
    elements.quizResult.innerHTML = '';
}

// 回答選択
function selectAnswer(selectedAnswer, optionElement) {
    const isCorrect = selectedAnswer === currentService.name;
    
    // 全ての選択肢を無効化
    const allOptions = elements.quizOptions.querySelectorAll('.quiz-option');
    allOptions.forEach(option => {
        option.style.pointerEvents = 'none';
        if (option.textContent === currentService.name) {
            option.classList.add('correct');
        } else if (option === optionElement && !isCorrect) {
            option.classList.add('incorrect');
        }
    });
    
    // 結果表示
    if (isCorrect) {
        elements.quizResult.textContent = '正解！';
        elements.quizResult.className = 'quiz-result correct';
        setTimeout(showResult, 2000);
    } else {
        elements.quizResult.textContent = `不正解... 正解は「${currentService.name}」です`;
        elements.quizResult.className = 'quiz-result incorrect';
        setTimeout(showResult, 3000);
    }
}

// 結果画面表示
function showResult() {
    showScreen('result');
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    
    if (isGaveUp) {
        elements.finalTime.textContent = `完了時間: ${formatTime(totalTime)} (ギブアップ)`;
        elements.finalTime.style.color = '#dc3545';
        elements.finalMoves.textContent = `移動回数: ${moves}回 (ギブアップ)`;
        elements.finalMoves.style.color = '#dc3545';
    } else {
        elements.finalTime.textContent = `完了時間: ${formatTime(totalTime)}`;
        elements.finalTime.style.color = '#232F3E';
        elements.finalMoves.textContent = `移動回数: ${moves}回`;
        elements.finalMoves.style.color = '#232F3E';
    }
}

// パズルシャッフル
function shufflePuzzle() {
    // 解ける状態を保証するため、有効な移動のみでシャッフル
    for (let i = 0; i < 1000; i++) {
        const adjacentPositions = getAdjacentPositions(emptyPosition);
        const randomPosition = adjacentPositions[Math.floor(Math.random() * adjacentPositions.length)];
        [puzzleGrid[emptyPosition], puzzleGrid[randomPosition]] = [puzzleGrid[randomPosition], puzzleGrid[emptyPosition]];
        emptyPosition = randomPosition;
    }
    renderPuzzle();
}

// 隣接位置取得
function getAdjacentPositions(position) {
    const row = Math.floor(position / 3);
    const col = position % 3;
    const adjacent = [];
    
    if (row > 0) adjacent.push(position - 3); // 上
    if (row < 2) adjacent.push(position + 3); // 下
    if (col > 0) adjacent.push(position - 1); // 左
    if (col < 2) adjacent.push(position + 1); // 右
    
    return adjacent;
}

// タイマー開始
function startTimer() {
    startTime = Date.now();
    gameTimer = setInterval(updateTimer, 1000);
}

// タイマー停止
function stopTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

// タイマー更新
function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    elements.timer.textContent = formatTime(elapsed);
}

// 時間フォーマット
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 移動回数更新
function updateMoves() {
    elements.movesCounter.textContent = moves;
}

// ゲームを初期状態に戻す
function resetToStart() {
    stopTimer();
    isGameActive = false;
    isGaveUp = false;
    showScreen('start');
}

// ページ読み込み時にAWSサービスデータを事前読み込み
document.addEventListener('DOMContentLoaded', function() {
    loadAwsServices();
});

// デバッグ用: ランダム選択をテストする関数（開発者コンソールで使用）
window.testRandomSelection = function(count = 10) {
    console.log(`${count}回のランダム選択テスト:`);
    const selectedServices = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * awsServices.length);
        const service = awsServices[randomIndex];
        selectedServices.push(`${i + 1}: ${service.name} (index: ${randomIndex})`);
    }
    console.log(selectedServices.join('\n'));
    
    // 重複チェック
    const uniqueServices = new Set(selectedServices.map(s => s.split(':')[1].split('(')[0].trim()));
    console.log(`${count}回中 ${uniqueServices.size} 種類のサービスが選択されました`);
};
