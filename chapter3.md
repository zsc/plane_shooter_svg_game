# 第3章：输入系统

## 章节概述

输入系统是玩家与游戏交互的核心桥梁，负责捕获、处理和响应用户的操作指令。本章详细定义了全民飞机大战的输入系统架构，涵盖多种输入设备的支持、输入映射机制、响应优化策略等关键技术要素。系统设计目标是提供精准、流畅、低延迟的操控体验，同时确保跨平台兼容性。

## 3.1 系统架构概述

### 3.1.1 核心设计原则

#### 设备无关性
- **抽象输入层**：将具体设备输入转换为统一的游戏指令
- **多设备同时支持**：允许键盘、鼠标、触摸屏同时生效
- **热插拔支持**：运行时检测输入设备变化
- **优先级管理**：定义不同输入源的优先级顺序

#### 响应性要求
- **输入延迟**：< 1帧 (16.67ms @ 60FPS)
- **采样频率**：120Hz (高于渲染频率)
- **事件队列**：最大缓存32个输入事件
- **丢帧补偿**：保证关键输入不丢失

#### 可配置性
- **按键映射表**：JSON格式的配置文件
- **灵敏度调节**：支持玩家自定义响应曲线
- **死区设置**：虚拟摇杆和鼠标移动的死区配置
- **振动反馈**：支持手柄振动强度调节

### 3.1.2 输入管道流程

```
[物理输入] → [事件捕获] → [输入过滤] → [映射转换] → [缓冲队列] → [游戏逻辑]
     ↓            ↓            ↓            ↓            ↓            ↓
  原始信号    浏览器事件    去抖/去重    动作映射    帧同步缓存    执行响应
```

### 3.1.3 输入状态管理

#### 状态类型定义
```javascript
InputState = {
    pressed: boolean,      // 按下状态
    justPressed: boolean,  // 刚按下（当前帧）
    justReleased: boolean, // 刚释放（当前帧）
    holdTime: number,      // 持续按压时间(ms)
    repeatCount: number,   // 连击次数
    lastEventTime: number  // 最后事件时间戳
}
```

#### 输入动作枚举
```javascript
GameAction = {
    MOVE_LEFT: 'move_left',
    MOVE_RIGHT: 'move_right', 
    MOVE_UP: 'move_up',
    MOVE_DOWN: 'move_down',
    FIRE_PRIMARY: 'fire_primary',
    FIRE_SECONDARY: 'fire_secondary',
    USE_BOMB: 'use_bomb',
    PAUSE: 'pause',
    CONFIRM: 'confirm',
    CANCEL: 'cancel'
}
```

### 3.1.4 输入管理器接口

```javascript
class InputManager {
    // 初始化
    initialize(config: InputConfig): void
    
    // 设备管理
    registerDevice(device: InputDevice): void
    unregisterDevice(deviceId: string): void
    
    // 状态查询
    isActionActive(action: GameAction): boolean
    isActionJustPressed(action: GameAction): boolean
    isActionJustReleased(action: GameAction): boolean
    getActionHoldTime(action: GameAction): number
    
    // 映射配置
    setKeyMapping(action: GameAction, keys: KeyCode[]): void
    setMouseMapping(action: GameAction, button: MouseButton): void
    setTouchMapping(action: GameAction, zone: TouchZone): void
    
    // 更新循环
    update(deltaTime: number): void
    lateUpdate(): void
    
    // 事件处理
    handleEvent(event: InputEvent): void
    
    // 调试
    enableDebugMode(enabled: boolean): void
    getDebugInfo(): InputDebugInfo
}
```

## 3.2 键盘控制映射

### 3.2.1 默认键位配置

