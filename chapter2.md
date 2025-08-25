# 第2章：物理引擎

## 概述

物理引擎是飞机大战游戏的核心计算模块，负责处理所有游戏对象的运动、碰撞检测、弹道轨迹以及各种物理交互。本章详细描述轻量级2D物理引擎的设计与实现，重点关注射击游戏所需的高性能碰撞检测和精确的弹幕物理模拟。

### 设计目标

- **高精度**：像素级别的碰撞检测精度
- **高性能**：支持同屏数百个对象的实时物理计算
- **可预测性**：确定性的物理模拟，支持回放和同步
- **易扩展**：模块化设计，便于添加新的物理行为

### 核心架构

物理引擎采用组件化架构：

```
物理引擎
├── 碰撞检测系统 (Collision System)
├── 运动学模块 (Kinematics Module)
├── 弹道引擎 (Ballistics Engine)
├── 空间分区 (Spatial Partitioning)
├── 物理世界 (Physics World)
└── 调试可视化 (Debug Visualization)
```

## 2.1 2D碰撞检测系统

### 2.1.1 碰撞体类型定义

#### 基础碰撞形状

```javascript
CollisionShapes = {
  // 圆形碰撞体
  Circle: {
    type: "CIRCLE",
    center: { x: 0, y: 0 },
    radius: 32,
    
    // 碰撞检测方法
    intersects(other) {
      // 圆-圆、圆-矩形、圆-多边形检测
    }
  },
  
  // 轴对齐包围盒(AABB)
  AABB: {
    type: "AABB",
    min: { x: 0, y: 0 },
    max: { x: 64, y: 64 },
    
    // 快速AABB检测
    intersects(other) {
      return !(this.max.x < other.min.x || 
               this.min.x > other.max.x ||
               this.max.y < other.min.y || 
               this.min.y > other.max.y);
    }
  },
  
  // 定向包围盒(OBB)
  OBB: {
    type: "OBB",
    center: { x: 0, y: 0 },
    halfExtents: { x: 32, y: 16 },
    rotation: 0,
    
    // SAT分离轴检测
    intersects(other) {
      // 投影到分离轴进行检测
    }
  },
  
  // 凸多边形
  Polygon: {
    type: "POLYGON",
    vertices: [],  // 顶点数组
    
    // GJK算法检测
    intersects(other) {
      // Gilbert-Johnson-Keerthi距离算法
    }
  }
}
```

#### 复合碰撞体

```javascript
CompoundCollider = {
  type: "COMPOUND",
  shapes: [
    // 多个基础形状组合
    { shape: Circle, offset: { x: 0, y: -20 } },
    { shape: AABB, offset: { x: 0, y: 20 } }
  ],
  
  // 层级包围盒优化
  boundingBox: AABB,
  
  // 碰撞检测
  intersects(other) {
    // 先检测包围盒
    if (!this.boundingBox.intersects(other.boundingBox)) {
      return false;
    }
    // 再检测子形状
    for (let shape of this.shapes) {
      if (shape.intersects(other)) {
        return true;
      }
    }
    return false;
  }
}
```

### 2.1.2 碰撞检测算法

#### 宽相位检测(Broad Phase)

```javascript
BroadPhase = {
  // 空间哈希网格
  SpatialHash: {
    cellSize: 128,
    grid: Map,  // 网格映射
    
    // 插入对象
    insert(object) {
      const cells = this.getCells(object.bounds);
      cells.forEach(cell => {
        this.grid.get(cell).add(object);
      });
    },
    
    // 查询潜在碰撞对
    query(object) {
      const cells = this.getCells(object.bounds);
      const candidates = new Set();
      cells.forEach(cell => {
        this.grid.get(cell).forEach(other => {
          if (other !== object) {
            candidates.add(other);
          }
        });
      });
      return candidates;
    }
  },
  
  // 四叉树分区
  QuadTree: {
    bounds: { x: 0, y: 0, width: 720, height: 1280 },
    maxObjects: 10,
    maxLevels: 5,
    
    // 节点结构
    node: {
      level: 0,
      bounds: Rectangle,
      objects: [],
      children: []  // 四个子节点
    },
    
    // 插入对象
    insert(object) {
      // 递归插入到合适的节点
    },
    
    // 获取碰撞候选
    retrieve(object) {
      // 返回同一节点的所有对象
    }
  },
  
  // 扫描线算法
  SweepAndPrune: {
    intervals: [],  // 按x轴排序的区间
    
    // 更新区间
    update(objects) {
      // 插入排序维护有序性
    },
    
    // 找出重叠对
    findOverlaps() {
      // 扫描重叠区间
    }
  }
}
```

