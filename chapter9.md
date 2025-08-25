# 第9章：敌机系统

## 章节概述

敌机系统是飞机大战游戏的核心对抗元素，负责生成、控制和管理所有敌方单位。本章详细定义敌机的类型层级、行为模式、编队逻辑和动态生成机制，确保游戏提供富有挑战性和变化性的战斗体验。

## 9.1 敌机类型定义

### 9.1.1 基础属性结构

```javascript
EnemyAttributes = {
    // 标识属性
    id: String,              // 唯一标识符
    type: String,            // 敌机类型标识
    tier: Number,            // 敌机等级 (1-5)
    
    // 生命值属性
    maxHealth: Number,       // 最大生命值
    armor: Number,           // 护甲值 (减伤百分比)
    shield: Number,          // 护盾值 (可再生)
    
    // 移动属性
    baseSpeed: Number,       // 基础移动速度
    acceleration: Number,    // 加速度
    turnRate: Number,        // 转向速率
    
    // 战斗属性
    damage: Number,          // 碰撞伤害
    fireRate: Number,        // 射击频率
    accuracy: Number,        // 射击精度 (0-1)
    
    // 奖励属性
    scoreValue: Number,      // 击杀分数
    dropRate: Number,        // 道具掉落率
    experienceValue: Number  // 经验值奖励
}
```

### 9.1.2 敌机类型层级

#### Tier 1 - 轻型敌机
- **侦察机 (Scout)**
  - 生命值：10-20
  - 速度：快速
  - 攻击：单发直线子弹
  - 特点：机动灵活，常成群出现
  
- **无人机 (Drone)**
  - 生命值：5-10
  - 速度：中速
  - 攻击：无攻击能力
  - 特点：自爆型，碰撞伤害高

#### Tier 2 - 中型敌机
- **战斗机 (Fighter)**
  - 生命值：30-50
  - 速度：中速
  - 攻击：三连发子弹
  - 特点：标准敌机，平衡性能
  
- **轰炸机 (Bomber)**
  - 生命值：50-80
  - 速度：慢速
  - 攻击：投弹攻击
  - 特点：高血量，范围伤害

#### Tier 3 - 重型敌机
- **拦截机 (Interceptor)**
  - 生命值：80-120
  - 速度：极快
  - 攻击：追踪导弹
  - 特点：精英单位，智能追击
  
- **炮艇 (Gunship)**
  - 生命值：150-200
  - 速度：极慢
  - 攻击：多管机炮
  - 特点：火力凶猛，弹幕密集

#### Tier 4 - 特殊敌机
- **隐形机 (Stealth)**
  - 生命值：60-80
  - 速度：中速
  - 攻击：激光武器
  - 特点：间歇性隐身，难以锁定
  
- **护盾机 (Shielder)**
  - 生命值：100-150
  - 速度：慢速
  - 攻击：能量球
  - 特点：可再生护盾，为友军提供掩护

#### Tier 5 - 精英敌机
- **指挥机 (Commander)**
  - 生命值：200-300
  - 速度：中速
  - 攻击：全方位弹幕
  - 特点：强化周围友军，战术核心
  
- **歼灭者 (Annihilator)**
  - 生命值：300-500
  - 速度：慢速
  - 攻击：毁灭光束
  - 特点：小Boss级单位，需要特殊策略

### 9.1.3 敌机视觉设计规范

```javascript
VisualDesign = {
    // 尺寸规范
    size: {
        small: {width: 32, height: 32},    // Tier 1
        medium: {width: 48, height: 48},   // Tier 2-3
        large: {width: 64, height: 64},    // Tier 4
        huge: {width: 96, height: 96}      // Tier 5
    },
    
    // 颜色编码
    colorScheme: {
        tier1: "#808080",  // 灰色系
        tier2: "#4169E1",  // 蓝色系
        tier3: "#FF4500",  // 橙红系
        tier4: "#9400D3",  // 紫色系
        tier5: "#FFD700"   // 金色系
    },
    
    // 动画帧数
    animationFrames: {
        idle: 4,           // 待机动画
        move: 8,           // 移动动画
        attack: 6,         // 攻击动画
        destroy: 12        // 销毁动画
    }
}
```

## 9.2 AI行为模式

### 9.2.1 基础行为树架构

```javascript
BehaviorTree = {
    // 根节点
    root: SelectorNode,
    
    // 选择器节点 - 优先级从高到低
    SelectorNode: [
        EmergencyEvade,      // 紧急规避
        SpecialAbility,      // 特殊技能
        AttackSequence,      // 攻击序列
        MovementPattern,     // 移动模式
        DefaultBehavior      // 默认行为
    ]
}
```

