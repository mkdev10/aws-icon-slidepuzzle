// AWSサービスデータ（JSONファイルから読み込み）
let awsServices = [];

// モバイルデバイス検出
function isMobileDevice() {
    return window.innerWidth <= 480 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// SVGをData URLに変換する関数
async function svgToDataUrl(svgUrl) {
    try {
        const response = await fetch(svgUrl);
        const svgText = await response.text();
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        return URL.createObjectURL(blob);
    } catch (error) {
        console.warn('SVG変換エラー:', error);
        return svgUrl; // フォールバック
    }
}

// 画像をCanvasに描画してパズルピースを作成する関数
function createPuzzlePiece(imageUrl, row, col, pieceSize, callback) {
    const canvas = document.createElement('canvas');
    canvas.width = pieceSize;
    canvas.height = pieceSize;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        // 元画像のサイズを取得
        const imgWidth = img.naturalWidth || img.width;
        const imgHeight = img.naturalHeight || img.height;
        
        // パズルピースのサイズを計算
        const pieceWidth = imgWidth / 3;
        const pieceHeight = imgHeight / 3;
        
        // 該当部分を切り取って描画
        ctx.drawImage(
            img,
            col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight,
            0, 0, pieceSize, pieceSize
        );
        
        callback(canvas, null);
    };
    
    img.onerror = function() {
        callback(null, 'Image load error');
    };
    
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
}

// プレビューアイコン関連の変数
let previewInterval = null;
let currentPreviewIndex = 0;
let currentIconIndex = 0; // 現在切り替え中のアイコンのインデックス

// プレビューアイコンを初期化する関数
function initPreviewIcons() {
    if (awsServices.length === 0) {
        console.log('AWSサービスデータがまだ読み込まれていません');
        return;
    }
    
    console.log('プレビューアイコンを初期化中...');
    
    // 既存のインターバルをクリア
    if (previewInterval) {
        clearInterval(previewInterval);
    }
    
    // 最初の3つのアイコンを表示
    initializeFirstIcons();
    
    // 2秒間隔で一つずつアイコンを切り替え
    previewInterval = setInterval(() => {
        updateSinglePreviewIcon();
    }, 2000);
}

// 最初の3つのアイコンを初期化
function initializeFirstIcons() {
    console.log('最初の3つのアイコンを初期化中...');
    
    const icons = [
        document.getElementById('preview-icon-1'),
        document.getElementById('preview-icon-2'),
        document.getElementById('preview-icon-3')
    ];
    
    // 最初の3つのアイコンを設定
    for (let i = 0; i < 3; i++) {
        if (i < awsServices.length) {
            const service = awsServices[i];
            icons[i].alt = service.name;
            
            // Safari対応：SVGをData URLとして読み込み
            if (service.image.endsWith('.svg')) {
                fetch(service.image)
                    .then(response => response.text())
                    .then(svgText => {
                        if (!svgText.includes('width=') || !svgText.includes('height=')) {
                            svgText = svgText.replace('<svg', '<svg width="80" height="80"');
                        }
                        const blob = new Blob([svgText], { type: 'image/svg+xml' });
                        const url = URL.createObjectURL(blob);
                        icons[i].src = url;
                        
                        icons[i].onload = function() {
                            URL.revokeObjectURL(url);
                        };
                    })
                    .catch(error => {
                        console.warn('プレビューアイコンSVG fetch エラー:', error);
                        icons[i].src = service.image;
                    });
            } else {
                icons[i].src = service.image;
            }
            
            // エラーハンドリング
            icons[i].onerror = function() {
                console.warn('プレビューアイコンの読み込みエラー:', service.image);
                this.style.backgroundColor = '#e9ecef';
                this.style.display = 'flex';
                this.style.alignItems = 'center';
                this.style.justifyContent = 'center';
                this.style.fontSize = '10px';
                this.style.color = '#666';
                this.innerHTML = service.name.substring(0, 3);
            };
            
            console.log(`アイコン${i + 1}を設定: ${service.name}`);
            
            // 少しずつ遅延させて表示
            setTimeout(() => {
                icons[i].classList.add('fade-in');
            }, i * 200);
        }
    }
    
    currentPreviewIndex = 3; // 次に表示するサービスのインデックス
    currentIconIndex = 0; // 次に切り替えるアイコンのインデックス
}