#### 窄相位检测(Narrow Phase)

```javascript
NarrowPhase = {
  // 分离轴定理(SAT)
  SAT: {
    // 检测凸多边形碰撞
    testPolygons(poly1, poly2) {
      // 获取所有潜在分离轴
      const axes = [
        ...this.getAxes(poly1),
        ...this.getAxes(poly2)
      ];
      
      // 在每个轴上投影并检测重叠
      for (let axis of axes) {
        const proj1 = this.project(poly1, axis);
        const proj2 = this.project(poly2, axis);
        
        if (!this.overlaps(proj1, proj2)) {
          return false;  // 找到分离轴
        }
      }
      return true;  // 所有轴都重叠
    }
  },
  
  // GJK算法
  GJK: {
    // Minkowski差支持函数
    support(shape1, shape2, direction) {
      const p1 = shape1.getFarthestPoint(direction);
      const p2 = shape2.getFarthestPoint(-direction);
      return p1.sub(p2);
    },
    
    // 碰撞检测主函数
    intersects(shape1, shape2) {
      // 构建单纯形并迭代
    }
  },
  
  // 像素级检测
  PixelPerfect: {
    // 位图掩码碰撞
    testMasks(mask1, pos1, mask2, pos2) {
      // 计算重叠区域
      const overlap = this.getOverlapRect(pos1, mask1, pos2, mask2);
      
      // 逐像素检测
      for (let y = overlap.top; y < overlap.bottom; y++) {
        for (let x = overlap.left; x < overlap.right; x++) {
          if (mask1.getPixel(x - pos1.x, y - pos1.y) &&
              mask2.getPixel(x - pos2.x, y - pos2.y)) {
            return true;
          }
        }
      }
      return false;
    }
  }
}
```

### 2.1.3 碰撞响应系统

#### 碰撞事件管理

```javascript
CollisionEvents = {
  // 碰撞阶段
  phases: {
    BEGIN: "collision_begin",     // 碰撞开始
    STAY: "collision_stay",       // 持续碰撞
    END: "collision_end"          // 碰撞结束
  },
  
  // 碰撞信息
  CollisionInfo: {
    objectA: PhysicsBody,
    objectB: PhysicsBody,
    contactPoint: { x: 0, y: 0 },
    normal: { x: 0, y: 1 },       // 碰撞法线
    penetration: 0,                // 穿透深度
    impulse: 0                     // 碰撞冲量
  },
  
  // 事件分发
  dispatcher: {
    listeners: Map,
    
    emit(event, info) {
      // 触发相应回调
    }
  }
}
```

#### 碰撞层级与掩码

```javascript
CollisionLayers = {
  // 层级定义
  PLAYER: 0b00000001,
  ENEMY: 0b00000010,
  PLAYER_BULLET: 0b00000100,
  ENEMY_BULLET: 0b00001000,
  PICKUP: 0b00010000,
  WALL: 0b00100000,
  
  // 碰撞矩阵
  matrix: {
    PLAYER: ENEMY | ENEMY_BULLET | PICKUP | WALL,
    ENEMY: PLAYER | PLAYER_BULLET | WALL,
    PLAYER_BULLET: ENEMY | WALL,
    ENEMY_BULLET: PLAYER | WALL,
    PICKUP: PLAYER,
    WALL: 0b11111111  // 与所有层碰撞
  },
  
  // 快速检测
  canCollide(layerA, layerB) {
    return (this.matrix[layerA] & layerB) !== 0;
  }
}
```

## 2.2 运动学计算

### 2.2.1 基础运动模型

#### 速度与加速度

```javascript
KinematicBody = {
  // 位置
  position: Vector2D,
  previousPosition: Vector2D,
  
  // 速度
  velocity: Vector2D,
  maxVelocity: { x: 500, y: 500 },
  
  // 加速度
  acceleration: Vector2D,
  
  // 角运动
  rotation: 0,
  angularVelocity: 0,
  angularAcceleration: 0,
  
  // 运动更新
  update(deltaTime) {
    // 保存上一帧位置
    this.previousPosition = this.position.clone();
    
    // 更新速度
    this.velocity.add(
      this.acceleration.multiply(deltaTime)
    );
    
    // 限制最大速度
    this.velocity.clamp(this.maxVelocity);
    
    // 更新位置
    this.position.add(
      this.velocity.multiply(deltaTime)
    );
    
    // 更新旋转
    this.angularVelocity += this.angularAcceleration * deltaTime;
    this.rotation += this.angularVelocity * deltaTime;
  }
}
```

