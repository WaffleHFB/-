// 配置 Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.1/min/vs' }});

// 工具管理器
class ToolManager {
    constructor() {
        this.currentCategory = null;
        this.currentTool = null;
        this.editors = {};
        
        // 添加加载提示
        const container = document.querySelector('.container');
        const loading = document.createElement('div');
        loading.className = 'loading-message';
        loading.textContent = '正在初始化工具...';
        container.prepend(loading);
        
        this.initializeEventListeners();
        
        // 初始化完成后移除加载提示
        loading.remove();
    }

    initializeEventListeners() {
        // 分类切换
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchCategory(e.target.dataset.category));
        });

        // 工具切换
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTool(e.target.dataset.tool));
        });
    }

    switchCategory(category) {
        if (this.currentCategory === category) return;

        // 更新UI
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        document.querySelectorAll('.tool-category').forEach(cat => {
            cat.style.display = cat.id === `${category}-tools` ? 'block' : 'none';
        });

        this.currentCategory = category;
        this.currentTool = null;
        this.clearToolContainer();
    }

    switchTool(tool) {
        if (this.currentTool === tool) return;

        // 更新UI
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });

        this.loadTool(tool);
        this.currentTool = tool;
    }

    loadTool(tool) {
        const template = document.getElementById(`${tool}-tool`);
        if (!template) {
            console.error(`找不到工具模板: ${tool}`);
            return;
        }

        const toolContainer = document.querySelector('.tool-container');
        toolContainer.innerHTML = '<div class="loading">加载中...</div>';

        try {
            toolContainer.innerHTML = '';
            toolContainer.appendChild(template.content.cloneNode(true));

            // 初始化特定工具
            switch(tool) {
                case 'formatter':
                    this.initializeFormatter();
                    break;
                case 'json':
                    this.initializeJsonTool();
                    break;
                case 'color':
                    this.initializeColorTool();
                    break;
                case 'image':
                    this.initializeImageTool();
                    break;
                case 'regex':
                    this.initializeRegexTool();
                    break;
                case 'gradient':
                    this.initializeGradientTool();
                    break;
                case 'shadow':
                    this.initializeShadowTool();
                    break;
                case 'animation':
                    this.initializeAnimationTool();
                    break;
                case 'flex':
                    this.initializeFlexTool();
                    break;
                case 'grid':
                    this.initializeGridTool();
                    break;
                case 'svg':
                    this.initializeSvgTool();
                    break;
            }
        } catch (error) {
            console.error('工具加载失败:', error);
            toolContainer.innerHTML = `
                <div class="error-message">
                    工具加载失败，请刷新页面重试
                    <button onclick="location.reload()">刷新页面</button>
                </div>
            `;
        }
    }

    initializeFormatter() {
        require(['vs/editor/editor.main'], () => {
            // 创建输入编辑器
            this.editors.input = monaco.editor.create(document.getElementById('input-editor'), {
                value: '',
                language: 'javascript',
                theme: 'vs-dark',
                minimap: { enabled: false },
                automaticLayout: true
            });

            // 创建输出编辑器
            this.editors.output = monaco.editor.create(document.getElementById('output-editor'), {
                value: '',
                language: 'javascript',
                theme: 'vs-dark',
                minimap: { enabled: false },
                readOnly: true,
                automaticLayout: true
            });

            // 添加格式化功能
            document.querySelector('.format-btn').addEventListener('click', () => {
                this.formatCode();
            });

            // 语言切换
            document.querySelector('.language-select').addEventListener('change', (e) => {
                const language = e.target.value;
                monaco.editor.setModelLanguage(this.editors.input.getModel(), language);
                monaco.editor.setModelLanguage(this.editors.output.getModel(), language);
            });
        });
    }

    async formatCode() {
        const code = this.editors.input.getValue();
        const language = document.querySelector('.language-select').value;

        try {
            let formatted;
            switch(language) {
                case 'html':
                    formatted = prettier.format(code, {
                        parser: 'html',
                        plugins: prettierPlugins,
                        printWidth: 80,
                        tabWidth: 2
                    });
                    break;
                case 'css':
                    formatted = prettier.format(code, {
                        parser: 'css',
                        plugins: prettierPlugins,
                        printWidth: 80,
                        tabWidth: 2
                    });
                    break;
                case 'javascript':
                case 'typescript':
                    formatted = prettier.format(code, {
                        parser: 'babel',
                        plugins: prettierPlugins,
                        printWidth: 80,
                        tabWidth: 2,
                        semi: true,
                        singleQuote: true
                    });
                    break;
                // 添加其他语言的格式化支持...
            }
            this.editors.output.setValue(formatted);
        } catch (error) {
            this.showError('格式化失败：' + error.message);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('.tool-container').prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    clearToolContainer() {
        document.querySelector('.tool-container').innerHTML = '';
        this.editors = {};
    }

    initializeImageTool() {
        const dropZone = document.getElementById('dropZone');
        const imageInput = document.getElementById('imageInput');
        const qualitySlider = document.getElementById('qualitySlider');
        const qualityValue = document.getElementById('qualityValue');
        const processButton = document.getElementById('processImages');
        const resultsContainer = document.getElementById('imageResults');

        // 拖放功能
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
            if (files.length) {
                imageInput.files = e.dataTransfer.files;
                this.handleImageFiles(files);
            }
        });

        // 文件选择
        imageInput.addEventListener('change', () => {
            const files = Array.from(imageInput.files);
            this.handleImageFiles(files);
        });

        // 质量滑块
        qualitySlider.addEventListener('input', () => {
            qualityValue.textContent = `${qualitySlider.value}%`;
        });

        // 处按钮
        processButton.addEventListener('click', () => {
            const files = Array.from(imageInput.files);
            this.processImages(files);
        });
    }

    async handleImageFiles(files) {
        const resultsContainer = document.getElementById('imageResults');
        resultsContainer.innerHTML = '';

        for (const file of files) {
            const result = document.createElement('div');
            result.className = 'image-result-item';
            
            // 显示原始图片
            const originalImg = document.createElement('img');
            originalImg.src = URL.createObjectURL(file);
            result.appendChild(originalImg);

            resultsContainer.appendChild(result);
        }
    }

    async processImages(files) {
        const quality = document.getElementById('qualitySlider').value / 100;
        const maxWidth = parseInt(document.getElementById('maxWidth').value);
        const format = document.getElementById('formatSelect').value;

        for (const file of files) {
            try {
                const result = await Tools.processImage(file, { quality, maxWidth, format });
                this.displayImageResult(file, result);
            } catch (error) {
                console.error('处理图片失败:', error);
            }
        }
    }

    displayImageResult(originalFile, result) {
        const resultsContainer = document.getElementById('imageResults');
        const resultItem = document.createElement('div');
        resultItem.className = 'image-result-item';

        // 添加结果信息
        resultItem.innerHTML = `
            <div class="image-info">
                <p>原始大小: ${(originalFile.size / 1024).toFixed(2)} KB</p>
                <p>压缩后: ${(result.compressedSize / 1024).toFixed(2)} KB</p>
                <p>压缩率: ${result.ratio}%</p>
                <p>尺寸: ${result.width}x${result.height}</p>
            </div>
            <div class="image-preview">
                <img src="${result.dataUrl}" alt="优化后的图片">
            </div>
            <button class="download-btn">下载</button>
        `;

        // 添加下载功能
        resultItem.querySelector('.download-btn').addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = result.dataUrl;
            link.download = `optimized_${originalFile.name}`;
            link.click();
        });

        resultsContainer.appendChild(resultItem);
    }

    // 添加 JSON 工具初始化方法
    initializeJsonTool() {
        const inputEditor = document.getElementById('json-input-editor');
        const outputEditor = document.getElementById('json-output-editor');
        
        require(['vs/editor/editor.main'], () => {
            this.editors.jsonInput = monaco.editor.create(inputEditor, {
                value: '',
                language: 'json',
                theme: 'vs-dark',
                minimap: { enabled: false },
                automaticLayout: true
            });

            this.editors.jsonOutput = monaco.editor.create(outputEditor, {
                value: '',
                language: 'json',
                theme: 'vs-dark',
                minimap: { enabled: false },
                readOnly: true,
                automaticLayout: true
            });

            // 添加按钮事件监听
            document.querySelector('.format-json').addEventListener('click', () => {
                try {
                    const input = this.editors.jsonInput.getValue();
                    const formatted = Tools.formatJSON(input);
                    this.editors.jsonOutput.setValue(formatted);
                } catch (error) {
                    this.showError('JSON格式化失败：' + error.message);
                }
            });

            document.querySelector('.compress-json').addEventListener('click', () => {
                try {
                    const input = this.editors.jsonInput.getValue();
                    const compressed = JSON.stringify(JSON.parse(input));
                    this.editors.jsonOutput.setValue(compressed);
                } catch (error) {
                    this.showError('JSON压缩失败：' + error.message);
                }
            });

            document.querySelector('.validate-json').addEventListener('click', () => {
                const input = this.editors.jsonInput.getValue();
                const result = Tools.validateJSON(input);
                if (result.valid) {
                    this.showSuccess('JSON格式有效！');
                } else {
                    this.showError(`JSON无效：${result.error}`);
                }
            });

            document.querySelector('.copy-json').addEventListener('click', () => {
                const output = this.editors.jsonOutput.getValue();
                navigator.clipboard.writeText(output)
                    .then(() => this.showSuccess('已复制到贴板！'))
                    .catch(() => this.showError('复制失败'));
            });
        });
    }

    // 添加颜色工具初始化方法
    initializeColorTool() {
        const colorPicker = document.getElementById('colorPicker');
        const hexInput = document.getElementById('hexInput');
        const rgbInput = document.getElementById('rgbInput');
        const hslInput = document.getElementById('hslInput');
        const cmykInput = document.getElementById('cmykInput');

        const updateAllFormats = (hex) => {
            const rgb = Tools.hexToRgb(hex);
            const hsl = Tools.rgbToHsl(rgb.r, rgb.g, rgb.b);
            const cmyk = Tools.rgbToCmyk(rgb.r, rgb.g, rgb.b);

            hexInput.value = hex;
            rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
            cmykInput.value = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
        };

        colorPicker.addEventListener('input', (e) => updateAllFormats(e.target.value));
        hexInput.addEventListener('input', (e) => {
            const hex = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(hex)) {
                colorPicker.value = hex;
                updateAllFormats(hex);
            }
        });

        // 初始化调色板
        document.querySelectorAll('.palette-item').forEach(item => {
            const color = item.dataset.color;
            item.style.backgroundColor = color;
            item.addEventListener('click', () => {
                colorPicker.value = color;
                updateAllFormats(color);
            });
        });
    }

    // 添加正则测试工具初始化方法
    initializeRegexTool() {
        const regexInput = document.getElementById('regexInput');
        const regexFlags = document.getElementById('regexFlags');
        const testString = document.getElementById('testString');
        const resultDiv = document.getElementById('regexResult');

        const updateResult = () => {
            const pattern = regexInput.value;
            const flags = regexFlags.value;
            const text = testString.value;

            if (!pattern) {
                resultDiv.innerHTML = '请输入正则表达式';
                return;
            }

            try {
                const matches = Tools.testRegex(pattern, flags, text);
                if (matches) {
                    resultDiv.innerHTML = `找到 ${matches.length} 个匹配：<br>` +
                        matches.map(m => `<span class="match">${m}</span>`).join('<br>');
                } else {
                    resultDiv.innerHTML = '没有找到匹配';
                }
            } catch (error) {
                resultDiv.innerHTML = `错误：${error.message}`;
            }
        };

        regexInput.addEventListener('input', updateResult);
        regexFlags.addEventListener('input', updateResult);
        testString.addEventListener('input', updateResult);
    }

    // 添加渐变生成器初始化方法
    initializeGradientTool() {
        const color1Input = document.getElementById('gradientColor1');
        const color2Input = document.getElementById('gradientColor2');
        const angleInput = document.getElementById('gradientAngle');
        const typeSelect = document.getElementById('gradientType');
        const preview = document.getElementById('gradientPreview');
        const output = document.getElementById('gradientOutput');

        const updateGradient = () => {
            const gradient = Tools.generateGradient(
                color1Input.value,
                color2Input.value,
                typeSelect.value,
                angleInput.value
            );
            preview.style.background = gradient;
            output.value = gradient;
        };

        color1Input.addEventListener('input', updateGradient);
        color2Input.addEventListener('input', updateGradient);
        angleInput.addEventListener('input', updateGradient);
        typeSelect.addEventListener('change', updateGradient);

        // 初始化
        updateGradient();
    }

    // 添加成功提示方法
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        document.querySelector('.tool-container').prepend(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
    }

    // 添加阴影工具初始化方法
    initializeShadowTool() {
        const shadowX = document.getElementById('shadowX');
        const shadowY = document.getElementById('shadowY');
        const shadowBlur = document.getElementById('shadowBlur');
        const shadowSpread = document.getElementById('shadowSpread');
        const shadowColor = document.getElementById('shadowColor');
        const shadowColorText = document.getElementById('shadowColorText');
        const shadowInset = document.getElementById('shadowInset');
        const preview = document.getElementById('shadowPreview');
        const output = document.getElementById('shadowOutput');

        // 更新所有值显示
        const updateValueDisplays = () => {
            document.querySelectorAll('.input-group input[type="range"]').forEach(input => {
                const display = input.parentElement.querySelector('.value-display');
                if (display) {
                    display.textContent = `${input.value}px`;
                }
            });
        };

        // 更新阴影效果
        const updateShadow = () => {
            const x = shadowX.value;
            const y = shadowY.value;
            const blur = shadowBlur.value;
            const spread = shadowSpread.value;
            const color = shadowColor.value;
            const inset = shadowInset.checked ? 'inset' : '';

            const shadowValue = `${inset} ${x}px ${y}px ${blur}px ${spread}px ${color}`;
            preview.style.boxShadow = shadowValue;
            output.textContent = `box-shadow: ${shadowValue};`;
        };

        // 添加事件监听器
        [shadowX, shadowY, shadowBlur, shadowSpread].forEach(input => {
            input.addEventListener('input', () => {
                updateValueDisplays();
                updateShadow();
            });
        });

        shadowColor.addEventListener('input', () => {
            shadowColorText.value = shadowColor.value;
            updateShadow();
        });

        shadowColorText.addEventListener('input', () => {
            if (/^#[0-9A-F]{6}$/i.test(shadowColorText.value)) {
                shadowColor.value = shadowColorText.value;
                updateShadow();
            }
        });

        shadowInset.addEventListener('change', updateShadow);

        // 添加复制功能
        document.querySelector('.shadow-tool-container .copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(output.textContent)
                .then(() => this.showSuccess('CSS代码复制到剪贴板！'))
                .catch(() => this.showError('复制失败'));
        });

        // 初始化显示
        updateValueDisplays();
        updateShadow();
    }

    // 添加动画工具初始化方法
    initializeAnimationTool() {
        // 首先确保所有必需的元素都存在
        const elements = {
            animationName: document.getElementById('animationName'),
            duration: document.getElementById('animationDuration'),
            timing: document.getElementById('animationTiming'),
            delay: document.getElementById('animationDelay'),
            iterations: document.getElementById('animationIterations'),
            infinite: document.getElementById('animationInfinite'),
            direction: document.getElementById('animationDirection'),
            preview: document.getElementById('animationPreview'),
            output: document.getElementById('animationOutput'),
            keyframesList: document.querySelector('.keyframes-list'),
            addKeyframeBtn: document.getElementById('addKeyframe')
        };

        // 检查是否所有元素都存在
        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`找不到元素: ${key}`);
                throw new Error(`初始化失败：找不到必需的元素 ${key}`);
            }
        }

        // 清空现有的关键帧列表
        elements.keyframesList.innerHTML = '';

        // 初始化关键帧数据
        let keyframes = [{
            percentage: 0,
            properties: [{ name: 'transform', value: 'translate(0, 0)' }]
        }];

        // 添加新的关键帧
        const addKeyframe = (percentage) => {
            const keyframeDiv = document.createElement('div');
            keyframeDiv.className = 'keyframe-item';
            keyframeDiv.innerHTML = `
                <div class="keyframe-header">
                    <input type="number" class="percentage" value="${percentage}" min="0" max="100" step="1">
                    <span>%</span>
                    <button class="remove-keyframe">×</button>
                </div>
                <div class="properties">
                    <div class="property">
                        <select class="property-select">
                            <option value="transform">transform</option>
                            <option value="opacity">opacity</option>
                            <option value="background-color">background-color</option>
                            <option value="scale">scale</option>
                            <option value="rotate">rotate</option>
                            <option value="translate">translate</option>
                        </select>
                        <input type="text" class="property-value" placeholder="属性值">
                        <button class="remove-property">-</button>
                    </div>
                    <button class="add-property">+</button>
                </div>
            `;

            keyframesList.appendChild(keyframeDiv);
            
            // 添加事件监听器
            addKeyframeEventListeners(keyframeDiv);

            // 更新关键帧数据
            updateKeyframes();
            updateAnimation();
        };

        // 更新关键帧数据
        const updateKeyframes = () => {
            keyframes = Array.from(keyframesList.querySelectorAll('.keyframe-item')).map(item => {
                const percentage = parseInt(item.querySelector('.percentage').value) || 0;
                const properties = Array.from(item.querySelectorAll('.property')).map(prop => ({
                    name: prop.querySelector('.property-select').value,
                    value: prop.querySelector('.property-value').value
                })).filter(prop => prop.value.trim() !== '');

                return { percentage, properties };
            });
        };

        // 更新动画预览和代码
        const updateAnimation = () => {
            // 生成keyframes代码
            const keyframesCode = keyframes
                .sort((a, b) => a.percentage - b.percentage)
                .map(frame => {
                    const properties = frame.properties
                        .map(prop => `    ${prop.name}: ${prop.value};`)
                        .join('\n');
                    return `  ${frame.percentage}% {\n${properties}\n  }`;
                })
                .join('\n\n');

            // 生成完整的CSS代码
            const name = animationName.value;
            const css = `@keyframes ${name} {
${keyframesCode}
}

.animated {
  animation: ${name} ${duration.value}s ${timing.value} ${delay.value}s ${infinite.checked ? 'infinite' : iterations.value} ${direction.value};
}`;

            // 更新代码显示
            output.textContent = css;
            Prism.highlightElement(output);

            // 创建和更新样式表
            let styleSheet = document.getElementById('animation-style');
            if (!styleSheet) {
                styleSheet = document.createElement('style');
                styleSheet.id = 'animation-style';
                document.head.appendChild(styleSheet);
            }
            styleSheet.textContent = css;

            // 更新预览元素的类名以应用新动画
            preview.className = 'preview-box animated';

            // 如果需要重启动画
            preview.style.animation = 'none';
            preview.offsetHeight; // 触发重排
            preview.style.animation = '';
        };

        // 添加预设动画效果
        const addPresetAnimation = (preset) => {
            switch(preset) {
                case 'fade':
                    keyframes = [
                        {
                            percentage: 0,
                            properties: [{ name: 'opacity', value: '0' }]
                        },
                        {
                            percentage: 100,
                            properties: [{ name: 'opacity', value: '1' }]
                        }
                    ];
                    break;
                case 'slide':
                    keyframes = [
                        {
                            percentage: 0,
                            properties: [{ name: 'transform', value: 'translateX(-100%)' }]
                        },
                        {
                            percentage: 100,
                            properties: [{ name: 'transform', value: 'translateX(0)' }]
                        }
                    ];
                    break;
                case 'rotate':
                    keyframes = [
                        {
                            percentage: 0,
                            properties: [{ name: 'transform', value: 'rotate(0deg)' }]
                        },
                        {
                            percentage: 100,
                            properties: [{ name: 'transform', value: 'rotate(360deg)' }]
                        }
                    ];
                    break;
                case 'scale':
                    keyframes = [
                        {
                            percentage: 0,
                            properties: [{ name: 'transform', value: 'scale(0)' }]
                        },
                        {
                            percentage: 50,
                            properties: [{ name: 'transform', value: 'scale(1.2)' }]
                        },
                        {
                            percentage: 100,
                            properties: [{ name: 'transform', value: 'scale(1)' }]
                        }
                    ];
                    break;
            }
            updateKeyframesList();
            updateAnimation();
        };

        // 更新关键帧列表UI
        const updateKeyframesList = () => {
            keyframesList.innerHTML = '';
            keyframes.forEach(frame => {
                const keyframeDiv = document.createElement('div');
                keyframeDiv.className = 'keyframe-item';
                keyframeDiv.innerHTML = `
                    <div class="keyframe-header">
                        <input type="number" class="percentage" value="${frame.percentage}" min="0" max="100" step="1">
                        <span>%</span>
                        <button class="remove-keyframe">×</button>
                    </div>
                    <div class="properties">
                        ${frame.properties.map(prop => `
                            <div class="property">
                                <select class="property-select">
                                    <option value="transform" ${prop.name === 'transform' ? 'selected' : ''}>transform</option>
                                    <option value="opacity" ${prop.name === 'opacity' ? 'selected' : ''}>opacity</option>
                                    <option value="background-color" ${prop.name === 'background-color' ? 'selected' : ''}>background-color</option>
                                    <option value="scale" ${prop.name === 'scale' ? 'selected' : ''}>scale</option>
                                    <option value="rotate" ${prop.name === 'rotate' ? 'selected' : ''}>rotate</option>
                                    <option value="translate" ${prop.name === 'translate' ? 'selected' : ''}>translate</option>
                                </select>
                                <input type="text" class="property-value" value="${prop.value}" placeholder="属性值">
                                <button class="remove-property">-</button>
                            </div>
                        `).join('')}
                        <button class="add-property">+</button>
                    </div>
                `;
                keyframesList.appendChild(keyframeDiv);
                
                // 添加事件监听器
                addKeyframeEventListeners(keyframeDiv);
            });
        };

        // 添加关键帧事件监听器
        const addKeyframeEventListeners = (keyframeDiv) => {
            const percentageInput = keyframeDiv.querySelector('.percentage');
            const removeKeyframeBtn = keyframeDiv.querySelector('.remove-keyframe');
            const addPropertyBtn = keyframeDiv.querySelector('.add-property');

            percentageInput.addEventListener('input', () => {
                updateKeyframes();
                updateAnimation();
            });

            removeKeyframeBtn.addEventListener('click', () => {
                keyframeDiv.remove();
                updateKeyframes();
                updateAnimation();
            });

            addPropertyBtn.addEventListener('click', () => {
                const propertiesDiv = keyframeDiv.querySelector('.properties');
                const propertyDiv = document.createElement('div');
                propertyDiv.className = 'property';
                propertyDiv.innerHTML = `
                    <select class="property-select">
                        <option value="transform">transform</option>
                        <option value="opacity">opacity</option>
                        <option value="background-color">background-color</option>
                        <option value="scale">scale</option>
                        <option value="rotate">rotate</option>
                        <option value="translate">translate</option>
                    </select>
                    <input type="text" class="property-value" placeholder="属性值">
                    <button class="remove-property">-</button>
                `;
                propertiesDiv.insertBefore(propertyDiv, addPropertyBtn);
                
                // 添加新属性的事件监听器
                const removePropertyBtn = propertyDiv.querySelector('.remove-property');
                const propertyInputs = propertyDiv.querySelectorAll('select, input');
                
                removePropertyBtn.addEventListener('click', () => {
                    propertyDiv.remove();
                    updateKeyframes();
                    updateAnimation();
                });

                propertyInputs.forEach(input => {
                    input.addEventListener('input', () => {
                        updateKeyframes();
                        updateAnimation();
                    });
                });
            });

            // 为现有的属性添加事件监听器
            keyframeDiv.querySelectorAll('.property').forEach(propertyDiv => {
                const removePropertyBtn = propertyDiv.querySelector('.remove-property');
                const propertyInputs = propertyDiv.querySelectorAll('select, input');
                
                removePropertyBtn.addEventListener('click', () => {
                    propertyDiv.remove();
                    updateKeyframes();
                    updateAnimation();
                });

                propertyInputs.forEach(input => {
                    input.addEventListener('input', () => {
                        updateKeyframes();
                        updateAnimation();
                    });
                });
            });
        };

        // 添加预设动画按钮
        const presetButtons = `
            <div class="animation-presets">
                <button data-preset="fade">淡入</button>
                <button data-preset="slide">滑入</button>
                <button data-preset="rotate">旋转</button>
                <button data-preset="scale">缩放</button>
            </div>
        `;
        document.querySelector('.basic-settings').insertAdjacentHTML('afterbegin', presetButtons);

        // 添加预设按钮事件监听
        document.querySelectorAll('.animation-presets button').forEach(btn => {
            btn.addEventListener('click', () => {
                addPresetAnimation(btn.dataset.preset);
            });
        });

        // 添加事件监听器
        [animationName, duration, timing, delay, iterations, direction].forEach(input => {
            input.addEventListener('input', updateAnimation);
        });

        infinite.addEventListener('change', () => {
            iterations.disabled = infinite.checked;
            updateAnimation();
        });

        addKeyframeBtn.addEventListener('click', () => {
            const lastKeyframe = keyframes[keyframes.length - 1];
            const nextPercentage = lastKeyframe ? lastKeyframe.percentage + 25 : 0;
            addKeyframe(Math.min(nextPercentage, 100));
        });

        // 添加复制功能
        document.querySelector('.animation-tool-container .copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(output.textContent)
                .then(() => this.showSuccess('CSS代码已复制到剪贴板！'))
                .catch(() => this.showError('复制失败'));
        });

        // 初始化第一个关键帧
        addKeyframe(0);
        updateAnimation();
    }

    // 添加 Flex 布局工具初始化方法
    initializeFlexTool() {
        const flexDirection = document.getElementById('flexDirection');
        const justifyContent = document.getElementById('justifyContent');
        const alignItems = document.getElementById('alignItems');
        const flexWrap = document.getElementById('flexWrap');
        const flexGap = document.getElementById('flexGap');
        const itemCount = document.getElementById('flexItemCount');
        const container = document.getElementById('flexContainer');
        const output = document.getElementById('flexOutput');

        // 初始化 Flex 容器
        const initializeContainer = () => {
            // 清空容器
            container.innerHTML = '';
            // 创新的 flex 项目
            const count = parseInt(itemCount.value);
            for (let i = 0; i < count; i++) {
                const item = document.createElement('div');
                item.className = 'flex-item';
                item.textContent = `Item ${i + 1}`;
                container.appendChild(item);
            }
        };

        // 更新 Flex 布局
        const updateFlexLayout = () => {
            // 更新容器样式
            container.style.display = 'flex';
            container.style.flexDirection = flexDirection.value;
            container.style.justifyContent = justifyContent.value;
            container.style.alignItems = alignItems.value;
            container.style.flexWrap = flexWrap.value;
            container.style.gap = `${flexGap.value}px`;

            // 生成 CSS 代码
            const css = `.flex-container {
    display: flex;
    flex-direction: ${flexDirection.value};
    justify-content: ${justifyContent.value};
    align-items: ${alignItems.value};
    flex-wrap: ${flexWrap.value};
    gap: ${flexGap.value}px;
}`;

            output.textContent = css;
            Prism.highlightElement(output);
        };

        // 添加事件监听器
        [flexDirection, justifyContent, alignItems, flexWrap, flexGap].forEach(input => {
            input.addEventListener('change', updateFlexLayout);
        });

        itemCount.addEventListener('change', () => {
            initializeContainer();
            updateFlexLayout();
        });

        // 添加复制功能
        document.querySelector('.flex-tool-container .copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(output.textContent)
                .then(() => this.showSuccess('CSS代码已复制到剪贴板！'))
                .catch(() => this.showError('复制失败'));
        });

        // 初始化
        initializeContainer();
        updateFlexLayout();
    }

    // 添加 Grid 布局工具初始化方法
    initializeGridTool() {
        const gridColumns = document.getElementById('gridColumns');
        const gridRows = document.getElementById('gridRows');
        const columnGap = document.getElementById('columnGap');
        const rowGap = document.getElementById('rowGap');
        const justifyItems = document.getElementById('gridJustifyItems');
        const alignItems = document.getElementById('gridAlignItems');
        const container = document.getElementById('gridContainer');
        const output = document.getElementById('gridOutput');
        const templateEditor = document.querySelector('.grid-template-editor');

        // 初始化网格容器
        const initializeContainer = () => {
            container.innerHTML = '';
            const rows = parseInt(gridRows.value);
            const cols = parseInt(gridColumns.value);
            
            // 创建网格模板编辑器
            templateEditor.innerHTML = '';
            for (let i = 0; i < rows; i++) {
                const row = document.createElement('div');
                row.className = 'grid-row';
                for (let j = 0; j < cols; j++) {
                    const cell = document.createElement('div');
                    cell.className = 'grid-cell';
                    cell.contentEditable = true;
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    cell.textContent = `area-${i}-${j}`;
                    row.appendChild(cell);
                }
                templateEditor.appendChild(row);
            }

            // 创建网格项目
            for (let i = 0; i < rows * cols; i++) {
                const item = document.createElement('div');
                item.className = 'grid-item';
                item.textContent = `Item ${i + 1}`;
                container.appendChild(item);
            }
        };

        // 更新网格布局
        const updateGridLayout = () => {
            const rows = parseInt(gridRows.value);
            const cols = parseInt(gridColumns.value);

            // 更新容器样式
            container.style.display = 'grid';
            container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
            container.style.gap = `${rowGap.value}px ${columnGap.value}px`;
            container.style.justifyItems = justifyItems.value;
            container.style.alignItems = alignItems.value;

            // 获取区域模板
            const areas = [];
            const cells = templateEditor.querySelectorAll('.grid-cell');
            for (let i = 0; i < rows; i++) {
                const row = [];
                for (let j = 0; j < cols; j++) {
                    const cell = cells[i * cols + j];
                    row.push(cell.textContent || '.');
                }
                areas.push(row.join(' '));
            }

            // 生成 CSS 代码
            const css = `.grid-container {
    display: grid;
    grid-template-columns: repeat(${cols}, 1fr);
    grid-template-rows: repeat(${rows}, 1fr);
    gap: ${rowGap.value}px ${columnGap.value}px;
    justify-items: ${justifyItems.value};
    align-items: ${alignItems.value};
    grid-template-areas: 
        "${areas.join('"\n        "')}";
}`;

            output.textContent = css;
            Prism.highlightElement(output);
        };

        // 添加事件监听器
        [gridColumns, gridRows, columnGap, rowGap, justifyItems, alignItems].forEach(input => {
            input.addEventListener('change', () => {
                initializeContainer();
                updateGridLayout();
            });
        });

        // 监听区域名称的变化
        templateEditor.addEventListener('input', (e) => {
            if (e.target.classList.contains('grid-cell')) {
                updateGridLayout();
            }
        });

        // 添加复制功能
        document.querySelector('.grid-tool-container .copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(output.textContent)
                .then(() => this.showSuccess('CSS代码已复制到剪贴板！'))
                .catch(() => this.showError('复制失败'));
        });

        // 初始化
        initializeContainer();
        updateGridLayout();
    }

    // 在 ToolManager 类中添加 SVG 编辑器初始化方法
    initializeSvgTool() {
        const svgEditor = document.getElementById('svgEditor');
        const layersList = document.getElementById('layersList');
        const svgOutput = document.getElementById('svgOutput');
        const fillColor = document.getElementById('svgFill');
        const strokeColor = document.getElementById('svgStroke');
        const strokeWidth = document.getElementById('svgStrokeWidth');
        const opacity = document.getElementById('svgOpacity');
        
        let selectedShape = null;
        let isDrawing = false;
        let currentElement = null;
        let startPoint = null;
        let elements = [];

        // SVG 命名空间
        const SVG_NS = "http://www.w3.org/2000/svg";

        // 创建新的 SVG 元素
        const createSVGElement = (type) => {
            return document.createElementNS(SVG_NS, type);
        };

        // 更新元素样式
        const updateElementStyle = (element) => {
            element.setAttribute('fill', fillColor.value);
            element.setAttribute('stroke', strokeColor.value);
            element.setAttribute('stroke-width', strokeWidth.value);
            element.setAttribute('opacity', opacity.value);
        };

        // 开始绘制
        const startDraw = (e) => {
            if (!selectedShape) return;

            isDrawing = true;
            const point = getMousePosition(e);
            startPoint = point;

            switch (selectedShape) {
                case 'rect':
                    currentElement = createSVGElement('rect');
                    currentElement.setAttribute('x', point.x);
                    currentElement.setAttribute('y', point.y);
                    break;
                case 'circle':
                    currentElement = createSVGElement('circle');
                    currentElement.setAttribute('cx', point.x);
                    currentElement.setAttribute('cy', point.y);
                    break;
                case 'ellipse':
                    currentElement = createSVGElement('ellipse');
                    currentElement.setAttribute('cx', point.x);
                    currentElement.setAttribute('cy', point.y);
                    break;
                case 'line':
                    currentElement = createSVGElement('line');
                    currentElement.setAttribute('x1', point.x);
                    currentElement.setAttribute('y1', point.y);
                    currentElement.setAttribute('x2', point.x);
                    currentElement.setAttribute('y2', point.y);
                    break;
                case 'path':
                    currentElement = createSVGElement('path');
                    currentElement.setAttribute('d', `M ${point.x} ${point.y}`);
                    break;
                case 'text':
                    currentElement = createSVGElement('text');
                    currentElement.setAttribute('x', point.x);
                    currentElement.setAttribute('y', point.y);
                    currentElement.textContent = '双击编辑文本';
                    break;
            }

            if (currentElement) {
                updateElementStyle(currentElement);
                svgEditor.appendChild(currentElement);
                elements.push(currentElement);
                updateLayersList();
            }
        };

        // 绘制过程
        const draw = (e) => {
            if (!isDrawing || !currentElement) return;

            const point = getMousePosition(e);
            
            switch (selectedShape) {
                case 'rect':
                    const width = point.x - startPoint.x;
                    const height = point.y - startPoint.y;
                    currentElement.setAttribute('width', Math.abs(width));
                    currentElement.setAttribute('height', Math.abs(height));
                    currentElement.setAttribute('x', width < 0 ? point.x : startPoint.x);
                    currentElement.setAttribute('y', height < 0 ? point.y : startPoint.y);
                    break;
                case 'circle':
                    const radius = Math.sqrt(
                        Math.pow(point.x - startPoint.x, 2) + 
                        Math.pow(point.y - startPoint.y, 2)
                    );
                    currentElement.setAttribute('r', radius);
                    break;
                case 'ellipse':
                    const rx = Math.abs(point.x - startPoint.x);
                    const ry = Math.abs(point.y - startPoint.y);
                    currentElement.setAttribute('rx', rx);
                    currentElement.setAttribute('ry', ry);
                    break;
                case 'line':
                    currentElement.setAttribute('x2', point.x);
                    currentElement.setAttribute('y2', point.y);
                    break;
                case 'path':
                    const d = currentElement.getAttribute('d');
                    currentElement.setAttribute('d', `${d} L ${point.x} ${point.y}`);
                    break;
            }

            updateOutput();
        };

        // 结束绘制
        const endDraw = () => {
            isDrawing = false;
            currentElement = null;
            updateOutput();
        };

        // 获取鼠标位置
        const getMousePosition = (e) => {
            const rect = svgEditor.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        // 更新图层列表
        const updateLayersList = () => {
            layersList.innerHTML = '';
            elements.forEach((element, index) => {
                const li = document.createElement('li');
                li.textContent = `${element.tagName} ${index + 1}`;
                li.addEventListener('click', () => selectElement(element));
                
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '×';
                deleteBtn.className = 'delete-layer';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteElement(element);
                });

                li.appendChild(deleteBtn);
                layersList.appendChild(li);
            });
        };

        // 选择元素
        const selectElement = (element) => {
            elements.forEach(el => el.classList.remove('selected'));
            element.classList.add('selected');
            
            // 更新工具栏值
            fillColor.value = element.getAttribute('fill');
            strokeColor.value = element.getAttribute('stroke');
            strokeWidth.value = element.getAttribute('stroke-width');
            opacity.value = element.getAttribute('opacity');
        };

        // 删除元素
        const deleteElement = (element) => {
            const index = elements.indexOf(element);
            if (index > -1) {
                elements.splice(index, 1);
                element.remove();
                updateLayersList();
                updateOutput();
            }
        };

        // 更新输出代码
        const updateOutput = () => {
            svgOutput.textContent = svgEditor.outerHTML;
            Prism.highlightElement(svgOutput);
        };

        // 添加事件监听器
        document.querySelectorAll('.shape-tools button').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedShape = btn.dataset.shape;
                document.querySelectorAll('.shape-tools button').forEach(b => 
                    b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        [fillColor, strokeColor, strokeWidth, opacity].forEach(input => {
            input.addEventListener('change', () => {
                if (elements.length && elements[elements.length - 1].classList.contains('selected')) {
                    updateElementStyle(elements[elements.length - 1]);
                    updateOutput();
                }
            });
        });

        svgEditor.addEventListener('mousedown', startDraw);
        svgEditor.addEventListener('mousemove', draw);
        svgEditor.addEventListener('mouseup', endDraw);
        svgEditor.addEventListener('mouseleave', endDraw);

        // 文本编辑功能
        svgEditor.addEventListener('dblclick', (e) => {
            if (e.target.tagName === 'text') {
                const text = prompt('编辑文本:', e.target.textContent);
                if (text !== null) {
                    e.target.textContent = text;
                    updateOutput();
                }
            }
        });

        // 复制代码功能
        document.querySelector('.svg-tool-container .copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(svgOutput.textContent)
                .then(() => this.showSuccess('SVG代码已复制到剪贴板！'))
                .catch(() => this.showError('复制失败'));
        });

        // 下载SVG功能
        document.querySelector('.svg-tool-container .download-btn').addEventListener('click', () => {
            const blob = new Blob([svgOutput.textContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'drawing.svg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });

        // 初始化默认值
        fillColor.value = '#ffffff';
        strokeColor.value = '#000000';
        strokeWidth.value = '2';
        opacity.value = '1';
        updateOutput();
    }
}

// 修改初始化代码
document.addEventListener('DOMContentLoaded', () => {
    // 添加加载检查
    const checkDependencies = () => {
        if (typeof monaco === 'undefined') {
            console.error('Monaco Editor 未加载');
            return false;
        }
        if (typeof prettier === 'undefined') {
            console.error('Prettier 未加载');
            return false;
        }
        if (typeof Prism === 'undefined') {
            console.error('Prism 未加载');
            return false;
        }
        return true;
    };

    // 等待 Monaco Editor 完全加载
    require(['vs/editor/editor.main'], () => {
        if (checkDependencies()) {
            window.toolManager = new ToolManager();
            console.log('工具初始化成功！');
        } else {
            const container = document.querySelector('.container');
            const error = document.createElement('div');
            error.className = 'error-message';
            error.innerHTML = `
                工具初始化失败：依赖库未完全加载
                <button onclick="location.reload()">刷新页面</button>
                <div style="font-size: 12px; margin-top: 5px;">
                    提示：请检查网络连接，确保能访问 cdnjs.cloudflare.com 和 unpkg.com
                </div>
            `;
            container.prepend(error);
        }
    });
});

// 添加错误处理
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
};

// 工具类
class Tools {
    // JSON 工具
    static validateJSON(json) {
        try {
            JSON.parse(json);
            return true;
        } catch (e) {
            return false;
        }
    }

    // 颜色转换工具
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    // CSS 工具
    static generateGradient(color1, color2, type = 'linear', angle = 45) {
        return `${type}-gradient(${angle}deg, ${color1}, ${color2})`;
    }

    static generateBoxShadow(x, y, blur, spread, color, inset = false) {
        return `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${color}`;
    }

    // 单位转换
    static pxToRem(px, baseSize = 16) {
        return `${px / baseSize}rem`;
    }

    static pxToEm(px, parentSize = 16) {
        return `${px / parentSize}em`;
    }

    // 性能优化
    static async optimizeImage(file) {
        // 使用 Canvas 压缩图片
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // 代码优化
    static minifyCSS(css) {
        return css
            .replace(/\/\*[\s\S]*?\*\//g, '') // 删除注释
            .replace(/\s+/g, ' ') // 压缩空格
            .replace(/\s*([{}:;,])\s*/g, '$1') // 删除选择器、属性和值周围的空格
            .replace(/;\}/g, '}') // 删除最后一个分号
            .trim();
    }

    // 正则测试
    static testRegex(pattern, flags, text) {
        try {
            const regex = new RegExp(pattern, flags);
            return text.match(regex);
        } catch (e) {
            throw new Error('无效的正则表达式');
        }
    }

    // 图片优化相关方法
    static async processImage(file, options = {}) {
        const {
            quality = 0.8,
            maxWidth = 1920,
            format = 'jpeg'
        } = options;

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // 计算新的尺寸
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth) {
                        height = (maxWidth * height) / width;
                        width = maxWidth;
                    }

                    // 创建canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    // 绘制图片
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // 转换格式
                    const mimeType = `image/${format}`;
                    const dataUrl = canvas.toDataURL(mimeType, quality);
                    
                    // 计算压缩率
                    const originalSize = file.size;
                    const compressedSize = Math.round((dataUrl.length * 3) / 4);
                    const ratio = Math.round((1 - compressedSize / originalSize) * 100);

                    resolve({
                        dataUrl,
                        originalSize,
                        compressedSize,
                        ratio,
                        width,
                        height
                    });
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // 颜色转换相关方法
    static rgbToCmyk(r, g, b) {
        let c = 1 - (r / 255);
        let m = 1 - (g / 255);
        let y = 1 - (b / 255);
        let k = Math.min(c, m, y);

        c = ((c - k) / (1 - k)) || 0;
        m = ((m - k) / (1 - k)) || 0;
        y = ((y - k) / (1 - k)) || 0;

        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100)
        };
    }

    static cmykToRgb(c, m, y, k) {
        c = (c / 100);
        m = (m / 100);
        y = (y / 100);
        k = (k / 100);

        let r = 255 * (1 - c) * (1 - k);
        let g = 255 * (1 - m) * (1 - k);
        let b = 255 * (1 - y) * (1 - k);

        return {
            r: Math.round(r),
            g: Math.round(g),
            b: Math.round(b)
        };
    }

    // JSON 工具方法
    static formatJSON(json, space = 2) {
        try {
            const obj = typeof json === 'string' ? JSON.parse(json) : json;
            return JSON.stringify(obj, null, space);
        } catch (e) {
            throw new Error('Invalid JSON');
        }
    }

    static validateJSON(json) {
        try {
            JSON.parse(typeof json === 'string' ? json : JSON.stringify(json));
            return { valid: true };
        } catch (e) {
            return { 
                valid: false, 
                error: e.message,
                position: parseInt(e.message.match(/position\s+(\d+)/)?.[1])
            };
        }
    }

    // CSS 工具方法
    static generateFlexbox(options = {}) {
        const {
            direction = 'row',
            justify = 'flex-start',
            align = 'stretch',
            wrap = 'nowrap'
        } = options;

        return `
            display: flex;
            flex-direction: ${direction};
            justify-content: ${justify};
            align-items: ${align};
            flex-wrap: ${wrap};
        `;
    }

    static generateGrid(options = {}) {
        const {
            columns = '1fr 1fr 1fr',
            rows = 'auto',
            gap = '20px',
            areas = []
        } = options;

        return `
            display: grid;
            grid-template-columns: ${columns};
            grid-template-rows: ${rows};
            gap: ${gap};
            ${areas.length ? `grid-template-areas: ${areas.map(row => `"${row}"`).join(' ')}` : ''}
        `;
    }

    // 动画生成器
    static generateKeyframes(name, frames) {
        return `
            @keyframes ${name} {
                ${Object.entries(frames).map(([key, value]) => `
                    ${key} {
                        ${Object.entries(value).map(([prop, val]) => `${prop}: ${val};`).join('\n')}
                    }
                `).join('\n')}
            }
        `;
    }
}

// 导出工具类
window.Tools = Tools;