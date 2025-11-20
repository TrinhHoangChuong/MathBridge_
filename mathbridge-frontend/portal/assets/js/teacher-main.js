
const AUTH_STORAGE_KEY = 'mb_auth';
const TOKEN_STORAGE_KEY = 'mb_token';
const TOKEN_TYPE_STORAGE_KEY = 'mb_token_type';
const ROLE_TEACHER = 'R002';
const ROLE_TUTOR = 'R003';

function parseStoredAuth() {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch (error) {
        console.warn('Failed to parse mb_auth payload', error);
        return null;
    }
}

function ensureTeacherOrTutorAccess() {
    const payload = parseStoredAuth();
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const roles = Array.isArray(payload?.user?.roles) ? payload.user.roles : [];
    const hasAccess = roles.includes(ROLE_TEACHER) || roles.includes(ROLE_TUTOR);

    if (!token || !hasAccess) {
        redirectToLogin();
        return null;
    }
    return {
        payload,
        token,
        tokenType: localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) || 'Bearer'
    };
}

function redirectToLogin() {
    window.location.replace('../LoginPortal.html');
}

function getRoleLabel(roles) {
    if (Array.isArray(roles)) {
        if (roles.includes(ROLE_TEACHER)) {
            return 'Giáo viên';
        }
        if (roles.includes(ROLE_TUTOR)) {
            return 'Cố vấn học tập';
        }
    }
    return 'Thành viên MathBridge';
}

function getInitials(name, emailFallback) {
    if (name && name.trim().length) {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        const first = parts[0].charAt(0);
        const last = parts[parts.length - 1].charAt(0);
        return (first + last).toUpperCase();
    }
    if (emailFallback) {
        return emailFallback.charAt(0).toUpperCase();
    }
    return 'MB';
}

function closeUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.remove('open');
    }
}

function applyAuthProfileToUI(authPayload, profileData) {
    if (!authPayload) {
        return;
    }

    const roles = Array.isArray(authPayload.user?.roles) ? authPayload.user.roles : [];
    const roleLabel = getRoleLabel(roles);
    const email =
        profileData?.email ||
        authPayload.user?.email ||
        localStorage.getItem('mb_user_email') ||
        'teacher@mathbridge.vn';

    const displayName =
        profileData?.fullName ||
        authPayload.user?.fullName ||
        localStorage.getItem('mb_user_name') ||
        email;

    const initials = getInitials(displayName, email);

    if (profileData?.fullName) {
        localStorage.setItem('mb_user_name', profileData.fullName);
    }
    if (email) {
        localStorage.setItem('mb_user_email', email);
    }

    const sidebarName = document.querySelector('.user-name');
    if (sidebarName) {
        sidebarName.textContent = displayName;
    }

    const sidebarRole = document.querySelector('.user-role');
    if (sidebarRole) {
        sidebarRole.textContent = roleLabel;
    }

    const headerName = document.getElementById('headerDisplayName');
    if (headerName) {
        headerName.textContent = displayName;
    }

    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar) {
        headerAvatar.textContent = initials;
    }

    const dropdownName = document.getElementById('dropdownName');
    if (dropdownName) {
        dropdownName.textContent = displayName;
    }

    const dropdownEmail = document.getElementById('dropdownEmail');
    if (dropdownEmail) {
        dropdownEmail.textContent = email;
    }

    const profileName = document.getElementById('profileModalName');
    if (profileName) {
        profileName.textContent = displayName;
    }
    const profileEmail = document.getElementById('profileModalEmail');
    if (profileEmail) {
        profileEmail.textContent = email;
    }
    const profileAvatar = document.getElementById('profileModalAvatar');
    if (profileAvatar) {
        profileAvatar.textContent = initials;
    }
    const profileCampus = document.getElementById('profileModalCampus');
    if (profileCampus) {
        profileCampus.textContent = profileData?.coSoTen
            ? `Cơ sở: ${profileData.coSoTen}`
            : 'Cơ sở: Đang cập nhật';
    }
}

function performLogout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_TYPE_STORAGE_KEY);
    localStorage.removeItem('mb_user_roles');
    localStorage.removeItem('mb_user_id');
    localStorage.removeItem('mb_user_email');
    localStorage.removeItem('mb_user_name');
    redirectToLogin();
}

function registerLogoutHandler() {
    ['logoutBtn', 'logoutMenuBtn'].forEach((id) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                closeUserDropdown();
                performLogout();
            });
        }
    });
}

function setupUserMenuInteractions() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const dropdown = document.getElementById('userDropdown');
    if (!userMenuBtn || !dropdown) {
        return;
    }

    userMenuBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        dropdown.classList.toggle('open');
    });

    document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target) && !userMenuBtn.contains(event.target)) {
            dropdown.classList.remove('open');
        }
    });
}

function populateProfileForm(profile, authPayload) {
    const data = profile || {};
    const hoInput = document.getElementById('profileHo');
    const tenDemInput = document.getElementById('profileTenDem');
    const tenInput = document.getElementById('profileTen');
    const sdtInput = document.getElementById('profileSdt');
    const chuyenMonInput = document.getElementById('profileChuyenMon');
    const kinhNghiemInput = document.getElementById('profileKinhNghiem');
    const gioiTinhSelect = document.getElementById('profileGioiTinh');

    if (hoInput) hoInput.value = data.ho || '';
    if (tenDemInput) tenDemInput.value = data.tenDem || '';
    if (tenInput) tenInput.value = data.ten || '';
    if (sdtInput) sdtInput.value = data.sdt || '';
    if (chuyenMonInput) chuyenMonInput.value = data.chuyenMon || '';
    if (kinhNghiemInput) kinhNghiemInput.value = data.kinhNghiem != null ? data.kinhNghiem : '';
    if (gioiTinhSelect) {
        if (data.gioiTinh === true || data.gioiTinh === false) {
            gioiTinhSelect.value = String(data.gioiTinh);
        } else {
            gioiTinhSelect.value = '';
        }
    }

    applyAuthProfileToUI(authPayload, data);
}

async function loadAndRenderTeacherProfile() {
    const context = getAuthContext();
    if (!context?.payload?.user?.idTk) {
        console.warn('Missing account ID for profile fetch');
        return;
    }
    const api = new TeacherAPI();
    try {
        const response = await api.getTeacherProfile(context.payload.user.idTk);
        const profile = response?.data || response;
        if (profile) {
            window.__teacherProfile = profile;
            populateProfileForm(profile, context.payload);
            
            // Hydrate and cache idNv (employee/teacher id) for subsequent API calls
            try {
                const hasIdNvInPayload = !!context.payload?.user?.idNv;
                const idNvFromProfile = profile?.idNv || profile?.nhanVienId || profile?.id;
                if (!hasIdNvInPayload && idNvFromProfile) {
                    // Cache in auth context and localStorage for later usage
                    context.payload.user.idNv = idNvFromProfile;
                    window.__teacherAuthContext = context;
                    try {
                        localStorage.setItem('mb_idNv', String(idNvFromProfile));
                    } catch (e) {
                        console.warn('Failed to cache mb_idNv:', e);
                    }

                    // After resolving idNv, refresh data-driven sections
                    if (window.teacherDashboard) {
                        // Refresh dashboard statistics and class list
                        window.teacherDashboard.loadClassStatistics();
                        window.teacherDashboard.loadClassesSection();
                        // Also refresh other sections that rely on teacher id
                        window.teacherDashboard.loadUpcomingClasses();
                        if (typeof loadAssignmentsSection === 'function') {
                            loadAssignmentsSection();
                        }
                        if (typeof loadScheduleSection === 'function') {
                            loadScheduleSection();
                        }
                    }
                }
            } catch (hydrateErr) {
                console.warn('Could not hydrate idNv from profile:', hydrateErr);
            }
        } else {
            applyAuthProfileToUI(context.payload);
        }
    } catch (error) {
        console.error('Failed to load teacher profile:', error);
        applyAuthProfileToUI(context.payload);
        showNotification('Không thể tải thông tin giáo viên. Vui lòng thử lại sau.', 'warning');
    }
}

async function handleProfileSave() {
    const context = getAuthContext();
    if (!context?.payload?.user?.idTk) {
        return;
    }
    const ho = document.getElementById('profileHo')?.value?.trim() || null;
    const tenDem = document.getElementById('profileTenDem')?.value?.trim() || null;
    const ten = document.getElementById('profileTen')?.value?.trim() || null;
    const sdt = document.getElementById('profileSdt')?.value?.trim() || null;
    const chuyenMon = document.getElementById('profileChuyenMon')?.value?.trim() || null;
    const kinhNghiemRaw = document.getElementById('profileKinhNghiem')?.value;
    const gioiTinhRaw = document.getElementById('profileGioiTinh')?.value;

    let kinhNghiem = kinhNghiemRaw === '' ? null : Number(kinhNghiemRaw);
    if (Number.isNaN(kinhNghiem)) {
        kinhNghiem = null;
    }

    const payload = {
        ho,
        tenDem,
        ten,
        sdt,
        chuyenMon,
        kinhNghiem,
        gioiTinh: gioiTinhRaw === '' ? null : gioiTinhRaw === 'true'
    };

    const api = new TeacherAPI();
    try {
        const response = await api.updateTeacherProfile(context.payload.user.idTk, payload);
        const updatedProfile = response?.data || response;
        window.__teacherProfile = updatedProfile;
        populateProfileForm(updatedProfile, context.payload);
        closeProfileModal();
        closeUserDropdown();
        showNotification('Đã cập nhật thông tin cá nhân thành công!', 'success');
    } catch (error) {
        console.error('Update profile error:', error);
        showNotification(error.message || 'Cập nhật thất bại. Vui lòng thử lại.', 'error');
    }
}

function wireProfileModalEvents() {
    const modal = document.getElementById('profileModal');
    const openButtons = [
        document.getElementById('openProfileModal'),
        document.getElementById('viewProfileBtn')
    ];
    const closeBtn = document.getElementById('closeProfileModal');
    const cancelBtn = document.getElementById('cancelProfileChanges');
    const saveBtn = document.getElementById('saveProfileChanges');

    const authContext = getAuthContext();

    const openModal = () => {
        if (!modal) return;
        populateProfileForm(window.__teacherProfile, authContext?.payload);
        modal.classList.add('active');
    };

    openButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (event) => {
                event.preventDefault();
                closeUserDropdown();
                openModal();
            });
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeProfileModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeProfileModal);
    }
    if (saveBtn) {
        saveBtn.addEventListener('click', handleProfileSave);
    }
}

function getAuthContext() {
    if (!window.__teacherAuthContext) {
        window.__teacherAuthContext = ensureTeacherOrTutorAccess();
    }
    // Ensure idNv is present if cached
    try {
        const ctx = window.__teacherAuthContext;
        if (ctx?.payload?.user && !ctx.payload.user.idNv) {
            const cachedIdNv = localStorage.getItem('mb_idNv');
            if (cachedIdNv) {
                ctx.payload.user.idNv = cachedIdNv;
            }
        }
    } catch (e) {
        console.warn('Failed to enrich auth context with cached idNv:', e);
    }
    return window.__teacherAuthContext;
}

// ===== TEACHER API CLASS =====
class TeacherAPI {
    constructor() {
        this.baseURL = 'http://localhost:8080/api'; // Adjust based on your backend URL
        const authContext = getAuthContext();
        this.token = authContext?.token || localStorage.getItem('authToken');
        this.tokenType = authContext?.tokenType || 'Bearer';
    }

