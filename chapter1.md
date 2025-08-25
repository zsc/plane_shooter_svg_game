# 第1章：渲染系统

## 概述

渲染系统是全民飞机大战的核心技术组件之一，负责将游戏世界的所有视觉元素高效地绘制到屏幕上。本章详细描述基于Canvas 2D API的渲染架构设计，包括精灵管理、动画系统、粒子特效和性能优化策略。

### 设计目标
- **高性能**：在移动设备上稳定保持60FPS
- **可扩展**：支持灵活的渲染管线和自定义渲染器
- **易用性**：提供简洁的API接口供游戏逻辑调用
- **兼容性**：确保在主流浏览器上的一致表现

## 1.1 Canvas 2D渲染架构

### 1.1.1 渲染器核心设计

#### 主渲染器类结构
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```javascript
class Renderer {
    constructor(config) {
        this.canvas = config.canvas;
        this.ctx = this.canvas.getContext('2d', {
            alpha: false,           // 不透明背景提升性能
            desynchronized: true,   // 减少垂直同步延迟
            willReadFrequently: false
        });
        this.width = config.width || 720;
        this.height = config.height || 1280;
        this.pixelRatio = window.devicePixelRatio || 1;
        this.frameBuffer = null;   // 离屏缓冲
        this.renderQueue = [];      // 渲染队列
        this.stats = new RenderStats();
    }
}
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```

#### 渲染管线流程
1. **预处理阶段**
   - 清空画布
   - 更新视口变换矩阵
   - 剔除不可见对象

2. **排序阶段**
   - 按Z轴深度排序
   - 按渲染批次分组
   - 合并相同纹理的绘制调用

3. **绘制阶段**
   - 背景层渲染
   - 游戏对象渲染
   - 特效层渲染
   - UI层渲染

4. **后处理阶段**
   - 应用全屏特效
   - 调试信息叠加
   - 性能统计更新

### 1.1.2 坐标系统与变换

#### 世界坐标系
- 原点：屏幕左上角
- X轴：向右为正
- Y轴：向下为正
- 单位：像素

#### 相机系统
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```javascript
class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.scale = 1.0;
        this.rotation = 0;
        this.shakeIntensity = 0;
        this.followTarget = null;
    }
    
    applyTransform(ctx) {
        ctx.save();
        ctx.translate(-this.x, -this.y);
        ctx.scale(this.scale, this.scale);
        ctx.rotate(this.rotation);
        
        // 屏幕震动效果
        if (this.shakeIntensity > 0) {
            const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
            const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
            ctx.translate(offsetX, offsetY);
        }
    }
}
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```

### 1.1.3 渲染批处理优化

#### 批处理策略
- **纹理图集批处理**：相同纹理的精灵合并绘制
- **几何批处理**：简单几何图形使用Path2D批量绘制
- **状态批处理**：最小化Canvas状态切换

#### 绘制调用优化
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```javascript
class BatchRenderer {
    constructor(maxBatchSize = 1000) {
        this.maxBatchSize = maxBatchSize;
        this.batches = new Map();  // 按纹理分组
    }
    
    addSprite(sprite) {
        const texture = sprite.texture;
        if (!this.batches.has(texture)) {
            this.batches.set(texture, []);
        }
        this.batches.get(texture).push(sprite);
    }
    
    flush(ctx) {
        for (const [texture, sprites] of this.batches) {
            // 批量绘制同纹理精灵
            this.drawBatch(ctx, texture, sprites);
        }
        this.batches.clear();
    }
}
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```

### 1.1.4 双缓冲与垂直同步

#### 离屏Canvas缓冲
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```javascript
class DoubleBuffer {
    constructor(width, height) {
        this.frontBuffer = document.createElement('canvas');
        this.backBuffer = document.createElement('canvas');
        this.frontBuffer.width = width;
        this.frontBuffer.height = height;
        this.backBuffer.width = width;
        this.backBuffer.height = height;
        this.frontCtx = this.frontBuffer.getContext('2d');
        this.backCtx = this.backBuffer.getContext('2d');
    }
    
    swap() {
        [this.frontBuffer, this.backBuffer] = [this.backBuffer, this.frontBuffer];
        [this.frontCtx, this.backCtx] = [this.backCtx, this.frontCtx];
    }
}
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```

