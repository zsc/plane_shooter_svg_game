# 第7章：玩家系统

## 概述

玩家系统是游戏的核心组件，负责管理玩家控制的战机的所有属性、行为和状态。本章详细定义了战机的基础属性、移动控制逻辑、生命值管理机制以及重生系统的实现规范。玩家系统需要与输入系统、武器系统、碰撞系统紧密配合，提供流畅的操控体验和合理的难度平衡。

## 7.1 战机属性定义

### 7.1.1 基础属性

战机的基础属性定义了玩家单位的核心数值参数，这些属性在游戏初始化时设定，并在游戏过程中动态调整。

#### 核心属性结构

```javascript
PlayerAircraft {
  // 识别属性
  id: string,              // 唯一标识符
  type: string,            // 战机型号 (fighter|bomber|interceptor)
  level: number,           // 当前等级 (1-10)
  
  // 生存属性
  maxHealth: number,       // 最大生命值 (100-500)
  currentHealth: number,   // 当前生命值
  maxShield: number,       // 最大护盾值 (0-200)
  currentShield: number,   // 当前护盾值
  lives: number,           // 剩余生命数 (0-5)
  
  // 移动属性
  baseSpeed: number,       // 基础移动速度 (200-400 px/s)
  acceleration: number,    // 加速度 (500-1000 px/s²)
  deceleration: number,    // 减速度 (800-1500 px/s²)
  maxSpeed: number,        // 最大速度 (300-600 px/s)
  rotationSpeed: number,   // 旋转速度 (180-360 deg/s)
  
  // 战斗属性
  attackPower: number,     // 基础攻击力 (10-100)
  attackSpeed: number,     // 攻击速度 (shots/s)
  criticalRate: number,    // 暴击率 (0-0.5)
  criticalDamage: number,  // 暴击伤害倍率 (1.5-3.0)
  
  // 防御属性
  defense: number,         // 防御力 (0-50)
  evasion: number,         // 闪避率 (0-0.3)
  damageReduction: number, // 伤害减免 (0-0.5)
  
  // 特殊属性
  energy: number,          // 能量值 (0-100)
  energyRegen: number,     // 能量回复速度 (1-10/s)
  specialCooldown: number, // 特殊技能冷却时间 (s)
  
  // 尺寸属性
  width: number,           // 战机宽度 (px)
  height: number,          // 战机高度 (px)
  hitboxRadius: number,    // 碰撞半径 (px)
  
  // 状态标识
  isInvincible: boolean,   // 无敌状态
  isStunned: boolean,      // 眩晕状态
  isBoosted: boolean,      // 加速状态
  isShielded: boolean      // 护盾激活状态
}
```

#### 属性初始值配置

| 属性名称 | 初始值 | 最小值 | 最大值 | 升级增量 |
|---------|--------|--------|--------|----------|
| maxHealth | 100 | 100 | 500 | +20/级 |
| maxShield | 0 | 0 | 200 | +15/级 |
| baseSpeed | 250 | 200 | 400 | +10/级 |
| attackPower | 20 | 10 | 100 | +5/级 |
| attackSpeed | 2.0 | 1.0 | 10.0 | +0.3/级 |
| defense | 5 | 0 | 50 | +2/级 |
| energy | 50 | 0 | 100 | +5/级 |

### 7.1.2 战机类型配置

游戏提供三种基础战机类型，每种类型具有独特的属性倾向和游戏风格。

#### 战斗机 (Fighter)

均衡型战机，适合新手玩家，各项属性平均。