### 9.2.2 移动模式库

#### 直线模式 (Linear)
```javascript
LinearPattern = {
    type: "linear",
    parameters: {
        angle: Number,       // 移动角度
        speed: Number,       // 移动速度
        duration: Number     // 持续时间
    }
}
```

#### 正弦波模式 (Sine Wave)
```javascript
SineWavePattern = {
    type: "sine_wave",
    parameters: {
        amplitude: Number,   // 振幅
        frequency: Number,   // 频率
        baseSpeed: Number,   // 基础速度
        vertical: Boolean    // 垂直/水平
    }
}
```

#### 圆形模式 (Circular)
```javascript
CircularPattern = {
    type: "circular",
    parameters: {
        centerX: Number,     // 圆心X
        centerY: Number,     // 圆心Y
        radius: Number,      // 半径
        angularSpeed: Number // 角速度
    }
}
```

#### 之字形模式 (Zigzag)
```javascript
ZigzagPattern = {
    type: "zigzag",
    parameters: {
        segmentLength: Number,  // 段长度
        angle: Number,          // 转折角度
        speed: Number           // 移动速度
    }
}
```

#### 追踪模式 (Tracking)
```javascript
TrackingPattern = {
    type: "tracking",
    parameters: {
        target: Object,         // 目标对象
        leadTime: Number,       // 预判时间
        maxTurnRate: Number,    // 最大转向率
        engageDistance: Number  // 交战距离
    }
}
```

### 9.2.3 攻击行为定义

#### 攻击决策树
```javascript
AttackDecision = {
    // 攻击条件检查
    canAttack: function() {
        return inRange && 
               cooldownReady && 
               hasAmmunition && 
               targetVisible;
    },
    
    // 攻击类型选择
    selectAttackType: function() {
        if (distance < 100) return "point_blank";
        if (distance < 300) return "burst_fire";
        if (distance < 500) return "aimed_shot";
        return "suppression";
    },
    
    // 攻击执行
    executeAttack: function(type) {
        switch(type) {
            case "point_blank": // 近距离扫射
                firePattern = "spread";
                bulletCount = 5;
                break;
            case "burst_fire":  // 连发射击
                firePattern = "burst";
                bulletCount = 3;
                break;
            case "aimed_shot":  // 精确射击
                firePattern = "single";
                bulletCount = 1;
                break;
            case "suppression": // 压制射击
                firePattern = "continuous";
                bulletCount = 10;
                break;
        }
    }
}
```

### 9.2.4 智能行为模块

#### 规避系统
```javascript
EvadeSystem = {
    // 威胁检测
    detectThreats: function() {
        threats = [];
        // 扫描周围子弹
        nearbyBullets.forEach(bullet => {
            if (willCollide(this, bullet)) {
                threats.push({
                    object: bullet,
                    timeToImpact: calculateImpactTime(),
                    direction: bullet.direction
                });
            }
        });
        return threats.sort((a, b) => a.timeToImpact - b.timeToImpact);
    },
    
    // 规避方向计算
    calculateEvadeDirection: function(threats) {
        safeZones = findSafeZones();
        return selectOptimalZone(safeZones, currentPosition);
    }
}
```

#### 协作行为
```javascript
CooperativeBehavior = {
    // 编队保持
    maintainFormation: function(formation, position) {
        targetPos = formation.getPosition(position);
        moveTowards(targetPos);
    },
    
    // 集火目标
    focusFire: function(primaryTarget) {
        allUnits.forEach(unit => {
            unit.setTarget(primaryTarget);
        });
    },
    
    // 掩护行动
    provideCover: function(protectedUnit) {
        positionBetween(protectedUnit, threat);
        increaseFireRate();
    }
}
```

## 9.3 编队飞行逻辑

### 9.3.1 编队类型定义

#### V字编队
```javascript
VFormation = {
    type: "V",
    positions: [
        {x: 0, y: 0},      // 领队
        {x: -50, y: 30},   // 左翼1
        {x: 50, y: 30},    // 右翼1
        {x: -100, y: 60},  // 左翼2
        {x: 100, y: 60}    // 右翼2
    ],
    spacing: 50,
    angleOffset: 30
}
```

#### 横排编队
```javascript
LineFormation = {
    type: "Line",
    positions: function(count) {
        positions = [];
        spacing = 60;
        startX = -(count - 1) * spacing / 2;
        for (i = 0; i < count; i++) {
            positions.push({
                x: startX + i * spacing,
                y: 0
            });
        }
        return positions;
    }
}
```

