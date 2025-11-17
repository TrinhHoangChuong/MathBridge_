// ===== TEACHER FUNCTIONS - Real API Integration =====

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
window.createAssignment = async function() {
    console.log('createAssignment called');
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h3>Tạo bài tập mới</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
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
                        <label for="assignmentFile">File bài tập (URL)</label>
                        <input type="url" id="assignmentFile" class="form-input" placeholder="https://...">
                    </div>
                    <div class="form-group">
                        <label for="assignmentMaterial">Tài liệu tham khảo (URL)</label>
                        <input type="url" id="assignmentMaterial" class="form-input" placeholder="https://...">
                    </div>
                    <div class="form-group">
                        <label for="assignmentNote">Ghi chú</label>
                        <textarea id="assignmentNote" class="form-input" rows="2" placeholder="Ghi chú thêm..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Hủy</button>
                <button class="btn btn-primary" onclick="saveAssignment()">
                    <i class="fas fa-save"></i> Tạo bài tập
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
        }
    } catch (error) {
        console.error('Error loading classes:', error);
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
        const assignmentData = {
            tieuDe: document.getElementById('assignmentTitle').value,
            loaiBt: document.getElementById('assignmentType').value,
            idLh: document.getElementById('assignmentClass').value,
            ngayBatDau: document.getElementById('assignmentStartDate').value,
            ngayKetThuc: document.getElementById('assignmentEndDate').value,
            moTa: document.getElementById('assignmentDescription').value,
            fileUrl: document.getElementById('assignmentFile').value || null,
            taiLieuUrl: document.getElementById('assignmentMaterial').value || null,
            ghiChu: document.getElementById('assignmentNote').value || null
        };
        
        await api.createBaiTap(assignmentData);
        showNotification('Đã tạo bài tập thành công!', 'success');
        
        // Close modal
        const modal = document.querySelector('.modal.active');
        if (modal) {
            modal.remove();
        }
        
        // Refresh assignments section
        if (window.teacherDashboard) {
            window.teacherDashboard.loadAssignmentsSection();
        }
    } catch (error) {
        console.error('Error creating assignment:', error);
        showNotification('Không thể tạo bài tập. Vui lòng thử lại sau.', 'error');
    }
};