#### 插值与预测

```javascript
MotionInterpolation = {
  // 线性插值
  lerp(start, end, t) {
    return start + (end - start) * t;
  },
  
  // 平滑插值
  smoothStep(start, end, t) {
    t = t * t * (3 - 2 * t);
    return this.lerp(start, end, t);
  },
  
  // 预测位置
  predictPosition(body, time) {
    const predictedPos = body.position.clone();
    predictedPos.add(body.velocity.multiply(time));
    predictedPos.add(body.acceleration.multiply(time * time * 0.5));
    return predictedPos;
  },
  
  // 运动模糊补偿
  motionBlur(body, samples = 5) {
    const positions = [];
    for (let i = 0; i < samples; i++) {
      const t = i / samples;
      positions.push(
        this.lerp(body.previousPosition, body.position, t)
      );
    }
    return positions;
  }
}
```

### 2.2.2 路径与轨迹

#### 预定义路径

```javascript
PathMotion = {
  // 贝塞尔曲线
  BezierPath: {
    controlPoints: [
      { x: 0, y: 0 },     // P0
      { x: 100, y: 200 }, // P1
      { x: 300, y: 200 }, // P2
      { x: 400, y: 0 }    // P3
    ],
    
    // 计算位置
    getPosition(t) {
      // 三次贝塞尔公式
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;
      
      const p = this.controlPoints;
      return {
        x: uuu * p[0].x + 3 * uu * t * p[1].x + 
           3 * u * tt * p[2].x + ttt * p[3].x,
        y: uuu * p[0].y + 3 * uu * t * p[1].y + 
           3 * u * tt * p[2].y + ttt * p[3].y
      };
    }
  },
  
  // 样条曲线
  SplinePath: {
    points: [],
    tension: 0.5,
    
    // Catmull-Rom样条
    interpolate(p0, p1, p2, p3, t) {
      const v0 = (p2 - p0) * this.tension;
      const v1 = (p3 - p1) * this.tension;
      
      return p1 + v0 * t + 
             (3 * (p2 - p1) - 2 * v0 - v1) * t * t +
             (2 * (p1 - p2) + v0 + v1) * t * t * t;
    }
  }
}
```

#### 轨迹追踪

```javascript
TrajectoryTracking = {
  // 跟随路径
  followPath(body, path, speed) {
    // 更新路径进度
    body.pathProgress += speed * deltaTime;
    
    // 获取路径位置
    const targetPos = path.getPosition(body.pathProgress);
    
    // 平滑跟随
    body.position.lerp(targetPos, 0.1);
  },
  
  // 目标追踪
  trackTarget(body, target, turnSpeed) {
    // 计算方向向量
    const direction = target.position.sub(body.position);
    const targetAngle = Math.atan2(direction.y, direction.x);
    
    // 平滑转向
    const angleDiff = this.normalizeAngle(targetAngle - body.rotation);
    body.rotation += angleDiff * turnSpeed * deltaTime;
    
    // 向目标移动
    body.velocity = direction.normalize().multiply(body.speed);
  }
}
```

### 2.2.3 约束系统

#### 位置约束

```javascript
PositionConstraints = {
  // 屏幕边界约束
  screenBounds: {
    min: { x: 0, y: 0 },
    max: { x: 720, y: 1280 },
    
    apply(body) {
      body.position.x = Math.max(this.min.x, 
                        Math.min(this.max.x, body.position.x));
      body.position.y = Math.max(this.min.y, 
                        Math.min(this.max.y, body.position.y));
    }
  },
  
  // 距离约束
  distanceConstraint: {
    anchor: { x: 360, y: 640 },
    minDistance: 50,
    maxDistance: 200,
    
    apply(body) {
      const distance = body.position.distance(this.anchor);
      
      if (distance < this.minDistance) {
        // 推出最小距离
        const direction = body.position.sub(this.anchor).normalize();
        body.position = this.anchor.add(
          direction.multiply(this.minDistance)
        );
      } else if (distance > this.maxDistance) {
        // 拉回最大距离
        const direction = body.position.sub(this.anchor).normalize();
        body.position = this.anchor.add(
          direction.multiply(this.maxDistance)
        );
      }
    }
  }
}
```

## 2.3 弹道物理模拟

### 2.3.1 子弹系统架构

#### 子弹类型定义

