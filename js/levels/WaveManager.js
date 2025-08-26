/**
 * 波次管理器
 * 负责管理敌机生成波次、编队和时序
 */
class WaveManager {
    constructor() {
        // 波次状态
        this.currentWave = null;
        this.waveTimer = 0;
        this.waveActive = false;
        
        // 生成控制
        this.spawnTimer = 0;
        this.spawnInterval = 1000; // 默认生成间隔(ms)
        this.spawnedCount = 0;
        this.maxSpawnCount = 0;
        
        // 编队管理
        this.formations = this.defineFormations();
        this.currentFormation = null;
        this.formationIndex = 0;
        
        // 敌机池
        this.enemyPool = [];
        this.activeEnemies = [];
        
        // 回调
        this.onSpawnEnemy = null;
        this.onWaveComplete = null;
    }
    
    /**
     * 定义编队模式
     */
    defineFormations() {
        return {
            // 直线编队
            line: {
                name: '直线进攻',
                pattern: (index, total) => ({
                    x: GameConfig.CANVAS.WIDTH / (total + 1) * (index + 1),
                    y: -50,
                    vx: 0,
                    vy: 150
                })
            },
            
            // V字编队
            v_formation: {
                name: 'V字编队',
                pattern: (index, total) => {
                    const centerX = GameConfig.CANVAS.WIDTH / 2;
                    const spread = 50;
                    const row = Math.floor(index / 2);
                    const side = index % 2 === 0 ? -1 : 1;
                    
                    return {
                        x: centerX + side * spread * (Math.floor(index / 2) + 1),
                        y: -50 - row * 40,
                        vx: 0,
                        vy: 120
                    };
                }
            },
            
            // 环绕编队
            surround: {
                name: '环绕包围',
                pattern: (index, total) => {
                    const side = index < total / 2 ? 'left' : 'right';
                    const x = side === 'left' ? -30 : GameConfig.CANVAS.WIDTH + 30;
                    const targetX = side === 'left' ? 100 : GameConfig.CANVAS.WIDTH - 100;
                    
                    return {
                        x: x,
                        y: 100 + (index % (total / 2)) * 60,
                        vx: side === 'left' ? 100 : -100,
                        vy: 50,
                        targetX: targetX
                    };
                }
            },
            
            // 螺旋编队
            spiral: {
                name: '螺旋突进',
                pattern: (index, total) => {
                    const angle = (index / total) * Math.PI * 2;
                    const radius = 100;
                    const centerX = GameConfig.CANVAS.WIDTH / 2;
                    
                    return {
                        x: centerX + Math.cos(angle) * radius,
                        y: -50,
                        vx: Math.cos(angle) * 50,
                        vy: 150,
                        behavior: 'spiral'
                    };
                }
            },
            
            // 波浪编队
            wave: {
                name: '波浪进攻',
                pattern: (index, total) => ({
                    x: GameConfig.CANVAS.WIDTH / (total + 1) * (index + 1),
                    y: -50,
                    vx: 0,
                    vy: 100,
                    behavior: 'sine',
                    amplitude: 100,
                    frequency: 0.02
                })
            },
            
            // 钳形编队
            pincer: {
                name: '钳形攻势',
                pattern: (index, total) => {
                    const group = Math.floor(index / (total / 2));
                    const side = group === 0 ? 'left' : 'right';
                    const offset = index % (total / 2);
                    
                    return {
                        x: side === 'left' ? -30 - offset * 30 : GameConfig.CANVAS.WIDTH + 30 + offset * 30,
                        y: 200,
                        vx: side === 'left' ? 150 : -150,
                        vy: 50
                    };
                }
            },
            
            // 混合编队
            mixed: {
                name: '混合编队',
                pattern: (index, total) => {
                    const formations = ['line', 'v_formation', 'wave'];
                    const formationType = formations[index % formations.length];
                    return this.formations[formationType].pattern(index, total);
                }
            },
            
            // 随机编队
            chaos: {
                name: '混沌乱流',
                pattern: (index, total) => ({
                    x: Math.random() * GameConfig.CANVAS.WIDTH,
                    y: -50 - Math.random() * 100,
                    vx: (Math.random() - 0.5) * 100,
                    vy: 100 + Math.random() * 100,
                    behavior: 'random'
                })
            }
        };
    }
    
    /**
     * 初始化
     */
    init(onSpawnEnemy, onWaveComplete) {
        this.onSpawnEnemy = onSpawnEnemy;
        this.onWaveComplete = onWaveComplete;
        console.log('波次管理器初始化完成');
    }
    
