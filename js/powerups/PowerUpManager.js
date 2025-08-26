/**
 * 道具管理器
 * 负责道具的生成、管理和效果追踪
 */
class PowerUpManager {
    constructor() {
        // 道具池
        this.powerUps = [];
        this.maxPowerUps = 50;
        
        // 掉落系统
        this.dropChance = 0.1; // 基础掉落率
        this.dropRates = this.defineDropRates();
        
        // 活动效果追踪
        this.activeEffects = new Map();
        
        // 连锁系统
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboTimeout = 2000; // 2秒内连续拾取算连锁
        this.maxCombo = 0;
        
        // 统计数据
        this.stats = {
            totalDropped: 0,
            totalCollected: 0,
            byType: {}
        };
        
        // 特殊事件
        this.events = {
            onPowerUpCollected: null,
            onComboIncrease: null,
            onEffectExpired: null
        };
    }
    
    /**
     * 定义掉落率
     */
    defineDropRates() {
        return {
            // 普通敌机掉落表
            normal: [
                { type: 'coin', weight: 30 },
                { type: 'weapon_upgrade', weight: 25 },
                { type: 'health', weight: 20 },
                { type: 'spread_shot', weight: 10 },
                { type: 'speed_boost', weight: 8 },
                { type: 'fire_rate', weight: 7 }
            ],
            
            // 精英敌机掉落表
            elite: [
                { type: 'weapon_upgrade', weight: 20 },
                { type: 'laser', weight: 18 },
                { type: 'missile', weight: 18 },
                { type: 'shield', weight: 15 },
                { type: 'gem', weight: 12 },
                { type: 'magnet', weight: 10 },
                { type: 'bomb', weight: 7 }
            ],
            
            // Boss掉落表
            boss: [
                { type: 'life', weight: 25 },
                { type: 'invincible', weight: 20 },
                { type: 'score_multiplier', weight: 20 },
                { type: 'laser', weight: 15 },
                { type: 'missile', weight: 10 },
                { type: 'shield', weight: 10 }
            ],
            
            // 特殊事件掉落
            special: [
                { type: 'life', weight: 100 }
            ]
        };
    }
    
    /**
     * 初始化
     */
    init() {
        console.log('道具管理器初始化完成');
    }
    
    /**
     * 生成道具
     */
    spawnPowerUp(x, y, dropTable = 'normal', guaranteed = false) {
        // 检查是否应该掉落
        if (!guaranteed && Math.random() > this.dropChance) {
            return null;
        }
        
        // 检查道具数量限制
        if (this.powerUps.length >= this.maxPowerUps) {
            // 移除最旧的非活动道具
            const index = this.powerUps.findIndex(p => !p.active);
            if (index !== -1) {
                this.powerUps.splice(index, 1);
            } else {
                return null;
            }
        }
        
        // 选择道具类型
        const type = this.selectPowerUpType(dropTable);
        if (!type) return null;
        
        // 创建道具
        const powerUp = new PowerUp(x, y, type);
        this.powerUps.push(powerUp);
        
        // 更新统计
        this.stats.totalDropped++;
        if (!this.stats.byType[type]) {
            this.stats.byType[type] = { dropped: 0, collected: 0 };
        }
        this.stats.byType[type].dropped++;
        
        console.log(`生成道具: ${powerUp.name} at (${x}, ${y})`);
        return powerUp;
    }
    
    /**
     * 根据掉落表选择道具类型
     */
    selectPowerUpType(dropTable) {
        const table = this.dropRates[dropTable] || this.dropRates.normal;
        const totalWeight = table.reduce((sum, item) => sum + item.weight, 0);
        
        let random = Math.random() * totalWeight;
        for (const item of table) {
            random -= item.weight;
            if (random <= 0) {
                return item.type;
            }
        }
        
        return table[0].type; // 默认返回第一个
    }
    
    /**
     * 批量生成道具
     */
    spawnMultiplePowerUps(x, y, count, dropTable = 'normal') {
        const spawned = [];
        const spread = 50;
        
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * spread;
            const offsetY = (Math.random() - 0.5) * spread;
            
            const powerUp = this.spawnPowerUp(
                x + offsetX,
                y + offsetY,
                dropTable,
                true // 保证生成
            );
            
            if (powerUp) {
                spawned.push(powerUp);
            }
        }
        
