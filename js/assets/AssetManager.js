/**
 * 资源管理器
 * 加载和管理游戏中的所有SVG资源
 */
class AssetManager {
    constructor() {
        this.assets = new Map();
        this.loaded = false;
        this.loadingProgress = 0;
        
        // 定义资源映射
        this.assetDefinitions = {
            // 玩家战机
            player: {
                fighter: {
                    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50,10 L45,25 L45,45 L40,60 L45,70 L45,85 L50,95 L55,85 L55,70 L60,60 L55,45 L55,25 Z" 
                              fill="#2196F3" stroke="#0D47A1" stroke-width="1.5"/>
                        <path d="M45,30 L30,50 L30,65 L40,55 L45,50 Z" fill="#64B5F6"/>
                        <path d="M55,30 L70,50 L70,65 L60,55 L55,50 Z" fill="#64B5F6"/>
                        <ellipse cx="50" cy="30" rx="6" ry="10" fill="#90CAF9" opacity="0.8"/>
                        <rect x="48" y="70" width="4" height="10" fill="#FF5722"/>
                        <path d="M50,85 L48,100 L50,97 L52,100 Z" fill="#FFC107" opacity="0.8"/>
                        <path d="M47,87 L45,95 L47,93 L49,95 Z" fill="#FFEB3B" opacity="0.9"/>
                        <path d="M51,87 L53,95 L51,93 L49,95 Z" fill="#FFEB3B" opacity="0.9"/>
                    </svg>`,
                    width: 40,
                    height: 50
                },
                bomber: {
                    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                        <rect x="45" y="20" width="30" height="60" rx="5" fill="#4CAF50" stroke="#1B5E20" stroke-width="2"/>
                        <path d="M45,35 L25,50 L25,70 L45,60 Z" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.5"/>
                        <path d="M75,35 L95,50 L95,70 L75,60 Z" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.5"/>
                        <ellipse cx="60" cy="35" rx="8" ry="12" fill="#81C784" opacity="0.8"/>
                        <rect x="28" y="55" width="8" height="4" fill="#FF9800"/>
                        <rect x="84" y="55" width="8" height="4" fill="#FF9800"/>
                        <circle cx="52" cy="75" r="4" fill="#FF5722"/>
                        <circle cx="60" cy="75" r="4" fill="#FF5722"/>
                        <circle cx="68" cy="75" r="4" fill="#FF5722"/>
                        <path d="M52,78 L50,92 L54,92 Z" fill="#FFC107" opacity="0.9"/>
                        <path d="M60,78 L58,92 L62,92 Z" fill="#FFC107" opacity="0.9"/>
                        <path d="M68,78 L66,92 L70,92 Z" fill="#FFC107" opacity="0.9"/>
                    </svg>`,
                    width: 50,
                    height: 60
                },
                interceptor: {
                    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50,5 L40,30 L40,60 L45,80 L50,85 L55,80 L60,60 L60,30 Z" 
                              fill="#9C27B0" stroke="#6A1B9A" stroke-width="1.5" opacity="0.9"/>
                        <path d="M40,35 L20,65 L40,55 Z" fill="#BA68C8" stroke="#6A1B9A" stroke-width="1" opacity="0.8"/>
                        <path d="M60,35 L80,65 L60,55 Z" fill="#BA68C8" stroke="#6A1B9A" stroke-width="1" opacity="0.8"/>
                        <ellipse cx="50" cy="25" rx="5" ry="8" fill="#E1BEE7" opacity="0.6"/>
                        <ellipse cx="50" cy="78" rx="8" ry="3" fill="#7B1FA2"/>
                        <path d="M50,81 L45,95 L50,92 L55,95 Z" fill="#00BCD4" opacity="0.7"/>
                    </svg>`,
                    width: 40,
                    height: 50
                }
            },
            
            // 敌机
            enemies: {
                scout: {
                    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50,80 L40,40 L50,20 L60,40 Z" fill="#808080" stroke="#555" stroke-width="1"/>
                        <path d="M45,50 L30,55 L45,58 Z" fill="#999"/>
                        <path d="M55,50 L70,55 L55,58 Z" fill="#999"/>
                        <circle cx="50" cy="75" r="3" fill="#FF4444"/>
                    </svg>`,
                    width: 32,
                    height: 32
                },
                fighter: {
                    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50,75 L42,45 L42,30 L50,15 L58,30 L58,45 Z" 
                              fill="#4169E1" stroke="#1E3A8A" stroke-width="1.5"/>
                        <path d="M42,45 L25,52 L25,58 L42,55 Z" fill="#5B8BF5"/>
                        <path d="M58,45 L75,52 L75,58 L58,55 Z" fill="#5B8BF5"/>
                        <rect x="28" y="54" width="6" height="2" fill="#FF0000"/>
                        <rect x="66" y="54" width="6" height="2" fill="#FF0000"/>
                        <ellipse cx="50" cy="30" rx="5" ry="7" fill="#87CEEB" opacity="0.7"/>
                    </svg>`,
                    width: 48,
                    height: 48
                },
                interceptor: {
                    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50,70 L44,40 L44,25 L50,10 L56,25 L56,40 Z" 
                              fill="#FF4500" stroke="#CC2200" stroke-width="2"/>
                        <path d="M44,38 L20,55 L30,58 L44,50 Z" fill="#FF6347"/>
                        <path d="M56,38 L80,55 L70,58 L56,50 Z" fill="#FF6347"/>
                        <rect x="46" y="35" width="3" height="8" fill="#333"/>
                        <rect x="51" y="35" width="3" height="8" fill="#333"/>
                        <path d="M46,65 L42,70 L46,68 Z" fill="#FF6347"/>
                        <path d="M54,65 L58,70 L54,68 Z" fill="#FF6347"/>
                    </svg>`,
                    width: 48,
                    height: 48
                },
                stealth: {
                    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50,75 L35,50 L35,35 L50,15 L65,35 L65,50 Z" 
                              fill="#9400D3" stroke="#6B00A1" stroke-width="1" opacity="0.7"/>
                        <path d="M35,45 L15,60 L35,52 Z" fill="#9400D3" opacity="0.5"/>
                        <path d="M65,45 L85,60 L65,52 Z" fill="#9400D3" opacity="0.5"/>
                        <path d="M50,75 L35,50 L35,35 L50,15 L65,35 L65,50 Z" 
                              fill="none" stroke="#DDA0DD" stroke-width="1" stroke-dasharray="3,2" opacity="0.8"/>
                    </svg>`,
                    width: 48,
                    height: 48
                },
                commander: {
                    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <rect x="35" y="25" width="30" height="50" rx="5" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
                        <path d="M35,35 L10,45 L10,50 L35,47 Z" fill="#FFC107"/>
                        <path d="M65,35 L90,45 L90,50 L65,47 Z" fill="#FFC107"/>
                        <path d="M35,48 L15,55 L15,60 L35,57 Z" fill="#FFB300"/>
                        <path d="M65,48 L85,55 L85,60 L65,57 Z" fill="#FFB300"/>
                        <circle cx="50" cy="30" r="8" fill="none" stroke="#FF5722" stroke-width="2"/>
                        <line x1="50" y1="22" x2="50" y2="38" stroke="#FF5722" stroke-width="2"/>
                        <line x1="42" y1="30" x2="58" y2="30" stroke="#FF5722" stroke-width="2"/>
                        <circle cx="42" cy="70" r="3" fill="#FF5722"/>
                        <circle cx="50" cy="70" r="3" fill="#FF5722"/>
                        <circle cx="58" cy="70" r="3" fill="#FF5722"/>
                    </svg>`,
                    width: 64,
                    height: 64
                }
            },
            
            // 子弹和武器效果
            bullets: {
                standard: {
                    svg: `<svg viewBox="0 0 20 30" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="10" cy="15" rx="3" ry="10" fill="#FFD700"/>
                        <ellipse cx="10" cy="15" rx="2" ry="8" fill="#FFF59D" opacity="0.8"/>
                    </svg>`,
                    width: 6,
                    height: 12
                },
                laser: {
                    svg: `<svg viewBox="0 0 20 100" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="0" width="4" height="100" fill="#00FFFF"/>
                        <rect x="9" y="0" width="2" height="100" fill="#FFFFFF" opacity="0.8"/>
                    </svg>`,
                    width: 4,
                    height: 100
                },
                missile: {
                    svg: `<svg viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15,5 L10,20 L10,30 L15,35 L20,30 L20,20 Z" fill="#FF4500"/>
                        <path d="M10,25 L5,30 L10,28 Z" fill="#FF6347"/>
                        <path d="M20,25 L25,30 L20,28 Z" fill="#FF6347"/>
                        <circle cx="15" cy="15" r="2" fill="#FFF"/>
                    </svg>`,
                    width: 12,
                    height: 16
                },
                enemyBullet: {
                    svg: `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="5" fill="#FF6347"/>
                        <circle cx="10" cy="10" r="3" fill="#FF9999" opacity="0.8"/>
                    </svg>`,
                    width: 8,
                    height: 8
                }
            },
            
            // Boss
            bosses: {
                bomber_commander: {
                    svg: `<svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                        <rect x="45" y="30" width="60" height="80" rx="10" fill="#2C3E50" stroke="#1A252F" stroke-width="3"/>
                        <path d="M45,50 L10,65 L10,85 L45,75 Z" fill="#34495E" stroke="#1A252F" stroke-width="2"/>
                        <path d="M105,50 L140,65 L140,85 L105,75 Z" fill="#34495E" stroke="#1A252F" stroke-width="2"/>
                        <rect x="20" y="72" width="15" height="5" fill="#E74C3C"/>
                        <rect x="115" y="72" width="15" height="5" fill="#E74C3C"/>
                        <rect x="60" y="40" width="30" height="15" rx="3" fill="#3498DB" opacity="0.8"/>
                        <circle cx="55" cy="100" r="5" fill="#FF6B6B"/>
                        <circle cx="75" cy="100" r="5" fill="#FF6B6B"/>
                        <circle cx="95" cy="100" r="5" fill="#FF6B6B"/>
                        <rect x="50" y="60" width="50" height="30" fill="#1A252F" opacity="0.3"/>
                        <text x="75" y="80" text-anchor="middle" fill="#FFD700" font-size="12" font-weight="bold">B-01</text>
                    </svg>`,
                    width: 120,
                    height: 120
                },
                iron_battleship: {
                    svg: `<svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                        <rect x="25" y="40" width="100" height="70" rx="5" fill="#455A64" stroke="#263238" stroke-width="3"/>
                        <circle cx="50" cy="55" r="12" fill="#607D8B" stroke="#263238" stroke-width="2"/>
                        <rect x="45" y="45" width="10" height="20" fill="#263238"/>
                        <circle cx="100" cy="55" r="12" fill="#607D8B" stroke="#263238" stroke-width="2"/>
                        <rect x="95" y="45" width="10" height="20" fill="#263238"/>
                        <rect x="65" y="30" width="20" height="30" fill="#37474F"/>
                        <rect x="70" y="20" width="10" height="15" fill="#263238"/>
                        <rect x="20" y="105" width="110" height="15" rx="5" fill="#37474F"/>
                        <circle cx="35" cy="112" r="5" fill="#263238"/>
                        <circle cx="55" cy="112" r="5" fill="#263238"/>
                        <circle cx="75" cy="112" r="5" fill="#263238"/>
                        <circle cx="95" cy="112" r="5" fill="#263238"/>
                        <circle cx="115" cy="112" r="5" fill="#263238"/>
                        <circle cx="75" cy="75" r="4" fill="#FF5252">
                            <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
                        </circle>
                    </svg>`,
                    width: 130,
                    height: 130
                },
                sky_fortress: {
                    svg: `<svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="75" cy="75" rx="60" ry="40" fill="#1E88E5" stroke="#0D47A1" stroke-width="3"/>
                        <rect x="55" y="35" width="40" height="60" rx="5" fill="#1565C0"/>
                        <circle cx="40" cy="75" r="15" fill="#42A5F5" stroke="#0D47A1" stroke-width="2"/>
                        <circle cx="110" cy="75" r="15" fill="#42A5F5" stroke="#0D47A1" stroke-width="2"/>
                        <rect x="37" y="70" width="6" height="10" fill="#FF5722"/>
                        <rect x="107" y="70" width="6" height="10" fill="#FF5722"/>
                        <circle cx="75" cy="50" r="10" fill="#90CAF9" opacity="0.8"/>
                        <path d="M45,90 L50,110 L55,90 Z" fill="#FFD700"/>
                        <path d="M70,90 L75,110 L80,90 Z" fill="#FFD700"/>
                        <path d="M95,90 L100,110 L105,90 Z" fill="#FFD700"/>
                        <circle cx="75" cy="75" r="5" fill="#FF0000">
                            <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite"/>
                        </circle>
                    </svg>`,
                    width: 140,
                    height: 140
                }
            },
            
            // 道具
            powerups: {
                health: {
                    svg: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <rect x="15" y="5" width="10" height="30" fill="#FF0000"/>
                        <rect x="5" y="15" width="30" height="10" fill="#FF0000"/>
                        <rect x="17" y="7" width="6" height="26" fill="#FF6666" opacity="0.7"/>
                        <rect x="7" y="17" width="26" height="6" fill="#FF6666" opacity="0.7"/>
                    </svg>`,
                    width: 30,
                    height: 30
                },
                energy: {
                    svg: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25,5 L15,22 L22,22 L15,35 L25,18 L18,18 Z" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
                    </svg>`,
                    width: 30,
                    height: 30
                },
                weapon: {
                    svg: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="18" width="30" height="4" fill="#2196F3"/>
                        <rect x="18" y="5" width="4" height="30" fill="#2196F3"/>
                        <circle cx="20" cy="20" r="6" fill="#64B5F6"/>
                        <text x="20" y="25" text-anchor="middle" fill="#FFF" font-size="10">W</text>
                    </svg>`,
                    width: 30,
                    height: 30
                },
                shield: {
                    svg: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20,5 L35,12 L35,25 C35,30 20,35 20,35 C20,35 5,30 5,25 L5,12 Z" 
                              fill="#4CAF50" stroke="#2E7D32" stroke-width="2"/>
                        <path d="M20,10 L30,15 L30,24 C30,27 20,30 20,30 C20,30 10,27 10,24 L10,15 Z" 
                              fill="#66BB6A" opacity="0.7"/>
                    </svg>`,
                    width: 30,
                    height: 30
                }
            }
        };
    }
    