#### 箭头编队
```javascript
ArrowFormation = {
    type: "Arrow",
    positions: [
        {x: 0, y: 0},      // 尖端
        {x: -30, y: 40},   // 左侧1
        {x: 30, y: 40},    // 右侧1
        {x: -60, y: 80},   // 左侧2
        {x: 60, y: 80},    // 右侧2
        {x: 0, y: 80}      // 中心
    ]
}
```

#### 钻石编队
```javascript
DiamondFormation = {
    type: "Diamond",
    positions: [
        {x: 0, y: 0},      // 顶点
        {x: -40, y: 40},   // 左侧
        {x: 40, y: 40},    // 右侧
        {x: 0, y: 80}      // 底点
    ],
    rotation: 0,           // 可旋转
    scale: 1.0            // 可缩放
}
```

### 9.3.2 编队控制系统

```javascript
FormationController = {
    // 编队初始化
    initialize: function(units, formationType) {
        this.units = units;
        this.formation = formationType;
        this.leader = units[0];
        this.assignPositions();
    },
    
    // 位置分配
    assignPositions: function() {
        positions = this.formation.positions;
        for (i = 0; i < this.units.length; i++) {
            unit = this.units[i];
            unit.formationPosition = positions[i % positions.length];
            unit.formationRole = (i === 0) ? "leader" : "follower";
        }
    },
    
    // 编队更新
    update: function(deltaTime) {
        // 更新领队
        if (this.leader.formationRole === "leader") {
            this.leader.executePattern();
        }
        
        // 跟随者同步
        this.units.forEach(unit => {
            if (unit.formationRole === "follower") {
                targetPos = this.calculateFormationPosition(unit);
                unit.moveToPosition(targetPos, deltaTime);
            }
        });
        
        // 编队完整性检查
        this.checkFormationIntegrity();
    },
    
    // 编队位置计算
    calculateFormationPosition: function(unit) {
        leaderPos = this.leader.position;
        offset = unit.formationPosition;
        
        // 应用旋转
        rotatedOffset = rotateVector(offset, this.leader.rotation);
        
        return {
            x: leaderPos.x + rotatedOffset.x,
            y: leaderPos.y + rotatedOffset.y
        };
    },
    
    // 完整性检查
    checkFormationIntegrity: function() {
        activeUnits = this.units.filter(unit => unit.isAlive);
        
        // 领队丢失处理
        if (!this.leader.isAlive && activeUnits.length > 0) {
            this.leader = activeUnits[0];
            this.leader.formationRole = "leader";
        }
        
        // 编队解散条件
        if (activeUnits.length < this.formation.minUnits) {
            this.disbandFormation();
        }
    },
    
    // 编队解散
    disbandFormation: function() {
        this.units.forEach(unit => {
            unit.formationRole = "independent";
            unit.switchToIndependentAI();
        });
    }
}
```

### 9.3.3 编队机动动作

```javascript
FormationManeuvers = {
    // 分散机动
    scatter: function(formation, duration) {
        formation.units.forEach(unit => {
            scatterDirection = randomDirection();
            scatterDistance = random(100, 200);
            unit.temporaryTarget = {
                x: unit.position.x + scatterDirection.x * scatterDistance,
                y: unit.position.y + scatterDirection.y * scatterDistance
            };
        });
        
        setTimeout(() => {
            formation.regroup();
        }, duration);
    },
    
    // 包围机动
    encircle: function(formation, target) {
        angleStep = 360 / formation.units.length;
        radius = 200;
        
        formation.units.forEach((unit, index) => {
            angle = angleStep * index;
            unit.circleTarget(target, radius, angle);
        });
    },
    
    // 突击机动
    assault: function(formation, target) {
        formation.units.forEach(unit => {
            unit.boostSpeed(2.0);
            unit.setTarget(target);
            unit.fireMode = "aggressive";
        });
    },
    
    // 防御机动
    defensive: function(formation) {
        // 收紧编队
        formation.spacing *= 0.5;
        // 增加机动性
        formation.units.forEach(unit => {
            unit.evasionPriority = "high";
            unit.fireMode = "suppressive";
        });
    }
}
```

### 9.3.4 编队通信协议

