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
                    type: 'x3d',
                    x3d: `<x3d width="100px" height="100px" style="background: transparent;">
                        <scene>
                            <transform rotation="1 0 0 0.3">
                                <!-- 主机身 - 流线型 -->
                                <transform>
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.13 0.59 0.95" specularColor="0.8 0.9 1"/>
                                        </appearance>
                                        <cone bottomRadius="0.25" height="1.2"/>
                                    </shape>
                                </transform>
                                
                                <!-- 左主翼 -->
                                <transform translation="-0.4 0 -0.2">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.39 0.71 0.96" specularColor="1 1 1"/>
                                        </appearance>
                                        <box size="0.5 0.03 0.4"/>
                                    </shape>
                                    <!-- 翼尖 -->
                                    <transform translation="-0.25 0 0">
                                        <shape>
                                            <appearance>
                                                <material diffuseColor="0.56 0.79 0.98" transparency="0.3"/>
                                            </appearance>
                                            <cone bottomRadius="0.05" height="0.2"/>
                                        </shape>
                                    </transform>
                                </transform>
                                
                                <!-- 右主翼 -->
                                <transform translation="0.4 0 -0.2">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.39 0.71 0.96" specularColor="1 1 1"/>
                                        </appearance>
                                        <box size="0.5 0.03 0.4"/>
                                    </shape>
                                    <!-- 翼尖 -->
                                    <transform translation="0.25 0 0">
                                        <shape>
                                            <appearance>
                                                <material diffuseColor="0.56 0.79 0.98" transparency="0.3"/>
                                            </appearance>
                                            <cone bottomRadius="0.05" height="0.2"/>
                                        </shape>
                                    </transform>
                                </transform>
                                
                                <!-- 座舱 -->
                                <transform translation="0 0.1 0.25">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.56 0.79 0.98" transparency="0.2" specularColor="1 1 1"/>
                                        </appearance>
                                        <sphere radius="0.15"/>
                                    </shape>
                                </transform>
                                
                                <!-- 引擎喷口 -->
                                <transform translation="0 0 -0.5">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="1 0.35 0.13" emissiveColor="1 0.76 0"/>
                                        </appearance>
                                        <cylinder radius="0.1" height="0.2"/>
                                    </shape>
                                </transform>
                                
                                <!-- 尾翼 -->
                                <transform translation="0 0.2 -0.4">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.05 0.29 0.57"/>
                                        </appearance>
                                        <box size="0.02 0.25 0.2"/>
                                    </shape>
                                </transform>
                            </transform>
                            
                            <directionalLight direction="0 -1 1" intensity="0.8" color="1 1 1"/>
                            <pointLight location="0 2 -2" intensity="0.4" color="0.5 0.7 1"/>
                            <viewpoint position="0 -0.5 -2.5" orientation="1 0 0 3.14159"/>
                        </scene>
                    </x3d>`,
                    width: 40,
                    height: 50
                },
                bomber: {
                    type: 'x3d',
                    x3d: `<x3d width="120px" height="120px" style="background: transparent;">
                        <scene>
                            <transform rotation="1 0 0 0.3">
                                <!-- 厚重主体 -->
                                <shape>
                                    <appearance>
                                        <material diffuseColor="0.3 0.69 0.31" specularColor="0.5 0.8 0.5"/>
                                    </appearance>
                                    <box size="0.5 0.35 1.2"/>
                                </shape>
                                
                                <!-- 装甲层 -->
                                <transform translation="0 0.15 0.1">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.11 0.37 0.13" specularColor="0.3 0.5 0.3"/>
                                        </appearance>
                                        <box size="0.4 0.1 0.8"/>
                                    </shape>
                                </transform>
                                
                                <!-- 左翼 -->
                                <transform translation="-0.55 0 -0.1">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.4 0.73 0.42"/>
                                        </appearance>
                                        <box size="0.6 0.08 0.7"/>
                                    </shape>
                                    <!-- 武器挂架 -->
                                    <transform translation="0 -0.1 0.2">
                                        <shape>
                                            <appearance>
                                                <material diffuseColor="1 0.6 0" emissiveColor="0.5 0.3 0"/>
                                            </appearance>
                                            <cylinder radius="0.06" height="0.15"/>
                                        </shape>
                                    </transform>
                                    <transform translation="0 -0.1 -0.1">
                                        <shape>
                                            <appearance>
                                                <material diffuseColor="1 0.6 0" emissiveColor="0.5 0.3 0"/>
                                            </appearance>
                                            <cylinder radius="0.06" height="0.15"/>
                                        </shape>
                                    </transform>
                                </transform>
                                
                                <!-- 右翼 -->
                                <transform translation="0.55 0 -0.1">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.4 0.73 0.42"/>
                                        </appearance>
                                        <box size="0.6 0.08 0.7"/>
                                    </shape>
                                    <!-- 武器挂架 -->
                                    <transform translation="0 -0.1 0.2">
                                        <shape>
                                            <appearance>
                                                <material diffuseColor="1 0.6 0" emissiveColor="0.5 0.3 0"/>
                                            </appearance>
                                            <cylinder radius="0.06" height="0.15"/>
                                        </shape>
                                    </transform>
                                    <transform translation="0 -0.1 -0.1">
                                        <shape>
                                            <appearance>
                                                <material diffuseColor="1 0.6 0" emissiveColor="0.5 0.3 0"/>
                                            </appearance>
                                            <cylinder radius="0.06" height="0.15"/>
                                        </shape>
                                    </transform>
                                </transform>
                                
                                <!-- 驾驶舱 -->
                                <transform translation="0 0.12 0.3">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.51 0.78 0.52" transparency="0.25" specularColor="1 1 1"/>
                                        </appearance>
                                        <box size="0.25 0.15 0.3"/>
                                    </shape>
                                </transform>
                                
                                <!-- 三引擎 -->
                                <transform translation="0 -0.1 -0.5">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="1 0.35 0.13" emissiveColor="1 0.76 0"/>
                                        </appearance>
                                        <cylinder radius="0.12" height="0.25"/>
                                    </shape>
                                </transform>
                                <transform translation="-0.2 -0.1 -0.5">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="1 0.35 0.13" emissiveColor="1 0.76 0"/>
                                        </appearance>
                                        <cylinder radius="0.08" height="0.2"/>
                                    </shape>
                                </transform>
                                <transform translation="0.2 -0.1 -0.5">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="1 0.35 0.13" emissiveColor="1 0.76 0"/>
                                        </appearance>
                                        <cylinder radius="0.08" height="0.2"/>
                                    </shape>
                                </transform>
                            </transform>
                            
                            <directionalLight direction="0 -1 1" intensity="0.8"/>
                            <pointLight location="0 2 -2" intensity="0.4" color="0.7 1 0.7"/>
                            <viewpoint position="0 -0.5 -3" orientation="1 0 0 3.14159"/>
                        </scene>
                    </x3d>`,
                    width: 50,
                    height: 60
                },
                interceptor: {
                    type: 'x3d',
                    x3d: `<x3d width="100px" height="100px" style="background: transparent;">
                        <scene>
                            <transform rotation="1 0 0 0.3">
                                <!-- 尖锐机身 -->
                                <transform>
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.61 0.15 0.69" specularColor="1 0.5 1"/>
                                        </appearance>
                                        <cone bottomRadius="0.15" height="1.3"/>
                                    </shape>
                                </transform>
                                
                                <!-- 后掠左翼 -->
                                <transform translation="-0.3 0 -0.3" rotation="0 0 1 -0.5">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.73 0.41 0.78" specularColor="1 0.7 1" transparency="0.1"/>
                                        </appearance>
                                        <box size="0.6 0.02 0.3"/>
                                    </shape>
                                </transform>
                                
                                <!-- 后掠右翼 -->
                                <transform translation="0.3 0 -0.3" rotation="0 0 1 0.5">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.73 0.41 0.78" specularColor="1 0.7 1" transparency="0.1"/>
                                        </appearance>
                                        <box size="0.6 0.02 0.3"/>
                                    </shape>
                                </transform>
                                
                                <!-- 小型前翼 -->
                                <transform translation="-0.15 0 0.3">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.88 0.75 0.91" transparency="0.4"/>
                                        </appearance>
                                        <box size="0.2 0.01 0.15"/>
                                    </shape>
                                </transform>
                                <transform translation="0.15 0 0.3">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.88 0.75 0.91" transparency="0.4"/>
                                        </appearance>
                                        <box size="0.2 0.01 0.15"/>
                                    </shape>
                                </transform>
                                
                                <!-- 透明座舱 -->
                                <transform translation="0 0.05 0.2">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.88 0.75 0.91" transparency="0.4" specularColor="1 1 1"/>
                                        </appearance>
                                        <sphere radius="0.1"/>
                                    </shape>
                                </transform>
                                
                                <!-- 等离子推进器 -->
                                <transform translation="0 0 -0.55">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0 0.74 0.83" emissiveColor="0 0.74 0.83" transparency="0.3"/>
                                        </appearance>
                                        <sphere radius="0.12"/>
                                    </shape>
                                </transform>
                                
                                <!-- 垂直稳定翼 -->
                                <transform translation="0 0.15 -0.4">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.48 0.11 0.42"/>
                                        </appearance>
                                        <box size="0.02 0.2 0.15"/>
                                    </shape>
                                </transform>
                            </transform>
                            
                            <directionalLight direction="0 -1 1" intensity="0.9" color="1 1 1"/>
                            <pointLight location="0 2 -2" intensity="0.5" color="1 0.5 1"/>
                            <viewpoint position="0 -0.5 -2.5" orientation="1 0 0 3.14159"/>
                        </scene>
                    </x3d>`,
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
                },
                drone: {
                    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="15" fill="#FF6600" stroke="#CC3300" stroke-width="2"/>
                        <path d="M50,35 L60,25 M50,35 L40,25" stroke="#FF9900" stroke-width="3"/>
                        <path d="M50,65 L60,75 M50,65 L40,75" stroke="#FF9900" stroke-width="3"/>
                        <path d="M35,50 L25,40 M35,50 L25,60" stroke="#FF9900" stroke-width="3"/>
                        <path d="M65,50 L75,40 M65,50 L75,60" stroke="#FF9900" stroke-width="3"/>
                        <circle cx="50" cy="50" r="8" fill="#FFCC00"/>
                        <circle cx="50" cy="50" r="4" fill="#FF0000"/>
                    </svg>`,
                    width: 20,
                    height: 20
                },
                bomber: {
                    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50,75 L35,50 L35,35 L50,20 L65,35 L65,50 Z" 
                              fill="#B71C1C" stroke="#8B0000" stroke-width="2"/>
                        <path d="M35,45 L15,50 L15,60 L35,55 Z" fill="#D32F2F"/>
                        <path d="M65,45 L85,50 L85,60 L65,55 Z" fill="#D32F2F"/>
                        <rect x="18" y="53" width="8" height="4" fill="#FFD700"/>
                        <rect x="74" y="53" width="8" height="4" fill="#FFD700"/>
                        <ellipse cx="50" cy="35" rx="8" ry="6" fill="#FF5252" opacity="0.7"/>
                        <circle cx="45" cy="65" r="4" fill="#FFA000"/>
                        <circle cx="55" cy="65" r="4" fill="#FFA000"/>
                    </svg>`,
                    width: 48,
                    height: 48
                },
                gunship: {
                    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <rect x="30" y="30" width="40" height="40" rx="8" fill="#37474F" stroke="#263238" stroke-width="2"/>
                        <path d="M30,40 L10,35 L10,45 L30,45 Z" fill="#546E7A"/>
                        <path d="M70,40 L90,35 L90,45 L70,45 Z" fill="#546E7A"/>
                        <path d="M30,55 L10,50 L10,60 L30,60 Z" fill="#546E7A"/>
                        <path d="M70,55 L90,50 L90,60 L70,60 Z" fill="#546E7A"/>
                        <rect x="12" y="38" width="12" height="3" fill="#FFD700"/>
                        <rect x="76" y="38" width="12" height="3" fill="#FFD700"/>
                        <rect x="12" y="53" width="12" height="3" fill="#FFD700"/>
                        <rect x="76" y="53" width="12" height="3" fill="#FFD700"/>
                        <circle cx="40" cy="50" r="3" fill="#FF5722"/>
                        <circle cx="50" cy="50" r="3" fill="#FF5722"/>
                        <circle cx="60" cy="50" r="3" fill="#FF5722"/>
                        <rect x="45" y="62" width="10" height="4" fill="#FFA000"/>
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
            
            // 敌人
            enemies: {
                scout: {
                    type: 'x3d',
                    x3d: `<x3d width="80px" height="80px" style="background: transparent;">
                        <scene>
                            <transform rotation="1 0 0 -0.3">
                                <!-- 主机身 -->
                                <shape>
                                    <appearance>
                                        <material diffuseColor="0.545 0.271 0.075" specularColor="0.3 0.3 0.3"/>
                                    </appearance>
                                    <box size="0.4 0.2 0.8"/>
                                </shape>
                                
                                <!-- 左翼 -->
                                <transform translation="-0.35 0 0">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.627 0.322 0.176"/>
                                        </appearance>
                                        <box size="0.3 0.05 0.4"/>
                                    </shape>
                                </transform>
                                
                                <!-- 右翼 -->
                                <transform translation="0.35 0 0">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.627 0.322 0.176"/>
                                        </appearance>
                                        <box size="0.3 0.05 0.4"/>
                                    </shape>
                                </transform>
                                
                                <!-- 驾驶舱 -->
                                <transform translation="0 0.08 0.15">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.2 0.2 0.2" transparency="0.4"/>
                                        </appearance>
                                        <sphere radius="0.12"/>
                                    </shape>
                                </transform>
                                
                                <!-- 引擎 -->
                                <transform translation="0 0 -0.35">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="1 0 0" emissiveColor="0.5 0 0"/>
                                        </appearance>
                                        <sphere radius="0.08"/>
                                    </shape>
                                </transform>
                            </transform>
                            
                            <directionalLight direction="0 -1 -1" intensity="0.7"/>
                            <pointLight location="0 2 2" intensity="0.3"/>
                            <viewpoint position="0 0 2.5"/>
                        </scene>
                    </x3d>`,
                    width: 50,
                    height: 60
                },
                fighter: {
                    type: 'x3d',
                    x3d: `<x3d width="70px" height="70px" style="background: transparent;">
                        <scene>
                            <transform rotation="1 0 0 -0.3">
                                <!-- 流线型机身 -->
                                <shape>
                                    <appearance>
                                        <material diffuseColor="0.294 0 0.51" specularColor="0.5 0.5 1"/>
                                    </appearance>
                                    <cone bottomRadius="0.2" height="0.9"/>
                                </shape>
                                
                                <!-- 后掠翼左 -->
                                <transform translation="-0.3 0 -0.1" rotation="0 0 1 0.3">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.416 0.051 0.678" specularColor="0.7 0.7 1"/>
                                        </appearance>
                                        <box size="0.35 0.02 0.25"/>
                                    </shape>
                                </transform>
                                
                                <!-- 后掠翼右 -->
                                <transform translation="0.3 0 -0.1" rotation="0 0 1 -0.3">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.416 0.051 0.678" specularColor="0.7 0.7 1"/>
                                        </appearance>
                                        <box size="0.35 0.02 0.25"/>
                                    </shape>
                                </transform>
                                
                                <!-- 座舱 -->
                                <transform translation="0 0.05 0.2">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.1 0.1 0.3" transparency="0.3" specularColor="1 1 1"/>
                                        </appearance>
                                        <sphere radius="0.1"/>
                                    </shape>
                                </transform>
                                
                                <!-- 推进器 -->
                                <transform translation="0 0 -0.4">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="1 0 1" emissiveColor="1 0 0.5"/>
                                        </appearance>
                                        <cylinder radius="0.08" height="0.15"/>
                                    </shape>
                                </transform>
                            </transform>
                            
                            <directionalLight direction="0 -1 -1" intensity="0.8"/>
                            <pointLight location="0 1 2" intensity="0.4" color="0.8 0.8 1"/>
                            <viewpoint position="0 0 2.5"/>
                        </scene>
                    </x3d>`,
                    width: 40,
                    height: 55
                },
                bomber: {
                    type: 'x3d',
                    x3d: `<x3d width="100px" height="100px" style="background: transparent;">
                        <scene>
                            <transform rotation="1 0 0 -0.3">
                                <!-- 厚重主体 -->
                                <shape>
                                    <appearance>
                                        <material diffuseColor="0.173 0.243 0.314" specularColor="0.2 0.2 0.2"/>
                                    </appearance>
                                    <box size="0.6 0.3 1"/>
                                </shape>
                                
                                <!-- 装甲板 -->
                                <transform translation="0 0.12 0.2">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.102 0.145 0.184" specularColor="0.5 0.5 0.5"/>
                                        </appearance>
                                        <box size="0.5 0.1 0.4"/>
                                    </shape>
                                </transform>
                                
                                <!-- 左翼与武器 -->
                                <transform translation="-0.5 0 0">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.204 0.286 0.369"/>
                                        </appearance>
                                        <box size="0.4 0.1 0.6"/>
                                    </shape>
                                    <!-- 武器舱 -->
                                    <transform translation="0 -0.08 0.1">
                                        <shape>
                                            <appearance>
                                                <material diffuseColor="0.906 0.298 0.235" emissiveColor="0.3 0 0"/>
                                            </appearance>
                                            <box size="0.15 0.08 0.2"/>
                                        </shape>
                                    </transform>
                                </transform>
                                
                                <!-- 右翼与武器 -->
                                <transform translation="0.5 0 0">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.204 0.286 0.369"/>
                                        </appearance>
                                        <box size="0.4 0.1 0.6"/>
                                    </shape>
                                    <!-- 武器舱 -->
                                    <transform translation="0 -0.08 0.1">
                                        <shape>
                                            <appearance>
                                                <material diffuseColor="0.906 0.298 0.235" emissiveColor="0.3 0 0"/>
                                            </appearance>
                                            <box size="0.15 0.08 0.2"/>
                                        </shape>
                                    </transform>
                                </transform>
                                
                                <!-- 双引擎 -->
                                <transform translation="-0.15 0 -0.45">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="1 0.42 0.42" emissiveColor="0.5 0.1 0.1"/>
                                        </appearance>
                                        <cylinder radius="0.1" height="0.2"/>
                                    </shape>
                                </transform>
                                <transform translation="0.15 0 -0.45">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="1 0.42 0.42" emissiveColor="0.5 0.1 0.1"/>
                                        </appearance>
                                        <cylinder radius="0.1" height="0.2"/>
                                    </shape>
                                </transform>
                            </transform>
                            
                            <directionalLight direction="0 -1 -1" intensity="0.6"/>
                            <directionalLight direction="1 0 0" intensity="0.3"/>
                            <viewpoint position="0 0.3 3"/>
                        </scene>
                    </x3d>`,
                    width: 70,
                    height: 90
                },
                elite: {
                    type: 'x3d',
                    x3d: `<x3d width="90px" height="90px" style="background: transparent;">
                        <scene>
                            <transform rotation="1 0 0 -0.3">
                                <!-- 精英机身 -->
                                <shape>
                                    <appearance>
                                        <material diffuseColor="1 0.843 0" specularColor="1 1 0.5"/>
                                    </appearance>
                                    <box size="0.5 0.25 0.9"/>
                                </shape>
                                
                                <!-- 前锋装甲 -->
                                <transform translation="0 0 0.35">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="1 0.647 0" specularColor="1 0.8 0"/>
                                        </appearance>
                                        <cone bottomRadius="0.25" height="0.3"/>
                                    </shape>
                                </transform>
                                
                                <!-- 左侧翼 -->
                                <transform translation="-0.45 0 -0.1">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="1 0.78 0" specularColor="1 0.9 0.3"/>
                                        </appearance>
                                        <box size="0.4 0.06 0.5"/>
                                    </shape>
                                    <!-- 能量武器 -->
                                    <transform translation="0 -0.05 0.15">
                                        <shape>
                                            <appearance>
                                                <material diffuseColor="1 0 0" emissiveColor="1 0 0" transparency="0.2"/>
                                            </appearance>
                                            <sphere radius="0.08"/>
                                        </shape>
                                    </transform>
                                </transform>
                                
                                <!-- 右侧翼 -->
                                <transform translation="0.45 0 -0.1">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="1 0.78 0" specularColor="1 0.9 0.3"/>
                                        </appearance>
                                        <box size="0.4 0.06 0.5"/>
                                    </shape>
                                    <!-- 能量武器 -->
                                    <transform translation="0 -0.05 0.15">
                                        <shape>
                                            <appearance>
                                                <material diffuseColor="1 0 0" emissiveColor="1 0 0" transparency="0.2"/>
                                            </appearance>
                                            <sphere radius="0.08"/>
                                        </shape>
                                    </transform>
                                </transform>
                                
                                <!-- 高级座舱 -->
                                <transform translation="0 0.1 0.1">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.2 0.2 0.2" transparency="0.2" specularColor="1 1 1"/>
                                        </appearance>
                                        <box size="0.3 0.15 0.25"/>
                                    </shape>
                                </transform>
                                
                                <!-- 推进系统 -->
                                <transform translation="0 0 -0.4">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="1 0.271 0" emissiveColor="1 0.4 0"/>
                                        </appearance>
                                        <cylinder radius="0.12" height="0.2"/>
                                    </shape>
                                </transform>
                            </transform>
                            
                            <directionalLight direction="0 -1 -1" intensity="0.9"/>
                            <pointLight location="0 2 2" intensity="0.5" color="1 0.9 0.7"/>
                            <viewpoint position="0 0.2 2.8"/>
                        </scene>
                    </x3d>`,
                    width: 60,
                    height: 80
                }
            },
            
            // Boss
            bosses: {
                bomber_commander: {
                    type: 'x3d',
                    x3d: `<x3d width="150px" height="150px" style="background: transparent;">
                        <scene>
                            <transform rotation="0.3 1 0 0.5">
                                <!-- 主机身 -->
                                <transform>
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.17 0.24 0.31" specularColor="0.5 0.5 0.5"/>
                                        </appearance>
                                        <box size="1.2 0.4 1.6"/>
                                    </shape>
                                </transform>
                                
                                <!-- 左翼 -->
                                <transform translation="-0.9 0 0">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.2 0.27 0.37" specularColor="0.3 0.3 0.3"/>
                                        </appearance>
                                        <box size="0.7 0.1 1.2"/>
                                    </shape>
                                    <!-- 左翼武器 -->
                                    <transform translation="0 -0.1 0.3">
                                        <shape>
                                            <appearance>
                                                <material diffuseColor="0.91 0.3 0.24" emissiveColor="0.5 0 0"/>
                                            </appearance>
                                            <cylinder radius="0.08" height="0.3"/>
                                        </shape>
                                    </transform>
                                </transform>
                                
                                <!-- 右翼 -->
                                <transform translation="0.9 0 0">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.2 0.27 0.37" specularColor="0.3 0.3 0.3"/>
                                        </appearance>
                                        <box size="0.7 0.1 1.2"/>
                                    </shape>
                                    <!-- 右翼武器 -->
                                    <transform translation="0 -0.1 0.3">
                                        <shape>
                                            <appearance>
                                                <material diffuseColor="0.91 0.3 0.24" emissiveColor="0.5 0 0"/>
                                            </appearance>
                                            <cylinder radius="0.08" height="0.3"/>
                                        </shape>
                                    </transform>
                                </transform>
                                
                                <!-- 驾驶舱 -->
                                <transform translation="0 0.15 0.3">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.2 0.58 0.82" transparency="0.3" specularColor="1 1 1"/>
                                        </appearance>
                                        <box size="0.4 0.2 0.3"/>
                                    </shape>
                                </transform>
                                
                                <!-- 引擎喷口 -->
                                <transform translation="0 -0.1 -0.7">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="1 0.42 0.42" emissiveColor="1 0.3 0.3"/>
                                        </appearance>
                                        <cylinder radius="0.15" height="0.2"/>
                                    </shape>
                                </transform>
                                
                                <!-- 尾翼 -->
                                <transform translation="0 0.25 -0.6">
                                    <shape>
                                        <appearance>
                                            <material diffuseColor="0.1 0.15 0.18"/>
                                        </appearance>
                                        <box size="0.05 0.4 0.3"/>
                                    </shape>
                                </transform>
                            </transform>
                            
                            <!-- 光照 -->
                            <directionalLight direction="0 -0.5 -1" intensity="0.8"/>
                            <directionalLight direction="1 0 0" intensity="0.3" color="1 0.8 0.8"/>
                            <pointLight location="0 2 3" intensity="0.4"/>
                            
                            <!-- 视角 -->
                            <viewpoint position="0 0.5 3" orientation="-0.1 0 0 0"/>
                        </scene>
                    </x3d>`,
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
     * 将SVG或X3D转换为Image对象
     */
    async loadSVGAsImage(key, data) {
        // 检查是否是X3D
        if (data.type === 'x3d') {
            return this.loadX3DAsImage(key, data);
        }
        
        // 原SVG加载逻辑
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
                if (key.startsWith('bosses.')) {
                    console.log(`Boss资源加载成功: ${key}, 图像尺寸: ${img.width}x${img.height}`);
                }
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
     * 将X3D转换为Image对象
     */
    async loadX3DAsImage(key, data) {
        return new Promise((resolve) => {
            // 创建临时容器
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-1000px';
            container.style.top = '-1000px';
            container.innerHTML = data.x3d;
            document.body.appendChild(container);
            
            // 等待X3DOM初始化
            setTimeout(() => {
                const x3dElement = container.querySelector('x3d');
                if (x3dElement) {
                    // 等待渲染完成
                    setTimeout(() => {
                        const x3dCanvas = x3dElement.querySelector('canvas');
                        if (x3dCanvas) {
                            // 创建图像
                            const img = new Image();
                            img.onload = () => {
                                this.assets.set(key, {
                                    image: img,
                                    width: data.width,
                                    height: data.height,
                                    type: 'x3d'
                                });
                                console.log(`X3D Boss资源加载成功: ${key}`);
                                
                                // 清理临时容器
                                document.body.removeChild(container);
                                resolve();
                            };
                            
                            // 转换canvas到图像
                            img.src = x3dCanvas.toDataURL();
                        } else {
                            console.error(`X3D canvas未找到: ${key}`);
                            document.body.removeChild(container);
                            resolve();
                        }
                    }, 500); // 等待渲染
                } else {
                    console.error(`X3D元素未找到: ${key}`);
                    document.body.removeChild(container);
                    resolve();
                }
            }, 100); // 等待X3DOM初始化
        });
    }
    
    /**
     * 检查资源是否存在
     */
    hasAsset(key) {
        return this.assets.has(key);
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
        
        // 只为Boss资源打印日志
        if (key.startsWith('bosses.')) {
            console.log(`绘制Boss资源: ${key} at (${x}, ${y}), 尺寸: ${asset.width}x${asset.height}`);
            console.log(`图像实际尺寸: ${asset.image.width}x${asset.image.height}, 完成: ${asset.image.complete}`);
            
            // 绘制一个红色矩形来标记Boss位置
            ctx.save();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3;
            ctx.strokeRect(x - asset.width/2, y - asset.height/2, asset.width, asset.height);
            ctx.restore();
        }
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        
        try {
            // 检查图像是否有效
            if (key.startsWith('bosses.') && (!asset.image.width || !asset.image.height)) {
                console.error(`Boss图像尺寸无效: ${key}, width=${asset.image.width}, height=${asset.image.height}`);
                // 绘制替代图形
                ctx.fillStyle = 'purple';
                ctx.fillRect(-asset.width / 2, -asset.height / 2, asset.width, asset.height);
                ctx.fillStyle = 'white';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('BOSS', 0, 0);
            } else {
                ctx.drawImage(
                    asset.image,
                    -asset.width / 2,
                    -asset.height / 2,
                    asset.width,
                    asset.height
                );
                if (key.startsWith('bosses.')) {
                    console.log(`成功绘制Boss图像: ${key}`);
                }
            }
        } catch (error) {
            console.error(`绘制资源失败: ${key}`, error);
            // 绘制错误替代图形
            ctx.fillStyle = 'red';
            ctx.fillRect(-asset.width / 2, -asset.height / 2, asset.width, asset.height);
        }
        
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