#### 主要操作键位
| 游戏动作 | 主键位 | 备用键位 | 说明 |
|---------|--------|---------|------|
| 向上移动 | W | ↑ | 战机向上飞行 |
| 向下移动 | S | ↓ | 战机向下飞行 |
| 向左移动 | A | ← | 战机向左飞行 |
| 向右移动 | D | → | 战机向右飞行 |
| 主武器开火 | J | Z | 发射主武器 |
| 副武器开火 | K | X | 发射副武器 |
| 使用炸弹 | L | C | 释放屏幕清除炸弹 |
| 游戏暂停 | ESC | P | 暂停/恢复游戏 |
| 确认选择 | Enter | Space | 菜单确认 |
| 取消/返回 | ESC | Backspace | 菜单返回 |

#### 调试快捷键
| 功能 | 按键 | 说明 |
|------|------|------|
| 显示碰撞框 | F1 | 切换碰撞体积显示 |
| 显示FPS | F2 | 切换性能监控面板 |
| 无敌模式 | F3 | 切换玩家无敌状态 |
| 跳关 | F4 | 直接进入下一关 |
| 满级武器 | F5 | 武器升至最高级 |

### 3.2.2 键盘事件处理

#### 事件监听注册
```javascript
KeyboardHandler = {
    // 事件类型
    eventTypes: ['keydown', 'keyup', 'keypress'],
    
    // 按键状态追踪
    keyStates: Map<KeyCode, KeyState>,
    
    // 事件处理
    handleKeyDown(event: KeyboardEvent): void,
    handleKeyUp(event: KeyboardEvent): void,
    
    // 防抖处理
    debounceThreshold: 50, // ms
    
    // 组合键检测
    detectCombos(): KeyCombo[],
    comboTimeout: 500 // ms
}
```

#### 按键状态机
```
[空闲] --keydown--> [按下] --hold--> [持续] --keyup--> [释放] --timeout--> [空闲]
                       ↓                  ↑
                    [重复] <--repeat------
```

### 3.2.3 键盘输入优化

#### 防误触机制
- **最小按压时间**：30ms (过滤意外触碰)
- **重复延迟**：初次500ms，后续100ms
- **同时按键限制**：最多6个键同时响应
- **冲突键处理**：对立方向键互斥

#### 输入预测
- **预输入缓存**：记录释放前50ms的输入
- **连招识别**：检测特定按键序列
- **方向修正**：8方向输入修正为精确角度

## 3.3 鼠标/触摸屏支持

### 3.3.1 鼠标控制方案

#### 控制模式
```javascript
MouseControlMode = {
    DIRECT: 'direct',       // 直接跟随：战机跟随鼠标位置
    RELATIVE: 'relative',   // 相对移动：鼠标移动控制战机速度
    HYBRID: 'hybrid'        // 混合模式：近距离直接，远距离相对
}
```

#### 鼠标映射配置
| 鼠标操作 | 游戏动作 | 说明 |
|---------|---------|------|
| 移动 | 控制战机位置 | 根据控制模式响应 |
| 左键按下 | 主武器开火 | 持续开火 |
| 右键按下 | 副武器开火 | 持续开火 |
| 中键点击 | 使用炸弹 | 单次触发 |
| 滚轮上 | 切换武器 | 向上切换 |
| 滚轮下 | 切换武器 | 向下切换 |

#### 鼠标灵敏度曲线
```javascript
SensitivityCurve = {
    linear: (input) => input * sensitivity,
    accelerated: (input) => Math.pow(input, 1.5) * sensitivity,
    decelerated: (input) => Math.sqrt(input) * sensitivity,
    custom: (input) => customCurveFunction(input) * sensitivity
}
```

### 3.3.2 触摸屏适配

#### 触摸手势识别
```javascript
TouchGesture = {
    TAP: 'tap',           // 点击
    DOUBLE_TAP: 'double_tap', // 双击
    HOLD: 'hold',         // 长按
    SWIPE: 'swipe',       // 滑动
    PINCH: 'pinch',       // 缩放
    DRAG: 'drag'          // 拖拽
}
```