```javascript
FighterConfig {
  displayName: "雷电战机",
  description: "标准型战斗机，攻防平衡，操作灵活",
  
  // 属性修正
  healthModifier: 1.0,      // 生命值修正
  speedModifier: 1.0,       // 速度修正
  attackModifier: 1.0,      // 攻击力修正
  defenseModifier: 1.0,     // 防御力修正
  
  // 特殊能力
  specialAbility: "RapidFire",  // 快速射击
  abilityDuration: 5.0,          // 持续时间(秒)
  abilityCooldown: 20.0,         // 冷却时间(秒)
  
  // 视觉配置
  sprite: "fighter_base",
  engineEffect: "blue_flame",
  bulletType: "standard_bullet",
  
  // 升级路线
  upgradeTree: {
    tier1: ["health_boost", "speed_boost"],
    tier2: ["double_shot", "piercing_rounds"],
    tier3: ["plasma_cannon", "shield_generator"]
  }
}
```

#### 轰炸机 (Bomber)

重型战机，高生命值和攻击力，但移动速度较慢。

```javascript
BomberConfig {
  displayName: "重型轰炸机",
  description: "重装甲轰炸机，火力强大但机动性较差",
  
  // 属性修正
  healthModifier: 1.5,      // 生命值 +50%
  speedModifier: 0.7,       // 速度 -30%
  attackModifier: 1.3,      // 攻击力 +30%
  defenseModifier: 1.2,     // 防御力 +20%
  
  // 特殊能力
  specialAbility: "CarpetBomb",  // 地毯式轰炸
  abilityDuration: 3.0,
  abilityCooldown: 25.0,
  
  // 特殊属性
  explosionRadius: 100,      // 爆炸范围(px)
  splashDamage: 0.5,        // 溅射伤害比例
  
  // 升级路线
  upgradeTree: {
    tier1: ["armor_plating", "heavy_payload"],
    tier2: ["cluster_bombs", "napalm_strike"],
    tier3: ["nuclear_option", "fortress_mode"]
  }
}
```

#### 拦截机 (Interceptor)

高速型战机，机动性极强但防御较弱。

```javascript
InterceptorConfig {
  displayName: "幽灵拦截机",
  description: "高速拦截机，极限机动但装甲薄弱",
  
  // 属性修正
  healthModifier: 0.7,      // 生命值 -30%
  speedModifier: 1.4,       // 速度 +40%
  attackModifier: 0.9,      // 攻击力 -10%
  defenseModifier: 0.8,     // 防御力 -20%
  evasionBonus: 0.15,       // 闪避率 +15%
  
  // 特殊能力
  specialAbility: "PhaseShift",  // 相位移动
  abilityDuration: 2.0,
  abilityCooldown: 15.0,
  
  // 特殊属性
  afterburnerSpeed: 600,     // 加力速度(px/s)
  dodgeDistance: 150,        // 闪避距离(px)
  
  // 升级路线
  upgradeTree: {
    tier1: ["engine_boost", "agility_enhance"],
    tier2: ["ghost_mode", "lightning_strike"],
    tier3: ["time_dilation", "quantum_leap"]
  }
}
```

### 7.1.3 升级属性系统

战机通过收集经验值或特定道具进行升级，每次升级提升基础属性并解锁新能力。

#### 经验值系统

```javascript
ExperienceSystem {
  currentExp: number,        // 当前经验值
  expToNextLevel: number,    // 升级所需经验
  totalExp: number,          // 累计获得经验
  
  // 经验值来源
  enemyKillExp: {
    small: 10,              // 小型敌机
    medium: 25,             // 中型敌机
    large: 50,              // 大型敌机
    boss: 500               // Boss
  },
  
  // 经验值加成
  comboMultiplier: number,   // 连击加成 (1.0-3.0)
  difficultyBonus: number,   // 难度加成 (1.0-2.0)
  
  // 升级公式
  getRequiredExp(level) {
    return 100 * level * (level + 1) / 2;
  }
}
```

#### 属性成长曲线