// 一つのプレビューアイコンを更新する関数
function updateSinglePreviewIcon() {
    const icons = [
        document.getElementById('preview-icon-1'),
        document.getElementById('preview-icon-2'),
        document.getElementById('preview-icon-3')
    ];
    
    const targetIcon = icons[currentIconIndex];
    
    // 回転しながらフェードアウト
    targetIcon.classList.add('rotate-out');
    targetIcon.classList.remove('rotate-in', 'fade-in');
    
    setTimeout(() => {
        // 新しいアイコンを設定
        const service = awsServices[currentPreviewIndex % awsServices.length];
        targetIcon.alt = service.name;
        
        // Safari対応：SVGをData URLとして読み込み
        if (service.image.endsWith('.svg')) {
            fetch(service.image)
                .then(response => response.text())
                .then(svgText => {
                    if (!svgText.includes('width=') || !svgText.includes('height=')) {
                        svgText = svgText.replace('<svg', '<svg width="80" height="80"');
                    }
                    const blob = new Blob([svgText], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    targetIcon.src = url;
                    
                    targetIcon.onload = function() {
                        URL.revokeObjectURL(url);
                    };
                })
                .catch(error => {
                    console.warn('プレビューアイコン更新SVG fetch エラー:', error);
                    targetIcon.src = service.image;
                });
        } else {
            targetIcon.src = service.image;
        }
        
        // エラーハンドリング
        targetIcon.onerror = function() {
            console.warn('プレビューアイコン更新時の読み込みエラー:', service.image);
            this.style.backgroundColor = '#e9ecef';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.style.fontSize = '10px';
            this.style.color = '#666';
            this.innerHTML = service.name.substring(0, 3);
        };
        
        // 回転しながらフェードイン
        setTimeout(() => {
            targetIcon.classList.remove('rotate-out');
            targetIcon.classList.add('rotate-in', 'fade-in');
        }, 50);
        
        // 次のインデックスを更新
        currentPreviewIndex = (currentPreviewIndex + 1) % awsServices.length;
        currentIconIndex = (currentIconIndex + 1) % 3;
    }, 300);
}

// プレビューアイコンを停止する関数
function stopPreviewIcons() {
    if (previewInterval) {
        clearInterval(previewInterval);
        previewInterval = null;
    }
}

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
        
        // スタート画面が表示されている場合のみプレビューアイコンを開始
        const startScreen = document.getElementById('start-screen');
        if (startScreen && !startScreen.classList.contains('hidden')) {
            initPreviewIcons();
        }
        
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
        
        // プレビューアイコンを開始
        initPreviewIcons();
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
    finalMoves: document.getElementById('final-moves'),
    giveUpModal: document.getElementById('give-up-modal'),
    giveUpCancel: document.getElementById('give-up-cancel'),
    giveUpConfirm: document.getElementById('give-up-confirm')
};

// イベントリスナー
elements.startBtn.addEventListener('click', startGame);
elements.shuffleBtn.addEventListener('click', shufflePuzzle);
elements.giveUpBtn.addEventListener('click', showGiveUpModal);
elements.playAgainBtn.addEventListener('click', () => {
    // 背景エフェクトを停止
    if (backgroundEffect) {
        backgroundEffect.stop();
    }
    
    // スタート画面に戻る
    showScreen('start');
    // プレビューアイコンを再開
    initPreviewIcons();
});
elements.giveUpCancel.addEventListener('click', hideGiveUpModal);
elements.giveUpConfirm.addEventListener('click', confirmGiveUp);

