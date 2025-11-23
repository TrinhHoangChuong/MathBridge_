// ===== TEACHER FUNCTIONS - Real API Integration =====

// Define loadAssignmentsSection IMMEDIATELY at the top to ensure it's always available
// This MUST be defined before any other code that might reference it
window.__teacherFunctionsLoaded = false;

// Define toggleEditMode early to ensure it's available when HTML loads
window.toggleEditMode = function(event) {
    console.log('toggleEditMode called', event);
    
    // Prevent default behavior
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    try {
        const editBtn = document.getElementById('editGradesBtn');
        console.log('editBtn found:', editBtn);
        
        if (!editBtn) {
            console.error('editBtn not found!');
            alert('Không tìm thấy nút chỉnh sửa. Vui lòng tải lại trang.');
            return;
        }
        
        const gradeInputs = document.querySelectorAll('.grade-input-small');
        console.log('gradeInputs found:', gradeInputs.length);
        
        const btnText = editBtn.textContent || editBtn.innerHTML || '';
        const isEditMode = btnText.includes('Lưu điểm');
        console.log('isEditMode:', isEditMode, 'btnText:', btnText);
        
        if (isEditMode) {
            // Save mode: Save all grades
            console.log('Entering save mode...');
            if (typeof window.saveAllGrades === 'function') {
                window.saveAllGrades();
            } else {
                console.error('saveAllGrades function not found');
                alert('Lỗi: Không tìm thấy hàm lưu điểm. Vui lòng tải lại trang.');
            }
        } else {
            // Enter edit mode: Enable all inputs
            console.log('Entering edit mode...');
            if (gradeInputs.length === 0) {
                console.warn('No grade inputs found');
                if (typeof showNotification === 'function') {
                    showNotification('Không có điểm số để chỉnh sửa.', 'warning');
                } else {
                    alert('Không có điểm số để chỉnh sửa.');
                }
                return;
            }
            
            gradeInputs.forEach((input, index) => {
                console.log(`Enabling input ${index}:`, input);
                input.disabled = false;
                input.style.backgroundColor = '#fff';
                input.style.cursor = 'text';
                
                // Thêm event listener để tính điểm TB ngay khi nhập
                const studentId = input.getAttribute('data-student-id');
                if (studentId) {
                    // Remove existing listeners to avoid duplicates
                    const newInput = input.cloneNode(true);
                    input.parentNode.replaceChild(newInput, input);
                    
                    // Add input event listener để tính điểm TB real-time
                    newInput.addEventListener('input', function() {
                        updateDiemTBForStudent(studentId);
                    });
                    
                    // Add blur event listener để tính lại khi rời khỏi ô
                    newInput.addEventListener('blur', function() {
                        updateDiemTBForStudent(studentId);
                    });
                }
            });
            
            if (editBtn) {
                editBtn.innerHTML = '<i class="fas fa-save"></i> Lưu điểm';
                editBtn.setAttribute('onclick', 'toggleEditMode(event)');
                console.log('Button updated to "Lưu điểm"');
            }
        }
    } catch (error) {
        console.error('Error in toggleEditMode:', error);
        alert('Có lỗi xảy ra: ' + error.message);
    }
};

// Define saveAllGrades early as well
window.saveAllGrades = async function() {
    console.log('saveAllGrades called');
    try {
        if (typeof TeacherAPI === 'undefined') {
            throw new Error('TeacherAPI không khả dụng');
        }
        
        const api = new TeacherAPI();
        const gradeInputs = document.querySelectorAll('.grade-input-small');
        const editBtn = document.getElementById('editGradesBtn');
        
        console.log('Found inputs:', gradeInputs.length);
        
        if (gradeInputs.length === 0) {
            showNotification('Không có điểm số để lưu.', 'warning');
            return;
        }
        
        // Disable button and show loading
        if (editBtn) {
            editBtn.disabled = true;
            editBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
        }
        
        // Group updates by student - collect all 3 scores for each student with changes
        const updatesByStudent = new Map();
        const studentsWithChanges = new Set();
        
        // First pass: identify students with changes
        gradeInputs.forEach(input => {
            const studentId = input.getAttribute('data-student-id');
            const classId = input.getAttribute('data-class-id');
            const loaiDiem = input.getAttribute('data-loai-diem');
            const originalValue = input.getAttribute('data-original-value') || '';
            const currentValue = input.value.trim();
            
            if (!studentId || !classId || !loaiDiem) {
                console.warn('Missing attributes:', { studentId, classId, loaiDiem });
                return;
            }
            
            // Check if value has changed
            if (currentValue !== originalValue) {
                const key = `${classId}_${studentId}`;
                studentsWithChanges.add(key);
            }
        });
        
        // Second pass: collect ALL 3 scores for students with changes
        gradeInputs.forEach(input => {
            const studentId = input.getAttribute('data-student-id');
            const classId = input.getAttribute('data-class-id');
            const loaiDiem = input.getAttribute('data-loai-diem');
            const currentValue = input.value.trim();
            
            if (!studentId || !classId || !loaiDiem) {
                return;
            }
            
            const key = `${classId}_${studentId}`;
            
            // Only process students with changes
            if (!studentsWithChanges.has(key)) {
                return;
            }
            
            if (!updatesByStudent.has(key)) {
                updatesByStudent.set(key, {
                    classId,
                    studentId,
                    diem15: null,
                    diem45: null,
                    diemHK: null,
                    hasChanges: true
                });
            }
            
            const update = updatesByStudent.get(key);
            const diemValue = currentValue === '' ? null : parseFloat(currentValue);
            
            // Validate
            if (diemValue !== null && (isNaN(diemValue) || diemValue < 0 || diemValue > 10)) {
                throw new Error(`Điểm số không hợp lệ cho học sinh ${studentId}: ${currentValue}`);
            }
            
            // Collect all 3 scores (not just changed ones)
            if (loaiDiem === '15P') {
                update.diem15 = diemValue;
            } else if (loaiDiem === '45P') {
                update.diem45 = diemValue;
            } else if (loaiDiem === 'HK') {
                update.diemHK = diemValue;
            }
        });
        
        // Filter to only students with changes
        const studentsToUpdate = Array.from(updatesByStudent.values()).filter(u => u.hasChanges);
        
        console.log('Students to update:', studentsToUpdate.length, studentsToUpdate);
        
        if (studentsToUpdate.length === 0) {
            showNotification('Không có thay đổi nào để lưu.', 'info');
            
            // Exit edit mode
            const allGradeInputs = document.querySelectorAll('.grade-input-small');
            allGradeInputs.forEach(input => {
                input.disabled = true;
                input.style.backgroundColor = '#f8fafc';
                input.style.cursor = 'not-allowed';
            });
            
            if (editBtn) {
                editBtn.disabled = false;
                editBtn.innerHTML = '<i class="fas fa-edit"></i> Chỉnh sửa';
                editBtn.setAttribute('onclick', 'toggleEditMode(event)');
            }
            return;
        }
        
        // Update only students with changes
        let successCount = 0;
        let errorCount = 0;
        
        for (const update of studentsToUpdate) {
            try {
                console.log('Updating student:', update.studentId, update);
                // Update all 3 scores together to ensure no data loss
                // Always send all 3 scores (null if empty) to preserve existing values
                const result15 = await api.updateDiemSo(update.classId, update.studentId, '15P', update.diem15);
                const result45 = await api.updateDiemSo(update.classId, update.studentId, '45P', update.diem45);
                const resultHK = await api.updateDiemSo(update.classId, update.studentId, 'HK', update.diemHK);
                
                // Get the latest result (should have all 3 scores and calculated DiemTrungBinh)
                const latestResult = resultHK || result45 || result15;
                
                // Update display immediately with the latest data
                if (latestResult) {
                    // Calculate DiemTrungBinh tạm thời nếu backend chưa có
                    let diemTB = latestResult.diemTrungBinh || latestResult.diemTB;
                    if (!diemTB || diemTB === 0) {
                        const diem15Num = parseFloat(update.diem15 || 0);
                        const diem45Num = parseFloat(update.diem45 || 0);
                        const diemHKNum = parseFloat(update.diemHK || 0);
                        const scores = [diem15Num, diem45Num, diemHKNum].filter(s => s > 0);
                        if (scores.length > 0) {
                            const sum = scores.reduce((a, b) => a + b, 0);
                            diemTB = (sum / scores.length).toFixed(2);
                        }
                    }
                    
                    const xepLoai = latestResult.xepLoai;
                    
                    // Update the DiemTB cell in the table
                    const diemTBCell = document.querySelector(`.diem-tb-cell[data-student-id="${update.studentId}"]`);
                    if (diemTBCell) {
                        const formattedTB = diemTB ? parseFloat(diemTB).toFixed(1) : '-';
                        diemTBCell.textContent = formattedTB;
                        console.log(`Updated DiemTB display for ${update.studentId}: ${formattedTB}`);
                    }
                    
                    // Update xepLoai badge if needed
                    const row = document.querySelector(`tr[data-student-id="${update.studentId}"]`) || 
                               diemTBCell?.closest('tr');
                    if (row) {
                        // Update xepLoai if available from backend
                        if (xepLoai) {
                            const xepLoaiCell = row.querySelector('.xep-loai-badge, .badge, [class*="badge"]');
                            if (xepLoaiCell && window.teacherDashboard) {
                                xepLoaiCell.textContent = xepLoai;
                                // Update badge class using teacherDashboard method
                                const badgeClass = window.teacherDashboard.getGradeBadgeClass(xepLoai, diemTB || '0');
                                xepLoaiCell.className = `badge ${badgeClass}`;
                            }
                        }
                        
                        // Also update xepLoai based on calculated diemTB if no xepLoai from backend
                        if (!xepLoai && diemTB) {
                            const diemTBNum = parseFloat(diemTB);
                            if (!isNaN(diemTBNum) && window.teacherDashboard) {
                                const calculatedXepLoai = window.teacherDashboard.classifyScore(diemTB);
                                const xepLoaiCell = row.querySelector('.xep-loai-badge, .badge, [class*="badge"]');
                                if (xepLoaiCell) {
                                    xepLoaiCell.textContent = calculatedXepLoai;
                                    const badgeClass = window.teacherDashboard.getGradeBadgeClass(calculatedXepLoai, diemTB);
                                    xepLoaiCell.className = `badge ${badgeClass}`;
                                }
                            }
                        }
                    }
                }
                
                successCount++;
                console.log('Successfully updated student:', update.studentId);
            } catch (error) {
                console.error(`Error updating grades for student ${update.studentId}:`, error);
                errorCount++;
            }
        }
        
        // Exit edit mode: Disable all inputs and change button back
        const allGradeInputs = document.querySelectorAll('.grade-input-small');
        
        allGradeInputs.forEach(input => {
            input.disabled = true;
            input.style.backgroundColor = '#f8fafc';
            input.style.cursor = 'not-allowed';
        });
        
        if (editBtn) {
            editBtn.disabled = false;
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Chỉnh sửa';
            editBtn.setAttribute('onclick', 'toggleEditMode(event)');
        }
        
        if (errorCount === 0) {
            showNotification(`Đã lưu điểm số cho ${successCount} học sinh thành công!`, 'success');
        } else {
            showNotification(`Đã lưu ${successCount} học sinh, ${errorCount} học sinh lỗi.`, 'warning');
        }
        
        // Refresh grades section - force reload from server
        const firstUpdate = Array.from(updatesByStudent.values())[0];
        if (firstUpdate && window.teacherDashboard) {
            console.log('Refreshing grades section...');
            // Add small delay to ensure backend has saved the data
            await new Promise(resolve => setTimeout(resolve, 300));
            // Force refresh by clearing cache
            if (window.teacherDashboard.gradeDataByClass) {
                window.teacherDashboard.gradeDataByClass.delete(String(firstUpdate.classId));
            }
            await window.teacherDashboard.loadGradesSection(firstUpdate.classId, { preserveSelection: true });
        }
    } catch (error) {
        console.error('Error saving all grades:', error);
        showNotification(error.message || 'Không thể lưu điểm số. Vui lòng thử lại sau.', 'error');
        
        const editBtn = document.getElementById('editGradesBtn');
        if (editBtn) {
            editBtn.disabled = false;
            editBtn.innerHTML = '<i class="fas fa-save"></i> Lưu điểm';
            editBtn.setAttribute('onclick', 'toggleEditMode(event)');
        }
    }
};

