#!/usr/bin/env node

/**
 * Headless Boss战测试
 * 模拟完整的Boss战流程，不需要浏览器环境
 */

// 模拟浏览器环境
global.window = {
    addEventListener: () => {},
    audioManager: null
};

global.document = {
    getElementById: () => null,
    createElement: () => ({ getContext: () => null }),
    addEventListener: () => {}
};

global.Image = class {
    constructor() {}
};

// 模拟Canvas上下文
const mockContext = {
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    fillText: () => {},
    strokeText: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    drawImage: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    measureText: () => ({ width: 100 })
};

// 加载游戏配置
const GameConfig = {
    CANVAS: {
        WIDTH: 800,
        HEIGHT: 900
    },
    PLAYER: {
        INITIAL_X: 400,
        INITIAL_Y: 700,
        BASE_SPEED: 300,
        MAX_SPEED: 500,
        ACCELERATION: 1000,
        DECELERATION: 800,
        SIZE: {
            WIDTH: 40,
            HEIGHT: 50
        },
        HIT_BOX: {
            WIDTH: 30,
            HEIGHT: 40
        },
        BOUNDS: {
            MIN_X: 0,
            MAX_X: 800,
            MIN_Y: 0,
            MAX_Y: 900
        }
    },
    INPUT: {
        BUFFER_SIZE: 10,
        DEAD_ZONE: 0.15,
        SMOOTH_FACTOR: 0.1
    },
    RENDER: {
        SHOW_FPS: false
    }
};

global.GameConfig = GameConfig;

// 模拟必要的类
class MockRenderer {
    constructor() {
        this.ctx = mockContext;
        this.canvas = { width: 800, height: 900 };
    }
    
    clear() {}
    drawCircle() {}
    drawRect() {}
    drawText() {}
    drawLine() {}
    drawPolygon() {}
    setAlpha() {}
}

class MockInputManager {
    constructor() {
        this.keys = new Map();
        this.mouse = { x: 400, y: 700, buttons: new Map() };
    }
    
    update() {}
    isKeyDown() { return false; }
    isKeyPressed() { return false; }
    getMovementInput() { return { x: 0, y: 0 }; }
}

// 加载游戏类
const fs = require('fs');
const vm = require('vm');

function loadGameClass(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const script = new vm.Script(code);
    const context = vm.createContext({
        console,
        Math,
        Date,
        GameConfig,
        window: global.window,
        document: global.document,
        setTimeout,
        setInterval,
        clearTimeout,
        clearInterval
    });
    script.runInContext(context);
    return context;
}

// 加载所有必要的类
console.log('加载游戏类...');
const contexts = {};

// 按依赖顺序加载
const filesToLoad = [
    'js/boss/Boss.js',
    'js/boss/BossManager.js',
    'js/entities/Player.js',
    'js/combat/BulletSystem.js',
    'js/effects/ParticleSystem.js'
];

filesToLoad.forEach(file => {
    console.log(`加载 ${file}...`);
    const context = loadGameClass(file);
    // 提取类到全局
    Object.keys(context).forEach(key => {
        if (typeof context[key] === 'function') {
            global[key] = context[key];
        }
    });
});

// 创建测试环境
class BossTestEnvironment {
    constructor() {
        this.player = new Player();
        this.bossManager = new BossManager(this);
        this.bulletSystem = new BulletSystem();
        this.particleSystem = new ParticleSystem();
        this.renderer = new MockRenderer();
        
        // 初始化Boss管理器
        this.bossManager.init(
            (boss) => this.onBossSpawn(boss),
            () => this.onBossDefeat()
        );
        
        this.currentBoss = null;
        this.frameCount = 0;
        this.battleLog = [];
    }
    
    onBossSpawn(boss) {
        this.currentBoss = boss;
        this.log(`Boss生成: ${boss.name || boss.type}`);
        if (boss.startEntranceAnimation) {
            boss.startEntranceAnimation();
        }
    }
    
    onBossDefeat() {
        this.log('Boss被击败!');
    }
    
    log(message) {
        const timestamp = (this.frameCount * 16.67).toFixed(0);
        const logEntry = `[${timestamp}ms] ${message}`;
        this.battleLog.push(logEntry);
        console.log(logEntry);
    }
    
