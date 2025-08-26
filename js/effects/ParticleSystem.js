/**
 * 粒子系统
 * 管理游戏中的所有视觉特效
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.particlePool = [];
        this.maxPoolSize = 1000;
        this.maxParticles = 500;
        
        // 预创建粒子池
        this.initializePool();
    }
    
    /**
     * 初始化对象池
     */
    initializePool() {
        for (let i = 0; i < this.maxPoolSize; i++) {
            this.particlePool.push(this.createParticle());
        }
    }
    
    /**
     * 创建粒子对象
     */
    createParticle() {
        return {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            ax: 0,
            ay: 0,
            size: 1,
            maxSize: 1,
            color: '#FFFFFF',
            alpha: 1,
            alphaDecay: 0.01,
            life: 1,
            maxLife: 1,
            rotation: 0,
            rotationSpeed: 0,
            type: 'default',
            active: false
        };
    }
    
    /**
     * 从池中获取粒子
     */
    getParticleFromPool() {
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = this.createParticle();
        }
        particle.active = true;
        particle.life = particle.maxLife;
        particle.alpha = 1;
        return particle;
    }
    
    /**
     * 回收粒子
     */
    returnParticleToPool(particle) {
        particle.active = false;
        if (this.particlePool.length < this.maxPoolSize) {
            this.particlePool.push(particle);
        }
    }
    
    /**
     * 创建爆炸效果
     */
    createExplosion(x, y, config = {}) {
        const defaults = {
            count: 20,
            minSpeed: 50,
            maxSpeed: 200,
            minSize: 2,
            maxSize: 6,
            colors: ['#FF4500', '#FFD700', '#FF6347', '#FFA500'],
            lifetime: 1.0,
            gravity: 200
        };
        
        const settings = { ...defaults, ...config };
        
        for (let i = 0; i < settings.count; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            const particle = this.getParticleFromPool();
            const angle = (Math.PI * 2 * i) / settings.count + Math.random() * 0.5;
            const speed = settings.minSpeed + Math.random() * (settings.maxSpeed - settings.minSpeed);
            
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.ax = 0;
            particle.ay = settings.gravity;
            particle.size = settings.minSize + Math.random() * (settings.maxSize - settings.minSize);
            particle.maxSize = particle.size;
            particle.color = settings.colors[Math.floor(Math.random() * settings.colors.length)];
            particle.maxLife = settings.lifetime;
            particle.life = settings.lifetime;
            particle.alphaDecay = 1 / (settings.lifetime * 60);
            particle.type = 'explosion';
            
            this.particles.push(particle);
        }
    }
    
    /**
     * 创建火花效果
     */
    createSparks(x, y, config = {}) {
        const defaults = {
            count: 10,
            speed: 150,
            size: 2,
            color: '#FFFF00',
            lifetime: 0.5,
            spread: Math.PI / 4
        };
        
        const settings = { ...defaults, ...config };
        
        for (let i = 0; i < settings.count; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            const particle = this.getParticleFromPool();
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * settings.spread;
            
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * settings.speed * (0.5 + Math.random() * 0.5);
            particle.vy = Math.sin(angle) * settings.speed * (0.5 + Math.random() * 0.5);
            particle.ax = 0;
            particle.ay = 100;
            particle.size = settings.size;
            particle.color = settings.color;
            particle.maxLife = settings.lifetime;
            particle.life = settings.lifetime;
            particle.type = 'spark';
            
            this.particles.push(particle);
        }
    }
    
    /**
     * 创建烟雾效果
     */
    createSmoke(x, y, config = {}) {
        const defaults = {
            count: 5,
            minSpeed: 10,
            maxSpeed: 30,
            minSize: 10,
            maxSize: 20,
            color: '#808080',
            lifetime: 2.0,
            spread: Math.PI / 3
        };
        
        const settings = { ...defaults, ...config };
        
        for (let i = 0; i < settings.count; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            const particle = this.getParticleFromPool();
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * settings.spread;
            const speed = settings.minSpeed + Math.random() * (settings.maxSpeed - settings.minSpeed);
            
            particle.x = x + (Math.random() - 0.5) * 10;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = settings.minSize;
            particle.maxSize = settings.maxSize;
            particle.color = settings.color;
            particle.maxLife = settings.lifetime;
            particle.life = settings.lifetime;
            particle.alphaDecay = 0.5 / (settings.lifetime * 60);
            particle.type = 'smoke';
            
            this.particles.push(particle);
        }
    }
    
    /**
     * 创建击中效果
     */
    createHitEffect(x, y, config = {}) {
        const defaults = {
            count: 8,
            speed: 100,
            size: 3,
            color: '#FFFFFF',
            lifetime: 0.3
        };
        
        const settings = { ...defaults, ...config };
        
        for (let i = 0; i < settings.count; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            const particle = this.getParticleFromPool();
            const angle = (Math.PI * 2 * i) / settings.count;
            
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * settings.speed;
            particle.vy = Math.sin(angle) * settings.speed;
            particle.ax = -particle.vx * 2;
            particle.ay = -particle.vy * 2;
            particle.size = settings.size;
            particle.color = settings.color;
            particle.maxLife = settings.lifetime;
            particle.life = settings.lifetime;
            particle.type = 'hit';
            
            this.particles.push(particle);
        }
    }
    
    /**
     * 创建推进器火焰
     */
    createThrusterFlame(x, y, config = {}) {
        const defaults = {
            count: 2,
            speed: 50,
            size: 4,
            colors: ['#4169E1', '#00BFFF', '#87CEEB'],
            lifetime: 0.2,
            spread: 0.3
        };
        
        const settings = { ...defaults, ...config };
        
        if (Math.random() < 0.8) { // 减少粒子生成频率
            if (this.particles.length >= this.maxParticles) return;
            
            const particle = this.getParticleFromPool();
            
            particle.x = x + (Math.random() - 0.5) * 5;
            particle.y = y;
            particle.vx = (Math.random() - 0.5) * settings.spread * settings.speed;
            particle.vy = settings.speed;
            particle.size = settings.size * (0.5 + Math.random() * 0.5);
            particle.color = settings.colors[Math.floor(Math.random() * settings.colors.length)];
            particle.maxLife = settings.lifetime;
            particle.life = settings.lifetime;
            particle.type = 'thruster';
            
            this.particles.push(particle);
        }
    }
    
    /**
     * 创建能量收集效果
     */
    createCollectEffect(x, y, targetX, targetY, config = {}) {
        const defaults = {
            count: 15,
            color: '#00FF00',
            size: 3,
            lifetime: 0.8
        };
        
        const settings = { ...defaults, ...config };
        
        for (let i = 0; i < settings.count; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            const particle = this.getParticleFromPool();
            const angle = (Math.PI * 2 * i) / settings.count;
            const radius = 20;
            
            particle.x = x + Math.cos(angle) * radius;
            particle.y = y + Math.sin(angle) * radius;
            particle.vx = 0;
            particle.vy = 0;
            particle.size = settings.size;
            particle.color = settings.color;
            particle.maxLife = settings.lifetime;
            particle.life = settings.lifetime;
            particle.type = 'collect';
            
            // 存储目标位置用于吸引效果
            particle.targetX = targetX;
            particle.targetY = targetY;
            
            this.particles.push(particle);
        }
    }
    
    /**
     * 更新粒子系统
     */
    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            if (!particle.active) {
                this.returnParticleToPool(particle);
                this.particles.splice(i, 1);
                continue;
            }
            
            // 更新生命值
            particle.life -= dt;
            if (particle.life <= 0) {
                particle.active = false;
                continue;
            }
            
            // 特殊类型更新
            if (particle.type === 'collect' && particle.targetX !== undefined) {
                // 收集效果：粒子向目标移动
                const dx = particle.targetX - particle.x;
                const dy = particle.targetY - particle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 5) {
                    const speed = 300;
                    particle.vx = (dx / dist) * speed * (1 - particle.life / particle.maxLife);
                    particle.vy = (dy / dist) * speed * (1 - particle.life / particle.maxLife);
                }
            } else if (particle.type === 'smoke') {
                // 烟雾效果：逐渐变大变淡
                const lifeRatio = particle.life / particle.maxLife;
                particle.size = particle.maxSize * (2 - lifeRatio);
                particle.alpha = lifeRatio * 0.5;
            }
            
            // 更新位置
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            
            // 更新速度
            particle.vx += particle.ax * dt;
            particle.vy += particle.ay * dt;
            
            // 更新旋转
            particle.rotation += particle.rotationSpeed * dt;
            
            // 更新透明度
            if (particle.type !== 'smoke') {
                particle.alpha = Math.max(0, particle.alpha - particle.alphaDecay);
            }
            
            // 更新大小（某些效果）
            if (particle.type === 'explosion') {
                particle.size = particle.maxSize * (particle.life / particle.maxLife);
            }
        }
    }
    
    /**
     * 渲染所有粒子
     */
    render(renderer) {
        // 按类型分组渲染以优化性能
        const particleGroups = {};
        
        this.particles.forEach(particle => {
            if (!particle.active) return;
            
            if (!particleGroups[particle.type]) {
                particleGroups[particle.type] = [];
            }
            particleGroups[particle.type].push(particle);
        });
        
        // 渲染各组粒子
        Object.entries(particleGroups).forEach(([type, particles]) => {
            this.renderParticleGroup(renderer, type, particles);
        });
    }
    
    /**
     * 渲染粒子组
     */
    renderParticleGroup(renderer, type, particles) {
        particles.forEach(particle => {
            renderer.ctx.save();
            
            // 设置透明度
            renderer.ctx.globalAlpha = particle.alpha;
            
            // 设置混合模式
            if (type === 'explosion' || type === 'spark' || type === 'thruster') {
                renderer.ctx.globalCompositeOperation = 'lighter';
            }
            
            // 应用旋转
            if (particle.rotation !== 0) {
                renderer.ctx.translate(particle.x, particle.y);
                renderer.ctx.rotate(particle.rotation);
                renderer.ctx.translate(-particle.x, -particle.y);
            }
            
            // 渲染粒子
            if (type === 'smoke') {
                // 烟雾使用渐变圆
                const gradient = renderer.ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size
                );
                gradient.addColorStop(0, particle.color);
                gradient.addColorStop(1, 'transparent');
                renderer.ctx.fillStyle = gradient;
                renderer.ctx.fillRect(
                    particle.x - particle.size,
                    particle.y - particle.size,
                    particle.size * 2,
                    particle.size * 2
                );
            } else {
                // 其他粒子使用简单圆形
                renderer.ctx.fillStyle = particle.color;
                renderer.ctx.beginPath();
                renderer.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                renderer.ctx.fill();
            }
            
            renderer.ctx.restore();
        });
    }
    
    /**
     * 清空所有粒子
     */
    clear() {
        this.particles.forEach(particle => this.returnParticleToPool(particle));
        this.particles = [];
    }
    
    /**
     * 获取统计信息
     */
    getStats() {
        return {
            activeParticles: this.particles.length,
            poolSize: this.particlePool.length,
            maxParticles: this.maxParticles
        };
    }
}