```javascript
AttributeGrowth {
  // 线性成长
  linearGrowth(base, level, increment) {
    return base + (level - 1) * increment;
  },
  
  // 指数成长
  exponentialGrowth(base, level, factor) {
    return base * Math.pow(factor, level - 1);
  },
  
  // 对数成长
  logarithmicGrowth(base, level, scale) {
    return base * (1 + Math.log(level) * scale);
  },
  
  // S型成长曲线
  sigmoidGrowth(base, level, maxLevel, steepness) {
    const x = (level - maxLevel/2) / (maxLevel/10);
    return base * (1 + 1 / (1 + Math.exp(-steepness * x)));
  }
}
```

#### 技能解锁系统

```javascript
SkillUnlockSystem {
  unlockedSkills: Set<string>,
  skillPoints: number,
  
  // 技能树节点
  SkillNode {
    id: string,
    name: string,
    description: string,
    requiredLevel: number,
    requiredSkills: string[],
    cost: number,
    
    // 效果
    effects: {
      attributeBonus: Map<string, number>,
      newAbility: string,
      passiveEffect: string
    }
  },
  
  // 解锁条件检查
  canUnlock(skillId) {
    const skill = getSkill(skillId);
    return level >= skill.requiredLevel &&
           skillPoints >= skill.cost &&
           hasAllRequiredSkills(skill.requiredSkills);
  }
}
```

### 7.1.4 属性计算公式

所有属性的最终值通过基础值、装备加成、技能加成和临时效果综合计算得出。

#### 最终属性计算

```javascript
FinalAttributeCalculation {
  // 计算最终属性值
  calculateFinalValue(attribute) {
    let value = baseValue;
    
    // 1. 应用装备加成 (加法)
    value += equipmentBonus;
    
    // 2. 应用技能加成 (百分比)
    value *= (1 + skillMultiplier);
    
    // 3. 应用临时效果 (百分比)
    value *= (1 + temporaryMultiplier);
    
    // 4. 应用等级修正
    value *= getLevelModifier(currentLevel);
    
    // 5. 应用难度修正
    value *= getDifficultyModifier(gameMode);
    
    // 6. 限制在最大最小值范围内
    value = clamp(value, minValue, maxValue);
    
    return Math.floor(value);
  }
}
```

#### 伤害计算公式

```javascript
DamageCalculation {
  // 基础伤害计算
  calculateDamage(attacker, defender) {
    // 基础伤害
    let damage = attacker.attackPower;
    
    // 暴击判定
    if (Math.random() < attacker.criticalRate) {
      damage *= attacker.criticalDamage;
      isCritical = true;
    }
    
    // 防御减免
    const defenseReduction = defender.defense / (defender.defense + 100);
    damage *= (1 - defenseReduction);
    
    // 伤害减免
    damage *= (1 - defender.damageReduction);
    
    // 属性克制
    damage *= getElementalModifier(attacker.element, defender.element);
    
    // 随机浮动 (±10%)
    damage *= (0.9 + Math.random() * 0.2);
    
    // 最小伤害保证
    damage = Math.max(1, Math.floor(damage));
    
    return {
      damage: damage,
      isCritical: isCritical,
      isEvaded: Math.random() < defender.evasion
    };
  }
}
```

#### 速度计算公式

```javascript
SpeedCalculation {
  // 实际移动速度计算
  calculateMovementSpeed(player) {
    let speed = player.baseSpeed;
    
    // 加速状态
    if (player.isBoosted) {
      speed *= 1.5;
    }
    
    // 减速状态
    if (player.isSlowed) {
      speed *= 0.5;
    }
    
    // 负重影响
    const loadFactor = 1 - (player.weight / player.maxWeight) * 0.2;
    speed *= loadFactor;
    
    // 地形影响
    speed *= getTerrainModifier(currentTerrain);
    
    // 限制最大速度
    speed = Math.min(speed, player.maxSpeed);
    
    return speed;
  }
}
```

## 7.2 移动与控制逻辑

### 7.2.1 移动系统架构

移动系统负责处理玩家输入、计算战机位置和管理移动状态，确保操控流畅且响应迅速。

