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
        this.assetManager = null;
        
        // 战斗系统
        this.bulletSystem = null;
        this.collisionSystem = null;
        this.particleSystem = null;
        this.enemies = [];
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 2; // 秒
        this.waveNumber = 0;
        
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
        this.assetManager = new AssetManager();
        
        // 初始化战斗系统
        this.bulletSystem = new BulletSystem();
        this.collisionSystem = new CollisionSystem();
        this.particleSystem = new ParticleSystem();
        
        // 初始化玩家武器
        this.player.weaponManager = new WeaponManager(this.player);
        this.player.weaponManager.addWeapon('laser', new LaserCannon(1));
        this.player.weaponManager.addWeapon('missile', new MissileLauncher(1));
        
        // 设置玩家战机类型
        this.player.aircraftType = 'fighter'; // 可以是 'fighter', 'bomber', 或 'interceptor'
        
        // 异步加载资源
        this.assetManager.init().then(() => {
            console.log('游戏资源加载完成');
        }).catch(error => {
            console.error('资源加载失败:', error);
        });
        
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
                // 更新玩家并获取发射的子弹
                const newBullets = this.player.update(dt, this.inputManager);
                
                // 添加新子弹到子弹系统
                if (newBullets && newBullets.length > 0) {
                    this.bulletSystem.addBullets(newBullets, false);
                }
                
                // 更新敌人
                this.updateEnemies(dt);
                
                // 生成敌人
                this.spawnEnemies(dt);
                
                // 更新子弹系统
                this.bulletSystem.update(dt, this.enemies);
                
                // 碰撞检测
                this.collisionSystem.processCollisions({
                    player: this.player,
                    enemies: this.enemies,
                    bulletSystem: this.bulletSystem,
                    powerups: []
                });
                
                // 更新粒子系统
                this.particleSystem.update(dt);
                
                // 添加推进器火焰效果（限制频率）
                if (this.player.isMoving && !this.player.isDead) {
                    // 每隔几帧创建一次，避免性能问题
                    if (this.gameLoop.frameCount % 3 === 0) {
                        this.particleSystem.createThrusterFlame(
                            this.player.x,
                            this.player.y + this.player.height / 2
                        );
                    }
                }
            };
            
            playingState.enter = () => {
                console.log('进入游戏状态');
                // 重置玩家位置和状态
                this.player.reset();
                // 清空战斗系统
                this.enemies = [];
                this.bulletSystem.clear();
                this.particleSystem.clear();
                this.waveNumber = 0;
                this.enemySpawnTimer = 0;
            };
            
            playingState.render = (renderer) => {
                // 清屏并绘制背景
                renderer.clear();
                renderer.drawBackground(this.gameLoop.getDeltaTime());
                
                // 绘制游戏提示（开始时显示）
                if (this.gameLoop.frameCount < 180) { // 前3秒显示提示
                    renderer.drawText('游戏开始！', 320, 200, 32, '#00FF00');
                    renderer.drawText('使用方向键或WASD移动', 320, 240, 20, '#FFFFFF');
                    renderer.drawText('按1/2/3切换战机', 320, 270, 20, '#FFFFFF');
                }
                
                // 显示切换战机消息
                if (this.messageTimer && this.messageTimer > 0) {
                    renderer.drawText(this.showMessage || '', 320, 100, 28, '#FFD700');
                    this.messageTimer--;
                }
                
                // 绘制粒子效果（底层）
                this.particleSystem.render(renderer);
                
                // 绘制敌人（使用SVG资源）
                this.enemies.forEach(enemy => {
                    if (this.assetManager && this.assetManager.loaded) {
                        renderer.drawEnemy(enemy, this.assetManager);
                    } else {
                        enemy.render(renderer);
                    }
                });
                
                // 绘制子弹（使用SVG资源）
                if (this.assetManager && this.assetManager.loaded) {
                    // 绘制玩家子弹
                    this.bulletSystem.bullets.forEach(bullet => {
                        renderer.drawBullet(bullet, this.assetManager);
                    });
                    // 绘制敌人子弹
                    this.bulletSystem.enemyBullets.forEach(bullet => {
                        renderer.drawBullet(bullet, this.assetManager);
                    });
                } else {
                    this.bulletSystem.render(renderer);
                }
                
                // 旧的子弹系统已废弃，不再渲染
                
                // 绘制玩家（使用SVG资源）
                if (!this.player.isDead) {
                    // 无敌时闪烁效果
                    if (!this.player.isInvincible || Math.floor(Date.now() / 100) % 2 === 0) {
                        renderer.drawPlayer(this.player, this.assetManager);
                    }
                }
                
                // 绘制HUD
                renderer.drawHUD({
                    health: this.player.health,
                    maxHealth: this.player.maxHealth,
                    energy: this.player.energy,
                    maxEnergy: this.player.maxEnergy,
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
        
        // 数字键切换战机类型
        if (this.inputManager.isKeyPressed('Digit1')) {
            if (this.player.aircraftType !== 'fighter') {
                this.player.aircraftType = 'fighter';
                console.log('切换到雷电战机');
                // 视觉反馈
                this.showMessage = '雷电战机';
                this.messageTimer = 60; // 显示1秒
            }
        } else if (this.inputManager.isKeyPressed('Digit2')) {
            if (this.player.aircraftType !== 'bomber') {
                this.player.aircraftType = 'bomber';
                console.log('切换到重型轰炸机');
                this.showMessage = '重型轰炸机';
                this.messageTimer = 60;
            }
        } else if (this.inputManager.isKeyPressed('Digit3')) {
            if (this.player.aircraftType !== 'interceptor') {
                this.player.aircraftType = 'interceptor';
                console.log('切换到幽灵拦截机');
                this.showMessage = '幽灵拦截机';
                this.messageTimer = 60;
            }
        }
        
        // Tab键切换武器
        if (this.inputManager.isKeyPressed('Tab')) {
            if (this.player.weaponManager) {
                this.player.weaponManager.switchWeapon();
                console.log('切换武器');
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
        perfData.bullets = this.player.bullets.length + this.bulletSystem.bullets.length;
        perfData.enemyBullets = this.bulletSystem.enemyBullets.length;
        perfData.enemies = this.enemies.length;
        perfData.particles = this.particleSystem.particles.length;
        perfData.gameState = this.stateMachine.getCurrentStateName();
        perfData.wave = this.waveNumber;
        perfData.score = this.player.score;
        
        // 更新HTML调试信息
        const debugDiv = document.getElementById('debugInfo');
        if (debugDiv && this.debugMode) {
            debugDiv.innerHTML = `
                FPS: ${perfData.fps}<br>
                State: ${perfData.gameState}<br>
                Wave: ${perfData.wave}<br>
                Score: ${perfData.score}<br>
                Enemies: ${perfData.enemies}<br>
                Player Bullets: ${perfData.bullets}<br>
                Enemy Bullets: ${perfData.enemyBullets}<br>
                Particles: ${perfData.particles}<br>
                Player: (${Math.round(perfData.playerX)}, ${Math.round(perfData.playerY)})<br>
                Update: ${perfData.updateTime}ms<br>
                Render: ${perfData.renderTime}ms
            `;
        }
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
     * 生成敌人
     */
    spawnEnemies(dt) {
        this.enemySpawnTimer += dt;
        
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.enemySpawnTimer = 0;
            this.waveNumber++;
            
            // 根据波数调整难度
            const difficulty = Math.min(this.waveNumber / 10, 1);
            
            // 随机选择生成模式
            const formations = ['line', 'v', 'wave', 'circle'];
            const formation = formations[Math.floor(Math.random() * formations.length)];
            
            // 生成敌人编队
            const startX = GameConfig.CANVAS.WIDTH / 2;
            const startY = -50;
            const newEnemies = EnemyFactory.createFormation(formation, startX, startY);
            
            // 根据难度调整敌人属性
            newEnemies.forEach(enemy => {
                enemy.maxHealth *= (1 + difficulty * 0.5);
                enemy.health = enemy.maxHealth;
                enemy.damage *= (1 + difficulty * 0.3);
                enemy.scoreValue *= (1 + difficulty);
                
                // 随机设置行为
                const behaviors = ['linear', 'sine', 'zigzag', 'strafe'];
                enemy.behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
            });
            
            this.enemies.push(...newEnemies);
            
            // 调整生成间隔
            this.enemySpawnInterval = Math.max(1, 3 - difficulty * 1.5);
        }
    }
    
    /**
     * 更新敌人
     */
    updateEnemies(dt) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (!enemy.active) {
                // 敌人死亡时创建爆炸效果
                if (enemy.isDead) {
                    this.particleSystem.createExplosion(enemy.x, enemy.y);
                    this.player.addScore(enemy.scoreValue);
                }
                
                this.enemies.splice(i, 1);
                continue;
            }
            
            // 更新敌人并获取发射的子弹
            const bullets = enemy.update(dt, this.player);
            
            // 添加敌人子弹到子弹系统
            if (bullets && bullets.length > 0) {
                this.bulletSystem.addBullets(bullets, true);
            }
        }
        
        // 处理子弹与敌人的碰撞效果
        this.handleBulletCollisions();
    }
    
    /**
     * 处理子弹碰撞效果
     */
    handleBulletCollisions() {
        // 检测玩家子弹与敌人碰撞
        this.bulletSystem.bullets.forEach(bullet => {
            if (!bullet.active) return;
            
            this.enemies.forEach(enemy => {
                if (!enemy.active || enemy.isDead) return;
                
                if (this.bulletSystem.checkCollision(bullet, enemy)) {
                    const destroyed = this.bulletSystem.handleBulletHit(bullet, enemy);
                    
                    // 创建击中效果
                    this.particleSystem.createHitEffect(enemy.x, enemy.y);
                    
                    if (destroyed || enemy.health <= 0) {
                        enemy.isDead = true;
                        enemy.active = false;
                    }
                }
            });
        });
        
        // 检测敌人子弹与玩家碰撞
        if (!this.player.isInvincible && !this.player.isDead) {
            this.bulletSystem.enemyBullets.forEach(bullet => {
                if (!bullet.active) return;
                
                if (this.bulletSystem.checkCollision(bullet, this.player)) {
                    this.bulletSystem.handleBulletHit(bullet, this.player);
                    
                    // 创建击中效果
                    this.particleSystem.createSparks(this.player.x, this.player.y);
                }
            });
        }
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