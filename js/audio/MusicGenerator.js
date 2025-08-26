/**
 * ABC记谱法音乐生成器
 * 使用Web Audio API合成游戏音乐
 */
class MusicGenerator {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        
        // ABC音符到频率映射
        this.noteFrequencies = this.generateNoteFrequencies();
        
        // 音乐模板
        this.musicTemplates = {
            menu: {
                abc: `X:1
T:Menu Theme
M:4/4
L:1/8
Q:1/4=120
K:C
|: G2 E2 C2 E2 | G2 c2 G2 E2 | F2 A2 F2 D2 | G4 G4 :|
|: c2 e2 g2 e2 | d2 f2 a2 f2 | e2 g2 c'2 g2 | f4 e4 :|`,
                tempo: 120,
                loop: true,
                duration: 32
            },
            
            level1: {
                abc: `X:2
T:Level 1 Battle
M:4/4
L:1/16
Q:1/4=140
K:Am
|: A2A2 E2E2 A2c2 B2A2 | G2G2 D2D2 G2B2 A2G2 |
   F2F2 C2C2 F2A2 G2F2 | E2E2 B,2B,2 E4 E4 :|
|: c2c2 A2A2 c2e2 d2c2 | B2B2 G2G2 B2d2 c2B2 |
   A2A2 F2F2 A2c2 B2A2 | G2G2 E2E2 A4 A4 :|`,
                tempo: 140,
                loop: true,
                duration: 60
            },
            
            level2: {
                abc: `X:3
T:Level 2 Ocean
M:6/8
L:1/8
Q:3/8=132
K:G
|: G2A B2c | d2e d2B | c2A B2G | A3 A3 |
   G2A B2c | d2e f2g | a2g f2e | d3 d3 :|
|: g2f e2d | c2B A2G | F2G A2B | c3 d3 |
   e2f g2a | b2a g2f | e2d c2B | G3 G3 :|`,
                tempo: 132,
                loop: true,
                duration: 60
            },
            
            boss: {
                abc: `X:4
T:Boss Battle
M:4/4
L:1/8
Q:1/4=160
K:Dm
|: D2 F2 A2 F2 | G2 E2 C2 E2 | F2 D2 _B,2 D2 | A,4 A,4 |
   D2 F2 A2 c2 | _B2 G2 E2 G2 | F2 A2 D2 F2 | D4 D4 :|
|: d2 f2 a2 f2 | g2 e2 c2 e2 | f2 d2 _B2 d2 | A4 A4 |
   d2 f2 a2 c'2 | _b2 g2 e2 g2 | f2 a2 d2 f2 | d4 d4 :|`,
                tempo: 160,
                loop: true,
                duration: 45
            },
            
            victory: {
                abc: `X:5
T:Victory Fanfare
M:4/4
L:1/8
Q:1/4=140
K:C
|: C2 E2 G2 c2 | G2 E2 C4 | F2 A2 c2 A2 | G4 G4 |
   E2 G2 c2 e2 | d2 B2 G4 | c2 G2 E2 C2 | C4 C4 :|`,
                tempo: 140,
                loop: false,
                duration: 16
            },
            
            gameover: {
                abc: `X:6
T:Game Over
M:4/4
L:1/4
Q:1/4=60
K:Am
| A2 E2 | F2 E2 | D2 C2 | B,2 A,2 |
| A,4 | A,4 | A,4 | A,4 ||`,
                tempo: 60,
                loop: false,
                duration: 8
            },
            
            powerup: {
                abc: `X:7
T:Power Up
M:2/4
L:1/16
Q:1/4=180
K:C
| C2E2 G2c2 | e2g2 c'4 ||`,
                tempo: 180,
                loop: false,
                duration: 1
            },
            
            coin: {
                abc: `X:8
T:Coin Collect
M:2/4
L:1/32
Q:1/4=200
K:C
| G8 c8 | e8 g8 ||`,
                tempo: 200,
                loop: false,
                duration: 0.5
            }
        };
    }
    
    /**
     * 初始化音频上下文
     */
    async init() {
        if (this.initialized) return;
        
        // 创建音频上下文
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 解锁音频上下文（移动端需要）
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        this.initialized = true;
        console.log('音乐生成器初始化完成');
    }
    
    /**
     * 生成音符频率表
     */
    generateNoteFrequencies() {
        const A4 = 440;
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const frequencies = {};
        
        for (let octave = 0; octave <= 8; octave++) {
            notes.forEach((note, index) => {
                const key = note.replace('#', 's') + octave;
                const halfSteps = (octave - 4) * 12 + index - 9;
                frequencies[key] = A4 * Math.pow(2, halfSteps / 12);
            });
        }
        
        return frequencies;
    }
    
    /**
     * 解析ABC记谱
     */
    parseABC(abcString) {
        const lines = abcString.split('\n');
        const notes = [];
        let tempo = 120;
        let defaultLength = 1/8;
        let key = 'C';
        
        for (const line of lines) {
            // 解析头部信息
            if (line.startsWith('Q:')) {
                const match = line.match(/Q:1\/4=(\d+)/);
                if (match) tempo = parseInt(match[1]);
            } else if (line.startsWith('L:')) {
                const match = line.match(/L:1\/(\d+)/);
                if (match) defaultLength = 1 / parseInt(match[1]);
            } else if (line.startsWith('K:')) {
                key = line.split(':')[1].trim();
            } else if (line.startsWith('|')) {
                // 解析音符
                const notePattern = /([_^=]?)([A-Ga-g])([,']*)(\d*)(\/?\d*)/g;
                let match;
                
                while ((match = notePattern.exec(line)) !== null) {
                    const [full, accidental, note, octaveModifier, lengthNum, lengthDenom] = match;
                    
                    // 计算音高
                    let octave = 4;
                    if (note === note.toUpperCase()) {
                        octave = 3;
                    } else {
                        octave = 4;
                    }
                    
                    // 八度修饰
                    if (octaveModifier.includes(',')) {
                        octave -= octaveModifier.split(',').length - 1;
                    } else if (octaveModifier.includes("'")) {
                        octave += octaveModifier.split("'").length - 1;
                    }
                    
                    // 计算时值
                    let duration = defaultLength;
                    if (lengthNum) {
                        duration = defaultLength * parseInt(lengthNum);
                    }
                    if (lengthDenom) {
                        duration = duration / parseInt(lengthDenom.substring(1));
                    }
                    
                    notes.push({
                        pitch: note.toUpperCase(),
                        octave: octave,
                        duration: duration * 4, // 转换为拍数
                        accidental: accidental
                    });
                }
            }
        }
        
        return { notes, tempo };
    }
    
    /**
     * 音符转频率
     */
    noteToFrequency(pitch, octave, accidental = '') {
        let note = pitch + octave;
        
        // 处理升降号
        if (accidental === '^' || accidental === '#') {
            note = pitch + 's' + octave;
        } else if (accidental === '_' || accidental === 'b') {
            const noteIndex = 'CDEFGAB'.indexOf(pitch);
            const prevNote = 'CDEFGAB'[(noteIndex - 1 + 7) % 7];
            if (pitch === 'C') {
                note = 'B' + (octave - 1);
            } else if (pitch === 'F') {
                note = 'E' + octave;
            } else {
                note = prevNote + 's' + octave;
            }
        }
        
        return this.noteFrequencies[note] || 440;
    }
    
    /**
     * 合成单个音符
     */
    synthesizeNote(frequency, duration, startTime, gainNode) {
        const osc = this.audioContext.createOscillator();
        const noteGain = this.audioContext.createGain();
        
        // 8位游戏音色（方波）
        osc.type = 'square';
        osc.frequency.setValueAtTime(frequency, startTime);
        
        // ADSR包络
        const attack = 0.01;
        const decay = 0.1;
        const sustain = 0.3;
        const release = 0.1;
        
        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.3, startTime + attack);
        noteGain.gain.exponentialRampToValueAtTime(sustain * 0.3, startTime + attack + decay);
        noteGain.gain.setValueAtTime(sustain * 0.3, startTime + duration - release);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(noteGain);
        noteGain.connect(gainNode);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
        
        return osc;
    }
    
    /**
     * 生成音乐
     */
    async generateMusic(templateName) {
        if (!this.initialized) await this.init();
        
        const template = this.musicTemplates[templateName];
        if (!template) {
            console.error(`未找到音乐模板: ${templateName}`);
            return null;
        }
        
        // 解析ABC记谱
        const { notes, tempo } = this.parseABC(template.abc);
        
        // 计算总时长
        const beatDuration = 60 / tempo;
        let totalDuration = 0;
        for (const note of notes) {
            totalDuration += note.duration * beatDuration;
        }
        
        // 如果是循环音乐，生成两个循环
        if (template.loop) {
            totalDuration *= 2;
        }
        
        // 创建离线音频上下文
        const sampleRate = 22050; // 降低采样率以减小文件大小
        const offlineContext = new OfflineAudioContext(
            2, // 立体声
            sampleRate * totalDuration,
            sampleRate
        );
        
        // 创建主增益节点
        const mainGain = offlineContext.createGain();
        mainGain.gain.setValueAtTime(0.5, 0);
        mainGain.connect(offlineContext.destination);
        
        // 添加混响（简单延迟效果）
        const delay = offlineContext.createDelay();
        delay.delayTime.setValueAtTime(0.1, 0);
        const delayGain = offlineContext.createGain();
        delayGain.gain.setValueAtTime(0.2, 0);
        
        mainGain.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(offlineContext.destination);
        
        // 合成音符
        let currentTime = 0;
        const loops = template.loop ? 2 : 1;
        
        for (let loop = 0; loop < loops; loop++) {
            for (const note of notes) {
                const frequency = this.noteToFrequency(note.pitch, note.octave, note.accidental);
                const duration = note.duration * beatDuration;
                
                // 主旋律
                this.synthesizeNoteOffline(
                    offlineContext,
                    frequency,
                    duration,
                    currentTime,
                    mainGain,
                    loop === 0 ? 0 : -0.3 // 第二遍稍微偏左
                );
                
                // 和声（低八度）
                if (templateName !== 'powerup' && templateName !== 'coin') {
                    this.synthesizeNoteOffline(
                        offlineContext,
                        frequency / 2,
                        duration,
                        currentTime,
                        mainGain,
                        loop === 0 ? 0.3 : 0, // 第二遍稍微偏右
                        0.15 // 较低音量
                    );
                }
                
                currentTime += duration;
            }
        }
        
        // 渲染音频
        const audioBuffer = await offlineContext.startRendering();
        
        // 转换为WAV格式（用于后续转换为OGG）
        const wavData = this.audioBufferToWav(audioBuffer);
        
        // 转换为base64（模拟OGG格式）
        const base64 = this.arrayBufferToBase64(wavData);
        
        return {
            name: templateName,
            duration: totalDuration,
            loop: template.loop,
            tempo: tempo,
            format: 'audio/wav', // 实际应该是OGG，但浏览器直接生成OGG较复杂
            data: 'data:audio/wav;base64,' + base64,
            size: wavData.byteLength
        };
    }
    
    /**
     * 离线合成音符
     */
    synthesizeNoteOffline(context, frequency, duration, startTime, destination, pan = 0, volume = 1) {
        const osc = context.createOscillator();
        const noteGain = context.createGain();
        const panner = context.createStereoPanner();
        
        // 8位游戏音色
        osc.type = 'square';
        osc.frequency.setValueAtTime(frequency, startTime);
        
        // 立体声定位
        panner.pan.setValueAtTime(pan, startTime);
        
        // ADSR包络
        const attack = 0.005;
        const decay = 0.05;
        const sustain = 0.3;
        const release = 0.05;
        
        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(volume * 0.3, startTime + attack);
        noteGain.gain.exponentialRampToValueAtTime(sustain * volume * 0.3, startTime + attack + decay);
        noteGain.gain.setValueAtTime(sustain * volume * 0.3, startTime + duration - release);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(noteGain);
        noteGain.connect(panner);
        panner.connect(destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    }
    
    /**
     * AudioBuffer转WAV
     */
    audioBufferToWav(buffer) {
        const numberOfChannels = buffer.numberOfChannels;
        const length = buffer.length * numberOfChannels * 2;
        const outputBuffer = new ArrayBuffer(44 + length);
        const view = new DataView(outputBuffer);
        const channels = [];
        let offset = 0;
        let pos = 0;
        
        // 写入WAV头部
        const setUint16 = (data) => {
            view.setUint16(pos, data, true);
            pos += 2;
        };
        const setUint32 = (data) => {
            view.setUint32(pos, data, true);
            pos += 4;
        };
        
        // RIFF标识
        setUint32(0x46464952);
        setUint32(36 + length);
        setUint32(0x45564157);
        
        // fmt子块
        setUint32(0x20746d66);
        setUint32(16);
        setUint16(1);
        setUint16(numberOfChannels);
        setUint32(buffer.sampleRate);
        setUint32(buffer.sampleRate * 2 * numberOfChannels);
        setUint16(numberOfChannels * 2);
        setUint16(16);
        
        // data子块
        setUint32(0x61746164);
        setUint32(length);
        
        // 写入音频数据
        for (let i = 0; i < buffer.numberOfChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }
        
        offset = 44;
        for (let i = 0; i < buffer.length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, channels[channel][i]));
                view.setInt16(offset, sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return outputBuffer;
    }
    
    /**
     * ArrayBuffer转Base64
     */
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    
    /**
     * 生成所有游戏音乐
     */
    async generateAllMusic() {
        const musicList = [];
        
        for (const templateName of Object.keys(this.musicTemplates)) {
            console.log(`生成音乐: ${templateName}`);
            const musicData = await this.generateMusic(templateName);
            if (musicData) {
                musicList.push(musicData);
            }
        }
        
        return musicList;
    }
    
    /**
     * 播放音乐（测试用）
     */
    async playMusic(templateName) {
        const musicData = await this.generateMusic(templateName);
        if (!musicData) return;
        
        const audio = new Audio(musicData.data);
        audio.loop = musicData.loop;
        audio.play();
        
        return audio;
    }
}

// 导出给浏览器使用
if (typeof window !== 'undefined') {
    window.MusicGenerator = MusicGenerator;
}