#### 核心移动组件

```javascript
MovementSystem {
  // 位置信息
  position: Vector2D {
    x: number,              // 当前X坐标
    y: number               // 当前Y坐标
  },
  
  // 速度信息
  velocity: Vector2D {
    x: number,              // X轴速度分量
    y: number               // Y轴速度分量
  },
  
  // 加速度信息
  acceleration: Vector2D {
    x: number,              // X轴加速度
    y: number               // Y轴加速度
  },
  
  // 移动状态
  movementState: {
    isMoving: boolean,      // 是否正在移动
    direction: number,      // 移动方向角度 (0-360)
    speed: number,          // 当前速度大小
    targetPosition: Vector2D, // 目标位置
    moveMode: string        // 移动模式 (normal|dash|slow)
  },
  
  // 输入缓冲
  inputBuffer: {
    horizontal: number,     // 水平输入 (-1 to 1)
    vertical: number,       // 垂直输入 (-1 to 1)
    timestamp: number       // 输入时间戳
  }
}
```

#### 移动模式定义

```javascript
MovementModes {
  // 普通移动
  normal: {
    speedMultiplier: 1.0,
    accelerationMultiplier: 1.0,
    turningRadius: 50,
    canShoot: true,
    trailEffect: "normal_trail"
  },
  
  // 冲刺移动
  dash: {
    speedMultiplier: 2.0,
    accelerationMultiplier: 3.0,
    turningRadius: 100,
    canShoot: false,
    trailEffect: "dash_trail",
    duration: 0.5,              // 持续时间(秒)
    cooldown: 2.0,              // 冷却时间(秒)
    invincibleFrames: 10        // 无敌帧数
  },
  
  // 精确移动
  precision: {
    speedMultiplier: 0.5,
    accelerationMultiplier: 0.3,
    turningRadius: 20,
    canShoot: true,
    trailEffect: "precision_trail",
    aimAssist: true             // 瞄准辅助
  },
  
  // 自动驾驶
  autopilot: {
    speedMultiplier: 0.8,
    accelerationMultiplier: 0.5,
    turningRadius: 30,
    canShoot: true,
    pathfinding: true,
    avoidanceRadius: 100        // 避障半径
  }
}
```

#### 移动更新循环

```javascript
MovementUpdate {
  // 每帧更新
  update(deltaTime) {
    // 1. 处理输入
    processInput();
    
    // 2. 计算加速度
    calculateAcceleration();
    
    // 3. 更新速度
    updateVelocity(deltaTime);
    
    // 4. 更新位置
    updatePosition(deltaTime);
    
    // 5. 应用约束
    applyConstraints();
    
    // 6. 更新动画状态
    updateAnimationState();
    
    // 7. 触发移动事件
    triggerMovementEvents();
  },
  
  // 计算加速度
  calculateAcceleration() {
    const input = getInputVector();
    const targetAccel = input.multiply(maxAcceleration);
    
    // 平滑过渡
    acceleration = lerp(acceleration, targetAccel, smoothFactor);
    
    // 应用移动模式修正
    acceleration.multiply(moveMode.accelerationMultiplier);
    
    return acceleration;
  },
  
  // 更新速度
  updateVelocity(dt) {
    // 应用加速度
    velocity.add(acceleration.multiply(dt));
    
    // 应用阻力
    velocity.multiply(1 - friction * dt);
    
    // 限制最大速度
    if (velocity.magnitude() > maxSpeed) {
      velocity.normalize().multiply(maxSpeed);
    }
  }
}
```

### 7.2.2 速度与加速度

速度和加速度系统控制战机的运动特性，提供真实的物理感受和精确的控制响应。

#### 速度系统