#### 帧率控制
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```javascript
class FrameController {
    constructor(targetFPS = 60) {
        this.targetFPS = targetFPS;
        this.frameTime = 1000 / targetFPS;
        this.lastTime = 0;
        this.accumulator = 0;
        this.alpha = 0;
    }
    
    update(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.accumulator += deltaTime;
        
        let updates = 0;
        while (this.accumulator >= this.frameTime) {
            this.accumulator -= this.frameTime;
            updates++;
            if (updates >= 240) break; // 防止死循环
        }
        
        this.alpha = this.accumulator / this.frameTime;
        return updates;
    }
}
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```

## 1.2 精灵图管理与动画系统

### 1.2.1 精灵图集管理

#### 纹理图集加载器
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```javascript
class TextureAtlas {
    constructor(imagePath, jsonPath) {
        this.image = null;
        this.frames = {};
        this.animations = {};
    }
    
    async load() {
        // 加载图片
        this.image = await this.loadImage(this.imagePath);
        
        // 加载JSON配置
        const config = await fetch(this.jsonPath).then(r => r.json());
        
        // 解析帧数据
        for (const frameName in config.frames) {
            const frame = config.frames[frameName];
            this.frames[frameName] = {
                x: frame.x,
                y: frame.y,
                width: frame.width,
                height: frame.height,
                pivot: frame.pivot || {x: 0.5, y: 0.5}
            };
        }
        
        // 解析动画数据
        if (config.animations) {
            for (const animName in config.animations) {
                this.animations[animName] = config.animations[animName];
            }
        }
    }
}
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```

#### 精灵类定义
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```javascript
class Sprite {
    constructor(texture, frame) {
        this.texture = texture;
        this.frame = frame;
        this.x = 0;
        this.y = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.rotation = 0;
        this.alpha = 1;
        this.visible = true;
        this.anchor = {x: 0.5, y: 0.5};
        this.tint = null;
    }
    
    render(ctx) {
        if (!this.visible || this.alpha <= 0) return;
        
        ctx.save();
        
        // 应用变换
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scaleX, this.scaleY);
        
        // 绘制精灵
        const frame = this.texture.frames[this.frame];
        ctx.drawImage(
            this.texture.image,
            frame.x, frame.y, frame.width, frame.height,
            -frame.width * this.anchor.x,
            -frame.height * this.anchor.y,
            frame.width, frame.height
        );
        
        ctx.restore();
    }
}
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```

### 1.2.2 动画系统架构

#### 动画控制器
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```javascript
class AnimationController {
    constructor(sprite) {
        this.sprite = sprite;
        this.animations = new Map();
        this.currentAnimation = null;
        this.currentFrame = 0;
        this.frameTime = 0;
        this.playing = false;
        this.loop = true;
        this.onComplete = null;
    }
    
    addAnimation(name, frames, frameRate = 12) {
        this.animations.set(name, {
            frames: frames,
            frameRate: frameRate,
            frameDuration: 1000 / frameRate
        });
    }
    
    play(animationName, loop = true) {
        const anim = this.animations.get(animationName);
        if (!anim) return;
        
        this.currentAnimation = anim;
        this.currentFrame = 0;
        this.frameTime = 0;
        this.playing = true;
        this.loop = loop;
    }
    
    update(deltaTime) {
        if (!this.playing || !this.currentAnimation) return;
        
        this.frameTime += deltaTime;
        
        while (this.frameTime >= this.currentAnimation.frameDuration) {
            this.frameTime -= this.currentAnimation.frameDuration;
            this.currentFrame++;
            
            if (this.currentFrame >= this.currentAnimation.frames.length) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.playing = false;
                    if (this.onComplete) this.onComplete();
                    return;
                }
            }
        }
        
        // 更新精灵帧
        this.sprite.frame = this.currentAnimation.frames[this.currentFrame];
    }
}
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```

### 1.2.3 动画混合与过渡

#### 动画混合器
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```javascript
class AnimationMixer {
    constructor() {
        this.layers = [];
        this.blendMode = 'normal';
    }
    
    addLayer(animation, weight = 1.0) {
        this.layers.push({
            animation: animation,
            weight: weight,
            blendMode: 'normal'
        });
    }
    
    blend(deltaTime) {
        // 更新所有层的动画
        for (const layer of this.layers) {
            layer.animation.update(deltaTime);
        }
        
        // 混合计算最终姿态
        // 实现骨骼动画混合、精灵透明度混合等
    }
}
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```

