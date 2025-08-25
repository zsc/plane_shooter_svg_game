/**
 * 游戏主类
 * 管理整个游戏的运行
 */
class Game {
    constructor() {
        this.canvas = null;
        this.renderer = null;
        this.gameLoop = null;
        this.stateMachine = null;
        this.inputManager = null;
        this.player = null;
        
        // 游戏状态
        this.isInitialized = false;
        this.isRunning = false;
        
        // 性能监控
        this.debugMode = false;
    }

    /**
     * 初始化游戏
     */
    init() {
        console.log('游戏初始化开始...');
        
        // 获取画布
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('找不到游戏画布');
            return false;
        }
        
        // 初始化各个系统
        this.renderer = new Renderer(this.canvas);
        this.gameLoop = new GameLoop();
        this.stateMachine = new StateMachine();
        this.inputManager = new InputManager();
        this.player = new Player();
        
        // 设置游戏循环回调
        this.gameLoop.init(
            (dt) => this.update(dt),
            (dt, interpolation) => this.render(dt, interpolation)
        );
        
        // 修改状态机的游戏状态处理
        this.overrideStateBehaviors();
        
        // 初始状态为菜单
        this.stateMachine.changeState(GameConfig.STATES.MENU);
        
        this.isInitialized = true;
        console.log('游戏初始化完成');
        
        return true;
    }

    /**
     * 覆盖状态机行为
     */
    overrideStateBehaviors() {
        // 覆盖游戏进行中状态的更新和渲染
        const playingState = this.stateMachine.states.get(GameConfig.STATES.PLAYING);
        if (playingState) {
            playingState.update = (dt) => {
                // 更新玩家
                this.player.update(dt, this.inputManager);
            };
            
            playingState.render = (renderer) => {
                // 绘制游戏场景
                renderer.clear();
                renderer.drawBackground(this.gameLoop.getDeltaTime());
                
                // 绘制子弹
                this.player.bullets.forEach(bullet => {
                    renderer.drawCircle(bullet.x, bullet.y, 3, '#FFD700');
                });
                
                // 绘制玩家
                if (!this.player.isDead) {
                    // 无敌时闪烁效果
                    if (!this.player.isInvincible || Math.floor(Date.now() / 100) % 2 === 0) {
                        renderer.drawPlayer(this.player);
                    }
                }
                
                // 绘制HUD
                renderer.drawHUD({
                    health: this.player.health,
                    maxHealth: this.player.maxHealth,
                    score: this.player.score,
                    lives: this.player.lives,
                    fps: this.gameLoop.getFPS()
                });
                
                // 游戏结束检查
                if (this.player.isDead && this.player.lives <= 0) {
                    this.stateMachine.changeState(GameConfig.STATES.GAME_OVER);
                }
            };
        }
        
        // 覆盖游戏结束状态
        const gameOverState = this.stateMachine.states.get(GameConfig.STATES.GAME_OVER);
        if (gameOverState) {
            gameOverState.enter = () => {
                console.log('游戏结束，最终得分：' + this.player.score);
            };
            
            gameOverState.render = (renderer) => {
                renderer.clear();
                renderer.drawText('游戏结束', 320, 300, 48, '#FF0000');
                renderer.drawText(`最终得分: ${this.player.score}`, 320, 400, 32, '#FFD700');
                renderer.drawText('按 Enter 返回菜单', 320, 500, 24, '#FFFFFF');
            };
            
            gameOverState.handleInput = (input) => {
                if (input.isKeyPressed('Enter')) {
                    this.player.reset();
                    this.stateMachine.changeState(GameConfig.STATES.MENU);
                }
            };
        }
    }

    /**
     * 启动游戏
     */
    start() {
        if (!this.isInitialized) {
            console.error('游戏未初始化');
            return;
        }
        
        if (this.isRunning) {
            console.warn('游戏已经在运行');
            return;
        }
        
        console.log('游戏启动');
        this.isRunning = true;
        this.gameLoop.start();
    }

    /**
     * 停止游戏
     */
    stop() {
        console.log('游戏停止');
        this.isRunning = false;
        this.gameLoop.stop();
    }

    /**
     * 暂停游戏
     */
    pause() {
        this.gameLoop.pause();
        this.stateMachine.changeState(GameConfig.STATES.PAUSED);
    }

    /**
     * 恢复游戏
     */
    resume() {
        this.gameLoop.resume();
        this.stateMachine.changeState(GameConfig.STATES.PLAYING);
    }

    /**
     * 更新游戏逻辑
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        // 更新输入
        this.inputManager.update(deltaTime);
        
        // 处理全局输入
        this.handleGlobalInput();
        
        // 更新状态机
        this.stateMachine.update(deltaTime);
        
        // 状态机处理输入
        this.stateMachine.handleInput(this.inputManager);
        
        // 更新调试信息
        if (this.debugMode) {
            this.updateDebugInfo();
        }
    }

    /**
     * 渲染游戏
     * @param {number} deltaTime - 时间增量
     * @param {number} interpolation - 插值因子
     */
    render(deltaTime, interpolation) {
        // 状态机渲染
        this.stateMachine.render(this.renderer);
        
        // 渲染调试信息
        if (this.debugMode) {
            const perfData = this.gameLoop.getPerformanceData();
            perfData.playerX = this.player.x;
            perfData.playerY = this.player.y;
            perfData.gameState = this.stateMachine.getCurrentStateName();
            this.renderer.drawDebugInfo(perfData);
        }
    }

    /**
     * 处理全局输入
     */
    handleGlobalInput() {
        // F3 切换调试模式
        if (this.inputManager.isKeyPressed('F3')) {
            this.debugMode = !this.debugMode;
            const debugDiv = document.getElementById('debugInfo');
            if (debugDiv) {
                debugDiv.classList.toggle('show', this.debugMode);
            }
        }
    }

    /**
     * 更新调试信息
     */
    updateDebugInfo() {
        const perfData = this.gameLoop.getPerformanceData();
        perfData.playerX = this.player.x;
        perfData.playerY = this.player.y;
        perfData.playerSpeed = this.player.getSpeed();
        perfData.bullets = this.player.bullets.length;
        perfData.gameState = this.stateMachine.getCurrentStateName();
    }

    /**
     * 获取游戏实例（用于测试）
     */
    getGameState() {
        return {
            isInitialized: this.isInitialized,
            isRunning: this.isRunning,
            currentState: this.stateMachine.getCurrentStateName(),
            playerPosition: { x: this.player.x, y: this.player.y },
            playerHealth: this.player.health,
            playerScore: this.player.score,
            fps: this.gameLoop.getFPS()
        };
    }

    /**
     * 模拟输入（用于测试）
     */
    simulateInput(keyCode, type = 'press') {
        if (type === 'press') {
            this.inputManager.handleKeyDown({ code: keyCode, preventDefault: () => {} });
        } else if (type === 'release') {
            this.inputManager.handleKeyUp({ code: keyCode });
        }
    }
}