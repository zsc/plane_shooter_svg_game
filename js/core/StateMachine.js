/**
 * 游戏状态机
 * 管理游戏的不同状态和状态转换
 */
class StateMachine {
    constructor() {
        this.states = new Map();
        this.currentState = null;
        this.previousState = null;
        this.transitioning = false;
        
        // 状态转换回调
        this.onStateChangeCallbacks = [];
        
        // 初始化状态
        this.initStates();
    }

    /**
     * 初始化游戏状态
     */
    initStates() {
        // 菜单状态
        this.registerState(GameConfig.STATES.MENU, {
            enter: () => {
                console.log('进入菜单状态');
            },
            update: (dt) => {
                // 菜单更新逻辑
            },
            render: (renderer) => {
                renderer.clear();
                
                // 绘制简单的星空背景
                renderer.drawRect(0, 0, GameConfig.CANVAS.WIDTH, GameConfig.CANVAS.HEIGHT, '#001a33');
                
                // 绘制一些星星装饰
                const stars = [
                    {x: 100, y: 100}, {x: 200, y: 150}, {x: 500, y: 100},
                    {x: 400, y: 200}, {x: 300, y: 250}, {x: 550, y: 180}
                ];
                stars.forEach(star => {
                    const twinkle = Math.sin(Date.now() * 0.003 + star.x) * 0.5 + 0.5;
                    renderer.ctx.globalAlpha = 0.3 + twinkle * 0.7;
                    renderer.drawCircle(star.x, star.y, 2, '#FFFFFF');
                });
                renderer.ctx.globalAlpha = 1;
                
                // 标题动画效果
                const titleY = 200 + Math.sin(Date.now() * 0.002) * 10;
                renderer.drawText('全民飞机大战', 320, titleY, 48, '#FFD700');
                
                // 副标题
                renderer.drawText('ARCADE SHOOTER', 320, titleY + 50, 16, '#888888');
            },
            exit: () => {
                console.log('退出菜单状态');
            },
            handleInput: (input) => {
                if (input.isKeyPressed('Enter')) {
                    this.changeState(GameConfig.STATES.PLAYING);
                }
            }
        });

        // 游戏进行中状态
        this.registerState(GameConfig.STATES.PLAYING, {
            enter: () => {
                console.log('进入游戏状态');
            },
            update: (dt) => {
                // 游戏更新逻辑将在Game类中实现
            },
            render: (renderer) => {
                // 游戏渲染逻辑将在Game类中实现
            },
            exit: () => {
                console.log('退出游戏状态');
            },
            handleInput: (input) => {
                if (input.isKeyPressed('Escape')) {
                    this.changeState(GameConfig.STATES.PAUSED);
                }
            }
        });

        // 暂停状态
        this.registerState(GameConfig.STATES.PAUSED, {
            enter: () => {
                console.log('游戏暂停');
            },
            update: (dt) => {
                // 暂停时不更新游戏逻辑
            },
            render: (renderer) => {
                // 注意：游戏画面应该在Game.js中先绘制，这里只添加暂停覆盖层
                // 半透明黑色覆盖层
                renderer.drawRect(0, 0, GameConfig.CANVAS.WIDTH, GameConfig.CANVAS.HEIGHT, 'rgba(0,0,0,0.7)');
                
                // 暂停文字
                renderer.drawText('游戏暂停', 320, 400, 48, '#FFFFFF');
                
                // 闪烁的继续提示
                if (Math.floor(Date.now() / 500) % 2 === 0) {
                    renderer.drawText('按 ESC 继续游戏', 320, 480, 24, '#00FF00');
                }
            },
            exit: () => {
                console.log('恢复游戏');
            },
            handleInput: (input) => {
                if (input.isKeyPressed('Escape')) {
                    this.changeState(GameConfig.STATES.PLAYING);
                }
            }
        });

        // 游戏结束状态
        this.registerState(GameConfig.STATES.GAME_OVER, {
            enter: () => {
                console.log('游戏结束');
            },
            update: (dt) => {
                // 游戏结束动画等
            },
            render: (renderer) => {
                renderer.clear();
                renderer.drawText('游戏结束', 320, 400, 48, '#FF0000');
                renderer.drawText('按 Enter 返回菜单', 320, 500, 24, '#FFFFFF');
            },
            exit: () => {
                console.log('离开游戏结束状态');
            },
            handleInput: (input) => {
                if (input.isKeyPressed('Enter')) {
                    this.changeState(GameConfig.STATES.MENU);
                }
            }
        });

        // 加载状态
        this.registerState(GameConfig.STATES.LOADING, {
            enter: () => {
                console.log('加载中...');
            },
            update: (dt) => {
                // 加载资源逻辑
            },
            render: (renderer) => {
                renderer.clear();
                renderer.drawText('加载中...', 320, 480, 32, '#FFFFFF');
            },
            exit: () => {
                console.log('加载完成');
            },
            handleInput: (input) => {
                // 加载时不处理输入
            }
        });
    }

    /**
     * 注册状态
     * @param {string} name - 状态名称
     * @param {Object} state - 状态对象
     */
    registerState(name, state) {
        if (!state.enter || !state.update || !state.render || !state.exit) {
            throw new Error(`状态 ${name} 必须包含 enter, update, render, exit 方法`);
        }
        this.states.set(name, state);
    }

    /**
     * 改变状态
     * @param {string} newStateName - 新状态名称
     * @param {Object} params - 传递给新状态的参数
     */
    changeState(newStateName, params = {}) {
        if (this.transitioning) {
            console.warn('正在转换状态中，忽略新的状态转换请求');
            return;
        }

        const newState = this.states.get(newStateName);
        if (!newState) {
            console.error(`状态 ${newStateName} 不存在`);
            return;
        }

        this.transitioning = true;

        // 退出当前状态
        if (this.currentState) {
            this.currentState.exit();
            this.previousState = this.currentState;
        }

        // 进入新状态
        this.currentState = newState;
        this.currentState.enter(params);

        // 触发状态改变回调
        this.onStateChangeCallbacks.forEach(callback => {
            callback(newStateName, this.previousState);
        });

        this.transitioning = false;
    }

    /**
     * 更新当前状态
     * @param {number} dt - 时间增量
     */
    update(dt) {
        if (this.currentState && this.currentState.update) {
            this.currentState.update(dt);
        }
    }

    /**
     * 渲染当前状态
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        if (this.currentState && this.currentState.render) {
            this.currentState.render(renderer);
        }
    }

    /**
     * 处理输入
     * @param {InputManager} input - 输入管理器
     */
    handleInput(input) {
        if (this.currentState && this.currentState.handleInput) {
            this.currentState.handleInput(input);
        }
    }

    /**
     * 获取当前状态名称
     * @returns {string} 当前状态名称
     */
    getCurrentStateName() {
        for (let [name, state] of this.states) {
            if (state === this.currentState) {
                return name;
            }
        }
        return null;
    }

    /**
     * 添加状态改变监听器
     * @param {Function} callback - 回调函数
     */
    onStateChange(callback) {
        this.onStateChangeCallbacks.push(callback);
    }

    /**
     * 检查是否在特定状态
     * @param {string} stateName - 状态名称
     * @returns {boolean} 是否在指定状态
     */
    isInState(stateName) {
        return this.getCurrentStateName() === stateName;
    }

    /**
     * 重置状态机
     */
    reset() {
        if (this.currentState && this.currentState.exit) {
            this.currentState.exit();
        }
        this.currentState = null;
        this.previousState = null;
        this.transitioning = false;
    }
}