    // Generic HTTP methods
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `${this.tokenType} ${this.token}` })
            },
            ...options
        };

        if (!this.token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        try {
            const response = await fetch(url, config);
            
            if (response.status === 401) {
                console.warn('Authentication failed with 401, redirecting to login.');
                redirectToLogin();
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Authentication methods
    async login(credentials) {
        try {
            const response = await this.post('/auth/login', credentials);
            if (response.token) {
                this.token = response.token;
                localStorage.setItem('authToken', response.token);
            }
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            await this.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.token = null;
            localStorage.removeItem('authToken');
        }
    }

    async getTeacherProfile(accountId) {
        return this.get(`/public/nhanvien/account/${accountId}`);
    }

    async updateTeacherProfile(accountId, profileData) {
        return this.put(`/public/nhanvien/account/${accountId}`, profileData);
    }

    // Get classes by teacher ID (employee ID)
    async getTeacherClasses(idNv) {
        return this.get(`/public/nhanvien/${idNv}/lophoc`);
    }

    // ===== HỌC SINH =====
    async getHocSinhByLopHoc(idLh) {
        return this.get(`/public/giaovien/lophoc/${idLh}/hocsinh`);
    }

    // ===== BÀI TẬP =====
    async getBaiTapByLopHoc(idLh) {
        return this.get(`/public/giaovien/lophoc/${idLh}/baitap`);
    }

    async getBaiTapByGiaoVien(idNv) {
        return this.get(`/public/giaovien/${idNv}/baitap`);
    }

    async createBaiTap(baiTapData) {
        return this.post(`/public/giaovien/baitap`, baiTapData);
    }

    async updateBaiTap(idBt, baiTapData) {
        return this.put(`/public/giaovien/baitap/${idBt}`, baiTapData);
    }

    async deleteBaiTap(idBt) {
        return this.delete(`/public/giaovien/baitap/${idBt}`);
    }

    async getBaiNopByBaiTap(idBt) {
        return this.get(`/public/giaovien/baitap/${idBt}/bainop`);
    }

    async chamDiemBaiNop(idBn, diemSo, nhanXet) {
        return this.put(`/public/giaovien/bainop/${idBn}/chamdiem?diemSo=${diemSo}&nhanXet=${encodeURIComponent(nhanXet || '')}`);
    }

    // ===== ĐIỂM SỐ =====
    async getDiemSoByLopHoc(idLh) {
        return this.get(`/public/giaovien/lophoc/${idLh}/diemso`);
    }

    async updateDiemSo(idLh, idHs, loaiDiem, diemSo) {
        return this.put(`/public/giaovien/lophoc/${idLh}/hocsinh/${idHs}/diemso?loaiDiem=${loaiDiem}&diemSo=${diemSo}`);
    }

    async exportBaoCaoDiemSo(idLh) {
        return this.get(`/public/giaovien/lophoc/${idLh}/diemso/export`);
    }

    // ===== LỊCH DẠY =====
    async getBuoiHocByLopHoc(idLh) {
        return this.get(`/public/giaovien/lophoc/${idLh}/buoihoc`);
    }

    async getBuoiHocByGiaoVien(idNv) {
        return this.get(`/public/giaovien/${idNv}/buoihoc`);
    }

    async createBuoiHoc(buoiHocData) {
        return this.post(`/public/giaovien/buoihoc`, buoiHocData);
    }

    async updateBuoiHoc(idBh, buoiHocData) {
        return this.put(`/public/giaovien/buoihoc/${idBh}`, buoiHocData);
    }

    async deleteBuoiHoc(idBh) {
        return this.delete(`/public/giaovien/buoihoc/${idBh}`);
    }

    // Class management methods
    async getClasses() {
        return this.get('/classes');
    }

    async getClassById(classId) {
        return this.get(`/classes/${classId}`);
    }

    async createClass(classData) {
        return this.post('/classes', classData);
    }

    async updateClass(classId, classData) {
        return this.put(`/classes/${classId}`, classData);
    }

    async deleteClass(classId) {
        return this.delete(`/classes/${classId}`);
    }

    // Student management methods
    async getStudents(classId) {
        return this.get(`/classes/${classId}/students`);
    }

    async addStudent(classId, studentData) {
        return this.post(`/classes/${classId}/students`, studentData);
    }

    async updateStudent(studentId, studentData) {
        return this.put(`/students/${studentId}`, studentData);
    }

    async removeStudent(classId, studentId) {
        return this.delete(`/classes/${classId}/students/${studentId}`);
    }

    // Assignment methods
    async getAssignments(classId) {
        return this.get(`/classes/${classId}/assignments`);
    }

    async createAssignment(classId, assignmentData) {
        return this.post(`/classes/${classId}/assignments`, assignmentData);
    }

    async updateAssignment(assignmentId, assignmentData) {
        return this.put(`/assignments/${assignmentId}`, assignmentData);
    }

    async deleteAssignment(assignmentId) {
        return this.delete(`/assignments/${assignmentId}`);
    }

    // Grade methods
    async getGrades(classId) {
        return this.get(`/classes/${classId}/grades`);
    }

    async updateGrade(gradeId, gradeData) {
        return this.put(`/grades/${gradeId}`, gradeData);
    }

    async bulkUpdateGrades(gradesData) {
        return this.post('/grades/bulk', gradesData);
    }

    // Schedule methods
    async getSchedule() {
        return this.get('/schedule');
    }

    async createScheduleItem(scheduleData) {
        return this.post('/schedule', scheduleData);
    }

    async updateScheduleItem(itemId, scheduleData) {
        return this.put(`/schedule/${itemId}`, scheduleData);
    }

    async deleteScheduleItem(itemId) {
        return this.delete(`/schedule/${itemId}`);
    }

    // Message methods
    async getMessages() {
        return this.get('/messages');
    }

    async sendMessage(messageData) {
        return this.post('/messages', messageData);
    }

    async replyToMessage(messageId, replyData) {
        return this.post(`/messages/${messageId}/reply`, replyData);
    }

    async markMessageAsRead(messageId) {
        return this.put(`/messages/${messageId}/read`);
    }

    async deleteMessage(messageId) {
        return this.delete(`/messages/${messageId}`);
    }

    // Attendance methods
    async getAttendance(classId, date) {
        return this.get(`/classes/${classId}/attendance?date=${date}`);
    }

    async updateAttendance(classId, attendanceData) {
        return this.put(`/classes/${classId}/attendance`, attendanceData);
    }

    // Report methods
    async generateReport(reportType, params) {
        return this.post('/reports/generate', { type: reportType, params });
    }

    async exportData(exportType, params) {
        return this.post('/export', { type: exportType, params });
    }
}

// ===== NOTIFICATION MANAGER =====
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        const notification = this.createNotification(message, type);
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Auto remove
        setTimeout(() => {
            this.remove(notification);
        }, duration);

        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getIcon(type);
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        return notification;
    }

    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    remove(notification) {
        if (notification && notification.parentElement) {
            notification.remove();
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }
    }

    clear() {
        this.notifications.forEach(notification => this.remove(notification));
    }
}

