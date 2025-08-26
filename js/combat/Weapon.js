/**
 * 武器基类
 * 定义所有武器的通用属性和方法
 */
class Weapon {
    constructor(config = {}) {
        // 基础属性
        this.type = config.type || 'machinegun';
        this.level = config.level || 1;
        this.damage = config.damage || 10;
        this.fireRate = config.fireRate || 10; // 每秒发射次数
        this.bulletSpeed = config.bulletSpeed || 800;
        this.bulletType = config.bulletType || 'standard';
        
        // 弹药属性
        this.bulletColor = config.bulletColor || '#FFD700';
        this.bulletSize = config.bulletSize || 3;
        this.penetration = config.penetration || 0;
        this.spread = config.spread || 0; // 散射角度
        
        // 能量消耗
        this.energyCost = config.energyCost || 0;
        
        // 射击控制
        this.lastFireTime = 0;
        this.fireInterval = 1000 / this.fireRate;
        this.burstCount = config.burstCount || 1;
        this.burstDelay = config.burstDelay || 0;
        
        // 升级路径
        this.upgradeTree = config.upgradeTree || {};
        this.currentPath = null;
    }
    
    /**
     * 检查是否可以开火
     */
    canFire(currentTime, energy = 100) {
        return currentTime - this.lastFireTime >= this.fireInterval && 
               energy >= this.energyCost;
    }
    
    /**
     * 发射武器
     * @param {Object} position - 发射位置
     * @param {number} currentTime - 当前时间
     * @param {number} direction - 发射方向（弧度）
     * @returns {Array} 生成的子弹数组
     */
    fire(position, currentTime, direction = -Math.PI/2) {
        if (!this.canFire(currentTime)) {
            return [];
        }
        
        this.lastFireTime = currentTime;
        const bullets = [];
        
        // 根据爆发数量生成子弹
        for (let i = 0; i < this.burstCount; i++) {
            const spreadAngle = this.spread * (Math.random() - 0.5);
            const finalDirection = direction + spreadAngle;
            
            bullets.push(this.createBullet(
                position,
                finalDirection,
                i * this.burstDelay
            ));
        }
        
        return bullets;
    }
    
    /**
     * 创建子弹对象
     */
    createBullet(position, direction, delay = 0) {
        return {
            x: position.x,
            y: position.y,
            vx: Math.cos(direction) * this.bulletSpeed,
            vy: Math.sin(direction) * this.bulletSpeed,
            damage: this.damage,
            penetration: this.penetration,
            size: this.bulletSize,
            color: this.bulletColor,
            type: this.bulletType,
            delay: delay,
            active: true,
            lifetime: 3000 // 3秒后自动销毁
        };
    }
    
    /**
     * 升级武器
     */
    upgrade(path = null) {
        this.level++;
        
        // 基础属性提升
        this.damage *= 1.2;
        this.fireRate *= 1.1;
        
        // 根据升级路径调整属性
        if (path && this.upgradeTree[path]) {
            const upgrade = this.upgradeTree[path][this.level];
            if (upgrade) {
                Object.assign(this, upgrade);
            }
        }
    }
    
    /**
     * 获取武器信息
     */
    getInfo() {
        return {
            type: this.type,
            level: this.level,
            damage: this.damage,
            fireRate: this.fireRate,
            energyCost: this.energyCost,
            dps: this.damage * this.fireRate
        };
    }
}

/**
 * 机枪武器类
 */
class MachineGun extends Weapon {
    constructor(level = 1) {
        super({
            type: 'machinegun',
            level: level,
            damage: 10,
            fireRate: 10,
            bulletSpeed: 800,
            bulletType: 'standard',
            bulletColor: '#FFD700',
            bulletSize: 3,
            energyCost: 0,
            penetration: 0,
            spread: 0
        });
        
        // 机枪升级树
        this.upgradeTree = {
            speed: {
                2: { fireRate: 12, damage: 11 },
                3: { fireRate: 15, damage: 12 },
                4: { fireRate: 18, damage: 13 },
                5: { fireRate: 20, damage: 15 }
            },
            spread: {
                2: { burstCount: 2, spread: 0.1 },
                3: { burstCount: 3, spread: 0.15 },
                4: { burstCount: 5, spread: 0.2 },
                5: { burstCount: 7, spread: 0.3 }
            },
            penetration: {
                2: { penetration: 1, damage: 12 },
                3: { penetration: 2, damage: 14 },
                4: { penetration: 3, damage: 16 },
                5: { penetration: 99, damage: 20, bulletType: 'laser' }
            }
        };
        
        // 根据等级初始化
        this.applyLevel(level);
    }
    