        return spawned;
    }
    
    /**
     * 更新所有道具
     */
    update(deltaTime, player) {
        // 更新连锁计时器
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime * 1000;
            if (this.comboTimer <= 0) {
                this.resetCombo();
            }
        }
        
        // 更新道具
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            if (!powerUp.active) {
                this.powerUps.splice(i, 1);
                continue;
            }
            
            // 更新道具
            powerUp.update(deltaTime, player);
            
            // 检查是否被收集
            if (powerUp.collected) {
                this.onPowerUpCollected(powerUp, player);
                this.powerUps.splice(i, 1);
            }
        }
        
        // 更新活动效果
        this.updateActiveEffects(deltaTime);
    }
    
    /**
     * 道具被收集时的处理
     */
    onPowerUpCollected(powerUp, player) {
        // 更新统计
        this.stats.totalCollected++;
        if (this.stats.byType[powerUp.type]) {
            this.stats.byType[powerUp.type].collected++;
        }
        
        // 更新连锁
        this.updateCombo(powerUp);
        
        // 记录活动效果
        if (powerUp.duration && powerUp.duration > 0) {
            this.addActiveEffect(powerUp.type, powerUp.duration);
        }
        
        // 触发事件
        if (this.events.onPowerUpCollected) {
            this.events.onPowerUpCollected(powerUp, player);
        }
        
        // 连锁奖励
        if (this.comboCount > 1) {
            const bonusScore = powerUp.score * this.comboCount;
            player.addScore(bonusScore);
            console.log(`连锁x${this.comboCount}! 额外得分: ${bonusScore}`);
        }
    }
    
    /**
     * 更新连锁
     */
    updateCombo(powerUp) {
        this.comboCount++;
        this.comboTimer = this.comboTimeout;
        
        if (this.comboCount > this.maxCombo) {
            this.maxCombo = this.comboCount;
        }
        
        if (this.events.onComboIncrease) {
            this.events.onComboIncrease(this.comboCount);
        }
    }
    
    /**
     * 重置连锁
     */
    resetCombo() {
        if (this.comboCount > 1) {
            console.log(`连锁结束，最高连锁: x${this.comboCount}`);
        }
        this.comboCount = 0;
        this.comboTimer = 0;
    }
    
    /**
     * 添加活动效果
     */
    addActiveEffect(type, duration) {
        const endTime = Date.now() + duration;
        
        if (this.activeEffects.has(type)) {
            // 延长持续时间
            const currentEndTime = this.activeEffects.get(type);
            this.activeEffects.set(type, Math.max(currentEndTime, endTime));
        } else {
            // 新效果
            this.activeEffects.set(type, endTime);
        }
    }
    
    /**
     * 更新活动效果
     */
    updateActiveEffects(deltaTime) {
        const now = Date.now();
        
        for (const [type, endTime] of this.activeEffects.entries()) {
            if (now >= endTime) {
                this.activeEffects.delete(type);
                
                if (this.events.onEffectExpired) {
                    this.events.onEffectExpired(type);
                }
                
                console.log(`效果结束: ${type}`);
            }
        }
    }
    
    /**
     * 检查效果是否激活
     */
    isEffectActive(type) {
        return this.activeEffects.has(type);
    }
    
    /**
     * 获取效果剩余时间
     */
    getEffectRemainingTime(type) {
        if (!this.activeEffects.has(type)) return 0;
        
        const endTime = this.activeEffects.get(type);
        return Math.max(0, endTime - Date.now());
    }
    
    /**
     * 渲染所有道具
     */
    render(renderer) {
        this.powerUps.forEach(powerUp => {
            powerUp.render(renderer);
        });
        
        // 渲染连锁信息
        if (this.comboCount > 1) {
            this.renderCombo(renderer);
        }
        
        // 渲染活动效果
        this.renderActiveEffects(renderer);
    }
    
    /**
     * 渲染连锁信息
     */
    renderCombo(renderer) {
        const x = GameConfig.CANVAS.WIDTH / 2;
        const y = 150;
        
        renderer.drawText(
            `COMBO x${this.comboCount}`,
            x, y,
            24 + this.comboCount * 2,
            '#FFD700'
        );
        
        // 连锁进度条
        const barWidth = 100;
        const barHeight = 8;
        const barX = x - barWidth / 2;
        const barY = y + 20;
        
        // 背景
        renderer.drawRect(barX, barY, barWidth, barHeight, 'rgba(0,0,0,0.5)');
        
        // 进度
        const progress = this.comboTimer / this.comboTimeout;
        renderer.drawRect(barX, barY, barWidth * progress, barHeight, '#FFD700');
    }
    
    /**
     * 渲染活动效果
     */
    renderActiveEffects(renderer) {
        let y = 100;
        const x = 20;
        
        for (const [type, endTime] of this.activeEffects.entries()) {
            const remaining = Math.ceil((endTime - Date.now()) / 1000);
            
            // 获取道具配置（临时创建用于获取信息）
            const tempPowerUp = new PowerUp(0, 0, type);
            
            renderer.drawText(
                `${tempPowerUp.name}: ${remaining}s`,
                x, y,
                14,
                tempPowerUp.color
            );
            
            y += 20;
        }
    }
    
    /**
     * 清除所有道具
     */
    clearAll() {
        this.powerUps = [];
        this.activeEffects.clear();
        this.resetCombo();
    }
    
    /**
     * 触发炸弹效果（收集所有道具）
     */
    collectAll(player) {
        const collected = [];
        
        this.powerUps.forEach(powerUp => {
            if (powerUp.active && !powerUp.collected) {
                powerUp.collect(player);
                collected.push(powerUp);
            }
        });
        
        return collected;
    }
    
    /**
     * 获取统计信息
     */
    getStats() {
        return {
            ...this.stats,
            currentPowerUps: this.powerUps.length,
            activeEffects: this.activeEffects.size,
            currentCombo: this.comboCount,
            maxCombo: this.maxCombo
        };
    }
    
    /**
     * 调整掉落率
     */
    setDropChance(chance) {
        this.dropChance = Math.max(0, Math.min(1, chance));
    }
    
    /**
     * 重置
     */
    reset() {
        this.powerUps = [];
        this.activeEffects.clear();
        this.resetCombo();
        this.stats = {
            totalDropped: 0,
            totalCollected: 0,
            byType: {}
        };
    }
}