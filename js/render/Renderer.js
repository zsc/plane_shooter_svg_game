/**
 * 渲染器
 * 负责所有的绘制操作
 */
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 设置画布尺寸
        this.canvas.width = GameConfig.CANVAS.WIDTH;
        this.canvas.height = GameConfig.CANVAS.HEIGHT;
        
        // 背景滚动偏移
        this.backgroundOffset = 0;
        
        // 图层管理
        this.layers = {
            background: 0,
            entities: 1,
            player: 2,
            effects: 3,
            ui: 4
        };
        
        // 性能统计
        this.drawCalls = 0;
        
        // 初始化
        this.init();
    }

    /**
     * 初始化渲染器
     */
    init() {
        // 设置默认样式
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // 文字样式
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = '16px Microsoft YaHei';
        
        console.log('渲染器初始化完成');
    }

    /**
     * 清空画布
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCalls = 0;
    }

    /**
     * 绘制背景
     * @param {number} deltaTime - 时间增量
     */
    drawBackground(deltaTime) {
        // 更新背景滚动
        this.backgroundOffset += GameConfig.RENDER.BACKGROUND_SCROLL_SPEED * deltaTime;
        if (this.backgroundOffset > this.canvas.height) {
            this.backgroundOffset -= this.canvas.height;
        }
        
        // 绘制渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#001a33');
        gradient.addColorStop(1, '#003366');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制星空效果
        this.drawStars();
        
        this.drawCalls++;
    }

    /**
     * 绘制星空
     */
    drawStars() {
        this.ctx.save();
        
        // 简单的星星效果
        const stars = [
            {x: 100, y: 100}, {x: 200, y: 150}, {x: 300, y: 80},
            {x: 400, y: 200}, {x: 500, y: 120}, {x: 150, y: 250},
            {x: 350, y: 300}, {x: 450, y: 350}, {x: 250, y: 400}
        ];
        
        this.ctx.fillStyle = 'white';
        stars.forEach(star => {
            const y = (star.y + this.backgroundOffset * 0.3) % this.canvas.height;
            this.ctx.beginPath();
            this.ctx.arc(star.x, y, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.restore();
    }

    /**
     * 绘制矩形
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {string} color - 颜色
     */
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.drawCalls++;
    }

    /**
     * 绘制带边框的矩形
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {string} fillColor - 填充颜色
     * @param {string} strokeColor - 边框颜色
     * @param {number} lineWidth - 边框宽度
     */
    drawRectWithBorder(x, y, width, height, fillColor, strokeColor, lineWidth = 1) {
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(x, y, width, height);
        
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(x, y, width, height);
        
        this.drawCalls += 2;
    }

    /**
     * 绘制圆形
     * @param {number} x - 圆心X坐标
     * @param {number} y - 圆心Y坐标
     * @param {number} radius - 半径
     * @param {string} color - 颜色
     */
    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.drawCalls++;
    }

    /**
     * 绘制文字
     * @param {string} text - 文字内容
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} size - 字体大小
     * @param {string} color - 颜色
     */
    drawText(text, x, y, size = 16, color = '#FFFFFF') {
        this.ctx.save();
        this.ctx.font = `${size}px Microsoft YaHei`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
        this.drawCalls++;
    }

    /**
     * 绘制玩家飞机
     * @param {Object} player - 玩家对象
     * @param {AssetManager} assetManager - 资源管理器（可选）
     */
    drawPlayer(player, assetManager = null) {
        this.ctx.save();
        
        // 如果有资源管理器且已加载，使用SVG资源
        if (assetManager && assetManager.loaded) {
            // 根据玩家类型选择战机素材
            const playerType = player.aircraftType || 'fighter';
            assetManager.drawAsset(
                this.ctx, 
                `player.${playerType}`, 
                player.x, 
                player.y,
                0, // 旋转角度
                1  // 缩放
            );
        } else {
            // 降级方案：绘制简单的三角形
            this.ctx.translate(player.x, player.y);
            
            // 绘制机身（三角形）
            this.ctx.fillStyle = '#4A90E2';
            this.ctx.strokeStyle = '#2E5C8A';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, -30);
            this.ctx.lineTo(-20, 20);
            this.ctx.lineTo(0, 10);
            this.ctx.lineTo(20, 20);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // 绘制引擎火焰
            if (player.isMoving) {
                this.ctx.fillStyle = '#FFA500';
                this.ctx.globalAlpha = 0.8;
                this.ctx.beginPath();
                this.ctx.moveTo(-8, 20);
                this.ctx.lineTo(-4, 35);
                this.ctx.lineTo(0, 30);
                this.ctx.lineTo(4, 35);
                this.ctx.lineTo(8, 20);
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
        
        // 绘制碰撞箱（调试模式）
        if (GameConfig.RENDER.SHOW_HITBOX) {
            this.ctx.globalAlpha = 0.3;
            this.ctx.strokeStyle = '#00FF00';
            this.ctx.lineWidth = 1;
            const hitboxRadius = player.hitboxRadius || 16;
            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y, hitboxRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
        this.drawCalls++;
    }
    
    /**
     * 绘制敌机
     * @param {Enemy} enemy - 敌机对象
     * @param {AssetManager} assetManager - 资源管理器（可选）
     */
    drawEnemy(enemy, assetManager = null) {
        if (!enemy.active || enemy.isDead) return;
        
        this.ctx.save();
        
        // 闪烁效果
        if (enemy.flashTime > 0 && Math.floor(enemy.flashTime * 20) % 2 === 0) {
            this.ctx.globalAlpha = 0.5;
        }
        
        // 如果有资源管理器且已加载，使用SVG资源
        if (assetManager && assetManager.loaded) {
            const enemyType = enemy.type || 'scout';
            assetManager.drawAsset(
                this.ctx,
                `enemies.${enemyType}`,
                enemy.x,
                enemy.y,
                0, // 旋转角度
                1  // 缩放
            );
        } else {
            // 降级方案：使用原始绘制方法
            enemy.render(this);
        }
        
        this.ctx.restore();
        
        // 显示血条
        if (enemy.health < enemy.maxHealth) {
            this.drawEnemyHealthBar(enemy);
        }
        
        this.drawCalls++;
    }
    
    /**
     * 绘制敌机血条
     */
    drawEnemyHealthBar(enemy) {
        const barWidth = enemy.width || 32;
        const barHeight = 4;
        const barY = enemy.y - (enemy.height || 32) / 2 - 10;
        
        // 背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(
            enemy.x - barWidth / 2,
            barY,
            barWidth,
            barHeight
        );
        
        // 血条
        const healthPercent = enemy.health / enemy.maxHealth;
        const healthColor = healthPercent > 0.5 ? '#00FF00' : 
                          healthPercent > 0.25 ? '#FFFF00' : '#FF0000';
        
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(
            enemy.x - barWidth / 2,
            barY,
            barWidth * healthPercent,
            barHeight
        );
    }
    
    /**
     * 绘制子弹
     * @param {Bullet} bullet - 子弹对象
     * @param {AssetManager} assetManager - 资源管理器（可选）
     */
    drawBullet(bullet, assetManager = null) {
        if (!bullet.active) return;
        
        this.ctx.save();
        
        // 如果有资源管理器且已加载，使用SVG资源
        if (assetManager && assetManager.loaded) {
            let bulletType = 'standard';
            if (bullet.type === 'laser') bulletType = 'laser';
            else if (bullet.type === 'missile') bulletType = 'missile';
            else if (bullet.type === 'enemy') bulletType = 'enemyBullet';
            
            // 计算子弹旋转角度
            const rotation = Math.atan2(bullet.vy || 0, bullet.vx || 0) + Math.PI / 2;
            
            assetManager.drawAsset(
                this.ctx,
                `bullets.${bulletType}`,
                bullet.x,
                bullet.y,
                rotation,
                1
            );
        } else {
            // 降级方案：简单圆形
            this.drawCircle(bullet.x, bullet.y, bullet.size || 3, bullet.color || '#FFD700');
        }
        
        this.ctx.restore();
        this.drawCalls++;
    }

    /**
     * 绘制HUD
     * @param {Object} gameData - 游戏数据
     */
    drawHUD(gameData) {
        // 生命值条
        const healthBarWidth = 200;
        const healthBarHeight = 20;
        const healthBarX = 20;
        const healthBarY = 20;
        
        // 背景
        this.drawRectWithBorder(
            healthBarX, healthBarY, 
            healthBarWidth, healthBarHeight,
            'rgba(0,0,0,0.5)', '#333', 2
        );
        
        // 生命值
        if (gameData.health > 0) {
            const healthWidth = (gameData.health / gameData.maxHealth) * (healthBarWidth - 4);
            this.ctx.fillStyle = gameData.health > 30 ? '#4CAF50' : '#F44336';
            this.ctx.fillRect(healthBarX + 2, healthBarY + 2, healthWidth, healthBarHeight - 4);
        }
        
        // 生命值文字
        this.drawText(
            `HP: ${gameData.health}/${gameData.maxHealth}`,
            healthBarX + healthBarWidth / 2, 
            healthBarY + healthBarHeight / 2,
            12, '#FFFFFF'
        );
        
        // 能量条（如果有）
        if (gameData.energy !== undefined) {
            const energyBarY = healthBarY + 30;
            
            // 背景
            this.drawRectWithBorder(
                healthBarX, energyBarY,
                healthBarWidth, healthBarHeight,
                'rgba(0,0,0,0.5)', '#333', 2
            );
            
            // 能量值
            if (gameData.energy > 0) {
                const energyWidth = (gameData.energy / gameData.maxEnergy) * (healthBarWidth - 4);
                this.ctx.fillStyle = '#00BFFF';
                this.ctx.fillRect(healthBarX + 2, energyBarY + 2, energyWidth, healthBarHeight - 4);
            }
            
            // 能量文字
            this.drawText(
                `能量: ${Math.round(gameData.energy)}/${gameData.maxEnergy}`,
                healthBarX + healthBarWidth / 2,
                energyBarY + healthBarHeight / 2,
                12, '#FFFFFF'
            );
        }
        
        // 分数显示（assets.html 样式）
        const scoreX = this.canvas.width - 120;
        const scoreY = 20;
        const scoreWidth = 100;
        const scoreHeight = 40;
        
        // 背景框
        this.ctx.save();
        this.ctx.fillStyle = '#1A237E';
        this.ctx.strokeStyle = '#3F51B5';
        this.ctx.lineWidth = 2;
        
        // 绘制圆角矩形（兼容性处理）
        this.ctx.beginPath();
        if (this.ctx.roundRect) {
            this.ctx.roundRect(scoreX, scoreY, scoreWidth, scoreHeight, 5);
        } else {
            // 手动绘制圆角矩形
            const radius = 5;
            this.ctx.moveTo(scoreX + radius, scoreY);
            this.ctx.lineTo(scoreX + scoreWidth - radius, scoreY);
            this.ctx.arcTo(scoreX + scoreWidth, scoreY, scoreX + scoreWidth, scoreY + radius, radius);
            this.ctx.lineTo(scoreX + scoreWidth, scoreY + scoreHeight - radius);
            this.ctx.arcTo(scoreX + scoreWidth, scoreY + scoreHeight, scoreX + scoreWidth - radius, scoreY + scoreHeight, radius);
            this.ctx.lineTo(scoreX + radius, scoreY + scoreHeight);
            this.ctx.arcTo(scoreX, scoreY + scoreHeight, scoreX, scoreY + scoreHeight - radius, radius);
            this.ctx.lineTo(scoreX, scoreY + radius);
            this.ctx.arcTo(scoreX, scoreY, scoreX + radius, scoreY, radius);
        }
        this.ctx.fill();
        this.ctx.stroke();
        
        // SCORE 标题
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 12px Microsoft YaHei';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('SCORE', scoreX + scoreWidth/2, scoreY + 15);
        
        // 分数数字（格式化为 xxx,xxx）
        const formattedScore = gameData.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Microsoft YaHei';
        this.ctx.fillText(formattedScore, scoreX + scoreWidth/2, scoreY + 30);
        
        this.ctx.restore();
        
        // FPS显示
        if (GameConfig.RENDER.SHOW_FPS && gameData.fps !== undefined) {
            this.drawText(
                `FPS: ${gameData.fps}`,
                this.canvas.width - 50, 60,
                12, '#00FF00'
            );
        }
    }

    /**
     * 绘制调试信息
     * @param {Object} debugData - 调试数据
     */
    drawDebugInfo(debugData) {
        const debugDiv = document.getElementById('debugInfo');
        if (!debugDiv) return;
        
        let html = '<strong>调试信息</strong><br>';
        html += `FPS: ${debugData.fps}<br>`;
        html += `更新时间: ${debugData.updateTime}ms<br>`;
        html += `渲染时间: ${debugData.renderTime}ms<br>`;
        html += `帧时间: ${debugData.frameTime}ms<br>`;
        html += `绘制调用: ${this.drawCalls}<br>`;
        html += `玩家位置: (${debugData.playerX?.toFixed(0)}, ${debugData.playerY?.toFixed(0)})<br>`;
        html += `状态: ${debugData.gameState}<br>`;
        
        debugDiv.innerHTML = html;
    }

    /**
     * 获取画布尺寸
     * @returns {Object} 画布尺寸
     */
    getCanvasSize() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }

    /**
     * 屏幕震动效果
     * @param {number} intensity - 震动强度
     * @param {number} duration - 持续时间
     */
    screenShake(intensity, duration) {
        // 保存当前变换
        this.ctx.save();
        
        // 应用随机偏移
        const offsetX = (Math.random() - 0.5) * intensity;
        const offsetY = (Math.random() - 0.5) * intensity;
        this.ctx.translate(offsetX, offsetY);
        
        // 在duration后恢复
        setTimeout(() => {
            this.ctx.restore();
        }, duration);
    }
}