    applyLevel(level) {
        // 默认走散射路线
        for (let i = 2; i <= level && i <= 5; i++) {
            if (this.upgradeTree.spread[i]) {
                Object.assign(this, this.upgradeTree.spread[i]);
            }
        }
    }
}

/**
 * 激光炮武器类
 */
class LaserCannon extends Weapon {
    constructor(level = 1) {
        super({
            type: 'laser',
            level: level,
            damage: 50,
            fireRate: 2,
            bulletSpeed: 2000, // 激光速度极快
            bulletType: 'laser',
            bulletColor: '#00FFFF',
            bulletSize: 5,
            energyCost: 10,
            penetration: 3,
            spread: 0
        });
        
        this.beamWidth = 3;
        this.beamDuration = 100; // 激光持续时间
    }
    
    createBullet(position, direction, delay = 0) {
        const bullet = super.createBullet(position, direction, delay);
        bullet.width = this.beamWidth;
        bullet.height = 600; // 激光长度
        bullet.isBeam = true;
        return bullet;
    }
}

/**
 * 导弹发射器类
 */
class MissileLauncher extends Weapon {
    constructor(level = 1) {
        super({
            type: 'missile',
            level: level,
            damage: 100,
            fireRate: 1,
            bulletSpeed: 400,
            bulletType: 'missile',
            bulletColor: '#FF4500',
            bulletSize: 8,
            energyCost: 20,
            penetration: 0,
            spread: 0
        });
        
        this.trackingSpeed = 3; // 追踪转向速度
        this.explosionRadius = 50;
    }
    
    createBullet(position, direction, delay = 0) {
        const bullet = super.createBullet(position, direction, delay);
        bullet.isTracking = true;
        bullet.trackingSpeed = this.trackingSpeed;
        bullet.explosionRadius = this.explosionRadius;
        bullet.target = null; // 将在发射时设置目标
        return bullet;
    }
}

/**
 * 武器管理器
 */
class WeaponManager {
    constructor(player) {
        this.player = player;
        this.weapons = new Map();
        this.activeWeapon = null;
        this.secondaryWeapon = null;
        
        // 初始化默认武器
        this.addWeapon('machinegun', new MachineGun(1));
        this.setActiveWeapon('machinegun');
    }
    
    /**
     * 添加武器
     */
    addWeapon(id, weapon) {
        this.weapons.set(id, weapon);
    }
    
    /**
     * 设置主武器
     */
    setActiveWeapon(id) {
        if (this.weapons.has(id)) {
            this.activeWeapon = this.weapons.get(id);
            return true;
        }
        return false;
    }
    
    /**
     * 设置副武器
     */
    setSecondaryWeapon(id) {
        if (this.weapons.has(id)) {
            this.secondaryWeapon = this.weapons.get(id);
            return true;
        }
        return false;
    }
    
    /**
     * 发射主武器
     */
    fireActiveWeapon(position, currentTime) {
        if (!this.activeWeapon) return [];
        
        const energy = this.player ? this.player.energy : 100;
        if (energy < this.activeWeapon.energyCost) return [];
        
        const bullets = this.activeWeapon.fire(position, currentTime);
        
        if (bullets.length > 0 && this.player) {
            this.player.energy -= this.activeWeapon.energyCost;
        }
        
        return bullets;
    }
    
    /**
     * 发射副武器
     */
    fireSecondaryWeapon(position, currentTime) {
        if (!this.secondaryWeapon) return [];
        
        const energy = this.player ? this.player.energy : 100;
        if (energy < this.secondaryWeapon.energyCost) return [];
        
        const bullets = this.secondaryWeapon.fire(position, currentTime);
        
        if (bullets.length > 0 && this.player) {
            this.player.energy -= this.secondaryWeapon.energyCost;
        }
        
        return bullets;
    }
    
    /**
     * 升级武器
     */
    upgradeWeapon(weaponId, path = null) {
        const weapon = this.weapons.get(weaponId);
        if (weapon) {
            weapon.upgrade(path);
            return true;
        }
        return false;
    }
    
    /**
     * 切换武器
     */
    switchWeapon() {
        if (this.secondaryWeapon) {
            const temp = this.activeWeapon;
            this.activeWeapon = this.secondaryWeapon;
            this.secondaryWeapon = temp;
        }
    }
}