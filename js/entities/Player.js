/**
 * 玩家战机类
 * 管理玩家的所有属性和行为
 */
class Player {
    constructor() {
        // 位置
        this.x = GameConfig.PLAYER.INITIAL_X;
        this.y = GameConfig.PLAYER.INITIAL_Y;
        
        // 速度
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        
        // 属性
        this.baseSpeed = GameConfig.PLAYER.BASE_SPEED;
        this.maxSpeed = GameConfig.PLAYER.MAX_SPEED;
        this.accelerationRate = GameConfig.PLAYER.ACCELERATION;
        this.decelerationRate = GameConfig.PLAYER.DECELERATION;
        
        // 尺寸
        this.width = GameConfig.PLAYER.SIZE.WIDTH;
        this.height = GameConfig.PLAYER.SIZE.HEIGHT;
        this.hitBox = {
            width: GameConfig.PLAYER.HIT_BOX.WIDTH,
            height: GameConfig.PLAYER.HIT_BOX.HEIGHT
        };
        
        // 生命值
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.lives = 3;
        
        // 状态
        this.isMoving = false;
        this.isInvincible = false;
        this.invincibleTime = 0;
        this.isDead = false;
        
        // 分数
        this.score = 0;
        
        // 武器
        this.weaponManager = null; // 将在Game.js中初始化
        this.fireRate = 5; // 每秒发射次数
        this.fireCooldown = 0;
        this.bullets = [];
        
        // 能量系统
        this.maxEnergy = 100;
        this.energy = this.maxEnergy;
        this.energyRegen = 10; // 每秒恢复
        
        // 碰撞
        this.hitboxRadius = 16;
        this.active = true;
        
        // 边界
        this.bounds = GameConfig.PLAYER.BOUNDS;
    }

    /**
     * 更新玩家状态
     * @param {number} deltaTime - 时间增量（秒）
     * @param {InputManager} input - 输入管理器
     */
    update(deltaTime, input) {
        if (this.isDead) return;
        
        // 处理输入
        this.handleInput(input);
        
        // 更新移动
        this.updateMovement(deltaTime);
        
        // 更新武器
        this.updateWeapon(deltaTime, input);
        
        // 更新无敌时间
        this.updateInvincibility(deltaTime);
        
        // 检查边界
        this.checkBounds();
    }

    /**
     * 处理输入
     * @param {InputManager} input - 输入管理器
     */
    handleInput(input) {
        const movement = input.getMovementInput();
        
        // 设置目标加速度
        this.acceleration.x = movement.x * this.accelerationRate;
        this.acceleration.y = movement.y * this.accelerationRate;
        
        // 更新移动状态
        this.isMoving = Math.abs(movement.x) > 0.01 || Math.abs(movement.y) > 0.01;
    }

    /**
     * 更新移动
     * @param {number} deltaTime - 时间增量
     */
    updateMovement(deltaTime) {
        // 应用加速度
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        
        // 应用减速（摩擦力）
        if (!this.isMoving) {
            const deceleration = this.decelerationRate * deltaTime;
            
            if (Math.abs(this.velocity.x) > deceleration) {
                this.velocity.x -= Math.sign(this.velocity.x) * deceleration;
            } else {
                this.velocity.x = 0;
            }
            
            if (Math.abs(this.velocity.y) > deceleration) {
                this.velocity.y -= Math.sign(this.velocity.y) * deceleration;
            } else {
                this.velocity.y = 0;
            }
        }
        
        // 限制最大速度
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
        }
        
