// 標籤機列印表單 JavaScript
const form = document.getElementById('labelForm');
const submitBtn = document.getElementById('submitBtn');
const loading = document.getElementById('loading');
const messageDiv = document.getElementById('message');
const elementsList = document.getElementById('elementsList');

// 元素陣列
let elements = [];
let elementIdCounter = 0;

// HTML 跳脫函數（防止 XSS 攻擊）
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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
        textWidth: 1
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

    const detailsDiv = document.getElementById(`details-${elementId}`);
    detailsDiv.classList.toggle('show');
}

// 確認編輯
function confirmEdit(elementId) {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    // 如果是文字元素，再次驗證是否有內容
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
            return; // 不收合編輯區
        }
    }

    if (element.type === 'Text') {
        element.labelX = parseInt(document.getElementById(`x-${elementId}`).value) || 0;
        element.labelY = parseInt(document.getElementById(`y-${elementId}`).value) || 0;
        element.fontHeight = parseInt(document.getElementById(`fontHeight-${elementId}`).value) || 32;
        element.textWidth = parseInt(document.getElementById(`textWidth-${elementId}`).value) || 1;
    } else if (element.type === 'Image') {
        element.labelX = parseInt(document.getElementById(`x-${elementId}`).value) || 0;
        element.labelY = parseInt(document.getElementById(`y-${elementId}`).value) || 0;
        element.imageWidthPx = parseInt(document.getElementById(`imgWidth-${elementId}`).value) || 100;
        element.imageHeightPx = parseInt(document.getElementById(`imgHeight-${elementId}`).value) || 100;
    }

    toggleDetails(elementId);
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
                                        <input type="number" id="x-${element.id}" value="${element.labelX}" min="0">
                                    </div>
                                    <div class="detail-group">
                                        <label>Y 座標</label>
                                        <input type="number" id="y-${element.id}" value="${element.labelY}" min="0">
                                    </div>
                                    <div class="detail-group">
                                        <label>字體高度</label>
                                        <input type="number" id="fontHeight-${element.id}" value="${element.fontHeight}" min="1">
                                    </div>
                                    <div class="detail-group">
                                        <label>文字寬度</label>
                                        <input type="number" id="textWidth-${element.id}" value="${element.textWidth}" min="1">
                                    </div>
                                </div>
                                <button type="button" class="btn-confirm" onclick="confirmEdit(${element.id})">確認</button>
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
                                        <input type="number" id="x-${element.id}" value="${element.labelX}" min="0">
                                    </div>
                                    <div class="detail-group">
                                        <label>Y 座標</label>
                                        <input type="number" id="y-${element.id}" value="${element.labelY}" min="0">
                                    </div>
                                    <div class="detail-group">
                                        <label>圖片寬度 (px)</label>
                                        <input type="number" id="imgWidth-${element.id}" value="${element.imageWidthPx}" min="1">
                                    </div>
                                    <div class="detail-group">
                                        <label>圖片高度 (px)</label>
                                        <input type="number" id="imgHeight-${element.id}" value="${element.imageHeightPx}" min="1">
                                    </div>
                                </div>
                                <button type="button" class="btn-confirm" onclick="confirmEdit(${element.id})">確認</button>
                            </div>
                        </div>
                    `;
        }
    }).join('');
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

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