```javascript
BulletTypes = {
  // 直线子弹
  linear: {
    type: "LINEAR",
    speed: 800,
    damage: 10,
    size: { width: 8, height: 16 },
    
    // 运动更新
    update(bullet, deltaTime) {
      bullet.position.y += bullet.velocity.y * deltaTime;
    }
  },
  
  // 追踪子弹
  homing: {
    type: "HOMING",
    speed: 400,
    turnRate: 3.0,  // 弧度/秒
    trackingRange: 300,
    damage: 15,
    
    update(bullet, deltaTime) {
      // 寻找最近目标
      const target = this.findNearestTarget(bullet);
      
      if (target && bullet.position.distance(target.position) < this.trackingRange) {
        // 计算追踪角度
        const targetAngle = Math.atan2(
          target.position.y - bullet.position.y,
          target.position.x - bullet.position.x
        );
        
        // 平滑转向
        const angleDiff = this.normalizeAngle(targetAngle - bullet.angle);
        bullet.angle += Math.sign(angleDiff) * 
                       Math.min(Math.abs(angleDiff), this.turnRate * deltaTime);
        
        // 更新速度方向
        bullet.velocity.x = Math.cos(bullet.angle) * this.speed;
        bullet.velocity.y = Math.sin(bullet.angle) * this.speed;
      }
      
      // 更新位置
      bullet.position.add(bullet.velocity.multiply(deltaTime));
    }
  },
  
  // 抛物线子弹
  parabolic: {
    type: "PARABOLIC",
    initialSpeed: 600,
    gravity: 500,
    damage: 20,
    
    update(bullet, deltaTime) {
      // 应用重力
      bullet.velocity.y += this.gravity * deltaTime;
      
      // 更新位置
      bullet.position.add(bullet.velocity.multiply(deltaTime));
      
      // 更新朝向
      bullet.angle = Math.atan2(bullet.velocity.y, bullet.velocity.x);
    }
  },
  
  // 激光束
  laser: {
    type: "LASER",
    instant: true,  // 即时命中
    maxLength: 1000,
    width: 20,
    damagePerSecond: 50,
    
    update(bullet, deltaTime) {
      // 射线检测
      const hit = this.raycast(bullet.position, bullet.direction, this.maxLength);
      
      if (hit) {
        // 应用持续伤害
        hit.object.takeDamage(this.damagePerSecond * deltaTime);
        bullet.hitPoint = hit.point;
      }
    }
  },
  
  // 散弹
  spread: {
    type: "SPREAD",
    pellets: 5,
    spreadAngle: 30,  // 度
    speed: 700,
    damagePerPellet: 5,
    
    spawn(position, direction) {
      const bullets = [];
      const baseAngle = Math.atan2(direction.y, direction.x);
      const angleStep = this.spreadAngle * Math.PI / 180 / (this.pellets - 1);
      const startAngle = baseAngle - (this.spreadAngle * Math.PI / 180 / 2);
      
      for (let i = 0; i < this.pellets; i++) {
        const angle = startAngle + angleStep * i;
        bullets.push({
          position: position.clone(),
          velocity: {
            x: Math.cos(angle) * this.speed,
            y: Math.sin(angle) * this.speed
          },
          damage: this.damagePerPellet
        });
      }
      
      return bullets;
    }
  }
}
```

#### 弹幕模式生成

