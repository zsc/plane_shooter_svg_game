/**
 * 游戏循环管理器
 * 负责管理游戏的主循环、时间控制和帧率管理
 */
class GameLoop {
    constructor() {
        this.isRunning = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateTime = 0;
        this.accumulator = 0;
        
        // 回调函数
        this.updateCallback = null;
        this.renderCallback = null;
        
        // 性能监控
        this.performanceData = {
            updateTime: 0,
            renderTime: 0,
            frameTime: 0
        };
        
        // 绑定循环函数
        this.loop = this.loop.bind(this);
    }

    /**
     * 初始化游戏循环
     * @param {Function} updateCallback - 更新回调函数
     * @param {Function} renderCallback - 渲染回调函数
     */
    init(updateCallback, renderCallback) {
        this.updateCallback = updateCallback;
        this.renderCallback = renderCallback;
        this.lastTime = performance.now();
    }

    /**
     * 启动游戏循环
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.fpsUpdateTime = this.lastTime;
        this.frameCount = 0;
        
        console.log('游戏循环启动');
        requestAnimationFrame(this.loop);
    }

    /**
     * 停止游戏循环
     */
    stop() {
        this.isRunning = false;
        console.log('游戏循环停止');
    }

    /**
     * 暂停游戏循环
     */
    pause() {
        this.isRunning = false;
    }

    /**
     * 恢复游戏循环
     */
    resume() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.loop);
        }
    }

    /**
     * 主循环函数
     * @param {number} currentTime - 当前时间戳
     */
    loop(currentTime) {
        if (!this.isRunning) return;

        // 计算时间增量
        const rawDeltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 限制最大时间增量，防止大幅跳帧
        this.deltaTime = Math.min(rawDeltaTime, GameConfig.GAME.FRAME_TIME * 2);
        
        // 固定时间步长更新
        this.accumulator += this.deltaTime;
        
        let updateStart = performance.now();
        let updateCount = 0;
        
        // 使用固定时间步长进行逻辑更新
        while (this.accumulator >= GameConfig.GAME.FRAME_TIME) {
            if (this.updateCallback) {
                this.updateCallback(GameConfig.GAME.FRAME_TIME / 1000); // 转换为秒
            }
            this.accumulator -= GameConfig.GAME.FRAME_TIME;
            updateCount++;
            
            // 防止死循环
            if (updateCount > 5) {
                this.accumulator = 0;
                break;
            }
        }
        
        this.performanceData.updateTime = performance.now() - updateStart;
        
        // 渲染
        let renderStart = performance.now();
        if (this.renderCallback) {
            // 插值因子用于平滑渲染
            const interpolation = this.accumulator / GameConfig.GAME.FRAME_TIME;
            this.renderCallback(this.deltaTime / 1000, interpolation);
        }
        this.performanceData.renderTime = performance.now() - renderStart;
        
        // 更新FPS
        this.updateFPS(currentTime);
        
        // 性能数据
        this.performanceData.frameTime = rawDeltaTime;
        
        // 继续循环
        requestAnimationFrame(this.loop);
    }

    /**
     * 更新FPS计数
     * @param {number} currentTime - 当前时间戳
     */
    updateFPS(currentTime) {
        this.frameCount++;
        
        // 每秒更新一次FPS
        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.fpsUpdateTime));
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
            
            // 性能自适应
            if (GameConfig.PERFORMANCE.AUTO_QUALITY) {
                this.adjustQuality();
            }
        }
    }

    /**
     * 根据FPS自动调整游戏质量
     */
    adjustQuality() {
        if (this.fps < GameConfig.PERFORMANCE.MIN_FPS) {
            // 降低质量
            if (GameConfig.RENDER.PARTICLE_LIMIT > 50) {
                GameConfig.RENDER.PARTICLE_LIMIT = Math.max(50, GameConfig.RENDER.PARTICLE_LIMIT - 10);
            }
            if (GameConfig.PERFORMANCE.MAX_ENTITIES > 50) {
                GameConfig.PERFORMANCE.MAX_ENTITIES = Math.max(50, GameConfig.PERFORMANCE.MAX_ENTITIES - 10);
            }
        } else if (this.fps >= GameConfig.PERFORMANCE.TARGET_FPS - 5) {
            // 提升质量
            if (GameConfig.RENDER.PARTICLE_LIMIT < 100) {
                GameConfig.RENDER.PARTICLE_LIMIT = Math.min(100, GameConfig.RENDER.PARTICLE_LIMIT + 5);
            }
            if (GameConfig.PERFORMANCE.MAX_ENTITIES < 100) {
                GameConfig.PERFORMANCE.MAX_ENTITIES = Math.min(100, GameConfig.PERFORMANCE.MAX_ENTITIES + 5);
            }
        }
    }

    /**
     * 获取当前FPS
     * @returns {number} 当前帧率
     */
    getFPS() {
        return this.fps;
    }

    /**
     * 获取时间增量
     * @returns {number} 时间增量（秒）
     */
    getDeltaTime() {
        return this.deltaTime / 1000;
    }

    /**
     * 获取性能数据
     * @returns {Object} 性能数据对象
     */
    getPerformanceData() {
        return {
            fps: this.fps,
            updateTime: this.performanceData.updateTime.toFixed(2),
            renderTime: this.performanceData.renderTime.toFixed(2),
            frameTime: this.performanceData.frameTime.toFixed(2)
        };
    }
}