// ===== TEACHER DASHBOARD CLASS =====
class TeacherDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.sidebarCollapsed = false;
        this.api = new TeacherAPI();
        this.classesById = new Map();
        this.notifications = new NotificationManager();
        this.gradeDataByClass = new Map();
        this.currentGradeClassId = null;
        this.init();
    }

    async init() {
        this.bindEvents();
        this.initializeCalendar();
        await this.loadDashboardData();
        try {
            await this.loadClassesSection();
        } catch (error) {
            console.error('Failed to preload classes section:', error);
        }
        
        // Preload key sections so dữ liệu thật xuất hiện ngay khi chuyển tab
        if (typeof window.loadAssignmentsSection === 'function') {
            try {
                console.log('Preloading assignments section...');
                await window.loadAssignmentsSection();
            } catch (error) {
                console.error('Failed to preload assignments section:', error);
            }
        } else {
            console.warn('window.loadAssignmentsSection not available during init');
        }
        if (typeof loadScheduleSection === 'function') {
            try {
                await loadScheduleSection();
            } catch (error) {
                console.error('Failed to preload schedule section:', error);
            }
        }

        try {
            await this.loadGradesSection();
        } catch (error) {
            console.error('Failed to preload grades section:', error);
        }
        
        this.initializeCharts();
    }

    cacheClasses(classes) {
        if (!Array.isArray(classes)) {
            return;
        }

        if (!this.classesById) {
            this.classesById = new Map();
        }

        classes.forEach((cls) => {
            if (!cls || typeof cls !== 'object') {
                return;
            }
            const id = cls.idLh ?? cls.id ?? cls.idLop;
            if (!id && id !== 0) {
                return;
            }
            const key = String(id);
            const existing = this.classesById.get(key) || {};
            this.classesById.set(key, { ...existing, ...cls });
        });

        try {
            window.__teacherClasses = Array.from(this.classesById.entries()).reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});
        } catch (error) {
            console.warn('Failed to cache classes globally:', error);
        }
    }

    escapeHtml(text) {
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

    getCachedClassesArray() {
        if (!this.classesById || this.classesById.size === 0) {
            return [];
        }
        return Array.from(this.classesById.values());
    }

    async ensureClassCache() {
        const cached = this.getCachedClassesArray();
        if (cached.length > 0) {
            return cached;
        }

        try {
            const authContext = getAuthContext();
            if (!authContext?.payload?.user?.idNv) {
                return [];
            }
            const classes = await this.api.getTeacherClasses(authContext.payload.user.idNv);
            this.cacheClasses(classes || []);
            return this.getCachedClassesArray();
        } catch (error) {
            console.error('Failed to ensure class cache:', error);
            return [];
        }
    }

    getClassInfo(classId) {
        if (!classId && classId !== 0) {
            return null;
        }
        const key = String(classId);
        return this.classesById?.get(key) || null;
    }

    bindEvents() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');

        if (sidebarToggle && !sidebarToggle._toggleBound) {
            sidebarToggle._toggleBound = true;
            
            sidebarToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    this.toggleSidebar();
                } catch (error) {
                    console.error('Error toggling sidebar:', error);
                }
            });
        }

        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    this.toggleMobileMenu();
                } catch (error) {
                    console.error('Error toggling mobile menu:', error);
                }
            });
        }

        // Modal events
        this.bindModalEvents();

        // Search functionality
        const studentSearch = document.getElementById('studentSearch');
        if (studentSearch) {
            studentSearch.addEventListener('input', (e) => {
                this.searchStudents(e.target.value);
            });
        }

        // Real-time updates
        this.initializeRealTimeUpdates();
    }

    bindModalEvents() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                }
            }
        });
    }

    toggleSidebar() {
        try {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('mainContent');
            const toggleBtn = document.getElementById('sidebarToggle');
            
            if (!sidebar) {
                console.error('Sidebar element not found');
                return;
            }
            
            if (!mainContent) {
                console.error('Main content element not found');
                return;
            }
            
            // Toggle collapsed state
            this.sidebarCollapsed = !this.sidebarCollapsed;
            
            // Toggle classes
            if (this.sidebarCollapsed) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('sidebar-collapsed');
            } else {
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('sidebar-collapsed');
            }

            // Update icon
            if (toggleBtn) {
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    if (this.sidebarCollapsed) {
                        icon.className = 'fas fa-angle-right';
                    } else {
                        icon.className = 'fas fa-angle-left';
                    }
                } else {
                    console.warn('Icon element not found in toggle button');
                }
            } else {
                console.warn('Toggle button not found');
            }
        } catch (error) {
            console.error('Error in toggleSidebar:', error);
        }
    }

    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
        }
    }

    navigateToSection(sectionId) {
        // Remove active class from all nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));

        // Add active class to clicked item
        const activeItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Hide all content sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionId;
            
            // Load data for specific sections
            if (sectionId === 'classes') {
                this.loadClassesSection();
            } else if (sectionId === 'assignments') {
                console.log('=== Navigate to assignments section ===');
                console.log('loadAssignmentsSection type:', typeof loadAssignmentsSection);
                console.log('window.loadAssignmentsSection type:', typeof window.loadAssignmentsSection);
                
                if (typeof window.loadAssignmentsSection === 'function') {
                    console.log('Calling window.loadAssignmentsSection()');
                    window.loadAssignmentsSection();
                } else if (typeof loadAssignmentsSection === 'function') {
                    console.log('Calling loadAssignmentsSection()');
                    loadAssignmentsSection();
                } else {
                    console.error('loadAssignmentsSection function not found!');
                    // Try to load assignments directly
                    setTimeout(() => {
                        if (typeof window.loadAssignmentsSection === 'function') {
                            console.log('Retrying: Calling window.loadAssignmentsSection()');
                            window.loadAssignmentsSection();
                        }
                    }, 500);
                }
            } else if (sectionId === 'schedule') {
                if (typeof loadScheduleSection === 'function') {
                    loadScheduleSection();
                }
            } else if (sectionId === 'grades') {
                this.loadGradesSection(null, { preserveSelection: true });
            }
        }
    }

    async loadClassesSection() {
        try {
            const authContext = getAuthContext();
            if (!authContext?.payload?.user?.idNv) {
                console.warn('Missing employee ID for loading classes');
                return;
            }

            // Load classes from API
            const classes = await this.api.getTeacherClasses(authContext.payload.user.idNv);
            
            if (!classes || classes.length === 0) {
                this.cacheClasses([]);
                const classesGrid = document.querySelector('.classes-grid');
                if (classesGrid) {
                    classesGrid.innerHTML = '<div class="empty-state"><p>Bạn chưa có lớp học nào</p></div>';
                }
                return;
            }
            
            // Update classes grid
            const classesGrid = document.querySelector('.classes-grid');
            if (classesGrid && classes) {
                // Load additional data for each class (diem so, attendance)
                const classesWithStats = await Promise.all(classes.map(async (cls) => {
                    try {
                        // Load diem so to calculate average
                        const diemSos = await this.api.getDiemSoByLopHoc(cls.idLh);
                        const diemTB = diemSos && diemSos.length > 0 
                            ? (diemSos.reduce((sum, ds) => sum + (parseFloat(ds.diemTrungBinh) || 0), 0) / diemSos.length).toFixed(1)
                            : '-';
                        
                        return { ...cls, diemTB };
                    } catch (error) {
                        console.error(`Error loading stats for class ${cls.idLh}:`, error);
                        return { ...cls, diemTB: '-' };
                    }
                }));
                
                this.cacheClasses(classesWithStats);
                classesGrid.innerHTML = classesWithStats.map(cls => {
                    const startDate = cls.ngayBatDau ? new Date(cls.ngayBatDau) : null;
                    const dateStr = startDate ? startDate.toLocaleDateString('vi-VN') : 'Chưa có';
                    
                    return `
                        <div class="class-card">
                            <div class="class-header">
                                <h3>${cls.tenLop || 'Chưa có tên'}</h3>
                                <div class="class-actions">
                                    <button class="btn-icon" title="Xem học sinh" onclick="viewClassStudents('${cls.idLh}')">
                                        <i class="fas fa-users"></i>
                                    </button>
                                    <button class="btn-icon" title="Xem chi tiết" onclick="viewClassDetails('${cls.idLh}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="class-body">
                                <div class="class-stats">
                                    <div class="stat">
                                        <span class="stat-value">${cls.soHocSinh || 0}</span>
                                        <span class="stat-label">HỌC SINH</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-value">${cls.diemTB || '-'}</span>
                                        <span class="stat-label">ĐIỂM TB</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-value">${cls.soHocSinh > 0 ? '100%' : '0%'}</span>
                                        <span class="stat-label">THAM GIA</span>
                                    </div>
                                </div>
                                <div class="class-schedule">
                                    <p><i class="fas fa-calendar"></i> ${cls.loaiNgay || 'Chưa có'} - ${cls.soBuoi || 'Chưa có'}</p>
                                    <p><i class="fas fa-clock"></i> Bắt đầu: ${dateStr}</p>
                                    <p><i class="fas fa-info-circle"></i> ${cls.hinhThucHoc || 'Chưa có'}</p>
                                    <p><i class="fas fa-tag"></i> Trạng thái: ${cls.trangThai || 'Chưa có'}</p>
                                </div>
                                <div class="class-actions-full">
                                    <button class="btn btn-sm btn-primary" onclick="viewClassDetails('${cls.idLh}')">
                                        <i class="fas fa-eye"></i> Xem chi tiết
                                    </button>
                                    <button class="btn btn-sm btn-success" onclick="viewDiemSo('${cls.idLh}')">
                                        <i class="fas fa-chart-line"></i> Xem điểm
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('Error loading classes section:', error);
            showNotification('Không thể tải danh sách lớp học. Vui lòng thử lại sau.', 'error');
        }
    }

    async loadGradesSection(forceClassId = null, options = {}) {
        const { preserveSelection = false } = options || {};
        const gradesTableBody = document.querySelector('.grades-table tbody');
        if (gradesTableBody) {
            gradesTableBody.innerHTML = `
                <tr class="placeholder-row">
                    <td colspan="8" class="text-center">Đang tải dữ liệu điểm số...</td>
                </tr>
            `;
        }

        try {
            const classes = await this.ensureClassCache();
            const selectedClassId = forceClassId
                ?? (preserveSelection ? this.currentGradeClassId : null)
                ?? this.currentGradeClassId
                ?? (classes[0] ? (classes[0].idLh ?? classes[0].id ?? classes[0].idLop) : null);

            this.renderGradeFilters(classes, selectedClassId);
            this.updateGradeClassSelect(classes, selectedClassId);

            if (!selectedClassId) {
                this.renderGradeEmptyState(classes.length === 0
                    ? 'Bạn chưa được phân công lớp học nào.'
                    : 'Hãy chọn một lớp để xem điểm số.');
                return;
            }

            this.currentGradeClassId = String(selectedClassId);
            const diemSos = await this.api.getDiemSoByLopHoc(selectedClassId);
            this.gradeDataByClass.set(String(selectedClassId), diemSos || []);

            this.renderGradeStats(diemSos);
            // this.renderGradeChart(diemSos); // Removed chart
            this.renderGradeTable(selectedClassId, diemSos);
        } catch (error) {
            console.error('Error loading grades section:', error);
            this.renderGradeEmptyState('Không thể tải dữ liệu điểm số. Vui lòng thử lại sau.');
            showNotification('Không thể tải dữ liệu điểm số. Vui lòng thử lại sau.', 'error');
        }
    }

    renderGradeFilters(classes, selectedClassId) {
        const container = document.getElementById('gradeClassFilters');
        if (!container) {
            return;
        }

        if (!classes || classes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Bạn chưa có lớp học nào.</p>
                </div>
            `;
            return;
        }

        const selectedKey = selectedClassId ? String(selectedClassId) : this.currentGradeClassId;

        container.innerHTML = classes.map((cls, index) => {
            const id = cls.idLh ?? cls.id ?? cls.idLop;
            const key = String(id);
            const isActive = selectedKey ? selectedKey === key : index === 0;
            const name = this.escapeHtml(cls.tenLop || `Lớp ${key}`);
            const total = cls.soHocSinh ?? cls.tongHocSinh ?? 0;
            const avg = cls.diemTB ?? (cls.diemTrungBinh ? Number(cls.diemTrungBinh).toFixed(1) : null);
            return `
                <button type="button"
                        class="class-filter-chip ${isActive ? 'active' : ''}"
                        data-class-id="${key}">
                    <strong>${name}</strong>
                    <span>${total} học sinh • Điểm TB: ${avg || '--'}</span>
                </button>
            `;
        }).join('');

        const chips = container.querySelectorAll('.class-filter-chip');
        chips.forEach((chip) => {
            chip.addEventListener('click', async (event) => {
                const classId = event.currentTarget.getAttribute('data-class-id');
                if (!classId) {
                    return;
                }
                chips.forEach((btn) => btn.classList.remove('active'));
                event.currentTarget.classList.add('active');
                await this.loadGradesSection(classId, { preserveSelection: true });
            });
        });
    }

    updateGradeClassSelect(classes, selectedClassId) {
        const select = document.getElementById('classFilter');
        if (!select) {
            return;
        }

        const selectedKey = selectedClassId ? String(selectedClassId) : this.currentGradeClassId;
        const optionsHtml = [
            '<option value="">Tất cả lớp</option>',
            ...(classes || []).map((cls) => {
                const id = cls.idLh ?? cls.id ?? cls.idLop;
                const key = String(id);
                const label = this.escapeHtml(cls.tenLop || `Lớp ${key}`);
                const isSelected = selectedKey && key === selectedKey;
                return `<option value="${key}" ${isSelected ? 'selected' : ''}>${label}</option>`;
            })
        ].join('');

        select.innerHTML = optionsHtml;
    }

    renderGradeStats(diemSos) {
        const avgEl = document.getElementById('gradeAverageValue');
        const totalEl = document.getElementById('gradeStudentCount');
        const excellentEl = document.getElementById('gradeExcellentCount');
        const needsSupportEl = document.getElementById('gradeNeedsSupportCount');

        const list = Array.isArray(diemSos) ? diemSos : [];
        const trungBinhList = list
            .map((item) => parseFloat(item.diemTrungBinh ?? item.diemTB ?? item.diemTongKet))
            .filter((value) => !Number.isNaN(value));

        const average = trungBinhList.length > 0
            ? (trungBinhList.reduce((sum, value) => sum + value, 0) / trungBinhList.length).toFixed(2)
            : '--';

        const excellentCount = list.filter((item) => {
            const rank = (item.xepLoai || '').toLowerCase();
            const score = parseFloat(item.diemTrungBinh ?? item.diemTB ?? item.diemTongKet);
            return rank.includes('giỏi') || rank.includes('gioi') || (!Number.isNaN(score) && score >= 8);
        }).length;

        const needsSupportCount = list.filter((item) => {
            const rank = (item.xepLoai || '').toLowerCase();
            const score = parseFloat(item.diemTrungBinh ?? item.diemTB ?? item.diemTongKet);
            return rank.includes('yếu') || rank.includes('yeu') || rank.includes('kém') || rank.includes('kem')
                || (!Number.isNaN(score) && score < 5);
        }).length;

        if (avgEl) {
            avgEl.textContent = average;
        }
        if (totalEl) {
            totalEl.textContent = list.length.toString();
        }
        if (excellentEl) {
            excellentEl.textContent = excellentCount.toString();
        }
        if (needsSupportEl) {
            needsSupportEl.textContent = needsSupportCount.toString();
        }
    }

    renderGradeChart(diemSos) {
        const container = document.getElementById('gradeDistribution');
        if (!container) {
            return;
        }

        const list = Array.isArray(diemSos) ? diemSos : [];
        const trungBinhList = list
            .map((item) => parseFloat(item.diemTrungBinh ?? item.diemTB ?? item.diemTongKet))
            .filter((value) => !Number.isNaN(value) && value >= 0);

        if (trungBinhList.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Chưa có dữ liệu điểm để hiển thị.</p>
                </div>
            `;
            return;
        }

        const buckets = [
            { label: '0 - 2', min: 0, max: 2, count: 0 },
            { label: '2 - 4', min: 2, max: 4, count: 0 },
            { label: '4 - 6', min: 4, max: 6, count: 0 },
            { label: '6 - 8', min: 6, max: 8, count: 0 },
            { label: '8 - 10', min: 8, max: 10.01, count: 0 }
        ];

        trungBinhList.forEach((score) => {
            const bucket = buckets.find((b) => score >= b.min && score < b.max);
            if (bucket) {
                bucket.count += 1;
            }
        });

        const maxCount = Math.max(...buckets.map((b) => b.count), 1);

        container.innerHTML = `
            <div class="grade-distribution-bars">
                ${buckets.map((bucket) => {
                    const height = Math.round((bucket.count / maxCount) * 100);
                    return `
                        <div class="grade-distribution-bar">
                            <div class="bar-track">
                                <div class="bar-fill" style="height: ${height}%;"></div>
                            </div>
                            <span class="bar-label">${bucket.label}</span>
                            <span class="bar-value">${bucket.count}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderGradeTable(classId, diemSos) {
        const gradesTableBody = document.querySelector('.grades-table tbody');
        if (!gradesTableBody) {
            return;
        }

        const list = Array.isArray(diemSos) ? diemSos : [];
        if (list.length === 0) {
            gradesTableBody.innerHTML = `
                <tr class="placeholder-row">
                    <td colspan="8" class="text-center">Chưa có điểm số cho lớp này.</td>
                </tr>
            `;
            return;
        }

        const classInfo = this.getClassInfo(classId);
        const classLabel = classInfo?.tenLop || `Lớp ${classId}`;

        gradesTableBody.innerHTML = list.map((item, index) => {
            const studentName = item.hoTen || item.tenHocSinh || 'Chưa cập nhật';
            const studentEmail = item.email || item.emailHocSinh || '';
            const studentPhone = item.soDienThoai || item.sdtHocSinh || '';
            const studentId = item.idHs ?? item.hocSinhId ?? item.maHocSinh ?? `HS${index + 1}`;
            const diem15 = this.formatScore(item.diem15Phut ?? item.diem15p);
            const diem45 = this.formatScore(item.diem45Phut ?? item.diem45p);
            const diemHK = this.formatScore(item.diemThiHK ?? item.diemThiHocKy ?? item.diemThi);
            const diemTB = this.formatScore(item.diemTrungBinh ?? item.diemTB ?? item.diemTongKet);
            const xepLoai = item.xepLoai || this.classifyScore(diemTB);
            const badgeClass = this.getGradeBadgeClass(xepLoai, diemTB);
            const initials = getInitials(studentName, studentEmail);

            return `
                <tr>
                    <td>
                        <div class="student-info">
                            <div class="student-avatar">${this.escapeHtml(initials)}</div>
                            <div class="student-meta">
                                <strong>${this.escapeHtml(studentName)}</strong>
                                ${studentEmail ? `<div class="student-sub">${this.escapeHtml(studentEmail)}</div>` : ''}
                                ${studentPhone ? `<div class="student-sub">${this.escapeHtml(studentPhone)}</div>` : ''}
                            </div>
                        </div>
                    </td>
                    <td>${this.escapeHtml(classLabel)}</td>
                    <td>
                        <input type="number" class="grade-input-small"
                               value="${diem15}"
                               min="0" max="10" step="0.1"
                               onchange="updateDiemSo('${classId}', '${studentId}', '15P', this.value)">
                    </td>
                    <td>
                        <input type="number" class="grade-input-small"
                               value="${diem45}"
                               min="0" max="10" step="0.1"
                               onchange="updateDiemSo('${classId}', '${studentId}', '45P', this.value)">
                    </td>
                    <td>
                        <input type="number" class="grade-input-small"
                               value="${diemHK}"
                               min="0" max="10" step="0.1"
                               onchange="updateDiemSo('${classId}', '${studentId}', 'HK', this.value)">
                    </td>
                    <td>${diemTB || '-'}</td>
                    <td><span class="grade-badge ${badgeClass}">${this.escapeHtml(xepLoai || 'Chưa có')}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editGrade('${studentId}', '${classId}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderGradeEmptyState(message) {
        const avgEl = document.getElementById('gradeAverageValue');
        const totalEl = document.getElementById('gradeStudentCount');
        const excellentEl = document.getElementById('gradeExcellentCount');
        const needsSupportEl = document.getElementById('gradeNeedsSupportCount');
        const gradesTableBody = document.querySelector('.grades-table tbody');

        if (avgEl) avgEl.textContent = '--';
        if (totalEl) totalEl.textContent = '--';
        if (excellentEl) excellentEl.textContent = '--';
        if (needsSupportEl) needsSupportEl.textContent = '--';

        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="empty-state">
                    <p>${this.escapeHtml(message || 'Chưa có dữ liệu điểm để hiển thị.')}</p>
                </div>
            `;
        }

        if (gradesTableBody) {
            gradesTableBody.innerHTML = `
                <tr class="placeholder-row">
                    <td colspan="8" class="text-center">${this.escapeHtml(message || 'Chưa có dữ liệu điểm để hiển thị.')}</td>
                </tr>
            `;
        }
    }

    formatScore(value) {
        if (value === null || value === undefined || value === '') {
            return '';
        }
        const number = Number(value);
        if (Number.isNaN(number)) {
            return '';
        }
        return number % 1 === 0 ? number.toFixed(0) : number.toFixed(1);
    }

    classifyScore(scoreText) {
        const score = Number(scoreText);
        if (Number.isNaN(score)) {
            return '';
        }
        if (score >= 8.5) return 'Giỏi';
        if (score >= 7) return 'Khá';
        if (score >= 5.5) return 'Trung bình';
        if (score >= 4) return 'Yếu';
        return 'Kém';
    }

    getGradeBadgeClass(label, scoreText) {
        const normalized = (label || '').toLowerCase();
        if (normalized.includes('giỏi') || normalized.includes('gioi')) {
            return 'excellent';
        }
        if (normalized.includes('khá') || normalized.includes('kha') || normalized.includes('good')) {
            return 'good';
        }
        if (normalized.includes('trung bình') || normalized.includes('trung binh') || normalized.includes('average')) {
            return 'average';
        }
        if (normalized.includes('yếu') || normalized.includes('kem') || normalized.includes('poor') || normalized.includes('yeu')) {
            return 'poor';
        }

        const score = Number(scoreText);
        if (!Number.isNaN(score)) {
            if (score >= 8) return 'excellent';
            if (score >= 6.5) return 'good';
            if (score >= 5) return 'average';
            return 'poor';
        }

        return 'average';
    }

    initializeCalendar() {
        // Calendar initialization logic
        this.updateScheduleCalendar();
    }

    updateScheduleCalendar() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Update calendar header
        const monthNames = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        
        const calendarHeader = document.querySelector('.calendar-header h3');
        if (calendarHeader) {
            calendarHeader.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        }
        
        // Update all schedule headers to current date
        const scheduleHeaders = document.querySelectorAll('h3');
        scheduleHeaders.forEach(header => {
            if (header.textContent.includes('Lịch dạy hôm nay')) {
                header.textContent = `Lịch dạy hôm nay (${now.toLocaleDateString('vi-VN')})`;
            }
        });
    }

    async loadDashboardData() {
        // Load dashboard statistics and data
        await this.loadClassStatistics();
        await this.loadRecentActivities();
        await this.loadUpcomingClasses();
        await this.loadUngradedAssignments();
    }
    
    async loadUngradedAssignments() {
        try {
            const authContext = getAuthContext();
            if (!authContext?.payload?.user?.idNv) {
                return;
            }
            
            // Load all assignments
            const baiTaps = await this.api.getBaiTapByGiaoVien(authContext.payload.user.idNv);
            
            // Count ungraded assignments
            const ungradedCount = baiTaps.reduce((sum, bt) => {
                const ungraded = (bt.soBaiNop || 0) - (bt.soBaiDaCham || 0);
                return sum + (ungraded > 0 ? ungraded : 0);
            }, 0);
            
            // Update ungraded assignments card
            const statCards = document.querySelectorAll('.stat-card');
            if (statCards.length >= 3) {
                const ungradedCard = statCards[2];
                const ungradedCountEl = ungradedCard.querySelector('h3');
                if (ungradedCountEl) {
                    ungradedCountEl.textContent = ungradedCount;
                }
            }
            
            // Update assignments to grade section
            const assignmentList = document.querySelector('.assignment-list');
            if (assignmentList) {
                // Get assignments with ungraded submissions
                const ungradedAssignments = baiTaps
                    .filter(bt => (bt.soBaiNop || 0) > (bt.soBaiDaCham || 0))
                    .slice(0, 2);
                
                if (ungradedAssignments.length === 0) {
                    assignmentList.innerHTML = '<div class="empty-state"><p>Không có bài tập cần chấm</p></div>';
                } else {
                    assignmentList.innerHTML = ungradedAssignments.map(bt => {
                        const progress = bt.soBaiNop > 0 ? Math.round((bt.soBaiDaCham / bt.soBaiNop) * 100) : 0;
                        const endDate = bt.ngayKetThuc ? new Date(bt.ngayKetThuc) : null;
                        const endStr = endDate ? endDate.toLocaleDateString('vi-VN') : 'Chưa có';
                        
                        return `
                            <div class="assignment-item">
                                <div class="assignment-info">
                                    <h4>${bt.tieuDe || 'Chưa có tiêu đề'}</h4>
                                    <p>${bt.tenLop || 'Chưa có lớp'} • ${bt.soBaiNop || 0} bài nộp</p>
                                </div>
                                <div class="assignment-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${progress}%"></div>
                                    </div>
                                    <span>${bt.soBaiDaCham || 0}/${bt.soBaiNop || 0}</span>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }
        } catch (error) {
            console.error('Error loading ungraded assignments:', error);
        }
    }

    async loadClassStatistics() {
        try {
            const authContext = getAuthContext();
            if (!authContext?.payload?.user?.idNv) {
                console.warn('Missing employee ID for loading classes');
                return;
            }

            // Load classes from API
            const classes = await this.api.getTeacherClasses(authContext.payload.user.idNv);
            
            // Calculate statistics
            const totalClasses = classes?.length || 0;
            const totalStudents = classes?.reduce((sum, cls) => sum + (cls.soHocSinh || 0), 0) || 0;
            this.cacheClasses(classes);
            
            // Update dashboard stats cards
            const statCards = document.querySelectorAll('.stat-card');
            if (statCards.length >= 2) {
                // Update "Lớp học" card
                const classCard = statCards[0];
                const classCount = classCard.querySelector('h3');
                if (classCount) {
                    classCount.textContent = totalClasses;
                }
                
                // Update "Học sinh" card
                const studentCard = statCards[1];
                const studentCount = studentCard.querySelector('h3');
                if (studentCount) {
                    studentCount.textContent = totalStudents;
                }
            }

            // Load recent classes
            this.loadRecentClasses(classes);
            
        } catch (error) {
            console.error('Error loading class statistics:', error);
            showNotification('Không thể tải thống kê lớp học. Vui lòng thử lại sau.', 'error');
        }
    }

    loadRecentClasses(classes) {
        if (!classes || classes.length === 0) {
            return;
        }

        // Sort classes by start date (most recent first)
        const sortedClasses = [...classes].sort((a, b) => {
            const dateA = new Date(a.ngayBatDau || 0);
            const dateB = new Date(b.ngayBatDau || 0);
            return dateB - dateA;
        });

        // Take first 3 classes
        const recentClasses = sortedClasses.slice(0, 3);

        // Update "Lớp học gần đây" section
        const classList = document.querySelector('.class-list');
        if (classList) {
            const now = new Date();
            
            classList.innerHTML = recentClasses.map(cls => {
                const startDate = cls.ngayBatDau ? new Date(cls.ngayBatDau) : null;
                let statusClass = 'completed';
                let statusText = 'Đã hoàn thành';
                
                if (startDate) {
                    const diffTime = startDate - now;
                    const diffHours = diffTime / (1000 * 60 * 60);
                    
                    if (diffHours > 0 && diffHours < 24) {
                        statusClass = 'upcoming';
                        statusText = 'Sắp tới';
                    } else if (diffHours <= 0 && diffHours > -2) {
                        statusClass = 'active';
                        statusText = 'Đang dạy';
                    }
                }
                
                // Format date
                const dateStr = startDate ? startDate.toLocaleDateString('vi-VN') : 'Chưa có';
                const timeStr = startDate ? startDate.toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                }) : '';
                
                return `
                    <div class="class-item">
                        <div class="class-info">
                            <h4>${cls.tenLop || 'Chưa có tên'}</h4>
                            <p>${cls.soHocSinh || 0} học sinh • ${dateStr} ${timeStr ? `• ${timeStr}` : ''}</p>
                        </div>
                        <div class="class-status">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    async loadRecentActivities() {
        try {
            const authContext = getAuthContext();
            if (!authContext?.payload?.user?.idNv) {
                return;
            }
            
            // Load recent assignments
            const baiTaps = await this.api.getBaiTapByGiaoVien(authContext.payload.user.idNv);
            
            // Sort by date and take recent 3
            const recentBaiTaps = baiTaps
                .sort((a, b) => new Date(b.ngayBatDau || 0) - new Date(a.ngayBatDau || 0))
                .slice(0, 3);
            
            const activities = recentBaiTaps.map(bt => ({
                type: 'assignment',
                message: `Đã tạo ${window.getLoaiBaiTapLabel ? window.getLoaiBaiTapLabel(bt.loaiBt) : bt.loaiBt}: ${bt.tieuDe}`,
                time: bt.ngayBatDau ? this.getTimeAgo(new Date(bt.ngayBatDau)) : 'Chưa có'
            }));
            
            const activitiesContainer = document.getElementById('recentActivities');
            if (activitiesContainer) {
                if (activities.length === 0) {
                    activitiesContainer.innerHTML = '<div class="empty-state"><p>Chưa có hoạt động gần đây</p></div>';
                } else {
                    activitiesContainer.innerHTML = activities.map(activity => `
                        <div class="activity-item">
                            <div class="activity-icon">
                                <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                            </div>
                            <div class="activity-content">
                                <p>${activity.message}</p>
                                <span class="activity-time">${activity.time}</span>
                            </div>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading recent activities:', error);
        }
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} ngày trước`;
        if (hours > 0) return `${hours} giờ trước`;
        if (minutes > 0) return `${minutes} phút trước`;
        return 'Vừa xong';
    }

    async loadUpcomingClasses() {
        try {
            const authContext = getAuthContext();
            if (!authContext?.payload?.user?.idNv) {
                return;
            }
            
            // Load today's schedule
            const buoiHocs = await this.api.getBuoiHocByGiaoVien(authContext.payload.user.idNv);
            
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            // Filter upcoming classes for today
            const upcomingClasses = buoiHocs
                .filter(bh => {
                    if (!bh.ngayHoc || !bh.gioBatDau) return false;
                    const sessionDate = new Date(bh.ngayHoc);
                    sessionDate.setHours(0, 0, 0, 0);
                    return sessionDate.getTime() === today.getTime() && new Date(bh.gioBatDau) > now;
                })
                .sort((a, b) => new Date(a.gioBatDau) - new Date(b.gioBatDau))
                .slice(0, 3);
            
            const upcomingContainer = document.getElementById('upcomingClasses');
            if (upcomingContainer) {
                if (upcomingClasses.length === 0) {
                    upcomingContainer.innerHTML = '<div class="empty-state"><p>Không có lớp học sắp tới hôm nay</p></div>';
                } else {
                    upcomingContainer.innerHTML = upcomingClasses.map(bh => {
                        const gioBatDau = bh.gioBatDau ? new Date(bh.gioBatDau) : null;
                        const timeStr = gioBatDau ? gioBatDau.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa có';
                        
                        return `
                            <div class="upcoming-class">
                                <div class="class-time">${timeStr}</div>
                                <div class="class-info">
                                    <h4>${bh.tenLop || 'Chưa có tên'}</h4>
                                    <p>${bh.tenCaHoc || 'Chưa có'}</p>
                                    <span class="class-room">${bh.tenPhong || 'Chưa có phòng'}</span>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }
        } catch (error) {
            console.error('Error loading upcoming classes:', error);
        }
    }

    initializeCharts() {
        // Initialize charts if needed
        // This would integrate with Chart.js or similar library
    }

    initializeRealTimeUpdates() {
        // Initialize real-time updates
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 60000); // Update every minute
    }

    updateCurrentTime() {
        const now = new Date();
        const timeElement = document.getElementById('currentTime');
        const dateElement = document.getElementById('currentDate');
        
        if (timeElement) {
            const timeString = now.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
            timeElement.textContent = timeString;
        }
        
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('vi-VN');
        }
    }

    searchStudents(query) {
        // Implement student search functionality
        console.log('Searching students:', query);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    getActivityIcon(type) {
        const icons = {
            assignment: 'file-alt',
            grade: 'check-circle',
            message: 'envelope',
            attendance: 'user-check'
        };
        return icons[type] || 'info-circle';
    }
    
    async loadClassFilterOptions() {
        try {
            const authContext = getAuthContext();
            if (!authContext?.payload?.user?.idNv) {
                return;
            }
            
            const classes = await this.api.getTeacherClasses(authContext.payload.user.idNv);
            const classFilter = document.getElementById('classFilter');
            
            if (classFilter && classes) {
                const currentValue = classFilter.value;
                classFilter.innerHTML = '<option value="">Tất cả lớp</option>' + 
                    classes.map(c => `<option value="${c.idLh}">${c.tenLop}</option>`).join('');
                
                if (currentValue) {
                    classFilter.value = currentValue;
                }
            }
        } catch (error) {
            console.error('Error loading class filter options:', error);
        }
    }
}

// ===== REAL-TIME MESSAGES CLASS =====
class RealTimeMessages {
    constructor() {
        this.connectionStatus = 'connected';
        this.messages = [];
        this.init();
    }

    init() {
        this.updateConnectionStatus();
        this.loadMessages();
        this.setupEventListeners();
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.className = `connection-status ${this.connectionStatus}`;
            statusElement.textContent = this.getConnectionStatusText();
        }
    }

    getConnectionStatusText() {
        const statusTexts = {
            connected: 'Đã kết nối',
            connecting: 'Đang kết nối...',
            disconnected: 'Mất kết nối'
        };
        return statusTexts[this.connectionStatus] || 'Không xác định';
    }

    loadMessages() {
        // Mock messages data
        this.messages = [
            { id: 1, sender: 'Nguyễn Văn An (Học sinh)', subject: 'Hỏi về bài tập', content: 'Thầy ơi, em không hiểu bài tập số 3...', time: '10:30', type: 'unread', senderType: 'student' },
            { id: 2, sender: 'Trần Thị Bình (Phụ huynh)', subject: 'Xin nghỉ học', content: 'Con tôi bị ốm, xin phép nghỉ học ngày mai', time: '09:15', type: 'read', senderType: 'parent' },
            { id: 3, sender: 'Admin hệ thống', subject: 'Thông báo cập nhật', content: 'Hệ thống sẽ được cập nhật vào cuối tuần', time: '08:00', type: 'important', senderType: 'admin' },
            { id: 4, sender: 'Lê Văn Cường (Học sinh)', subject: 'Nộp bài tập muộn', content: 'Em xin lỗi vì nộp bài tập muộn', time: '07:45', type: 'read', senderType: 'student' }
        ];
    }

    setupEventListeners() {
        // Setup message event listeners
    }

    addMessage(message) {
        this.messages.unshift(message);
        this.updateMessageDisplay();
    }

    updateMessageDisplay() {
        // Update message display in UI
    }
}

