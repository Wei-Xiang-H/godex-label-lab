// 標籤機列印表單 JavaScript
const form = document.getElementById('labelForm');
const submitBtn = document.getElementById('submitBtn');
const loading = document.getElementById('loading');
const messageDiv = document.getElementById('message');
const elementsList = document.getElementById('elementsList');

// 元素陣列
let elements = [];
let elementIdCounter = 0;

// Fabric.js Canvas
let canvas = null;
let isPreviewGenerated = false;

// HTML 跳脫函數（防止 XSS 攻擊）
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 計算縮放比例
function getScaleRatio() {
    const labelW = parseFloat(document.getElementById('labelW').value) || 80;
    return 300 / labelW;
}

// dot 轉 px (用於渲染)
function dotToPx(dot) {
    const scaleRatio = getScaleRatio();
    return (dot / 12) * scaleRatio;
}

// px 轉 dot (用於回存)
function pxToDot(px) {
    const scaleRatio = getScaleRatio();
    return Math.round((px / scaleRatio) * 12);
}

// 計算預覽圖高度
function getCanvasHeight() {
    const labelW = parseFloat(document.getElementById('labelW').value) || 80;
    const labelH = parseFloat(document.getElementById('labelH').value) || 50;
    return (labelH / labelW) * 300;
}

// 產生預覽圖
function generatePreview() {
    // 驗證標籤設定
    let hasError = false;
    const labelFields = ['labelH', 'labelW', 'labelGap', 'labelDark', 'labelSpeed', 'labelCopyNo'];

    labelFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        const errorId = `error-${fieldId}`;
        const errorMsg = document.getElementById(errorId);

        if (input && !input.validity.valid) {
            if (errorMsg) errorMsg.classList.add('show');
            hasError = true;
        }
    });

    if (hasError) {
        showMessage('請修正標籤設定的錯誤欄位', 'error');
        return;
    }

    // 驗證文字元素是否有內容
    let hasEmptyText = false;
    elements.forEach(element => {
        if (element.type === 'Text') {
            const input = document.getElementById(`text-input-${element.id}`);
            const errorMsg = document.getElementById(`text-error-${element.id}`);

            if (!element.labelText || !element.labelText.trim()) {
                if (input) input.classList.add('empty-error');
                if (errorMsg) errorMsg.classList.add('show');
                hasEmptyText = true;
            }
        }
    });

    if (hasEmptyText) {
        showMessage('請填寫所有文字元素的內容', 'error');
        return;
    }

    // 檢查是否有未確認的編輯
    let hasOpenEdits = false;
    elements.forEach(element => {
        const detailsDiv = document.getElementById(`details-${element.id}`);
        const confirmBtn = document.getElementById(`confirm-${element.id}`);
        const warningMsg = document.getElementById(`warning-${element.id}`);

        if (detailsDiv && detailsDiv.classList.contains('show')) {
            // 有打開的編輯區
            if (confirmBtn) confirmBtn.classList.add('editing');
            if (warningMsg) warningMsg.classList.add('show');
            hasOpenEdits = true;
        }
    });

    if (hasOpenEdits) {
        showMessage('請先確認所有編輯中的元素', 'error');
        return;
    }

    // 隱藏佔位符
    const placeholder = document.getElementById('canvasPlaceholder');
    const wrapper = document.getElementById('canvasWrapper');

    if (placeholder) {
        placeholder.style.display = 'none';
    }

    // 改為自動調整尺寸
    wrapper.classList.add('generated');

    // 計算 Canvas 尺寸
    const canvasWidth = 300;
    const canvasHeight = getCanvasHeight();

    // 如果 Canvas 已存在，先更新尺寸
    if (canvas) {
        canvas.setWidth(canvasWidth);
        canvas.setHeight(canvasHeight);
        canvas.clear();
    } else {
        // 創建或取得 Canvas 元素
        let canvasElement = document.getElementById('labelCanvas');
        if (!canvasElement) {
            canvasElement = document.createElement('canvas');
            canvasElement.id = 'labelCanvas';
            wrapper.appendChild(canvasElement);
        }

        // 初始化 Fabric Canvas
        canvas = new fabric.Canvas('labelCanvas', {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: '#ffffff',
            selection: false
        });
    }

    // 渲染所有元素
    elements.forEach((element, index) => {
        if (element.type === 'Text') {
            renderTextElement(element, index);
        } else if (element.type === 'Image') {
            renderImageElement(element, index);
        }
    });

    isPreviewGenerated = true;
}