#### 触摸区域划分
```javascript
TouchZones = {
    movement: {
        x: 0, y: screenHeight * 0.5,
        width: screenWidth * 0.5,
        height: screenHeight * 0.5,
        type: 'joystick'
    },
    fire: {
        x: screenWidth * 0.8, y: screenHeight * 0.7,
        width: 100, height: 100,
        type: 'button'
    },
    bomb: {
        x: screenWidth * 0.8, y: screenHeight * 0.5,
        width: 80, height: 80,
        type: 'button'
    }
}
```

### 3.3.3 多点触控处理

#### 触控点管理
```javascript
TouchPointManager = {
    maxTouchPoints: 10,
    activeTouches: Map<TouchId, TouchInfo>,
    
    // 触控点追踪
    trackTouch(touch: Touch): void,
    updateTouch(touch: Touch): void,
    releaseTouch(touchId: number): void,
    
    // 手势检测
    detectGesture(): TouchGesture | null,
    
    // 防抖处理
    minMoveDistance: 5, // 像素
    tapTimeout: 200 // ms
}
```

#### 触控响应优化
- **预测补偿**：根据移动速度预测下一帧位置
- **平滑过渡**：触控点跳跃时的插值处理
- **边缘处理**：屏幕边缘的触控响应优化
- **防误触**：忽略手掌等大面积接触

## 3.4 虚拟摇杆实现

### 3.4.1 摇杆组件结构

#### 视觉设计规范
```javascript
VirtualJoystick = {
    // 外观参数
    baseRadius: 80,        // 底座半径
    stickRadius: 30,       // 摇杆半径
    maxDistance: 60,       // 最大偏移距离
    
    // 颜色方案
    baseColor: 'rgba(255, 255, 255, 0.3)',
    stickColor: 'rgba(255, 255, 255, 0.6)',
    activeColor: 'rgba(100, 200, 255, 0.8)',
    
    // 位置配置
    position: { x: 100, y: screenHeight - 150 },
    anchor: 'bottom-left',
    
    // 响应区域
    responseRadius: 120,   // 响应半径
    deadZone: 0.15        // 死区比例
}
```

### 3.4.2 输入计算逻辑

#### 方向向量计算
```javascript
calculateDirection() {
    // 获取偏移量
    let offsetX = stickPosition.x - basePosition.x
    let offsetY = stickPosition.y - basePosition.y
    
    // 计算距离和角度
    let distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
    let angle = Math.atan2(offsetY, offsetX)
    
    // 应用死区
    if (distance < deadZone * maxDistance) {
        return { x: 0, y: 0, magnitude: 0 }
    }
    
    // 限制最大距离
    distance = Math.min(distance, maxDistance)
    
    // 归一化输出
    let magnitude = (distance - deadZone * maxDistance) / 
                   (maxDistance - deadZone * maxDistance)
    
    return {
        x: Math.cos(angle) * magnitude,
        y: Math.sin(angle) * magnitude,
        magnitude: magnitude,
        angle: angle
    }
}
```

### 3.4.3 动态响应特性

#### 自动回中
```javascript
AutoCenter = {
    enabled: true,
    speed: 0.2,        // 回中速度 (0-1)
    easing: 'easeOut', // 缓动函数
    delay: 0           // 延迟时间 ms
}
```

#### 振动反馈
```javascript
HapticFeedback = {
    supported: 'vibrate' in navigator,
    
    patterns: {
        move: [10],           // 移动振动
        boundary: [20, 10],   // 到达边界
        action: [30]          // 触发动作
    },
    
    trigger(pattern: string): void
}
```

## 3.5 输入缓冲与平滑处理

### 3.5.1 输入缓冲机制