```javascript
VelocitySystem {
  // 速度配置
  speedConfig: {
    baseSpeed: 300,         // 基础速度 (px/s)
    maxSpeed: 500,          // 最大速度
    minSpeed: 50,           // 最小速度
    boostSpeed: 700,        // 加速后速度
    
    // 方向速度差异
    forwardSpeed: 1.0,      // 前进速度系数
    backwardSpeed: 0.7,     // 后退速度系数
    sidewaysSpeed: 0.85     // 横向速度系数
  },
  
  // 速度计算
  calculateSpeed(input, modifiers) {
    let speed = baseSpeed;
    
    // 方向修正
    speed *= getDirectionalModifier(input.direction);
    
    // 状态修正
    if (modifiers.boost) speed *= 1.5;
    if (modifiers.slow) speed *= 0.5;
    if (modifiers.damaged) speed *= 0.8;
    
    // 环境影响
    speed *= environmentalFactor;
    
    // 平滑插值
    currentSpeed = smoothDamp(currentSpeed, speed, smoothTime);
    
    return clamp(currentSpeed, minSpeed, maxSpeed);
  }
}
```

#### 加速度系统

```javascript
AccelerationSystem {
  // 加速度配置
  accelerationConfig: {
    normalAccel: 800,       // 普通加速度 (px/s²)
    boostAccel: 1500,       // 加速状态加速度
    brakeAccel: 2000,       // 刹车加速度
    turnAccel: 1200,        // 转向加速度
    
    // 响应曲线
    responseCurve: "exponential", // linear|exponential|smooth
    responseTime: 0.15      // 响应时间(秒)
  },
  
  // 加速度计算
  calculateAcceleration(input, currentVelocity) {
    const targetVelocity = input.multiply(maxSpeed);
    const velocityDiff = targetVelocity.subtract(currentVelocity);
    
    // 基础加速度
    let accel = velocityDiff.normalize().multiply(normalAccel);
    
    // 急停判定
    if (velocityDiff.magnitude() < 0.1 && input.magnitude() < 0.1) {
      accel = currentVelocity.multiply(-brakeAccel);
    }
    
    // 转向加速度
    const turnAngle = angleBetween(currentVelocity, targetVelocity);
    if (turnAngle > 45) {
      accel.add(getTurnAcceleration(turnAngle));
    }
    
    return accel;
  },
  
  // 加速度响应曲线
  applyResponseCurve(value, curve) {
    switch(curve) {
      case "linear":
        return value;
      case "exponential":
        return Math.pow(value, 2) * Math.sign(value);
      case "smooth":
        return smoothstep(0, 1, Math.abs(value)) * Math.sign(value);
      case "ease-in-out":
        return easeInOutCubic(value);
    }
  }
}
```

#### 惯性系统

```javascript
InertiaSystem {
  // 惯性配置
  inertiaConfig: {
    mass: 1.0,              // 质量
    dragCoefficient: 0.1,   // 空气阻力系数
    angularDrag: 0.2,       // 角阻力
    momentum: Vector2D      // 动量
  },
  
  // 惯性计算
  applyInertia(velocity, deltaTime) {
    // 空气阻力
    const drag = velocity.multiply(-dragCoefficient * velocity.magnitude());
    velocity.add(drag.multiply(deltaTime));
    
    // 动量守恒
    momentum = velocity.multiply(mass);
    
    // 角动量
    if (isRotating) {
      angularVelocity *= (1 - angularDrag * deltaTime);
    }
    
    return velocity;
  },
  
  // 碰撞后的速度
  collisionResponse(velocity, normal, bounciness) {
    // 反射速度
    const reflected = reflect(velocity, normal);
    
    // 能量损失
    return reflected.multiply(bounciness);
  }
}
```

### 7.2.3 边界限制

边界系统确保战机在可玩区域内活动，提供合理的边界行为和视觉反馈。

#### 游戏区域定义

