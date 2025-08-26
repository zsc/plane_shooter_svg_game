/**
 * 道具基类
 * 定义所有道具的通用属性和行为
 */
class PowerUp {
    constructor(x, y, type) {
        // 位置属性
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 50; // 默认下落速度
        
        // 基础属性
        this.type = type;
        this.active = true;
        this.collected = false;
        
        // 视觉属性
        this.width = 32;
        this.height = 32;
        this.radius = 16;
        this.rotation = 0;
        this.rotationSpeed = 2;
        
        // 磁力吸附
        this.magnetRange = 100;
        this.magnetStrength = 200;
        this.isBeingAttracted = false;
        
        // 生命周期
        this.lifetime = 10000; // 10秒后消失
        this.flashTime = 3000; // 最后3秒闪烁
        this.currentTime = 0;
        
        // 动画
        this.bobAmplitude = 5;
        this.bobFrequency = 0.002;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.glowRadius = 0;
        this.glowDirection = 1;
        
        // 初始化道具属性
        this.initializePowerUp();
    }
    
    /**
     * 初始化道具特定属性
     */
    initializePowerUp() {
        const powerUpConfigs = {
            // 武器强化类
            weapon_upgrade: {
                name: '火力升级',
                color: '#FF4444',
                icon: 'P',
                rarity: 'common',
                score: 100
            },
            laser: {
                name: '激光武器',
                color: '#00FFFF',
                icon: 'L',
                rarity: 'rare',
                score: 200,
                duration: 15000
            },
            missile: {
                name: '追踪导弹',
                color: '#00FF00',
                icon: 'M',
                rarity: 'uncommon',
                score: 150,
                duration: 20000
            },
            spread_shot: {
                name: '散射弹',
                color: '#FFA500',
                icon: 'S',
                rarity: 'uncommon',
                score: 150,
                duration: 15000
            },
            
            // 防御类
            shield: {
                name: '护盾',
                color: '#4444FF',
                icon: 'B',
                rarity: 'uncommon',
                score: 100,
                duration: 10000
            },
            invincible: {
                name: '无敌',
                color: '#FFD700',
                icon: 'I',
                rarity: 'epic',
                score: 300,
                duration: 5000
            },
            
            // 特殊道具
            bomb: {
                name: '炸弹',
                color: '#FF00FF',
                icon: 'X',
                rarity: 'rare',
                score: 200,
                instant: true
            },
            health: {
                name: '生命值',
                color: '#FF69B4',
                icon: '+',
                rarity: 'common',
                score: 50,
                healAmount: 30
            },
            life: {
                name: '额外生命',
                color: '#00FF00',
                icon: '1UP',
                rarity: 'legendary',
                score: 500
            },
            
            // 增益类
            speed_boost: {
                name: '速度提升',
                color: '#00BFFF',
                icon: '>>',
                rarity: 'uncommon',
                score: 100,
                duration: 10000,
                speedMultiplier: 1.5
            },
            fire_rate: {
                name: '射速提升',
                color: '#FF6347',
                icon: 'R',
                rarity: 'uncommon',
                score: 100,
                duration: 15000,
                fireRateMultiplier: 2
            },
            magnet: {
                name: '磁力吸附',
                color: '#9370DB',
                icon: 'O',
                rarity: 'uncommon',
                score: 100,
                duration: 20000,
                magnetMultiplier: 2
            },
            
            // 分数类
            coin: {
                name: '金币',
                color: '#FFD700',
                icon: '$',
                rarity: 'common',
                score: 500,
                instant: true
            },
            gem: {
                name: '宝石',
                color: '#FF1493',
                icon: '♦',
                rarity: 'rare',
                score: 1000,
                instant: true
            },
            score_multiplier: {
                name: '分数倍增',
                color: '#DAA520',
                icon: 'x2',
                rarity: 'rare',
                score: 0,
                duration: 30000,
                multiplier: 2
            }
        };
        
        const config = powerUpConfigs[this.type] || powerUpConfigs.weapon_upgrade;
        Object.assign(this, config);
        
        // 根据稀有度调整视觉效果
        this.setRarityEffects();
    }
    
    /**
     * 设置稀有度效果
     */
    setRarityEffects() {
        const rarityEffects = {
            common: {
                glowIntensity: 0.3,
                particleCount: 2,
                magnetRange: 80
            },
            uncommon: {
                glowIntensity: 0.5,
                particleCount: 3,
                magnetRange: 100
            },
            rare: {
                glowIntensity: 0.7,
                particleCount: 5,
                magnetRange: 120
            },
            epic: {
                glowIntensity: 0.9,
                particleCount: 8,
                magnetRange: 150
            },
            legendary: {
                glowIntensity: 1.0,
                particleCount: 12,
                magnetRange: 200
            }
        };
        
        const effects = rarityEffects[this.rarity] || rarityEffects.common;
        Object.assign(this, effects);
    }
    
    /**
     * 更新道具状态
     */
    update(deltaTime, player) {
        if (!this.active) return;
        
        this.currentTime += deltaTime * 1000;
        
        // 生命周期检查
        if (this.currentTime >= this.lifetime) {
            this.active = false;
            return;
        }
        
        // 磁力吸附效果
        if (player && !player.isDead) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 检查磁力范围
            const effectiveRange = this.magnetRange * (player.magnetMultiplier || 1);
            if (distance < effectiveRange) {
                this.isBeingAttracted = true;
                
                // 计算吸附力
                const force = this.magnetStrength * (1 - distance / effectiveRange);
                this.vx = (dx / distance) * force;
                this.vy = (dy / distance) * force;
            } else {
                this.isBeingAttracted = false;
                this.vx = 0;
                this.vy = 50;
            }
            
            // 检查拾取
            if (distance < this.radius + 20) {
                this.collect(player);
            }
        }
        
