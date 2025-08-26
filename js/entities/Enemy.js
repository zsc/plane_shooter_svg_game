/**
 * 敌机基类
 * 定义所有敌机的通用属性和行为
 */
class Enemy {
    constructor(config = {}) {
        // 基础属性
        this.id = config.id || Math.random().toString(36).substr(2, 9);
        this.type = config.type || 'scout';
        this.tier = config.tier || 1;
        
        // 位置和尺寸
        this.x = config.x || GameConfig.CANVAS.WIDTH / 2;
        this.y = config.y || -50;
        this.width = config.width || 32;
        this.height = config.height || 32;
        this.hitboxRadius = config.hitboxRadius || 16;
        
        // 生命值
        this.maxHealth = config.maxHealth || 20;
        this.health = this.maxHealth;
        this.armor = config.armor || 0;
        this.shield = config.shield || 0;
        
        // 移动属性
        this.baseSpeed = config.baseSpeed || 100;
        this.vx = config.vx || 0;
        this.vy = config.vy || this.baseSpeed;
        this.acceleration = config.acceleration || 0;
        this.turnRate = config.turnRate || 3;
        
        // 战斗属性
        this.damage = config.damage || 10;
        this.fireRate = config.fireRate || 1;
        this.accuracy = config.accuracy || 0.8;
        this.lastFireTime = 0;
        this.weapon = null;
        
        // 奖励属性
        this.scoreValue = config.scoreValue || 100;
        this.dropRate = config.dropRate || 0.1;
        this.experienceValue = config.experienceValue || 10;
        
        // 状态标识
        this.active = true;
        this.isDead = false;
        this.isInvincible = false;
        this.isStunned = false;
        
        // AI行为
        this.behavior = config.behavior || 'linear';
        this.behaviorParams = config.behaviorParams || {};
        this.stateTime = 0;
        
        // 视觉属性
        this.color = this.getTierColor();
        this.flashTime = 0;
    }
    
    /**
     * 根据等级获取颜色
     */
    getTierColor() {
        const colors = {
            1: '#808080', // 灰色
            2: '#4169E1', // 蓝色
            3: '#FF4500', // 橙红
            4: '#9400D3', // 紫色
            5: '#FFD700'  // 金色
        };
        return colors[this.tier] || '#808080';
    }
    
    /**
     * 更新敌机
     */
    update(dt, player = null) {
        if (!this.active || this.isDead) return;
        
        this.stateTime += dt;
        
        // 更新行为
        this.updateBehavior(dt, player);
        
        // 更新位置
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // 更新闪烁效果
        if (this.flashTime > 0) {
            this.flashTime -= dt;
        }
        
        // 边界检测
        if (this.isOutOfBounds()) {
            this.active = false;
        }
        
        // 尝试开火
        if (player && this.canFire()) {
            return this.fire(player);
        }
        
        return null;
    }
    
    /**
     * 更新AI行为
     */
    updateBehavior(dt, player) {
        switch (this.behavior) {
            case 'linear':
                this.linearMovement(dt);
                break;
            case 'sine':
                this.sineWaveMovement(dt);
                break;
            case 'zigzag':
                this.zigzagMovement(dt);
                break;
            case 'circular':
                this.circularMovement(dt);
                break;
            case 'chase':
                this.chasePlayer(dt, player);
                break;
            case 'strafe':
                this.strafeMovement(dt, player);
                break;
            default:
                this.linearMovement(dt);
        }
    }
    
    /**
     * 直线移动
     */
    linearMovement(dt) {
        // 保持当前速度不变
    }
    
    /**
     * 正弦波移动
     */
    sineWaveMovement(dt) {
        const amplitude = this.behaviorParams.amplitude || 100;
        const frequency = this.behaviorParams.frequency || 2;
        
        this.vx = Math.sin(this.stateTime * frequency) * amplitude;
    }
    
    /**
     * 之字形移动
     */
    zigzagMovement(dt) {
        const period = this.behaviorParams.period || 1;
        const amplitude = this.behaviorParams.amplitude || 150;
        
        if (Math.floor(this.stateTime / period) % 2 === 0) {
            this.vx = amplitude;
        } else {
            this.vx = -amplitude;
        }
    }
    
    /**
     * 圆形移动
     */
    circularMovement(dt) {
        const radius = this.behaviorParams.radius || 100;
        const centerX = this.behaviorParams.centerX || GameConfig.CANVAS.WIDTH / 2;
        const centerY = this.behaviorParams.centerY || 200;
        const angularSpeed = this.behaviorParams.angularSpeed || 2;
        
        const angle = this.stateTime * angularSpeed;
        const targetX = centerX + Math.cos(angle) * radius;
        const targetY = centerY + Math.sin(angle) * radius;
        
        this.vx = (targetX - this.x) * 2;
        this.vy = (targetY - this.y) * 2;
    }
    
