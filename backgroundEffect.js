class BackgroundIconEffect {
    constructor() {
        this.container = null;
        this.icons = [];
        this.animationId = null;
        this.isActive = false;
        this.awsServices = [];
        this.iconPaths = [];
        this.lastSpawnTime = 0;
        
        // エフェクト設定
        this.config = {
            maxIcons: 8,            // 同時に表示する最大アイコン数を減らす
            spawnInterval: 2000,    // アイコン生成間隔（ミリ秒）
            minSpeed: 0.3,          // 最小落下速度を遅く
            maxSpeed: 1.0,          // 最大落下速度を遅く
            sizes: [20, 32, 48],    // 小、中、大のサイズ配列
            opacity: 0.25,          // アイコンの透明度を上げる（濃くする）
            rotationSpeed: 0.2      // 回転速度を遅く
        };
    }
    
    async init() {
        await this.loadAWSServices();
        this.createContainer();
        console.log('Background effect initialized with', this.iconPaths.length, 'icons');
    }
    
    async loadAWSServices() {
        try {
            const response = await fetch('./awsServices.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.awsServices = await response.json();
            
            // imageプロパティを使用してアイコンパスを取得
            this.iconPaths = this.awsServices.map(service => service.image).filter(path => path);
            
            console.log('Loaded', this.iconPaths.length, 'icon paths');
        } catch (error) {
            console.error('AWS services data could not be loaded:', error);
            // フォールバック用のアイコンパス
            this.iconPaths = [
                'asset/Arch_Amazon-EC2_64.svg',
                'asset/Arch_Amazon-Simple-Storage-Service_64.svg',
                'asset/Arch_AWS-Lambda_64.svg',
                'asset/Arch_Amazon-RDS_64.svg',
                'asset/Arch_Amazon-DynamoDB_64.svg'
            ];
            console.log('Using fallback icons:', this.iconPaths);
        }
    }
    
    createContainer() {
        // 既存のコンテナがあれば削除
        const existingContainer = document.getElementById('background-effect-container');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        this.container = document.createElement('div');
        this.container.id = 'background-effect-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: -1;
            overflow: hidden;
        `;
        document.body.appendChild(this.container);
        console.log('Background effect container created');
    }
    
    start() {
        if (this.isActive) return;
        
        console.log('Starting background effect');
        this.isActive = true;
        this.lastSpawnTime = Date.now();
        this.animate();
    }
    
    stop() {
        console.log('Stopping background effect');
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.clearIcons();
    }
    
    animate() {
        if (!this.isActive) return;
        
        const currentTime = Date.now();
        
        // 時間間隔でアイコンを生成
        if (currentTime - this.lastSpawnTime > this.config.spawnInterval && 
            this.icons.length < this.config.maxIcons) {
            this.createIcon();
            this.lastSpawnTime = currentTime;
        }
        
        // 既存のアイコンを更新
        this.updateIcons();
        
        // 画面外のアイコンを削除
        this.cleanupIcons();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    createIcon() {
        if (this.iconPaths.length === 0) {
            console.warn('No icon paths available');
            return;
        }
        
        const iconPath = this.iconPaths[Math.floor(Math.random() * this.iconPaths.length)];
        // ランダムに大中小のサイズを選択
        const size = this.config.sizes[Math.floor(Math.random() * this.config.sizes.length)];
        const speed = this.config.minSpeed + Math.random() * (this.config.maxSpeed - this.config.minSpeed);
        const x = Math.random() * (window.innerWidth - size);
        const rotation = Math.random() * 360;
        const rotationSpeed = (Math.random() - 0.5) * this.config.rotationSpeed;
        
        const iconElement = document.createElement('img');
        iconElement.src = iconPath;
        iconElement.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: -${size}px;
            opacity: ${this.config.opacity};
            transform: rotate(${rotation}deg);
            filter: grayscale(20%) brightness(0.8);
            transition: none;
        `;
        
        // 画像読み込みエラーのハンドリング
        iconElement.onerror = () => {
            console.warn('Failed to load icon:', iconPath);
            if (iconElement.parentNode) {
                iconElement.parentNode.removeChild(iconElement);
            }
        };
        
        const iconData = {
            element: iconElement,
            x: x,
            y: -size,
            speed: speed,
            rotation: rotation,
            rotationSpeed: rotationSpeed,
            size: size
        };
        
        this.container.appendChild(iconElement);
        this.icons.push(iconData);
        
        console.log('Created icon:', iconPath, 'at position', x, -size, 'size:', size);
    }
    
    updateIcons() {
        this.icons.forEach(icon => {
            icon.y += icon.speed;
            icon.rotation += icon.rotationSpeed;
            
            icon.element.style.top = `${icon.y}px`;
            icon.element.style.transform = `rotate(${icon.rotation}deg)`;
        });
    }
    
    cleanupIcons() {
        this.icons = this.icons.filter(icon => {
            if (icon.y > window.innerHeight + icon.size) {
                if (icon.element.parentNode) {
                    this.container.removeChild(icon.element);
                }
                return false;
            }
            return true;
        });
    }
    
    clearIcons() {
        this.icons.forEach(icon => {
            if (icon.element.parentNode) {
                this.container.removeChild(icon.element);
            }
        });
        this.icons = [];
    }
    
    // 設定を動的に変更するメソッド
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('Updated config:', this.config);
    }
    
    // ゲーム状態に応じてエフェクトの強度を調整
    setIntensity(level) {
        switch(level) {
            case 'low':
                this.updateConfig({
                    maxIcons: 4,
                    spawnInterval: 3000,
                    opacity: 0.15
                });
                break;
            case 'medium':
                this.updateConfig({
                    maxIcons: 8,
                    spawnInterval: 2000,
                    opacity: 0.25
                });
                break;
            case 'high':
                this.updateConfig({
                    maxIcons: 12,
                    spawnInterval: 1500,
                    opacity: 0.35
                });
                break;
        }
    }
}

// グローバルインスタンス
let backgroundEffect = null;

// 初期化関数
async function initBackgroundEffect() {
    if (!backgroundEffect) {
        backgroundEffect = new BackgroundIconEffect();
        await backgroundEffect.init();
        console.log('Background effect ready');
    }
    return backgroundEffect;
}

// エクスポート（モジュール使用時）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BackgroundIconEffect, initBackgroundEffect };
}

// デバッグ用関数
window.testBackgroundEffect = function() {
    console.log('Testing background effect...');
    if (backgroundEffect) {
        console.log('Background effect exists');
        console.log('Icon paths:', backgroundEffect.iconPaths.length);
        console.log('Is active:', backgroundEffect.isActive);
        
        if (!backgroundEffect.isActive) {
            backgroundEffect.start();
            console.log('Started background effect');
        } else {
            backgroundEffect.stop();
            console.log('Stopped background effect');
        }
    } else {
        console.log('Background effect not initialized');
    }
};