        // 更新位置
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // 垂直漂浮动画
        if (!this.isBeingAttracted) {
            this.y += Math.sin(this.currentTime * this.bobFrequency + this.bobOffset) * this.bobAmplitude * deltaTime;
        }
        
        // 旋转动画
        this.rotation += this.rotationSpeed * deltaTime;
        
        // 光晕动画
        this.glowRadius += this.glowDirection * 0.5;
        if (this.glowRadius > 5 || this.glowRadius < 0) {
            this.glowDirection *= -1;
        }
        
        // 检查是否超出屏幕
        if (this.y > GameConfig.CANVAS.HEIGHT + 50) {
            this.active = false;
        }
    }
    
    /**
     * 收集道具
     */
    collect(player) {
        if (this.collected) return;
        
        this.collected = true;
        this.active = false;
        
        // 应用道具效果
        this.applyEffect(player);
        
        // 增加分数
        if (this.score > 0) {
            player.addScore(this.score);
        }
        
        // 播放收集音效
        this.playCollectSound();
        
        console.log(`收集道具: ${this.name}`);
    }
    
    /**
     * 应用道具效果
     */
    applyEffect(player) {
        switch (this.type) {
            case 'weapon_upgrade':
                if (player.weaponManager) {
                    player.weaponManager.upgradeWeapon('machinegun');
                }
                break;
                
            case 'laser':
                if (player.weaponManager) {
                    player.weaponManager.addWeapon('laser', new LaserCannon(1));
                    player.weaponManager.setSecondaryWeapon('laser');
                }
                break;
                
            case 'missile':
                if (player.weaponManager) {
                    player.weaponManager.addWeapon('missile', new MissileLauncher(1));
                    player.weaponManager.setSecondaryWeapon('missile');
                }
                break;
                
            case 'shield':
                player.activateShield(this.duration);
                break;
                
            case 'invincible':
                player.isInvincible = true;
                player.invincibleTime = this.duration / 1000;
                break;
                
            case 'bomb':
                // 触发全屏炸弹效果
                this.triggerBomb();
                break;
                
            case 'health':
                player.heal(this.healAmount);
                break;
                
            case 'life':
                player.lives++;
                break;
                
            case 'speed_boost':
                player.speedMultiplier = this.speedMultiplier;
                setTimeout(() => {
                    player.speedMultiplier = 1;
                }, this.duration);
                break;
                
            case 'fire_rate':
                if (player.weaponManager && player.weaponManager.activeWeapon) {
                    const originalRate = player.weaponManager.activeWeapon.fireRate;
                    player.weaponManager.activeWeapon.fireRate *= this.fireRateMultiplier;
                    setTimeout(() => {
                        player.weaponManager.activeWeapon.fireRate = originalRate;
                    }, this.duration);
                }
                break;
                
            case 'magnet':
                player.magnetMultiplier = this.magnetMultiplier;
                setTimeout(() => {
                    player.magnetMultiplier = 1;
                }, this.duration);
                break;
                
            case 'score_multiplier':
                player.scoreMultiplier = this.multiplier;
                setTimeout(() => {
                    player.scoreMultiplier = 1;
                }, this.duration);
                break;
        }
    }
    
    /**
     * 触发炸弹效果
     */
    triggerBomb() {
        // 这需要在游戏主循环中实现
        // 清除所有敌机和子弹
        if (window.game) {
            window.game.triggerBomb();
        }
    }
    
    /**
     * 播放收集音效
     */
    playCollectSound() {
        // 播放对应的音效
        // 需要音频系统支持
    }
    
    /**
     * 渲染道具
     */
    render(renderer) {
        if (!this.active) return;
        
        const ctx = renderer.ctx;
        ctx.save();
        
        // 移动到道具位置
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // 闪烁效果（接近消失时）
        if (this.currentTime > this.lifetime - this.flashTime) {
            const flashRate = (this.lifetime - this.currentTime) / this.flashTime;
            if (Math.floor(this.currentTime / 100) % 2 === 0) {
                ctx.globalAlpha = 0.5;
            }
        }
        
        // 绘制光晕
        if (this.glowIntensity > 0) {
            const gradient = ctx.createRadialGradient(0, 0, this.radius, 0, 0, this.radius + this.glowRadius + 10);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.globalAlpha = this.glowIntensity * 0.5;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + this.glowRadius + 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        // 绘制道具主体
        this.drawPowerUpShape(ctx);
        
        // 绘制图标
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);
        
        ctx.restore();
    }
    
    /**
     * 绘制道具形状
     */
    drawPowerUpShape(ctx) {
        // 根据稀有度绘制不同形状
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        
        switch (this.rarity) {
            case 'legendary':
                // 星形
                this.drawStar(ctx, 0, 0, this.radius, this.radius / 2, 8);
                break;
            case 'epic':
                // 六边形
                this.drawHexagon(ctx, 0, 0, this.radius);
                break;
            case 'rare':
                // 菱形
                this.drawDiamond(ctx, 0, 0, this.radius);
                break;
            default:
                // 圆形
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
        }
    }
    
    /**
     * 绘制星形
     */
    drawStar(ctx, cx, cy, outerRadius, innerRadius, points) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    /**
     * 绘制六边形
     */
    drawHexagon(ctx, cx, cy, radius) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3 - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    /**
     * 绘制菱形
     */
    drawDiamond(ctx, cx, cy, radius) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - radius);
        ctx.lineTo(cx + radius, cy);
        ctx.lineTo(cx, cy + radius);
        ctx.lineTo(cx - radius, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}