### 1.2.4 特殊动画效果

#### 帧动画特效
- **爆炸动画**：多帧序列播放，不循环
- **推进器动画**：循环播放的火焰效果
- **护盾动画**：带透明度变化的循环动画
- **受击闪烁**：快速切换可见性

#### 程序动画
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```javascript
class ProceduralAnimator {
    // 正弦波动画（用于漂浮效果）
    static float(sprite, amplitude = 10, frequency = 2) {
        const time = Date.now() / 1000;
        sprite.y += Math.sin(time * frequency) * amplitude;
    }
    
    // 脉冲缩放动画（用于强调效果）
    static pulse(sprite, minScale = 0.9, maxScale = 1.1, speed = 3) {
        const time = Date.now() / 1000;
        const scale = minScale + (maxScale - minScale) * 
                     (Math.sin(time * speed) * 0.5 + 0.5);
        sprite.scaleX = sprite.scaleY = scale;
    }
    
    // 螺旋运动（用于导弹轨迹）
    static spiral(sprite, centerX, centerY, radius, speed) {
        const time = Date.now() / 1000;
        const angle = time * speed;
        sprite.x = centerX + Math.cos(angle) * radius;
        sprite.y = centerY + Math.sin(angle) * radius;
    }
}
```

## 1.3 粒子特效引擎

### 1.3.1 粒子系统架构

#### 粒子发射器
```javascript
class ParticleEmitter {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.emissionRate = config.emissionRate || 10;  // 每秒发射粒子数
        this.maxParticles = config.maxParticles || 1000;
        this.particleLife = config.particleLife || 2000; // 毫秒
        this.emitterLife = config.emitterLife || -1;     // -1表示永久
        this.particles = [];
        this.particlePool = [];  // 对象池
        this.active = true;
        this.emissionTimer = 0;
        this.config = config;
    }
    
    emit() {
        if (!this.active) return;
        
        if (this.particles.length >= this.maxParticles) return;
        
        // 从对象池获取或创建新粒子
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = new Particle();
        }
        
        // 初始化粒子属性
        this.initParticle(particle);
        this.particles.push(particle);
    }
    
    initParticle(particle) {
        // 位置初始化
        particle.x = this.x + (Math.random() - 0.5) * this.config.spread;
        particle.y = this.y;
        
        // 速度初始化
        const angle = this.config.angle + (Math.random() - 0.5) * this.config.angleVariance;
        const speed = this.config.speed + (Math.random() - 0.5) * this.config.speedVariance;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 生命周期
        particle.life = this.particleLife;
        particle.maxLife = this.particleLife;
        
        // 视觉属性
        particle.color = this.config.color || '#FFFFFF';
        particle.size = this.config.size || 4;
        particle.alpha = 1;
    }
    
    update(deltaTime) {
        // 更新发射计时器
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.emissionRate;
        
        while (this.emissionTimer >= emissionInterval) {
            this.emit();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                // 回收到对象池
                this.particles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
}
```

