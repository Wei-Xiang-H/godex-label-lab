
    const form = document.getElementById('labelForm');
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    const messageDiv = document.getElementById('message');

    // 設定今天日期為預設值
    document.getElementById('manufacturedDate').valueAsDate = new Date();

    // 即時驗證功能 (只包含必填欄位)
    const formFields = [
    {id: 'ipAddress', errorId: 'error-ipAddress' },
    {id: 'port', errorId: 'error-port' },
    {id: 'paperType', errorId: 'error-paperType' },
    {id: 'labelH', errorId: 'error-labelH' },
    {id: 'labelW', errorId: 'error-labelW' },
    {id: 'labelGap', errorId: 'error-labelGap' },
    {id: 'labelDark', errorId: 'error-labelDark' },
    {id: 'labelSpeed', errorId: 'error-labelSpeed' },
    {id: 'labelCopyNo', errorId: 'error-labelCopyNo' },
    {id: 'productName', errorId: 'error-productName' },
    {id: 'manufacturedDate', errorId: 'error-manufacturedDate' },
    {id: 'phone', errorId: 'error-phone' }
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

        // 檔案格式驗證（只在有選擇檔案時才驗證）
        document.getElementById('image').addEventListener('change', (e) => {
            const file = e.target.files[0];
    const errorMsg = document.getElementById('error-image');

    if (file) {
                const validExtensions = ['.bmp', '.gif'];
    const fileName = file.name.toLowerCase();
                const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
        errorMsg.classList.add('show');
    e.target.value = ''; // 清除選擇
                } else {
        errorMsg.classList.remove('show');
                }
            } else {
        // 沒有選擇檔案，清除錯誤訊息
        errorMsg.classList.remove('show');
            }
        });

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

    // 圖片欄位的格式驗證 (只在有上傳檔案時才檢查)
    const imageInput = document.getElementById('image');
    const imageError = document.getElementById('error-image');
    const imageFile = imageInput.files[0];

    if (imageFile) {
                const validExtensions = ['.bmp', '.gif'];
    const fileName = imageFile.name.toLowerCase();
                const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
        imageError.classList.add('show');
    hasError = true;
                }
            }

    if (hasError) {
        showMessage('請修正標示紅色的欄位錯誤', 'error');
    // 滾動到第一個錯誤欄位
    const firstError = document.querySelector('.error-message.show');
    if (firstError) {
        firstError.previousElementSibling.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstError.previousElementSibling.focus();
                }
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

    // 標籤內容
    formData.append('Element.ProductName', document.getElementById('productName').value);
    formData.append('Element.ManufacturedDate', document.getElementById('manufacturedDate').value);
    formData.append('Element.Phone', document.getElementById('phone').value);

    // 圖片檔案 (如果有上傳)
    const imageFile = document.getElementById('image').files[0];
    if (imageFile) {
        formData.append('Image', imageFile);
                }

    // 發送到 API
    const response = await fetch('https://localhost:7214/api/labels/print', {
        method: 'POST',
    body: formData
                });

    if (response.ok) {
        showMessage('列印成功送出!', 'success');
                    // 可選: 重設表單
                    // form.reset();
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

            // 3秒後自動隱藏
            setTimeout(() => {
        messageDiv.style.display = 'none';
            }, 5000);
        }

    function resetForm() {
            if (confirm('確定要重設所有欄位嗎?')) {
        form.reset();
    document.getElementById('manufacturedDate').valueAsDate = new Date();
    messageDiv.style.display = 'none';
            }
        }