```javascript
GameBoundaries {
  // 屏幕边界
  screenBounds: {
    left: 0,
    right: 640,
    top: 0,
    bottom: 960,
    
    // 安全区域 (UI不遮挡)
    safeArea: {
      left: 20,
      right: 620,
      top: 100,
      bottom: 900
    }
  },
  
  // 玩家活动区域
  playerArea: {
    minX: 32,               // 左边界
    maxX: 608,              // 右边界
    minY: 480,              // 上边界(屏幕下半部分)
    maxY: 928,              // 下边界
    
    // 软边界(开始减速)
    softBoundary: 20,       // 距离硬边界的距离
    
    // 弹性边界
    elasticity: 0.3         // 弹性系数
  },
  
  // 动态边界
  dynamicBounds: {
    enabled: false,
    scrollSpeed: 0,
    obstacles: []
  }
}
```

#### 边界检测与处理

```javascript
BoundaryHandler {
  // 边界检测
  checkBoundaries(position, velocity) {
    const result = {
      isInBounds: true,
      clampedPosition: position.clone(),
      adjustedVelocity: velocity.clone(),
      boundaryHit: null
    };
    
    // X轴边界检测
    if (position.x < playerArea.minX) {
      result.isInBounds = false;
      result.boundaryHit = "left";
      result.clampedPosition.x = playerArea.minX;
      result.adjustedVelocity.x = Math.max(0, velocity.x);
    } else if (position.x > playerArea.maxX) {
      result.isInBounds = false;
      result.boundaryHit = "right";
      result.clampedPosition.x = playerArea.maxX;
      result.adjustedVelocity.x = Math.min(0, velocity.x);
    }
    
    // Y轴边界检测
    if (position.y < playerArea.minY) {
      result.isInBounds = false;
      result.boundaryHit = "top";
      result.clampedPosition.y = playerArea.minY;
      result.adjustedVelocity.y = Math.max(0, velocity.y);
    } else if (position.y > playerArea.maxY) {
      result.isInBounds = false;
      result.boundaryHit = "bottom";
      result.clampedPosition.y = playerArea.maxY;
      result.adjustedVelocity.y = Math.min(0, velocity.y);
    }
    
    return result;
  },
  
  // 软边界处理
  applySoftBoundary(position, velocity) {
    const softArea = playerArea.softBoundary;
    
    // 计算到边界的距离
    const distToLeft = position.x - playerArea.minX;
    const distToRight = playerArea.maxX - position.x;
    const distToTop = position.y - playerArea.minY;
    const distToBottom = playerArea.maxY - position.y;
    
    // 在软边界内时减速
    if (distToLeft < softArea) {
      velocity.x *= (distToLeft / softArea);
    }
    if (distToRight < softArea) {
      velocity.x *= (distToRight / softArea);
    }
    if (distToTop < softArea) {
      velocity.y *= (distToTop / softArea);
    }
    if (distToBottom < softArea) {
      velocity.y *= (distToBottom / softArea);
    }
    
    return velocity;
  },
  
  // 边界反馈
  boundaryFeedback: {
    visual: {
      flashColor: "#ff0000",
      flashDuration: 0.1,
      shakeIntensity: 5,
      rippleEffect: true
    },
    
    audio: {
      hitSound: "boundary_hit",
      warningSound: "boundary_warning",
      volumeBySpeed: true
    },
    
    haptic: {
      enabled: true,
      pattern: "impact",
      intensity: 0.5
    }
  }
}
```

### 7.2.4 控制响应优化

优化控制响应以提供精确、流畅的操控体验，适应不同的输入设备和玩家习惯。

#### 输入处理优化

