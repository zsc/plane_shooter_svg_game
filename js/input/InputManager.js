/**
 * 输入管理器
 * 处理键盘、鼠标和触摸输入
 */
class InputManager {
    constructor() {
        // 键盘状态
        this.keys = new Map();
        this.previousKeys = new Map();
        
        // 鼠标状态
        this.mouse = {
            x: 0,
            y: 0,
            buttons: new Map(),
            previousButtons: new Map()
        };
        
        // 触摸状态
        this.touches = new Map();
        
        // 输入缓冲
        this.inputBuffer = [];
        this.bufferSize = GameConfig.INPUT.BUFFER_SIZE;
        
        // 输入向量（用于移动）
        this.inputVector = { x: 0, y: 0 };
        this.smoothedVector = { x: 0, y: 0 };
        
        // 绑定事件
        this.bindEvents();
    }

    /**
     * 绑定输入事件
     */
    bindEvents() {
        // 键盘事件
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // 鼠标事件
        window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // 触摸事件
        window.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        window.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        
        // 防止右键菜单
        window.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * 处理键盘按下
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleKeyDown(event) {
        // 防止默认行为（如空格滚动页面，Tab切换焦点）
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'NumpadEnter', 'Tab'].includes(event.code)) {
            event.preventDefault();
        }
        
        
        // 记录按键状态
        if (!this.keys.get(event.code)) {
            this.keys.set(event.code, {
                pressed: true,
                time: Date.now()
            });
            
            // 添加到输入缓冲
            this.addToBuffer({
                type: 'keydown',
                key: event.code,
                time: Date.now()
            });
        }
    }

    /**
     * 处理键盘释放
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleKeyUp(event) {
        // 完全删除按键，而不是设置为false
        this.keys.delete(event.code);
        
        // 添加到输入缓冲
        this.addToBuffer({
            type: 'keyup',
            key: event.code,
            time: Date.now()
        });
    }

    /**
     * 处理鼠标按下
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseDown(event) {
        this.mouse.buttons.set(event.button, true);
        this.updateMousePosition(event);
    }

    /**
     * 处理鼠标释放
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseUp(event) {
        this.mouse.buttons.set(event.button, false);
    }

    /**
     * 处理鼠标移动
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseMove(event) {
        this.updateMousePosition(event);
    }

    /**
     * 更新鼠标位置
     * @param {MouseEvent} event - 鼠标事件
     */
    updateMousePosition(event) {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = event.clientX - rect.left;
        this.mouse.y = event.clientY - rect.top;
    }

    /**
     * 处理触摸开始
     * @param {TouchEvent} event - 触摸事件
     */
    handleTouchStart(event) {
        event.preventDefault();
        for (let touch of event.changedTouches) {
            this.touches.set(touch.identifier, {
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY,
                time: Date.now()
            });
        }
    }

    /**
     * 处理触摸结束
     * @param {TouchEvent} event - 触摸事件
     */
    handleTouchEnd(event) {
        event.preventDefault();
        for (let touch of event.changedTouches) {
            this.touches.delete(touch.identifier);
        }
    }

    /**
     * 处理触摸移动
     * @param {TouchEvent} event - 触摸事件
     */
    handleTouchMove(event) {
        event.preventDefault();
        for (let touch of event.changedTouches) {
            if (this.touches.has(touch.identifier)) {
                const touchData = this.touches.get(touch.identifier);
                touchData.x = touch.clientX;
                touchData.y = touch.clientY;
            }
        }
    }

    /**
     * 添加到输入缓冲
     * @param {Object} input - 输入数据
     */
    addToBuffer(input) {
        this.inputBuffer.push(input);
        if (this.inputBuffer.length > this.bufferSize) {
            this.inputBuffer.shift();
        }
    }

    /**
     * 更新输入状态
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        // 保存上一帧的按键状态
        this.previousKeys = new Map(this.keys);
        this.mouse.previousButtons = new Map(this.mouse.buttons);
        
        // 更新输入向量
        this.updateInputVector();
        
        // 平滑输入向量
        this.smoothInputVector(deltaTime);
    }

    /**
     * 更新输入向量
     */
    updateInputVector() {
        this.inputVector.x = 0;
        this.inputVector.y = 0;
        
        // 键盘输入
        if (this.isKeyDown('ArrowLeft') || this.isKeyDown('KeyA')) {
            this.inputVector.x -= 1;
        }
        if (this.isKeyDown('ArrowRight') || this.isKeyDown('KeyD')) {
            this.inputVector.x += 1;
        }
        if (this.isKeyDown('ArrowUp') || this.isKeyDown('KeyW')) {
            this.inputVector.y -= 1;
        }
        if (this.isKeyDown('ArrowDown') || this.isKeyDown('KeyS')) {
            this.inputVector.y += 1;
        }
        
        // 归一化输入向量
        const magnitude = Math.sqrt(this.inputVector.x * this.inputVector.x + this.inputVector.y * this.inputVector.y);
        if (magnitude > 0) {
            this.inputVector.x /= magnitude;
            this.inputVector.y /= magnitude;
        }
        
        // 应用死区
        if (magnitude < GameConfig.INPUT.DEAD_ZONE) {
            this.inputVector.x = 0;
            this.inputVector.y = 0;
        }
    }

    /**
     * 平滑输入向量
     * @param {number} deltaTime - 时间增量
     */
    smoothInputVector(deltaTime) {
        const smoothFactor = GameConfig.INPUT.SMOOTH_FACTOR;
        
        this.smoothedVector.x += (this.inputVector.x - this.smoothedVector.x) * smoothFactor;
        this.smoothedVector.y += (this.inputVector.y - this.smoothedVector.y) * smoothFactor;
        
        // 清理极小值
        if (Math.abs(this.smoothedVector.x) < 0.01) this.smoothedVector.x = 0;
        if (Math.abs(this.smoothedVector.y) < 0.01) this.smoothedVector.y = 0;
    }

    /**
     * 检查按键是否按下
     * @param {string} keyCode - 键码
     * @returns {boolean} 是否按下
     */
    isKeyDown(keyCode) {
        const key = this.keys.get(keyCode);
        return key !== undefined && key.pressed;
    }

    /**
     * 检查按键是否刚刚按下
     * @param {string} keyCode - 键码
     * @returns {boolean} 是否刚按下
     */
    isKeyPressed(keyCode) {
        const current = this.keys.get(keyCode);
        const previous = this.previousKeys.get(keyCode);
        // 当前帧有按键且上一帧没有
        return (current && current.pressed) && !previous;
    }

    /**
     * 检查按键是否刚刚释放
     * @param {string} keyCode - 键码
     * @returns {boolean} 是否刚释放
     */
    isKeyReleased(keyCode) {
        const current = this.keys.get(keyCode);
        const previous = this.previousKeys.get(keyCode);
        // 上一帧有按键且当前帧没有
        return previous && previous.pressed && !current;
    }

    /**
     * 获取移动输入
     * @returns {Object} 输入向量
     */
    getMovementInput() {
        return {
            x: this.smoothedVector.x,
            y: this.smoothedVector.y
        };
    }

    /**
     * 获取原始输入向量
     * @returns {Object} 原始输入向量
     */
    getRawInput() {
        return {
            x: this.inputVector.x,
            y: this.inputVector.y
        };
    }

    /**
     * 检查鼠标按钮是否按下
     * @param {number} button - 按钮编号
     * @returns {boolean} 是否按下
     */
    isMouseDown(button) {
        return this.mouse.buttons.get(button) || false;
    }

    /**
     * 检查鼠标按钮是否刚刚按下
     * @param {number} button - 按钮编号
     * @returns {boolean} 是否刚按下
     */
    isMousePressed(button) {
        const current = this.mouse.buttons.get(button);
        const previous = this.mouse.previousButtons.get(button);
        return current && !previous;
    }

    /**
     * 获取鼠标位置
     * @returns {Object} 鼠标位置
     */
    getMousePosition() {
        return {
            x: this.mouse.x,
            y: this.mouse.y
        };
    }

    /**
     * 获取触摸点
     * @returns {Array} 触摸点数组
     */
    getTouches() {
        return Array.from(this.touches.values());
    }

    /**
     * 检查是否有触摸
     * @returns {boolean} 是否有触摸
     */
    hasTouches() {
        return this.touches.size > 0;
    }

    /**
     * 清除所有输入
     */
    clear() {
        this.keys.clear();
        this.previousKeys.clear();
        this.mouse.buttons.clear();
        this.mouse.previousButtons.clear();
        this.touches.clear();
        this.inputBuffer = [];
        this.inputVector = { x: 0, y: 0 };
        this.smoothedVector = { x: 0, y: 0 };
    }

    /**
     * 获取输入缓冲
     * @returns {Array} 输入缓冲
     */
    getInputBuffer() {
        return [...this.inputBuffer];
    }
}