// ===== REAL-TIME SCHEDULE CLASS =====
class RealTimeSchedule {
    constructor() {
        this.scheduleData = [];
        this.init();
    }

    init() {
        this.loadScheduleData();
        this.updateCurrentTime();
    }

    loadScheduleData() {
        // Mock schedule data
        this.scheduleData = [
            { id: 1, time: '8:00-9:30', subject: 'Toán 10A1', topic: 'Phương trình bậc hai', room: 'A101', status: 'completed' },
            { id: 2, time: '10:00-11:30', subject: 'Toán 11B2', topic: 'Hệ phương trình', room: 'B202', status: 'active' },
            { id: 3, time: '14:00-15:30', subject: 'Toán 12C1', topic: 'Giải tích', room: 'C303', status: 'upcoming' }
        ];
    }

    updateCurrentTime() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        if (!this.scheduleData || !Array.isArray(this.scheduleData)) {
            return;
        }
        
        this.scheduleData.forEach(item => {
            // Validate item.time exists and is a string
            if (!item || !item.time || typeof item.time !== 'string') {
                return; // Skip invalid items
            }
            
            try {
                // Support both '8:00-9:30' and '8:00 - 9:30' formats
                const timeParts = item.time.includes(' - ') 
                    ? item.time.split(' - ') 
                    : item.time.split('-');
                if (timeParts.length !== 2) {
                    return; // Skip invalid time format
                }
                
                const [startTime, endTime] = timeParts;
                const startParts = startTime.split(':');
                const endParts = endTime.split(':');
                
                if (startParts.length !== 2 || endParts.length !== 2) {
                    return; // Skip invalid time format
                }
                
                const [startHour, startMin] = startParts.map(Number);
                const [endHour, endMin] = endParts.map(Number);
                
                // Validate numbers are valid
                if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
                    return; // Skip invalid numbers
                }
                
                const startMinutes = startHour * 60 + startMin;
                const endMinutes = endHour * 60 + endMin;
                
                if (currentTime >= startMinutes && currentTime <= endMinutes) {
                    item.status = 'active';
                } else if (currentTime < startMinutes) {
                    item.status = 'upcoming';
                } else {
                    item.status = 'completed';
                }
            } catch (error) {
                console.warn('Error processing schedule item:', item, error);
            }
        });
    }
}