#### 粒子类定义
```javascript
class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;  // 加速度
        this.ay = 0;
        this.size = 4;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.life = 1000;
        this.maxLife = 1000;
        this.scale = 1;
        this.texture = null;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 物理更新
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.rotationSpeed * dt;
        
        // 生命周期更新
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;
        
        // 淡出效果
        if (lifeRatio < 0.3) {
            this.alpha = lifeRatio / 0.3;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            // 绘制纹理粒子
            const size = this.size * this.scale;
            ctx.drawImage(this.texture, -size/2, -size/2, size, size);
        } else {
            // 绘制几何粒子
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * this.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### 1.3.2 粒子特效预设

#### 爆炸特效
```javascript
class ExplosionEffect {
    static create(x, y, size = 'medium') {
        const configs = {
            small: {
                emissionRate: 100,
                maxParticles: 30,
                particleLife: 500,
                speed: 200,
                speedVariance: 100,
                spread: 10,
                size: 3,
                color: ['#FF6B35', '#FFA500', '#FFFF00'],
                gravity: 0
            },
            medium: {
                emissionRate: 200,
                maxParticles: 50,
                particleLife: 800,
                speed: 300,
                speedVariance: 150,
                spread: 20,
                size: 5,
                color: ['#FF4500', '#FF6347', '#FFA500'],
                gravity: 100
            },
            large: {
                emissionRate: 500,
                maxParticles: 100,
                particleLife: 1200,
                speed: 400,
                speedVariance: 200,
                spread: 40,
                size: 8,
                color: ['#FF0000', '#FF4500', '#FFFF00'],
                gravity: 200
            }
        };
        
        const config = configs[size];
        const emitter = new ParticleEmitter({
            x: x,
            y: y,
            ...config,
            emitterLife: 100  // 短暂爆发
        });
        
        return emitter;
    }
}
```

#### 推进器尾焰
```javascript
class ThrusterEffect {
    static create(parent) {
        return new ParticleEmitter({
            x: parent.x,
            y: parent.y + parent.height / 2,
            emissionRate: 30,
            maxParticles: 100,
            particleLife: 400,
            angle: Math.PI / 2,  // 向下
            angleVariance: 0.3,
            speed: 100,
            speedVariance: 20,
            size: 6,
            color: ['#4169E1', '#00BFFF', '#FFFFFF'],
            fadeOut: true,
            shrink: true,
            follow: parent  // 跟随父对象
        });
    }
}
```

#### 子弹拖尾效果
```javascript
class BulletTrail {
    static create(bullet) {
        return new ParticleEmitter({
            x: bullet.x,
            y: bullet.y,
            emissionRate: 60,
            maxParticles: 20,
            particleLife: 200,
            angle: bullet.angle + Math.PI,  // 反向
            angleVariance: 0.1,
            speed: 50,
            speedVariance: 10,
            size: 2,
            color: bullet.trailColor || '#FFFF00',
            alpha: 0.6,
            fadeOut: true,
            follow: bullet
        });
    }
}
```

### 1.3.3 粒子物理模拟

#### 重力与风力
```javascript
class ParticlePhysics {
    static applyGravity(particle, gravity = 9.8) {
        particle.ay += gravity;
    }
    
    static applyWind(particle, windX, windY) {
        particle.ax += windX;
        particle.ay += windY;
    }
    
    static applyDrag(particle, dragCoefficient = 0.98) {
        particle.vx *= dragCoefficient;
        particle.vy *= dragCoefficient;
    }
    
    static applyTurbulence(particle, intensity = 10) {
        particle.vx += (Math.random() - 0.5) * intensity;
        particle.vy += (Math.random() - 0.5) * intensity;
    }
}
```

#### 磁场吸引
```javascript
class MagneticField {
    constructor(x, y, strength) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 200;
    }
    
    applyTo(particle) {
        const dx = this.x - particle.x;
        const dy = this.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius && distance > 0) {
            const force = this.strength / (distance * distance);
            particle.ax += (dx / distance) * force;
            particle.ay += (dy / distance) * force;
        }
    }
}
```

### 1.3.4 粒子渲染优化

#### 批量渲染
```javascript
class ParticleBatchRenderer {
    constructor(maxParticles = 10000) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particleData = new Float32Array(maxParticles * 6); // x,y,size,r,g,b
    }
    
    renderBatch(particles, mainCtx) {
        // 清空粒子画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 按颜色分组渲染
        const groups = this.groupByColor(particles);
        
        for (const [color, group] of groups) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            for (const particle of group) {
                this.ctx.moveTo(particle.x + particle.size, particle.y);
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
        }
        
        // 复制到主画布
        mainCtx.drawImage(this.canvas, 0, 0);
    }
}
```

#### 粒子LOD（细节层次）
```javascript
class ParticleLOD {
    static getDetailLevel(distance, particleCount) {
        if (particleCount > 1000) {
            // 高密度场景降级
            return 'low';
        } else if (distance > 500) {
            // 远距离降级
            return 'low';
        } else if (distance > 200) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    static applyLOD(particle, level) {
        switch(level) {
            case 'low':
                particle.skipFrames = 2;  // 隔帧更新
                particle.useSimpleRender = true;
                break;
            case 'medium':
                particle.skipFrames = 1;
                particle.useSimpleRender = false;
                break;
            case 'high':
                particle.skipFrames = 0;
                particle.useSimpleRender = false;
                break;
        }
    }
}
```