# 第6章：游戏状态机

## 概述

游戏状态机是整个游戏架构的核心组件，负责管理游戏的不同状态（如主菜单、游戏中、暂停、游戏结束等）之间的切换和数据流转。本章详细定义状态管理框架、场景转换系统、存档读档机制以及暂停恢复功能的技术规范。

## 6.1 状态管理框架

### 6.1.1 核心状态定义

游戏包含以下主要状态：

#### 基础状态枚举
```
GameState {
  BOOT        // 引导加载状态
  LOADING     // 资源加载状态
  MAIN_MENU   // 主菜单状态
  GAME_PLAY   // 游戏进行状态
  PAUSED      // 游戏暂停状态
  GAME_OVER   // 游戏结束状态
  VICTORY     // 胜利状态
  SETTINGS    // 设置菜单状态
  LEADERBOARD // 排行榜状态
  SHOP        // 商店状态
}
```

### 6.1.2 状态机架构

#### 状态基类规范
每个状态必须实现以下接口：

```
StateInterface {
  onEnter(previousState, params)  // 进入状态时调用
  onUpdate(deltaTime)              // 每帧更新调用
  onRender(renderer)               // 渲染调用
  onExit(nextState)                // 离开状态时调用
  handleInput(input)               // 处理输入
  canTransitionTo(targetState)     // 检查是否可转换到目标状态
}
```

#### 状态管理器规范
```
StateManager {
  currentState       // 当前激活状态
  previousState      // 上一个状态
  stateStack[]       // 状态栈（支持状态叠加）
  transitions{}      // 状态转换规则表
  stateHistory[]     // 状态历史记录（用于回退）
  
  方法：
  - changeState(newState, params)
  - pushState(state)              // 压栈新状态
  - popState()                     // 弹出栈顶状态
  - hasState(state)               
  - registerTransition(from, to, condition)
  - validateTransition(from, to)
}
```

### 6.1.3 状态转换规则

#### 合法状态转换矩阵
| 当前状态 | 可转换至 |
|---------|---------|
| BOOT | LOADING |
| LOADING | MAIN_MENU, GAME_PLAY (快速开始) |
| MAIN_MENU | GAME_PLAY, SETTINGS, LEADERBOARD, SHOP |
| GAME_PLAY | PAUSED, GAME_OVER, VICTORY |
| PAUSED | GAME_PLAY, MAIN_MENU, SETTINGS |
| GAME_OVER | MAIN_MENU, GAME_PLAY (重试), LEADERBOARD |
| VICTORY | MAIN_MENU, GAME_PLAY (下一关), SHOP |
| SETTINGS | (返回上一状态) |
| LEADERBOARD | MAIN_MENU |
| SHOP | MAIN_MENU, GAME_PLAY |

#### 转换条件定义
```
TransitionConditions {
  RESOURCES_LOADED     // 资源加载完成
  GAME_START_PRESSED   // 开始游戏按钮
  PAUSE_TRIGGERED      // 暂停触发
  PLAYER_DIED          // 玩家死亡
  LEVEL_COMPLETED      // 关卡完成
  MENU_REQUESTED       // 返回菜单请求
  CONTINUE_PRESSED     // 继续游戏
}
```

### 6.1.4 状态数据管理

#### 状态上下文
```
StateContext {
  globalData {         // 全局共享数据
    playerProfile      // 玩家档案
    gameSettings       // 游戏设置
    achievementData    // 成就数据
    unlockedContent    // 已解锁内容
  }
  
  stateData {          // 状态私有数据
    currentLevel       // 当前关卡
    playerScore        // 玩家分数
    enemiesDefeated    // 击败敌机数
    powerUps[]         // 当前强化
    checkpointData     // 检查点数据
  }
  
  transientData {      // 临时数据（状态切换时清除）
    animationStates    // 动画状态
    particleEffects    // 粒子效果
    audioInstances     // 音频实例
  }
}
```

## 6.2 场景转换系统

### 6.2.1 场景定义

#### 场景类型
```
SceneType {
  MENU_SCENE      // 菜单场景
  GAME_SCENE      // 游戏场景
  CUTSCENE        // 过场动画场景
  LOADING_SCENE   // 加载场景
}
```