    /**
     * 追击玩家
     */
    chasePlayer(dt, player) {
        if (!player) return;
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.vx = (dx / distance) * this.baseSpeed;
            this.vy = (dy / distance) * this.baseSpeed;
        }
    }
    
    /**
     * 横向移动攻击
     */
    strafeMovement(dt, player) {
        if (!player) return;
        
        // 保持在玩家上方
        const targetY = player.y - 200;
        this.vy = (targetY - this.y) * 2;
        
        // 左右移动
        this.sineWaveMovement(dt);
    }
    
    /**
     * 检查是否可以开火
     */
    canFire() {
        const currentTime = Date.now();
        const fireInterval = 1000 / this.fireRate;
        
        if (currentTime - this.lastFireTime >= fireInterval) {
            // 精度检查
            if (Math.random() <= this.accuracy) {
                this.lastFireTime = currentTime;
                return true;
            }
        }
        return false;
    }
    
    /**
     * 开火
     */
    fire(player) {
        const bullets = [];
        
        // 计算射击方向
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angle = Math.atan2(dy, dx);
        
        // 根据敌机类型生成不同的弹幕
        switch (this.type) {
            case 'scout':
                bullets.push(this.createBullet(angle));
                break;
            case 'fighter':
                // 三连发
                bullets.push(this.createBullet(angle - 0.1));
                bullets.push(this.createBullet(angle));
                bullets.push(this.createBullet(angle + 0.1));
                break;
            case 'bomber':
                // 扇形弹幕
                for (let i = -2; i <= 2; i++) {
                    bullets.push(this.createBullet(angle + i * 0.2));
                }
                break;
            case 'interceptor':
                // 追踪导弹
                const missile = this.createBullet(angle);
                missile.isTracking = true;
                missile.trackingSpeed = 2;
                bullets.push(missile);
                break;
            default:
                bullets.push(this.createBullet(angle));
        }
        
        return bullets;
    }
    
    /**
     * 创建子弹
     */
    createBullet(angle) {
        const bulletSpeed = 300;
        return {
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * bulletSpeed,
            vy: Math.sin(angle) * bulletSpeed,
            damage: this.damage,
            size: 4,
            color: '#FF6347',
            type: 'enemy',
            active: true,
            lifetime: 0,
            maxLifetime: 5000
        };
    }
    
    /**
     * 受到伤害
     */
    takeDamage(damage) {
        if (this.isInvincible || this.isDead) return false;
        
        // 护甲减伤
        const actualDamage = damage * (1 - this.armor / 100);
        
        // 优先扣除护盾
        if (this.shield > 0) {
            this.shield -= actualDamage;
            if (this.shield < 0) {
                this.health += this.shield;
                this.shield = 0;
            }
        } else {
            this.health -= actualDamage;
        }
        
        // 受击闪烁
        this.flashTime = 0.1;
        
        // 检查死亡
        if (this.health <= 0) {
            this.die();
            return true;
        }
        
        return false;
    }
    
    /**
     * 死亡处理
     */
    die() {
        this.isDead = true;
        this.active = false;
        
        // 这里应该触发死亡动画和掉落物品
        // 返回掉落信息
        return {
            score: this.scoreValue,
            experience: this.experienceValue,
            dropItem: Math.random() < this.dropRate
        };
    }
    
    /**
     * 检查是否出界
     */
    isOutOfBounds() {
        const margin = 100;
        return this.x < -margin || 
               this.x > GameConfig.CANVAS.WIDTH + margin ||
               this.y > GameConfig.CANVAS.HEIGHT + margin ||
               this.y < -margin - 200; // 上方给更多空间
    }
    
    /**
     * 渲染敌机
     */
    render(renderer) {
        if (!this.active || this.isDead) return;
        
        // 闪烁效果
        if (this.flashTime > 0 && Math.floor(this.flashTime * 20) % 2 === 0) {
            renderer.ctx.globalAlpha = 0.5;
        }
        
        // 根据敌机类型渲染不同形状
        renderer.ctx.fillStyle = this.color;
        
        switch (this.type) {
            case 'scout':
                // 三角形
                renderer.ctx.beginPath();
                renderer.ctx.moveTo(this.x, this.y - this.height / 2);
                renderer.ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
                renderer.ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
                renderer.ctx.closePath();
                renderer.ctx.fill();
                break;
                
            case 'fighter':
            case 'interceptor':
                // 菱形
                renderer.ctx.beginPath();
                renderer.ctx.moveTo(this.x, this.y - this.height / 2);
                renderer.ctx.lineTo(this.x - this.width / 2, this.y);
                renderer.ctx.lineTo(this.x, this.y + this.height / 2);
                renderer.ctx.lineTo(this.x + this.width / 2, this.y);
                renderer.ctx.closePath();
                renderer.ctx.fill();
                break;
                
            case 'bomber':
            case 'gunship':
                // 矩形
                renderer.ctx.fillRect(
                    this.x - this.width / 2,
                    this.y - this.height / 2,
                    this.width,
                    this.height
                );
                break;
                
            default:
                // 默认圆形
                renderer.drawCircle(this.x, this.y, this.hitboxRadius, this.color);
        }
        
        // 恢复透明度
        renderer.ctx.globalAlpha = 1;
        
        // 显示血条（可选）
        if (this.health < this.maxHealth) {
            this.renderHealthBar(renderer);
        }
    }
    
    /**
     * 渲染血条
     */
    renderHealthBar(renderer) {
        const barWidth = this.width;
        const barHeight = 4;
        const barY = this.y - this.height / 2 - 10;
        
        // 背景
        renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        renderer.ctx.fillRect(
            this.x - barWidth / 2,
            barY,
            barWidth,
            barHeight
        );
        
        // 血条
        const healthPercent = this.health / this.maxHealth;
        const healthColor = healthPercent > 0.5 ? '#00FF00' : 
                          healthPercent > 0.25 ? '#FFFF00' : '#FF0000';
        
        renderer.ctx.fillStyle = healthColor;
        renderer.ctx.fillRect(
            this.x - barWidth / 2,
            barY,
            barWidth * healthPercent,
            barHeight
        );
    }
}

