#!/usr/bin/env node

/**
 * 简化版Boss战Headless测试
 * 直接导入并测试核心Boss逻辑
 */

const fs = require('fs');
const path = require('path');

// 模拟浏览器全局对象
global.GameConfig = {
    CANVAS: {
        WIDTH: 800,
        HEIGHT: 900
    },
    PLAYER: {
        INITIAL_X: 400,
        INITIAL_Y: 700
    }
};

global.window = { 
    audioManager: null 
};

global.document = {};

// 加载并执行JS文件
function loadClass(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    eval(code);
}

// 加载必要的类
console.log('加载游戏类...');
loadClass('js/boss/Boss.js');
loadClass('js/boss/BossManager.js');

// 简单的测试类
class SimpleBossTest {
    constructor() {
        this.player = {
            x: 400,
            y: 700,
            health: 100,
            active: true
        };
        
        this.game = {
            player: this.player
        };
    }
    
    testBossCreation() {
        console.log('\n=== 测试Boss创建 ===\n');
        
        const bossManager = new BossManager(this.game);
        
        // 测试Boss模板
        console.log('可用的Boss模板:');
        const templates = bossManager.bossTemplates;
        Object.keys(templates).forEach(key => {
            const template = templates[key];
            console.log(`- ${key}: ${template.name} (血量: ${template.maxHealth})`);
        });
        
        // 测试创建各个Boss
        console.log('\n测试Boss生成:');
        
        ['bomber_commander', 'iron_battleship', 'sky_fortress'].forEach(bossType => {
            console.log(`\n创建 ${bossType}...`);
            
            bossManager.spawnBoss({
                type: bossType,
                health: 1000,
                phases: 3
            });
            
            if (bossManager.currentBoss) {
                const boss = bossManager.currentBoss;
                console.log(`✓ 成功创建: ${boss.name}`);
                console.log(`  - 血量: ${boss.health}/${boss.maxHealth}`);
                console.log(`  - 位置: (${boss.x}, ${boss.y})`);
                console.log(`  - 阶段: ${boss.currentPhase + 1}/${boss.phases.length}`);
                console.log(`  - 激活: ${boss.active}`);
                console.log(`  - 入场中: ${boss.isEntering}`);
                
                // 测试入场动画
                if (boss.startEntranceAnimation) {
                    boss.startEntranceAnimation();
                    console.log(`  - 入场动画已启动`);
                }
            } else {
                console.log(`✗ 创建失败`);
            }
        });
    }
    
    testBossBattle() {
        console.log('\n\n=== 测试Boss战斗 ===\n');
        
        const bossManager = new BossManager(this.game);
        
        // 创建一个Boss
        bossManager.spawnBoss('bomber_commander');
        const boss = bossManager.currentBoss;
        
        if (!boss) {
            console.log('Boss创建失败，无法测试战斗');
            return;
        }
        
        console.log(`开始战斗: ${boss.name}`);
        console.log(`初始血量: ${boss.health}`);
        
        // 模拟几轮攻击
        for (let i = 0; i < 5; i++) {
            console.log(`\n--- 第 ${i + 1} 轮攻击 ---`);
            
            // Boss更新
            const dt = 0.016; // 60 FPS
            const bullets = boss.update(dt, this.player);
            
            if (bullets && bullets.length > 0) {
                console.log(`Boss发射了 ${bullets.length} 发子弹`);
            }
            
            // 对Boss造成伤害
            const damage = 100;
            boss.takeDamage(damage);
            console.log(`对Boss造成 ${damage} 点伤害`);
            console.log(`Boss当前血量: ${boss.health}/${boss.maxHealth}`);
            console.log(`Boss当前阶段: ${boss.currentPhase + 1}`);
            
            // 检查阶段转换
            if (boss.phaseTransition) {
                console.log('>>> Boss进入阶段转换!');
            }
            
            // 检查死亡
            if (boss.isDead) {
                console.log('\n🎉 Boss被击败!');
                const result = boss.die();
                console.log('掉落奖励:', result);
                break;
            }
        }
    }
    
    testBossPhases() {
        console.log('\n\n=== 测试Boss阶段系统 ===\n');
        
        const boss = new Boss({
            name: '测试Boss',
            maxHealth: 1000
        });
        
        console.log('Boss阶段信息:');
        boss.phases.forEach((phase, index) => {
            console.log(`阶段 ${index + 1}:`);
            console.log(`  - 血量阈值: ${phase.healthThreshold * 100}%`);
            console.log(`  - 攻击间隔: ${phase.attackInterval}ms`);
            console.log(`  - 移动模式: ${phase.movePattern}`);
            console.log(`  - 攻击模式: ${phase.attacks.join(', ')}`);
        });
        
        // 测试阶段转换
        console.log('\n测试阶段转换:');
        boss.health = 500; // 50%血量
        boss.checkPhaseTransition();
        console.log(`50%血量时阶段: ${boss.currentPhase + 1}`);
        
        boss.health = 200; // 20%血量
        boss.checkPhaseTransition();
        console.log(`20%血量时阶段: ${boss.currentPhase + 1}`);
    }
    
    testBossAttacks() {
        console.log('\n\n=== 测试Boss攻击模式 ===\n');
        
        const boss = new Boss({
            name: '测试Boss'
        });
        
        const attackTypes = [
            'straightShot',
            'fanShot',
            'circularBarrage',
            'homingMissile',
            'laserSweep',
            'missileVolley'
        ];
        
        console.log('测试各种攻击模式:');
        attackTypes.forEach(attackType => {
            console.log(`\n${attackType}:`);
            const bullets = boss.executeAttack(attackType, this.player);
            if (bullets && bullets.length > 0) {
                console.log(`  - 生成 ${bullets.length} 发子弹`);
                const sample = bullets[0];
                console.log(`  - 子弹属性: 伤害=${sample.damage}, 速度=${Math.sqrt(sample.vx*sample.vx + sample.vy*sample.vy).toFixed(0)}`);
            } else {
                console.log('  - 无子弹生成');
            }
        });
    }
}

// 运行测试
console.log('===== Boss系统Headless测试 =====\n');

const test = new SimpleBossTest();

try {
    test.testBossCreation();
    test.testBossBattle();
    test.testBossPhases();
    test.testBossAttacks();
    
    console.log('\n\n✅ 所有测试完成!');
} catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
}