        // 更新位置
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
    }

    /**
     * 更新武器系统
     * @param {number} deltaTime - 时间增量
     * @param {InputManager} input - 输入管理器
     */
    updateWeapon(deltaTime, input) {
        // 恢复能量
        this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegen * deltaTime);
        
        // 如果有武器管理器，使用新系统
        if (this.weaponManager) {
            // 自动发射主武器
            const currentTime = Date.now();
            const bullets = this.weaponManager.fireActiveWeapon(
                { x: this.x, y: this.y - 30 },
                currentTime
            );
            
            // 返回子弹数组供游戏系统处理
            return bullets;
        } else {
            // 旧的武器系统（向后兼容）
            // 更新冷却
            if (this.fireCooldown > 0) {
                this.fireCooldown -= deltaTime;
            }
            
            // 自动射击
            if (this.fireCooldown <= 0) {
                this.fire();
                this.fireCooldown = 1.0 / this.fireRate;
            }
            
            // 更新子弹
            this.updateBullets(deltaTime);
        }
    }

    /**
     * 发射子弹（旧系统）
     */
    fire() {
        // 简单的子弹对象
        const bullet = {
            x: this.x,
            y: this.y - 30,
            velocity: { x: 0, y: -500 }, // 向上飞行
            vx: 0,
            vy: -500,
            damage: 10,
            active: true,
            size: 3,
            color: '#FFD700'
        };
        
        this.bullets.push(bullet);
    }

    /**
     * 更新子弹（旧系统）
     * @param {number} deltaTime - 时间增量
     */
    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // 更新位置
            if (bullet.velocity) {
                bullet.x += bullet.velocity.x * deltaTime;
                bullet.y += bullet.velocity.y * deltaTime;
            } else {
                bullet.x += (bullet.vx || 0) * deltaTime;
                bullet.y += (bullet.vy || 0) * deltaTime;
            }
            
            // 移除超出屏幕的子弹
            if (bullet.y < -10 || bullet.y > GameConfig.CANVAS.HEIGHT + 10 ||
                bullet.x < -10 || bullet.x > GameConfig.CANVAS.WIDTH + 10) {
                this.bullets.splice(i, 1);
            }
        }
    }

    /**
     * 更新无敌时间
     * @param {number} deltaTime - 时间增量
     */
    updateInvincibility(deltaTime) {
        if (this.isInvincible && this.invincibleTime > 0) {
            this.invincibleTime -= deltaTime;
            if (this.invincibleTime <= 0) {
                this.isInvincible = false;
            }
        }
    }

    /**
     * 检查边界
     */
    checkBounds() {
        // 左边界
        if (this.x - this.width / 2 < this.bounds.MIN_X) {
            this.x = this.bounds.MIN_X + this.width / 2;
            this.velocity.x = Math.max(0, this.velocity.x);
        }
        
        // 右边界
        if (this.x + this.width / 2 > this.bounds.MAX_X) {
            this.x = this.bounds.MAX_X - this.width / 2;
            this.velocity.x = Math.min(0, this.velocity.x);
        }
        
        // 上边界
        if (this.y - this.height / 2 < this.bounds.MIN_Y) {
            this.y = this.bounds.MIN_Y + this.height / 2;
            this.velocity.y = Math.max(0, this.velocity.y);
        }
        
        // 下边界
        if (this.y + this.height / 2 > this.bounds.MAX_Y) {
            this.y = this.bounds.MAX_Y - this.height / 2;
            this.velocity.y = Math.min(0, this.velocity.y);
        }
    }

    /**
     * 受到伤害
     * @param {number} damage - 伤害值
     */
    takeDamage(damage) {
        if (this.isInvincible || this.isDead) return;
        
        this.health -= damage;
        
        if (this.health <= 0) {
            this.health = 0;
            this.onDeath();
        } else {
            // 受伤后短暂无敌
            this.isInvincible = true;
            this.invincibleTime = 2.0; // 2秒无敌时间
        }
    }

    /**
     * 恢复生命值
     * @param {number} amount - 恢复量
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    /**
     * 死亡处理
     */
    onDeath() {
        this.lives--;
        
        if (this.lives > 0) {
            // 重生
            this.respawn();
        } else {
            // 游戏结束
            this.isDead = true;
        }
    }

    /**
     * 重生
     */
    respawn() {
        this.x = GameConfig.PLAYER.INITIAL_X;
        this.y = GameConfig.PLAYER.INITIAL_Y;
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.health = this.maxHealth;
        this.isInvincible = true;
        this.invincibleTime = 3.0; // 3秒重生无敌
        this.isDead = false;
    }

    /**
     * 增加分数
     * @param {number} points - 分数
     */
    addScore(points) {
        this.score += points;
    }

    /**
     * 获取碰撞箱
     * @returns {Object} 碰撞箱
     */
    getHitBox() {
        return {
            x: this.x - this.hitBox.width / 2,
            y: this.y - this.hitBox.height / 2,
            width: this.hitBox.width,
            height: this.hitBox.height
        };
    }

    /**
     * 获取当前速度
     * @returns {number} 当前速度
     */
    getSpeed() {
        return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    }

    /**
     * 重置玩家
     */
    reset() {
        this.x = GameConfig.PLAYER.INITIAL_X;
        this.y = GameConfig.PLAYER.INITIAL_Y;
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.health = this.maxHealth;
        this.lives = 3;
        this.score = 0;
        this.isInvincible = false;
        this.invincibleTime = 0;
        this.isDead = false;
        this.bullets = [];
        this.fireCooldown = 0;
    }
}