// 渲染文字元素
function renderTextElement(element, index) {
    const x = dotToPx(element.labelX);
    const y = dotToPx(element.labelY);
    const fontSize = dotToPx(element.fontHeight);

    const text = new fabric.Text(element.labelText || '', {
        left: x,
        top: y,
        fontSize: fontSize,
        fontFamily: 'Arial',
        fill: 'black',
        selectable: true,
        hasControls: false,
        lockScalingX: true,
        lockScalingY: true,
        elementId: element.id,
        elementIndex: index
    });

    // 限制拖曳範圍
    text.on('moving', function () {
        const obj = this;
        if (obj.left < 0) obj.left = 0;
        if (obj.top < 0) obj.top = 0;
    });

    // 拖曳後同步到表單
    text.on('modified', function () {
        const obj = this;
        element.labelX = pxToDot(obj.left);
        element.labelY = pxToDot(obj.top);
        updateFormInputs(element.id);
    });

    canvas.add(text);
}

// 渲染圖片元素
function renderImageElement(element, index) {
    // 圖片的 px 就是 dot，使用相同的轉換公式
    const x = dotToPx(element.labelX);
    const y = dotToPx(element.labelY);
    const displayWidth = dotToPx(element.imageWidthPx);
    const displayHeight = dotToPx(element.imageHeightPx);

    fabric.Image.fromURL(element.imagePreview, function (img) {
        // 計算縮放比例：目標顯示尺寸 / 圖片原始尺寸
        const scaleX = displayWidth / img.width;
        const scaleY = displayHeight / img.height;

        img.set({
            left: x,
            top: y,
            scaleX: scaleX,
            scaleY: scaleY,
            selectable: true,
            hasControls: true,
            lockRotation: true,
            elementId: element.id,
            elementIndex: index
        });

        // 限制拖曳範圍
        img.on('moving', function () {
            const obj = this;
            if (obj.left < 0) obj.left = 0;
            if (obj.top < 0) obj.top = 0;
        });

        // 拖曳或縮放後同步到表單
        img.on('modified', function () {
            const obj = this;
            // 座標：px → dot
            element.labelX = pxToDot(obj.left);
            element.labelY = pxToDot(obj.top);

            // 尺寸：Canvas 上的 px → dot (因為圖片 px = dot)
            const currentDisplayWidth = obj.width * obj.scaleX;
            const currentDisplayHeight = obj.height * obj.scaleY;

            element.imageWidthPx = pxToDot(currentDisplayWidth);
            element.imageHeightPx = pxToDot(currentDisplayHeight);

            updateFormInputs(element.id);
        });

        canvas.add(img);
    });
}

// 更新表單中的輸入框值
function updateFormInputs(elementId) {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    if (element.type === 'Text') {
        const xInput = document.getElementById(`x-${elementId}`);
        const yInput = document.getElementById(`y-${elementId}`);
        if (xInput) xInput.value = element.labelX;
        if (yInput) yInput.value = element.labelY;
    } else if (element.type === 'Image') {
        const xInput = document.getElementById(`x-${elementId}`);
        const yInput = document.getElementById(`y-${elementId}`);
        const widthInput = document.getElementById(`imgWidth-${elementId}`);
        const heightInput = document.getElementById(`imgHeight-${elementId}`);

        if (xInput) xInput.value = element.labelX;
        if (yInput) yInput.value = element.labelY;
        if (widthInput) widthInput.value = element.imageWidthPx;
        if (heightInput) heightInput.value = element.imageHeightPx;
    }
}

// 防止所有 input 按 Enter 送出表單
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('labelForm');
    if (form) {
        form.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                e.preventDefault();
                return false;
            }
        });
    }
});