    simulateBattle(bossType, maxFrames = 3000) {
        console.log('\n=== 开始Boss战测试 ===\n');
        
        // 生成Boss
        this.bossManager.spawnBoss({
            type: bossType,
            health: 1000,
            phases: 3
        });
        
        if (!this.currentBoss) {
            console.error('Boss生成失败!');
            return;
        }
        
        // 模拟战斗循环
        for (let frame = 0; frame < maxFrames; frame++) {
            this.frameCount = frame;
            const dt = 0.01667; // 60 FPS
            
            // 每100帧打印状态
            if (frame % 100 === 0) {
                this.printStatus();
            }
            
            // 更新Boss
            if (this.currentBoss && this.currentBoss.active) {
                const bullets = this.currentBoss.update(dt, this.player, this.bulletSystem);
                
                // 记录Boss攻击
                if (bullets && bullets.length > 0) {
                    this.log(`Boss发射了 ${bullets.length} 发子弹`);
                }
            }
            
            // 模拟玩家攻击Boss (每20帧一次)
            if (frame % 20 === 0 && this.currentBoss && this.currentBoss.active) {
                const damage = 10;
                this.currentBoss.takeDamage(damage);
                
                if (frame % 100 === 0) {
                    this.log(`玩家对Boss造成 ${damage} 点伤害`);
                }
            }
            
            // 检查Boss是否死亡
            if (this.currentBoss && this.currentBoss.isDead) {
                this.log(`Boss在第 ${frame} 帧被击败!`);
                break;
            }
            
            // 更新其他系统
            this.bulletSystem.update(dt);
            this.particleSystem.update(dt);
        }
        
        console.log('\n=== 测试完成 ===\n');
        this.printFinalReport();
    }
    
    printStatus() {
        if (!this.currentBoss) return;
        
        console.log(`\n--- 状态更新 (帧 ${this.frameCount}) ---`);
        console.log(`Boss血量: ${this.currentBoss.health}/${this.currentBoss.maxHealth}`);
        console.log(`Boss阶段: ${this.currentBoss.currentPhase + 1}`);
        console.log(`Boss位置: (${Math.round(this.currentBoss.x)}, ${Math.round(this.currentBoss.y)})`);
        console.log(`活跃子弹: 玩家=${this.bulletSystem.bullets.length}, 敌人=${this.bulletSystem.enemyBullets.length}`);
        console.log(`活跃粒子: ${this.particleSystem.particles.length}`);
    }
    
    printFinalReport() {
        console.log('\n=== 战斗报告 ===');
        console.log(`总帧数: ${this.frameCount}`);
        console.log(`战斗时长: ${(this.frameCount * 16.67 / 1000).toFixed(2)} 秒`);
        
        if (this.currentBoss) {
            console.log(`Boss最终血量: ${this.currentBoss.health}`);
            console.log(`Boss状态: ${this.currentBoss.isDead ? '已击败' : '存活'}`);
        }
        
        // 统计日志
        const attackCount = this.battleLog.filter(log => log.includes('发射')).length;
        const damageCount = this.battleLog.filter(log => log.includes('伤害')).length;
        
        console.log(`\n统计数据:`);
        console.log(`- Boss攻击次数: ${attackCount}`);
        console.log(`- 玩家攻击次数: ${damageCount}`);
        console.log(`- 子弹系统统计: ${JSON.stringify(this.bulletSystem.getStats())}`);
        console.log(`- 粒子系统统计: ${JSON.stringify(this.particleSystem.getStats())}`);
    }
    
    testAllBosses() {
        const bosses = ['bomber_commander', 'iron_battleship', 'sky_fortress'];
        
        bosses.forEach((bossType, index) => {
            console.log(`\n\n========== 测试Boss ${index + 1}: ${bossType} ==========\n`);
            
            // 重置环境
            this.reset();
            
            // 运行测试
            this.simulateBattle(bossType, 1000); // 限制1000帧避免无限循环
        });
    }
    
    reset() {
        this.currentBoss = null;
        this.frameCount = 0;
        this.battleLog = [];
        this.bulletSystem.clear();
        this.particleSystem.clear();
        this.player.reset();
    }
}

// 运行测试
console.log('初始化测试环境...\n');
const testEnv = new BossTestEnvironment();

// 测试单个Boss
if (process.argv[2]) {
    // 如果提供了Boss类型参数，只测试该Boss
    testEnv.simulateBattle(process.argv[2]);
} else {
    // 否则测试所有Boss
    testEnv.testAllBosses();
}

console.log('\n测试脚本执行完成!');