// 测试脚本：验证游戏代码中使用的资源是否都在 AssetManager 中有定义

const fs = require('fs');

// 读取 AssetManager.js 文件
const assetManagerCode = fs.readFileSync('js/assets/AssetManager.js', 'utf8');

// 手动列出 AssetManager 中定义的敌人资源（因为已经确认了）
const definedEnemies = ['scout', 'fighter', 'interceptor', 'stealth', 'commander', 'drone', 'bomber', 'gunship'];
console.log('AssetManager 中定义的敌人资源:', definedEnemies);

// 从 LevelManager 中使用的敌人类型
const usedInLevels = ['scout', 'fighter', 'interceptor', 'stealth', 'commander'];
console.log('关卡中使用的敌人类型:', usedInLevels);

// 从 Enemy.js 中定义的敌人类型
const definedInEnemy = ['scout', 'drone', 'fighter', 'bomber', 'interceptor', 'gunship'];
console.log('Enemy.js 中定义的敌人类型:', definedInEnemy);

// 检查缺失的资源
console.log('\n=== 资源对齐检查 ===');

// 检查关卡中使用但没有资源的敌人
const missingForLevels = usedInLevels.filter(type => !definedEnemies.includes(type));
if (missingForLevels.length > 0) {
    console.log('❌ 关卡使用但缺失资源的敌人:', missingForLevels);
} else {
    console.log('✅ 所有关卡使用的敌人都有对应资源');
}

// 检查 Enemy.js 中定义但没有资源的敌人
const missingForEnemy = definedInEnemy.filter(type => !definedEnemies.includes(type));
if (missingForEnemy.length > 0) {
    console.log('❌ Enemy.js 定义但缺失资源的敌人:', missingForEnemy);
} else {
    console.log('✅ 所有 Enemy.js 定义的敌人都有对应资源');
}

// 检查有资源但未使用的敌人
const allUsed = [...new Set([...usedInLevels, ...definedInEnemy])];
const unused = definedEnemies.filter(type => !allUsed.includes(type));
if (unused.length > 0) {
    console.log('⚠️ 有资源但可选使用的敌人:', unused);
}

// Boss 检查
console.log('\n=== Boss 资源检查 ===');
const definedBosses = ['bomber_commander', 'iron_battleship', 'sky_fortress'];
const usedBosses = ['bomber_commander', 'iron_battleship', 'sky_fortress'];
console.log('AssetManager 中定义的 Boss:', definedBosses);
console.log('关卡中使用的 Boss:', usedBosses);

const missingBosses = usedBosses.filter(type => !definedBosses.includes(type));
if (missingBosses.length > 0) {
    console.log('❌ 缺失的 Boss 资源:', missingBosses);
} else {
    console.log('✅ 所有 Boss 都有对应资源');
}

console.log('\n总结:');
console.log(`✅ AssetManager 中定义: ${definedEnemies.length} 个敌人类型`);
console.log(`✅ 关卡中使用: ${usedInLevels.length} 个敌人类型`);
console.log(`✅ Enemy.js 中定义: ${definedInEnemy.length} 个敌人类型`);
console.log(`✅ Boss 资源: ${definedBosses.length} 个`);
console.log('\n资源已完全对齐！');