```javascript
FormationCommunication = {
    // 消息类型
    messageTypes: {
        FORM_UP: "form_up",
        BREAK: "break",
        ATTACK: "attack",
        EVADE: "evade",
        REGROUP: "regroup"
    },
    
    // 广播消息
    broadcast: function(formation, message) {
        formation.units.forEach(unit => {
            unit.receiveMessage(message);
        });
    },
    
    // 消息处理
    handleMessage: function(unit, message) {
        switch(message.type) {
            case "form_up":
                unit.returnToFormation();
                break;
            case "break":
                unit.breakFormation();
                break;
            case "attack":
                unit.engageTarget(message.target);
                break;
            case "evade":
                unit.performEvasion(message.direction);
                break;
            case "regroup":
                unit.regroupAtPosition(message.position);
                break;
        }
    }
}
```

## 9.4 敌机生成器

### 9.4.1 波次生成系统

```javascript
WaveGenerator = {
    // 波次配置
    waveConfig: {
        waveNumber: Number,
        difficulty: Number,
        enemyBudget: Number,
        specialUnits: Array,
        formationTypes: Array,
        spawnPattern: String
    },
    
    // 生成波次
    generateWave: function(config) {
        wave = {
            enemies: [],
            formations: [],
            spawnTime: 0,
            duration: 0
        };
        
        // 计算敌机组合
        enemyComposition = this.calculateComposition(config);
        
        // 分配编队
        formations = this.assignFormations(enemyComposition, config.formationTypes);
        
        // 设置生成时间
        spawnSchedule = this.createSpawnSchedule(formations, config.spawnPattern);
        
        return {
            wave: wave,
            schedule: spawnSchedule
        };
    },
    
    // 敌机组合计算
    calculateComposition: function(config) {
        composition = [];
        remainingBudget = config.enemyBudget;
        
        // 根据难度分配敌机等级
        tierDistribution = this.getTierDistribution(config.difficulty);
        
        tierDistribution.forEach(tier => {
            count = Math.floor(remainingBudget * tier.percentage);
            for (i = 0; i < count; i++) {
                enemyType = this.selectEnemyType(tier.level);
                composition.push(enemyType);
                remainingBudget -= enemyType.cost;
            }
        });
        
        return composition;
    },
    
    // 生成时间表
    createSpawnSchedule: function(formations, pattern) {
        schedule = [];
        currentTime = 0;
        
        switch(pattern) {
            case "continuous":
                // 持续生成
                interval = 2000; // 2秒间隔
                formations.forEach(formation => {
                    schedule.push({
                        time: currentTime,
                        formation: formation
                    });
                    currentTime += interval;
                });
                break;
                
            case "burst":
                // 爆发生成
                formations.forEach(formation => {
                    schedule.push({
                        time: currentTime,
                        formation: formation
                    });
                });
                break;
                
            case "escalating":
                // 递增生成
                interval = 3000;
                formations.forEach((formation, index) => {
                    schedule.push({
                        time: currentTime,
                        formation: formation
                    });
                    interval *= 0.9; // 间隔递减
                    currentTime += interval;
                });
                break;
        }
        
        return schedule;
    }
}
```

### 9.4.2 动态难度调整

```javascript
DynamicDifficulty = {
    // 难度参数
    parameters: {
        baseEnemyHealth: 100,
        baseEnemyDamage: 10,
        baseEnemySpeed: 100,
        baseSpawnRate: 1.0,
        baseBulletSpeed: 200
    },
    
    // 难度计算
    calculateDifficulty: function(gameState) {
        // 基础难度
        baseDifficulty = gameState.currentLevel * 0.2;
        
        // 玩家表现调整
        performanceModifier = this.evaluatePlayerPerformance(gameState);
        
        // 时间因素
        timeModifier = Math.min(gameState.elapsedTime / 600, 1.0); // 10分钟达到峰值
        
        return baseDifficulty * (1 + performanceModifier) * (1 + timeModifier);
    },
    
    // 玩家表现评估
    evaluatePlayerPerformance: function(gameState) {
        score = 0;
        
        // 命中率评估
        if (gameState.player.accuracy > 0.8) score += 0.2;
        if (gameState.player.accuracy < 0.3) score -= 0.2;
        
        // 生命值评估
        healthRatio = gameState.player.health / gameState.player.maxHealth;
        if (healthRatio > 0.8) score += 0.15;
        if (healthRatio < 0.3) score -= 0.15;
        
        // 连续击杀评估
        if (gameState.player.killStreak > 10) score += 0.1;
        
        return Math.max(-0.3, Math.min(0.5, score));
    },
    
    // 应用难度调整
    applyDifficulty: function(enemy, difficulty) {
        enemy.health *= (1 + difficulty * 0.5);
        enemy.damage *= (1 + difficulty * 0.3);
        enemy.speed *= (1 + difficulty * 0.2);
        enemy.fireRate *= (1 + difficulty * 0.4);
        enemy.accuracy = Math.min(0.9, enemy.accuracy * (1 + difficulty * 0.3));
    }
}
```