#### 场景组件
```
Scene {
  sceneId           // 场景唯一标识
  sceneType         // 场景类型
  requiredAssets[]  // 必需资源列表
  layers[]          // 渲染层级
  entities[]        // 场景实体
  cameras[]         // 相机配置
  lighting          // 光照设置
  backgroundMusic   // 背景音乐
  
  方法：
  - preload()       // 预加载资源
  - create()        // 创建场景
  - update(dt)      // 更新逻辑
  - render()        // 渲染场景
  - destroy()       // 销毁场景
}
```

### 6.2.2 转场效果

#### 转场类型定义
```
TransitionType {
  FADE_BLACK       // 淡入黑屏
  FADE_WHITE       // 淡入白屏
  SLIDE_LEFT       // 向左滑动
  SLIDE_RIGHT      // 向右滑动
  SLIDE_UP         // 向上滑动
  SLIDE_DOWN       // 向下滑动
  IRIS_IN          // 圆形收缩
  IRIS_OUT         // 圆形展开
  PIXELATE         // 像素化
  CROSSFADE        // 交叉淡化
  CURTAIN          // 幕布效果
  FLIP             // 翻转效果
}
```

#### 转场参数
```
TransitionParams {
  type              // 转场类型
  duration          // 持续时间（毫秒）
  easing            // 缓动函数
  color             // 转场颜色（淡入淡出用）
  direction         // 方向（滑动用）
  customShader      // 自定义着色器（高级效果）
}
```

### 6.2.3 场景管理器

```
SceneManager {
  activeScene       // 当前活动场景
  loadingScene      // 加载场景
  sceneQueue[]      // 场景队列
  transitions{}     // 转场效果配置
  
  方法：
  - loadScene(sceneId, transition)
  - unloadScene(sceneId)
  - switchScene(fromId, toId, transition)
  - preloadScene(sceneId)
  - getSceneProgress()
  - addTransition(from, to, effect)
}
```

### 6.2.4 异步加载策略

#### 资源优先级
```
LoadPriority {
  CRITICAL = 0    // 关键资源（必须同步加载）
  HIGH = 1        // 高优先级（优先加载）
  NORMAL = 2      // 普通优先级
  LOW = 3         // 低优先级（延迟加载）
  LAZY = 4        // 懒加载（需要时加载）
}
```

#### 加载进度管理
```
LoadingManager {
  totalAssets       // 总资源数
  loadedAssets      // 已加载数
  currentProgress   // 当前进度(0-100)
  loadingQueue[]    // 加载队列
  errorQueue[]      // 错误队列
  
  回调：
  - onProgress(percent, currentFile)
  - onComplete()
  - onError(file, error)
  - onTimeout(file)
}
```

## 6.3 存档与读档系统

### 6.3.1 存档数据结构

#### 玩家存档
```
SaveGame {
  metadata {
    saveId          // 存档唯一ID
    version         // 存档版本
    timestamp       // 保存时间戳
    playTime        // 游戏时长
    thumbnail       // 缩略图（base64）
  }
  
  playerData {
    level           // 玩家等级
    experience      // 经验值
    currency        // 游戏币
    highScore       // 最高分
    totalScore      // 总分数
  }
  
  progression {
    currentLevel    // 当前关卡
    completedLevels[] // 已完成关卡
    unlockedLevels[] // 已解锁关卡
    checkpoints[]   // 检查点数据
    bossesDefeated[] // 已击败Boss
  }
  
  inventory {
    weapons[]       // 拥有武器
    upgrades[]      // 升级项
    powerups[]      // 道具
    skins[]         // 皮肤
  }
  
  statistics {
    enemiesKilled   // 击杀敌机数
    bulletsShot     // 发射子弹数
    damageTaken     // 受到伤害
    distanceTraveled // 飞行距离
    powerupsCollected // 收集道具数
  }
  
  achievements[]    // 成就列表
  settings{}        // 个人设置
}
```

### 6.3.2 存储策略