```javascript
BulletPatterns = {
  // 圆形弹幕
  circular: {
    bulletCount: 16,
    speed: 300,
    
    generate(origin) {
      const bullets = [];
      const angleStep = (Math.PI * 2) / this.bulletCount;
      
      for (let i = 0; i < this.bulletCount; i++) {
        const angle = angleStep * i;
        bullets.push({
          position: origin.clone(),
          velocity: {
            x: Math.cos(angle) * this.speed,
            y: Math.sin(angle) * this.speed
          }
        });
      }
      return bullets;
    }
  },
  
  // 螺旋弹幕
  spiral: {
    arms: 3,
    bulletsPerArm: 10,
    speed: 400,
    angularVelocity: 2.0,  // 弧度/秒
    
    generate(origin, time) {
      const bullets = [];
      const armAngleStep = (Math.PI * 2) / this.arms;
      
      for (let arm = 0; arm < this.arms; arm++) {
        for (let i = 0; i < this.bulletsPerArm; i++) {
          const delay = i * 0.1;  // 发射延迟
          if (time >= delay) {
            const angle = armAngleStep * arm + 
                         this.angularVelocity * (time - delay);
            bullets.push({
              position: origin.clone(),
              velocity: {
                x: Math.cos(angle) * this.speed,
                y: Math.sin(angle) * this.speed
              },
              spawnTime: delay
            });
          }
        }
      }
      return bullets;
    }
  },
  
  // 扇形弹幕
  fan: {
    layers: 3,
    bulletsPerLayer: 7,
    spreadAngle: 90,  // 度
    speedMin: 200,
    speedMax: 400,
    
    generate(origin, direction) {
      const bullets = [];
      const baseAngle = Math.atan2(direction.y, direction.x);
      const spreadRad = this.spreadAngle * Math.PI / 180;
      
      for (let layer = 0; layer < this.layers; layer++) {
        const speed = this.speedMin + 
                     (this.speedMax - this.speedMin) * (layer / this.layers);
        const angleStep = spreadRad / (this.bulletsPerLayer - 1);
        const startAngle = baseAngle - spreadRad / 2;
        
        for (let i = 0; i < this.bulletsPerLayer; i++) {
          const angle = startAngle + angleStep * i;
          bullets.push({
            position: origin.clone(),
            velocity: {
              x: Math.cos(angle) * speed,
              y: Math.sin(angle) * speed
            }
          });
        }
      }
      return bullets;
    }
  }
}
```

### 2.3.2 弹道计算

#### 高级弹道物理

```javascript
AdvancedBallistics = {
  // 风力影响
  windEffect: {
    windVector: { x: 50, y: 0 },  // 风速向量
    dragCoefficient: 0.1,
    
    apply(bullet, deltaTime) {
      // 相对风速
      const relativeWind = this.windVector.sub(bullet.velocity);
      
      // 风阻力
      const dragForce = relativeWind.multiply(this.dragCoefficient);
      
      // 应用到子弹
      bullet.velocity.add(dragForce.multiply(deltaTime));
    }
  },
  
  // 磁场偏转
  magneticField: {
    strength: 100,
    center: { x: 360, y: 640 },
    
    apply(bullet, deltaTime) {
      // 计算到磁场中心的向量
      const toCenter = this.center.sub(bullet.position);
      const distance = toCenter.length();
      
      if (distance < 300) {  // 磁场范围
        // 洛伦兹力效果
        const force = bullet.velocity.cross(toCenter.normalize());
        force.multiply(this.strength / (distance * distance));
        
        bullet.velocity.add(force.multiply(deltaTime));
      }
    }
  },
  
  // 反弹物理
  ricochet: {
    maxBounces: 3,
    energyLoss: 0.3,  // 每次反弹损失30%能量
    
    handleCollision(bullet, surface) {
      if (bullet.bounces >= this.maxBounces) {
        bullet.destroy();
        return;
      }
      
      // 计算反射向量
      const normal = surface.normal;
      const incident = bullet.velocity.normalize();
      const reflected = incident.sub(
        normal.multiply(2 * incident.dot(normal))
      );
      
      // 应用能量损失
      const speed = bullet.velocity.length() * (1 - this.energyLoss);
      bullet.velocity = reflected.multiply(speed);
      
      bullet.bounces++;
    }
  }
}
```

### 2.3.3 弹道预测与可视化

#### 轨迹预测

```javascript
TrajectoryPrediction = {
  // 预测弹道路径
  predictPath(initialPosition, initialVelocity, gravity, timeSteps) {
    const path = [];
    let position = initialPosition.clone();
    let velocity = initialVelocity.clone();
    
    for (let i = 0; i < timeSteps; i++) {
      path.push(position.clone());
      
      // 更新速度和位置
      velocity.y += gravity * 0.016;  // 假设60FPS
      position.add(velocity.multiply(0.016));
      
      // 检查边界
      if (position.y > 1280 || position.y < 0) {
        break;
      }
    }
    
    return path;
  },
  
  // 计算命中点
  calculateImpactPoint(shooter, target, bulletSpeed) {
    // 目标运动预测
    const targetVelocity = target.velocity;
    const relativePosition = target.position.sub(shooter.position);
    
    // 求解二次方程
    const a = targetVelocity.lengthSquared() - bulletSpeed * bulletSpeed;
    const b = 2 * relativePosition.dot(targetVelocity);
    const c = relativePosition.lengthSquared();
    
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) {
      return null;  // 无法命中
    }
    
    const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);
    
    const t = t1 > 0 ? t1 : t2;
    
    if (t > 0) {
      // 预测命中位置
      return target.position.add(targetVelocity.multiply(t));
    }
    
    return null;
  }
}
```