// 即時驗證功能 (只包含必填欄位)
const formFields = [
    { id: 'ipAddress', errorId: 'error-ipAddress' },
    { id: 'port', errorId: 'error-port' },
    { id: 'paperType', errorId: 'error-paperType' },
    { id: 'labelH', errorId: 'error-labelH' },
    { id: 'labelW', errorId: 'error-labelW' },
    { id: 'labelGap', errorId: 'error-labelGap' },
    { id: 'labelDark', errorId: 'error-labelDark' },
    { id: 'labelSpeed', errorId: 'error-labelSpeed' },
    { id: 'labelCopyNo', errorId: 'error-labelCopyNo' }
];

// 為每個欄位添加即時驗證
formFields.forEach(field => {
    const input = document.getElementById(field.id);
    const errorMsg = document.getElementById(field.errorId);

    input.addEventListener('blur', () => {
        if (!input.validity.valid) {
            errorMsg.classList.add('show');
        } else {
            errorMsg.classList.remove('show');
        }
    });

    input.addEventListener('input', () => {
        if (input.validity.valid) {
            errorMsg.classList.remove('show');
        }
    });
});

// 新增文字元素
function addTextElement() {
    const elementId = elementIdCounter++;
    const element = {
        id: elementId,
        type: 'Text',
        labelX: 0,
        labelY: 0,
        labelText: '',
        fontHeight: 32,
        textWidth: 0
    };
    elements.push(element);
    renderElements();
}

// 新增圖片元素
function addImageElement() {
    document.getElementById('imageFileInput').click();
}

// 處理圖片上傳
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 檢查格式
    const validExtensions = ['.bmp', '.gif'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
        alert('僅支援 BMP 或 GIF 格式');
        event.target.value = '';
        return;
    }

    // 讀取圖片並取得實際尺寸
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const elementId = elementIdCounter++;
            const element = {
                id: elementId,
                type: 'Image',
                labelX: 0,
                labelY: 0,
                image: file,
                imagePreview: e.target.result,
                imageWidthPx: img.width,
                imageHeightPx: img.height
            };
            elements.push(element);
            renderElements();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}

// 刪除元素
function deleteElement(elementId) {
    elements = elements.filter(el => el.id !== elementId);
    renderElements();
}

// 切換編輯詳細資訊
function toggleDetails(elementId) {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const detailsDiv = document.getElementById(`details-${elementId}`);
    const editBtn = document.querySelector(`[onclick="toggleDetails(${elementId})"]`);
    const confirmBtn = document.getElementById(`confirm-${elementId}`);
    const warningMsg = document.getElementById(`warning-${elementId}`);

    // 如果是文字元素，先驗證是否有內容
    if (element.type === 'Text') {
        if (!element.labelText || !element.labelText.trim()) {
            // 只顯示紅框和錯誤訊息，不跳提示
            const input = document.getElementById(`text-input-${elementId}`);
            const errorMsg = document.getElementById(`text-error-${elementId}`);
            if (input) {
                input.classList.add('empty-error');
                input.focus(); // 聚焦到輸入框
            }
            if (errorMsg) errorMsg.classList.add('show');
            return; // 不展開編輯區
        }
    }

    const isOpen = detailsDiv.classList.contains('show');

    if (!isOpen) {
        // 展開：停用編輯按鈕
        detailsDiv.classList.add('show');
        if (editBtn) editBtn.disabled = true;
        if (editBtn) editBtn.style.opacity = '0.5';
        if (editBtn) editBtn.style.cursor = 'not-allowed';
    }
}

