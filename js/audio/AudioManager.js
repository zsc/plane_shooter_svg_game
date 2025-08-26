/**
 * 音频管理器
 * 管理游戏音乐和音效的播放
 */
class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.music = null;
        this.currentMusicName = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.5;
        this.muted = false;
        this.initialized = false;
        this.fadeInterval = null;
        this.fadeTimeout = null;
        
        // 音乐配置 - 使用新的管弦乐音轨
        this.musicConfig = {
            menu: { file: 'audio/main_menu.ogg', volume: 0.5, loop: true },
            level1: { file: 'audio/battle.ogg', volume: 0.4, loop: true },
            level2: { file: 'audio/battle.ogg', volume: 0.4, loop: true },
            level3: { file: 'audio/battle.ogg', volume: 0.4, loop: true },
            boss: { file: 'audio/boss.ogg', volume: 0.6, loop: true },
            victory: { file: 'audio/victory.ogg', volume: 0.5, loop: false },
            gameover: { file: 'audio/game_over.ogg', volume: 0.4, loop: false }
        };
        
        // 音效配置
        this.sfxConfig = {
            powerup: { file: 'audio/powerup.wav', volume: 0.3 },
            coin: { file: 'audio/coin.wav', volume: 0.2 },
            shoot: { file: 'audio/coin.wav', volume: 0.1 },  // 临时使用coin音效
            explosion: { file: 'audio/powerup.wav', volume: 0.2 },  // 临时使用powerup音效
            hit: { file: 'audio/coin.wav', volume: 0.15 }
        };
    }
    
    /**
     * 初始化音频系统
     */
    async init() {
        if (this.initialized) return;
        
        console.log('初始化音频管理器...');
        
        // 预加载所有音效
        for (const [name, config] of Object.entries(this.sfxConfig)) {
            try {
                const audio = new Audio(config.file);
                audio.volume = config.volume * this.sfxVolume;
                audio.preload = 'auto';
                this.sounds.set(name, {
                    audio: audio,
                    config: config
                });
            } catch (error) {
                console.warn(`无法加载音效: ${name}`, error);
            }
        }
        
        this.initialized = true;
        console.log('音频管理器初始化完成');
    }
    
    /**
     * 播放背景音乐
     */
    playMusic(musicName) {
        if (!this.musicConfig[musicName]) {
            console.warn(`未找到音乐: ${musicName}`);
            return;
        }
        
        // 如果正在播放相同的音乐，则忽略
        if (this.currentMusicName === musicName && this.music && !this.music.paused) {
            return;
        }
        
        // 停止当前音乐
        this.stopMusic();
        
        // 播放新音乐
        const config = this.musicConfig[musicName];
        try {
            this.music = new Audio(config.file);
            this.music.volume = config.volume * this.musicVolume * (this.muted ? 0 : 1);
            this.music.loop = config.loop;
            this.currentMusicName = musicName;
            
            // 添加加载完成事件
            this.music.addEventListener('canplaythrough', () => {
                if (this.music && this.currentMusicName === musicName) {
                    this.music.play().catch(error => {
                        console.warn(`无法播放音乐: ${musicName}`, error);
                    });
                }
            }, { once: true });
            
            // 添加错误处理
            this.music.addEventListener('error', (error) => {
                console.warn(`音乐加载失败: ${musicName}`, error);
                this.music = null;
                this.currentMusicName = null;
            }, { once: true });
            
            // 尝试加载音乐
            this.music.load();
        } catch (error) {
            console.warn(`创建音频失败: ${musicName}`, error);
            this.music = null;
            this.currentMusicName = null;
        }
    }
    
    /**
     * 停止背景音乐
     */
    stopMusic() {
        // 清除任何正在进行的淡入淡出
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;
        }
        
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
            this.music = null;
            this.currentMusicName = null;
        }
    }
    
    /**
     * 暂停背景音乐
     */
    pauseMusic() {
        if (this.music && !this.music.paused) {
            this.music.pause();
        }
    }
    
    /**
     * 恢复背景音乐
     */
    resumeMusic() {
        if (this.music && this.music.paused) {
            this.music.play().catch(error => {
                console.warn('无法恢复音乐播放', error);
            });
        }
    }
    
    /**
     * 播放音效
     */
    playSound(soundName) {
        if (this.muted) return;
        
        const soundData = this.sounds.get(soundName);
        if (!soundData) {
            console.warn(`未找到音效: ${soundName}`);
            return;
        }
        
        // 克隆音频以支持重叠播放
        const audio = soundData.audio.cloneNode();
        audio.volume = soundData.config.volume * this.sfxVolume;
        
        audio.play().catch(error => {
            // 忽略自动播放限制错误
            if (error.name !== 'NotAllowedError') {
                console.warn(`无法播放音效: ${soundName}`, error);
            }
        });
        
        // 播放完成后清理
        audio.addEventListener('ended', () => {
            audio.remove();
        });
    }
    
    /**
     * 设置音乐音量
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.musicConfig[this.currentMusicName].volume * 
                               this.musicVolume * (this.muted ? 0 : 1);
        }
    }
    
    /**
     * 设置音效音量
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * 切换静音
     */
    toggleMute() {
        this.muted = !this.muted;
        
        if (this.music) {
            if (this.muted) {
                this.music.volume = 0;
            } else {
                this.music.volume = this.musicConfig[this.currentMusicName].volume * 
                                   this.musicVolume;
            }
        }
        
        return this.muted;
    }
    
    /**
     * 淡入音乐
     */
    fadeInMusic(musicName, duration = 2000) {
        // 清除之前的淡入淡出
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }
        
        this.playMusic(musicName);
        
        if (!this.music) return;
        
        const targetVolume = this.musicConfig[musicName].volume * this.musicVolume;
        const steps = 20;
        const stepTime = duration / steps;
        const volumeStep = targetVolume / steps;
        
        this.music.volume = 0;
        let currentStep = 0;
        
        this.fadeInterval = setInterval(() => {
            currentStep++;
            if (!this.music) {
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
                return;
            }
            if (currentStep >= steps) {
                this.music.volume = targetVolume * (this.muted ? 0 : 1);
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
            } else {
                this.music.volume = volumeStep * currentStep * (this.muted ? 0 : 1);
            }
        }, stepTime);
    }
    
    /**
     * 淡出音乐
     */
    fadeOutMusic(duration = 2000) {
        if (!this.music || this.music.paused) return;
        
        // 清除之前的淡入淡出
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }
        
        const startVolume = this.music.volume;
        const steps = 20;
        const stepTime = duration / steps;
        const volumeStep = startVolume / steps;
        
        let currentStep = 0;
        
        this.fadeInterval = setInterval(() => {
            currentStep++;
            if (!this.music) {
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
                return;
            }
            if (currentStep >= steps) {
                this.stopMusic();
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
            } else {
                if (this.music) {
                    this.music.volume = startVolume - (volumeStep * currentStep);
                }
            }
        }, stepTime);
    }
    
    /**
     * 交叉淡化切换音乐
     */
    crossfadeMusic(newMusicName, duration = 1000) {
        if (!this.musicConfig[newMusicName]) return;
        
        // 如果是同一首音乐，不做处理
        if (this.currentMusicName === newMusicName && this.music && !this.music.paused) {
            return;
        }
        
        // 清除之前的超时
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;
        }
        
        // 如果没有当前音乐，直接淡入新音乐
        if (!this.music || this.music.paused) {
            this.fadeInMusic(newMusicName, duration);
            return;
        }
        
        // 淡出当前音乐
        this.fadeOutMusic(duration);
        
        // 淡入新音乐
        this.fadeTimeout = setTimeout(() => {
            if (this.currentMusicName !== newMusicName) {
                this.fadeInMusic(newMusicName, duration);
            }
            this.fadeTimeout = null;
        }, duration / 2);
    }
    
    /**
     * 根据游戏状态自动选择音乐
     */
    updateGameMusic(gameState) {
        let targetMusic = null;
        
        switch (gameState) {
            case 'menu':
                targetMusic = 'menu';
                break;
            case 'playing':
                // 根据关卡选择音乐
                if (window.game && window.game.levelManager) {
                    const levelIndex = window.game.levelManager.currentLevelIndex;
                    targetMusic = `level${levelIndex + 1}`;
                    if (!this.musicConfig[targetMusic]) {
                        targetMusic = 'level1';
                    }
                } else {
                    targetMusic = 'level1';
                }
                break;
            case 'boss':
                targetMusic = 'boss';
                break;
            case 'victory':
                targetMusic = 'victory';
                break;
            case 'gameover':
                targetMusic = 'gameover';
                break;
            case 'paused':
                this.pauseMusic();
                return;
            default:
                return;
        }
        
        if (targetMusic && targetMusic !== this.currentMusicName) {
            this.crossfadeMusic(targetMusic, 1000);
        } else if (gameState !== 'paused') {
            this.resumeMusic();
        }
    }
}

// 创建全局音频管理器实例
if (typeof window !== 'undefined') {
    window.audioManager = new AudioManager();
}