// モーダルの背景をクリックしたときに閉じる
elements.giveUpModal.addEventListener('click', (e) => {
    if (e.target === elements.giveUpModal) {
        hideGiveUpModal();
    }
});

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !elements.giveUpModal.classList.contains('hidden')) {
        hideGiveUpModal();
    }
});

// ゲーム開始
async function startGame() {
    // プレビューアイコンを停止
    stopPreviewIcons();
    
    // 背景エフェクトを開始
    if (backgroundEffect) {
        backgroundEffect.setIntensity('medium');
        backgroundEffect.start();
    }
    
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
    
    showScreen('puzzle');
    initializePuzzle();
    shufflePuzzle();
    startTimer();
    moves = 0;
    updateMoves();
    isGameActive = true;
    isGaveUp = false;
}

// ローディング状態を表示
function showLoadingState() {
    const puzzleContainer = document.getElementById('puzzle-container');
    puzzleContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px;">
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #FF9900; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
            <div style="color: #666; font-size: 16px;">ゲームを準備中...</div>
        </div>
    `;
    
    // スピンアニメーションのCSSを追加
    if (!document.getElementById('loading-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

// ローディング状態を解除
function hideLoadingState() {
    const puzzleContainer = document.getElementById('puzzle-container');
    puzzleContainer.innerHTML = '<div id="puzzle-grid"></div>';
    // elements.puzzleGridを再取得
    elements.puzzleGrid = document.getElementById('puzzle-grid');
}

// ゲーム用画像を事前読み込み
function preloadGameImages() {
    return new Promise((resolve, reject) => {
        if (!currentService || !currentService.image) {
            reject(new Error('サービス情報が不正です'));
            return;
        }
        
        const img = new Image();
        let loadTimeout;
        
        // タイムアウト設定（10秒）
        loadTimeout = setTimeout(() => {
            reject(new Error('画像の読み込みがタイムアウトしました'));
        }, 10000);
        
        img.onload = function() {
            clearTimeout(loadTimeout);
            resolve();
        };
        
        img.onerror = function() {
            clearTimeout(loadTimeout);
            // エラーの場合でもゲームを続行（フォールバック表示）
            console.warn('画像の事前読み込みに失敗しましたが、ゲームを続行します');
            resolve();
        };
        
        // Safari対応：SVGをData URLとして読み込み
        if (currentService.image.endsWith('.svg')) {
            fetch(currentService.image)
                .then(response => response.text())
                .then(svgText => {
                    if (!svgText.includes('width=') || !svgText.includes('height=')) {
                        svgText = svgText.replace('<svg', '<svg width="80" height="80"');
                    }
                    const blob = new Blob([svgText], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    img.src = url;
                    
                    // メモリリークを防ぐため、読み込み後にURLを解放
                    img.onload = function() {
                        URL.revokeObjectURL(url);
                        clearTimeout(loadTimeout);
                        resolve();
                    };
                })
                .catch(error => {
                    clearTimeout(loadTimeout);
                    console.warn('SVG事前読み込みエラー、フォールバックで続行');
                    resolve();
                });
        } else {
            img.src = currentService.image;
        }
    });
}

// 画面切り替え
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
    
    // プレビューアイコンの表示制御
    const previewIcons = document.getElementById('preview-icons');
    if (screenName === 'start') {
        previewIcons.classList.remove('hidden');
    } else {
        previewIcons.classList.add('hidden');
    }
}

// パズル初期化
function initializePuzzle() {
    puzzleGrid = Array.from({length: 9}, (_, i) => i);
    emptyPosition = 8;
    renderPuzzle();
}

// パズル描画（初期化用）
function renderPuzzle() {
    elements.puzzleGrid.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.dataset.position = i; // 位置を記録
        
        // イベントリスナーを追加（タッチとクリック両方に対応）
        piece.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            movePiece(i);
        });
        
        piece.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            movePiece(i);
        });
        
        elements.puzzleGrid.appendChild(piece);
    }
    
    // 各ピースの内容を更新
    updateAllPieces();
}

// 全ピースの内容を更新
function updateAllPieces() {
    const pieces = elements.puzzleGrid.querySelectorAll('.puzzle-piece');
    
    for (let i = 0; i < 9; i++) {
        updateSinglePiece(pieces[i], i);
    }
}

// 単一ピースの内容を更新
function updateSinglePiece(piece, position) {
    const pieceValue = puzzleGrid[position];
    
    if (pieceValue === 8) {
        // 空白ピース
        piece.className = 'puzzle-piece empty';
        piece.innerHTML = '';
        piece.style.backgroundColor = '#f0f0f0';
    } else {
        // 通常のピース
        piece.className = 'puzzle-piece';
        
        const row = Math.floor(pieceValue / 3);
        const col = pieceValue % 3;
        const isMobile = isMobileDevice();
        const pieceSize = isMobile ? 80 : 120;
        
        // 既存の画像があるかチェック
        let img = piece.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            piece.innerHTML = '';
            piece.appendChild(img);
        }
        
        // 画像の位置を更新
        img.alt = 'AWS Service Icon'; // サービス名を隠す
        img.style.width = (pieceSize * 3) + 'px';
        img.style.height = (pieceSize * 3) + 'px';
        img.style.objectFit = 'contain';
        img.style.position = 'absolute';
        img.style.top = (-row * pieceSize) + 'px';
        img.style.left = (-col * pieceSize) + 'px';
        img.style.pointerEvents = 'none';
        img.style.userSelect = 'none';
        img.style.webkitUserSelect = 'none';
        img.style.webkitUserDrag = 'none';
        
        // 画像ソースが未設定の場合のみ設定
        if (!img.src || img.src === window.location.href) {
            // Safari対応：SVGをData URLとして読み込み
            if (currentService.image.endsWith('.svg')) {
                fetch(currentService.image)
                    .then(response => response.text())
                    .then(svgText => {
                        // SVGにwidth/heightが明示的に設定されていない場合は追加
                        if (!svgText.includes('width=') || !svgText.includes('height=')) {
                            svgText = svgText.replace('<svg', '<svg width="80" height="80"');
                        }
                        const blob = new Blob([svgText], { type: 'image/svg+xml' });
                        const url = URL.createObjectURL(blob);
                        img.src = url;
                        
                        // メモリリークを防ぐため、使用後にURLを解放
                        img.onload = function() {
                            URL.revokeObjectURL(url);
                            piece.style.backgroundColor = '#f8f9fa';
                        };
                    })
                    .catch(error => {
                        console.warn('SVG fetch エラー');
                        img.src = currentService.image; // フォールバック
                    });
            } else {
                img.src = currentService.image;
            }
            
            // エラーハンドリング（サービス名を表示しない）
            img.onerror = function() {
                console.warn('画像読み込みエラー');
                piece.innerHTML = '';
                piece.style.backgroundColor = '#e9ecef';
                piece.style.display = 'flex';
                piece.style.alignItems = 'center';
                piece.style.justifyContent = 'center';
                piece.style.fontSize = isMobile ? '10px' : '12px';
                piece.style.color = '#666';
                piece.textContent = '?'; // サービス名の代わりに「?」を表示
            };
            
            img.onload = function() {
                // 読み込み成功
                piece.style.backgroundColor = '#f8f9fa';
            };
        }
        
        piece.style.backgroundColor = '#f8f9fa';
    }
}

// 高速更新用：移動したピースのみ更新
function updateMovedPieces(oldPosition, newPosition) {
    const pieces = elements.puzzleGrid.querySelectorAll('.puzzle-piece');
    updateSinglePiece(pieces[oldPosition], oldPosition);
    updateSinglePiece(pieces[newPosition], newPosition);
}

// ピース移動
function movePiece(position) {
    if (!isGameActive) return;
    
    // イベントの伝播を防ぐ
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const canMove = isAdjacentToEmpty(position);
    if (canMove) {
        const oldEmptyPosition = emptyPosition;
        
        // ピースと空白を交換
        [puzzleGrid[position], puzzleGrid[emptyPosition]] = [puzzleGrid[emptyPosition], puzzleGrid[position]];
        emptyPosition = position;
        
        moves++;
        updateMoves();
        
        // 高速更新：移動したピースのみ更新
        updateMovedPieces(position, oldEmptyPosition);
        
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

// ギブアップモーダル表示
function showGiveUpModal() {
    if (!isGameActive) return;
    elements.giveUpModal.classList.remove('hidden');
}

// ギブアップモーダル非表示
function hideGiveUpModal() {
    elements.giveUpModal.classList.add('hidden');
}

// ギブアップ確定
function confirmGiveUp() {
    hideGiveUpModal();
    
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
    
    // 完成画像を表示
    elements.completedImage.innerHTML = '';
    const completedImg = document.createElement('img');
    completedImg.alt = 'AWS Service Icon'; // サービス名を隠す
    
    // Safari対応：SVGをData URLとして読み込み
    if (currentService.image.endsWith('.svg')) {
        fetch(currentService.image)
            .then(response => response.text())
            .then(svgText => {
                if (!svgText.includes('width=') || !svgText.includes('height=')) {
                    svgText = svgText.replace('<svg', '<svg width="80" height="80"');
                }
                const blob = new Blob([svgText], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                completedImg.src = url;
                
                completedImg.onload = function() {
                    URL.revokeObjectURL(url);
                };
            })
            .catch(error => {
                console.warn('完成画像SVG fetch エラー');
                completedImg.src = currentService.image;
            });
    } else {
        completedImg.src = currentService.image;
    }
    
    completedImg.onerror = function() {
        console.warn('完成画像の読み込みエラー');
        elements.completedImage.style.backgroundColor = '#e9ecef';
        elements.completedImage.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 14px;">?</div>`;
    };
    elements.completedImage.appendChild(completedImg);
    
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
    
    // プレイしたサービスの情報を表示
    const completedServiceIcon = document.getElementById('completed-service-icon');
    const completedServiceName = document.getElementById('completed-service-name');
    
    if (currentService) {
        completedServiceIcon.innerHTML = '';
        const serviceImg = document.createElement('img');
        serviceImg.alt = currentService.name;
        
        // Safari対応：SVGをData URLとして読み込み
        if (currentService.image.endsWith('.svg')) {
            fetch(currentService.image)
                .then(response => response.text())
                .then(svgText => {
                    if (!svgText.includes('width=') || !svgText.includes('height=')) {
                        svgText = svgText.replace('<svg', '<svg width="80" height="80"');
                    }
                    const blob = new Blob([svgText], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    serviceImg.src = url;
                    
                    serviceImg.onload = function() {
                        URL.revokeObjectURL(url);
                    };
                })
                .catch(error => {
                    console.warn('サービスアイコンSVG fetch エラー');
                    serviceImg.src = currentService.image;
                });
        } else {
            serviceImg.src = currentService.image;
        }
        
        serviceImg.onerror = function() {
            console.warn('サービスアイコンの読み込みエラー');
            completedServiceIcon.style.backgroundColor = '#e9ecef';
            completedServiceIcon.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 14px;">?</div>`;
        };
        completedServiceIcon.appendChild(serviceImg);
        completedServiceName.textContent = currentService.name;
    }
    
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
document.addEventListener('DOMContentLoaded', async function() {
    // 背景エフェクトを初期化
    await initBackgroundEffect();
    
    // プレビューアイコンを表示状態にする（初期はスタート画面なので）
    const previewIcons = document.getElementById('preview-icons');
    previewIcons.classList.remove('hidden');
    
    // AWSサービスデータを読み込み
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