// 確認編輯
function confirmEdit(elementId) {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const detailsDiv = document.getElementById(`details-${elementId}`);
    const editBtn = document.querySelector(`[onclick="toggleDetails(${elementId})"]`);

    // 如果是文字元素，再次驗證是否有內容
    if (element.type === 'Text') {
        if (!element.labelText || !element.labelText.trim()) {
            const input = document.getElementById(`text-input-${elementId}`);
            const errorMsg = document.getElementById(`text-error-${elementId}`);
            if (input) {
                input.classList.add('empty-error');
                input.focus();
            }
            if (errorMsg) errorMsg.classList.add('show');
            return;
        }

        // 驗證數值欄位
        const xInput = document.getElementById(`x-${elementId}`);
        const yInput = document.getElementById(`y-${elementId}`);
        const fontHeightInput = document.getElementById(`fontHeight-${elementId}`);

        if (!validateNumberInput(xInput) || !validateNumberInput(yInput) ||
            !validateNumberInput(fontHeightInput)) {
            showMessage('請確認所有數值欄位為有效的正整數', 'error');
            return;
        }

        element.labelX = parseInt(xInput.value) || 0;
        element.labelY = parseInt(yInput.value) || 0;
        element.fontHeight = parseInt(fontHeightInput.value) || 32;
        element.textWidth = 0;
    } else if (element.type === 'Image') {
        // 驗證數值欄位
        const xInput = document.getElementById(`x-${elementId}`);
        const yInput = document.getElementById(`y-${elementId}`);
        const widthInput = document.getElementById(`imgWidth-${elementId}`);
        const heightInput = document.getElementById(`imgHeight-${elementId}`);

        if (!validateNumberInput(xInput) || !validateNumberInput(yInput) ||
            !validateNumberInput(widthInput) || !validateNumberInput(heightInput)) {
            showMessage('請確認所有數值欄位為有效的正整數', 'error');
            return;
        }

        element.labelX = parseInt(xInput.value) || 0;
        element.labelY = parseInt(yInput.value) || 0;
        element.imageWidthPx = parseInt(widthInput.value) || 100;
        element.imageHeightPx = parseInt(heightInput.value) || 100;
    }

    // 收合編輯區，恢復編輯按鈕
    detailsDiv.classList.remove('show');
    if (editBtn) editBtn.disabled = false;
    if (editBtn) editBtn.style.opacity = '1';
    if (editBtn) editBtn.style.cursor = 'pointer';

    // 移除紅色警告
    const confirmBtn = document.getElementById(`confirm-${elementId}`);
    const warningMsg = document.getElementById(`warning-${elementId}`);
    if (confirmBtn) confirmBtn.classList.remove('editing');
    if (warningMsg) warningMsg.classList.remove('show');
}

// 驗證數值輸入框
function validateNumberInput(input) {
    if (!input) return false;

    const value = input.value;
    const min = parseFloat(input.min) || 0;
    const numValue = parseFloat(value);

    // 檢查是否為空
    if (value === '' || value === null) {
        input.style.borderColor = '#e74c3c';
        return false;
    }

    // 檢查是否為數字
    if (isNaN(numValue)) {
        input.style.borderColor = '#e74c3c';
        return false;
    }

    // 檢查是否為整數
    if (!Number.isInteger(numValue)) {
        input.style.borderColor = '#e74c3c';
        return false;
    }

    // 檢查是否小於最小值
    if (numValue < min) {
        input.style.borderColor = '#e74c3c';
        return false;
    }

    // 通過驗證，恢復正常樣式
    input.style.borderColor = '';
    return true;
}

// 更新文字內容
function updateText(elementId, value) {
    const element = elements.find(el => el.id === elementId);
    if (element) {
        element.labelText = value;

        // 即時清除錯誤提示（如果有輸入內容）
        if (value.trim()) {
            const input = document.getElementById(`text-input-${elementId}`);
            const errorMsg = document.getElementById(`text-error-${elementId}`);
            if (input) input.classList.remove('empty-error');
            if (errorMsg) errorMsg.classList.remove('show');
        }
    }
}

// 驗證文字元素（失去焦點時）
function validateTextElement(elementId) {
    const element = elements.find(el => el.id === elementId);
    if (!element || element.type !== 'Text') return;

    const input = document.getElementById(`text-input-${elementId}`);
    const errorMsg = document.getElementById(`text-error-${elementId}`);

    if (!element.labelText || !element.labelText.trim()) {
        // 顯示錯誤
        if (input) input.classList.add('empty-error');
        if (errorMsg) errorMsg.classList.add('show');
    } else {
        // 清除錯誤
        if (input) input.classList.remove('empty-error');
        if (errorMsg) errorMsg.classList.remove('show');
    }
}