// ===== GLOBAL FUNCTIONS =====
// Tất cả các hàm chức năng cho teacher dashboard

// ===== CLASS MANAGEMENT FUNCTIONS =====
window.openClassManagement = function(classId) {
    console.log('Opening class management for class:', classId);
    
    const classNames = {
        1: 'Toán 10A1',
        2: 'Toán 11B2',
        3: 'Toán 12C1'
    };
    
    const className = classNames[classId] || `Lớp ${classId}`;
    const modal = document.getElementById('classManagementModal');
    const titleElement = document.getElementById('classManagementTitle');
    
    if (titleElement) {
        titleElement.textContent = `Quản lý lớp học - ${className}`;
    }
    
    if (modal) {
        modal.classList.add('active');
        // Load data after modal is shown
        setTimeout(() => {
            loadClassManagementData(classId);
        }, 100);
    }
};

window.loadClassManagementData = function(classId) {
    console.log('Loading class management data for class:', classId);
    
    // Load attendance data
    loadAttendanceData(classId);
    
    // Load grading data  
    loadGradingData(classId);
    
    // Load evaluation data
    loadEvaluationData(classId);
    
    // Set default active tab
    showManagementTab('attendance');
};

window.showManagementTab = function(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Update button states
    const buttons = document.querySelectorAll('.management-tabs .tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const activeButton = document.querySelector(`[onclick="showManagementTab('${tabName}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Update content visibility
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.style.display = 'none');
    
    const activeContent = document.getElementById(`${tabName}Tab`);
    if (activeContent) {
        activeContent.style.display = 'block';
    }
};

window.loadAttendanceData = function(classId) {
    console.log('Loading attendance data for class:', classId);
    
    const classNames = {
        1: 'Toán 10A1',
        2: 'Toán 11B2', 
        3: 'Toán 12C1'
    };
    
    const className = classNames[classId] || `Lớp ${classId}`;
    const attendanceContainer = document.getElementById('attendanceList');
    
    if (attendanceContainer) {
        const students = [
            { id: 1, name: 'Nguyễn Văn An', studentId: 'HS001', status: 'present', time: '08:00', note: '' },
            { id: 2, name: 'Trần Thị Bình', studentId: 'HS002', status: 'present', time: '08:02', note: '' },
            { id: 3, name: 'Lê Văn Cường', studentId: 'HS003', status: 'absent', time: '', note: 'Nghỉ ốm' },
            { id: 4, name: 'Phạm Thị Dung', studentId: 'HS004', status: 'present', time: '08:01', note: '' },
            { id: 5, name: 'Hoàng Văn Em', studentId: 'HS005', status: 'late', time: '08:15', note: 'Xe hỏng' },
            { id: 6, name: 'Vũ Thị Phương', studentId: 'HS006', status: 'present', time: '08:00', note: '' },
            { id: 7, name: 'Đặng Văn Giang', studentId: 'HS007', status: 'present', time: '08:03', note: '' },
            { id: 8, name: 'Bùi Thị Hoa', studentId: 'HS008', status: 'absent', time: '', note: 'Có việc gia đình' },
            { id: 9, name: 'Ngô Văn Ích', studentId: 'HS009', status: 'present', time: '08:00', note: '' },
            { id: 10, name: 'Đinh Thị Kim', studentId: 'HS010', status: 'present', time: '08:01', note: '' }
        ];
        
        const html = `
            <div class="attendance-header">
                <h3>Điểm danh lớp ${className} - ${new Date().toLocaleDateString('vi-VN')}</h3>
                <div class="attendance-stats">
                    <div class="stat-item">
                        <span class="stat-number">8</span>
                        <span class="stat-label">Có mặt</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">2</span>
                        <span class="stat-label">Vắng mặt</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">1</span>
                        <span class="stat-label">Đi muộn</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">10</span>
                        <span class="stat-label">Tổng số</span>
                    </div>
                </div>
                <div class="attendance-actions">
                    <button class="btn btn-success" onclick="markAllPresent()">
                        <i class="fas fa-check"></i> Điểm danh tất cả
                    </button>
                    <button class="btn btn-warning" onclick="markAllAbsent()">
                        <i class="fas fa-times"></i> Đánh dấu vắng tất cả
                    </button>
                    <button class="btn btn-primary" onclick="exportAttendance(${classId})">
                        <i class="fas fa-download"></i> Xuất báo cáo
                    </button>
                </div>
            </div>
            <div class="attendance-table">
                <div class="table-header">
                    <div class="col-checkbox">✓</div>
                    <div class="col-name">Họ và tên</div>
                    <div class="col-id">Mã HS</div>
                    <div class="col-status">Trạng thái</div>
                    <div class="col-time">Thời gian</div>
                    <div class="col-note">Ghi chú</div>
                </div>
                ${students.map(student => `
                    <div class="table-row">
                        <div class="col-checkbox">
                            <input type="checkbox" class="student-checkbox" 
                                   ${student.status === 'present' ? 'checked' : ''} 
                                   onchange="toggleAttendance(${student.id})">
                        </div>
                        <div class="col-name">
                            <div class="student-info">
                                <div class="student-name">${student.name}</div>
                            </div>
                        </div>
                        <div class="col-id">${student.studentId}</div>
                        <div class="col-status">
                            <span class="status-badge ${student.status}">
                                ${student.status === 'present' ? 'Có mặt' : 
                                  student.status === 'absent' ? 'Vắng mặt' : 'Đi muộn'}
                            </span>
                        </div>
                        <div class="col-time">${student.time}</div>
                        <div class="col-note">
                            <input type="text" class="note-input" value="${student.note}" 
                                   placeholder="Ghi chú...">
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        attendanceContainer.innerHTML = html;
    }
};