// View assignment details and grade
window.gradeAssignment = async function(assignmentId) {
    console.log('gradeAssignment called with:', assignmentId);
    
    try {
        const api = new TeacherAPI();
        const baiNops = await api.getBaiNopByBaiTap(assignmentId);
        
        const modal = document.createElement('div');
        modal.className = 'modal active large-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chấm điểm bài tập</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="grading-table-container">
                        <table class="grading-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Học sinh</th>
                                    <th>File nộp</th>
                                    <th>Điểm số</th>
                                    <th>Nhận xét</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${baiNops && baiNops.length > 0 ? baiNops.map((bn, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${bn.hoTen || '-'}</td>
                                        <td>
                                            ${bn.fileUrl ? `<a href="${bn.fileUrl}" target="_blank" class="btn btn-sm btn-link">
                                                <i class="fas fa-download"></i> Xem file
                                            </a>` : 'Chưa nộp'}
                                        </td>
                                        <td>
                                            <input type="number" class="grade-input" id="grade_${bn.idBn}" 
                                                   value="${bn.diemSo || ''}" min="0" max="10" step="0.1" 
                                                   placeholder="0.0">
                                        </td>
                                        <td>
                                            <textarea class="comment-input" id="comment_${bn.idBn}" 
                                                      rows="2" placeholder="Nhận xét...">${bn.nhanXet || ''}</textarea>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-success" onclick="saveGrade('${bn.idBn}')">
                                                <i class="fas fa-save"></i> Lưu
                                            </button>
                                        </td>
                                    </tr>
                                `).join('') : '<tr><td colspan="6" class="text-center">Chưa có bài nộp nào</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Đóng</button>
                    <button class="btn btn-primary" onclick="bulkSaveGrades('${assignmentId}')">
                        <i class="fas fa-save"></i> Lưu tất cả
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error loading assignment for grading:', error);
        showNotification('Không thể tải bài nộp. Vui lòng thử lại sau.', 'error');
    }
};

// Save grade for a submission
window.saveGrade = async function(baiNopId) {
    try {
        const api = new TeacherAPI();
        const diemSo = parseFloat(document.getElementById(`grade_${baiNopId}`).value);
        const nhanXet = document.getElementById(`comment_${baiNopId}`).value;
        
        if (isNaN(diemSo) || diemSo < 0 || diemSo > 10) {
            showNotification('Điểm số phải từ 0 đến 10!', 'error');
            return;
        }
        
        await api.chamDiemBaiNop(baiNopId, diemSo, nhanXet);
        showNotification('Đã lưu điểm thành công!', 'success');
    } catch (error) {
        console.error('Error saving grade:', error);
        showNotification('Không thể lưu điểm. Vui lòng thử lại sau.', 'error');
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
        const diem = parseFloat(diemSo);
        
        if (Number.isNaN(diem) || diem < 0 || diem > 10) {
            showNotification('Điểm số phải từ 0 đến 10!', 'error');
            return;
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

window.importGrades = async function() {
    const currentClassId = window.teacherDashboard?.currentGradeClassId;
    if (!currentClassId) {
        showNotification('Vui lòng chọn lớp trước khi import điểm.', 'warning');
        return;
    }

    await viewClassStudents(currentClassId);
    showNotification('Import học sinh/điểm nằm trong modal danh sách lớp. Sử dụng nút "Import" để tiếp tục.', 'info');
};

// Export grade report
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
        
        let csvContent = `Báo cáo điểm số - ${classLabel} - ${new Date().toLocaleDateString('vi-VN')}\n`;
        csvContent += `STT,Họ và tên,Email,Điểm 15p,Điểm 45p,Điểm thi HK,Điểm TB,Xếp loại\n`;
        
        (diemSos || []).forEach((ds, index) => {
            const safeName = (ds.hoTen || '').replace(/"/g, '""');
            const safeEmail = (ds.email || '').replace(/"/g, '""');
            const safeRank = (ds.xepLoai || '').replace(/"/g, '""');
            csvContent += `${index + 1},"${safeName}","${safeEmail}",${ds.diem15Phut ?? '-'},${ds.diem45Phut ?? '-'},${ds.diemThiHK ?? '-'},${ds.diemTrungBinh ?? '-'},"${safeRank}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `BaoCaoDiemSo_${classLabel.replace(/\s+/g, '')}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Đã xuất báo cáo điểm số thành công!', 'success');
    } catch (error) {
        console.error('Error exporting grades:', error);
        showNotification('Không thể xuất báo cáo. Vui lòng thử lại sau.', 'error');
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

// Load assignments section
window.loadAssignmentsSection = async function() {
    try {
        const authContext = getAuthContext();
        if (!authContext?.payload?.user?.idNv) {
            return;
        }
        
        const api = new TeacherAPI();
        const baiTaps = await api.getBaiTapByGiaoVien(authContext.payload.user.idNv);

        const assignmentsGrid = document.querySelector('.assignments-grid');
        if (assignmentsGrid) {
            if (!baiTaps || baiTaps.length === 0) {
                assignmentsGrid.innerHTML = '<div class="empty-state"><p>Chưa có bài tập nào</p></div>';
            } else {
                window.__teacherAssignmentsById = new Map();

                assignmentsGrid.innerHTML = baiTaps.map((bt) => {
                    const assignmentId = bt.idBt ?? bt.id ?? bt.maBt;
                    if (assignmentId) {
                        window.__teacherAssignmentsById.set(String(assignmentId), bt);
                    }

                    const startDate = bt.ngayBatDau ? new Date(bt.ngayBatDau) : null;
                    const endDate = bt.ngayKetThuc ? new Date(bt.ngayKetThuc) : null;
                    const startStr = startDate ? startDate.toLocaleDateString('vi-VN') : 'Chưa có';
                    const endStr = endDate ? endDate.toLocaleDateString('vi-VN') : 'Chưa có';
                    const progress = bt.soBaiNop > 0 ? Math.round((bt.soBaiDaCham / bt.soBaiNop) * 100) : 0;
                    const referenceHtml = buildReferenceHtml(bt);
                    const description = bt.moTa || bt.ghiChu || '';

                    return `
                        <div class="assignment-card">
                            <div class="assignment-header">
                                <h3>${escapeHtml(bt.tieuDe || 'Chưa có tiêu đề')}</h3>
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
                                    <p><i class="fas fa-chalkboard-teacher"></i> ${escapeHtml(bt.tenLop || 'Chưa có lớp')}</p>
                                    <p><i class="fas fa-tag"></i> ${escapeHtml(getLoaiBaiTapLabel(bt.loaiBt))}</p>
                                    <p><i class="fas fa-calendar"></i> ${startStr !== 'Chưa có' ? `Bắt đầu: ${startStr}` : 'Chưa có ngày bắt đầu'}</p>
                                    <p><i class="fas fa-hourglass-end"></i> Hạn nộp: ${endStr}</p>
                                </div>
                                ${description ? `
                                    <div class="assignment-description">
                                        <p>${escapeHtml(description)}</p>
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
                }).join('');
            }
        }
    } catch (error) {
        console.error('Error loading assignments:', error);
        showNotification('Không thể tải danh sách bài tập. Vui lòng thử lại sau.', 'error');
    }
};

window.viewAssignmentDetails = async function(assignmentId) {
    try {
        const idKey = String(assignmentId);
        let assignment = window.__teacherAssignmentsById?.get?.(idKey);

        if (!assignment) {
            const authContext = getAuthContext();
            if (!authContext?.payload?.user?.idNv) {
                throw new Error('Thiếu thông tin giáo viên');
            }
            const api = new TeacherAPI();
            const baiTaps = await api.getBaiTapByGiaoVien(authContext.payload.user.idNv);
            assignment = (baiTaps || []).find((bt) => String(bt.idBt ?? bt.id ?? bt.maBt) === idKey);
        }

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

        const modal = document.createElement('div');
        modal.className = 'modal active large-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chi tiết bài tập</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body assignment-detail-modal">
                    <div class="assignment-summary">
                        <h2>${escapeHtml(assignment.tieuDe || 'Chưa có tiêu đề')}</h2>
                        <p class="assignment-meta-line">
                            <i class="fas fa-chalkboard-teacher"></i>
                            <span>${escapeHtml(assignment.tenLop || 'Chưa có lớp')}</span>
                        </p>
                        <p class="assignment-meta-line">
                            <i class="fas fa-tag"></i>
                            <span>${escapeHtml(getLoaiBaiTapLabel(assignment.loaiBt))}</span>
                        </p>
                        <div class="assignment-datetime">
                            <div>
                                <span class="label">Bắt đầu</span>
                                <span class="value">${startStr}</span>
                            </div>
                            <div>
                                <span class="label">Hạn nộp</span>
                                <span class="value">${endStr}</span>
                            </div>
                        </div>
                    </div>
                    <div class="assignment-description-block">
                        <h4>Mô tả</h4>
                        <p>${escapeHtml(description)}</p>
                    </div>
                    ${referenceHtml ? `
                        <div class="assignment-reference-block">
                            <h4>Tài liệu tham khảo</h4>
                            ${referenceHtml}
                        </div>
                    ` : ''}
                    <div class="assignment-stats">
                        <div class="stat-item">
                            <span class="stat-label">Bài nộp</span>
                            <span class="stat-value">${assignment.soBaiNop || 0}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Đã chấm</span>
                            <span class="stat-value">${assignment.soBaiDaCham || 0}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Đóng</button>
                    <button class="btn btn-primary" onclick="gradeAssignment('${assignmentId}')">
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

