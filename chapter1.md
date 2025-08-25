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

### 1.1.3 渲染批处理优化

#### 批处理策略
- **纹理图集批处理**：相同纹理的精灵合并绘制
- **几何批处理**：简单几何图形使用Path2D批量绘制
- **状态批处理**：最小化Canvas状态切换

#### 绘制调用优化
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

### 1.1.4 双缓冲与垂直同步

#### 离屏Canvas缓冲
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

#### 帧率控制
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

## 1.2 精灵图管理与动画系统

### 1.2.1 精灵图集管理

#### 纹理图集加载器
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

#### 精灵类定义
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

### 1.2.2 动画系统架构

#### 动画控制器
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

### 1.2.3 动画混合与过渡

#### 动画混合器
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

### 1.2.4 特殊动画效果

#### 帧动画特效
- **爆炸动画**：多帧序列播放，不循环
- **推进器动画**：循环播放的火焰效果
- **护盾动画**：带透明度变化的循环动画
- **受击闪烁**：快速切换可见性

#### 程序动画
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