window.loadGradingData = function(classId) {
    console.log('Loading grading data for class:', classId);
    
    const classNames = {
        1: 'Toán 10A1',
        2: 'Toán 11B2',
        3: 'Toán 12C1'
    };
    
    const className = classNames[classId] || `Lớp ${classId}`;
    const gradingContainer = document.getElementById('gradingList');
    
    if (gradingContainer) {
        const assignments = [
            { id: 1, name: 'Bài tập 1: Phương trình bậc hai', dueDate: '15/10/2025', totalStudents: 10, graded: 8 },
            { id: 2, name: 'Bài tập 2: Hệ phương trình', dueDate: '20/10/2025', totalStudents: 10, graded: 5 },
            { id: 3, name: 'Bài kiểm tra 15 phút', dueDate: '25/10/2025', totalStudents: 10, graded: 0 }
        ];
        
        const students = [
            { id: 1, name: 'Nguyễn Văn An', studentId: 'HS001' },
            { id: 2, name: 'Trần Thị Bình', studentId: 'HS002' },
            { id: 3, name: 'Lê Văn Cường', studentId: 'HS003' },
            { id: 4, name: 'Phạm Thị Dung', studentId: 'HS004' },
            { id: 5, name: 'Hoàng Văn Em', studentId: 'HS005' }
        ];
        
        const html = `
            <div class="grading-header">
                <h3>Chấm điểm lớp ${className} - ${new Date().toLocaleDateString('vi-VN')}</h3>
                <div class="grading-stats">
                    <div class="stat-item">
                        <span class="stat-number">3</span>
                        <span class="stat-label">Bài tập</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">13</span>
                        <span class="stat-label">Đã chấm</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">17</span>
                        <span class="stat-label">Chưa nộp</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">7.5</span>
                        <span class="stat-label">Điểm TB</span>
                    </div>
                </div>
                <div class="grading-actions">
                    <button class="btn btn-primary" onclick="bulkGrading()">
                        <i class="fas fa-edit"></i> Chấm hàng loạt
                    </button>
                    <button class="btn btn-success" onclick="exportReport()">
                        <i class="fas fa-download"></i> Xuất báo cáo
                    </button>
                </div>
            </div>
            <div class="grading-content">
                <div class="assignments-section">
                    <h4>Danh sách bài tập</h4>
                    <div class="assignments-list">
                        ${assignments.map(assignment => `
                            <div class="assignment-item">
                                <div class="assignment-info">
                                    <h5>${assignment.name}</h5>
                                    <p>Hạn nộp: ${assignment.dueDate}</p>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${(assignment.graded / assignment.totalStudents) * 100}%"></div>
                                    </div>
                                    <span class="progress-text">${assignment.graded}/${assignment.totalStudents} đã chấm</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="students-section">
                    <h4>Điểm số học sinh</h4>
                    <div class="students-grading">
                        ${students.map(student => `
                            <div class="student-grade-item">
                                <div class="student-info">
                                    <span class="student-name">${student.name}</span>
                                    <span class="student-id">${student.studentId}</span>
                                </div>
                                <div class="grade-inputs">
                                    <input type="number" class="grade-input" placeholder="Điểm" min="0" max="10" step="0.1">
                                    <span class="status-badge graded">Đã chấm</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        gradingContainer.innerHTML = html;
    }
};

window.loadEvaluationData = function(classId) {
    console.log('Loading evaluation data for class:', classId);
    
    const classNames = {
        1: 'Toán 10A1',
        2: 'Toán 11B2',
        3: 'Toán 12C1'
    };
    
    const className = classNames[classId] || `Lớp ${classId}`;
    const evaluationContainer = document.getElementById('evaluationList');
    
    if (evaluationContainer) {
        const evaluations = [
            { id: 1, student: 'Nguyễn Văn An', type: 'positive', content: 'Học tập tích cực, tham gia phát biểu nhiều', date: '10/10/2025' },
            { id: 2, student: 'Trần Thị Bình', type: 'improvement', content: 'Cần cải thiện kỹ năng giải bài tập', date: '08/10/2025' },
            { id: 3, student: 'Lê Văn Cường', type: 'warning', content: 'Thường xuyên vắng mặt, cần chú ý', date: '05/10/2025' },
            { id: 4, student: 'Phạm Thị Dung', type: 'positive', content: 'Kết quả học tập tốt, có tiến bộ', date: '12/10/2025' },
            { id: 5, student: 'Hoàng Văn Em', type: 'improvement', content: 'Cần tập trung hơn trong giờ học', date: '09/10/2025' }
        ];
        
        const students = [
            { id: 1, name: 'Nguyễn Văn An', evaluations: 3, lastEvaluation: '12/10/2025' },
            { id: 2, name: 'Trần Thị Bình', evaluations: 2, lastEvaluation: '08/10/2025' },
            { id: 3, name: 'Lê Văn Cường', evaluations: 1, lastEvaluation: '05/10/2025' },
            { id: 4, name: 'Phạm Thị Dung', evaluations: 4, lastEvaluation: '12/10/2025' },
            { id: 5, name: 'Hoàng Văn Em', evaluations: 2, lastEvaluation: '09/10/2025' }
        ];
        
        const html = `
            <div class="evaluation-header">
                <h3>Đánh giá lớp ${className} - ${new Date().toLocaleDateString('vi-VN')}</h3>
                <div class="evaluation-stats">
                    <div class="stat-item">
                        <span class="stat-number">5</span>
                        <span class="stat-label">Đánh giá</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">2</span>
                        <span class="stat-label">Tích cực</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">2</span>
                        <span class="stat-label">Cần cải thiện</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">1</span>
                        <span class="stat-label">Cảnh báo</span>
                    </div>
                </div>
                <div class="evaluation-actions">
                    <button class="btn btn-primary" onclick="addEvaluation()">
                        <i class="fas fa-plus"></i> Thêm đánh giá
                    </button>
                    <button class="btn btn-success" onclick="exportReport()">
                        <i class="fas fa-download"></i> Xuất báo cáo
                    </button>
                </div>
            </div>
            <div class="evaluation-content">
                <div class="recent-evaluations">
                    <h4>Đánh giá gần đây</h4>
                    <div class="evaluations-list">
                        ${evaluations.map(evaluation => `
                            <div class="evaluation-item ${evaluation.type}">
                                <div class="evaluation-content">
                                    <h5>${evaluation.student}</h5>
                                    <p>${evaluation.content}</p>
                                    <div class="evaluation-meta">
                                        <span class="evaluation-date">${evaluation.date}</span>
                                        <span class="evaluation-teacher">Giáo viên: Nguyễn Văn A</span>
                                    </div>
                                </div>
                                <div class="evaluation-actions">
                                    <button class="btn-icon" onclick="editEvaluation(${evaluation.id})" title="Chỉnh sửa">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" onclick="deleteEvaluation(${evaluation.id})" title="Xóa">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="students-evaluation">
                    <h4>Tổng kết đánh giá học sinh</h4>
                    <div class="students-evaluation-list">
                        ${students.map(student => `
                            <div class="student-evaluation-item">
                                <div class="student-info">
                                    <span class="student-name">${student.name}</span>
                                </div>
                                <div class="evaluation-count">
                                    <span class="count">${student.evaluations}</span>
                                    <span class="label">đánh giá</span>
                                </div>
                                <div class="last-evaluation">
                                    <span class="date">${student.lastEvaluation}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        evaluationContainer.innerHTML = html;
    }
};

// ===== ATTENDANCE FUNCTIONS =====
window.toggleAttendance = function(studentId) {
    console.log('Toggling attendance for student:', studentId);
    showNotification('Đã cập nhật trạng thái điểm danh!', 'success');
};

window.markAllPresent = function() {
    console.log('Marking all students present');
    showNotification('Đã điểm danh tất cả học sinh!', 'success');
};

window.markAllAbsent = function() {
    console.log('Marking all students absent');
    showNotification('Đã đánh dấu vắng tất cả học sinh!', 'warning');
};

window.exportAttendance = function(classId) {
    console.log('Exporting attendance for class:', classId);
    
    // Tạo dữ liệu CSV cho điểm danh
    const csvContent = `Lớp Toán 11B2 - Báo cáo điểm danh ${new Date().toLocaleDateString('vi-VN')}
STT,Họ và tên,Mã học sinh,Trạng thái,Thời gian,Ghi chú
1,Nguyễn Văn An,HS001,Có mặt,08:00,
2,Trần Thị Bình,HS002,Có mặt,08:02,
3,Lê Văn Cường,HS003,Vắng mặt,,Nghỉ ốm
4,Phạm Thị Dung,HS004,Có mặt,08:01,
5,Hoàng Văn Em,HS005,Đi muộn,08:15,Xe hỏng
6,Vũ Thị Phương,HS006,Có mặt,08:00,
7,Đặng Văn Giang,HS007,Có mặt,08:03,
8,Bùi Thị Hoa,HS008,Vắng mặt,,Có việc gia đình
9,Ngô Văn Ích,HS009,Có mặt,08:00,
10,Đinh Thị Kim,HS010,Có mặt,08:01,

Tổng kết:
- Có mặt: 8 học sinh
- Vắng mặt: 2 học sinh  
- Đi muộn: 1 học sinh
- Tổng số: 10 học sinh
- Tỷ lệ có mặt: 80%`;
    
    // Tạo và tải file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `DiemDanh_Toan11B2_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Đã xuất báo cáo điểm danh thành công!', 'success');
};

// ===== GRADING FUNCTIONS =====
window.updateGrade = function() {
    console.log('Updating grade');
    showNotification('Đã cập nhật điểm!', 'success');
};

window.addQuickGrade = function() {
    console.log('Adding quick grade');
    showNotification('Đã thêm điểm nhanh!', 'success');
};

window.bulkGrading = function() {
    console.log('Bulk grading');
    showNotification('Đã chấm hàng loạt!', 'success');
};

// ===== EVALUATION FUNCTIONS =====
window.addEvaluation = function() {
    console.log('Adding evaluation');
    showNotification('Đã thêm đánh giá!', 'success');
};

window.editEvaluation = function(evaluationId) {
    console.log('Editing evaluation:', evaluationId);
    showNotification('Đã chỉnh sửa đánh giá!', 'success');
};

window.deleteEvaluation = function(evaluationId) {
    console.log('Deleting evaluation:', evaluationId);
    showNotification('Đã xóa đánh giá!', 'success');
};

window.exportEvaluations = function() {
    console.log('Exporting evaluations');
    showNotification('Đã xuất báo cáo đánh giá!', 'success');
};

// ===== CLASS DETAILS FUNCTIONS =====
window.viewClassDetails = function(classId) {
    console.log('Viewing class details for:', classId);
    
    const classNames = {
        1: 'Toán 10A1',
        2: 'Toán 11B2',
        3: 'Toán 12C1'
    };
    
    const className = classNames[classId] || `Lớp ${classId}`;
    const titleElement = document.getElementById('classDetailsTitle');
    
    if (titleElement) {
        titleElement.textContent = `Chi tiết lớp học - ${className}`;
    }
    
    // Load sessions data
    loadSessionsData(classId);
    
    // Show modal
    const modal = document.getElementById('classDetailsModal');
    if (modal) {
        modal.classList.add('active');
    }
};

window.loadSessionsData = function(classId) {
    console.log('Loading sessions data for class:', classId);
    
    const sessionsList = document.getElementById('sessionsList');
    if (sessionsList) {
        const sessions = [
            { id: 1, date: '12/10/2025', time: '8:00-9:30', topic: 'Phương trình bậc hai', status: 'completed' },
            { id: 2, date: '14/10/2025', time: '8:00-9:30', topic: 'Hệ phương trình', status: 'upcoming' },
            { id: 3, date: '16/10/2025', time: '8:00-9:30', topic: 'Bất phương trình', status: 'upcoming' }
        ];
        
        sessionsList.innerHTML = sessions.map(session => `
            <div class="session-item">
                <div class="session-date">${session.date}</div>
                <div class="session-time">${session.time}</div>
                <div class="session-topic">${session.topic}</div>
                <div class="session-status ${session.status}">${getSessionStatusText(session.status)}</div>
                <div class="session-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewSessionDetails(${session.id})">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                </div>
            </div>
        `).join('');
    }
};

window.showClassTab = function(tabName) {
    console.log('Switching to class tab:', tabName);
    
    // Update button states
    const buttons = document.querySelectorAll('.class-tabs .tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const activeButton = document.querySelector(`[onclick="showClassTab('${tabName}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Update content visibility
    const contents = document.querySelectorAll('.class-tab-content');
    contents.forEach(content => content.style.display = 'none');
    
    const activeContent = document.getElementById(`${tabName}Content`);
    if (activeContent) {
        activeContent.style.display = 'block';
    }
    
    // Load data for the tab
    if (tabName === 'students') {
        loadClassStudentsData();
    } else if (tabName === 'assignments') {
        loadClassAssignmentsData();
    }
};

window.loadClassStudentsData = function() {
    console.log('Loading class students data');
    
    const studentsList = document.getElementById('studentsList');
    if (studentsList) {
        const students = [
            { id: 1, name: 'Nguyễn Văn An', studentId: 'HS001', grade: 8.5, attendance: 95 },
            { id: 2, name: 'Trần Thị Bình', studentId: 'HS002', grade: 7.8, attendance: 90 },
            { id: 3, name: 'Lê Văn Cường', studentId: 'HS003', grade: 6.2, attendance: 75 },
            { id: 4, name: 'Phạm Thị Dung', studentId: 'HS004', grade: 9.1, attendance: 98 },
            { id: 5, name: 'Hoàng Văn Em', studentId: 'HS005', grade: 7.5, attendance: 85 },
            { id: 6, name: 'Vũ Thị Phương', studentId: 'HS006', grade: 8.8, attendance: 92 },
            { id: 7, name: 'Đặng Văn Giang', studentId: 'HS007', grade: 6.9, attendance: 80 }
        ];
        
        studentsList.innerHTML = `
            <div class="students-header">
                <h4>Danh sách học sinh (${students.length} học sinh)</h4>
                <button class="btn btn-primary" onclick="addStudent()">
                    <i class="fas fa-plus"></i> Thêm học sinh
                </button>
            </div>
            <div class="students-table">
                <div class="table-header">
                    <div class="col-name">Họ và tên</div>
                    <div class="col-id">Mã HS</div>
                    <div class="col-grade">Điểm TB</div>
                    <div class="col-attendance">Tỷ lệ có mặt</div>
                    <div class="col-actions">Thao tác</div>
                </div>
                ${students.map(student => `
                    <div class="table-row">
                        <div class="col-name">
                            <div class="student-info">
                                <div class="student-avatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="student-name">${student.name}</div>
                            </div>
                        </div>
                        <div class="col-id">${student.studentId}</div>
                        <div class="col-grade">
                            <span class="grade-badge ${student.grade >= 8 ? 'good' : student.grade >= 6.5 ? 'average' : 'poor'}">
                                ${student.grade}
                            </span>
                        </div>
                        <div class="col-attendance">
                            <span class="status-badge ${student.attendance >= 90 ? 'present' : student.attendance >= 80 ? 'late' : 'absent'}">
                                ${student.attendance}%
                            </span>
                        </div>
                        <div class="col-actions">
                            <button class="btn-icon" onclick="editStudent(${student.id})" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="removeStudent(${student.id})" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

window.loadClassAssignmentsData = function() {
    console.log('Loading class assignments data');
    
    const assignmentsList = document.getElementById('assignmentsList');
    if (assignmentsList) {
        const assignments = [
            { id: 1, name: 'Bài tập 1: Phương trình bậc hai', dueDate: '15/10/2025', progress: 80, status: 'active' },
            { id: 2, name: 'Bài tập 2: Hệ phương trình', dueDate: '20/10/2025', progress: 60, status: 'active' },
            { id: 3, name: 'Bài kiểm tra 15 phút', dueDate: '25/10/2025', progress: 0, status: 'upcoming' },
            { id: 4, name: 'Bài tập 3: Bất phương trình', dueDate: '30/10/2025', progress: 0, status: 'upcoming' },
            { id: 5, name: 'Bài tập 4: Ôn tập chương', dueDate: '05/11/2025', progress: 0, status: 'upcoming' }
        ];
        
        assignmentsList.innerHTML = `
            <div class="assignments-header">
                <h4>Danh sách bài tập (${assignments.length} bài tập)</h4>
                <button class="btn btn-primary" onclick="createAssignmentForClass()">
                    <i class="fas fa-plus"></i> Tạo bài tập mới
                </button>
            </div>
            <div class="assignments-grid">
                ${assignments.map(assignment => `
                    <div class="assignment-card ${assignment.status}">
                        <div class="assignment-type">
                            <i class="fas fa-file-alt"></i>
                            ${assignment.status === 'active' ? 'Đang hoạt động' : 
                              assignment.status === 'upcoming' ? 'Sắp tới' : 'Hoàn thành'}
                        </div>
                        <h5>${assignment.name}</h5>
                        <p class="due-date">Hạn nộp: ${assignment.dueDate}</p>
                        <div class="assignment-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${assignment.progress}%"></div>
                            </div>
                            <span class="progress-text">${assignment.progress}% hoàn thành</span>
                        </div>
                        <div class="assignment-actions">
                            <button class="btn btn-sm btn-primary" onclick="viewAssignment(${assignment.id})">
                                <i class="fas fa-eye"></i> Xem
                            </button>
                            <button class="btn btn-sm btn-success" onclick="gradeAssignment(${assignment.id})">
                                <i class="fas fa-check"></i> Chấm
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// ===== SESSION FUNCTIONS =====
window.viewSessionDetails = function(sessionId) {
    console.log('Viewing session details:', sessionId);
    
    const modal = document.getElementById('sessionDetailsModal');
    if (modal) {
        modal.classList.add('active');
        
        // Load session data
        const sessionContent = document.getElementById('sessionContent');
        if (sessionContent) {
            sessionContent.innerHTML = `
                <div class="session-info">
                    <h3>Buổi học: Phương trình bậc hai</h3>
                    <p><strong>Ngày:</strong> 12/10/2025</p>
                    <p><strong>Thời gian:</strong> 8:00 - 9:30</p>
                    <p><strong>Lớp:</strong> Toán 11B2</p>
                </div>
                
                <div class="session-comments">
                    <h4>Nhận xét buổi học</h4>
                    <div class="comment-item">
                        <p>Học sinh tham gia tích cực, hiểu bài tốt. Cần chú ý thêm về cách giải phương trình có tham số.</p>
                        <span class="comment-date">12/10/2025 9:30</span>
                    </div>
                </div>
                
                <div class="session-homework">
                    <h4>Bài tập về nhà</h4>
                    <div class="homework-item">
                        <p>Làm bài tập 1, 2, 3 trang 45-46 sách giáo khoa</p>
                        <p>Chuẩn bị bài mới: Hệ phương trình</p>
                        <span class="homework-date">Giao ngày: 12/10/2025</span>
                    </div>
                </div>
            `;
        }
    }
};

window.addSessionComment = function() {
    console.log('Adding session comment');
    showNotification('Đã thêm nhận xét buổi học!', 'success');
};

window.addHomework = function() {
    console.log('Adding homework');
    showNotification('Đã thêm bài tập về nhà!', 'success');
};

window.exportSessionReport = function() {
    console.log('Exporting session report');
    showNotification('Đã xuất báo cáo buổi học!', 'success');
};

window.addNewSession = function() {
    console.log('Adding new session');
    showNotification('Đã thêm buổi học mới!', 'success');
};

window.createAssignmentForClass = function() {
    console.log('Creating assignment for class');
    showNotification('Đã tạo bài tập cho lớp!', 'success');
};

// ===== MESSAGE FUNCTIONS =====
window.viewMessages = function() {
    console.log('Viewing messages');
    
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
        const messages = [
            { id: 1, sender: 'Nguyễn Văn An (Học sinh)', subject: 'Hỏi về bài tập', content: 'Thầy ơi, em không hiểu bài tập số 3...', time: '10:30', type: 'unread', senderType: 'student' },
            { id: 2, sender: 'Trần Thị Bình (Phụ huynh)', subject: 'Xin nghỉ học', content: 'Con tôi bị ốm, xin phép nghỉ học ngày mai', time: '09:15', type: 'read', senderType: 'parent' },
            { id: 3, sender: 'Admin hệ thống', subject: 'Thông báo cập nhật', content: 'Hệ thống sẽ được cập nhật vào cuối tuần', time: '08:00', type: 'important', senderType: 'admin' },
            { id: 4, sender: 'Lê Văn Cường (Học sinh)', subject: 'Nộp bài tập muộn', content: 'Em xin lỗi vì nộp bài tập muộn', time: '07:45', type: 'read', senderType: 'student' }
        ];
        
        messagesContainer.innerHTML = `
            <div class="messages-header">
                <h3>Tin nhắn (${messages.length} tin nhắn)</h3>
                <div class="message-stats">
                    <div class="stat-item">
                        <span class="stat-number">${messages.length}</span>
                        <span class="stat-label">Tổng</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${messages.filter(m => m.type === 'unread').length}</span>
                        <span class="stat-label">Chưa đọc</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${messages.filter(m => m.time.includes('10:') || m.time.includes('09:')).length}</span>
                        <span class="stat-label">Hôm nay</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${messages.filter(m => m.type === 'important').length}</span>
                        <span class="stat-label">Quan trọng</span>
                    </div>
                </div>
            </div>
            
            <div class="message-filters">
                <button class="filter-btn active" onclick="filterMessages('all')">Tất cả</button>
                <button class="filter-btn" onclick="filterMessages('unread')">Chưa đọc</button>
                <button class="filter-btn" onclick="filterMessages('students')">Học sinh</button>
                <button class="filter-btn" onclick="filterMessages('parents')">Phụ huynh</button>
                <button class="filter-btn" onclick="filterMessages('admin')">Admin</button>
                <button class="filter-btn" onclick="filterMessages('important')">Quan trọng</button>
            </div>
            
            <div class="messages-list">
                ${messages.map(message => `
                    <div class="message-item ${message.type}" data-sender-type="${message.senderType}">
                        <div class="message-header">
                            <div class="message-sender">${message.sender}</div>
                            <div class="message-time">${message.time}</div>
                        </div>
                        <div class="message-subject">${message.subject}</div>
                        <div class="message-content">${message.content}</div>
                        <div class="message-actions">
                            <button class="btn btn-sm btn-primary" onclick="viewMessage(${message.id})">
                                <i class="fas fa-eye"></i> Xem
                            </button>
                            <button class="btn btn-sm btn-success" onclick="replyMessage(${message.id})">
                                <i class="fas fa-reply"></i> Trả lời
                            </button>
                            ${message.type === 'unread' ? 
                                `<button class="btn btn-sm btn-warning" onclick="markAsRead(${message.id})">
                                    <i class="fas fa-check"></i> Đánh dấu đã đọc
                                </button>` :
                                `<button class="btn btn-sm btn-info" onclick="markAsUnread(${message.id})">
                                    <i class="fas fa-envelope"></i> Đánh dấu chưa đọc
                                </button>`
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

window.filterMessages = function(filterType) {
    console.log('Filtering messages by:', filterType);
    
    // Update filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    
    const activeButton = document.querySelector(`[onclick="filterMessages('${filterType}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Filter messages
    const messageItems = document.querySelectorAll('.message-item');
    messageItems.forEach(item => {
        let shouldShow = true;
        
        if (filterType === 'unread') {
            shouldShow = item.classList.contains('unread');
        } else if (filterType === 'students') {
            shouldShow = item.getAttribute('data-sender-type') === 'student';
        } else if (filterType === 'parents') {
            shouldShow = item.getAttribute('data-sender-type') === 'parent';
        } else if (filterType === 'admin') {
            shouldShow = item.getAttribute('data-sender-type') === 'admin';
        } else if (filterType === 'important') {
            shouldShow = item.classList.contains('important');
        }
        
        item.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Update message stats
    updateMessageStats();
};

window.viewMessage = function(messageId) {
    console.log('Viewing message:', messageId);
    
    const modal = document.getElementById('messageDetailModal');
    if (modal) {
        modal.classList.add('active');
        
        const messageContent = document.getElementById('messageContent');
        if (messageContent) {
            messageContent.innerHTML = `
                <div class="message-detail">
                    <div class="message-header">
                        <h3>Hỏi về bài tập</h3>
                        <div class="message-meta">
                            <span class="sender">Nguyễn Văn An (Học sinh)</span>
                            <span class="time">10:30 - 12/10/2025</span>
                        </div>
                    </div>
                    <div class="message-body">
                        <p>Thầy ơi, em không hiểu bài tập số 3 trang 45. Em đã làm theo cách thầy dạy nhưng vẫn không ra kết quả đúng. Thầy có thể giải thích thêm cho em được không ạ?</p>
                        <p>Em cảm ơn thầy!</p>
                    </div>
                    <div class="message-actions">
                        <button class="btn btn-primary" onclick="replyMessage(${messageId})">
                            <i class="fas fa-reply"></i> Trả lời
                        </button>
                        <button class="btn btn-success" onclick="markAsRead(${messageId})">
                            <i class="fas fa-check"></i> Đánh dấu đã đọc
                        </button>
                        <button class="btn btn-info" onclick="viewReplyHistory(${messageId})">
                            <i class="fas fa-history"></i> Lịch sử trả lời
                        </button>
                        <button class="btn btn-warning" onclick="forwardMessage(${messageId})">
                            <i class="fas fa-share"></i> Chuyển tiếp
                        </button>
                        <button class="btn btn-danger" onclick="deleteMessage(${messageId})">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                </div>
            `;
        }
    }
};

window.replyMessage = function(messageId) {
    console.log('Replying to message:', messageId);
    
    const modal = document.getElementById('replyModal');
    if (modal) {
        modal.classList.add('active');
        
        const replyContent = document.getElementById('replyContent');
        if (replyContent) {
            replyContent.innerHTML = `
                <div class="reply-form">
                    <h3>Trả lời tin nhắn</h3>
                    <div class="form-group">
                        <label>Người nhận:</label>
                        <input type="text" value="Nguyễn Văn An (Học sinh)" readonly>
                    </div>
                    <div class="form-group">
                        <label>Tiêu đề:</label>
                        <input type="text" value="Re: Hỏi về bài tập" readonly>
                    </div>
                    <div class="form-group">
                        <label>Nội dung:</label>
                        <textarea rows="6" placeholder="Nhập nội dung trả lời...">Chào em An,

Cảm ơn em đã hỏi. Về bài tập số 3 trang 45, em cần chú ý:

1. Kiểm tra điều kiện của phương trình
2. Áp dụng công thức nghiệm đúng cách
3. Thử lại kết quả

Em có thể gửi bài làm của em để thầy xem và hướng dẫn cụ thể hơn.

Chúc em học tốt!

Thầy Nguyễn Văn A</textarea>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-primary" onclick="sendReply(${messageId})">
                            <i class="fas fa-paper-plane"></i> Gửi trả lời
                        </button>
                        <button class="btn btn-secondary" onclick="closeReplyModal()">
                            <i class="fas fa-times"></i> Hủy
                        </button>
                    </div>
                </div>
            `;
        }
    }
};

window.markAsRead = function(messageId) {
    console.log('Marking message as read:', messageId);
    
    const messageItem = document.querySelector(`[onclick*="viewMessage(${messageId})"]`).closest('.message-item');
    if (messageItem) {
        messageItem.classList.remove('unread');
        messageItem.classList.add('read');
        
        const markButton = messageItem.querySelector(`[onclick*="markAsRead(${messageId})"]`);
        if (markButton) {
            markButton.innerHTML = '<i class="fas fa-envelope"></i> Đánh dấu chưa đọc';
            markButton.setAttribute('onclick', `markAsUnread(${messageId})`);
        }
    }
    
    updateMessageStats();
    showNotification('Đã đánh dấu tin nhắn là đã đọc!', 'success');
};

window.markAsUnread = function(messageId) {
    console.log('Marking message as unread:', messageId);
    
    const messageItem = document.querySelector(`[onclick*="viewMessage(${messageId})"]`).closest('.message-item');
    if (messageItem) {
        messageItem.classList.remove('read');
        messageItem.classList.add('unread');
        
        const markButton = messageItem.querySelector(`[onclick*="markAsUnread(${messageId})"]`);
        if (markButton) {
            markButton.innerHTML = '<i class="fas fa-check"></i> Đánh dấu đã đọc';
            markButton.setAttribute('onclick', `markAsRead(${messageId})`);
        }
    }
    
    updateMessageStats();
    showNotification('Đã đánh dấu tin nhắn là chưa đọc!', 'info');
};

window.updateMessageStats = function() {
    console.log('Updating message stats');
    
    const messageItems = document.querySelectorAll('.message-item');
    const totalMessages = messageItems.length;
    const unreadMessages = document.querySelectorAll('.message-item.unread').length;
    const todayMessages = document.querySelectorAll('.message-item').length; // Simplified
    const importantMessages = document.querySelectorAll('.message-item.important').length;
    
    // Update stats display
    const stats = document.querySelectorAll('.stat-number');
    if (stats.length >= 4) {
        stats[0].textContent = totalMessages;
        stats[1].textContent = unreadMessages;
        stats[2].textContent = todayMessages;
        stats[3].textContent = importantMessages;
    }
};

window.viewReplyHistory = function(messageId) {
    console.log('Viewing reply history for message:', messageId);
    
    const modal = document.getElementById('replyHistoryModal');
    if (modal) {
        modal.classList.add('active');
        
        const historyContent = document.getElementById('historyContent');
        if (historyContent) {
            historyContent.innerHTML = `
                <div class="reply-history">
                    <h3>Lịch sử trả lời</h3>
                    
                    <div class="original-message">
                        <div class="message-header">
                            <strong>Tin nhắn gốc</strong>
                            <span class="time">10:30 - 12/10/2025</span>
                        </div>
                        <div class="message-content">
                            <p><strong>Nguyễn Văn An (Học sinh):</strong></p>
                            <p>Thầy ơi, em không hiểu bài tập số 3 trang 45...</p>
                        </div>
                    </div>
                    
                    <div class="reply-thread">
                        <div class="reply-item">
                            <div class="reply-header">
                                <strong>Trả lời của thầy</strong>
                                <span class="time">11:00 - 12/10/2025</span>
                            </div>
                            <div class="reply-content">
                                <p>Chào em An, cảm ơn em đã hỏi. Về bài tập số 3...</p>
                            </div>
                        </div>
                        
                        <div class="reply-item">
                            <div class="reply-header">
                                <strong>Phản hồi của học sinh</strong>
                                <span class="time">14:30 - 12/10/2025</span>
                            </div>
                            <div class="reply-content">
                                <p>Cảm ơn thầy, em đã hiểu rồi ạ!</p>
                            </div>
                        </div>
                        
                        <div class="reply-item">
                            <div class="reply-header">
                                <strong>Trả lời của thầy</strong>
                                <span class="time">15:00 - 12/10/2025</span>
                            </div>
                            <div class="reply-content">
                                <p>Rất tốt em! Tiếp tục phát huy nhé.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
};

window.sendReply = function(messageId) {
    console.log('Sending reply for message:', messageId);
    showNotification('Đã gửi trả lời tin nhắn!', 'success');
    closeReplyModal();
};

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

window.closeReplyModal = function() {
    const modal = document.getElementById('replyModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

window.closeReplyHistoryModal = function() {
    const modal = document.getElementById('replyHistoryModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

window.closeMessageDetailModal = function() {
    const modal = document.getElementById('messageDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

// ===== MODAL CLOSE FUNCTIONS =====
window.closeClassDetailsModal = function() {
    const modal = document.getElementById('classDetailsModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

window.closeClassManagementModal = function() {
    const modal = document.getElementById('classManagementModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

window.closeSessionDetailsModal = function() {
    const modal = document.getElementById('sessionDetailsModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

// ===== UTILITY FUNCTIONS =====
function getSessionStatusText(status) {
    switch(status) {
        case 'completed': return 'Đã hoàn thành';
        case 'upcoming': return 'Sắp tới';
        case 'active': return 'Đang diễn ra';
        default: return 'Không xác định';
    }
}

// ===== NOTIFICATION SYSTEM =====
window.showNotification = function(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                 type === 'error' ? 'fas fa-exclamation-circle' : 
                 type === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
};

// ===== NAVIGATION HANDLER =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up navigation...');

    const authContext = getAuthContext();
    if (!authContext) {
        return;
    }
    applyAuthProfileToUI(authContext.payload);
    setupUserMenuInteractions();
    registerLogoutHandler();
    wireProfileModalEvents();
    loadAndRenderTeacherProfile();
    
    // Sidebar navigation
    const navItems = document.querySelectorAll('.nav-item');
    console.log('Found nav items:', navItems.length);
    
    navItems.forEach((item, index) => {
        console.log(`Nav item ${index}:`, item.textContent.trim());
        
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            console.log('Clicked nav item:', sectionId);
            
            if (sectionId) {
                // Remove active class from all nav items
                navItems.forEach(ni => ni.classList.remove('active'));
                // Add active class to clicked item
                this.classList.add('active');
                
                // Hide all content sections
                const sections = document.querySelectorAll('.content-section');
                console.log('Found content sections:', sections.length);
                sections.forEach(section => {
                    section.style.display = 'none';
                });
                
                // Show selected section
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.style.display = 'block';
                    console.log('Showing section:', sectionId);
                    
                    // Load data for specific sections
                    if (sectionId === 'assignments') {
                        console.log('=== Navigation: Loading assignments section ===');
                        console.log('window.loadAssignmentsSection type:', typeof window.loadAssignmentsSection);
                        console.log('window.__teacherFunctionsLoaded:', window.__teacherFunctionsLoaded);
                        
                        const loadAssignments = () => {
                            if (typeof window.loadAssignmentsSection === 'function') {
                                console.log('✅ Calling window.loadAssignmentsSection() from navigation');
                                window.loadAssignmentsSection().catch(error => {
                                    console.error('❌ Error loading assignments from navigation:', error);
                                    const assignmentsGrid = document.querySelector('.assignments-grid');
                                    if (assignmentsGrid) {
                                        assignmentsGrid.innerHTML = '<div class="empty-state"><p style="color: red;">Lỗi khi tải bài tập: ' + error.message + '</p></div>';
                                    }
                                });
                                return true;
                            }
                            return false;
                        };
                        
                        if (!loadAssignments()) {
                            console.warn('⚠️ window.loadAssignmentsSection not available, retrying...');
                            let retryCount = 0;
                            const maxRetries = 5;
                            const retryInterval = setInterval(() => {
                                retryCount++;
                                console.log(`Retry ${retryCount}/${maxRetries}: Checking for loadAssignmentsSection...`);
                                if (loadAssignments()) {
                                    clearInterval(retryInterval);
                                } else if (retryCount >= maxRetries) {
                                    clearInterval(retryInterval);
                                    console.error('❌ window.loadAssignmentsSection still not available after ' + maxRetries + ' retries');
                                    const assignmentsGrid = document.querySelector('.assignments-grid');
                                    if (assignmentsGrid) {
                                        assignmentsGrid.innerHTML = '<div class="empty-state"><p style="color: red;">Không thể tải danh sách bài tập. Vui lòng reload trang.</p></div>';
                                    }
                                }
                            }, 200);
                        }
                    } else if (sectionId === 'classes' && window.teacherDashboard) {
                        window.teacherDashboard.loadClassesSection();
                    } else if (sectionId === 'grades' && window.teacherDashboard) {
                        window.teacherDashboard.loadGradesSection();
                    }
                } else {
                    console.error('Section not found:', sectionId);
                }
            }
        });
    });
    
    // Set default active section
    const defaultSection = document.getElementById('dashboard');
    if (defaultSection) {
        defaultSection.style.display = 'block';
        console.log('Default section set to dashboard');
    }
    
    // Set default active nav item
    const defaultNavItem = document.querySelector('[data-section="dashboard"]');
    if (defaultNavItem) {
        defaultNavItem.classList.add('active');
        console.log('Default nav item set to dashboard');
    }
    
    console.log('Navigation setup complete!');
    window.__DISABLE_LEGACY_TEACHER_DEMO__ = true;
    
    // Initialize dashboard
    if (typeof window.teacherDashboard === 'undefined') {
        window.teacherDashboard = new TeacherDashboard();
    }
    
    // Ensure sidebar toggle works (backup event listener)
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    if (sidebarToggleBtn) {
        console.log('Sidebar toggle button found, setting up event listener');
        
        // Remove any existing listeners by cloning
        const newBtn = sidebarToggleBtn.cloneNode(true);
        sidebarToggleBtn.parentNode.replaceChild(newBtn, sidebarToggleBtn);
        
        // Verify icon exists
        const icon = newBtn.querySelector('i');
        if (icon) {
            console.log('Icon found in toggle button:', icon.className);
        } else {
            console.warn('Icon not found in toggle button, creating one');
            const newIcon = document.createElement('i');
            newIcon.className = 'fas fa-angle-left';
            newBtn.appendChild(newIcon);
        }
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Sidebar toggle clicked');
            
            // Try using TeacherDashboard instance first
            if (window.teacherDashboard && typeof window.teacherDashboard.toggleSidebar === 'function') {
                try {
                    console.log('Using TeacherDashboard.toggleSidebar');
                    window.teacherDashboard.toggleSidebar();
                    return;
                } catch (error) {
                    console.error('Error in TeacherDashboard.toggleSidebar:', error);
                }
            }
            
            // Fallback: direct toggle
            try {
                const sidebar = document.getElementById('sidebar');
                const mainContent = document.getElementById('mainContent');
                const currentIcon = newBtn.querySelector('i');
                
                if (sidebar && mainContent) {
                    const isCollapsed = sidebar.classList.contains('collapsed');
                    console.log('Sidebar collapsed state:', isCollapsed);
                    
                    if (isCollapsed) {
                        sidebar.classList.remove('collapsed');
                        mainContent.classList.remove('sidebar-collapsed');
                        if (currentIcon) {
                            currentIcon.className = 'fas fa-angle-left';
                            console.log('Icon changed to fa-angle-left');
                        }
                    } else {
                        sidebar.classList.add('collapsed');
                        mainContent.classList.add('sidebar-collapsed');
                        if (currentIcon) {
                            currentIcon.className = 'fas fa-angle-right';
                            console.log('Icon changed to fa-angle-right');
                        }
                    }
                } else {
                    console.error('Sidebar or mainContent not found');
                }
            } catch (error) {
                console.error('Error in fallback sidebar toggle:', error);
            }
        });
        
        console.log('Sidebar toggle event listener attached');
    } else {
        console.error('Sidebar toggle button not found!');
    }
    
    // Initialize real-time components
    if (typeof window.realTimeMessages === 'undefined') {
        window.realTimeMessages = new RealTimeMessages();
    }
    
    if (typeof window.realTimeSchedule === 'undefined') {
        window.realTimeSchedule = new RealTimeSchedule();
    }
});