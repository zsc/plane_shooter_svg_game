#!/usr/bin/env python3
"""
游戏音乐生成器 - ABC记谱法转OGG格式
生成8位复古风格的游戏音乐
"""

import os
import json
import base64
import numpy as np
from typing import Dict, List, Tuple
import wave
import struct

class MusicGenerator:
    """ABC记谱法音乐生成器"""
    
    def __init__(self):
        self.sample_rate = 22050  # 22.05 kHz 采样率
        self.channels = 1          # 单声道（减小文件大小）
        self.bit_depth = 16        # 16位深度
        
        # 音符频率表
        self.note_frequencies = self._generate_note_frequencies()
        
        # 音乐模板
        self.music_templates = {
            'menu': {
                'name': '主菜单音乐',
                'tempo': 120,
                'notes': self._parse_simplified_abc("""
                    G4 E4 C4 E4 | G4 c4 G4 E4 | F4 A4 F4 D4 | G8 |
                    c4 e4 g4 e4 | d4 f4 a4 f4 | e4 g4 c'4 g4 | f8 |
                """),
                'loop': True,
                'duration': 32
            },
            
            'level1': {
                'name': '第一关战斗',
                'tempo': 140,
                'notes': self._parse_simplified_abc("""
                    A2 A2 E2 E2 | A2 c2 B2 A2 | G2 G2 D2 D2 | G2 B2 A2 G2 |
                    F2 F2 C2 C2 | F2 A2 G2 F2 | E2 E2 B,2 B,2 | E4 E4 |
                """),
                'loop': True,
                'duration': 60
            },
            
            'level2': {
                'name': '第二关海洋',
                'tempo': 132,
                'notes': self._parse_simplified_abc("""
                    G2 A2 B2 c2 | d2 e2 d2 B2 | c2 A2 B2 G2 | A4 A4 |
                    G2 A2 B2 c2 | d2 e2 f2 g2 | a2 g2 f2 e2 | d4 d4 |
                """),
                'loop': True,
                'duration': 60
            },
            
            'boss': {
                'name': 'Boss战',
                'tempo': 160,
                'notes': self._parse_simplified_abc("""
                    D2 F2 A2 F2 | G2 E2 C2 E2 | F2 D2 _B,2 D2 | A,4 A,4 |
                    d2 f2 a2 f2 | g2 e2 c2 e2 | f2 d2 _B2 d2 | A4 A4 |
                """),
                'loop': True,
                'duration': 45
            },
            
            'victory': {
                'name': '胜利凯歌',
                'tempo': 140,
                'notes': self._parse_simplified_abc("""
                    C2 E2 G2 c2 | G2 E2 C4 | F2 A2 c2 A2 | G4 G4 |
                    E2 G2 c2 e2 | d2 B2 G4 | c2 G2 E2 C2 | C4 C4 |
                """),
                'loop': False,
                'duration': 16
            },
            
            'gameover': {
                'name': '游戏结束',
                'tempo': 60,
                'notes': self._parse_simplified_abc("""
                    A4 E4 | F4 E4 | D4 C4 | B,4 A,4 | A,8 |
                """),
                'loop': False,
                'duration': 8
            },
            
            'powerup': {
                'name': '能量提升',
                'tempo': 180,
                'notes': self._parse_simplified_abc("""
                    C1 E1 G1 c1 | e1 g1 c'2 |
                """),
                'loop': False,
                'duration': 1
            },
            
            'coin': {
                'name': '金币收集',
                'tempo': 200,
                'notes': self._parse_simplified_abc("""
                    G1 c1 e1 g1 |
                """),
                'loop': False,
                'duration': 0.5
            }
        }
    
    def _generate_note_frequencies(self) -> Dict[str, float]:
        """生成音符频率表"""
        A4 = 440.0
        notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        frequencies = {}
        
        for octave in range(0, 9):
            for i, note in enumerate(notes):
                note_name = f"{note}{octave}"
                # 计算相对于A4的半音数
                semitones = (octave - 4) * 12 + i - 9
                frequency = A4 * (2 ** (semitones / 12))
                frequencies[note_name] = frequency
                
                # 添加降号版本
                if '#' not in note:
                    flat_note = notes[(i - 1) % 12] if i > 0 else 'B'
                    if '#' in flat_note:
                        flat_note = notes[(i - 1) % 12].replace('#', '')
                        frequencies[f"_{note}{octave}"] = frequencies[f"{flat_note}#{octave}"]
        
        return frequencies
    
    def _parse_simplified_abc(self, abc_string: str) -> List[Dict]:
        """解析简化的ABC记谱（用于示例）"""
        notes = []
        abc_string = abc_string.strip().replace('\n', ' ').replace('|', '')
        
        tokens = abc_string.split()
        for token in tokens:
            if not token:
                continue
                
            # 解析音符和时值
            note_char = token[0]
            if note_char == '_':
                note_char = token[:2]
                duration_str = token[2:]
            else:
                duration_str = token[1:]
            
            # 确定八度
            if note_char.isupper():
                octave = 3
            else:
                octave = 4
                note_char = note_char.upper()
            
            # 处理高八度标记
            if "'" in token:
                octave += token.count("'")
            if "," in token:
                octave -= token.count(",")
            
            # 解析时值
            if duration_str:
                duration = int(duration_str) if duration_str.isdigit() else 1
            else:
                duration = 1
            
            notes.append({
                'pitch': note_char,
                'octave': octave,
                'duration': duration * 0.125  # 八分音符为基准
            })
        
        return notes
    
    def generate_square_wave(self, frequency: float, duration: float) -> np.ndarray:
        """生成方波"""
        num_samples = int(duration * self.sample_rate)
        t = np.linspace(0, duration, num_samples)
        
        # 生成方波
        wave = np.sign(np.sin(2 * np.pi * frequency * t))
        
        # 添加轻微的谐波使声音更丰富
        wave += 0.2 * np.sign(np.sin(2 * np.pi * frequency * 2 * t))
        wave += 0.1 * np.sign(np.sin(2 * np.pi * frequency * 3 * t))
        
        return wave * 0.2  # 降低音量
    
    def apply_envelope(self, samples: np.ndarray, attack=0.01, decay=0.05, 
                       sustain=0.7, release=0.1) -> np.ndarray:
        """应用ADSR包络"""
        total_samples = len(samples)
        sample_rate = self.sample_rate
        
        attack_samples = min(int(attack * sample_rate), total_samples // 4)
        decay_samples = min(int(decay * sample_rate), total_samples // 4)
        release_samples = min(int(release * sample_rate), total_samples // 4)
        sustain_samples = total_samples - attack_samples - decay_samples - release_samples
        
        if sustain_samples < 0:
            # 对于非常短的音符，按比例缩放
            total = attack_samples + decay_samples + release_samples
            if total > 0:
                scale = total_samples / total
                attack_samples = int(attack_samples * scale)
                decay_samples = int(decay_samples * scale)
                release_samples = total_samples - attack_samples - decay_samples
                sustain_samples = 0
        
        envelope = np.ones(total_samples)
        current_pos = 0
        
        # Attack
        if attack_samples > 0 and current_pos < total_samples:
            end_pos = min(current_pos + attack_samples, total_samples)
            envelope[current_pos:end_pos] = np.linspace(0, 1, end_pos - current_pos)
            current_pos = end_pos
        
        # Decay
        if decay_samples > 0 and current_pos < total_samples:
            end_pos = min(current_pos + decay_samples, total_samples)
            envelope[current_pos:end_pos] = np.linspace(1, sustain, end_pos - current_pos)
            current_pos = end_pos
        
        # Sustain
        if sustain_samples > 0 and current_pos < total_samples:
            end_pos = min(current_pos + sustain_samples, total_samples)
            envelope[current_pos:end_pos] = sustain
            current_pos = end_pos
        
        # Release
        if release_samples > 0 and current_pos < total_samples:
            end_pos = total_samples
            envelope[current_pos:end_pos] = np.linspace(sustain, 0, end_pos - current_pos)
        
        return samples * envelope
    
    def synthesize_track(self, template_name: str) -> np.ndarray:
        """合成音轨"""
        template = self.music_templates[template_name]
        notes = template['notes']
        tempo = template['tempo']
        
        # 计算每拍的秒数
        seconds_per_beat = 60.0 / tempo
        
        # 计算总时长
        total_duration = sum(note['duration'] for note in notes) * seconds_per_beat
        
        # 如果是循环音乐，生成两个循环
        loops = 2 if template['loop'] else 1
        
        # 预分配音频缓冲区
        total_samples = int(total_duration * self.sample_rate * loops)
        audio_buffer = np.zeros(total_samples)
        
        # 合成每个音符
        current_sample = 0
        for loop in range(loops):
            for note in notes:
                # 获取频率
                note_name = f"{note['pitch']}{note['octave']}"
                if note['pitch'].startswith('_'):
                    note_name = f"_{note['pitch'][1]}{note['octave']}"
                
                frequency = self.note_frequencies.get(note_name, 440)
                duration = note['duration'] * seconds_per_beat
                
                # 生成方波
                wave = self.generate_square_wave(frequency, duration)
                
                # 应用包络
                if template_name in ['powerup', 'coin']:
                    # 音效使用快速包络
                    wave = self.apply_envelope(wave, attack=0.001, decay=0.01, 
                                              sustain=0.5, release=0.05)
                else:
                    # 音乐使用平滑包络
                    wave = self.apply_envelope(wave, attack=0.01, decay=0.05, 
                                              sustain=0.7, release=0.1)
                
                # 添加到缓冲区
                end_sample = min(current_sample + len(wave), total_samples)
                audio_buffer[current_sample:end_sample] = wave[:end_sample - current_sample]
                current_sample = end_sample
        
        # 添加简单混响效果
        if template_name not in ['powerup', 'coin']:
            delay_samples = int(0.05 * self.sample_rate)  # 50ms延迟
            delayed = np.zeros_like(audio_buffer)
            delayed[delay_samples:] = audio_buffer[:-delay_samples] * 0.3
            audio_buffer += delayed
        
        # 归一化
        max_val = np.max(np.abs(audio_buffer))
        if max_val > 0:
            audio_buffer = audio_buffer / max_val * 0.8
        
        return audio_buffer
    
    def save_wav(self, audio_data: np.ndarray, filename: str):
        """保存为WAV文件"""
        # 转换为16位整数
        audio_data = (audio_data * 32767).astype(np.int16)
        
        with wave.open(filename, 'wb') as wav_file:
            wav_file.setnchannels(self.channels)
            wav_file.setsampwidth(2)  # 16位
            wav_file.setframerate(self.sample_rate)
            wav_file.writeframes(audio_data.tobytes())
    
    def wav_to_ogg_base64(self, wav_filename: str) -> str:
        """将WAV转换为OGG并编码为base64（使用纯Python）"""
        # 读取WAV文件
        with open(wav_filename, 'rb') as f:
            wav_data = f.read()
        
        # 这里应该使用pydub或其他库转换为OGG
        # 但为了避免外部依赖，我们暂时返回WAV的base64
        return base64.b64encode(wav_data).decode('utf-8')
    
    def generate_all_music(self):
        """生成所有游戏音乐"""
        music_data = []
        
        # 创建输出目录
        os.makedirs('audio', exist_ok=True)
        
        for template_name, template in self.music_templates.items():
            print(f"生成音乐: {template['name']} ({template_name})")
            
            # 合成音轨
            audio = self.synthesize_track(template_name)
            
            # 保存为WAV
            wav_filename = f"audio/{template_name}.wav"
            self.save_wav(audio, wav_filename)
            
            # 转换为base64
            audio_base64 = self.wav_to_ogg_base64(wav_filename)
            
            # 添加到数据列表
            music_data.append({
                'id': template_name,
                'name': template['name'],
                'tempo': template['tempo'],
                'loop': template['loop'],
                'duration': template['duration'],
                'format': 'audio/wav',
                'data': f'data:audio/wav;base64,{audio_base64}',
                'file': wav_filename
            })
            
            print(f"  ✓ 已生成: {wav_filename}")
        
        # 保存音乐数据JSON
        with open('audio/music_data.json', 'w', encoding='utf-8') as f:
            json.dump(music_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ 所有音乐生成完成！")
        print(f"生成了 {len(music_data)} 个音乐文件")
        
        return music_data
    
    def generate_html_snippet(self, music_data: List[Dict]) -> str:
        """生成HTML代码片段"""
        html = '<!-- Section: 游戏音乐 (Python ABC生成) -->\n'
        html += '<div class="section">\n'
        html += '    <h2>游戏音乐素材</h2>\n'
        html += '    <div class="assets-grid">\n'
        
        for music in music_data:
            html += f'        <!-- {music["name"]} -->\n'
            html += '        <div class="asset-item">\n'
            html += '            <div class="music-player">\n'
            html += f'                <audio controls{"" if not music["loop"] else " loop"}>\n'
            html += f'                    <source src="{music["data"]}" type="{music["format"]}">\n'
            html += '                </audio>\n'
            html += '            </div>\n'
            html += f'            <div class="asset-name">{music["name"]}</div>\n'
            html += f'            <div class="asset-desc">{"循环" if music["loop"] else "单次"} | {music["tempo"]} BPM</div>\n'
            html += '        </div>\n\n'
        
        html += '    </div>\n'
        html += '</div>\n'
        
        return html


def main():
    """主函数"""
    print("=" * 50)
    print("全民飞机大战 - 游戏音乐生成器")
    print("=" * 50)
    
    generator = MusicGenerator()
    
    # 生成所有音乐
    music_data = generator.generate_all_music()
    
    # 生成HTML代码
    html_snippet = generator.generate_html_snippet(music_data)
    
    # 保存HTML代码片段
    with open('audio/music_assets.html', 'w', encoding='utf-8') as f:
        f.write(html_snippet)
    
    print(f"\nHTML代码已保存到: audio/music_assets.html")
    print("请将此代码添加到 assets.html 文件中")
    
    # 显示文件大小统计
    print("\n文件大小统计:")
    total_size = 0
    for music in music_data:
        if 'file' in music and os.path.exists(music['file']):
            size = os.path.getsize(music['file'])
            total_size += size
            print(f"  {music['name']}: {size / 1024:.2f} KB")
    print(f"总大小: {total_size / 1024:.2f} KB")


if __name__ == '__main__':
    main()