### 9.4.3 特殊生成事件

```javascript
SpecialSpawnEvents = {
    // 事件类型
    events: {
        // 精英小队
        eliteSquad: {
            probability: 0.05,
            condition: "score > 10000",
            spawn: function() {
                return createEliteFormation(5, "interceptor");
            }
        },
        
        // 轰炸机编队
        bomberWing: {
            probability: 0.08,
            condition: "level % 3 === 0",
            spawn: function() {
                return createBomberFormation(3, "bomber", 2, "fighter");
            }
        },
        
        // 隐形突袭
        stealthAmbush: {
            probability: 0.03,
            condition: "playerKillStreak > 20",
            spawn: function() {
                positions = getSurroundPositions(player);
                return createStealthUnits(positions);
            }
        },
        
        // 指挥官出现
        commanderAppearance: {
            probability: 0.02,
            condition: "waveNumber > 10",
            spawn: function() {
                commander = createCommander();
                escorts = createEscortFormation(commander, 4);
                return [commander, ...escorts];
            }
        }
    },
    
    // 事件触发检查
    checkEvents: function(gameState) {
        triggeredEvents = [];
        
        this.events.forEach(event => {
            if (Math.random() < event.probability) {
                if (evaluateCondition(event.condition, gameState)) {
                    triggeredEvents.push(event);
                }
            }
        });
        
        return triggeredEvents;
    }
}
```

### 9.4.4 生成器优化策略

```javascript
SpawnOptimization = {
    // 对象池管理
    objectPool: {
        pools: new Map(),
        
        getEnemy: function(type) {
            if (!this.pools.has(type)) {
                this.pools.set(type, []);
            }
            
            pool = this.pools.get(type);
            if (pool.length > 0) {
                return pool.pop().reset();
            }
            
            return createNewEnemy(type);
        },
        
        returnEnemy: function(enemy) {
            enemy.cleanup();
            this.pools.get(enemy.type).push(enemy);
        }
    },
    
    // 生成限制
    spawnLimits: {
        maxActiveEnemies: 50,
        maxBulletsPerEnemy: 10,
        maxFormations: 5,
        
        canSpawn: function() {
            return activeEnemies.length < this.maxActiveEnemies;
        }
    },
    
    // 性能自适应
    performanceAdaptation: {
        targetFPS: 60,
        currentFPS: 60,
        
        adjustSpawnRate: function() {
            if (this.currentFPS < this.targetFPS * 0.8) {
                // 降低生成率
                spawnRate *= 0.9;
                maxEnemies = Math.max(20, maxEnemies - 5);
            } else if (this.currentFPS > this.targetFPS * 0.95) {
                // 恢复生成率
                spawnRate = Math.min(baseSpawnRate, spawnRate * 1.05);
                maxEnemies = Math.min(50, maxEnemies + 2);
            }
        }
    }
}
```

## 9.5 敌机状态管理

### 9.5.1 状态机实现

```javascript
EnemyStateMachine = {
    states: {
        SPAWNING: "spawning",       // 生成中
        ENTERING: "entering",       // 进场
        ACTIVE: "active",          // 活跃战斗
        FLEEING: "fleeing",        // 撤退
        DYING: "dying",            // 死亡动画
        DESTROYED: "destroyed"      // 已销毁
    },
    
    transitions: {
        spawning: ["entering"],
        entering: ["active", "dying"],
        active: ["fleeing", "dying"],
        fleeing: ["destroyed"],
        dying: ["destroyed"],
        destroyed: []
    },
    
    // 状态转换
    changeState: function(enemy, newState) {
        if (this.canTransition(enemy.state, newState)) {
            this.exitState(enemy, enemy.state);
            enemy.state = newState;
            this.enterState(enemy, newState);
        }
    },
    
    // 状态进入处理
    enterState: function(enemy, state) {
        switch(state) {
            case "spawning":
                enemy.visible = false;
                enemy.invulnerable = true;
                break;
            case "entering":
                enemy.visible = true;
                enemy.playAnimation("enter");
                break;
            case "active":
                enemy.invulnerable = false;
                enemy.enableAI();
                break;
            case "fleeing":
                enemy.disableWeapons();
                enemy.setFleeTarget();
                break;
            case "dying":
                enemy.invulnerable = true;
                enemy.playAnimation("explode");
                enemy.dropLoot();
                break;
        }
    }
}
```