// 渲染元素列表
function renderElements() {
    if (elements.length === 0) {
        elementsList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <p>尚未新增任何元素</p>
                        <p style="font-size: 12px; margin-top: 5px;">請點擊上方按鈕新增文字或圖片</p>
                    </div>
                `;
        return;
    }

    elementsList.innerHTML = elements.map(element => {
        if (element.type === 'Text') {
            return `
                        <div class="element-item">
                            <div class="element-header">
                                <div class="element-content">
                                    <div class="element-preview">
                                        <input type="text" 
                                               id="text-input-${element.id}"
                                               placeholder="請輸入文字內容..." 
                                               value="${escapeHtml(element.labelText || '')}"
                                               oninput="updateText(${element.id}, this.value)"
                                               onblur="validateTextElement(${element.id})">
                                        <div class="element-text-error" id="text-error-${element.id}">請填寫內容</div>
                                    </div>
                                </div>
                                <div class="element-actions">
                                    <button type="button" class="btn-icon btn-edit" onclick="toggleDetails(${element.id})" title="編輯">
                                        ✏️
                                    </button>
                                    <button type="button" class="btn-icon btn-delete" onclick="deleteElement(${element.id})" title="刪除">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <div class="element-details" id="details-${element.id}">
                                <div class="detail-row">
                                    <div class="detail-group">
                                        <label>X 座標</label>
                                        <input type="number" id="x-${element.id}" value="${element.labelX}" min="0" step="1">
                                    </div>
                                    <div class="detail-group">
                                        <label>Y 座標</label>
                                        <input type="number" id="y-${element.id}" value="${element.labelY}" min="0" step="1">
                                    </div>
                                    <div class="detail-group">
                                        <label>文字大小</label>
                                        <input type="number" id="fontHeight-${element.id}" value="${element.fontHeight}" min="1" step="1">
                                    </div>
                                </div>
                                <input type="hidden" id="textWidth-${element.id}" value="0">
                                <button type="button" class="btn-confirm" id="confirm-${element.id}" onclick="confirmEdit(${element.id})">確認</button>
                                <span class="edit-warning" id="warning-${element.id}">請確認編輯</span>
                            </div>
                        </div>
                    `;
        } else if (element.type === 'Image') {
            return `
                        <div class="element-item">
                            <div class="element-header">
                                <div class="element-content">
                                    <img src="${element.imagePreview}" class="image-preview" alt="圖片預覽">
                                    <span style="flex: 1; color: #666; font-size: 13px;">${escapeHtml(element.image.name)}</span>
                                </div>
                                <div class="element-actions">
                                    <button type="button" class="btn-icon btn-edit" onclick="toggleDetails(${element.id})" title="編輯">
                                        ✏️
                                    </button>
                                    <button type="button" class="btn-icon btn-delete" onclick="deleteElement(${element.id})" title="刪除">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <div class="element-details" id="details-${element.id}">
                                <div class="detail-row">
                                    <div class="detail-group">
                                        <label>X 座標</label>
                                        <input type="number" id="x-${element.id}" value="${element.labelX}" min="0" step="1">
                                    </div>
                                    <div class="detail-group">
                                        <label>Y 座標</label>
                                        <input type="number" id="y-${element.id}" value="${element.labelY}" min="0" step="1">
                                    </div>
                                    <div class="detail-group">
                                        <label>圖片寬度</label>
                                        <input type="number" id="imgWidth-${element.id}" value="${element.imageWidthPx}" min="1" step="1">
                                    </div>
                                    <div class="detail-group">
                                        <label>圖片高度</label>
                                        <input type="number" id="imgHeight-${element.id}" value="${element.imageHeightPx}" min="1" step="1">
                                    </div>
                                </div>
                                <button type="button" class="btn-confirm" id="confirm-${element.id}" onclick="confirmEdit(${element.id})">確認</button>
                                <span class="edit-warning" id="warning-${element.id}">請確認編輯</span>
                            </div>
                        </div>
                    `;
        }
    }).join('');
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 詢問是否確定要列印
    if (!confirm('確定要送出列印嗎？')) {
        return; // 取消則不執行
    }

    // 提交前最終驗證 (只驗證必填欄位)
    let hasError = false;
    formFields.forEach(field => {
        const input = document.getElementById(field.id);
        const errorMsg = document.getElementById(field.errorId);

        if (!input.validity.valid) {
            errorMsg.classList.add('show');
            hasError = true;
        }
    });

    // 驗證是否至少有一個元素
    if (elements.length === 0) {
        showMessage('請至少新增一個文字或圖片元素', 'error');
        return;
    }

    // 驗證文字元素是否有內容（包括空白）
    let hasEmptyText = false;
    elements.forEach(element => {
        if (element.type === 'Text') {
            const input = document.getElementById(`text-input-${element.id}`);
            const errorMsg = document.getElementById(`text-error-${element.id}`);

            if (!element.labelText || !element.labelText.trim()) {
                // 標記為錯誤
                if (input) input.classList.add('empty-error');
                if (errorMsg) errorMsg.classList.add('show');
                hasEmptyText = true;
            } else {
                // 清除錯誤標記
                if (input) input.classList.remove('empty-error');
                if (errorMsg) errorMsg.classList.remove('show');
            }
        }
    });

    if (hasEmptyText) {
        showMessage('請填寫所有文字元素的內容', 'error');
        // 滾動到第一個空白的文字元素
        const firstEmptyInput = document.querySelector('.empty-error');
        if (firstEmptyInput) {
            firstEmptyInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstEmptyInput.focus();
        }
        return;
    }

    if (hasError) {
        showMessage('請修正標示紅色的欄位錯誤', 'error');
        return;
    }

    // 顯示載入動畫
    loading.classList.add('active');
    submitBtn.disabled = true;
    messageDiv.style.display = 'none';

    try {
        const formData = new FormData();

        // 印表機連線設定
        formData.append('Connection.IpAddress', document.getElementById('ipAddress').value);
        formData.append('Connection.Port', document.getElementById('port').value);

        // 標籤設定
        formData.append('LabelSetting.PaperType', document.getElementById('paperType').value);
        formData.append('LabelSetting.LabelH', document.getElementById('labelH').value);
        formData.append('LabelSetting.LabelW', document.getElementById('labelW').value);
        formData.append('LabelSetting.LabelGap', document.getElementById('labelGap').value);
        formData.append('LabelSetting.LabelDark', document.getElementById('labelDark').value);
        formData.append('LabelSetting.LabelSpeed', document.getElementById('labelSpeed').value);
        formData.append('LabelSetting.LabelPageNo', document.getElementById('labelPageNo').value);
        formData.append('LabelSetting.LabelCopyNo', document.getElementById('labelCopyNo').value);

        // 標籤元素 - 新格式
        elements.forEach((element, index) => {
            if (element.type === 'Text') {
                // 文字元素
                formData.append(`Elements[${index}].Type`, 'Text');
                formData.append(`Elements[${index}].LabelX`, element.labelX);
                formData.append(`Elements[${index}].LabelY`, element.labelY);
                formData.append(`Elements[${index}].LabelText`, element.labelText);
                formData.append(`Elements[${index}].FontHeight`, element.fontHeight);
                formData.append(`Elements[${index}].TextWidth`, element.textWidth);
            } else if (element.type === 'Image') {
                // 圖片元素
                formData.append(`Elements[${index}].Type`, 'Image');
                formData.append(`Elements[${index}].LabelX`, element.labelX);
                formData.append(`Elements[${index}].LabelY`, element.labelY);
                formData.append(`Elements[${index}].Image`, element.image);
                formData.append(`Elements[${index}].ImageWidthPx`, element.imageWidthPx);
                formData.append(`Elements[${index}].ImageHeightPx`, element.imageHeightPx);
            }
        });

        // 發送到 API
        const response = await fetch('https://localhost:7214/api/labels/print', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            showMessage('列印任務已成功送出!', 'success');
            // 可選: 重設表單
            // form.reset();
            // elements = [];
            // elementIdCounter = 0;
            // renderElements();
        } else {
            const errorData = await response.json();
            showMessage(`錯誤: ${errorData.message || '送出失敗，請檢查欄位'}`, 'error');
        }
    } catch (error) {
        showMessage(`網路錯誤: ${error.message}`, 'error');
    } finally {
        loading.classList.remove('active');
        submitBtn.disabled = false;
    }
});

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    // 5秒後自動隱藏
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

function resetForm() {
    if (confirm('確定要重設所有欄位嗎?')) {
        form.reset();
        elements = [];
        elementIdCounter = 0;
        renderElements();
        messageDiv.style.display = 'none';
    }
}