#### 存储位置
```
StorageType {
  LOCAL_STORAGE   // 浏览器本地存储
  SESSION_STORAGE // 会话存储
  INDEXED_DB      // IndexedDB数据库
  CLOUD_SAVE      // 云存档
  FILE_SYSTEM     // 本地文件（需授权）
}
```

#### 存档管理器
```
SaveManager {
  maxSaveSlots = 3       // 最大存档槽位
  autoSaveInterval = 60  // 自动保存间隔（秒）
  currentSlot           // 当前存档槽
  
  方法：
  - save(slot, data)
  - load(slot)
  - delete(slot)
  - exists(slot)
  - getSaveInfo(slot)
  - autoSave()
  - quickSave()
  - quickLoad()
  - exportSave(slot)
  - importSave(data)
  - validateSave(data)
  - migrateSave(oldVersion, newVersion)
}
```

### 6.3.3 数据压缩与加密

#### 压缩策略
```
CompressionConfig {
  enabled: true
  algorithm: "LZ4"      // LZ4, GZIP, ZLIB
  level: 6              // 压缩级别 1-9
  threshold: 1024       // 压缩阈值（字节）
}
```

#### 加密配置
```
EncryptionConfig {
  enabled: true
  algorithm: "AES-256"
  key: (动态生成)
  iv: (随机初始向量)
  saltRounds: 10
}
```

### 6.3.4 存档完整性

#### 校验机制
```
SaveValidation {
  checksum         // CRC32校验和
  hash             // SHA-256哈希
  signature        // 数字签名
  version          // 版本号
  
  验证流程：
  1. 检查文件完整性
  2. 验证版本兼容性
  3. 校验数据结构
  4. 验证数值范围
  5. 检测异常数据
}
```

## 6.4 暂停/恢复机制

### 6.4.1 暂停类型

```
PauseType {
  MANUAL_PAUSE     // 手动暂停（玩家触发）
  AUTO_PAUSE       // 自动暂停（失去焦点）
  SYSTEM_PAUSE     // 系统暂停（对话框、菜单）
  NETWORK_PAUSE    // 网络暂停（断线重连）
  DEBUG_PAUSE      // 调试暂停
}
```

### 6.4.2 暂停状态管理

#### 暂停控制器
```
PauseController {
  isPaused          // 暂停状态
  pauseType         // 暂停类型
  pauseTime         // 暂停时间戳
  pauseDuration     // 暂停持续时间
  pauseStack[]      // 暂停请求栈
  
  方法：
  - pause(type, source)
  - resume(source)
  - togglePause()
  - isPausedBy(source)
  - getPauseReason()
  - canResume()
}
```

#### 暂停时保存的状态
```
PausedState {
  gameTime         // 游戏时间
  entityStates[]   // 实体状态快照
  animationStates[] // 动画状态
  audioStates[]    // 音频状态
  particleStates[] // 粒子状态
  timerStates[]    // 计时器状态
  inputBuffer[]    // 输入缓冲
}
```

### 6.4.3 恢复策略

#### 恢复流程
```
ResumeProcess {
  1. 验证恢复条件
  2. 恢复音频播放
  3. 重置时间系统
  4. 恢复动画状态
  5. 清空输入缓冲
  6. 触发恢复事件
  7. 显示倒计时（可选）
}
```

#### 时间补偿
```
TimeCompensation {
  compensationType {
    SKIP         // 跳过暂停时间
    SIMULATE     // 模拟暂停期间逻辑
    INTERPOLATE  // 插值过渡
    RESET        // 重置时间
  }
  
  maxCompensation: 5000  // 最大补偿时间（毫秒）
  simulationStep: 16     // 模拟步长（毫秒）
}
```

### 6.4.4 暂停界面

#### UI配置
```
PauseUI {
  overlay {
    opacity: 0.7
    color: "#000000"
    blur: true
    blurAmount: 5
  }
  
  menu {
    继续游戏
    重新开始
    游戏设置
    返回主菜单
    退出游戏
  }
  
  显示信息 {
    当前分数
    游戏时间
    当前关卡
    生命值
  }
}
```

---

*本章定义了游戏状态机的完整技术规范，包括状态管理、场景转换、存档系统和暂停机制。这些系统共同确保游戏流程的平滑运行和良好的用户体验。*