### 9.5.2 伤害处理系统

```javascript
DamageSystem = {
    // 伤害计算
    calculateDamage: function(source, target) {
        baseDamage = source.damage;
        
        // 护甲减伤
        armorReduction = target.armor * 0.01;
        damage = baseDamage * (1 - armorReduction);
        
        // 护盾吸收
        if (target.shield > 0) {
            shieldAbsorb = Math.min(damage, target.shield);
            target.shield -= shieldAbsorb;
            damage -= shieldAbsorb;
        }
        
        // 暴击判定
        if (Math.random() < source.critChance) {
            damage *= source.critMultiplier;
            this.showCriticalHit(target);
        }
        
        return Math.floor(damage);
    },
    
    // 应用伤害
    applyDamage: function(target, damage, source) {
        target.health -= damage;
        
        // 显示伤害数字
        this.showDamageNumber(target, damage);
        
        // 触发受击效果
        target.onHit(source);
        
        // 检查死亡
        if (target.health <= 0) {
            this.handleDeath(target, source);
        }
    },
    
    // 死亡处理
    handleDeath: function(target, killer) {
        // 更新击杀者统计
        killer.kills++;
        killer.score += target.scoreValue;
        
        // 经验值奖励
        killer.gainExperience(target.experienceValue);
        
        // 触发死亡事件
        EventSystem.trigger("enemyDestroyed", {
            enemy: target,
            killer: killer
        });
        
        // 状态转换
        target.stateMachine.changeState(target, "dying");
    }
}
```

## 9.6 性能优化策略

### 9.6.1 空间分区优化

```javascript
SpatialPartitioning = {
    // 网格配置
    gridSize: 100,
    grid: {},
    
    // 添加到网格
    addToGrid: function(enemy) {
        cellX = Math.floor(enemy.x / this.gridSize);
        cellY = Math.floor(enemy.y / this.gridSize);
        key = cellX + "," + cellY;
        
        if (!this.grid[key]) {
            this.grid[key] = [];
        }
        
        this.grid[key].push(enemy);
        enemy.gridCell = key;
    },
    
    // 获取邻近敌机
    getNearbyEnemies: function(position, radius) {
        nearby = [];
        cellRadius = Math.ceil(radius / this.gridSize);
        centerX = Math.floor(position.x / this.gridSize);
        centerY = Math.floor(position.y / this.gridSize);
        
        for (dx = -cellRadius; dx <= cellRadius; dx++) {
            for (dy = -cellRadius; dy <= cellRadius; dy++) {
                key = (centerX + dx) + "," + (centerY + dy);
                if (this.grid[key]) {
                    nearby = nearby.concat(this.grid[key]);
                }
            }
        }
        
        return nearby;
    }
}
```

### 9.6.2 LOD系统

```javascript
LevelOfDetail = {
    // LOD级别定义
    levels: {
        HIGH: {distance: 200, updateRate: 1, renderDetail: "full"},
        MEDIUM: {distance: 400, updateRate: 2, renderDetail: "reduced"},
        LOW: {distance: 600, updateRate: 4, renderDetail: "minimal"},
        CULLED: {distance: Infinity, updateRate: 0, renderDetail: "none"}
    },
    
    // 更新LOD
    updateLOD: function(enemy, camera) {
        distance = calculateDistance(enemy, camera);
        
        for (level in this.levels) {
            if (distance < this.levels[level].distance) {
                enemy.lodLevel = level;
                enemy.updateRate = this.levels[level].updateRate;
                enemy.renderDetail = this.levels[level].renderDetail;
                break;
            }
        }
    }
}
```

## 章节总结

本章详细定义了敌机系统的完整架构，包括：

1. **敌机类型体系**：从轻型到精英的5个等级层次，每个等级都有独特的属性和行为特征
2. **AI行为系统**：基于行为树的智能决策，包含多种移动模式和攻击策略
3. **编队飞行逻辑**：支持多种编队类型，具备动态调整和协同作战能力
4. **生成器系统**：灵活的波次生成机制，支持动态难度调整和特殊事件
5. **优化策略**：对象池、空间分区、LOD等技术确保大量敌机时的性能

这套系统为游戏提供了丰富多样的战斗体验，通过合理的难度曲线和智能的敌机行为，确保玩家始终面临适度的挑战。