#### 缓冲队列设计
```javascript
InputBuffer = {
    size: 32,                    // 队列大小
    queue: CircularBuffer<InputEvent>,
    
    // 事件入队
    enqueue(event: InputEvent): void {
        if (queue.isFull()) {
            queue.dequeue() // 移除最旧事件
        }
        event.timestamp = performance.now()
        queue.enqueue(event)
    },
    
    // 事件消费
    consume(): InputEvent[] {
        let events = []
        let currentTime = performance.now()
        
        while (!queue.isEmpty()) {
            let event = queue.peek()
            if (currentTime - event.timestamp < frameTime) {
                events.push(queue.dequeue())
            } else {
                break // 保留未来帧的事件
            }
        }
        return events
    }
}
```

### 3.5.2 输入插值算法

#### 位置平滑
```javascript
PositionSmoothing = {
    // 线性插值
    lerp(current: Vector2, target: Vector2, factor: number): Vector2 {
        return {
            x: current.x + (target.x - current.x) * factor,
            y: current.y + (target.y - current.y) * factor
        }
    },
    
    // 二次贝塞尔曲线
    quadraticBezier(p0: Vector2, p1: Vector2, p2: Vector2, t: number): Vector2 {
        let mt = 1 - t
        return {
            x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
            y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
        }
    },
    
    // 预测性平滑
    predictive(history: Vector2[], lookAhead: number): Vector2 {
        // 基于历史数据预测未来位置
        let velocity = calculateVelocity(history)
        let acceleration = calculateAcceleration(history)
        return extrapolate(history[history.length-1], velocity, acceleration, lookAhead)
    }
}
```

### 3.5.3 延迟补偿策略

#### 客户端预测
```javascript
ClientPrediction = {
    // 预测窗口
    predictionWindow: 100, // ms
    
    // 预测执行
    predict(input: InputState, deltaTime: number): GameState {
        let predicted = currentState.clone()
        predicted.simulate(input, deltaTime)
        return predicted
    },
    
    // 修正回滚
    reconcile(authoritative: GameState): void {
        let delta = authoritative.diff(predicted)
        if (delta.magnitude > threshold) {
            smoothCorrection(delta)
        }
    }
}
```

### 3.5.4 输入去抖动

#### 抖动过滤器
```javascript
JitterFilter = {
    // 移动平均
    movingAverage(values: number[], windowSize: number): number {
        let sum = values.slice(-windowSize).reduce((a, b) => a + b, 0)
        return sum / Math.min(values.length, windowSize)
    },
    
    // 卡尔曼滤波
    kalmanFilter: {
        x: 0,           // 状态估计
        P: 1,           // 估计协方差
        Q: 0.001,       // 过程噪声
        R: 0.1,         // 测量噪声
        
        update(measurement: number): number {
            // 预测
            let x_pred = this.x
            let P_pred = this.P + this.Q
            
            // 更新
            let K = P_pred / (P_pred + this.R)
            this.x = x_pred + K * (measurement - x_pred)
            this.P = (1 - K) * P_pred
            
            return this.x
        }
    }
}
```

## 3.6 性能优化建议

### 3.6.1 事件处理优化
- **事件委托**：使用单一监听器处理所有输入事件
- **节流控制**：限制高频事件的处理频率
- **批量处理**：累积多个输入事件一次性处理
- **早期退出**：优先检查最常用的输入

### 3.6.2 内存管理
- **对象池**：复用InputEvent对象避免GC
- **环形缓冲**：固定大小的缓冲区避免动态分配
- **延迟初始化**：按需创建输入设备处理器

### 3.6.3 响应优化
- **输入预测**：基于历史输入预测下一帧
- **并行处理**：输入处理与游戏逻辑并行执行
- **优先级队列**：重要输入优先处理

## 本章小结

输入系统作为玩家操控体验的基础，其设计质量直接影响游戏的可玩性。本章定义的输入系统架构通过多层抽象、智能缓冲、平滑处理等技术手段，确保了输入响应的及时性、准确性和流畅性。系统支持键盘、鼠标、触摸屏等多种输入方式，并通过虚拟摇杆等UI组件提供了移动端友好的操控方案。输入缓冲和预测机制有效降低了网络延迟和性能波动对操控体验的影响。