```javascript
InputOptimization {
  // 输入平滑
  inputSmoothing: {
    enabled: true,
    bufferSize: 5,          // 缓冲区大小
    smoothingFactor: 0.3,   // 平滑系数
    
    // 平滑处理
    smoothInput(rawInput) {
      inputBuffer.push(rawInput);
      if (inputBuffer.length > bufferSize) {
        inputBuffer.shift();
      }
      
      // 加权平均
      let smoothed = Vector2D.zero();
      let totalWeight = 0;
      
      for (let i = 0; i < inputBuffer.length; i++) {
        const weight = (i + 1) / inputBuffer.length;
        smoothed.add(inputBuffer[i].multiply(weight));
        totalWeight += weight;
      }
      
      return smoothed.divide(totalWeight);
    }
  },
  
  // 死区处理
  deadZone: {
    threshold: 0.15,        // 死区阈值
    
    applyDeadZone(input) {
      if (input.magnitude() < threshold) {
        return Vector2D.zero();
      }
      
      // 重新映射
      const normalized = input.normalize();
      const magnitude = (input.magnitude() - threshold) / (1 - threshold);
      return normalized.multiply(magnitude);
    }
  },
  
  // 输入预测
  inputPrediction: {
    enabled: true,
    predictionFrames: 2,    // 预测帧数
    
    predictInput(currentInput, history) {
      // 基于历史输入预测未来输入
      const velocity = history[0].subtract(history[1]);
      const acceleration = velocity.subtract(history[1].subtract(history[2]));
      
      return currentInput.add(velocity.multiply(predictionFrames))
                        .add(acceleration.multiply(predictionFrames * 0.5));
    }
  }
}
```

#### 响应曲线调整

```javascript
ResponseCurves {
  // 预设响应曲线
  presets: {
    // 线性响应
    linear: (x) => x,
    
    // 加速响应
    accelerated: (x) => Math.pow(x, 1.5),
    
    // 精确控制
    precision: (x) => {
      if (Math.abs(x) < 0.5) {
        return x * 0.5;  // 小幅度输入减速
      }
      return x;
    },
    
    // S型曲线
    sigmoid: (x) => {
      const k = 5;  // 陡峭度
      return 2 / (1 + Math.exp(-k * x)) - 1;
    },
    
    // 自定义曲线
    custom: (x, points) => {
      return bezierInterpolation(x, points);
    }
  },
  
  // 动态响应调整
  dynamicResponse: {
    // 根据游戏状态调整
    adjustByGameState(input, gameState) {
      let adjusted = input;
      
      // 战斗中提高响应
      if (gameState.inCombat) {
        adjusted = applyResponseCurve(input, "accelerated");
      }
      
      // 精确瞄准模式
      if (gameState.aiming) {
        adjusted = applyResponseCurve(input, "precision");
      }
      
      // 受伤减速
      if (gameState.damaged) {
        adjusted = input.multiply(0.7);
      }
      
      return adjusted;
    }
  }
}
```

#### 延迟补偿

```javascript
LatencyCompensation {
  // 客户端预测
  clientPrediction: {
    enabled: true,
    historySize: 10,
    
    // 预测移动
    predictMovement(input, latency) {
      // 基于延迟预测位置
      const predictedFrames = Math.ceil(latency / 16.67);  // 60fps
      
      let predictedPos = currentPosition;
      let predictedVel = currentVelocity;
      
      for (let i = 0; i < predictedFrames; i++) {
        predictedVel = updateVelocity(predictedVel, input, 0.016);
        predictedPos = updatePosition(predictedPos, predictedVel, 0.016);
      }
      
      return predictedPos;
    }
  },
  
  // 插值平滑
  interpolation: {
    enabled: true,
    lerpFactor: 0.1,
    
    // 位置插值
    interpolatePosition(current, target) {
      return lerp(current, target, lerpFactor);
    },
    
    // 旋转插值
    interpolateRotation(current, target) {
      return lerpAngle(current, target, lerpFactor);
    }
  }
}

## 7.3 生命值与护盾机制

### 7.3.1 生命值系统
### 7.3.2 护盾机制
### 7.3.3 伤害计算
### 7.3.4 状态效果

## 7.4 重生与无敌时间

### 7.4.1 重生机制
### 7.4.2 无敌时间系统
### 7.4.3 复活道具
### 7.4.4 检查点系统