/**
 * 敌机工厂类
 * 用于创建不同类型的敌机
 */
class EnemyFactory {
    static createEnemy(type, x, y, behaviorParams = {}) {
        const configs = {
            // Tier 1
            scout: {
                type: 'scout',
                tier: 1,
                maxHealth: 20,
                baseSpeed: 150,
                damage: 5,
                scoreValue: 100,
                width: 24,
                height: 24,
                hitboxRadius: 12
            },
            drone: {
                type: 'drone',
                tier: 1,
                maxHealth: 10,
                baseSpeed: 200,
                damage: 20,
                scoreValue: 50,
                fireRate: 0, // 不开火，自爆型
                width: 20,
                height: 20,
                hitboxRadius: 10
            },
            
            // Tier 2
            fighter: {
                type: 'fighter',
                tier: 2,
                maxHealth: 40,
                baseSpeed: 120,
                damage: 10,
                fireRate: 2,
                scoreValue: 200,
                width: 32,
                height: 32,
                hitboxRadius: 16
            },
            bomber: {
                type: 'bomber',
                tier: 2,
                maxHealth: 60,
                baseSpeed: 80,
                damage: 15,
                fireRate: 1,
                scoreValue: 300,
                width: 48,
                height: 48,
                hitboxRadius: 24
            },
            
            // Tier 3
            interceptor: {
                type: 'interceptor',
                tier: 3,
                maxHealth: 80,
                baseSpeed: 180,
                damage: 15,
                fireRate: 1.5,
                accuracy: 0.9,
                scoreValue: 500,
                width: 36,
                height: 36,
                hitboxRadius: 18
            },
            gunship: {
                type: 'gunship',
                tier: 3,
                maxHealth: 150,
                baseSpeed: 60,
                damage: 8,
                fireRate: 5,
                scoreValue: 600,
                width: 64,
                height: 64,
                hitboxRadius: 32
            }
        };
        
        const config = configs[type] || configs.scout;
        config.x = x;
        config.y = y;
        config.behaviorParams = behaviorParams;
        
        return new Enemy(config);
    }
    
    /**
     * 创建敌机编队
     */
    static createFormation(formationType, startX, startY) {
        const enemies = [];
        
        switch (formationType) {
            case 'line':
                // 横排编队
                for (let i = 0; i < 5; i++) {
                    enemies.push(this.createEnemy(
                        'scout',
                        startX + (i - 2) * 60,
                        startY,
                        { behavior: 'linear' }
                    ));
                }
                break;
                
            case 'v':
                // V字编队
                for (let i = 0; i < 5; i++) {
                    const offset = Math.abs(i - 2);
                    enemies.push(this.createEnemy(
                        'fighter',
                        startX + (i - 2) * 50,
                        startY + offset * 30,
                        { behavior: 'linear' }
                    ));
                }
                break;
                
            case 'circle':
                // 圆形编队
                const centerX = startX;
                const centerY = startY + 100;
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    enemies.push(this.createEnemy(
                        'scout',
                        centerX + Math.cos(angle) * 80,
                        centerY + Math.sin(angle) * 80,
                        {
                            behavior: 'circular',
                            centerX: centerX,
                            centerY: centerY,
                            radius: 80,
                            angularSpeed: 1
                        }
                    ));
                }
                break;
                
            case 'wave':
                // 波浪编队
                for (let i = 0; i < 8; i++) {
                    enemies.push(this.createEnemy(
                        'scout',
                        startX - 200 + i * 50,
                        startY,
                        {
                            behavior: 'sine',
                            amplitude: 100,
                            frequency: 2
                        }
                    ));
                }
                break;
        }
        
        return enemies;
    }
}