    /**
     * 开始新波次
     */
    startWave(waveData) {
        this.currentWave = waveData;
        this.waveActive = true;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.spawnedCount = 0;
        
        // 计算生成参数
        this.spawnInterval = 1000 / (waveData.spawnRate || 2); // 转换为毫秒间隔
        this.maxSpawnCount = Math.floor(waveData.duration * waveData.spawnRate);
        
        // 设置编队
        this.currentFormation = this.formations[waveData.formation] || this.formations.line;
        this.formationIndex = 0;
        
        console.log(`开始波次: ${waveData.type}, 编队: ${waveData.formation}, 生成率: ${waveData.spawnRate}/秒`);
    }
    
    /**
     * 更新波次
     */
    update(deltaTime) {
        if (!this.waveActive || !this.currentWave) return;
        
        // 更新计时器
        this.waveTimer += deltaTime;
        this.spawnTimer += deltaTime * 1000; // 转换为毫秒
        
        // 检查是否生成新敌机
        if (this.spawnTimer >= this.spawnInterval && this.spawnedCount < this.maxSpawnCount) {
            this.spawnEnemies();
            this.spawnTimer = 0;
        }
        
        // 检查波次是否结束
        if (this.waveTimer >= this.currentWave.duration) {
            this.endWave();
        }
    }
    
    /**
     * 生成敌机
     */
    spawnEnemies() {
        const enemyTypes = this.currentWave.enemyTypes || ['scout'];
        const formationSize = Math.min(3 + Math.floor(this.currentWave.difficulty || 1), 8);
        
        // 根据编队生成敌机
        for (let i = 0; i < formationSize && this.spawnedCount < this.maxSpawnCount; i++) {
            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const position = this.currentFormation.pattern(i, formationSize);
            
            // 创建敌机数据
            const enemyData = {
                type: enemyType,
                x: position.x,
                y: position.y,
                vx: position.vx || 0,
                vy: position.vy || 100,
                behavior: position.behavior || 'linear',
                targetX: position.targetX,
                amplitude: position.amplitude,
                frequency: position.frequency,
                health: this.calculateEnemyHealth(enemyType),
                damage: this.calculateEnemyDamage(enemyType),
                score: this.calculateEnemyScore(enemyType)
            };
            
            // 触发生成回调
            if (this.onSpawnEnemy) {
                this.onSpawnEnemy(enemyData);
            }
            
            this.spawnedCount++;
        }
        
        this.formationIndex++;
    }
    
    /**
     * 计算敌机血量
     */
    calculateEnemyHealth(type) {
        const baseHealth = {
            scout: 20,
            drone: 30,
            fighter: 50,
            bomber: 80,
            heavy: 100,
            elite: 150,
            fortress: 200,
            carrier: 300,
            destroyer: 250,
            submarine: 180,
            seaplane: 60,
            interceptor: 70
        };
        
        const health = baseHealth[type] || 50;
        const difficulty = this.currentWave.difficulty || 1;
        
        return Math.floor(health * difficulty);
    }
    
    /**
     * 计算敌机伤害
     */
    calculateEnemyDamage(type) {
        const baseDamage = {
            scout: 5,
            drone: 8,
            fighter: 10,
            bomber: 15,
            heavy: 20,
            elite: 25,
            fortress: 30,
            carrier: 35,
            destroyer: 40,
            submarine: 25,
            seaplane: 12,
            interceptor: 15
        };
        
        const damage = baseDamage[type] || 10;
        const difficulty = this.currentWave.difficulty || 1;
        
        return Math.floor(damage * difficulty);
    }
    
    /**
     * 计算敌机分数
     */
    calculateEnemyScore(type) {
        const baseScore = {
            scout: 100,
            drone: 150,
            fighter: 200,
            bomber: 300,
            heavy: 400,
            elite: 500,
            fortress: 800,
            carrier: 1000,
            destroyer: 900,
            submarine: 600,
            seaplane: 250,
            interceptor: 350
        };
        
        return baseScore[type] || 100;
    }
    
    /**
     * 结束波次
     */
    endWave() {
        console.log(`波次结束: 生成了 ${this.spawnedCount} 个敌机`);
        
        this.waveActive = false;
        this.currentWave = null;
        
        // 触发完成回调
        if (this.onWaveComplete) {
            this.onWaveComplete();
        }
    }
    
    /**
     * 获取波次状态
     */
    getWaveStatus() {
        if (!this.currentWave) return null;
        
        return {
            active: this.waveActive,
            type: this.currentWave.type,
            progress: this.waveTimer / this.currentWave.duration,
            spawnedCount: this.spawnedCount,
            totalCount: this.maxSpawnCount
        };
    }
    
    /**
     * 停止当前波次
     */
    stopWave() {
        this.waveActive = false;
        this.currentWave = null;
        console.log('波次已停止');
    }
    
    /**
     * 重置
     */
    reset() {
        this.currentWave = null;
        this.waveActive = false;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.spawnedCount = 0;
        this.maxSpawnCount = 0;
        this.formationIndex = 0;
    }
}