    /**
     * 初始化资源
     */
    async init() {
        console.log('初始化游戏资源...');
        
        // 转换SVG字符串为Image对象
        for (const [category, items] of Object.entries(this.assetDefinitions)) {
            for (const [name, data] of Object.entries(items)) {
                const key = `${category}.${name}`;
                await this.loadSVGAsImage(key, data);
            }
        }
        
        this.loaded = true;
        console.log('资源加载完成');
    }
    
    /**
     * 将SVG转换为Image对象
     */
    async loadSVGAsImage(key, data) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const svgBlob = new Blob([data.svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = () => {
                this.assets.set(key, {
                    image: img,
                    width: data.width,
                    height: data.height,
                    url: url
                });
                resolve();
            };
            
            img.onerror = (error) => {
                console.error(`加载资源失败: ${key}`, error);
                resolve(); // 继续加载其他资源
            };
            
            img.src = url;
        });
    }
    
    /**
     * 获取资源
     */
    getAsset(key) {
        return this.assets.get(key);
    }
    
    /**
     * 绘制资源
     */
    drawAsset(ctx, key, x, y, rotation = 0, scale = 1) {
        const asset = this.getAsset(key);
        if (!asset) {
            console.warn(`资源未找到: ${key}`);
            return;
        }
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        
        ctx.drawImage(
            asset.image,
            -asset.width / 2,
            -asset.height / 2,
            asset.width,
            asset.height
        );
        
        ctx.restore();
    }
    
    /**
     * 清理资源
     */
    cleanup() {
        this.assets.forEach(asset => {
            if (asset.url) {
                URL.revokeObjectURL(asset.url);
            }
        });
        this.assets.clear();
    }
}