window.loadAssignmentsSection = async function() {
    console.log('=== loadAssignmentsSection called ===');
    console.log('Function dependencies check:');
    console.log('  - getAuthContext:', typeof getAuthContext);
    console.log('  - TeacherAPI:', typeof TeacherAPI);
    console.log('  - showNotification:', typeof showNotification);
    console.log('  - escapeHtml:', typeof escapeHtml);
    console.log('  - buildReferenceHtml:', typeof buildReferenceHtml);
    console.log('  - getLoaiBaiTapLabel:', typeof getLoaiBaiTapLabel);
    
    try {
        // Check dependencies
        if (typeof getAuthContext !== 'function') {
            console.error('getAuthContext is not available!');
            throw new Error('getAuthContext function not found. Please ensure teacher-main.js is loaded.');
        }
        
        if (typeof TeacherAPI !== 'function' && typeof window.TeacherAPI !== 'function') {
            console.error('TeacherAPI is not available!');
            throw new Error('TeacherAPI class not found. Please ensure teacher-main.js is loaded.');
        }
        
        const authContext = getAuthContext();
        console.log('Auth context:', authContext);
        
        if (!authContext?.payload?.user?.idNv) {
            console.error('No teacher ID found in auth context');
            return;
        }
        
        const teacherId = authContext.payload.user.idNv;
        console.log('Loading assignments for teacher:', teacherId);
        
        const ApiClass = typeof TeacherAPI === 'function' ? TeacherAPI : window.TeacherAPI;
        const api = new ApiClass();
        console.log('Calling API: getBaiTapByGiaoVien(' + teacherId + ')');
        console.log('API baseURL:', api.baseURL);
        console.log('API token exists:', !!api.token);
        
        let baiTaps;
        try {
            baiTaps = await api.getBaiTapByGiaoVien(teacherId);
            console.log('API response received:', baiTaps);
            console.log('Response type:', typeof baiTaps);
            console.log('Is array:', Array.isArray(baiTaps));
            console.log('Number of assignments:', baiTaps ? baiTaps.length : 0);
            
            if (baiTaps && baiTaps.length > 0) {
                console.log('First assignment:', baiTaps[0]);
            }
        } catch (apiError) {
            console.error('API call failed:', apiError);
            console.error('Error message:', apiError.message);
            console.error('Error stack:', apiError.stack);
            throw apiError;
        }

        const assignmentsGrid = document.querySelector('.assignments-grid');
        console.log('Assignments grid element:', assignmentsGrid);
        
        if (assignmentsGrid) {
            if (!baiTaps || baiTaps.length === 0) {
                console.log('No assignments found, showing empty state');
                assignmentsGrid.innerHTML = '<div class="empty-state"><p>Chưa có bài tập nào</p></div>';
            } else {
                console.log('Rendering ' + baiTaps.length + ' assignments');
                window.__teacherAssignmentsById = new Map();

                try {
                    // Get helper functions with fallbacks
                    const escapeFn = typeof escapeHtml === 'function' ? escapeHtml : (typeof window.escapeHtml === 'function' ? window.escapeHtml : (text) => String(text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;'));
                    const getLabelFn = typeof getLoaiBaiTapLabel === 'function' ? getLoaiBaiTapLabel : (typeof window.getLoaiBaiTapLabel === 'function' ? window.getLoaiBaiTapLabel : null);
                    
                    const htmlContent = baiTaps.map((bt, index) => {
                        try {
                            const assignmentId = bt.idBt ?? bt.id ?? bt.maBt;
                            if (assignmentId) {
                                window.__teacherAssignmentsById.set(String(assignmentId), bt);
                            }

                            const startDate = bt.ngayBatDau ? new Date(bt.ngayBatDau) : null;
                            const endDate = bt.ngayKetThuc ? new Date(bt.ngayKetThuc) : null;
                            const startStr = startDate && isFinite(startDate.getTime()) ? startDate.toLocaleDateString('vi-VN') : 'Chưa có';
                            const endStr = endDate && isFinite(endDate.getTime()) ? endDate.toLocaleDateString('vi-VN') : 'Chưa có';
                            const progress = bt.soBaiNop > 0 ? Math.round((bt.soBaiDaCham / bt.soBaiNop) * 100) : 0;
                            
                            let referenceHtml = '';
                            try {
                                const buildRefFn = typeof buildReferenceHtml === 'function' ? buildReferenceHtml : (typeof window.buildReferenceHtml === 'function' ? window.buildReferenceHtml : null);
                                if (buildRefFn) {
                                    referenceHtml = buildRefFn(bt);
                                }
                            } catch (refError) {
                                console.warn('Error building reference HTML for assignment ' + assignmentId + ':', refError);
                            }
                            
                            const description = bt.moTa || bt.ghiChu || '';
                            const loaiBtLabel = getLabelFn ? getLabelFn(bt.loaiBt) : (bt.loaiBt || 'Chưa có');

                            return `
                                    <div class="assignment-card">
                                        <div class="assignment-header">
                                            <h3>${escapeFn(bt.tieuDe || 'Chưa có tiêu đề')}</h3>
                                            <div class="assignment-actions">
                                                <button class="btn-icon" title="Chỉnh sửa" onclick="editAssignment('${assignmentId}')">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn-icon" title="Xóa" onclick="deleteAssignment('${assignmentId}')">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="assignment-body">
                                            <div class="assignment-meta">
                                                <p><i class="fas fa-chalkboard-teacher"></i> ${escapeFn(bt.tenLop || 'Chưa có lớp')}</p>
                                                <p><i class="fas fa-tag"></i> ${escapeFn(loaiBtLabel)}</p>
                                                <p><i class="fas fa-calendar"></i> ${startStr !== 'Chưa có' ? `Bắt đầu: ${startStr}` : 'Chưa có ngày bắt đầu'}</p>
                                                <p><i class="fas fa-hourglass-end"></i> Hạn nộp: ${endStr}</p>
                                            </div>
                                            ${description ? `
                                                <div class="assignment-description">
                                                    <p>${escapeFn(description)}</p>
                                                </div>` : ''}
                                            ${referenceHtml ? `
                                                <div class="assignment-reference">
                                                    ${referenceHtml}
                                                </div>` : ''}
                                            <div class="assignment-progress">
                                                <div class="progress-info">
                                                    <span>${bt.soBaiDaCham || 0}/${bt.soBaiNop || 0} đã chấm</span>
                                                    <span>${progress}%</span>
                                                </div>
                                                <div class="progress-bar">
                                                    <div class="progress-fill" style="width: ${progress}%"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="assignment-actions-full">
                                            <button class="btn btn-sm btn-primary" onclick="gradeAssignment('${assignmentId}')">
                                                <i class="fas fa-check"></i> Chấm điểm
                                            </button>
                                            <button class="btn btn-sm btn-info" onclick="viewAssignmentDetails('${assignmentId}')">
                                                <i class="fas fa-eye"></i> Xem chi tiết
                                            </button>
                                        </div>
                                    </div>
                                `;
                            } catch (itemError) {
                                console.error('Error rendering assignment item at index ' + index + ':', itemError);
                                console.error('Assignment data:', bt);
                                return '<div class="assignment-card"><p style="color: red;">Lỗi khi hiển thị bài tập này</p></div>';
                            }
                        }).join('');
                        
                        assignmentsGrid.innerHTML = htmlContent;
                        console.log('Successfully rendered ' + baiTaps.length + ' assignments to DOM');
                    } catch (renderError) {
                        console.error('Error rendering assignments HTML:', renderError);
                        console.error('Error stack:', renderError.stack);
                        assignmentsGrid.innerHTML = '<div class="empty-state"><p style="color: red;">Lỗi khi hiển thị danh sách bài tập: ' + renderError.message + '</p></div>';
                    }
                }
            } else {
                console.error('Assignments grid element not found!');
            }
    } catch (error) {
        console.error('ERROR in loadAssignmentsSection:', error);
        console.error('Error stack:', error.stack);
        
        // Try to show notification if available
        if (typeof showNotification === 'function') {
            showNotification('Không thể tải danh sách bài tập. Vui lòng thử lại sau.', 'error');
        } else if (typeof window.showNotification === 'function') {
            window.showNotification('Không thể tải danh sách bài tập. Vui lòng thử lại sau.', 'error');
        } else {
            console.error('showNotification not available');
        }
        
        const assignmentsGrid = document.querySelector('.assignments-grid');
        if (assignmentsGrid) {
            assignmentsGrid.innerHTML = '<div class="empty-state"><p style="color: red;">Lỗi khi tải danh sách bài tập: ' + (error.message || 'Unknown error') + '</p></div>';
        }
    }
    console.log('=== loadAssignmentsSection completed ===');
};

// Mark as loaded
window.__teacherFunctionsLoaded = true;
console.log('✅ teacher-functions.js: loadAssignmentsSection defined at top level');

function escapeHtml(text) {
    if (typeof text !== 'string') {
        return '';
    }
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function buildReferenceHtml(assignment) {
    if (!assignment) {
        return '';
    }

    const {
        taiLieuUrl,
        thamKhao,
        taiLieuText,
        taiLieuThamKhao,
        taiLieuNoiDung,
        ghiChu,
        moTa
    } = assignment;

    const referenceText = taiLieuText || taiLieuThamKhao || taiLieuNoiDung || thamKhao || '';

    if (taiLieuUrl && /^https?:\/\//i.test(taiLieuUrl)) {
        return `
            <a class="assignment-ref-link" href="${escapeHtml(taiLieuUrl)}" target="_blank" rel="noopener">
                <i class="fas fa-link"></i> Tài liệu tham khảo
            </a>
        `;
    }

    const combinedText = referenceText || ghiChu || moTa;
    if (!combinedText) {
        return '';
    }

    return `
        <div class="assignment-ref-text">
            <i class="fas fa-note-sticky"></i>
            <span>${escapeHtml(combinedText)}</span>
        </div>
    `;
}

// Question builder state used while teacher creates assignments
const assignmentQuestionBuilder = {
    container: null,
    questions: []
};

window.__currentAssignmentEdit = null;
window.__assignmentDraft = null;

function snapshotAssignmentDraft() {
    const form = document.getElementById('createAssignmentForm');
    if (!form) {
        return null;
    }
    const getValue = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : '';
    };
    const draft = {
        title: getValue('assignmentTitle'),
        type: getValue('assignmentType'),
        classId: getValue('assignmentClass'),
        startDate: getValue('assignmentStartDate'),
        endDate: getValue('assignmentEndDate'),
        description: getValue('assignmentDescription'),
        duration: getValue('assignmentDuration'),
        warning: getValue('assignmentWarning'),
        importText: getValue('questionImportText'),
        questions: Array.isArray(assignmentQuestionBuilder.questions)
            ? assignmentQuestionBuilder.questions.map((q) => ({
                questionId: q.questionId,
                type: q.type,
                content: q.content,
                options: Array.isArray(q.options) ? q.options.slice() : [],
                correctAnswerIndex: q.correctAnswerIndex,
                guideline: q.guideline,
                points: q.points,
                fileUrl: q.fileUrl
            }))
            : []
    };
    return draft;
}

function applyAssignmentDraft(draft) {
    if (!draft) {
        return;
    }
    const setValue = (id, value) => {
        const el = document.getElementById(id);
        if (el && value != null) {
            el.value = value;
        }
    };
    setValue('assignmentTitle', draft.title || '');
    setValue('assignmentType', draft.type || '');
    setValue('assignmentClass', draft.classId || '');
    setValue('assignmentStartDate', draft.startDate || '');
    setValue('assignmentEndDate', draft.endDate || '');
    setValue('assignmentDescription', draft.description || '');
    setValue('assignmentDuration', draft.duration || '');
    setValue('assignmentWarning', draft.warning || '');
    setValue('questionImportText', draft.importText || '');

    if (Array.isArray(draft.questions) && draft.questions.length) {
        assignmentQuestionBuilder.questions = draft.questions.map((q, index) => ({
            uid: `draft_${Date.now()}_${index}`,
            questionId: q.questionId || `Q${index + 1}`,
            type: q.type || 'MULTIPLE_CHOICE',
            content: q.content || '',
            options: q.type === 'MULTIPLE_CHOICE' ? (q.options || []) : [],
            correctAnswerIndex: q.type === 'MULTIPLE_CHOICE' ? (typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0) : null,
            guideline: q.guideline || '',
            points: q.points ?? 1,
            fileUrl: q.fileUrl || ''
        }));
        renderQuestionBuilder();
    }
    if (typeof showNotification === 'function') {
        showNotification('Đã khôi phục bản nháp bài tập gần nhất.', 'info');
    }
}

function clearAssignmentDraft() {
    window.__assignmentDraft = null;
}

window.cancelAssignmentCreation = function() {
    const isEdit = !!window.__currentAssignmentEdit;
    const confirmMessage = isEdit
        ? 'Bạn có chắc muốn hủy chỉnh sửa bài tập này?'
        : 'Bản nháp bài tập sẽ bị xóa. Bạn có chắc muốn hủy?';
    if (!window.confirm(confirmMessage)) {
        return;
    }
    if (isEdit) {
        window.__currentAssignmentEdit = null;
        closeAssignmentModal({ preserveDraft: false });
    } else {
        clearAssignmentDraft();
        closeAssignmentModal({ preserveDraft: false, clearDraft: true });
    }
    if (typeof showNotification === 'function') {
        showNotification(isEdit ? 'Đã hủy chỉnh sửa bài tập.' : 'Đã xóa bản nháp bài tập.', 'info');
    }
};

async function resolveAssignmentById(assignmentId) {
    const idKey = String(assignmentId);
    if (!idKey || idKey === 'undefined') {
        return null;
    }

    if (window.__teacherAssignmentsById?.get?.(idKey)) {
        return window.__teacherAssignmentsById.get(idKey);
    }

    const authContext = getAuthContext();
    if (!authContext?.payload?.user?.idNv) {
        throw new Error('Không thể xác định giáo viên hiện tại.');
    }

    const api = new TeacherAPI();
    const baiTaps = await api.getBaiTapByGiaoVien(authContext.payload.user.idNv);
    if (Array.isArray(baiTaps)) {
        window.__teacherAssignmentsById = window.__teacherAssignmentsById || new Map();
        baiTaps.forEach((bt) => {
            const key = String(bt.idBt ?? bt.id ?? bt.maBt ?? bt.assignmentId);
            if (key) {
                window.__teacherAssignmentsById.set(key, bt);
            }
        });
        return window.__teacherAssignmentsById.get(idKey) || null;
    }
    return null;
}

window.closeAssignmentModal = function(options = {}) {
    const { preserveDraft = true, clearDraft = false, keepEditState = false } = options;
    const modal = document.getElementById('assignmentModal');
    const isEditing = !!window.__currentAssignmentEdit;

    if (preserveDraft && !isEditing) {
        try {
            const draft = snapshotAssignmentDraft();
            if (draft) {
                window.__assignmentDraft = draft;
                console.log('Assignment draft saved locally.', draft);
            }
        } catch (err) {
            console.warn('Không thể lưu bản nháp bài tập:', err);
        }
    }

    if (clearDraft) {
        clearAssignmentDraft();
    }

    if (modal) {
        modal.remove();
    }
    assignmentQuestionBuilder.container = null;
    assignmentQuestionBuilder.questions = [];
    if (isEditing && !keepEditState) {
        window.__currentAssignmentEdit = null;
    }
};

function formatDateForInput(date) {
    if (!date) return '';
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function initializeQuestionBuilder(containerId) {
    assignmentQuestionBuilder.container = document.getElementById(containerId);
    assignmentQuestionBuilder.questions = [];
    renderQuestionBuilder();
}

function renderQuestionBuilder() {
    const container = assignmentQuestionBuilder.container;
    if (!container) return;

    if (!assignmentQuestionBuilder.questions.length) {
        container.innerHTML = `
            <div class="question-builder-empty">
                <i class="fas fa-layer-group"></i>
                <p>Chưa có câu hỏi nào. Hãy nhấn "Thêm trắc nghiệm" hoặc "Thêm tự luận".</p>
            </div>
        `;
        return;
    }

    container.innerHTML = assignmentQuestionBuilder.questions.map((q, index) => {
        const questionOrder = index + 1;
        const optionsHtml = q.type === 'MULTIPLE_CHOICE'
            ? `
                <div class="qb-options">
                    ${q.options.map((opt, optIndex) => `
                        <div class="qb-option">
                            <label>
                                <input type="radio" name="correct_${q.uid}" ${q.correctAnswerIndex === optIndex ? 'checked' : ''} onclick="selectCorrectAnswer('${q.uid}', ${optIndex})">
                                <span>Đáp án đúng</span>
                            </label>
                            <input type="text" class="form-input" placeholder="Lựa chọn #${optIndex + 1}" value="${opt || ''}"
                                   oninput="updateQuestionOption('${q.uid}', ${optIndex}, this.value)">
                            ${q.options.length > 2 ? `<button type="button" class="btn-icon" onclick="removeQuestionOption('${q.uid}', ${optIndex})"><i class="fas fa-times"></i></button>` : ''}
                        </div>
                    `).join('')}
                    <button type="button" class="btn btn-sm btn-light" onclick="addQuestionOption('${q.uid}')">
                        <i class="fas fa-plus"></i> Thêm lựa chọn
                    </button>
                </div>
            `
            : `
                <textarea class="form-input" rows="3" placeholder="Hướng dẫn cho câu hỏi tự luận..."
                          oninput="updateQuestionField('${q.uid}', 'guideline', this.value)">${q.guideline || ''}</textarea>
            `;

        return `
            <div class="question-card">
                <div class="question-card-header">
                    <div>
                        <span class="question-index">Câu ${questionOrder}</span>
                        <span class="question-type-badge">${q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}</span>
                    </div>
                    <div class="question-actions">
                        <label>Điểm:</label>
                        <input type="number" min="0.5" step="0.5" value="${q.points}" class="points-input"
                               oninput="updateQuestionField('${q.uid}', 'points', this.value)">
                        <button type="button" class="btn-icon danger" onclick="removeAssignmentQuestion('${q.uid}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="question-card-body">
                    <textarea class="form-input" rows="3" placeholder="Nội dung câu hỏi..."
                              oninput="updateQuestionField('${q.uid}', 'content', this.value)">${q.content || ''}</textarea>
                    ${q.type === 'MULTIPLE_CHOICE' ? `
                        <small class="helper-text">Đánh dấu lựa chọn đúng bằng cách chọn nút tròn bên trái.</small>
                    ` : `
                        <small class="helper-text">Học sinh sẽ nhập câu trả lời. Bạn có thể mô tả yêu cầu hoặc chấm điểm.</small>
                    `}
                    ${optionsHtml}
                    <div class="question-attachment">
                        <input type="url" class="form-input" placeholder="Link tài liệu/hình ảnh minh họa (tuỳ chọn)"
                               value="${q.fileUrl || ''}" oninput="updateQuestionField('${q.uid}', 'fileUrl', this.value)">
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.handleQuestionImportFile = async function(event) {
    const file = event?.target?.files?.[0];
    if (!file) {
        return;
    }
    try {
        const text = await file.text();
        const input = document.getElementById('questionImportText');
        if (input) {
            input.value = text;
        }
        if (typeof showNotification === 'function') {
            showNotification(`Đã tải nội dung từ ${file.name}`, 'info');
        }
    } catch (error) {
        console.error('Error reading question import file:', error);
        if (typeof showNotification === 'function') {
            showNotification('Không thể đọc file câu hỏi. Vui lòng thử lại.', 'error');
        }
    }
};

window.importQuestionsFromText = function() {
    const input = document.getElementById('questionImportText');
    if (!input) {
        return;
    }
    const raw = input.value;
    if (!raw || !raw.trim()) {
        if (typeof showNotification === 'function') {
            showNotification('Vui lòng nhập nội dung câu hỏi trước khi import.', 'warning');
        }
        return;
    }

    // Split by number pattern (1., 2., etc.) or double newlines
    // First, try splitting by numbered questions
    let blocks = raw.split(/(?=^\d+\.\s)/m).map(block => block.trim()).filter(Boolean);
    
    // If no numbered questions found, try double newlines
    if (blocks.length <= 1) {
        blocks = raw.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);
    }
    
    if (!blocks.length) {
        if (typeof showNotification === 'function') {
            showNotification('Không tìm thấy định dạng câu hỏi hợp lệ.', 'warning');
        }
        return;
    }

    let imported = 0;
    // Improved regex to match "- Đúng", "(Đúng)", " - Đúng", etc.
    const correctTagRegex = /\s*[-–—]\s*(?:đúng|chính\s*xác)\s*$/i;
    const correctTagRegex2 = /\s*\(đúng\)\s*$/i;
    
    blocks.forEach((block) => {
        const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
        if (lines.length < 3) {
            return;
        }
        
        // Remove question number prefix (1., 2., etc.) from first line
        let questionText = lines[0].replace(/^\d+\.\s*/, '').trim();
        if (!questionText) {
            return;
        }
        
        const options = [];
        let correctIndex = -1;
        
        // Process remaining lines (options)
        for (let i = 1; i < lines.length; i++) {
            let line = lines[i];
            
            // Remove bullet point (•) if present
            line = line.replace(/^[•·▪▫]\s*/, '').trim();
            
            // Remove option prefix (A., B., C., D., etc.)
            let optionText = line.replace(/^[A-Ha-h][\.\)\-:\s]*/, '').trim();
            
            if (!optionText) {
                continue;
            }
            
            let isCorrect = false;
            
            // Check for "- Đúng" pattern
            if (correctTagRegex.test(optionText)) {
                isCorrect = true;
                optionText = optionText.replace(correctTagRegex, '').trim();
            }
            // Check for "(Đúng)" pattern
            else if (correctTagRegex2.test(optionText)) {
                isCorrect = true;
                optionText = optionText.replace(correctTagRegex2, '').trim();
            }
            
            if (!optionText) {
                continue;
            }
            
            options.push(optionText);
            if (isCorrect) {
                correctIndex = options.length - 1;
            }
        }
        
        if (options.length < 2) {
            return;
        }
        
        // If no correct answer found, default to first option
        if (correctIndex < 0) {
            correctIndex = 0;
        }
        
        assignmentQuestionBuilder.questions.push({
            uid: `import_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            questionId: `Q${assignmentQuestionBuilder.questions.length + 1}`,
            type: 'MULTIPLE_CHOICE',
            content: questionText,
            options,
            correctAnswerIndex: correctIndex,
            guideline: '',
            points: 1,
            fileUrl: ''
        });
        imported++;
    });

    if (!imported) {
        if (typeof showNotification === 'function') {
            showNotification('Không có câu hỏi nào được nhập. Vui lòng kiểm tra định dạng.', 'warning');
        }
        return;
    }

    renderQuestionBuilder();
    input.value = '';
    if (typeof showNotification === 'function') {
        showNotification(`Đã nhập ${imported} câu hỏi từ văn bản.`, 'success');
    }
};

function addAssignmentQuestion(type) {
    const uid = `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    assignmentQuestionBuilder.questions.push({
        uid,
        questionId: `Q${assignmentQuestionBuilder.questions.length + 1}`,
        type,
        content: '',
        options: type === 'MULTIPLE_CHOICE' ? ['', '', '', ''] : [],
        correctAnswerIndex: type === 'MULTIPLE_CHOICE' ? 0 : null,
        guideline: '',
        points: type === 'MULTIPLE_CHOICE' ? 1 : 2,
        fileUrl: ''
    });
    renderQuestionBuilder();
}

function removeAssignmentQuestion(uid) {
    assignmentQuestionBuilder.questions = assignmentQuestionBuilder.questions.filter(q => q.uid !== uid);
    renderQuestionBuilder();
}

function updateQuestionField(uid, field, value) {
    const question = assignmentQuestionBuilder.questions.find(q => q.uid === uid);
    if (!question) return;
    if (field === 'points') {
        const numeric = parseFloat(value);
        question.points = isNaN(numeric) ? 1 : numeric;
    } else {
        question[field] = value;
    }
}

function updateQuestionOption(uid, optionIndex, value) {
    const question = assignmentQuestionBuilder.questions.find(q => q.uid === uid);
    if (!question || !Array.isArray(question.options)) return;
    question.options[optionIndex] = value;
}

function addQuestionOption(uid) {
    const question = assignmentQuestionBuilder.questions.find(q => q.uid === uid);
    if (!question || !Array.isArray(question.options)) return;
    question.options.push('');
    renderQuestionBuilder();
}

function removeQuestionOption(uid, optionIndex) {
    const question = assignmentQuestionBuilder.questions.find(q => q.uid === uid);
    if (!question || !Array.isArray(question.options)) return;
    if (question.options.length <= 2) return;
    question.options.splice(optionIndex, 1);
    if (question.correctAnswerIndex >= question.options.length) {
        question.correctAnswerIndex = question.options.length - 1;
    }
    renderQuestionBuilder();
}

function selectCorrectAnswer(uid, optionIndex) {
    const question = assignmentQuestionBuilder.questions.find(q => q.uid === uid);
    if (!question) return;
    question.correctAnswerIndex = optionIndex;
}

window.addAssignmentQuestion = addAssignmentQuestion;
window.removeAssignmentQuestion = removeAssignmentQuestion;
window.updateQuestionField = updateQuestionField;
window.updateQuestionOption = updateQuestionOption;
window.addQuestionOption = addQuestionOption;
window.removeQuestionOption = removeQuestionOption;
window.selectCorrectAnswer = selectCorrectAnswer;

function prepareQuestionsForSubmission() {
    if (!assignmentQuestionBuilder.questions.length) {
        showNotification('Vui lòng thêm ít nhất một câu hỏi trước khi tạo bài tập.', 'warning');
        return null;
    }

    const payload = [];
    for (let i = 0; i < assignmentQuestionBuilder.questions.length; i++) {
        const q = assignmentQuestionBuilder.questions[i];
        const content = (q.content || '').trim();
        if (!content) {
            showNotification(`Câu ${i + 1} chưa có nội dung.`, 'warning');
            return null;
        }

        const data = {
            questionId: q.questionId || `Q${i + 1}`,
            type: q.type,
            content,
            points: q.points || 1,
            fileUrl: (q.fileUrl || '').trim() || null
        };

        if (q.type === 'MULTIPLE_CHOICE') {
            const cleanedOptions = q.options.map(opt => (opt || '').trim()).filter(Boolean);
            if (cleanedOptions.length < 2) {
                showNotification(`Câu ${i + 1} cần ít nhất 2 lựa chọn.`, 'warning');
                return null;
            }
            const correctIndex = q.correctAnswerIndex ?? 0;
            if (correctIndex < 0 || correctIndex >= q.options.length || !q.options[correctIndex].trim()) {
                showNotification(`Vui lòng chọn đáp án đúng cho câu ${i + 1}.`, 'warning');
                return null;
            }
            data.options = q.options.map(opt => opt.trim());
            data.correctAnswer = q.options[correctIndex].trim();
        } else {
            data.options = null;
            data.correctAnswer = null;
            data.guideline = (q.guideline || '').trim() || null;
        }

        payload.push(data);
    }

    return payload;
}

// View class students
window.viewClassStudents = async function(classId) {
    console.log('viewClassStudents called with:', classId);
    
    try {
        const api = new TeacherAPI();
        const hocSinhs = await api.getHocSinhByLopHoc(classId);
        
        const classInfo = window.teacherDashboard?.getClassInfo?.(classId) || null;
        const classLabel = classInfo?.tenLop || `Lớp ${classId}`;

        // Update modal title
        const modalTitle = document.getElementById('studentsModalTitle');
        if (modalTitle) {
            modalTitle.textContent = `Danh sách học sinh - ${classLabel}`;
        }
        
        // Update students list
        const studentsList = document.getElementById('studentsList');
        const searchInput = document.getElementById('modalStudentSearch');
        if (!studentsList) {
            return;
        }

        const renderStudents = (students) => {
            if (!students || students.length === 0) {
                studentsList.innerHTML = '<div class="empty-state"><p>Lớp học chưa có học sinh nào đăng ký</p></div>';
                return;
            }

            const approved = students.filter(hs => hs.trangThaiDangKy === 'approved').length;
            const pending = students.filter(hs => hs.trangThaiDangKy && hs.trangThaiDangKy !== 'approved').length;

            studentsList.innerHTML = `
                <div class="students-summary">
                    <div class="summary-item">
                        <span class="summary-number">${students.length}</span>
                        <span class="summary-label">Tổng học sinh</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-number">${approved}</span>
                        <span class="summary-label">Đã duyệt</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-number">${pending}</span>
                        <span class="summary-label">Chờ duyệt</span>
                    </div>
                </div>
                <div class="students-card-list">
                    ${students.map((hs, index) => {
                        const hoTen = ((hs.ho || '') + ' ' + (hs.tenDem || '') + ' ' + (hs.ten || '')).trim() || 'Không rõ tên';
                        const avatar = `${(hs.ho || '').charAt(0)}${(hs.ten || '').charAt(0)}`.trim().toUpperCase() || hoTen.substring(0, 2).toUpperCase();
                        const email = hs.email || 'Chưa cập nhật';
                        const phone = hs.sdt || 'Chưa cập nhật';
                        const status = hs.trangThaiDangKy || 'pending';
                        const statusLabel = status === 'approved' ? 'Đã duyệt' :
                            status === 'rejected' ? 'Từ chối' :
                            status === 'pending' ? 'Chờ duyệt' : status;
                        const statusClass = status === 'approved' ? 'active' :
                            status === 'rejected' ? 'inactive' : 'pending';

                        return `
                            <div class="student-card">
                                <div class="student-card-header">
                                    <div class="student-order">#${index + 1}</div>
                                    <span class="status-badge ${statusClass}">${statusLabel}</span>
                                </div>
                                <div class="student-card-body">
                                    <div class="student-avatar large">${avatar}</div>
                                    <div class="student-card-info">
                                        <div class="student-name">${hoTen}</div>
                                        <div class="student-meta"><i class="fas fa-envelope"></i> ${email}</div>
                                        <div class="student-meta"><i class="fas fa-phone"></i> ${phone}</div>
                                    </div>
                                </div>
                                <div class="student-card-footer">
                                    <button class="btn btn-sm btn-primary" onclick="viewStudentDetails('${hs.idHs}')">
                                        <i class="fas fa-eye"></i> Xem hồ sơ
                                    </button>
                                    <button class="btn btn-sm btn-secondary" onclick="contactStudent('${email}', '${phone}')">
                                        <i class="fas fa-paper-plane"></i> Liên hệ
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        };

        const normalizedStudents = (hocSinhs || []).map(hs => ({
            ...hs,
            ho: hs.ho || '',
            tenDem: hs.tenDem || '',
            ten: hs.ten || '',
            email: hs.email || '',
            sdt: hs.sdt || '',
            trangThaiDangKy: (hs.trangThaiDangKy || '').toLowerCase()
        }));

        renderStudents(normalizedStudents);

        if (searchInput) {
            searchInput.value = '';
            searchInput.oninput = (event) => {
                const keyword = event.target.value.trim().toLowerCase();
                if (!keyword) {
                    renderStudents(normalizedStudents);
                    return;
                }

                const filtered = normalizedStudents.filter(hs => {
                    const hoTen = `${hs.ho} ${hs.tenDem} ${hs.ten}`.toLowerCase();
                    return hoTen.includes(keyword)
                        || hs.email.toLowerCase().includes(keyword)
                        || hs.sdt.toLowerCase().includes(keyword);
                });

                renderStudents(filtered);
            };
        }
        
        // Show modal
        const modal = document.getElementById('studentsModal');
        if (modal) {
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showNotification('Không thể tải danh sách học sinh. Vui lòng thử lại sau.', 'error');
    }
};

// View class details with real data
window.viewClassDetails = async function(classId) {
    console.log('viewClassDetails called with:', classId);
    
    try {
        const api = new TeacherAPI();
        
        // Load class info
        const classes = await api.getTeacherClasses(getAuthContext().payload.user.idNv);
        const currentClass = classes.find(c => c.idLh === classId);
        
        if (!currentClass) {
            showNotification('Không tìm thấy lớp học!', 'error');
            return;
        }
        
        // Update modal title
        const titleElement = document.getElementById('classDetailsTitle');
        const classLabel = currentClass?.tenLop || `Lớp ${classId}`;
        if (titleElement) {
            titleElement.textContent = `Chi tiết lớp học - ${classLabel}`;
        }
        
        // Load students
        const hocSinhs = await api.getHocSinhByLopHoc(classId);
        
        // Load assignments
        const baiTaps = await api.getBaiTapByLopHoc(classId);
        
        // Load sessions (buoi hoc)
        const buoiHocs = await api.getBuoiHocByLopHoc(classId);
        
        // Update students tab
        const classStudentsList = document.getElementById('classStudentsList');
        if (classStudentsList) {
            if (!hocSinhs || hocSinhs.length === 0) {
                classStudentsList.innerHTML = '<tr><td colspan="5" class="text-center">Chưa có học sinh đăng ký</td></tr>';
            } else {
                classStudentsList.innerHTML = hocSinhs.map((hs, index) => {
                    const hoTen = (hs.ho || '') + ' ' + (hs.tenDem || '') + ' ' + (hs.ten || '');
                    return `
                        <tr>
                            <td>
                                <div class="student-info">
                                    <div class="student-avatar">${(hs.ho || '').charAt(0)}${(hs.ten || '').charAt(0)}</div>
                                    <span>${hoTen.trim()}</span>
                                </div>
                            </td>
                            <td>${hs.email || '-'}</td>
                            <td>-</td>
                            <td>
                                <span class="status-badge ${hs.trangThaiDangKy === 'approved' ? 'active' : 'pending'}">
                                    ${hs.trangThaiDangKy === 'approved' ? 'Hoạt động' : 'Chờ duyệt'}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="viewStudentDetails('${hs.idHs}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }
        
        // Update assignments tab
        const classAssignmentsList = document.getElementById('classAssignmentsList');
        if (classAssignmentsList) {
            if (!baiTaps || baiTaps.length === 0) {
                classAssignmentsList.innerHTML = '<div class="empty-state"><p>Chưa có bài tập nào</p></div>';
            } else {
                classAssignmentsList.innerHTML = baiTaps.map(bt => {
                    const startDate = bt.ngayBatDau ? new Date(bt.ngayBatDau) : null;
                    const endDate = bt.ngayKetThuc ? new Date(bt.ngayKetThuc) : null;
                    const startStr = startDate ? startDate.toLocaleDateString('vi-VN') : 'Chưa có';
                    const endStr = endDate ? endDate.toLocaleDateString('vi-VN') : 'Chưa có';
                    
                    const progress = bt.soBaiNop > 0 ? Math.round((bt.soBaiDaCham / bt.soBaiNop) * 100) : 0;
                    
                    return `
                        <div class="assignment-card">
                            <div class="assignment-header">
                                <h4>${bt.tieuDe || 'Chưa có tiêu đề'}</h4>
                                <span class="assignment-type ${bt.loaiBt}">${getLoaiBaiTapLabel(bt.loaiBt)}</span>
                            </div>
                            <div class="assignment-body">
                                <p><i class="fas fa-calendar"></i> Từ ${startStr} đến ${endStr}</p>
                                <p><i class="fas fa-users"></i> ${bt.soBaiNop || 0} bài nộp</p>
                                <div class="assignment-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${progress}%"></div>
                                    </div>
                                    <span>${bt.soBaiDaCham || 0}/${bt.soBaiNop || 0} đã chấm</span>
                                </div>
                            </div>
                            <div class="assignment-actions">
                                <button class="btn btn-sm btn-primary" onclick="viewAssignmentDetails('${bt.idBt}')">
                                    <i class="fas fa-eye"></i> Xem
                                </button>
                                <button class="btn btn-sm btn-success" onclick="gradeAssignment('${bt.idBt}')">
                                    <i class="fas fa-check"></i> Chấm
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
        
        // Update sessions tab
        const sessionsList = document.getElementById('sessionsList');
        if (sessionsList) {
            if (!buoiHocs || buoiHocs.length === 0) {
                sessionsList.innerHTML = '<div class="empty-state"><p>Chưa có buổi học nào</p></div>';
            } else {
                sessionsList.innerHTML = buoiHocs.map(bh => {
                    const ngayHoc = bh.ngayHoc ? new Date(bh.ngayHoc) : null;
                    const gioBatDau = bh.gioBatDau ? new Date(bh.gioBatDau) : null;
                    const gioKetThuc = bh.gioKetThuc ? new Date(bh.gioKetThuc) : null;
                    
                    const dateStr = ngayHoc ? ngayHoc.toLocaleDateString('vi-VN') : 'Chưa có';
                    const timeStr = gioBatDau && gioKetThuc 
                        ? `${gioBatDau.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${gioKetThuc.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                        : 'Chưa có';
                    
                    return `
                        <div class="session-item">
                            <div class="session-info">
                                <div class="session-date">${dateStr}</div>
                                <div class="session-time">${timeStr}</div>
                                <div class="session-topic">${bh.tenCaHoc || 'Chưa có tên'}</div>
                                <div class="session-room">${bh.tenPhong || 'Chưa có phòng'}</div>
                            </div>
                            <div class="session-actions">
                                <button class="btn btn-sm btn-primary" onclick="viewSessionDetails('${bh.idBh}')">
                                    <i class="fas fa-eye"></i> Xem
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
        
        // Show modal
        const modal = document.getElementById('classDetailsModal');
        if (modal) {
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading class details:', error);
        showNotification('Không thể tải chi tiết lớp học. Vui lòng thử lại sau.', 'error');
    }
};

// Create assignment
window.createAssignment = async function(existingAssignment = null) {
    console.log(existingAssignment ? 'editAssignment modal' : 'createAssignment called');
    
    const isEdit = !!existingAssignment;
    const editingId = isEdit ? String(existingAssignment.idBt ?? existingAssignment.id ?? existingAssignment.maBt ?? existingAssignment.assignmentId) : null;
    if (isEdit && (!editingId || editingId === 'undefined' || editingId === 'null')) {
        console.error('Cannot edit: missing assignment ID', existingAssignment);
        showNotification('Không xác định được bài tập cần chỉnh sửa. Vui lòng thử lại.', 'warning');
        return;
    }

    // Close any existing modal FIRST (but preserve edit state if editing)
    const preservedEditState = window.__currentAssignmentEdit;
    closeAssignmentModal({ preserveDraft: false, keepEditState: true });
    
    // Set edit state with explicit ID
    // If isEdit is true, use the editingId. Otherwise, preserve existing state if it exists.
    if (isEdit && editingId) {
        window.__currentAssignmentEdit = { id: String(editingId) };
        console.log('createAssignment - Setting edit state:', window.__currentAssignmentEdit);
    } else if (!isEdit) {
        // Only clear if we're NOT editing (creating new)
        // If preservedEditState exists, it means we're reopening during edit, so keep it
        if (!preservedEditState) {
            window.__currentAssignmentEdit = null;
        } else {
            // Preserve the edit state if it was set before
            window.__currentAssignmentEdit = preservedEditState;
            console.log('createAssignment - Preserving edit state:', window.__currentAssignmentEdit);
        }
    }
    console.log('createAssignment - isEdit:', isEdit, 'editingId:', editingId, 'currentEdit:', window.__currentAssignmentEdit);

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'assignmentModal';
    modal.innerHTML = `
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h3>${isEdit ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}</h3>
                <button class="modal-close" onclick="closeAssignmentModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="createAssignmentForm">
                    <div class="form-group">
                        <label for="assignmentTitle">Tiêu đề bài tập *</label>
                        <input type="text" id="assignmentTitle" class="form-input" required placeholder="VD: Bài tập Đại số chương 1">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="assignmentType">Loại bài tập *</label>
                            <select id="assignmentType" class="form-select" required>
                                <option value="">Chọn loại</option>
                                <option value="BAI_TAP">Bài tập về nhà</option>
                                <option value="KIEM_TRA_15P">Kiểm tra 15 phút</option>
                                <option value="KIEM_TRA_45P">Kiểm tra 45 phút</option>
                                <option value="THI_HK">Thi học kỳ</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="assignmentClass">Lớp học *</label>
                            <select id="assignmentClass" class="form-select" required>
                                <option value="">Chọn lớp</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="assignmentStartDate">Ngày bắt đầu *</label>
                            <input type="datetime-local" id="assignmentStartDate" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="assignmentEndDate">Hạn nộp *</label>
                            <input type="datetime-local" id="assignmentEndDate" class="form-input" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="assignmentDescription">Mô tả</label>
                        <textarea id="assignmentDescription" class="form-input" rows="4" placeholder="Mô tả chi tiết bài tập..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="assignmentDuration">Thời lượng (phút)</label>
                        <input type="number" id="assignmentDuration" class="form-input" min="5" step="5" placeholder="VD: 45">
                    </div>
                    <div class="form-group">
                        <label for="assignmentWarning">Cảnh báo hiển thị cho học sinh</label>
                        <textarea id="assignmentWarning" class="form-input" rows="3">⚠️ Lưu ý:
Thời gian sẽ bắt đầu tính ngay khi bạn vào bài.
Hết giờ hệ thống TỰ ĐỘNG nộp bài.
Thoát trang hoặc tắt máy → đồng hồ vẫn chạy.
Vui lòng kiểm tra kết nối Internet.</textarea>
                    </div>
                    <div class="form-group">
                        <label>Danh sách câu hỏi *</label>
                        <div class="question-builder-toolbar">
                            <button type="button" class="btn btn-sm btn-primary" onclick="addAssignmentQuestion('MULTIPLE_CHOICE')">
                                <i class="fas fa-list-ol"></i> Thêm trắc nghiệm
                            </button>
                            <button type="button" class="btn btn-sm btn-secondary" onclick="addAssignmentQuestion('ESSAY')">
                                <i class="fas fa-pen"></i> Thêm tự luận
                            </button>
                        </div>
                        <div class="question-import-panel">
                            <label for="questionImportText" style="font-weight:600;display:block;margin-bottom:0.4rem;">Nhập nhanh câu hỏi (dạng trắc nghiệm)</label>
                            <textarea id="questionImportText" class="form-input" rows="4" placeholder="Ví dụ:
Địa điểm nào được UNESCO công nhận là Di sản Thiên nhiên Thế giới?
A. Phong Nha - Kẻ Bàng
B. Phố cổ Hội An
C. Hoàng thành Thăng Long
D. Vịnh Hạ Long - Đúng"></textarea>
                            <div class="question-import-actions" style="display:flex;gap:0.75rem;margin-top:0.5rem;flex-wrap:wrap;">
                                <button type="button" class="btn btn-sm btn-light" onclick="document.getElementById('questionImportFile').click()">
                                    <i class="fas fa-file-import"></i> Chọn file .txt
                                </button>
                                <input type="file" id="questionImportFile" accept=".txt" style="display:none;" onchange="handleQuestionImportFile(event)">
                                <button type="button" class="btn btn-sm btn-success" onclick="importQuestionsFromText()">
                                    <i class="fas fa-bolt"></i> Thêm vào danh sách
                                </button>
                            </div>
                            <small class="helper-text" style="display:block;margin-top:0.4rem;color:#64748b;">
                                Mỗi câu cách nhau một dòng trống. Ghi &quot;- Đúng&quot; hoặc &quot;(Đúng)&quot; phía sau đáp án chính xác.
                            </small>
                        </div>
                        <div id="assignmentQuestionsBuilder" class="question-builder"></div>
                    </div>
                    ${isEdit ? `
                    <div class="form-group">
                        <label>Tùy chọn bài tập</label>
                        <div class="checkbox-field">
                            <input type="checkbox" id="assignmentAllowRetake" ${existingAssignment?.choPhepLamLai ? 'checked' : ''}>
                            <span>Cho phép học sinh làm lại bài tập</span>
                        </div>
                        <div class="checkbox-field" style="margin-top: 0.5rem;">
                            <input type="checkbox" id="assignmentRestrictStudents">
                            <span>Chỉ cho phép học sinh được chọn làm bài</span>
                        </div>
                    </div>
                    <div class="form-group" id="studentSelectionGroup" style="display: none;">
                        <label for="assignmentSelectedStudents" style="font-weight: 600; color: #0f172a; margin-bottom: 0.75rem; display: block;">
                            <i class="fas fa-users" style="margin-right: 0.5rem; color: #e11d48;"></i>Chọn học sinh được phép làm bài
                        </label>
                        <div id="assignmentStudentList" class="student-selection-list" style="max-height: 300px; overflow-y: auto; border: 2px solid #e2e8f0; border-radius: 12px; padding: 1rem; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                            <p style="color: #64748b; font-size: 0.875rem; text-align: center; padding: 1rem;">
                                <i class="fas fa-spinner fa-spin" style="margin-right: 0.5rem;"></i>Đang tải danh sách học sinh...
                            </p>
                        </div>
                        <small style="color: #64748b; display: block; margin-top: 0.75rem; font-size: 0.875rem;">
                            <i class="fas fa-info-circle" style="margin-right: 0.25rem;"></i>Nếu không chọn, tất cả học sinh trong lớp đều có thể làm bài
                        </small>
                    </div>
                    ` : ''}
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" type="button" onclick="cancelAssignmentCreation()">Hủy</button>
                <button class="btn btn-primary" onclick="saveAssignment()">
                    <i class="fas fa-save"></i> ${isEdit ? 'Cập nhật bài tập' : 'Tạo bài tập'}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load classes for dropdown
    try {
        const api = new TeacherAPI();
        const authContext = getAuthContext();
        const classes = await api.getTeacherClasses(authContext.payload.user.idNv);
        const classSelect = document.getElementById('assignmentClass');
        if (classSelect && classes) {
            classSelect.innerHTML = '<option value="">Chọn lớp</option>' + 
                classes.map(c => `<option value="${c.idLh}">${c.tenLop}</option>`).join('');
            if (isEdit) {
                const preselected = existingAssignment?.idLh
                    || existingAssignment?.lopHoc?.idLh
                    || existingAssignment?.lopHocId
                    || existingAssignment?.idLop;
                if (preselected) {
                    classSelect.value = String(preselected);
                }
            } else if (window.__assignmentDraft?.classId) {
                classSelect.value = String(window.__assignmentDraft.classId);
            }
            
            // Add event listener to load students when class is selected (for edit mode)
            if (isEdit) {
                classSelect.addEventListener('change', async (e) => {
                    const selectedClassId = e.target.value;
                    const restrictCheckbox = document.getElementById('assignmentRestrictStudents');
                    const studentGroup = document.getElementById('studentSelectionGroup');
                    if (restrictCheckbox && restrictCheckbox.checked && studentGroup && selectedClassId) {
                        studentGroup.style.display = 'block';
                        await loadClassStudents(selectedClassId);
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }

    const startInput = document.getElementById('assignmentStartDate');
    const endInput = document.getElementById('assignmentEndDate');
    const now = new Date();
    const soon = new Date(now.getTime() + 60 * 60 * 1000);
    const formattedNow = formatDateForInput(now);
    
    // Function to update end date min based on start date
    const updateEndDateMin = () => {
        if (!startInput || !endInput) return;
        const startValue = startInput.value;
        if (startValue) {
            const startDate = new Date(startValue);
            if (isFinite(startDate)) {
                // Set min to start date + 5 minutes (minimum duration)
                const minEndDate = new Date(startDate.getTime() + 5 * 60 * 1000);
                endInput.min = formatDateForInput(minEndDate);
            }
        } else {
            // If no start date, use current time as min
            endInput.min = formattedNow;
        }
    };
    
    if (startInput) {
        if (isEdit) {
            // For edit mode, don't set default values yet, wait for existing data
            startInput.min = formattedNow;
        } else {
            startInput.value = formattedNow;
            startInput.min = formattedNow;
        }
        // Add event listener to update end date min when start date changes
        startInput.addEventListener('change', updateEndDateMin);
        startInput.addEventListener('input', updateEndDateMin);
    }
    
    if (endInput) {
        if (isEdit) {
            // For edit mode, min will be set after loading existing data
        } else {
            const formattedEnd = formatDateForInput(soon);
            endInput.value = formattedEnd;
            endInput.min = formattedNow;
        }
    }

    initializeQuestionBuilder('assignmentQuestionsBuilder');
    if (!isEdit && window.__assignmentDraft) {
        applyAssignmentDraft(window.__assignmentDraft);
    }

    if (isEdit) {
        document.getElementById('assignmentTitle').value = existingAssignment.tieuDe || '';
        document.getElementById('assignmentType').value = existingAssignment.loaiBt || '';
        document.getElementById('assignmentDescription').value = existingAssignment.moTa || '';

        const startDate = existingAssignment.ngayBatDau ? new Date(existingAssignment.ngayBatDau) : null;
        const endDate = existingAssignment.ngayKetThuc ? new Date(existingAssignment.ngayKetThuc) : null;
        if (startInput && startDate && isFinite(startDate)) {
            startInput.value = formatDateForInput(startDate);
            // When editing, allow past dates (don't restrict to current time)
            // But set a reasonable minimum (e.g., 1 year ago) to prevent invalid dates
            const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            startInput.min = formatDateForInput(oneYearAgo);
        }
        if (endInput && endDate && isFinite(endDate)) {
            endInput.value = formatDateForInput(endDate);
        }
        
        // Update end date min based on start date (after setting values)
        // This ensures "Hạn nộp" is always >= "Ngày bắt đầu" + 5 minutes
        updateEndDateMin();

        const durationInput = document.getElementById('assignmentDuration');
        if (durationInput && existingAssignment.thoiLuongPhut != null) {
            durationInput.value = existingAssignment.thoiLuongPhut;
        }

        const warningInput = document.getElementById('assignmentWarning');
        if (warningInput && existingAssignment.canhBao) {
            warningInput.value = existingAssignment.canhBao;
        }

        // Load student selection options
        const restrictStudentsCheckbox = document.getElementById('assignmentRestrictStudents');
        const studentSelectionGroup = document.getElementById('studentSelectionGroup');
        const classSelectForStudents = document.getElementById('assignmentClass');
        
        if (restrictStudentsCheckbox && studentSelectionGroup) {
            // Parse existing student IDs if assignment already has restricted students
            let existingStudentIds = [];
            if (existingAssignment?.hocSinhDuocPhep) {
                try {
                    // Try to parse as JSON string first
                    if (typeof existingAssignment.hocSinhDuocPhep === 'string') {
                        existingStudentIds = JSON.parse(existingAssignment.hocSinhDuocPhep);
                    } else if (Array.isArray(existingAssignment.hocSinhDuocPhep)) {
                        existingStudentIds = existingAssignment.hocSinhDuocPhep;
                    }
                } catch (e) {
                    console.warn('Error parsing hocSinhDuocPhep:', e);
                    existingStudentIds = [];
                }
            }
            
            // If assignment already has restricted students, show the group and load students
            if (existingStudentIds && existingStudentIds.length > 0) {
                restrictStudentsCheckbox.checked = true;
                studentSelectionGroup.style.display = 'block';
                const classId = existingAssignment.idLh || (classSelectForStudents ? classSelectForStudents.value : null);
                if (classId) {
                    console.log('Loading existing students for class:', classId, 'with IDs:', existingStudentIds);
                    await loadClassStudents(classId, existingStudentIds);
                } else {
                    console.warn('No class ID found for loading existing students');
                }
            }
            
            // Add event listener for checkbox change
            restrictStudentsCheckbox.addEventListener('change', async (e) => {
                if (e.target.checked) {
                    studentSelectionGroup.style.display = 'block';
                    const classId = existingAssignment?.idLh || (classSelectForStudents ? classSelectForStudents.value : null);
                    console.log('Checkbox checked, loading students for class:', classId);
                    if (classId) {
                        // Always load students when checkbox is checked, use existingStudentIds if available
                        await loadClassStudents(classId, existingStudentIds.length > 0 ? existingStudentIds : []);
                    } else {
                        const studentListContainer = document.getElementById('assignmentStudentList');
                        if (studentListContainer) {
                            studentListContainer.innerHTML = '<p style="color: #f59e0b; font-size: 0.875rem; text-align: center; padding: 1rem;"><i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>Vui lòng chọn lớp học trước</p>';
                        }
                    }
                } else {
                    studentSelectionGroup.style.display = 'none';
                }
            });
        }
        
        // Also listen to class selection change to reload students if restriction is enabled
        if (classSelectForStudents && restrictStudentsCheckbox) {
            classSelectForStudents.addEventListener('change', async (e) => {
                if (restrictStudentsCheckbox.checked && studentSelectionGroup && studentSelectionGroup.style.display !== 'none') {
                    const classId = e.target.value;
                    if (classId) {
                        await loadClassStudents(classId);
                    }
                }
            });
        }

        if (Array.isArray(existingAssignment.questions) && existingAssignment.questions.length) {
            assignmentQuestionBuilder.questions = existingAssignment.questions.map((q, index) => {
                const type = (q.type || 'ESSAY').toUpperCase();
                const options = Array.isArray(q.options) ? q.options.slice() : [];
                if (type === 'MULTIPLE_CHOICE' && options.length < 2) {
                    while (options.length < 2) {
                        options.push('');
                    }
                }
                let correctIndex = typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : -1;
                if (correctIndex < 0 && q.correctAnswer && options.length) {
                    correctIndex = options.findIndex(opt => opt === q.correctAnswer);
                }
                if (correctIndex < 0) {
                    correctIndex = 0;
                }
                return {
                    uid: `edit_${Date.now()}_${index}`,
                    questionId: q.questionId || `Q${index + 1}`,
                    type,
                    content: q.content || '',
                    options: type === 'MULTIPLE_CHOICE' ? options : [],
                    correctAnswerIndex: type === 'MULTIPLE_CHOICE' ? correctIndex : null,
                    guideline: q.guideline || '',
                    points: q.points ?? 1,
                    fileUrl: q.fileUrl || ''
                };
            });
            renderQuestionBuilder();
        }
    }
};

// Save assignment
window.saveAssignment = async function() {
    const form = document.getElementById('createAssignmentForm');
    if (!form || !form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    try {
        const api = new TeacherAPI();
        
        // Get datetime values and convert to ISO format for backend
        const startDateValue = document.getElementById('assignmentStartDate').value;
        const endDateValue = document.getElementById('assignmentEndDate').value;
        
        // Convert datetime-local format (YYYY-MM-DDTHH:mm) to ISO 8601 format
        const formatDateTimeForBackend = (dateTimeLocal) => {
            if (!dateTimeLocal) return null;
            // datetime-local format: "2025-11-18T00:30"
            // Convert to ISO: "2025-11-18T00:30:00" (add seconds)
            if (dateTimeLocal.includes('T') && !dateTimeLocal.includes(':')) {
                return dateTimeLocal + ':00';
            }
            if (dateTimeLocal.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
                return dateTimeLocal + ':00';
            }
            return dateTimeLocal;
        };
        
        const assignmentData = {
            tieuDe: document.getElementById('assignmentTitle').value,
            loaiBt: document.getElementById('assignmentType').value,
            idLh: document.getElementById('assignmentClass').value,
            ngayBatDau: formatDateTimeForBackend(startDateValue),
            ngayKetThuc: formatDateTimeForBackend(endDateValue),
            moTa: document.getElementById('assignmentDescription').value
        };

        if (!assignmentData.idLh) {
            showNotification('Vui lòng chọn lớp học.', 'warning');
            return;
        }

        if (assignmentData.ngayBatDau && assignmentData.ngayKetThuc) {
            const startDate = new Date(assignmentData.ngayBatDau);
            const endDate = new Date(assignmentData.ngayKetThuc);
            if (isFinite(startDate) && isFinite(endDate) && endDate <= startDate) {
                showNotification('Hạn nộp phải lớn hơn thời gian bắt đầu.', 'warning');
                return;
            }
        }

        const durationValue = document.getElementById('assignmentDuration').value;
        if (durationValue) {
            assignmentData.thoiLuongPhut = parseInt(durationValue, 10);
        }
        // Tự động nộp khi hết giờ mặc định là true
        assignmentData.tuDongNop = true;
        
        // Add retake and student restriction options if in edit mode
        const editId = window.__currentAssignmentEdit?.id;
        if (editId) {
            const allowRetakeCheckbox = document.getElementById('assignmentAllowRetake');
            const restrictStudentsCheckbox = document.getElementById('assignmentRestrictStudents');
            if (allowRetakeCheckbox) {
                assignmentData.choPhepLamLai = allowRetakeCheckbox.checked;
            }
            if (restrictStudentsCheckbox && restrictStudentsCheckbox.checked) {
                const selectedStudents = Array.from(document.querySelectorAll('#assignmentStudentList input[type="checkbox"]:checked'))
                    .map(cb => cb.value);
                // Convert Array to JSON string for backend (backend expects String, not Array)
                assignmentData.hocSinhDuocPhep = selectedStudents.length > 0 ? JSON.stringify(selectedStudents) : null;
            } else {
                assignmentData.hocSinhDuocPhep = null; // Allow all students
            }
        }
        assignmentData.canhBao = document.getElementById('assignmentWarning').value || null;

        let questionsPayload = null;
        const hasBuilderData = Array.isArray(assignmentQuestionBuilder.questions) && assignmentQuestionBuilder.questions.length > 0;

        if (hasBuilderData) {
            questionsPayload = prepareQuestionsForSubmission();
            if (!questionsPayload) {
                return;
            }
        } else if (!window.__currentAssignmentEdit) {
            showNotification('Vui lòng thêm ít nhất một câu hỏi trước khi tạo bài tập.', 'warning');
            return;
        }

        if (questionsPayload) {
            assignmentData.questions = questionsPayload;
        }
        
        console.log('Saving assignment data:', {
            ...assignmentData,
            questions: questionsPayload ? `${questionsPayload.length} questions` : 'no questions'
        });
        
        const editIdValue = window.__currentAssignmentEdit?.id;
        const editIdStr = editIdValue ? String(editIdValue).trim() : null;
        console.log('saveAssignment - editId:', editIdStr, 'currentEdit:', window.__currentAssignmentEdit);
        
        // Check if we have a valid edit ID
        if (editIdStr && editIdStr !== 'undefined' && editIdStr !== 'null' && editIdStr.length > 0) {
            console.log('Updating assignment with ID:', editIdStr);
            try {
                const response = await api.updateBaiTap(editIdStr, assignmentData);
                console.log('Update response:', response);
                showNotification('Đã cập nhật bài tập thành công!', 'success');
            } catch (updateError) {
                console.error('Update failed:', updateError);
                throw updateError;
            }
        } else {
            console.log('Creating new assignment (no valid edit ID found)');
            console.log('Edit state was:', window.__currentAssignmentEdit);
            try {
                const response = await api.createBaiTap(assignmentData);
                console.log('Create response:', response);
                showNotification('Đã tạo bài tập thành công!', 'success');
            } catch (createError) {
                console.error('Create failed:', createError);
                throw createError;
            }
        }
        
        // Clear edit state AFTER successful save
        const wasEdit = !!window.__currentAssignmentEdit;
        window.__currentAssignmentEdit = null;
        
        // Close modal
        closeAssignmentModal({ preserveDraft: false, clearDraft: true });
        
        // Clear cache and refresh assignments section
        if (window.__teacherAssignmentsById) {
            window.__teacherAssignmentsById.clear();
        }
        
        // Force refresh with a small delay to ensure backend has processed
        setTimeout(() => {
            if (window.teacherDashboard) {
                window.teacherDashboard.loadAssignmentsSection();
            } else if (typeof loadAssignmentsSection === 'function') {
                loadAssignmentsSection();
            }
        }, 500);
    } catch (error) {
        console.error('Error saving assignment:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            response: error.response
        });
        showNotification('Không thể lưu bài tập: ' + (error.message || 'Vui lòng thử lại sau.'), 'error');
    }
};

// View assignment details and grade
window.gradeAssignment = async function(assignmentId) {
    console.log('gradeAssignment called with:', assignmentId);
    
    try {
        const api = new TeacherAPI();
        const baiNops = await api.getBaiNopByBaiTap(assignmentId);
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large-modal grading-modal-content">
                <div class="modal-header">
                    <div class="modal-header-content">
                        <div class="modal-icon-wrapper">
                            <i class="fas fa-clipboard-check"></i>
                        </div>
                        <div>
                            <h3>Chấm điểm bài tập</h3>
                            <p class="modal-subtitle">Tổng số bài nộp: <strong>${baiNops?.length || 0}</strong></p>
                        </div>
                    </div>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body grading-modal-body">
                    ${baiNops && baiNops.length > 0 ? `
                        <div class="grading-table-wrapper">
                            <table class="grading-table-modern">
                                <thead>
                                    <tr>
                                        <th class="col-stt">STT</th>
                                        <th class="col-student">Học sinh</th>
                                        <th class="col-questions">Số câu</th>
                                        <th class="col-score">Điểm số</th>
                                        <th class="col-comment">Nhận xét</th>
                                        <th class="col-status">Trạng thái</th>
                                        <th class="col-action">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${baiNops.map((bn, index) => {
                                        // Check if assignment is expired
                                        const now = new Date();
                                        const ngayKetThuc = bn.ngayKetThuc ? new Date(bn.ngayKetThuc) : null;
                                        const isExpired = ngayKetThuc && now > ngayKetThuc;
                                        
                                        // Determine status: if IN_PROGRESS but expired, show "Hết hạn"
                                        let statusClass, statusText;
                                        if (bn.trangThai === 'DA_CHAM' || bn.trangThai === 'GRADED_AUTO') {
                                            statusClass = 'graded';
                                            statusText = 'Đã chấm';
                                        } else if (bn.trangThai === 'IN_PROGRESS' && isExpired) {
                                            statusClass = 'expired';
                                            statusText = 'Hết hạn';
                                        } else if (bn.trangThai === 'IN_PROGRESS') {
                                            statusClass = 'in-progress';
                                            statusText = 'Đang làm';
                                        } else {
                                            statusClass = 'pending';
                                            statusText = 'Chờ chấm';
                                        }
                                        
                                        const avatar = (bn.hoTen || 'HS').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                                        return `
                                            <tr class="grading-row ${statusClass}">
                                                <td class="col-stt">
                                                    <span class="row-number">${index + 1}</span>
                                                </td>
                                                <td class="col-student">
                                                    <div class="student-info">
                                                        <div class="student-avatar">${avatar}</div>
                                                        <div class="student-details">
                                                            <div class="student-name">${escapeHtml(bn.hoTen || '-')}</div>
                                                            ${bn.thoiGianNop ? `<div class="student-meta"><i class="fas fa-clock"></i> ${formatDateTime(bn.thoiGianNop)}</div>` : ''}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="col-questions">
                                                    <div class="question-stats">
                                                        <span class="stat-value">${bn.tongSoCau ?? (bn.soCauDung != null ? bn.soCauDung : '-')}</span>
                                                        ${bn.soCauDung != null && bn.tongSoCau != null ? `<span class="stat-label">(${bn.soCauDung}/${bn.tongSoCau})</span>` : ''}
                                                    </div>
                                                </td>
                                                <td class="col-score">
                                                    <div class="score-input-wrapper">
                                                        <input type="number" class="grade-input-modern" id="grade_${bn.idBn}" 
                                                               value="${bn.diemSo || ''}" min="0" max="10" step="0.1" 
                                                               placeholder="0.0">
                                                        <span class="score-max">/ 10</span>
                                                    </div>
                                                </td>
                                                <td class="col-comment">
                                                    <textarea class="comment-input-modern" id="comment_${bn.idBn}" 
                                                              rows="2" placeholder="Nhập nhận xét...">${escapeHtml(bn.nhanXet || '')}</textarea>
                                                </td>
                                                <td class="col-status">
                                                    <span class="status-badge-modern ${statusClass}">
                                                        <i class="fas ${statusClass === 'graded' ? 'fa-check-circle' : statusClass === 'in-progress' ? 'fa-spinner fa-spin' : statusClass === 'expired' ? 'fa-exclamation-triangle' : 'fa-clock'}"></i>
                                                        ${statusText}
                                                    </span>
                                                </td>
                                                <td class="col-action">
                                                    <button class="btn-save-grade" onclick="saveGrade('${bn.idBn}')" title="Lưu điểm">
                                                        <i class="fas fa-save"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="empty-grading-state">
                            <div class="empty-icon">
                                <i class="fas fa-inbox"></i>
                            </div>
                            <h4>Chưa có bài nộp nào</h4>
                            <p>Học sinh chưa nộp bài cho bài tập này.</p>
                        </div>
                    `}
                </div>
                <div class="modal-footer grading-modal-footer">
                    <button class="btn btn-secondary btn-close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i> Đóng
                    </button>
                    ${baiNops && baiNops.length > 0 ? `
                        <button class="btn btn-primary btn-save-all" onclick="bulkSaveGrades('${assignmentId}')">
                            <i class="fas fa-save"></i> Lưu tất cả
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add enter key support for quick grading and input change handlers
        modal.querySelectorAll('.grade-input-modern').forEach(input => {
            // Enter key to save
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const baiNopId = input.id.replace('grade_', '');
                    saveGrade(baiNopId);
                }
            });
            
            // Real-time validation and visual feedback
            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const baiNopId = input.id.replace('grade_', '');
                const row = input.closest('tr');
                
                // Remove previous validation classes
                input.classList.remove('input-invalid', 'input-valid');
                
                if (e.target.value.trim() === '') {
                    return; // Empty input is OK
                }
                
                if (isNaN(value) || value < 0 || value > 10) {
                    input.classList.add('input-invalid');
                } else {
                    input.classList.add('input-valid');
                }
            });
            
            // Blur event to auto-save if value changed
            let originalValue = input.value;
            input.addEventListener('blur', (e) => {
                if (e.target.value !== originalValue && e.target.value.trim() !== '') {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 0 && value <= 10) {
                        // Auto-save on blur if valid
                        const baiNopId = input.id.replace('grade_', '');
                        saveGrade(baiNopId);
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error loading assignment for grading:', error);
        showNotification('Không thể tải bài nộp. Vui lòng thử lại sau.', 'error');
    }
};

// Helper function to format datetime
function formatDateTime(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

// Save grade for a submission
window.saveGrade = async function(baiNopId) {
    try {
        const api = new TeacherAPI();
        const gradeInput = document.getElementById(`grade_${baiNopId}`);
        const commentInput = document.getElementById(`comment_${baiNopId}`);
        
        if (!gradeInput) {
            showNotification('Không tìm thấy ô nhập điểm!', 'error');
            return;
        }
        
        const diemSoValue = gradeInput.value.trim();
        const nhanXet = commentInput ? commentInput.value.trim() : '';
        
        // Allow saving comment even without score
        if (!diemSoValue && !nhanXet) {
            showNotification('Vui lòng nhập điểm số hoặc nhận xét!', 'error');
            return;
        }
        
        // Validate score if provided
        let diemSo = null;
        if (diemSoValue) {
            diemSo = parseFloat(diemSoValue);
            if (isNaN(diemSo) || diemSo < 0 || diemSo > 10) {
                showNotification('Điểm số phải từ 0 đến 10!', 'error');
                gradeInput.focus();
                return;
            }
        }
        
        await api.chamDiemBaiNop(baiNopId, diemSo, nhanXet);
        
        // Update status badge and input styling
        const row = gradeInput.closest('tr');
        if (row) {
            // Only mark as graded if score is provided
            if (diemSo != null) {
                row.classList.remove('pending', 'in-progress');
                row.classList.add('graded');
                const statusBadge = row.querySelector('.status-badge-modern');
                if (statusBadge) {
                    statusBadge.className = 'status-badge-modern graded';
                    statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> Đã chấm';
                }
            }
            
            // Update input styling to show it's saved
            if (diemSo != null) {
                gradeInput.classList.remove('input-invalid', 'input-valid');
                gradeInput.classList.add('input-saved');
                gradeInput.dataset.savedValue = diemSoValue;
            }
        }
        
        const message = diemSo != null 
            ? 'Đã lưu điểm và nhận xét thành công!' 
            : 'Đã lưu nhận xét thành công!';
        showNotification(message, 'success');
    } catch (error) {
        console.error('Error saving grade:', error);
        showNotification(error.message || 'Không thể lưu. Vui lòng thử lại sau.', 'error');
    }
};

// Bulk save all grades
window.bulkSaveGrades = async function(assignmentId) {
    try {
        const api = new TeacherAPI();
        const gradeInputs = document.querySelectorAll('.grade-input-modern');
        const rows = document.querySelectorAll('.grading-row');
        
        if (gradeInputs.length === 0) {
            showNotification('Không có điểm nào để lưu!', 'warning');
            return;
        }
        
        let savedCount = 0;
        let errorCount = 0;
        const errors = [];
        
        // Show loading
        const saveAllBtn = document.querySelector('.btn-save-all');
        const originalText = saveAllBtn.innerHTML;
        saveAllBtn.disabled = true;
        saveAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
        
        for (const input of gradeInputs) {
            const baiNopId = input.id.replace('grade_', '');
            const commentInput = document.getElementById(`comment_${baiNopId}`);
            const diemSoValue = input.value.trim();
            const nhanXet = commentInput ? commentInput.value.trim() : '';
            
            // Skip if both score and comment are empty
            if (!diemSoValue && !nhanXet) {
                continue;
            }
            
            // Validate score if provided
            let diemSo = null;
            if (diemSoValue) {
                diemSo = parseFloat(diemSoValue);
                if (isNaN(diemSo) || diemSo < 0 || diemSo > 10) {
                    errorCount++;
                    errors.push(`Điểm số không hợp lệ cho học sinh: ${input.closest('tr')?.querySelector('.student-name')?.textContent || 'N/A'}`);
                    continue;
                }
            }
            
            try {
                await api.chamDiemBaiNop(baiNopId, diemSo, nhanXet);
                savedCount++;
                
                // Update status badge only if score is provided
                const row = input.closest('tr');
                if (row && diemSo != null) {
                    row.classList.remove('pending', 'in-progress');
                    row.classList.add('graded');
                    const statusBadge = row.querySelector('.status-badge-modern');
                    if (statusBadge) {
                        statusBadge.className = 'status-badge-modern graded';
                        statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> Đã chấm';
                    }
                }
            } catch (error) {
                errorCount++;
                errors.push(error.message || `Lỗi khi lưu cho học sinh: ${input.closest('tr')?.querySelector('.student-name')?.textContent || 'N/A'}`);
            }
        }
        
        // Restore button
        saveAllBtn.disabled = false;
        saveAllBtn.innerHTML = originalText;
        
        if (savedCount > 0) {
            showNotification(`Đã lưu thành công ${savedCount} điểm số!${errorCount > 0 ? ` (${errorCount} lỗi)` : ''}`, 'success');
        }
        
        if (errorCount > 0 && errors.length > 0) {
            console.error('Errors during bulk save:', errors);
            if (savedCount === 0) {
                showNotification(`Không thể lưu điểm. ${errors[0]}`, 'error');
            }
        }
        
        if (savedCount === 0 && errorCount === 0) {
            showNotification('Không có điểm nào để lưu!', 'warning');
        }
    } catch (error) {
        console.error('Error in bulk save:', error);
        showNotification('Không thể lưu tất cả điểm. Vui lòng thử lại sau.', 'error');
        
        // Restore button
        const saveAllBtn = document.querySelector('.btn-save-all');
        if (saveAllBtn) {
            saveAllBtn.disabled = false;
            saveAllBtn.innerHTML = '<i class="fas fa-save"></i> Lưu tất cả';
        }
    }
};

// View grades for a class
window.viewDiemSo = async function(classId) {
    const normalizedId = classId ? String(classId) : '';
    if (!normalizedId) {
        showNotification('Không xác định được lớp học.', 'warning');
        return;
    }

    try {
        if (window.teacherDashboard) {
            window.teacherDashboard.navigateToSection('grades');
            await window.teacherDashboard.loadGradesSection(normalizedId, { preserveSelection: true });
        } else {
            console.warn('teacherDashboard chưa sẵn sàng, fallback sang tải nhanh');
            const api = new TeacherAPI();
            const diemSos = await api.getDiemSoByLopHoc(normalizedId);
            const gradesTableBody = document.querySelector('.grades-table tbody');
            if (gradesTableBody) {
                gradesTableBody.innerHTML = (diemSos || []).length
                    ? '<tr><td colspan="8" class="text-center">Vui lòng tải lại trang để xem dữ liệu điểm số.</td></tr>'
                    : '<tr><td colspan="8" class="text-center">Chưa có điểm số.</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading grades:', error);
        showNotification('Không thể tải điểm số. Vui lòng thử lại sau.', 'error');
    }
};

window.filterGradesByClass = async function(classId) {
    const targetId = classId ? String(classId) : null;
    try {
        if (window.teacherDashboard) {
            await window.teacherDashboard.loadGradesSection(targetId, { preserveSelection: !!targetId });
        }
    } catch (error) {
        console.error('Error filtering grades:', error);
        showNotification('Không thể lọc điểm số. Vui lòng thử lại sau.', 'error');
    }
};

// Update grade
window.updateDiemSo = async function(classId, studentId, loaiDiem, diemSo) {
    try {
        const api = new TeacherAPI();
        
        // Allow empty value to clear the score (will be sent as null)
        let diem = null;
        if (diemSo !== null && diemSo !== undefined && diemSo !== '') {
            diem = parseFloat(diemSo);
            
            if (Number.isNaN(diem) || diem < 0 || diem > 10) {
                showNotification('Điểm số phải từ 0 đến 10!', 'error');
                return;
            }
        }
        
        await api.updateDiemSo(classId, studentId, loaiDiem, diem);
        showNotification('Đã cập nhật điểm số!', 'success');
        
        if (window.teacherDashboard) {
            await window.teacherDashboard.loadGradesSection(classId, { preserveSelection: true });
        }
    } catch (error) {
        console.error('Error updating grade:', error);
        showNotification('Không thể cập nhật điểm số. Vui lòng thử lại sau.', 'error');
    }
};

// Edit grade for a student
window.editGrade = async function(studentId, classId, event) {
    // Prevent default behavior if event is provided
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    try {
        const api = new TeacherAPI();
        
        // Get current grades for this student
        const diemSos = await api.getDiemSoByLopHoc(classId);
        const studentGrade = diemSos?.find(ds => ds.idHs === studentId || String(ds.idHs) === String(studentId));
        
        if (!studentGrade) {
            showNotification('Không tìm thấy thông tin điểm của học sinh này.', 'warning');
            return;
        }
        
        // Get student info
        const hocSinhs = await api.getHocSinhByLopHoc(classId);
        const student = hocSinhs?.find(hs => hs.idHs === studentId || String(hs.idHs) === String(studentId));
        const hoTen = student ? ((student.ho || '') + ' ' + (student.tenDem || '') + ' ' + (student.ten || '')).trim() : (studentGrade.hoTen || 'Học sinh');
        const avatar = student ? `${(student.ho || '').charAt(0)}${(student.ten || '').charAt(0)}`.trim().toUpperCase() : hoTen.substring(0, 2).toUpperCase();
        
        // Create edit modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'editGradeModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chỉnh sửa điểm số</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 12px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #e11d48, #be123c); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1.125rem; flex-shrink: 0;">
                            ${avatar}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: #0f172a; font-size: 1.125rem;">${escapeHtml(hoTen)}</div>
                            ${studentGrade.email ? `<div style="font-size: 0.875rem; color: #64748b; margin-top: 0.25rem;"><i class="fas fa-envelope" style="margin-right: 0.25rem;"></i>${escapeHtml(studentGrade.email)}</div>` : ''}
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="editDiem15" style="font-weight: 600; color: #0f172a; margin-bottom: 0.5rem; display: block;">
                            <i class="fas fa-clock" style="margin-right: 0.5rem; color: #e11d48;"></i>Điểm kiểm tra 15 phút
                        </label>
                        <input type="number" 
                               id="editDiem15" 
                               class="form-input" 
                               value="${studentGrade.diem15Phut ?? studentGrade.diem15p ?? ''}"
                               min="0" max="10" step="0.1" 
                               placeholder="0.0"
                               style="font-size: 1rem; padding: 0.75rem;">
                    </div>
                    <div class="form-group">
                        <label for="editDiem45" style="font-weight: 600; color: #0f172a; margin-bottom: 0.5rem; display: block;">
                            <i class="fas fa-file-alt" style="margin-right: 0.5rem; color: #e11d48;"></i>Điểm kiểm tra 1 tiết
                        </label>
                        <input type="number" 
                               id="editDiem45" 
                               class="form-input" 
                               value="${studentGrade.diem45Phut ?? studentGrade.diem45p ?? ''}"
                               min="0" max="10" step="0.1" 
                               placeholder="0.0"
                               style="font-size: 1rem; padding: 0.75rem;">
                    </div>
                    <div class="form-group">
                        <label for="editDiemHK" style="font-weight: 600; color: #0f172a; margin-bottom: 0.5rem; display: block;">
                            <i class="fas fa-graduation-cap" style="margin-right: 0.5rem; color: #e11d48;"></i>Điểm thi học kỳ
                        </label>
                        <input type="number" 
                               id="editDiemHK" 
                               class="form-input" 
                               value="${studentGrade.diemThiHK ?? studentGrade.diemThiHocKy ?? studentGrade.diemThi ?? ''}"
                               min="0" max="10" step="0.1" 
                               placeholder="0.0"
                               style="font-size: 1rem; padding: 0.75rem;">
                    </div>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="font-weight: 600; color: #0f172a;">Điểm trung bình:</span>
                            <span id="editDiemTB" style="font-size: 1.25rem; font-weight: 700; color: #e11d48;">${studentGrade.diemTrungBinh ?? studentGrade.diemTB ?? '-'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; color: #0f172a;">Xếp loại:</span>
                            <span id="editXepLoai" style="font-weight: 600; color: #64748b;">${(() => {
                                let xl = studentGrade.xepLoai || 'Chưa có';
                                if (xl.includes('Gi?i') || xl === 'Gi?i') xl = 'Giỏi';
                                if (xl.toLowerCase().includes('trung bình') || xl.toLowerCase().includes('trung binh')) xl = 'TB';
                                return xl;
                            })()}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Hủy</button>
                    <button class="btn btn-primary" onclick="saveEditGrade('${studentId}', '${classId}')">
                        <i class="fas fa-save"></i> Cập nhật điểm
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Calculate average on input change
        const diem15Input = document.getElementById('editDiem15');
        const diem45Input = document.getElementById('editDiem45');
        const diemHKInput = document.getElementById('editDiemHK');
        const diemTBDisplay = document.getElementById('editDiemTB');
        const xepLoaiDisplay = document.getElementById('editXepLoai');
        
        const calculateAverage = () => {
            const diem15 = parseFloat(diem15Input.value) || 0;
            const diem45 = parseFloat(diem45Input.value) || 0;
            const diemHK = parseFloat(diemHKInput.value) || 0;
            
            // Weighted average: 15p (20%), 45p (30%), HK (50%)
            let total = 0;
            let weight = 0;
            if (diem15 > 0) {
                total += diem15 * 0.2;
                weight += 0.2;
            }
            if (diem45 > 0) {
                total += diem45 * 0.3;
                weight += 0.3;
            }
            if (diemHK > 0) {
                total += diemHK * 0.5;
                weight += 0.5;
            }
            
            const diemTB = weight > 0 ? (total / weight).toFixed(2) : null;
            diemTBDisplay.textContent = diemTB || '-';
            
            // Update classification
            if (diemTB) {
                const tb = parseFloat(diemTB);
                let xepLoai = 'Chưa có';
                if (tb >= 8.0) xepLoai = 'Giỏi';
                else if (tb >= 6.5) xepLoai = 'Khá';
                else if (tb >= 5.0) xepLoai = 'TB';
                else xepLoai = 'Yếu';
                xepLoaiDisplay.textContent = xepLoai;
            } else {
                xepLoaiDisplay.textContent = 'Chưa có';
            }
        };
        
        diem15Input.addEventListener('input', calculateAverage);
        diem45Input.addEventListener('input', calculateAverage);
        diemHKInput.addEventListener('input', calculateAverage);
        
    } catch (error) {
        console.error('Error opening edit grade modal:', error);
        showNotification('Không thể mở form chỉnh sửa điểm. Vui lòng thử lại sau.', 'error');
    }
};

// Save edited grade
window.saveEditGrade = async function(studentId, classId) {
    try {
        const api = new TeacherAPI();
        
        const diem15Input = document.getElementById('editDiem15');
        const diem45Input = document.getElementById('editDiem45');
        const diemHKInput = document.getElementById('editDiemHK');
        
        // Get values (allow empty/null to clear scores)
        const diem15Val = diem15Input.value.trim();
        const diem45Val = diem45Input.value.trim();
        const diemHKVal = diemHKInput.value.trim();
        
        const diem15 = diem15Val === '' ? null : parseFloat(diem15Val);
        const diem45 = diem45Val === '' ? null : parseFloat(diem45Val);
        const diemHK = diemHKVal === '' ? null : parseFloat(diemHKVal);
        
        // Validate scores (if provided, must be between 0 and 10)
        if ((diem15 !== null && (isNaN(diem15) || diem15 < 0 || diem15 > 10)) ||
            (diem45 !== null && (isNaN(diem45) || diem45 < 0 || diem45 > 10)) ||
            (diemHK !== null && (isNaN(diemHK) || diemHK < 0 || diemHK > 10))) {
            showNotification('Điểm số phải từ 0 đến 10!', 'error');
            return;
        }
        
        // Update all three scores (including 0 and null)
        await api.updateDiemSo(classId, studentId, '15P', diem15);
        await api.updateDiemSo(classId, studentId, '45P', diem45);
        await api.updateDiemSo(classId, studentId, 'HK', diemHK);
        
        // Close modal
        const modal = document.getElementById('editGradeModal');
        if (modal) {
            modal.remove();
        }
        
        showNotification('Đã cập nhật điểm số thành công!', 'success');
        
        // Refresh grades section
        if (window.teacherDashboard) {
            await window.teacherDashboard.loadGradesSection(classId, { preserveSelection: true });
        }
    } catch (error) {
        console.error('Error saving edited grade:', error);
        showNotification('Không thể cập nhật điểm số. Vui lòng thử lại sau.', 'error');
    }
};

// Function to calculate and update DiemTB for a student in real-time
function updateDiemTBForStudent(studentId) {
    try {
        // Get all 3 input fields for this student
        const diem15Input = document.querySelector(`.grade-input-small[data-student-id="${studentId}"][data-loai-diem="15P"]`);
        const diem45Input = document.querySelector(`.grade-input-small[data-student-id="${studentId}"][data-loai-diem="45P"]`);
        const diemHKInput = document.querySelector(`.grade-input-small[data-student-id="${studentId}"][data-loai-diem="HK"]`);
        
        if (!diem15Input || !diem45Input || !diemHKInput) {
            return; // Không tìm thấy đủ 3 input
        }
        
        // Get values from inputs
        const diem15 = parseFloat(diem15Input.value) || 0;
        const diem45 = parseFloat(diem45Input.value) || 0;
        const diemHK = parseFloat(diemHKInput.value) || 0;
        
        // Tính điểm TB: (15p + 45p + thi) / 3 (chỉ tính các điểm > 0)
        const scores = [diem15, diem45, diemHK].filter(s => s > 0);
        let diemTB = null;
        
        if (scores.length > 0) {
            const sum = scores.reduce((a, b) => a + b, 0);
            diemTB = (sum / scores.length).toFixed(2);
        }
        
        // Update DiemTB cell
        const diemTBCell = document.querySelector(`.diem-tb-cell[data-student-id="${studentId}"]`);
        if (diemTBCell) {
            diemTBCell.textContent = diemTB ? parseFloat(diemTB).toFixed(1) : '-';
        }
        
        // Update XepLoai badge
        const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
        if (row && diemTB && window.teacherDashboard) {
            const xepLoai = window.teacherDashboard.classifyScore(diemTB);
            const xepLoaiCell = row.querySelector('.xep-loai-badge, .badge, [class*="badge"]');
            if (xepLoaiCell) {
                xepLoaiCell.textContent = xepLoai;
                const badgeClass = window.teacherDashboard.getGradeBadgeClass(xepLoai, diemTB);
                xepLoaiCell.className = `badge ${badgeClass}`;
            }
        }
        
        console.log(`Updated DiemTB for ${studentId}: ${diemTB} (15p: ${diem15}, 45p: ${diem45}, HK: ${diemHK})`);
    } catch (error) {
        console.error('Error updating DiemTB for student:', error);
    }
}

// toggleEditMode is already defined at the top of the file

// saveAllGrades is already defined at the top of the file

// Export grade report (PDF or Excel)
window.exportGrades = async function() {
    const classFilter = document.getElementById('classFilter');
    const classId = classFilter && classFilter.value ? classFilter.value : window.teacherDashboard?.currentGradeClassId;
    
    if (!classId) {
        showNotification('Vui lòng chọn lớp học!', 'warning');
        return;
    }
    
    try {
        const api = new TeacherAPI();
        const diemSos = await api.getDiemSoByLopHoc(classId);
        const classInfo = window.teacherDashboard?.getClassInfo?.(classId);
        const classLabel = classInfo?.tenLop || `Lớp ${classId}`;
        const dateStr = new Date().toLocaleDateString('vi-VN');
        
        // Show export options modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'exportGradesModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Xuất báo cáo điểm số</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 1.5rem; color: #64748b;">Chọn định dạng file để xuất báo cáo:</p>
                    <div style="display: flex; gap: 1rem;">
                        <button class="btn btn-primary" style="flex: 1; padding: 1rem;" onclick="exportGradesAsExcel('${classId}')">
                            <i class="fas fa-file-excel" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                            <div style="font-weight: 600;">Xuất Excel</div>
                            <div style="font-size: 0.875rem; opacity: 0.8;">File .xlsx</div>
                        </button>
                        <button class="btn btn-danger" style="flex: 1; padding: 1rem;" onclick="exportGradesAsPDF('${classId}')">
                            <i class="fas fa-file-pdf" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                            <div style="font-weight: 600;">Xuất PDF</div>
                            <div style="font-size: 0.875rem; opacity: 0.8;">File .pdf</div>
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Hủy</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error opening export modal:', error);
        showNotification('Không thể mở form xuất báo cáo. Vui lòng thử lại sau.', 'error');
    }
};

// Export as Excel
window.exportGradesAsExcel = async function(classId) {
    try {
        const api = new TeacherAPI();
        const diemSos = await api.getDiemSoByLopHoc(classId);
        const classInfo = window.teacherDashboard?.getClassInfo?.(classId);
        const classLabel = classInfo?.tenLop || `Lớp ${classId}`;
        const dateStr = new Date().toLocaleDateString('vi-VN');
        
        // Create Excel content (CSV format for simplicity, can be enhanced with proper Excel library)
        let csvContent = '\uFEFF'; // BOM for UTF-8
        csvContent += `BÁO CÁO ĐIỂM SỐ - ${classLabel}\n`;
        csvContent += `Ngày xuất: ${dateStr}\n\n`;
        csvContent += `STT,Họ và tên,Email,Điểm KT 15 phút,Điểm KT 1 tiết,Điểm thi HK,Điểm trung bình,Xếp loại\n`;
        
        (diemSos || []).forEach((ds, index) => {
            const safeName = (ds.hoTen || '').replace(/"/g, '""');
            const safeEmail = (ds.email || '').replace(/"/g, '""');
            const safeRank = (ds.xepLoai || '').replace(/"/g, '""');
            const diem15 = ds.diem15Phut ?? ds.diem15p ?? '-';
            const diem45 = ds.diem45Phut ?? ds.diem45p ?? '-';
            const diemHK = ds.diemThiHK ?? ds.diemThiHocKy ?? ds.diemThi ?? '-';
            const diemTB = ds.diemTrungBinh ?? ds.diemTB ?? '-';
            csvContent += `${index + 1},"${safeName}","${safeEmail}",${diem15},${diem45},${diemHK},${diemTB},"${safeRank}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `BaoCaoDiemSo_${classLabel.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Close modal
        const modal = document.getElementById('exportGradesModal');
        if (modal) modal.remove();
        
        showNotification('Đã xuất báo cáo Excel thành công!', 'success');
    } catch (error) {
        console.error('Error exporting Excel:', error);
        showNotification('Không thể xuất báo cáo Excel. Vui lòng thử lại sau.', 'error');
    }
};

// Export as PDF
window.exportGradesAsPDF = async function(classId) {
    try {
        const api = new TeacherAPI();
        const diemSos = await api.getDiemSoByLopHoc(classId);
        const classInfo = window.teacherDashboard?.getClassInfo?.(classId);
        const classLabel = classInfo?.tenLop || `Lớp ${classId}`;
        const dateStr = new Date().toLocaleDateString('vi-VN');
        
        // Create HTML table for PDF
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Báo cáo điểm số - ${escapeHtml(classLabel)}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #e11d48; text-align: center; }
                    h2 { color: #0f172a; margin-top: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #e11d48; color: white; padding: 12px; text-align: left; font-weight: 600; }
                    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
                    tr:nth-child(even) { background: #f8fafc; }
                    .header-info { text-align: center; color: #64748b; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <h1>BÁO CÁO ĐIỂM SỐ</h1>
                <div class="header-info">
                    <p><strong>Lớp:</strong> ${escapeHtml(classLabel)}</p>
                    <p><strong>Ngày xuất:</strong> ${dateStr}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Họ và tên</th>
                            <th>Email</th>
                            <th>Điểm KT 15 phút</th>
                            <th>Điểm KT 1 tiết</th>
                            <th>Điểm thi HK</th>
                            <th>Điểm TB</th>
                            <th>Xếp loại</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        (diemSos || []).forEach((ds, index) => {
            const diem15 = ds.diem15Phut ?? ds.diem15p ?? '-';
            const diem45 = ds.diem45Phut ?? ds.diem45p ?? '-';
            const diemHK = ds.diemThiHK ?? ds.diemThiHocKy ?? ds.diemThi ?? '-';
            const diemTB = ds.diemTrungBinh ?? ds.diemTB ?? '-';
            htmlContent += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${escapeHtml(ds.hoTen || '')}</td>
                            <td>${escapeHtml(ds.email || '')}</td>
                            <td>${diem15}</td>
                            <td>${diem45}</td>
                            <td>${diemHK}</td>
                            <td><strong>${diemTB}</strong></td>
                            <td>${(() => {
                                let xl = ds.xepLoai || 'Chưa có';
                                if (xl.includes('Gi?i') || xl === 'Gi?i') xl = 'Giỏi';
                                if (xl.toLowerCase().includes('trung bình') || xl.toLowerCase().includes('trung binh')) xl = 'TB';
                                return xl;
                            })()}</td>
                        </tr>
            `;
        });
        
        htmlContent += `
                    </tbody>
                </table>
            </body>
            </html>
        `;
        
        // Open in new window and print to PDF
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load, then print
        setTimeout(() => {
            printWindow.print();
        }, 250);
        
        // Close modal
        const modal = document.getElementById('exportGradesModal');
        if (modal) modal.remove();
        
        showNotification('Đã mở báo cáo PDF. Vui lòng chọn "Lưu dưới dạng PDF" trong hộp thoại in.', 'info');
    } catch (error) {
        console.error('Error exporting PDF:', error);
        showNotification('Không thể xuất báo cáo PDF. Vui lòng thử lại sau.', 'error');
    }
};

// Helper function
function getLoaiBaiTapLabel(loaiBt) {
    const labels = {
        'BAI_TAP': 'Bài tập',
        'KIEM_TRA_15P': 'Kiểm tra 15p',
        'KIEM_TRA_45P': 'Kiểm tra 45p',
        'THI_HK': 'Thi học kỳ'
    };
    return labels[loaiBt] || loaiBt;
}

// Make it global
window.getLoaiBaiTapLabel = getLoaiBaiTapLabel;

// Quick contact handler for student cards
window.contactStudent = function(email, phone) {
    const actions = [];
    if (email && email !== 'Chưa cập nhật') {
        actions.push(`<a href="mailto:${email}" class="btn btn-sm btn-link"><i class="fas fa-envelope"></i> Gửi email</a>`);
    }
    if (phone && phone !== 'Chưa cập nhật') {
        actions.push(`<a href="tel:${phone}" class="btn btn-sm btn-link"><i class="fas fa-phone"></i> Gọi</a>`);
    }

    if (actions.length === 0) {
        showNotification('Học sinh chưa cập nhật thông tin liên hệ.', 'warning');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content small-modal">
            <div class="modal-header">
                <h3>Liên hệ học sinh</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>Chọn phương thức liên hệ phù hợp:</p>
                <div class="contact-actions">
                    ${actions.join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Đóng</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// Đề xuất lớp học (gửi yêu cầu hỗ trợ tới admin)
window.openSuggestClassModal = function() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content small-modal">
            <div class="modal-header">
                <h3>Đề xuất lớp học mới</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="suggestClassTitle">Tiêu đề lớp học *</label>
                    <input id="suggestClassTitle" class="form-input" placeholder="VD: Lớp 9 - Ôn tập hình học chuyên sâu">
                </div>
                <div class="form-group">
                    <label for="suggestClassDescription">Mô tả chi tiết *</label>
                    <textarea id="suggestClassDescription" class="form-input" rows="5"
                        placeholder="Mục tiêu, đối tượng học sinh, thời lượng, hình thức, đề xuất lịch học..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Hủy</button>
                <button class="btn btn-primary" onclick="submitSuggestClass(this)">
                    <i class="fas fa-paper-plane"></i> Gửi đề xuất
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.submitSuggestClass = async function(buttonEl) {
    const titleInput = document.getElementById('suggestClassTitle');
    const descInput = document.getElementById('suggestClassDescription');
    const title = titleInput?.value.trim() || '';
    const description = descInput?.value.trim() || '';

    if (!title || !description) {
        showNotification('Vui lòng nhập đầy đủ tiêu đề và mô tả lớp học.', 'warning');
        return;
    }

    // Tạm thời không lưu vào DB, chỉ hiển thị hướng dẫn liên hệ tư vấn viên
    console.log('Đề xuất lớp học mới:', { title, description });
    showNotification('Hãy liên hệ với tư vấn viên để được hỗ trợ mở lớp nha!', 'info');
    const modal = buttonEl.closest('.modal');
    if (modal) {
        modal.remove();
    }
};

// loadAssignmentsSection is now defined at the top of the file (see above)

window.viewAssignmentDetails = async function(assignmentId) {
    try {
        const assignment = await resolveAssignmentById(assignmentId);
        if (!assignment) {
            showNotification('Không tìm thấy thông tin bài tập.', 'warning');
            return;
        }

        const startDate = assignment.ngayBatDau ? new Date(assignment.ngayBatDau) : null;
        const endDate = assignment.ngayKetThuc ? new Date(assignment.ngayKetThuc) : null;
        const startStr = startDate ? startDate.toLocaleString('vi-VN') : 'Chưa có';
        const endStr = endDate ? endDate.toLocaleString('vi-VN') : 'Chưa có';
        const referenceHtml = buildReferenceHtml(assignment);
        const description = assignment.moTa || assignment.ghiChu || 'Không có mô tả chi tiết.';

        // Create centered modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.cssText = 'display: flex; align-items: center; justify-content: center; z-index: 10000;';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.closest('.modal').remove()" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5);"></div>
            <div class="modal-content" style="position: relative; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
                <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #0f172a;">Chi tiết bài tập</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; padding: 0.5rem;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body assignment-detail-modal" style="padding: 1.5rem;">
                    <div class="assignment-summary" style="margin-bottom: 2rem;">
                        <h2 style="font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">${escapeHtml(assignment.tieuDe || 'Chưa có tiêu đề')}</h2>
                        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                            <p class="assignment-meta-line" style="display: flex; align-items: center; gap: 0.5rem; color: #64748b; margin: 0;">
                                <i class="fas fa-chalkboard-teacher" style="color: #e11d48;"></i>
                                <span>${escapeHtml(assignment.tenLop || 'Chưa có lớp')}</span>
                            </p>
                            <p class="assignment-meta-line" style="display: flex; align-items: center; gap: 0.5rem; color: #64748b; margin: 0;">
                                <i class="fas fa-tag" style="color: #e11d48;"></i>
                                <span>${escapeHtml(getLoaiBaiTapLabel(assignment.loaiBt))}</span>
                            </p>
                        </div>
                        <div class="assignment-datetime" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; background: #f8fafc; padding: 1rem; border-radius: 12px;">
                            <div>
                                <span class="label" style="display: block; font-size: 0.875rem; color: #64748b; margin-bottom: 0.25rem;">Bắt đầu</span>
                                <span class="value" style="display: block; font-weight: 600; color: #0f172a;">${startStr}</span>
                            </div>
                            <div>
                                <span class="label" style="display: block; font-size: 0.875rem; color: #64748b; margin-bottom: 0.25rem;">Hạn nộp</span>
                                <span class="value" style="display: block; font-weight: 600; color: #0f172a;">${endStr}</span>
                            </div>
                        </div>
                    </div>
                    <div class="assignment-description-block" style="margin-bottom: 1.5rem;">
                        <h4 style="font-size: 1.125rem; font-weight: 600; color: #0f172a; margin-bottom: 0.75rem;">Mô tả</h4>
                        <p style="color: #475569; line-height: 1.6;">${escapeHtml(description)}</p>
                    </div>
                    ${referenceHtml ? `
                        <div class="assignment-reference-block" style="margin-bottom: 1.5rem;">
                            <h4 style="font-size: 1.125rem; font-weight: 600; color: #0f172a; margin-bottom: 0.75rem;">Tài liệu tham khảo</h4>
                            ${referenceHtml}
                        </div>
                    ` : ''}
                    <div class="assignment-stats" style="display: flex; gap: 1.5rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px;">
                        <div class="stat-item" style="text-align: center;">
                            <span class="stat-label" style="display: block; font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem;">Bài nộp</span>
                            <span class="stat-value" style="display: block; font-size: 2rem; font-weight: 700; color: #e11d48;">${assignment.soBaiNop || 0}</span>
                        </div>
                        <div class="stat-item" style="text-align: center;">
                            <span class="stat-label" style="display: block; font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem;">Đã chấm</span>
                            <span class="stat-value" style="display: block; font-size: 2rem; font-weight: 700; color: #059669;">${assignment.soBaiDaCham || 0}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 0.75rem;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()" style="padding: 0.75rem 1.5rem; border: 1px solid #e2e8f0; background: white; border-radius: 8px; cursor: pointer; font-weight: 500;">Đóng</button>
                    <button class="btn btn-primary" onclick="gradeAssignment('${assignmentId}'); this.closest('.modal').remove();" style="padding: 0.75rem 1.5rem; background: #e11d48; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                        <i class="fas fa-check"></i> Chấm bài
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error showing assignment details:', error);
        showNotification('Không thể tải chi tiết bài tập.', 'error');
    }
};

window.editAssignment = async function(assignmentId) {
    try {
        const idKey = String(assignmentId);
        if (!idKey || idKey === 'undefined' || idKey === 'null') {
            showNotification('Không xác định được bài tập cần chỉnh sửa.', 'warning');
            return;
        }
        
        console.log('editAssignment called with ID:', idKey);
        
        const assignment = await resolveAssignmentById(idKey);
        if (!assignment) {
            showNotification('Không tìm thấy bài tập để chỉnh sửa.', 'warning');
            return;
        }
        
        // Ensure assignment has idBt for editing - try multiple fields
        const actualId = String(
            assignment.idBt ?? 
            assignment.id ?? 
            assignment.maBt ?? 
            assignment.assignmentId ?? 
            idKey
        );
        
        if (!actualId || actualId === 'undefined' || actualId === 'null') {
            showNotification('Không xác định được ID bài tập.', 'warning');
            return;
        }
        
        // Set the ID explicitly in the assignment object
        assignment.idBt = actualId;
        
        // CRITICAL: Set edit state BEFORE calling createAssignment
        window.__currentAssignmentEdit = { id: actualId };
        console.log('Set __currentAssignmentEdit to:', window.__currentAssignmentEdit);
        
        console.log('Editing assignment with ID:', actualId);
        await window.createAssignment(assignment);
    } catch (error) {
        console.error('Error loading assignment for edit:', error);
        showNotification('Không thể tải dữ liệu bài tập để chỉnh sửa: ' + (error.message || ''), 'error');
        // Clear edit state on error
        window.__currentAssignmentEdit = null;
    }
};

window.deleteAssignment = async function(assignmentId) {
    const idKey = String(assignmentId);
    if (!idKey || idKey === 'undefined') {
        showNotification('Không xác định được bài tập cần xóa.', 'warning');
        return;
    }

    const confirmed = window.confirm('Bạn có chắc muốn xóa bài tập này? Hành động này không thể hoàn tác.');
    if (!confirmed) {
        return;
    }

    try {
        const api = new TeacherAPI();
        await api.deleteBaiTap(idKey);
        showNotification('Đã xóa bài tập thành công!', 'success');
        if (window.__teacherAssignmentsById?.delete) {
            window.__teacherAssignmentsById.delete(idKey);
        }
        if (window.teacherDashboard) {
            window.teacherDashboard.loadAssignmentsSection();
        }
    } catch (error) {
        console.error('Error deleting assignment:', error);
        showNotification('Không thể xóa bài tập. Vui lòng thử lại sau.', 'error');
    }
};

// Load schedule section with real data
window.loadScheduleSection = async function() {
    try {
        const authContext = getAuthContext();
        if (!authContext?.payload?.user?.idNv) {
            return;
        }
        
        const api = new TeacherAPI();
        
        // Get all classes
        const classes = await api.getTeacherClasses(authContext.payload.user.idNv);
        
        // Filter classes with enough students (e.g., >= 2)
        const activeClasses = classes.filter(c => (c.soHocSinh || 0) >= 2);
        
        // Get all sessions for active classes
        const allSessions = [];
        for (const cls of activeClasses) {
            try {
                const sessions = await api.getBuoiHocByLopHoc(cls.idLh);
                if (sessions && sessions.length > 0) {
                    allSessions.push(...sessions.map(s => ({ ...s, tenLop: cls.tenLop })));
                }
            } catch (error) {
                console.error(`Error loading sessions for class ${cls.idLh}:`, error);
            }
        }
        
        // Sort by date
        allSessions.sort((a, b) => {
            const dateA = a.ngayHoc ? new Date(a.ngayHoc) : new Date(0);
            const dateB = b.ngayHoc ? new Date(b.ngayHoc) : new Date(0);
            return dateA - dateB;
        });
        
        // Update today's schedule
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaySessions = allSessions.filter(s => {
            if (!s.ngayHoc) return false;
            const sessionDate = new Date(s.ngayHoc);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === today.getTime();
        });
        
        const scheduleList = document.querySelector('.schedule-list');
        if (scheduleList) {
            if (todaySessions.length === 0) {
                scheduleList.innerHTML = '<div class="empty-state"><p>Không có lịch dạy hôm nay</p></div>';
            } else {
                scheduleList.innerHTML = todaySessions.map(session => {
                    const gioBatDau = session.gioBatDau ? new Date(session.gioBatDau) : null;
                    const gioKetThuc = session.gioKetThuc ? new Date(session.gioKetThuc) : null;
                    const now = new Date();
                    
                    let statusClass = 'completed';
                    let statusText = 'Đã hoàn thành';
                    
                    if (gioBatDau && gioKetThuc) {
                        if (now >= gioBatDau && now <= gioKetThuc) {
                            statusClass = 'active';
                            statusText = 'Đang dạy';
                        } else if (now < gioBatDau) {
                            statusClass = 'upcoming';
                            statusText = 'Sắp tới';
                        }
                    }
                    
                    const timeStr = gioBatDau && gioKetThuc
                        ? `${gioBatDau.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${gioKetThuc.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                        : 'Chưa có';
                    
                    return `
                        <div class="schedule-item">
                            <div class="schedule-time">
                                <span class="time">${timeStr}</span>
                                <span class="duration">${gioBatDau && gioKetThuc ? Math.round((gioKetThuc - gioBatDau) / 60000) + ' phút' : ''}</span>
                            </div>
                            <div class="schedule-details">
                                <h4>${session.tenLop || 'Chưa có tên'} - ${session.tenCaHoc || 'Chưa có'}</h4>
                                <p><i class="fas fa-map-marker-alt"></i> ${session.tenPhong || 'Chưa có phòng'}</p>
                                <p><i class="fas fa-users"></i> ${session.soHocSinh || 0} học sinh</p>
                                <span class="status-badge ${statusClass}">${statusText}</span>
                            </div>
                            <div class="schedule-actions">
                                <button class="btn btn-sm btn-primary" onclick="startClass('${session.idBh}')">
                                    <i class="fas fa-play"></i> Bắt đầu
                                </button>
                                <button class="btn btn-sm btn-secondary" onclick="viewSessionDetails('${session.idBh}')">
                                    <i class="fas fa-info"></i> Chi tiết
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    } catch (error) {
        console.error('Error loading schedule:', error);
        showNotification('Không thể tải lịch dạy. Vui lòng thử lại sau.', 'error');
    }
};

// Load students for a class using API
async function loadClassStudents(classId, preselectedStudentIds = []) {
    const studentListContainer = document.getElementById('assignmentStudentList');
    if (!studentListContainer) return;
    
    try {
        studentListContainer.innerHTML = '<p style="color: #64748b; font-size: 0.875rem; text-align: center; padding: 1rem;"><i class="fas fa-spinner fa-spin" style="margin-right: 0.5rem;"></i>Đang tải danh sách học sinh...</p>';
        
        const api = new TeacherAPI();
        // Use API to get students by class ID (only students who have registered for this class)
        const hocSinhs = await api.getHocSinhByLopHoc(classId);
        
        if (!hocSinhs || !Array.isArray(hocSinhs) || hocSinhs.length === 0) {
            studentListContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fas fa-user-slash" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                    <p style="font-size: 0.875rem; margin: 0;">Lớp học này chưa có học sinh đăng ký.</p>
                </div>
            `;
            return;
        }
        
        // Filter only approved students (trangThaiDangKy === 'approved')
        const approvedStudents = hocSinhs.filter(hs => {
            const status = (hs.trangThaiDangKy || '').toLowerCase();
            return status === 'approved';
        });
        
        if (approvedStudents.length === 0) {
            studentListContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #f59e0b;">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.7;"></i>
                    <p style="font-size: 0.875rem; margin: 0;">Lớp học này chưa có học sinh được duyệt.</p>
                </div>
            `;
            return;
        }
        
        studentListContainer.innerHTML = approvedStudents.map((student, index) => {
            const studentId = student.idHs || student.id;
            const isChecked = preselectedStudentIds.includes(studentId) || preselectedStudentIds.includes(String(studentId));
            const hoTen = ((student.ho || '') + ' ' + (student.tenDem || '') + ' ' + (student.ten || '')).trim() || 'Chưa có tên';
            const avatar = `${(student.ho || '').charAt(0)}${(student.ten || '').charAt(0)}`.trim().toUpperCase() || hoTen.substring(0, 2).toUpperCase();
            
            return `
                <label class="student-selection-item" style="display: flex; align-items: center; padding: 0.75rem; margin-bottom: 0.5rem; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: ${isChecked ? '#fef2f2' : '#ffffff'};" 
                       onmouseover="this.style.background='${isChecked ? '#fee2e2' : '#f8fafc'}'; this.style.borderColor='#e11d48';" 
                       onmouseout="this.style.background='${isChecked ? '#fef2f2' : '#ffffff'}'; this.style.borderColor='#e2e8f0';">
                    <input type="checkbox" value="${studentId}" ${isChecked ? 'checked' : ''} 
                           style="margin-right: 0.75rem; cursor: pointer; width: 18px; height: 18px; accent-color: #e11d48;"
                           onchange="this.closest('label').style.background = this.checked ? '#fef2f2' : '#ffffff';">
                    <div style="display: flex; align-items: center; flex: 1;">
                        <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #e11d48, #be123c); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; margin-right: 0.75rem; flex-shrink: 0;">
                            ${avatar}
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 500; color: #0f172a; font-size: 0.95rem;">${escapeHtml(hoTen)}</div>
                            ${student.email ? `<div style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;"><i class="fas fa-envelope" style="margin-right: 0.25rem;"></i>${escapeHtml(student.email)}</div>` : ''}
                        </div>
                    </div>
                    ${isChecked ? '<i class="fas fa-check-circle" style="color: #e11d48; margin-left: 0.5rem;"></i>' : ''}
                </label>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading students:', error);
        studentListContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #e11d48;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.7;"></i>
                <p style="font-size: 0.875rem; margin: 0;">Không thể tải danh sách học sinh. Vui lòng thử lại.</p>
            </div>
        `;
    }
}

