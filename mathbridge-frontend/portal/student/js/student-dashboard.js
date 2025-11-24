/*
    renderAssignmentWorkspace(detail) {
        const questions = detail.questions || [];
        if (!questions.length) {
            this.renderAssignmentPreview(detail);
            return;
        }

        const questionsHtml = questions.map((question, index) => {
            const stored = this.assignmentAnswers[question.questionId] || {};
            return `
                <div class="assignment-question-card" data-question-id="${question.questionId}" data-question-type="${question.type || 'ESSAY'}">
                    <div class="question-header">
                        <span>Câu ${index + 1}</span>
                        ${question.points ? `<span class="question-points">${question.points} điểm</span>` : ''}
                    </div>
                    <p class="question-content">${question.content || ''}</p>
                    ${this.renderQuestionInput(question, stored)}
                </div>
            `;
        }).join('');

        const warning = detail.warningMessage || 'Thời gian bắt đầu tính khi bạn vào bài. Hết giờ hệ thống sẽ tự động nộp.';
        const warningHtml = warning.replace(/\n/g, '<br>');

        const content = `
            <div class="assignment-live-header">
                <div>
                    <p class="assignment-class">${detail.className || ''}</p>
                    <p class="assignment-warning">${warningHtml}</p>
                </div>
                <div class="assignment-countdown-container">
                    <span><i class="fas fa-clock"></i> Thời gian còn lại</span>
                    <strong id="assignmentCountdown">--:--</strong>
                </div>
            </div>
            <div class="assignment-question-wrapper">
                ${questionsHtml}
            </div>
            <div class="assignment-modal-actions">
                <button class="btn btn-secondary" id="assignmentSaveDraft">
                    <i class="fas fa-save"></i> Lưu nháp
                </button>
                <button class="btn btn-warning" id="assignmentClose">
                    <i class="fas fa-door-open"></i> Thoát
                </button>
                <button class="btn btn-success" id="assignmentSubmit">
                    <i class="fas fa-paper-plane"></i> Nộp bài
                </button>
            </div>
        `;

        this.showModal(`Làm bài: ${detail.title}`, content, 'assignment-modal');
        this.bindAssignmentEvents(detail);
    }

    renderQuestionInput(question, storedAnswer = {}) {
        const type = (question.type || '').toUpperCase();
        if (type === 'MULTIPLE_CHOICE' && Array.isArray(question.options)) {
            return `
                <div class="assignment-options">
                    ${question.options.map((option, idx) => {
                        const optionId = `q_${question.questionId}_${idx}`;
                        const checked = storedAnswer.answer === option ? 'checked' : '';
                        return `
                            <label class="assignment-option" for="${optionId}">
                                <input type="radio" name="q_${question.questionId}" id="${optionId}" value="${option}" ${checked}>
                                <span>${option}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            `;
        }

        return `
            <textarea class="assignment-answer-textarea" rows="4" data-question-text="${question.questionId}"
                placeholder="Nhập câu trả lời...">${storedAnswer.answerText || ''}</textarea>
        `;
    }

    bindAssignmentEvents(detail) {
        const modal = document.querySelector('.modal.assignment-modal');
        if (!modal) return;

        // Prevent closing modal by clicking overlay when assignment is active
        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.style.pointerEvents = 'none';
        }

        // Add beforeunload warning when assignment is active (for closing tab/window)
        const beforeUnloadHandler = (e) => {
            if (this.activeAssignmentSession) {
                e.preventDefault();
                e.returnValue = 'Bạn đang làm bài tập. Nếu rời trang, thời gian vẫn tiếp tục chạy và bài làm có thể bị mất. Bạn có chắc chắn muốn rời trang?';
                return e.returnValue;
            }
        };
        window.addEventListener('beforeunload', beforeUnloadHandler);
        
        // Add visibilitychange warning when switching tabs
        const visibilityChangeHandler = () => {
            if (this.activeAssignmentSession && document.hidden) {
                // Show notification when tab becomes hidden
                this.showNotification('⚠️ Bạn đã chuyển sang tab khác. Thời gian làm bài vẫn tiếp tục chạy!', 'warning', 5000);
            }
        };
        document.addEventListener('visibilitychange', visibilityChangeHandler);
        
        // Store handler references for cleanup
        modal.dataset.beforeUnloadHandler = 'active';
        modal._beforeUnloadHandler = beforeUnloadHandler;
        modal._visibilityChangeHandler = visibilityChangeHandler;

        modal.querySelectorAll('.assignment-option input').forEach(input => {
            input.addEventListener('change', (event) => {
                const card = event.target.closest('.assignment-question-card');
                const questionId = card.dataset.questionId;
                this.assignmentAnswers[questionId] = {
                    questionId,
                    answer: event.target.value
                };
                this.persistAssignmentSession();
            });
        });

        modal.querySelectorAll('.assignment-answer-textarea').forEach(textarea => {
            textarea.addEventListener('input', (event) => {
                const questionId = event.target.getAttribute('data-question-text');
                this.assignmentAnswers[questionId] = {
                    questionId,
                    answerText: event.target.value
                };
                this.persistAssignmentSession();
            });
        });

        const saveDraftBtn = modal.querySelector('#assignmentSaveDraft');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.saveDraft());
        }

        const submitBtn = modal.querySelector('#assignmentSubmit');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitAssignment());
        }

        const closeBtn = modal.querySelector('#assignmentClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (this.activeAssignmentSession) {
                    const confirmed = window.confirm('Bạn đang làm bài tập. Nếu thoát, thời gian vẫn tiếp tục chạy. Bạn có chắc chắn muốn thoát?');
                    if (!confirmed) {
                        return;
                    }
                }
                // Remove beforeunload and visibilitychange handlers when closing
                const beforeUnloadHandler = modal._beforeUnloadHandler;
                if (beforeUnloadHandler) {
                    window.removeEventListener('beforeunload', beforeUnloadHandler);
                    delete modal._beforeUnloadHandler;
                }
                const visibilityChangeHandler = modal._visibilityChangeHandler;
                if (visibilityChangeHandler) {
                    document.removeEventListener('visibilitychange', visibilityChangeHandler);
                    delete modal._visibilityChangeHandler;
                }
                this.persistAssignmentSession();
                this.closeModal();
            });
        }
    }

    startAssignmentCountdown(expiresAt) {
        this.stopAssignmentCountdown();
        if (!expiresAt) return;
        const endTime = new Date(expiresAt).getTime();
        if (Number.isNaN(endTime)) return;

        this.assignmentCountdownInterval = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(0, endTime - now);
            const countdownEl = document.getElementById('assignmentCountdown');
            if (countdownEl) {
                const minutes = String(Math.floor(diff / 60000)).padStart(2, '0');
                const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
                countdownEl.textContent = `${minutes}:${seconds}`;
                countdownEl.classList.toggle('urgent', diff < 60000);
            }

            if (diff <= 0) {
                this.stopAssignmentCountdown();
                this.autoSubmitAssignment();
            }
        }, 1000);
    }

    stopAssignmentCountdown() {
        if (this.assignmentCountdownInterval) {
            clearInterval(this.assignmentCountdownInterval);
            this.assignmentCountdownInterval = null;
        }
    }

    async autoSubmitAssignment() {
        if (!this.activeAssignmentSession) {
            return;
        }
        this.showNotification('Đã hết giờ, hệ thống đang tự động nộp bài...', 'warning');
        await this.submitAssignment(true);
    }

    async submitAssignment(autoSubmit = false) {
        if (!this.activeAssignmentSession) {
            this.showNotification('Không tìm thấy phiên làm bài.', 'warning');
            return;
        }

        const answersPayload = Object.values(this.assignmentAnswers || {});
        if (!answersPayload.length && !autoSubmit) {
            this.showNotification('Vui lòng trả lời ít nhất một câu hỏi.', 'warning');
            return;
        }

        try {
            this.showLoading();
            const session = this.activeAssignmentSession;
            const response = await this.apiCall(`/api/portal/student/assignments/${session.assignmentId}/submit`, {
                method: 'POST',
                body: JSON.stringify({
                    submissionId: session.submissionId,
                    answers: answersPayload
                })
            });
            const detail = response.data || response;
            this.showNotification(autoSubmit ? 'Hệ thống đã tự động nộp bài.' : 'Đã nộp bài thành công!', 'success');
            this.clearAssignmentSession(session.assignmentId);
            
            // Remove beforeunload and visibilitychange handlers after submission
            const modal = document.querySelector('.modal.assignment-modal');
            if (modal) {
                if (modal._beforeUnloadHandler) {
                    window.removeEventListener('beforeunload', modal._beforeUnloadHandler);
                    delete modal._beforeUnloadHandler;
                }
                if (modal._visibilityChangeHandler) {
                    document.removeEventListener('visibilitychange', modal._visibilityChangeHandler);
                    delete modal._visibilityChangeHandler;
                }
            }
            
            this.closeModal();
            this.stopAssignmentCountdown();
            this.renderAssignmentPreview(detail);
            this.loadDashboardData();
        } catch (error) {
            console.error('Submit assignment error:', error);
            this.showNotification(error.message || 'Không thể nộp bài', 'error');
        } finally {
            this.hideLoading();
        }
    }

    saveDraft() {
        this.persistAssignmentSession();
        this.showNotification('Đã lưu nháp bài làm!', 'success');
    }

    persistAssignmentSession() {
        if (!this.activeAssignmentSession) return;
        this.activeAssignmentSession.answers = this.assignmentAnswers;
        this.saveAssignmentSession();
    }

    saveAssignmentSession() {
        if (!this.activeAssignmentSession) return;
        const key = `mb_assignment_session_${this.activeAssignmentSession.assignmentId}`;
        localStorage.setItem(key, JSON.stringify(this.activeAssignmentSession));
    }

    loadAssignmentSession(assignmentId) {
        const key = `mb_assignment_session_${assignmentId}`;
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.warn('Failed to parse assignment session:', error);
            return null;
        }
    }

    clearAssignmentSession(assignmentId) {
        const key = `mb_assignment_session_${assignmentId}`;
        localStorage.removeItem(key);
        if (this.activeAssignmentSession && this.activeAssignmentSession.assignmentId === assignmentId) {
            this.activeAssignmentSession = null;
            this.assignmentAnswers = {};
        }
    }

    resumeStoredAssignmentSession() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('mb_assignment_session_'));
        if (!keys.length) return;
        try {
            const session = JSON.parse(localStorage.getItem(keys[0]));
            if (session && session.assignmentId) {
                const expiresAt = new Date(session.expiresAt || '');
                if (expiresAt && expiresAt > new Date()) {
                    this.assignmentAnswers = session.answers || {};
                    this.activeAssignmentSession = session;
                    this.fetchAssignmentDetail(session.assignmentId, { resume: true });
                } else {
                    localStorage.removeItem(keys[0]);
                }
            }
        } catch (error) {
            console.warn('Failed to restore assignment session:', error);
        }
    }

    restoreAssignmentSession() {
        if (this.activeAssignmentSession) {
            return;
        }
        this.resumeStoredAssignmentSession();
    }

    renderAssignmentPreview(assignment) {
        const statusBadge = `<span class="status-badge ${assignment.status}">${this.getAssignmentStatusText(assignment.status)}</span>`;
        const content = `
            <div class="assignment-detail-modal">
                <h3>${assignment.title}</h3>
                <div class="assignment-detail-content">
                    <div class="detail-section">
                        <h4>Thông tin bài tập</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Lớp:</label>
                                <span>${assignment.className || '-'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Hạn nộp:</label>
                                <span>${this.formatDate(assignment.dueDate)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Trạng thái:</label>
                                ${statusBadge}
                            </div>
                            <div class="detail-item">
                                <label>Thời lượng:</label>
                                <span>${assignment.durationMinutes ? `${assignment.durationMinutes} phút` : 'Không giới hạn'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h4>Mô tả</h4>
                        <p>${assignment.description || 'Không có mô tả.'}</p>
                    </div>
                    ${assignment.warningMessage ? `
                        <div class="detail-section">
                            <h4>Cảnh báo</h4>
                            <p>${assignment.warningMessage.replace(/\n/g, '<br>')}</p>
                        </div>
                    ` : ''}
                    ${assignment.grade ? `
                        <div class="detail-section">
                            <h4>Điểm số</h4>
                            <p><strong>${assignment.grade}/10</strong></p>
                            ${assignment.feedback ? `<p><strong>Nhận xét:</strong> ${assignment.feedback}</p>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        this.showModal('Chi tiết bài tập', content, 'assignment-preview-modal');
    }

    viewSubmission(assignmentId) {
        this.fetchAssignmentDetail(assignmentId, { viewOnly: true });
    }

    viewAssignmentDetails(assignmentId) {
        this.fetchAssignmentDetail(assignmentId, { viewOnly: true });
    }
*/
// Student Dashboard JavaScript
import { CONFIG } from '../../assets/js/config.js';

class StudentDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.studentData = null;
        this.scheduleData = []; // Schedule data loaded from API
        this.charts = {};
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.currentWeek = this.getWeekNumber(new Date());
        this.scheduleView = 'month'; // 'month' or 'week'
        this.selectedDate = null;
        this.activeAssignmentSession = null;
        this.assignmentCountdownInterval = null;
        this.assignmentAnswers = {};
        // Prefill UI with cached auth profile so header shows name immediately
        this.prefillUserInfoFromAuth();

        // Check authentication before initializing
        this.checkAuthentication();
        this.init();
    }

    // Check if user is authenticated
    checkAuthentication() {
        const token = localStorage.getItem('mb_token');
        const authData = localStorage.getItem('mb_auth');
        
        // Check if we have token or auth data
        let hasToken = !!token;
        if (!hasToken && authData) {
            try {
                const auth = JSON.parse(authData);
                hasToken = !!auth.token;
            } catch (e) {
                console.warn('Failed to parse mb_auth:', e);
            }
        }

        // Check if user has student role
        let isStudent = false;
        if (authData) {
            try {
                const auth = JSON.parse(authData);
                const user = auth.user || auth.account || {};
                const roles = user.roles || [];
                isStudent = roles.includes('R001') || roles.some(r => /hoc\s*sinh/i.test(r));
            } catch (e) {
                console.warn('Failed to parse mb_auth for roles:', e);
            }
        }

        if (!hasToken || !isStudent) {
            // Redirect to login page
            alert('Vui lòng đăng nhập để truy cập portal học sinh.');
            window.location.href = '../../pages/login.html';
            return;
        }
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeDashboard();
            });
        } else {
            this.initializeDashboard();
        }
    }

    initializeDashboard() {
        this.bindEvents();
        this.loadSidebarComponents();
        this.initializeSidebarState();
        this.updateDateTime();
        this.loadDashboardData();
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.initializeAccessibility();
        this.initializePerformanceOptimizations();
    }

    bindEvents() {
        // Mobile menu
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('mobile-open');
            });
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // User dropdown menu - bind after DOM is ready
        const userMenuBtn = document.getElementById('userMenuBtn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.toggleUserDropdown();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('userDropdown');
            const userMenuBtn = document.getElementById('userMenuBtn');

            if (dropdown && userMenuBtn &&
                !dropdown.contains(e.target) &&
                !userMenuBtn.contains(e.target)) {
                this.closeUserDropdown();
            }
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Search and filters
        this.bindSearchAndFilters();
    }

    loadSidebarComponents() {
        // Load sidebar header
        const headerPlaceholder = document.getElementById('sidebar-header-placeholder');
        if (headerPlaceholder) {
            fetch('components/sidebar/sidebar-header.html')
                .then(response => response.text())
                .then(html => {
                    headerPlaceholder.innerHTML = html;
                    // Re-bind sidebar toggle after loading
                    this.bindSidebarToggle();
                })
                .catch(error => console.error('Error loading sidebar header:', error));
        }

        // Load sidebar navigation
        const navPlaceholder = document.getElementById('sidebar-nav-placeholder');
        if (navPlaceholder) {
            fetch('components/sidebar/sidebar-nav.html')
                .then(response => response.text())
                .then(html => {
                    navPlaceholder.innerHTML = html;
                    // Re-bind navigation events after loading
                    this.bindNavigationEvents();
                })
                .catch(error => console.error('Error loading sidebar navigation:', error));
        }

        // Load sidebar footer
        const footerPlaceholder = document.getElementById('sidebar-footer-placeholder');
        if (footerPlaceholder) {
            fetch('components/sidebar/sidebar-footer.html')
                .then(response => response.text())
                .then(html => {
                    footerPlaceholder.innerHTML = html;
                    // Re-bind logout button after loading
                    const logoutBtn = document.getElementById('logoutBtn');
                    if (logoutBtn) {
                        logoutBtn.addEventListener('click', () => {
                            this.logout();
                        });
                    }
                    // Update user name if data is already loaded
                    if (this.studentData?.fullName) {
                        this.updateSidebarUserName();
                    }
                })
                .catch(error => console.error('Error loading sidebar footer:', error));
        }
    }

    bindSidebarToggle() {
        // Re-bind sidebar toggle after dynamic load
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            // Remove existing listeners
            const newToggle = sidebarToggle.cloneNode(true);
            sidebarToggle.parentNode.replaceChild(newToggle, sidebarToggle);
            // Add new listener
            newToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
    }

    bindNavigationEvents() {
        // Re-bind navigation events for dynamically loaded content
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.switchSection(section);
            });
        });
    }

    bindSearchAndFilters() {
        // Class search and filter
        const classSearch = document.getElementById('classSearch');
        const classFilter = document.getElementById('classFilter');
        if (classSearch) classSearch.addEventListener('input', () => this.filterClasses());
        if (classFilter) classFilter.addEventListener('change', () => this.filterClasses());

        // Assignment search and filter
        const assignmentSearch = document.getElementById('assignmentSearch');
        const assignmentStatusFilter = document.getElementById('assignmentStatusFilter');
        if (assignmentSearch) assignmentSearch.addEventListener('input', () => this.filterAssignments());
        if (assignmentStatusFilter) assignmentStatusFilter.addEventListener('change', () => this.filterAssignments());

        // Grade filters
        const gradeSubjectFilter = document.getElementById('gradeSubjectFilter');
        const gradePeriodFilter = document.getElementById('gradePeriodFilter');
        if (gradeSubjectFilter) gradeSubjectFilter.addEventListener('change', () => this.filterGrades());
        if (gradePeriodFilter) gradePeriodFilter.addEventListener('change', () => this.filterGrades());
    }

    async loadDashboardData() {
        // Always use API to get real data from SQL Server
        // No mock data or static mode
        try {
            this.showLoading();

            // Load student dashboard data from backend API
            const dashboardResponse = await this.apiCall('/api/portal/student/dashboard');
            
            // Handle response format: ApiResponse<StudentDashboardDTO> has structure {success, message, data}
            if (dashboardResponse && dashboardResponse.success && dashboardResponse.data) {
                this.studentData = dashboardResponse.data;
            } else if (dashboardResponse && dashboardResponse.data) {
                // Fallback: if response has data directly
                this.studentData = dashboardResponse.data;
            } else if (dashboardResponse) {
                // Fallback: if response is the data itself
                this.studentData = dashboardResponse;
            } else {
                throw new Error('Không nhận được dữ liệu từ server');
            }

            // Cache successful data
            this.cacheDashboardData(this.studentData);

            this.hideLoading();

            // Update UI with loaded data
            this.updateDashboardUI();
            this.updateUserInfo();
            this.loadClasses();
            this.loadAssignments();
            this.loadGrades();
            this.loadMessages();
            this.loadHistory();
            this.loadSupportRequests();
            this.restoreAssignmentSession();

        } catch (error) {
            console.error('Backend data loading failed:', error);
            
            // Check if it's a connection error
            const isConnectionError = error.message.includes('Failed to fetch') || 
                                     error.message.includes('ERR_CONNECTION_REFUSED') ||
                                     error.message.includes('NetworkError') ||
                                     error.name === 'TypeError';
            
            if (isConnectionError) {
                this.hideLoading();
                this.showNotification(
                    'Không thể kết nối đến server. Vui lòng đảm bảo backend server đang chạy tại http://localhost:8080', 
                    'error', 
                    15000
                );
                this.showConnectionErrorState();
                return;
            }
            
            // Only use cached data if available, never use mock/default data
            const cachedData = this.loadCachedDashboardData();
            
            if (cachedData) {
                console.warn('Using cached data due to API error');
                this.studentData = cachedData;
                
                this.hideLoading();
                
                // Update UI with cached data
                this.updateDashboardUI();
                this.updateUserInfo();
                this.loadClasses();
                this.loadAssignments();
                this.loadGrades();
                this.loadMessages();
                this.loadHistory();
                this.loadSupportRequests();
                
                // Show offline mode notification
                this.showNotification('Đang hiển thị dữ liệu đã lưu. Vui lòng kiểm tra kết nối mạng.', 'warning', 8000);
            } else {
                // No cached data available - show error
                this.hideLoading();
                this.showNotification('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối và thử lại.', 'error', 10000);
                
                // Show empty state
                this.showEmptyState();
            }
        }
    }
    
    showEmptyState() {
        // Show empty state message when no data is available
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            // Remove existing empty state if any
            const existing = mainContent.querySelector('.empty-state');
            if (existing) existing.remove();
            
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="empty-state-content">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f59e0b; margin-bottom: 16px;"></i>
                    <h3>Không thể tải dữ liệu</h3>
                    <p>Vui lòng kiểm tra kết nối mạng và thử lại.</p>
                    <button class="btn btn-primary" onclick="dashboard.loadDashboardData()">
                        <i class="fas fa-redo"></i> Thử lại
                    </button>
                </div>
            `;
            mainContent.appendChild(emptyState);
        }
    }
    
    showConnectionErrorState() {
        // Show connection error state when backend server is not running
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            // Remove existing empty state if any
            const existing = mainContent.querySelector('.empty-state');
            if (existing) existing.remove();
            
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="empty-state-content">
                    <i class="fas fa-server" style="font-size: 48px; color: #ef4444; margin-bottom: 16px;"></i>
                    <h3>Không thể kết nối đến server</h3>
                    <p style="margin-bottom: 12px;">Backend server chưa được khởi động hoặc không thể truy cập.</p>
                    <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: left;">
                        <p style="margin: 8px 0;"><strong>Để khắc phục:</strong></p>
                        <ol style="margin: 8px 0; padding-left: 24px;">
                            <li>Đảm bảo backend server đang chạy tại <code>http://localhost:8080</code></li>
                            <li>Kiểm tra terminal/console của backend để xem có lỗi không</li>
                            <li>Thử khởi động lại backend server</li>
                        </ol>
                    </div>
                    <button class="btn btn-primary" onclick="dashboard.loadDashboardData()">
                        <i class="fas fa-redo"></i> Thử lại
                    </button>
                </div>
            `;
            mainContent.appendChild(emptyState);
        }
    }

    // Detect if running in static/offline mode
    // Always return false to force API calls - no mock data
    isStaticMode() {
        // Only check for file protocol (opening HTML directly)
        // In production, always use API
        return window.location.protocol === 'file:';
    }

    // Check if backend configuration exists
    hasBackendConfig() {
        // Check for backend configuration in various places
        return typeof window.API_BASE_URL !== 'undefined' ||
               document.querySelector('script[src*="config.js"]') !== null ||
               localStorage.getItem('backend_config') !== null;
    }

    updateDashboardUI() {
        if (!this.studentData) return;

        const { studentId, fullName, email, classes, assignments, grades, stats } = this.studentData;

        // Check if we're using cached/offline data or static mode
        const isOfflineMode = this.isOfflineMode();
        const isStaticMode = this.isStaticMode();

        if (isOfflineMode && !isStaticMode) {
            this.showOfflineIndicator();
            this.addOfflineModeStyling();
        }

        // Update header - check if elements exist before setting
        const userNameEl = document.getElementById('userName');
        const headerUserNameEl = document.getElementById('headerUserName');
        if (userNameEl) userNameEl.textContent = fullName;
        if (headerUserNameEl) headerUserNameEl.textContent = fullName;

        // Update hero section - check if elements exist before setting
        const welcomeMessageEl = document.getElementById('welcomeMessage');
        const todayClassesCountEl = document.getElementById('todayClassesCount');
        const pendingAssignmentsCountEl = document.getElementById('pendingAssignmentsCount');
        
        if (welcomeMessageEl && fullName) {
            welcomeMessageEl.textContent = `Chào mừng ${fullName.split(' ').pop()}!`;
        }
        if (todayClassesCountEl && stats) {
            todayClassesCountEl.textContent = stats.todayClasses || 0;
        }
        if (pendingAssignmentsCountEl && stats) {
            pendingAssignmentsCountEl.textContent = stats.pendingAssignments || 0;
        }

        // Update stats cards with local calculations
        this.updateStatsCards(stats, isOfflineMode || isStaticMode);

        // Update charts with calculated data
        this.updateCharts();

        // Load recent activity
        this.loadRecentActivity();

        // Update dynamic content indicators
        this.updateContentIndicators(isOfflineMode || isStaticMode);
    }

    updateStatsCards(stats, isOfflineMode) {
        const statCards = [
            { id: 'totalClasses', value: stats.totalClasses, label: 'Lớp học' },
            { id: 'completedAssignments', value: stats.completedAssignments, label: 'Bài tập hoàn thành' },
            { id: 'averageGrade', value: stats.averageGrade.toFixed(1), label: 'Điểm trung bình' },
            { id: 'attendanceRate', value: `${stats.attendanceRate}%`, label: 'Tỷ lệ tham gia' }
        ];

        statCards.forEach(card => {
            const element = document.getElementById(card.id);
            if (element) {
                element.textContent = card.value;
                if (isOfflineMode) {
                    element.innerHTML += '<span class="local-calc-indicator"><i class="fas fa-calculator"></i>Tính local</span>';
                }
            }
        });

        // Add trend indicators for calculated metrics
        this.addTrendIndicators(stats);
    }

    addTrendIndicators(stats) {
        // Add trend indicators based on calculated data
        const trends = {
            averageGrade: stats.gradeTrend === 'improving' ? 'positive' :
                         stats.gradeTrend === 'declining' ? 'negative' : 'neutral',
            attendanceRate: stats.attendanceRate >= 90 ? 'positive' :
                           stats.attendanceRate >= 80 ? 'neutral' : 'negative'
        };

        Object.entries(trends).forEach(([metric, trend]) => {
            const card = document.querySelector(`[data-metric="${metric}"]`);
            if (card && trend !== 'neutral') {
                const trendElement = document.createElement('div');
                trendElement.className = `stat-trend ${trend}`;
                trendElement.innerHTML = `<i class="fas fa-arrow-${trend === 'positive' ? 'up' : 'down'}"></i>`;
                card.appendChild(trendElement);
            }
        });
    }

    isOfflineMode() {
        // Check if we're using cached or default data
        return !this.studentData || this.studentData._isOffline === true;
    }

    showOfflineIndicator() {
        let indicator = document.querySelector('.offline-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'offline-indicator';
            indicator.innerHTML = `
                <i class="fas fa-wifi-slash"></i>
                <span>Chế độ ngoại tuyến</span>
                <button class="retry-btn" onclick="dashboard.retryConnection()">
                    <i class="fas fa-redo"></i> Thử lại
                </button>
            `;
            document.body.appendChild(indicator);
        }
        indicator.classList.add('show');

        // Auto-hide after 10 seconds
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 10000);
    }

    addOfflineModeStyling() {
        // Add offline mode styling to stat cards
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.classList.add('offline-mode');
        });

        // Add cached data badges
        const sections = ['dashboard', 'classes', 'assignments', 'grades'];
        sections.forEach(section => {
            const sectionElement = document.getElementById(section);
            if (sectionElement) {
                const badge = document.createElement('div');
                badge.className = 'cached-data-badge';
                badge.textContent = 'Dữ liệu cache';
                sectionElement.style.position = 'relative';
                sectionElement.appendChild(badge);
            }
        });
    }

    updateContentIndicators(isOfflineMode) {
        if (!isOfflineMode) return;

        // Add indicators to show calculated content
        const indicators = [
            { selector: '.stats-overview', text: 'Thống kê được tính từ dữ liệu mẫu' },
            { selector: '.charts-section', text: 'Biểu đồ dựa trên dữ liệu local' },
            { selector: '.recent-activity', text: 'Hoạt động mẫu để demo' }
        ];

        indicators.forEach(indicator => {
            const element = document.querySelector(indicator.selector);
            if (element) {
                const indicatorElement = document.createElement('div');
                indicatorElement.className = 'content-indicator';
                indicatorElement.innerHTML = `<i class="fas fa-info-circle"></i> ${indicator.text}`;
                indicatorElement.style.cssText = `
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    color: #1e40af;
                    padding: 6px 10px;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: 500;
                `;
                element.insertBefore(indicatorElement, element.firstChild);
            }
        });
    }

    retryConnection() {
        // Hide offline indicator
        const indicator = document.querySelector('.offline-indicator');
        if (indicator) {
            indicator.classList.remove('show');
        }

        // Retry loading data
        this.loadDashboardData();
    }

    updateCharts() {
        // Grade trend chart
        this.updateGradeChart();

        // Assignment status chart
        this.updateAssignmentChart();

        // Detailed grade chart
        this.updateDetailedGradeChart();
    }

    updateGradeChart() {
        const ctx = document.getElementById('gradeChart').getContext('2d');

        // Sample data - replace with real data
        const labels = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'];
        const data = [7.5, 8.0, 7.8, 8.5, 8.2, this.studentData?.stats?.averageGrade || 8.0];

        if (this.charts.gradeChart) {
            this.charts.gradeChart.destroy();
        }

        this.charts.gradeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Điểm trung bình',
                    data: data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0,
                        max: 10
                    }
                }
            }
        });
    }

    updateAssignmentChart() {
        const ctx = document.getElementById('assignmentChart').getContext('2d');

        if (!this.studentData?.stats) return;

        const data = {
            labels: ['Hoàn thành', 'Chưa làm', 'Đã nộp', 'Quá hạn'],
            datasets: [{
                data: [
                    this.studentData.stats.completedAssignments,
                    this.studentData.stats.pendingAssignments,
                    this.studentData.assignments.filter(a => a.status === 'submitted').length,
                    this.studentData.assignments.filter(a => a.status === 'overdue').length
                ],
                backgroundColor: [
                    '#10b981',
                    '#f59e0b',
                    '#3b82f6',
                    '#ef4444'
                ]
            }]
        };

        if (this.charts.assignmentChart) {
            this.charts.assignmentChart.destroy();
        }

        this.charts.assignmentChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateDetailedGradeChart() {
        const ctx = document.getElementById('detailedGradeChart').getContext('2d');

        if (!this.studentData?.grades) return;

        // Group grades by subject
        const subjectGrades = {};
        this.studentData.grades.forEach(grade => {
            if (!subjectGrades[grade.subject]) {
                subjectGrades[grade.subject] = [];
            }
            subjectGrades[grade.subject].push(grade.score);
        });

        const datasets = Object.keys(subjectGrades).map((subject, index) => {
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
            return {
                label: subject,
                data: subjectGrades[subject],
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length] + '20',
                tension: 0.4
            };
        });

        if (this.charts.detailedGradeChart) {
            this.charts.detailedGradeChart.destroy();
        }

        this.charts.detailedGradeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Bài 1', 'Bài 2', 'Bài 3', 'Bài 4', 'Bài 5', 'Bài 6'],
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0,
                        max: 10
                    }
                }
            }
        });
    }

    loadClasses() {
        const classesGrid = document.getElementById('classesGrid');
        if (!classesGrid) return;

        // Check if we have classes data from API
        if (!this.studentData?.classes || this.studentData.classes.length === 0) {
            classesGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <div class="empty-state-content">
                        <i class="fas fa-chalkboard-teacher" style="font-size: 64px; color: #9ca3af; margin-bottom: 20px;"></i>
                        <h3>Chưa có lớp học nào</h3>
                        <p>Bạn chưa đăng ký lớp học nào. Hãy tham gia lớp học mới để bắt đầu!</p>
                        <button class="btn btn-primary" onclick="joinNewClass()">
                            <i class="fas fa-plus"></i> Tham gia lớp mới
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        // Render classes from API data
        classesGrid.innerHTML = this.studentData.classes.map(classItem => {
            // Handle null/undefined values safely
            const averageGrade = classItem.averageGrade != null ? classItem.averageGrade.toFixed(1) : 'N/A';
            const attendancePercentage = classItem.attendancePercentage != null ? classItem.attendancePercentage : 0;
            const studentCount = classItem.studentCount != null ? classItem.studentCount : 0;
            const schedule = classItem.schedule || 'Chưa có lịch học';
            const room = classItem.room || 'Chưa có phòng';
            const teacherName = classItem.teacherName || 'Chưa có giáo viên';

            return `
            <div class="class-card">
                <div class="class-header">
                    <h3>${classItem.className || 'Lớp học'}</h3>
                    <div class="class-actions">
                        <button class="btn-icon" title="Xem chi tiết" onclick="dashboard.viewClassDetails('${classItem.classId}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" title="Xem học sinh" onclick="dashboard.viewClassmates('${classItem.classId}')">
                            <i class="fas fa-users"></i>
                        </button>
                    </div>
                </div>
                <div class="class-body">
                    <div class="class-stats">
                        <div class="stat">
                            <span class="stat-value">${studentCount}</span>
                            <span class="stat-label">HỌC SINH</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${averageGrade}</span>
                            <span class="stat-label">ĐIỂM TB</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${attendancePercentage}%</span>
                            <span class="stat-label">THAM GIA</span>
                        </div>
                    </div>
                    <div class="class-schedule">
                        <p><i class="fas fa-clock"></i> ${schedule}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${room}</p>
                        <p><i class="fas fa-user-tie"></i> ${teacherName}</p>
                    </div>
                    <div class="class-actions-full">
                        <button class="btn btn-sm btn-primary" onclick="dashboard.viewClassDetails('${classItem.classId}')">
                            <i class="fas fa-eye"></i> Xem chi tiết
                        </button>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }

    loadAssignments() {
        const assignmentsGrid = document.getElementById('assignmentsGrid');
        if (!this.studentData?.assignments) return;

        assignmentsGrid.innerHTML = this.studentData.assignments.map(assignment => {
            const statusClass = this.getAssignmentStatusClass(assignment.status);
            const statusText = this.getAssignmentStatusText(assignment.status);
            const duration = assignment.durationMinutes ? `${assignment.durationMinutes} phút` : 'Không giới hạn';

            return `
                <div class="assignment-card ${statusClass}">
                    <div class="assignment-header">
                        <h3>${assignment.title}</h3>
                        <div class="assignment-meta">
                            <span class="assignment-class">${assignment.className || ''}</span>
                            <span class="assignment-due">Hạn nộp: ${this.formatDate(assignment.dueDate)}</span>
                        </div>
                    </div>
                    <div class="assignment-body">
                        <div class="assignment-description">
                            <p>${assignment.description || ''}</p>
                        </div>
                        <div class="assignment-progress">
                            <div class="progress-info">
                                <span>Trạng thái: ${statusText}</span>
                                ${assignment.grade ? `<span>Điểm: ${assignment.grade}/10</span>` : '<span>Điểm: Chưa có</span>'}
                                <span>Thời lượng: ${duration}</span>
                                ${assignment.allowRetry ? `<span>Cho phép làm lại${assignment.attemptCount ? ` - Đã làm ${assignment.attemptCount} lần` : ''}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="assignment-actions">
                        ${this.getAssignmentActionButton(assignment)}
                        <button class="btn btn-info" onclick="dashboard.viewAssignmentDetails('${assignment.assignmentId}')">
                            <i class="fas fa-eye"></i> Xem chi tiết
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getAssignmentActionButton(assignment) {
        const allowRetry = !!assignment.allowRetry;
        const canRetry = !!assignment.canRetry;
        const resultButton = `
            <button class="btn btn-success" onclick="dashboard.viewSubmission('${assignment.assignmentId}')">
                <i class="fas fa-eye"></i> Xem kết quả
            </button>
        `;

        switch (assignment.status) {
            case 'pending':
                return `
                    <button class="btn btn-primary" onclick="dashboard.startAssignment('${assignment.assignmentId}')">
                        <i class="fas fa-play"></i> Làm bài
                    </button>
                `;
            case 'in_progress':
                return `
                    <button class="btn btn-warning" onclick="dashboard.resumeAssignment('${assignment.assignmentId}')">
                        <i class="fas fa-forward"></i> Tiếp tục
                    </button>
                `;
            case 'submitted':
            case 'graded':
                if (allowRetry && canRetry) {
                    return `
                        <button class="btn btn-warning" onclick="dashboard.startAssignment('${assignment.assignmentId}')">
                            <i class="fas fa-redo"></i> Làm lại
                        </button>
                        ${resultButton}
                    `;
                }
                return resultButton;
            default:
                return `
                    <button class="btn btn-secondary" onclick="dashboard.viewAssignmentDetails('${assignment.assignmentId}')">
                        <i class="fas fa-info-circle"></i> Chi tiết
                    </button>
                `;
        }
    }

    renderAssignmentWorkspace(detail) {
        const questions = detail.questions || [];
        if (!questions.length) {
            this.renderAssignmentPreview(detail);
            return;
        }

        const questionsHtml = questions.map((question, index) => {
            const stored = this.assignmentAnswers[question.questionId] || {};
            return `
                <div class="assignment-question-card" data-question-id="${question.questionId}" data-question-type="${question.type || 'ESSAY'}">
                    <div class="question-header">
                        <span>Câu ${index + 1}</span>
                        ${question.points ? `<span class="question-points">${question.points} điểm</span>` : ''}
                    </div>
                    <p class="question-content">${question.content || ''}</p>
                    ${this.renderQuestionInput(question, stored)}
                </div>
            `;
        }).join('');

        const warning = detail.warningMessage || 'Thời gian bắt đầu tính khi bạn vào bài. Hết giờ hệ thống sẽ tự động nộp.';
        const warningHtml = warning.replace(/\n/g, '<br>');

        const content = `
            <div class="assignment-live-header">
                <div>
                    <p class="assignment-class">${detail.className || ''}</p>
                    <p class="assignment-warning">${warningHtml}</p>
                </div>
                <div class="assignment-countdown-container">
                    <span><i class="fas fa-clock"></i> Thời gian còn lại</span>
                    <strong id="assignmentCountdown">--:--</strong>
                </div>
            </div>
            <div class="assignment-question-wrapper">
                ${questionsHtml}
            </div>
            <div class="assignment-modal-actions">
                <button class="btn btn-secondary" id="assignmentSaveDraft">
                    <i class="fas fa-save"></i> Lưu nháp
                </button>
                <button class="btn btn-warning" id="assignmentClose">
                    <i class="fas fa-door-open"></i> Thoát
                </button>
                <button class="btn btn-success" id="assignmentSubmit">
                    <i class="fas fa-paper-plane"></i> Nộp bài
                </button>
            </div>
        `;

        this.showModal(`Làm bài: ${detail.title}`, content, 'assignment-modal');
        this.bindAssignmentEvents(detail);
    }

    renderQuestionInput(question, storedAnswer = {}) {
        const type = (question.type || '').toUpperCase();
        if (type === 'MULTIPLE_CHOICE' && Array.isArray(question.options)) {
            return `
                <div class="assignment-options">
                    ${question.options.map((option, idx) => {
                        const optionId = `q_${question.questionId}_${idx}`;
                        const checked = storedAnswer.answer === option ? 'checked' : '';
                        return `
                            <label class="assignment-option" for="${optionId}">
                                <input type="radio" name="q_${question.questionId}" id="${optionId}" value="${option}" ${checked}>
                                <span>${option}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            `;
        }

        return `
            <textarea class="assignment-answer-textarea" rows="4" data-question-text="${question.questionId}"
                placeholder="Nhập câu trả lời...">${storedAnswer.answerText || ''}</textarea>
        `;
    }

    bindAssignmentEvents(detail) {
        const modal = document.querySelector('.modal.assignment-modal');
        if (!modal) return;

        // Prevent closing modal by clicking overlay when assignment is active
        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.style.pointerEvents = 'none';
        }

        // Add beforeunload warning when assignment is active (for closing tab/window)
        const beforeUnloadHandler = (e) => {
            if (this.activeAssignmentSession) {
                e.preventDefault();
                e.returnValue = 'Bạn đang làm bài tập. Nếu rời trang, thời gian vẫn tiếp tục chạy và bài làm có thể bị mất. Bạn có chắc chắn muốn rời trang?';
                return e.returnValue;
            }
        };
        window.addEventListener('beforeunload', beforeUnloadHandler);
        
        // Add visibilitychange warning when switching tabs
        const visibilityChangeHandler = () => {
            if (this.activeAssignmentSession && document.hidden) {
                // Show notification when tab becomes hidden
                this.showNotification('⚠️ Bạn đã chuyển sang tab khác. Thời gian làm bài vẫn tiếp tục chạy!', 'warning', 5000);
            }
        };
        document.addEventListener('visibilitychange', visibilityChangeHandler);
        
        // Store handler references for cleanup
        modal.dataset.beforeUnloadHandler = 'active';
        modal._beforeUnloadHandler = beforeUnloadHandler;
        modal._visibilityChangeHandler = visibilityChangeHandler;

        modal.querySelectorAll('.assignment-option input').forEach(input => {
            input.addEventListener('change', (event) => {
                const card = event.target.closest('.assignment-question-card');
                const questionId = card.dataset.questionId;
                this.assignmentAnswers[questionId] = {
                    questionId,
                    answer: event.target.value
                };
                this.persistAssignmentSession();
            });
        });

        modal.querySelectorAll('.assignment-answer-textarea').forEach(textarea => {
            textarea.addEventListener('input', (event) => {
                const questionId = event.target.getAttribute('data-question-text');
                this.assignmentAnswers[questionId] = {
                    questionId,
                    answerText: event.target.value
                };
                this.persistAssignmentSession();
            });
        });

        const saveDraftBtn = modal.querySelector('#assignmentSaveDraft');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.saveDraft());
        }

        const submitBtn = modal.querySelector('#assignmentSubmit');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitAssignment());
        }

        const closeBtn = modal.querySelector('#assignmentClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (this.activeAssignmentSession) {
                    const confirmed = window.confirm('Bạn đang làm bài tập. Nếu thoát, thời gian vẫn tiếp tục chạy. Bạn có chắc chắn muốn thoát?');
                    if (!confirmed) {
                        return;
                    }
                }
                // Remove beforeunload and visibilitychange handlers when closing
                const beforeUnloadHandler = modal._beforeUnloadHandler;
                if (beforeUnloadHandler) {
                    window.removeEventListener('beforeunload', beforeUnloadHandler);
                    delete modal._beforeUnloadHandler;
                }
                const visibilityChangeHandler = modal._visibilityChangeHandler;
                if (visibilityChangeHandler) {
                    document.removeEventListener('visibilitychange', visibilityChangeHandler);
                    delete modal._visibilityChangeHandler;
                }
                this.persistAssignmentSession();
                this.closeModal();
            });
        }
    }

    startAssignmentCountdown(expiresAt) {
        this.stopAssignmentCountdown();
        if (!expiresAt) return;
        const endTime = new Date(expiresAt).getTime();
        if (Number.isNaN(endTime)) return;

        this.assignmentCountdownInterval = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(0, endTime - now);
            const countdownEl = document.getElementById('assignmentCountdown');
            if (countdownEl) {
                const minutes = String(Math.floor(diff / 60000)).padStart(2, '0');
                const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
                countdownEl.textContent = `${minutes}:${seconds}`;
                countdownEl.classList.toggle('urgent', diff < 60000);
            }

            if (diff <= 0) {
                this.stopAssignmentCountdown();
                this.autoSubmitAssignment();
            }
        }, 1000);
    }

    stopAssignmentCountdown() {
        if (this.assignmentCountdownInterval) {
            clearInterval(this.assignmentCountdownInterval);
            this.assignmentCountdownInterval = null;
        }
    }

    async autoSubmitAssignment() {
        if (!this.activeAssignmentSession) {
            return;
        }
        this.showNotification('Đã hết giờ, hệ thống đang tự động nộp bài...', 'warning');
        await this.submitAssignment(true);
    }

    async submitAssignment(autoSubmit = false) {
        if (!this.activeAssignmentSession) {
            this.showNotification('Không tìm thấy phiên làm bài.', 'warning');
            return;
        }

        const answersPayload = Object.values(this.assignmentAnswers || {});
        if (!answersPayload.length && !autoSubmit) {
            this.showNotification('Vui lòng trả lời ít nhất một câu hỏi.', 'warning');
            return;
        }

        try {
            this.showLoading();
            const session = this.activeAssignmentSession;
            const response = await this.apiCall(`/api/portal/student/assignments/${session.assignmentId}/submit`, {
                method: 'POST',
                body: JSON.stringify({
                    submissionId: session.submissionId,
                    answers: answersPayload
                })
            });
            const detail = response.data || response;
            this.showNotification(autoSubmit ? 'Hệ thống đã tự động nộp bài.' : 'Đã nộp bài thành công!', 'success');
            this.clearAssignmentSession(session.assignmentId);
            
            // Remove beforeunload and visibilitychange handlers after submission
            const modal = document.querySelector('.modal.assignment-modal');
            if (modal) {
                if (modal._beforeUnloadHandler) {
                    window.removeEventListener('beforeunload', modal._beforeUnloadHandler);
                    delete modal._beforeUnloadHandler;
                }
                if (modal._visibilityChangeHandler) {
                    document.removeEventListener('visibilitychange', modal._visibilityChangeHandler);
                    delete modal._visibilityChangeHandler;
                }
            }
            
            this.closeModal();
            this.stopAssignmentCountdown();
            this.renderAssignmentPreview(detail);
            this.loadDashboardData();
        } catch (error) {
            console.error('Submit assignment error:', error);
            this.showNotification(error.message || 'Không thể nộp bài', 'error');
        } finally {
            this.hideLoading();
        }
    }

    saveDraft() {
        this.persistAssignmentSession();
        this.showNotification('Đã lưu nháp bài làm!', 'success');
    }

    persistAssignmentSession() {
        if (!this.activeAssignmentSession) return;
        this.activeAssignmentSession.answers = this.assignmentAnswers;
        this.saveAssignmentSession();
    }

    saveAssignmentSession() {
        if (!this.activeAssignmentSession) return;
        const key = `mb_assignment_session_${this.activeAssignmentSession.assignmentId}`;
        localStorage.setItem(key, JSON.stringify(this.activeAssignmentSession));
    }

    loadAssignmentSession(assignmentId) {
        const key = `mb_assignment_session_${assignmentId}`;
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.warn('Failed to parse assignment session:', error);
            return null;
        }
    }

    clearAssignmentSession(assignmentId) {
        const key = `mb_assignment_session_${assignmentId}`;
        localStorage.removeItem(key);
        if (this.activeAssignmentSession && this.activeAssignmentSession.assignmentId === assignmentId) {
            this.activeAssignmentSession = null;
            this.assignmentAnswers = {};
        }
    }

    resumeStoredAssignmentSession() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('mb_assignment_session_'));
        if (!keys.length) return;
        try {
            const session = JSON.parse(localStorage.getItem(keys[0]));
            if (session && session.assignmentId) {
                const expiresAt = new Date(session.expiresAt || '');
                if (expiresAt && expiresAt > new Date()) {
                    this.assignmentAnswers = session.answers || {};
                    this.activeAssignmentSession = session;
                    this.fetchAssignmentDetail(session.assignmentId, { resume: true });
                } else {
                    localStorage.removeItem(keys[0]);
                }
            }
        } catch (error) {
            console.warn('Failed to restore assignment session:', error);
        }
    }

    restoreAssignmentSession() {
        if (this.activeAssignmentSession) {
            return;
        }
        this.resumeStoredAssignmentSession();
    }

    renderAssignmentPreview(assignment) {
        const statusBadge = `<span class="status-badge ${assignment.status}">${this.getAssignmentStatusText(assignment.status)}</span>`;
        const content = `
            <div class="assignment-detail-modal">
                <h3>${assignment.title}</h3>
                <div class="assignment-detail-content">
                    <div class="detail-section">
                        <h4>Thông tin bài tập</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Lớp:</label>
                                <span>${assignment.className || '-'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Hạn nộp:</label>
                                <span>${this.formatDate(assignment.dueDate)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Trạng thái:</label>
                                ${statusBadge}
                            </div>
                            <div class="detail-item">
                                <label>Thời lượng:</label>
                                <span>${assignment.durationMinutes ? `${assignment.durationMinutes} phút` : 'Không giới hạn'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h4>Mô tả</h4>
                        <p>${assignment.description || 'Không có mô tả.'}</p>
                    </div>
                    ${assignment.warningMessage ? `
                        <div class="detail-section">
                            <h4>Cảnh báo</h4>
                            <p>${assignment.warningMessage.replace(/\n/g, '<br>')}</p>
                        </div>
                    ` : ''}
                    ${assignment.grade ? `
                        <div class="detail-section">
                            <h4>Điểm số</h4>
                            <p><strong>${assignment.grade}/10</strong></p>
                            ${assignment.feedback ? `<p><strong>Nhận xét:</strong> ${assignment.feedback}</p>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        this.showModal('Chi tiết bài tập', content, 'assignment-preview-modal');
    }

    viewSubmission(assignmentId) {
        this.fetchAssignmentDetail(assignmentId, { viewOnly: true });
    }

    viewAssignmentDetails(assignmentId) {
        this.fetchAssignmentDetail(assignmentId, { viewOnly: true });
    }

    async startAssignment(assignmentId) {
        await this.fetchAssignmentDetail(assignmentId, { start: true });
    }

    async resumeAssignment(assignmentId) {
        await this.fetchAssignmentDetail(assignmentId, { resume: true });
    }

    async fetchAssignmentDetail(assignmentId, options = {}) {
        try {
            this.showLoading();
            const endpoint = options.start
                ? `/api/portal/student/assignments/${assignmentId}/start`
                : `/api/portal/student/assignments/${assignmentId}`;
            const method = options.start ? 'POST' : 'GET';
            const response = await this.apiCall(endpoint, { method });
            const detail = response.data || response;
            this.handleAssignmentDetail(detail, options);
        } catch (error) {
            console.error('Assignment detail error:', error);
            this.showNotification(error.message || 'Không thể tải thông tin bài tập', 'error');
        } finally {
            this.hideLoading();
        }
    }

    handleAssignmentDetail(detail, options = {}) {
        if (!detail) {
            this.showNotification('Không tìm thấy bài tập.', 'warning');
            return;
        }

        if (detail.status === 'in_progress' && detail.submissionId) {
            const storedSession = this.loadAssignmentSession(detail.assignmentId);
            this.assignmentAnswers = storedSession?.answers || {};
            this.activeAssignmentSession = {
                assignmentId: detail.assignmentId,
                submissionId: detail.submissionId,
                expiresAt: detail.expiresAt,
                startedAt: detail.startedAt,
                durationMinutes: detail.durationMinutes,
                autoSubmit: detail.autoSubmit,
                warningMessage: detail.warningMessage,
                answers: this.assignmentAnswers
            };
            this.saveAssignmentSession();
            this.renderAssignmentWorkspace(detail);
            this.startAssignmentCountdown(detail.expiresAt);
        } else if (options.start) {
            this.showNotification('Bài tập này đã được nộp.', 'info');
            this.renderAssignmentPreview(detail);
        } else {
            this.renderAssignmentPreview(detail);
        }
    }

    loadGrades() {
        const gradesTableBody = document.getElementById('gradesTableBody');
        if (!this.studentData?.grades) return;

        gradesTableBody.innerHTML = this.studentData.grades.map(grade => `
            <tr>
                <td>${grade.subject}</td>
                <td>${grade.className}</td>
                <td>${grade.gradeType}</td>
                <td><span class="grade-badge ${this.getGradeBadgeClass(grade.score)}">${grade.score}</span></td>
                <td>${this.formatDate(grade.gradedAt)}</td>
                <td>${grade.teacherName}</td>
                <td>${grade.feedback || 'Không có nhận xét'}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="dashboard.viewGradeDetails('${grade.gradeId}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Update grade statistics
        this.updateGradeStatistics();
    }

    updateGradeStatistics() {
        if (!this.studentData?.grades) return;

        const grades = this.studentData.grades.map(g => g.score);
        const average = grades.reduce((a, b) => a + b, 0) / grades.length;

        const overallAverageEl = document.getElementById('overallAverage');
        const totalGradesCountEl = document.getElementById('totalGradesCount');
        const gradeRankingEl = document.getElementById('gradeRanking');
        
        if (overallAverageEl) overallAverageEl.textContent = average.toFixed(1);
        if (totalGradesCountEl) totalGradesCountEl.textContent = grades.length;
        if (gradeRankingEl) gradeRankingEl.textContent = this.getGradeRanking(average);
    }

    loadMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!this.studentData?.messages) return;

        messagesContainer.innerHTML = this.studentData.messages.map(message => `
            <div class="message-item ${message.unread ? 'unread' : ''}">
                <div class="message-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <h4>${message.sender}</h4>
                        <span class="message-time">${this.formatDate(message.sentAt)}</span>
                    </div>
                    <div class="message-subject">${message.subject}</div>
                    <div class="message-preview">${message.preview}</div>
                    <div class="message-actions">
                        <button class="btn btn-sm btn-primary" onclick="dashboard.viewMessage('${message.id}')">
                            <i class="fas fa-eye"></i> Xem
                        </button>
                        ${message.unread ? `<button class="btn btn-sm btn-secondary" onclick="dashboard.markAsRead('${message.id}')">
                            <i class="fas fa-check"></i> Đánh dấu đã đọc
                        </button>` : ''}
                    </div>
                </div>
                ${message.unread ? '<div class="message-status"><span class="status-dot unread"></span></div>' : ''}
            </div>
        `).join('');

        this.updateMessageStats();
    }

    loadRecentActivity() {
        const activityList = document.getElementById('recentActivityList');

        // No mock data - show empty state
        activityList.innerHTML = `
            <div class="empty-activity">
                <i class="fas fa-inbox"></i>
                <p>Chưa có hoạt động nào</p>
            </div>
        `;
    }

    // Utility methods
    getAssignmentStatusClass(status) {
        const classes = {
            'pending': '',
            'submitted': 'submitted',
            'graded': 'submitted',
            'in_progress': 'in-progress',
            'overdue': 'overdue'
        };
        return classes[status] || '';
    }

    getAssignmentStatusText(status) {
        const texts = {
            'pending': 'Chưa làm',
            'submitted': 'Đã nộp',
            'graded': 'Đã chấm',
            'overdue': 'Quá hạn',
            'in_progress': 'Đang làm'
        };
        return texts[status] || status;
    }

    getGradeBadgeClass(score) {
        if (score >= 9) return 'excellent';
        if (score >= 8) return 'good';
        if (score >= 6.5) return 'average';
        return 'poor';
    }

    getGradeRanking(average) {
        if (average >= 9) return 'Xuất sắc';
        if (average >= 8) return 'Giỏi';
        if (average >= 7) return 'Khá';
        if (average >= 6) return 'Trung bình';
        return 'Yếu';
    }

    formatCurrency(amount) {
        if (!amount) return '0 VNĐ';
        const num = parseFloat(amount);
        if (isNaN(num)) return amount + ' VNĐ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(num);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            // Handle LocalDateTime format from backend (ISO format)
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'N/A';
        }
    }

    formatDateForInput(dateString) {
        if (!dateString) return '';
        try {
            // Parse date from various formats
            let date;
            if (typeof dateString === 'string') {
                // If it's already in YYYY-MM-DD format, return as is
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                    return dateString;
                }
                // Try to parse ISO format or other formats
                date = new Date(dateString);
            } else {
                date = new Date(dateString);
            }
            
            if (isNaN(date.getTime())) {
                // Try to extract date part if it's in ISO format with time
                const datePart = dateString.split('T')[0];
                if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
                    return datePart;
                }
                return '';
            }
            
            // Format to YYYY-MM-DD for date input
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (e) {
            console.warn('Error formatting date for input:', dateString, e);
            return '';
        }
    }

    updateDateTime() {
        const now = new Date();
        const dateElement = document.getElementById('currentDate');
        const timeElement = document.getElementById('currentTime');
        const todayDateElement = document.getElementById('todayDate');

        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('vi-VN');
        }
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }
        if (todayDateElement) {
            todayDateElement.textContent = now.toLocaleDateString('vi-VN');
        }
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'classes': 'Lớp học',
            'assignments': 'Bài tập',
            'grades': 'Điểm số',
            'schedule': 'Lịch học',
            'messages': 'Tin nhắn',
            'history': 'Lịch sử',
            'support': 'Hỗ trợ'
        };
        const pageTitleEl = document.getElementById('pageTitle');
        if (pageTitleEl) pageTitleEl.textContent = titles[sectionName];

        // Show section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        this.currentSection = sectionName;

        // Load section-specific data
        if (sectionName === 'schedule') {
            this.loadSchedule();
        } else if (sectionName === 'support') {
            this.loadSupportRequests();
        } else if (sectionName === 'history') {
            this.loadHistory();
        }
    }

    // Filter methods
    filterClasses() {
        const searchTerm = document.getElementById('classSearch').value.toLowerCase();
        const filterValue = document.getElementById('classFilter').value;

        const classCards = document.querySelectorAll('.class-card');
        classCards.forEach(card => {
            const className = card.querySelector('h3').textContent.toLowerCase();
            const status = card.querySelector('.status-badge')?.textContent.toLowerCase() || 'active';

            const matchesSearch = className.includes(searchTerm);
            const matchesFilter = filterValue === 'all' || status.includes(filterValue);

            card.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
        });
    }

    filterAssignments() {
        const searchTerm = document.getElementById('assignmentSearch').value.toLowerCase();
        const statusFilter = document.getElementById('assignmentStatusFilter').value;

        const assignmentCards = document.querySelectorAll('.assignment-card');
        assignmentCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const status = card.classList.contains('submitted') ? 'submitted' :
                          card.classList.contains('overdue') ? 'overdue' : 'pending';

            const matchesSearch = title.includes(searchTerm);
            const matchesFilter = statusFilter === 'all' || status === statusFilter;

            card.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
        });
    }

    filterGrades() {
        // Implementation for grade filtering
        console.log('Filtering grades...');
    }

    // Interactive Action Methods
    viewClassDetails(classId) {
        const classData = this.studentData?.classes?.find(c => c.classId === classId);
        if (!classData) {
            this.showError('Không tìm thấy thông tin lớp học');
            return;
        }

        // Create detailed modal content
        const modalContent = `
            <div class="class-detail-modal">
                <div class="class-detail-header">
                    <h3>${classData.className}</h3>
                    <div class="class-status-badge ${classData.status === 'active' ? 'active' : 'completed'}">
                        ${classData.status === 'active' ? 'Đang học' : 'Đã hoàn thành'}
                    </div>
                </div>

                <div class="class-detail-grid">
                    <div class="detail-section">
                        <h4><i class="fas fa-info-circle"></i> Thông tin cơ bản</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Giáo viên:</label>
                                <span>${classData.teacherName}</span>
                            </div>
                            <div class="detail-item">
                                <label>Sĩ số:</label>
                                <span>${classData.studentCount} học sinh</span>
                            </div>
                            <div class="detail-item">
                                <label>Lịch học:</label>
                                <span>${classData.schedule}</span>
                            </div>
                            <div class="detail-item">
                                <label>Phòng:</label>
                                <span>${classData.room}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4><i class="fas fa-chart-bar"></i> Thống kê</h4>
                        <div class="stats-grid-mini">
                            <div class="stat-mini">
                                <span class="stat-value">${classData.averageGrade.toFixed(1)}</span>
                                <span class="stat-label">Điểm TB</span>
                            </div>
                            <div class="stat-mini">
                                <span class="stat-value">${classData.attendancePercentage}%</span>
                                <span class="stat-label">Tham gia</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="class-actions-modal">
                    <button class="btn btn-primary" onclick="dashboard.joinClassSession('${classId}')">
                        <i class="fas fa-video"></i> Tham gia lớp học
                    </button>
                    <button class="btn btn-info" onclick="dashboard.viewClassMaterials('${classId}')">
                        <i class="fas fa-book"></i> Tài liệu học tập
                    </button>
                    <button class="btn btn-secondary" onclick="dashboard.exportClassReport('${classId}')">
                        <i class="fas fa-download"></i> Xuất báo cáo
                    </button>
                </div>
            </div>
        `;

        this.showModal('Chi tiết lớp học', modalContent, 'large-modal');
    }

    viewClassmates(classId) {
        // Show empty state for classmates
        const modalContent = `
            <div class="classmates-modal">
                <div class="classmates-header">
                    <h4>Danh sách bạn học</h4>
                    <div class="classmates-count">0 học sinh</div>
                </div>
                <div class="classmates-list">
                    <div class="empty-activity">
                        <i class="fas fa-users"></i>
                        <p>Chưa có bạn học nào</p>
                    </div>
                </div>
            </div>
        `;

        this.showModal('Danh sách bạn học', modalContent, 'large-modal');
    }

    viewGradeDetails(gradeId) {
        const grade = this.studentData?.grades?.find(g => g.gradeId === gradeId);
        if (!grade) return;

        const modalContent = `
            <div class="grade-detail-modal">
                <div class="grade-detail-header">
                    <h3>Chi tiết điểm số</h3>
                    <div class="grade-display-large ${this.getGradeBadgeClass(grade.score)}">
                        ${grade.score}/10
                    </div>
                </div>

                <div class="grade-detail-content">
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Môn học:</label>
                            <span>${grade.subject}</span>
                        </div>
                        <div class="detail-item">
                            <label>Lớp:</label>
                            <span>${grade.className}</span>
                        </div>
                        <div class="detail-item">
                            <label>Loại điểm:</label>
                            <span>${grade.gradeType}</span>
                        </div>
                        <div class="detail-item">
                            <label>Giáo viên:</label>
                            <span>${grade.teacherName}</span>
                        </div>
                        <div class="detail-item">
                            <label>Ngày chấm:</label>
                            <span>${this.formatDate(grade.gradedAt)}</span>
                        </div>
                    </div>

                    ${grade.feedback ? `
                        <div class="grade-feedback">
                            <h4>Nhận xét chi tiết:</h4>
                            <p>${grade.feedback}</p>
                        </div>
                    ` : ''}

                    <div class="grade-actions">
                        <button class="btn btn-info" onclick="dashboard.requestGradeReview('${gradeId}')">
                            <i class="fas fa-question-circle"></i> Yêu cầu phúc khảo
                        </button>
                        <button class="btn btn-secondary" onclick="dashboard.downloadGradeReport('${gradeId}')">
                            <i class="fas fa-download"></i> Tải báo cáo
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.showModal('Chi tiết điểm số', modalContent, 'large-modal');
    }

    // Additional Interactive Methods
    joinClassSession(classId) {
        this.showNotification('Đang kết nối đến lớp học...', 'info');
        setTimeout(() => {
            this.showNotification('Đã tham gia lớp học thành công!', 'success');
        }, 2000);
    }

    viewClassMaterials(classId) {
        const modalContent = `
            <div class="materials-modal">
                <h3>Tài liệu học tập</h3>
                <div class="materials-list">
                    <div class="empty-activity">
                        <i class="fas fa-book"></i>
                        <p>Chưa có tài liệu nào</p>
                    </div>
                </div>
            </div>
        `;

        this.showModal('Tài liệu học tập', modalContent, 'large-modal');
    }

    exportClassReport(classId) {
        this.showNotification('Đang xuất báo cáo lớp học...', 'info');
        setTimeout(() => {
            this.showNotification('Đã xuất báo cáo thành công!', 'success');
        }, 2000);
    }

    downloadSubmission(assignmentId) {
        this.showNotification('Đang tải xuống bài làm...', 'info');
        setTimeout(() => {
            this.showNotification('Đã tải xuống thành công!', 'success');
        }, 1500);
    }

    downloadMaterial(filename) {
        this.showNotification(`Đang tải xuống ${filename}...`, 'info');
        setTimeout(() => {
            this.showNotification('Đã tải xuống thành công!', 'success');
        }, 1500);
    }

    requestGradeReview(gradeId) {
        if (confirm('Bạn có chắc muốn yêu cầu phúc khảo điểm số này?')) {
            this.showNotification('Đã gửi yêu cầu phúc khảo. Giáo viên sẽ xem xét trong vòng 24-48 giờ.', 'success');
        }
    }

    downloadGradeReport(gradeId) {
        this.showNotification('Đang xuất báo cáo điểm...', 'info');
        setTimeout(() => {
            this.showNotification('Đã xuất báo cáo thành công!', 'success');
        }, 1500);
    }

    // Modal Management
    showModal(title, content, modalClass = '') {
        // Close any existing modals first
        this.closeModal();

        const modal = document.createElement('div');
        modal.className = `modal ${modalClass}`;
        modal.innerHTML = `
            <div class="modal-overlay" onclick="dashboard.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="dashboard.closeModal()" aria-label="Đóng">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        // Add keyboard navigation
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Focus management
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }

        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.querySelector('.modal.active');
        if (modal) {
            // Remove beforeunload and visibilitychange handlers if assignment modal
            if (modal.classList.contains('assignment-modal')) {
                if (modal._beforeUnloadHandler) {
                    window.removeEventListener('beforeunload', modal._beforeUnloadHandler);
                    delete modal._beforeUnloadHandler;
                }
                if (modal._visibilityChangeHandler) {
                    document.removeEventListener('visibilitychange', modal._visibilityChangeHandler);
                    delete modal._visibilityChangeHandler;
                }
            }
            
            modal.classList.remove('active');
            // Restore body scroll
            document.body.style.overflow = '';
            setTimeout(() => modal.remove(), 300);
        }
        // Also close assignment workspace modal if exists
        const assignmentModal = document.getElementById('assignmentWorkspaceModal');
        if (assignmentModal) {
            assignmentModal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => assignmentModal.remove(), 300);
        }
    }

    // Notification System
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <div>
                    <div>${message}</div>
                </div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);

        // Add click to dismiss
        notification.addEventListener('click', () => notification.remove());
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    // Quick Actions
    quickAction(action) {
        switch (action) {
            case 'joinClass':
                this.showModal('Tham gia lớp học', `
                    <div class="quick-action-modal">
                        <p>Nhập mã lớp học để tham gia:</p>
                        <div class="form-group">
                            <input type="text" id="classCode" placeholder="Ví dụ: MATH101" class="form-input">
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-primary" onclick="dashboard.joinClassByCode()">
                                Tham gia lớp
                            </button>
                            <button class="btn btn-secondary" onclick="dashboard.closeModal()">
                                Hủy
                            </button>
                        </div>
                    </div>
                `);
                break;

            case 'viewSchedule':
                this.switchSection('schedule');
                this.loadSchedule();
                this.closeModal();
                break;

            case 'submitAssignment':
                this.switchSection('assignments');
                this.closeModal();
                break;
        }
    }

    // Global functions for HTML onclick handlers
    joinNewClass() {
        this.quickAction('joinClass');
    }

    viewAllActivity() {
        this.showModal('Tất cả hoạt động', `
            <div class="all-activity-modal">
                <div class="activity-filters">
                    <select class="form-select" id="activityFilter">
                        <option value="all">Tất cả hoạt động</option>
                        <option value="assignments">Bài tập</option>
                        <option value="grades">Điểm số</option>
                        <option value="classes">Lớp học</option>
                    </select>
                    <input type="date" class="form-input" id="activityDate">
                </div>
                <div class="activity-list-full" id="fullActivityList">
                    <div class="empty-activity">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có hoạt động nào</p>
                    </div>
                </div>
            </div>
        `);
    }

    updateGradeChart() {
        // Implementation for updating grade chart based on period
        console.log('Updating grade chart...');
    }

    closeErrorModal() {
        const modal = document.getElementById('errorModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    retryLastAction() {
        // Retry the last failed action
        console.log('Retrying last action...');
    }

    markAllAsRead() {
        this.markAllAsRead();
    }

    sendMessage() {
        this.sendMessage();
    }

    filterMessages(filter) {
        this.filterMessages(filter);
    }

    searchMessages() {
        this.searchMessages();
    }

    viewWeeklySchedule() {
        // Implementation for viewing weekly schedule
        console.log('Viewing weekly schedule...');
    }

    createSupportRequest() {
        this.createSupportRequest();
    }

    cancelSupportRequest() {
        this.cancelSupportRequest();
    }

    submitSupportRequest(event) {
        this.submitSupportRequest(event);
    }

    filterSupportRequests() {
        this.filterSupportRequests();
    }

    searchSupportRequests() {
        this.searchSupportRequests();
    }

    exportHistory() {
        this.exportHistory();
    }

    switchHistoryTab(tab) {
        this.switchHistoryTab(tab);
    }

    filterHistory() {
        this.filterHistory();
    }

    filterClasses() {
        this.filterClasses();
    }

    filterAssignments() {
        this.filterAssignments();
    }

    filterGrades() {
        this.filterGrades();
    }

    exportGrades() {
        this.exportGrades();
    }

    exportSchedule() {
        this.exportSchedule();
    }

    joinClassByCode() {
        const classCode = document.getElementById('classCode').value.trim();
        if (!classCode) {
            this.showError('Vui lòng nhập mã lớp học');
            return;
        }

        this.showLoading();

        // Simulate API call to join class - maps to LopHoc and DangKyLH entities
        setTimeout(async () => {
            try {
                // In a real implementation, this would call the backend API
                // The backend would:
                // 1. Find LopHoc by classCode (ID_LH)
                // 2. Create new DangKyLH record linking HocSinh and LopHoc
                // 3. Set trangThai to 'pending' initially, then 'approved' after admin approval

                // Always use API to join class
                const response = await this.apiCall('/api/student/join-class', {
                    method: 'POST',
                    body: JSON.stringify({
                        classCode: classCode,
                        studentId: this.studentData?.studentId
                    })
                });

                if (response.success) {
                    this.hideLoading();
                    this.closeModal();
                    this.showNotification('Đã gửi yêu cầu tham gia lớp học. Vui lòng chờ phê duyệt!', 'success');
                    // Reload dashboard to get updated data
                    await this.loadDashboardData();
                } else {
                    throw new Error(response.message || 'Không thể tham gia lớp học');
                }

            } catch (error) {
                this.hideLoading();
                this.showError('Không thể tham gia lớp học. Vui lòng thử lại.');
                console.error('Join class failed:', error);
            }
        }, 1500);
    }

    // Calendar Functions
    changeMonth(delta) {
        this.currentMonth += delta;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.updateCalendar();
    }

    // Export Functions
    exportGrades() {
        this.showNotification('Đang xuất bảng điểm...', 'info');
        setTimeout(() => {
            this.showNotification('Đã xuất bảng điểm thành công!', 'success');
        }, 2000);
    }

    exportSchedule() {
        this.showNotification('Đang xuất lịch học...', 'info');
        setTimeout(() => {
            this.showNotification('Đã xuất lịch học thành công!', 'success');
        }, 2000);
    }

    // Message Functions
    filterMessages(filter) {
        console.log('Filtering messages:', filter);
        // Implementation for message filtering
    }

    searchMessages() {
        const searchTerm = document.getElementById('messageSearch').value.toLowerCase();
        console.log('Searching messages:', searchTerm);
        // Implementation for message search
    }

    markAllAsRead() {
        this.showNotification('Đã đánh dấu tất cả tin nhắn là đã đọc', 'success');
    }

    sendMessage() {
        this.showModal('Soạn tin nhắn mới', `
            <div class="message-compose">
                <div class="form-group">
                    <label for="recipient">Người nhận:</label>
                    <select id="recipient" class="form-select">
                        <option value="">Chọn người nhận...</option>
                        <option value="teacher">Giáo viên</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="subject">Tiêu đề:</label>
                    <input type="text" id="subject" class="form-input" placeholder="Nhập tiêu đề...">
                </div>
                <div class="form-group">
                    <label for="messageContent">Nội dung:</label>
                    <textarea id="messageContent" class="form-textarea" rows="5" placeholder="Nhập nội dung tin nhắn..."></textarea>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="dashboard.sendMessageAction()">
                        <i class="fas fa-paper-plane"></i> Gửi tin nhắn
                    </button>
                    <button class="btn btn-secondary" onclick="dashboard.closeModal()">
                        Hủy
                    </button>
                </div>
            </div>
        `);
    }

    sendMessageAction() {
        const recipient = document.getElementById('recipient').value;
        const subject = document.getElementById('subject').value.trim();
        const content = document.getElementById('messageContent').value.trim();

        if (!recipient || !subject || !content) {
            this.showError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.closeModal();
            this.showNotification('Đã gửi tin nhắn thành công!', 'success');
        }, 1000);
    }

    // Activity Functions
    viewAllActivity() {
        this.showModal('Tất cả hoạt động', `
            <div class="all-activity-modal">
                <div class="activity-filters">
                    <select class="form-select" id="activityFilter">
                        <option value="all">Tất cả hoạt động</option>
                        <option value="assignments">Bài tập</option>
                        <option value="grades">Điểm số</option>
                        <option value="classes">Lớp học</option>
                    </select>
                    <input type="date" class="form-input" id="activityDate">
                </div>
                <div class="activity-list-full" id="fullActivityList">
                    <div class="empty-activity">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có hoạt động nào</p>
                    </div>
                </div>
            </div>
        `);
    }

    // Accessibility Features
    initializeAccessibility() {
        // Add ARIA labels and roles
        document.querySelectorAll('.btn').forEach(btn => {
            if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
                const icon = btn.querySelector('i');
                if (icon) {
                    const iconClass = icon.className.split(' ').find(cls => cls.startsWith('fa-'));
                    btn.setAttribute('aria-label', this.getAriaLabelForIcon(iconClass));
                }
            }
        });

        // Keyboard navigation for cards
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const focusedElement = document.activeElement;
                if (focusedElement.classList.contains('class-card') ||
                    focusedElement.classList.contains('assignment-card')) {
                    focusedElement.click();
                }
            }
        });
    }

    getAriaLabelForIcon(iconClass) {
        const labels = {
            'fa-eye': 'Xem chi tiết',
            'fa-users': 'Xem danh sách',
            'fa-play': 'Bắt đầu',
            'fa-download': 'Tải xuống',
            'fa-times': 'Đóng',
            'fa-plus': 'Thêm mới'
        };

        const icon = iconClass.replace('fas ', '').replace('far ', '').replace('fab ', '');
        return labels[icon] || 'Button';
    }

    // Data Caching and Local Calculations
    cacheDashboardData(data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now(),
                version: '1.0'
            };
            localStorage.setItem('mathbridge_dashboard_cache', JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to cache dashboard data:', error);
        }
    }

    loadCachedDashboardData() {
        try {
            const cached = localStorage.getItem('mathbridge_dashboard_cache');
            if (!cached) return null;

            const cacheData = JSON.parse(cached);

            // Check if cache is still valid (24 hours)
            const cacheAge = Date.now() - cacheData.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            if (cacheAge > maxAge) {
                localStorage.removeItem('mathbridge_dashboard_cache');
                return null;
            }

            return cacheData.data;
        } catch (error) {
            console.warn('Failed to load cached data:', error);
            return null;
        }
    }

    // Removed getDefaultDashboardData() - now using API only
    // All data is fetched from /api/portal/student/dashboard endpoint

    calculateLocalMetricsForData(data) {
        // Calculate comprehensive metrics for default data
        data.stats = this.calculateStatsFromData(data);
        this.calculateClassProgressForData(data);
        this.calculateAssignmentStatsForData(data);
        this.calculateGradeAnalyticsForData(data);
    }

    calculateClassProgressForData(data) {
        if (!data.classes) return;

        data.classes.forEach(cls => {
            const classAssignments = data.assignments?.filter(a => a.className === cls.className) || [];
            const classGrades = data.grades?.filter(g => g.className === cls.className) || [];

            // Calculate completion rate
            const completedAssignments = classAssignments.filter(a => a.status === 'submitted' || a.status === 'graded').length;
            cls.completionRate = classAssignments.length > 0 ? Math.round((completedAssignments / classAssignments.length) * 100) : 0;

            // Update average grade for class
            if (classGrades.length > 0) {
                const totalScore = classGrades.reduce((sum, grade) => sum + (grade.score || 0), 0);
                cls.averageGrade = Math.round((totalScore / classGrades.length) * 10) / 10;
            }
        });
    }

    calculateAssignmentStatsForData(data) {
        if (!data.assignments) return;

        const assignments = data.assignments;
        const now = new Date();

        assignments.forEach(assignment => {
            // Check if assignment is overdue
            const dueDate = new Date(assignment.dueDate);
            if (dueDate < now && assignment.status === 'pending') {
                assignment.status = 'overdue';
            }

            // Calculate days remaining
            const timeDiff = dueDate.getTime() - now.getTime();
            assignment.daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

            // Calculate priority based on due date and status
            if (assignment.status === 'overdue') {
                assignment.priority = 'high';
            } else if (assignment.daysRemaining <= 1) {
                assignment.priority = 'high';
            } else if (assignment.daysRemaining <= 3) {
                assignment.priority = 'medium';
            } else {
                assignment.priority = 'low';
            }
        });
    }

    calculateGradeAnalyticsForData(data) {
        if (!data.grades) return;

        const grades = data.grades;

        // Calculate grade distribution
        const distribution = {
            excellent: grades.filter(g => g.score >= 9).length,
            good: grades.filter(g => g.score >= 8 && g.score < 9).length,
            average: grades.filter(g => g.score >= 6.5 && g.score < 8).length,
            poor: grades.filter(g => g.score < 6.5).length
        };

        // Calculate trend (simplified - compare recent vs older grades)
        const recentGrades = grades.slice(0, Math.ceil(grades.length / 2));
        const olderGrades = grades.slice(Math.ceil(grades.length / 2));

        const recentAvg = recentGrades.length > 0 ?
            recentGrades.reduce((sum, g) => sum + g.score, 0) / recentGrades.length : 0;
        const olderAvg = olderGrades.length > 0 ?
            olderGrades.reduce((sum, g) => sum + g.score, 0) / olderGrades.length : 0;

        const trend = recentAvg > olderAvg ? 'improving' :
                     recentAvg < olderAvg ? 'declining' : 'stable';

        // Add analytics to stats
        data.stats.gradeDistribution = distribution;
        data.stats.gradeTrend = trend;
        data.stats.recentAverage = Math.round(recentAvg * 10) / 10;
    }

    // Removed getDefaultClasses() - classes are now fetched from API
    // Data comes from /api/portal/student/dashboard endpoint which queries the database

    getDefaultAssignments() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);

        return [
            {
                assignmentId: 'ASS001',
                title: 'Bài tập về phương trình bậc hai',
                description: 'Giải các phương trình bậc hai sau: x² - 5x + 6 = 0, 2x² + 3x - 2 = 0, x² - 4 = 0',
                className: 'Toán học nâng cao 10',
                dueDate: tomorrow.toISOString(),
                status: 'pending',
                grade: null,
                submittedAt: null,
                gradedAt: null,
                feedback: null
            },
            {
                assignmentId: 'ASS002',
                title: 'Bài tập về giải tích - Đạo hàm',
                description: 'Tính đạo hàm của các hàm số sau: f(x) = x³ + 2x² - 3x + 1, g(x) = sin(x)cos(x), h(x) = e^x/x',
                className: 'Giải tích 11',
                dueDate: nextWeek.toISOString(),
                status: 'submitted',
                grade: 8.5,
                submittedAt: yesterday.toISOString(),
                gradedAt: yesterday.toISOString(),
                feedback: 'Bài làm tốt, cần cải thiện phần trình bày đồ thị'
            },
            {
                assignmentId: 'ASS003',
                title: 'Bài tập về ma trận và định thức',
                description: 'Giải các bài toán về ma trận và định thức: tính định thức, nghịch đảo ma trận, hệ phương trình tuyến tính',
                className: 'Đại số tuyến tính 12',
                dueDate: yesterday.toISOString(),
                status: 'overdue',
                grade: null,
                submittedAt: null,
                gradedAt: null,
                feedback: null
            },
            {
                assignmentId: 'ASS004',
                title: 'Bài tập về giới hạn hàm số',
                description: 'Tính giới hạn của các hàm số sau: lim(x→0) sin(x)/x, lim(x→∞) (1 + 1/x)^x',
                className: 'Toán học nâng cao 10',
                dueDate: nextWeek.toISOString(),
                status: 'graded',
                grade: 9.0,
                submittedAt: yesterday.toISOString(),
                gradedAt: yesterday.toISOString(),
                feedback: 'Bài làm xuất sắc, giải thích rõ ràng và logic'
            }
        ];
    }

    getDefaultGrades() {
        const now = new Date();
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(now.getDate() - 14);
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);

        return [
            {
                gradeId: 'G001',
                subject: 'Toán học',
                className: 'Toán học nâng cao 10',
                gradeType: 'Bài kiểm tra giữa kỳ',
                score: 8.5,
                gradedAt: lastWeek.toISOString(),
                teacherName: 'Thầy Nguyễn Văn Minh',
                feedback: 'Bài làm tốt, cần chú ý cách trình bày'
            },
            {
                gradeId: 'G002',
                subject: 'Giải tích',
                className: 'Giải tích 11',
                gradeType: 'Bài tập đạo hàm',
                score: 9.0,
                gradedAt: twoWeeksAgo.toISOString(),
                teacherName: 'Cô Trần Thị Lan',
                feedback: 'Giải thích rõ ràng, áp dụng tốt các quy tắc đạo hàm'
            },
            {
                gradeId: 'G003',
                subject: 'Đại số tuyến tính',
                className: 'Đại số tuyến tính 12',
                gradeType: 'Bài kiểm tra cuối kỳ',
                score: 7.5,
                gradedAt: lastMonth.toISOString(),
                teacherName: 'Thầy Lê Văn Hùng',
                feedback: 'Cần ôn tập thêm về ma trận nghịch đảo và định thức'
            },
            {
                gradeId: 'G004',
                subject: 'Toán học',
                className: 'Toán học nâng cao 10',
                gradeType: 'Bài tập về đạo hàm',
                score: 8.8,
                gradedAt: lastWeek.toISOString(),
                teacherName: 'Thầy Nguyễn Văn Minh',
                feedback: 'Giải đúng tất cả bài tập, cách làm sáng tạo'
            },
            {
                gradeId: 'G005',
                subject: 'Giải tích',
                className: 'Giải tích 11',
                gradeType: 'Bài tập tích phân',
                score: 6.5,
                gradedAt: twoWeeksAgo.toISOString(),
                teacherName: 'Cô Trần Thị Lan',
                feedback: 'Cần ôn tập thêm các phương pháp tích phân'
            }
        ];
    }

    getDefaultMessages() {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const twoDaysAgo = new Date(now);
        twoDaysAgo.setDate(now.getDate() - 2);

        return [
            {
                id: 'MSG001',
                sender: 'Thầy Nguyễn Văn Minh',
                subject: 'Bài tập phương trình bậc hai',
                preview: 'Các em đã nộp bài tập chưa? Hạn nộp là ngày mai. Hãy kiểm tra lại đáp án...',
                sentAt: yesterday.toISOString(),
                unread: true,
                type: 'teacher'
            },
            {
                id: 'MSG002',
                sender: 'Cô Trần Thị Lan',
                subject: 'Thông báo lịch học tuần sau',
                preview: 'Tuần sau lớp Vật lý sẽ học ở phòng 203 thay vì phòng 201. Các em chú ý nhé.',
                sentAt: twoDaysAgo.toISOString(),
                unread: false,
                type: 'teacher'
            },
            {
                id: 'MSG003',
                sender: 'Admin MathBridge',
                subject: 'Cập nhật hệ thống',
                preview: 'Hệ thống sẽ bảo trì vào ngày Chủ nhật từ 2:00 - 4:00 AM. Các em thông cảm.',
                sentAt: twoDaysAgo.toISOString(),
                unread: false,
                type: 'admin'
            },
            {
                id: 'MSG004',
                sender: 'Thầy Lê Văn Hùng',
                subject: 'Bài tập về nhà hóa học',
                preview: 'Các em làm bài tập trang 45-46 trong sách giáo khoa. Nộp vào thứ 5 tuần sau.',
                sentAt: yesterday.toISOString(),
                unread: true,
                type: 'teacher'
            }
        ];
    }

    getDefaultStats() {
        return {
            totalClasses: 0,
            pendingAssignments: 0,
            averageGrade: 0,
            todayClasses: 0,
            totalAssignments: 0,
            completedAssignments: 0,
            totalGrades: 0,
            attendanceRate: 0
        };
    }

    calculateLocalMetrics() {
        if (!this.studentData) return;

        // Recalculate statistics based on available data
        this.studentData.stats = this.calculateStatsFromData(this.studentData);

        // Update class progress
        this.calculateClassProgress();

        // Update assignment statistics
        this.calculateAssignmentStats();

        // Update grade analytics
        this.calculateGradeAnalytics();
    }

    calculateStatsFromData(data) {
        const stats = {
            totalClasses: data.classes?.length || 0,
            pendingAssignments: data.assignments?.filter(a => a.status === 'pending').length || 0,
            averageGrade: 0,
            todayClasses: 0,
            totalAssignments: data.assignments?.length || 0,
            completedAssignments: data.assignments?.filter(a => a.status === 'submitted' || a.status === 'graded').length || 0,
            totalGrades: data.grades?.length || 0,
            attendanceRate: 0
        };

        // Calculate average grade
        if (data.grades && data.grades.length > 0) {
            const totalScore = data.grades.reduce((sum, grade) => sum + (grade.score || 0), 0);
            stats.averageGrade = Math.round((totalScore / data.grades.length) * 10) / 10;
        }

        // Calculate attendance rate from classes
        if (data.classes && data.classes.length > 0) {
            const totalAttendance = data.classes.reduce((sum, cls) => sum + (cls.attendancePercentage || 0), 0);
            stats.attendanceRate = Math.round(totalAttendance / data.classes.length);
        }

        // Calculate today's classes (simplified - assuming first class is today)
        stats.todayClasses = data.classes && data.classes.length > 0 ? 1 : 0;

        return stats;
    }

    calculateClassProgress() {
        if (!this.studentData.classes) return;

        // Calculate progress for each class based on assignments and grades
        this.studentData.classes.forEach(cls => {
            const classAssignments = this.studentData.assignments?.filter(a => a.className === cls.className) || [];
            const classGrades = this.studentData.grades?.filter(g => g.className === cls.className) || [];

            // Calculate completion rate
            const completedAssignments = classAssignments.filter(a => a.status === 'submitted' || a.status === 'graded').length;
            cls.completionRate = classAssignments.length > 0 ? Math.round((completedAssignments / classAssignments.length) * 100) : 0;

            // Update average grade for class
            if (classGrades.length > 0) {
                const totalScore = classGrades.reduce((sum, grade) => sum + (grade.score || 0), 0);
                cls.averageGrade = Math.round((totalScore / classGrades.length) * 10) / 10;
            }
        });
    }

    calculateAssignmentStats() {
        if (!this.studentData.assignments) return;

        // Calculate assignment statistics
        const assignments = this.studentData.assignments;
        const now = new Date();

        assignments.forEach(assignment => {
            // Check if assignment is overdue
            const dueDate = new Date(assignment.dueDate);
            if (dueDate < now && assignment.status === 'pending') {
                assignment.status = 'overdue';
            }

            // Calculate days remaining
            const timeDiff = dueDate.getTime() - now.getTime();
            assignment.daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

            // Calculate priority based on due date and status
            if (assignment.status === 'overdue') {
                assignment.priority = 'high';
            } else if (assignment.daysRemaining <= 1) {
                assignment.priority = 'high';
            } else if (assignment.daysRemaining <= 3) {
                assignment.priority = 'medium';
            } else {
                assignment.priority = 'low';
            }
        });
    }

    calculateGradeAnalytics() {
        if (!this.studentData.grades) return;

        const grades = this.studentData.grades;

        // Calculate grade distribution
        const distribution = {
            excellent: grades.filter(g => g.score >= 9).length,
            good: grades.filter(g => g.score >= 8 && g.score < 9).length,
            average: grades.filter(g => g.score >= 6.5 && g.score < 8).length,
            poor: grades.filter(g => g.score < 6.5).length
        };

        // Calculate trend (simplified - compare recent vs older grades)
        const recentGrades = grades.slice(0, Math.ceil(grades.length / 2));
        const olderGrades = grades.slice(Math.ceil(grades.length / 2));

        const recentAvg = recentGrades.length > 0 ?
            recentGrades.reduce((sum, g) => sum + g.score, 0) / recentGrades.length : 0;
        const olderAvg = olderGrades.length > 0 ?
            olderGrades.reduce((sum, g) => sum + g.score, 0) / olderGrades.length : 0;

        const trend = recentAvg > olderAvg ? 'improving' :
                     recentAvg < olderAvg ? 'declining' : 'stable';

        // Add analytics to stats
        this.studentData.stats.gradeDistribution = distribution;
        this.studentData.stats.gradeTrend = trend;
        this.studentData.stats.recentAverage = Math.round(recentAvg * 10) / 10;
    }

    // Performance Optimizations
    initializePerformanceOptimizations() {
        // Lazy load images
        this.lazyLoadImages();

        // Debounce search inputs
        this.debounceSearchInputs();

        // Virtual scrolling for large lists (if needed)
        this.initializeVirtualScrolling();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('loading-skeleton');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    debounceSearchInputs() {
        const debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };

        // Debounce search functions
        this.filterClasses = debounce(this.filterClasses.bind(this), 300);
        this.filterAssignments = debounce(this.filterAssignments.bind(this), 300);
    }

    initializeVirtualScrolling() {
        // Implementation for virtual scrolling on large lists
        // This would be used if we have thousands of items
        console.log('Virtual scrolling initialized');
    }

    // API and utility methods
    async apiCall(endpoint, options = {}) {
        // Get token from localStorage (mb_token or from mb_auth object)
        let token = localStorage.getItem('mb_token');
        if (!token) {
            // Try to get from mb_auth object
            const authData = localStorage.getItem('mb_auth');
            if (authData) {
                try {
                    const auth = JSON.parse(authData);
                    token = auth.token;
                } catch (e) {
                    console.warn('Failed to parse mb_auth:', e);
                }
            }
        }

        if (!token) {
            throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
        }

        // Get base URL from CONFIG (imported from config.js) or use default
        const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG?.BASE_URL) 
            ? CONFIG.BASE_URL 
            : (window.CONFIG?.BASE_URL || 'http://localhost:8080');

        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...(options.headers || {})
            },
            ...(options.body && { body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body) })
        };

        let response;
        try {
            response = await fetch(`${baseUrl}${endpoint}`, config);
        } catch (fetchError) {
            // Handle network errors (connection refused, timeout, etc.)
            if (fetchError.name === 'TypeError' || fetchError.message.includes('Failed to fetch')) {
                throw new Error('ERR_CONNECTION_REFUSED: Không thể kết nối đến server. Vui lòng đảm bảo backend server đang chạy.');
            }
            throw fetchError;
        }

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid, redirect to login
                localStorage.removeItem('mb_auth');
                localStorage.removeItem('mb_token');
                window.location.href = '../../pages/login.html';
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
            const errorData = await response.json().catch(() => ({ message: `API call failed: ${response.status}` }));
            throw new Error(errorData.message || `API call failed: ${response.status}`);
        }

        const data = await response.json();
        return data;
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showError(message) {
        const errorMessageEl = document.getElementById('errorMessage');
        const errorModalEl = document.getElementById('errorModal');
        if (errorMessageEl) errorMessageEl.textContent = message;
        if (errorModalEl) errorModalEl.classList.add('active');
    }

    prefillUserInfoFromAuth() {
        const applyProfile = () => {
            try {
                const authRaw = localStorage.getItem('mb_auth');
                if (!authRaw) {
                    return;
                }

                const auth = JSON.parse(authRaw);
                const payloadUser = auth.user || auth.account || auth.profile || {};
                const nestedUser = (auth.payload && auth.payload.user) ? auth.payload.user : {};
                const merged = { ...payloadUser, ...nestedUser };
                const profile = merged.profile || {};

                const ho = merged.ho ?? profile.ho ?? '';
                const tenDem = merged.tenDem ?? profile.tenDem ?? '';
                const ten = merged.ten ?? profile.ten ?? '';
                const computedName = `${ho} ${tenDem} ${ten}`.replace(/\s+/g, ' ').trim();
                const fullName = merged.fullName || profile.fullName || computedName;
                const email = merged.email || auth.email || profile.email || localStorage.getItem('mb_email');

                const displayName = fullName || email || 'Học sinh MathBridge';

                const setText = (id, value) => {
                    if (!value) return;
                    const el = document.getElementById(id);
                    if (el) {
                        el.textContent = value;
                    }
                };

                setText('headerUserName', displayName);
                setText('userName', displayName);
                setText('sidebarUserName', displayName);
                setText('dropdownUserName', displayName);
                setText('userEmail', email || '');
                setText('dropdownUserEmail', email || '');
            } catch (error) {
                console.warn('Không thể prefill thông tin người dùng từ localStorage:', error);
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', applyProfile, { once: true });
        } else {
            applyProfile();
        }
    }

    updateMessageStats() {
        if (!this.studentData?.messages) return;

        const messages = this.studentData.messages;
        const totalMessages = messages.length;
        const unreadMessages = messages.filter(m => m.unread).length;
        const todayMessages = messages.filter(m => {
            const today = new Date();
            const messageDate = new Date(m.sentAt);
            return messageDate.toDateString() === today.toDateString();
        }).length;
        const urgentMessages = messages.filter(m => m.unread && m.type === 'teacher').length;

        const totalMessagesEl = document.getElementById('totalMessages');
        const unreadMessagesEl = document.getElementById('unreadMessages');
        const todayMessagesEl = document.getElementById('todayMessages');
        const urgentMessagesEl = document.getElementById('urgentMessages');
        
        if (totalMessagesEl) totalMessagesEl.textContent = totalMessages;
        if (unreadMessagesEl) unreadMessagesEl.textContent = unreadMessages;
        if (todayMessagesEl) todayMessagesEl.textContent = todayMessages;
        if (urgentMessagesEl) urgentMessagesEl.textContent = urgentMessages;
    }

    updateUserInfo() {
        if (!this.studentData) return;

        const { fullName, email, studentId, phone, address, gender } = this.studentData;

        // Update header user info
        const userNameElement = document.getElementById('userName');
        const headerUserNameElement = document.getElementById('headerUserName');
        const userEmailElement = document.getElementById('userEmail');

        if (userNameElement) userNameElement.textContent = fullName;
        if (headerUserNameElement) headerUserNameElement.textContent = fullName;
        if (userEmailElement) userEmailElement.textContent = email;

        // Update welcome message
        const welcomeMessageElement = document.getElementById('welcomeMessage');
        if (welcomeMessageElement && fullName) {
            const lastName = fullName.split(' ').pop();
            welcomeMessageElement.textContent = `Chào mừng ${lastName}!`;
        }

        // Update user info in profile section if visible
        const profileNameElement = document.getElementById('profileUserName');
        const profileEmailElement = document.getElementById('profileUserEmail');
        const profileIdElement = document.getElementById('profileUserId');
        const profilePhoneElement = document.getElementById('profileUserPhone');
        const profileAddressElement = document.getElementById('profileUserAddress');
        const profileGenderElement = document.getElementById('profileUserGender');

        if (profileNameElement) profileNameElement.textContent = fullName || '';
        if (profileEmailElement) profileEmailElement.textContent = email || '';
        if (profileIdElement) profileIdElement.textContent = studentId || '';
        if (profilePhoneElement) profilePhoneElement.textContent = phone || '';
        if (profileAddressElement) profileAddressElement.textContent = address || '';
        if (profileGenderElement) profileGenderElement.textContent = gender !== null ? (gender ? 'Nữ' : 'Nam') : '';

        // Update sidebar user name
        this.updateSidebarUserName();

        // Update dropdown user info
        this.updateDropdownUserInfo();
    }

    updateSidebarUserName() {
        const sidebarUserName = document.getElementById('sidebarUserName');
        if (sidebarUserName && this.studentData?.fullName) {
            sidebarUserName.textContent = this.studentData.fullName;
        }
    }

    viewMessage(messageId) {
        const message = this.studentData?.messages?.find(m => m.id === messageId);
        if (!message) return;

        // Mark as read if unread
        if (message.unread) {
            message.unread = false;
            this.loadMessages(); // Refresh messages list
        }

        const modalContent = `
            <div class="message-detail-modal">
                <div class="message-detail-header">
                    <div class="message-sender-info">
                        <div class="sender-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="sender-details">
                            <h4>${message.sender}</h4>
                            <span class="message-date">${this.formatDate(message.sentAt)}</span>
                        </div>
                    </div>
                    <div class="message-actions">
                        <button class="btn btn-sm btn-secondary" onclick="dashboard.replyToMessage('${message.id}')">
                            <i class="fas fa-reply"></i> Trả lời
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="dashboard.deleteMessage('${message.id}')">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                </div>

                <div class="message-detail-content">
                    <div class="message-subject">
                        <h3>${message.subject}</h3>
                    </div>
                    <div class="message-body">
                        <p>${message.preview}</p>
                        ${message.fullContent ? `<div class="message-full-content">${message.fullContent}</div>` : ''}
                    </div>
                </div>

                <div class="message-detail-footer">
                    <div class="message-meta">
                        <span><i class="fas fa-tag"></i> ${message.type === 'teacher' ? 'Giáo viên' : message.type === 'admin' ? 'Admin' : 'Hệ thống'}</span>
                        <span><i class="fas fa-clock"></i> ${this.formatDate(message.sentAt)}</span>
                    </div>
                </div>
            </div>
        `;

        this.showModal('Chi tiết tin nhắn', modalContent, 'large-modal');
    }

    replyToMessage(messageId) {
        const originalMessage = this.studentData?.messages?.find(m => m.id === messageId);
        if (!originalMessage) return;

        this.showModal('Trả lời tin nhắn', `
            <div class="message-reply-modal">
                <div class="original-message">
                    <div class="original-header">
                        <strong>${originalMessage.sender}</strong> - ${this.formatDate(originalMessage.sentAt)}
                    </div>
                    <div class="original-content">
                        <p><strong>${originalMessage.subject}</strong></p>
                        <p>${originalMessage.preview}</p>
                    </div>
                </div>

                <form class="reply-form" onsubmit="dashboard.sendReply(event, '${messageId}')">
                    <div class="form-group">
                        <label for="replySubject">Tiêu đề:</label>
                        <input type="text" id="replySubject" class="form-input" value="Re: ${originalMessage.subject}" required>
                    </div>
                    <div class="form-group">
                        <label for="replyContent">Nội dung trả lời:</label>
                        <textarea id="replyContent" class="form-textarea" rows="6" placeholder="Nhập nội dung trả lời..." required></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> Gửi trả lời
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="dashboard.closeModal()">
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        `);
    }

    sendReply(event, originalMessageId) {
        event.preventDefault();

        const subject = document.getElementById('replySubject').value.trim();
        const content = document.getElementById('replyContent').value.trim();

        if (!subject || !content) {
            this.showError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.closeModal();
            this.showNotification('Đã gửi trả lời thành công!', 'success');
        }, 1000);
    }

    deleteMessage(messageId) {
        if (confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
            // Remove from mock data
            if (this.studentData?.messages) {
                this.studentData.messages = this.studentData.messages.filter(m => m.id !== messageId);
                this.loadMessages();
                this.closeModal();
                this.showNotification('Đã xóa tin nhắn!', 'success');
            }
        }
    }

    startRealTimeUpdates() {
        // Update time every minute
        setInterval(() => this.updateDateTime(), 60000);

        // Check for new data every 5 minutes
        setInterval(() => this.checkForUpdates(), 300000);
    }

    async checkForUpdates() {
        try {
            // Check for new notifications, messages, etc.
            console.log('Checking for updates...');
        } catch (error) {
            console.error('Update check failed:', error);
        }
    }

    // User Dropdown Methods
    toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (!dropdown) {
            console.error('User dropdown not found');
            return;
        }

        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';

        // Update user info in dropdown
        this.updateDropdownUserInfo();
    }

    closeUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    // Sidebar Toggle Methods
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');

        if (!sidebar) {
            console.error('Sidebar not found');
            return;
        }

        const isCollapsed = sidebar.classList.contains('collapsed');

        if (isCollapsed) {
            // Expand sidebar
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('sidebar-collapsed');
            this.showNotification('Đã mở rộng sidebar', 'info');
        } else {
            // Collapse sidebar
            sidebar.classList.add('collapsed');
            mainContent.classList.add('sidebar-collapsed');
            this.showNotification('Đã thu gọn sidebar', 'info');
        }

        // Save sidebar state to localStorage
        localStorage.setItem('sidebarCollapsed', !isCollapsed);
    }

    // Initialize sidebar state from localStorage
    initializeSidebarState() {
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');

        if (sidebarCollapsed && sidebar && mainContent) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('sidebar-collapsed');
        }
    }

    // User Dropdown Methods
    toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdown');

        if (!dropdown) {
            console.error('User dropdown not found');
            return;
        }

        const isVisible = dropdown.classList.contains('active');
        if (isVisible) {
            this.closeUserDropdown();
        } else {
            this.closeAllDropdowns();
            this.openUserDropdown();
        }
    }

    openUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.add('active');
        }
    }

    closeUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }

    closeAllDropdowns() {
        // Close all dropdowns
        const dropdowns = document.querySelectorAll('.user-dropdown');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }

    updateDropdownUserInfo() {
        if (!this.studentData) return;

        const { fullName, email } = this.studentData;

        // Update dropdown user info
        const dropdownName = document.getElementById('dropdownUserName');
        const dropdownEmail = document.getElementById('dropdownUserEmail');

        if (dropdownName) dropdownName.textContent = fullName || 'Loading...';
        if (dropdownEmail) dropdownEmail.textContent = email || 'Loading...';
    }

    updateDropdownUserInfo() {
        if (!this.studentData) return;

        const { fullName, email } = this.studentData;

        const dropdownUserName = document.getElementById('dropdownUserName');
        const dropdownUserEmail = document.getElementById('dropdownUserEmail');

        if (dropdownUserName) dropdownUserName.textContent = fullName || 'Loading...';
        if (dropdownUserEmail) dropdownUserEmail.textContent = email || 'Loading...';
    }

    // Profile Management
    openProfile() {
        if (!this.studentData) {
            this.showNotification('Không thể tải thông tin hồ sơ. Vui lòng thử lại.', 'error');
            return;
        }

        const modalContent = `
            <div class="profile-modal">
                <div class="profile-avatar-section">
                    <div class="profile-avatar-large">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="avatar-upload">
                        <label for="avatarInput" class="avatar-upload-btn">
                            <i class="fas fa-camera"></i>
                        </label>
                        <input type="file" id="avatarInput" accept="image/*" style="display: none;">
                    </div>
                    <h4>${this.studentData.fullName}</h4>
                    <p>Học sinh • ID: ${this.studentData.studentId}</p>
                </div>

                <form class="profile-form">
                    <div class="profile-fields">
                        <div class="form-field">
                            <label for="profileFirstName">Họ</label>
                            <input type="text" id="profileFirstName" value="${this.getNamePart('first')}" required>
                        </div>
                        <div class="form-field">
                            <label for="profileMiddleName">Tên đệm</label>
                            <input type="text" id="profileMiddleName" value="${this.getNamePart('middle')}">
                        </div>
                        <div class="form-field">
                            <label for="profileLastName">Tên</label>
                            <input type="text" id="profileLastName" value="${this.getNamePart('last')}" required>
                        </div>
                        <div class="form-field">
                            <label for="profileEmail">Email</label>
                            <input type="email" id="profileEmail" value="${this.studentData.email || ''}" required>
                        </div>
                        <div class="form-field">
                            <label for="profilePhone">Số điện thoại</label>
                            <input type="tel" id="profilePhone" value="${this.studentData.phone || ''}" placeholder="Ví dụ: 0123 456 789">
                        </div>
                        <div class="form-field">
                            <label for="profileAddress">Địa chỉ</label>
                            <input type="text" id="profileAddress" value="${this.studentData.address || ''}" placeholder="Nhập địa chỉ của bạn">
                        </div>
                        <div class="form-field">
                            <label for="profileBirthDate">Ngày sinh</label>
                            <input type="date" id="profileBirthDate" value="${this.formatDateForInput(this.studentData.birthDate)}">
                        </div>
                        <div class="form-field">
                            <label for="profileGender">Giới tính</label>
                            <select id="profileGender">
                                <option value="">Chọn giới tính</option>
                                <option value="0" ${this.studentData.gender === false || this.studentData.gender === 0 || this.studentData.gender === '0' ? 'selected' : ''}>Nam</option>
                                <option value="1" ${this.studentData.gender === true || this.studentData.gender === 1 || this.studentData.gender === '1' ? 'selected' : ''}>Nữ</option>
                            </select>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn btn-primary" onclick="dashboard.saveProfile()">
                            <i class="fas fa-save"></i> Lưu thay đổi
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="dashboard.closeModal()">
                            <i class="fas fa-times"></i> Hủy
                        </button>
                    </div>
                </form>
            </div>
        `;

        this.showModal('Hồ sơ cá nhân', modalContent, 'profile-modal');

        // Initialize avatar upload
        this.initializeAvatarUpload();
    }

    getNamePart(part) {
        if (!this.studentData?.fullName) return '';

        const nameParts = this.studentData.fullName.split(' ');
        switch (part) {
            case 'first': return nameParts[0] || '';
            case 'last': return nameParts[nameParts.length - 1] || '';
            case 'middle': return nameParts.slice(1, -1).join(' ') || '';
            default: return '';
        }
    }

    initializeAvatarUpload() {
        const avatarInput = document.getElementById('avatarInput');
        if (!avatarInput) return;

        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleAvatarUpload(file);
            }
        });
    }

    handleAvatarUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.showError('Chỉ chấp nhận file hình ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showError('File quá lớn. Vui lòng chọn file dưới 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const avatarLarge = document.querySelector('.profile-avatar-large');
            if (avatarLarge) {
                avatarLarge.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
            }
            this.showNotification('Ảnh đại diện đã được cập nhật', 'success');
        };
        reader.readAsDataURL(file);
    }

    async saveProfile() {
        // Collect form data
        const profileData = {
            firstName: document.getElementById('profileFirstName').value.trim(),
            middleName: document.getElementById('profileMiddleName').value.trim(),
            lastName: document.getElementById('profileLastName').value.trim(),
            email: document.getElementById('profileEmail').value.trim(),
            phone: document.getElementById('profilePhone').value.trim(),
            address: document.getElementById('profileAddress').value.trim(),
            birthDate: document.getElementById('profileBirthDate').value,
            gender: document.getElementById('profileGender').value ? parseInt(document.getElementById('profileGender').value) : null
        };

        // Validation
        if (!profileData.firstName || !profileData.lastName || !profileData.email) {
            this.showError('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (!this.isValidEmail(profileData.email)) {
            this.showError('Email không hợp lệ');
            return;
        }

        // Show loading
        this.showLoading();

        try {
            // Always use API to update profile
            await this.apiCall('/api/portal/student/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });

            this.hideLoading();
            this.closeModal();
            this.showNotification('Hồ sơ đã được cập nhật thành công!', 'success');

            // Reload data from server
            await this.loadDashboardData();

        } catch (error) {
            this.hideLoading();
            this.showError('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
            console.error('Profile update failed:', error);
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Settings Management
    openSettings() {
        const modalContent = `
            <div class="settings-modal">
                <div class="settings-sections">
                    <div class="settings-section">
                        <h4><i class="fas fa-bell"></i> Thông báo</h4>
                        <div class="setting-item">
                            <div class="setting-label">
                                <div class="title">Thông báo bài tập</div>
                                <div class="description">Nhận thông báo khi có bài tập mới</div>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="notifyAssignments" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <div class="setting-label">
                                <div class="title">Thông báo điểm số</div>
                                <div class="description">Nhận thông báo khi có điểm mới</div>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="notifyGrades" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <div class="setting-label">
                                <div class="title">Thông báo tin nhắn</div>
                                <div class="description">Nhận thông báo từ giáo viên</div>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="notifyMessages" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h4><i class="fas fa-palette"></i> Giao diện</h4>
                        <div class="setting-item">
                            <div class="setting-label">
                                <div class="title">Chế độ tối</div>
                                <div class="description">Chuyển sang giao diện tối</div>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="darkMode" onchange="dashboard.toggleDarkMode()">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <div class="setting-label">
                                <div class="title">Ngôn ngữ</div>
                                <div class="description">Chọn ngôn ngữ hiển thị</div>
                            </div>
                            <select class="form-select" id="languageSelect" style="width: auto;">
                                <option value="vi">Tiếng Việt</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h4><i class="fas fa-shield-alt"></i> Bảo mật</h4>
                        <div class="setting-item">
                            <div class="setting-label">
                                <div class="title">Đăng xuất tự động</div>
                                <div class="description">Tự động đăng xuất sau thời gian không hoạt động</div>
                            </div>
                            <select class="form-select" id="autoLogoutSelect" style="width: auto;">
                                <option value="never">Không bao giờ</option>
                                <option value="30">30 phút</option>
                                <option value="60" selected>1 giờ</option>
                                <option value="240">4 giờ</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn btn-primary" onclick="dashboard.saveSettings()">
                        <i class="fas fa-save"></i> Lưu cài đặt
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="dashboard.closeModal()">
                        <i class="fas fa-times"></i> Đóng
                    </button>
                </div>
            </div>
        `;

        this.showModal('Cài đặt', modalContent, 'settings-modal');

        // Load current settings
        this.loadSettings();
    }

    loadSettings() {
        // Load settings from localStorage
        const settings = this.getSettings();

        document.getElementById('notifyAssignments').checked = settings.notifications.assignments;
        document.getElementById('notifyGrades').checked = settings.notifications.grades;
        document.getElementById('notifyMessages').checked = settings.notifications.messages;
        document.getElementById('darkMode').checked = settings.theme.darkMode;
        document.getElementById('languageSelect').value = settings.language;
        document.getElementById('autoLogoutSelect').value = settings.security.autoLogout;
    }

    getSettings() {
        const defaultSettings = {
            notifications: {
                assignments: true,
                grades: true,
                messages: true
            },
            theme: {
                darkMode: false
            },
            language: 'vi',
            security: {
                autoLogout: '60'
            }
        };

        try {
            const saved = localStorage.getItem('student_settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.warn('Failed to load settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        const settings = {
            notifications: {
                assignments: document.getElementById('notifyAssignments').checked,
                grades: document.getElementById('notifyGrades').checked,
                messages: document.getElementById('notifyMessages').checked
            },
            theme: {
                darkMode: document.getElementById('darkMode').checked
            },
            language: document.getElementById('languageSelect').value,
            security: {
                autoLogout: document.getElementById('autoLogoutSelect').value
            }
        };

        try {
            localStorage.setItem('student_settings', JSON.stringify(settings));
            this.showNotification('Cài đặt đã được lưu!', 'success');
            this.closeModal();

            // Apply theme changes immediately
            this.applyTheme(settings.theme.darkMode);

        } catch (error) {
            this.showError('Không thể lưu cài đặt');
            console.error('Settings save failed:', error);
        }
    }

    toggleDarkMode() {
        const isDark = document.getElementById('darkMode').checked;
        this.applyTheme(isDark);
    }

    applyTheme(isDark) {
        document.body.classList.toggle('dark-theme', isDark);
        // Additional theme logic can be added here
    }

    // Activity Log
    openActivityLog() {
        const modalContent = `
            <div class="activity-log-modal">
                <div class="activity-log-container">
                    <div class="empty-activity">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có hoạt động nào</p>
                    </div>
                </div>
            </div>
        `;

        this.showModal('Nhật ký hoạt động', modalContent, 'activity-log-modal');
    }

    // Help & Support
    openNotifications() {
        const modalContent = `
            <div class="notifications-modal">
                <div class="notifications-header">
                    <h4>Thông báo của bạn</h4>
                    <div class="notifications-controls">
                        <button class="btn btn-sm btn-secondary" onclick="dashboard.markAllNotificationsRead()">
                            <i class="fas fa-check-double"></i> Đánh dấu đã đọc tất cả
                        </button>
                    </div>
                </div>

                <div class="notifications-list">
                    <div class="empty-activity">
                        <i class="fas fa-bell"></i>
                        <p>Chưa có thông báo nào</p>
                    </div>
                </div>
            </div>
        `;

        this.showModal('Thông báo', modalContent, 'notifications-modal');
    }

    openHelp() {
        const modalContent = `
            <div class="help-modal">
                <div class="help-content">
                    <div class="help-section">
                        <h4><i class="fas fa-question-circle"></i> Câu hỏi thường gặp</h4>
                        <div class="help-links">
                            <a href="#" class="help-link" onclick="dashboard.showHelpTopic('assignments')">
                                <div class="help-link-icon">
                                    <i class="fas fa-tasks"></i>
                                </div>
                                <div class="help-link-content">
                                    <h5>Làm thế nào để nộp bài tập?</h5>
                                    <p>Hướng dẫn chi tiết cách nộp bài tập online</p>
                                </div>
                            </a>
                            <a href="#" class="help-link" onclick="dashboard.showHelpTopic('grades')">
                                <div class="help-link-icon">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                                <div class="help-link-content">
                                    <h5>Xem điểm số và báo cáo</h5>
                                    <p>Cách xem và tải xuống điểm số của bạn</p>
                                </div>
                            </a>
                            <a href="#" class="help-link" onclick="dashboard.showHelpTopic('schedule')">
                                <div class="help-link-icon">
                                    <i class="fas fa-calendar-alt"></i>
                                </div>
                                <div class="help-link-content">
                                    <h5>Lịch học và thông báo</h5>
                                    <p>Quản lý lịch học và nhận thông báo</p>
                                </div>
                            </a>
                            <a href="#" class="help-link" onclick="dashboard.showHelpTopic('messages')">
                                <div class="help-link-icon">
                                    <i class="fas fa-envelope"></i>
                                </div>
                                <div class="help-link-content">
                                    <h5>Gửi tin nhắn cho giáo viên</h5>
                                    <p>Cách liên lạc với giáo viên và admin</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    <div class="help-section">
                        <h4><i class="fas fa-headset"></i> Liên hệ hỗ trợ</h4>
                        <div class="help-contact">
                            <div class="contact-item">
                                <i class="fas fa-envelope"></i>
                                <div>
                                    <strong>Email hỗ trợ:</strong>
                                    <a href="mailto:support@mathbridge.edu.vn">support@mathbridge.edu.vn</a>
                                </div>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-phone"></i>
                                <div>
                                    <strong>Hotline:</strong>
                                    <a href="tel:1900123456">1900 123 456</a>
                                </div>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-clock"></i>
                                <div>
                                    <strong>Giờ làm việc:</strong>
                                    <span>8:00 - 17:00 (Thứ 2 - Thứ 6)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.showModal('Trợ giúp & Hỗ trợ', modalContent, 'help-modal');
    }

    showHelpTopic(topic) {
        const helpContent = {
            assignments: {
                title: 'Hướng dẫn nộp bài tập',
                content: `
                    <h4>Cách nộp bài tập online:</h4>
                    <ol>
                        <li>Vào phần "Bài tập" trong menu</li>
                        <li>Tìm bài tập cần nộp</li>
                        <li>Click "Làm bài" để mở form nộp</li>
                        <li>Điền câu trả lời và upload file nếu cần</li>
                        <li>Click "Nộp bài" để hoàn thành</li>
                    </ol>
                    <p><strong>Lưu ý:</strong> Sau khi nộp sẽ không thể chỉnh sửa. Hãy kiểm tra kỹ trước khi nộp.</p>
                `
            },
            grades: {
                title: 'Xem điểm số và báo cáo',
                content: `
                    <h4>Cách xem điểm số:</h4>
                    <ol>
                        <li>Vào phần "Điểm số" trong menu</li>
                        <li>Xem bảng điểm chi tiết</li>
                        <li>Click vào từng điểm để xem nhận xét</li>
                        <li>Sử dụng bộ lọc để xem điểm theo môn/lớp</li>
                    </ol>
                    <p><strong>Xuất báo cáo:</strong> Click "Xuất điểm" để tải file PDF báo cáo điểm.</p>
                `
            },
            schedule: {
                title: 'Quản lý lịch học',
                content: `
                    <h4>Xem lịch học:</h4>
                    <ol>
                        <li>Vào phần "Lịch học" trong menu</li>
                        <li>Xem lịch theo tuần/tháng</li>
                        <li>Click vào buổi học để xem chi tiết</li>
                        <li>Sử dụng "Xuất lịch" để tải file</li>
                    </ol>
                    <p><strong>Thông báo:</strong> Hệ thống sẽ gửi thông báo trước mỗi buổi học.</p>
                `
            },
            messages: {
                title: 'Liên lạc với giáo viên',
                content: `
                    <h4>Gửi tin nhắn:</h4>
                    <ol>
                        <li>Vào phần "Tin nhắn" trong menu</li>
                        <li>Click "Soạn tin mới"</li>
                        <li>Chọn người nhận (giáo viên/admin)</li>
                        <li>Viết tiêu đề và nội dung</li>
                        <li>Click "Gửi tin nhắn"</li>
                    </ol>
                    <p><strong>Thời gian phản hồi:</strong> Giáo viên thường phản hồi trong vòng 24 giờ.</p>
                `
            }
        };

        const topicData = helpContent[topic];
        if (topicData) {
            this.showModal(topicData.title, topicData.content);
        }
    }

    markAllNotificationsRead() {
        // Mark all notifications as read
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
        this.showNotification('Đã đánh dấu tất cả thông báo là đã đọc!', 'success');
    }

    logout() {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('student_settings');
            window.location.href = '/login.html';
        }
    }

    initializeCharts() {
        // Charts will be initialized when data is loaded
    }

    // History Section Methods
    loadHistory() {
        // Chỉ load dữ liệu cho tab đang active
        const learningHistory = document.getElementById('learningHistory');
        const registrationsHistory = document.getElementById('registrationsHistory');
        
        if (learningHistory && learningHistory.classList.contains('active')) {
            this.loadAttendedClasses();
        }
        
        if (registrationsHistory && registrationsHistory.classList.contains('active')) {
            this.loadRegistrations();
        } else {
            // Nếu tab registrations chưa active, chỉ load attendedClasses (tab mặc định)
            this.loadAttendedClasses();
        }
        
        this.loadTimeline();
        this.loadHistoryStats();
        this.initializeTimelineFilters();
    }

    loadTimeline() {
        const timelineElement = document.getElementById('courseTimeline');
        if (!this.studentData?.registrations) return;

        const registrations = this.studentData.registrations.sort((a, b) =>
            new Date(b.registrationDate) - new Date(a.registrationDate)
        );

        timelineElement.innerHTML = registrations.map(registration => {
            const statusClass = this.getRegistrationStatusClass(registration.status);
            const statusText = this.getRegistrationStatusText(registration.status);
            const formattedDate = this.formatDate(registration.registrationDate);
            const subjectIcon = this.getSubjectIcon(registration.className);

            // Get attended classes for this course
            const courseClasses = this.studentData.attendedClasses?.filter(cls =>
                cls.className === registration.className
            ) || [];

            const sessionsHtml = courseClasses.length > 0 ? `
                <div class="timeline-sessions">
                    <div class="timeline-sessions-toggle" onclick="dashboard.toggleSessions('${registration.id}')">
                        <i class="fas fa-chevron-right"></i>
                        Xem ${courseClasses.length} buổi học
                    </div>
                    <div class="timeline-sessions-list" id="sessions-${registration.id}">
                        ${courseClasses.map(session => `
                            <div class="session-item">
                                <div class="session-date">
                                    <span class="date">${this.formatDate(session.sessionDate).split('/')[0]}</span>
                                    <span>${this.formatDate(session.sessionDate).split('/')[1]}</span>
                                </div>
                                <div class="session-time">
                                    <span class="time">${session.startTime}</span>
                                    <span>${session.endTime}</span>
                                </div>
                                <div class="session-location">
                                    <i class="fas fa-map-marker-alt"></i>
                                    ${session.room}
                                </div>
                                <div class="session-content">
                                    ${session.content || 'Buổi học đã hoàn thành'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : '';

            return `
                <div class="timeline-item ${statusClass}" onclick="dashboard.toggleSessions('${registration.id}')">
                    <div class="timeline-date">
                        <i class="fas fa-calendar-alt"></i>
                        ${formattedDate}
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-course-name">
                            ${subjectIcon}
                            ${registration.className}
                        </div>
                        <div class="timeline-teacher">
                            <i class="fas fa-user-tie"></i>
                            ${registration.teacherName}
                        </div>
                        <div class="timeline-description">
                            ${registration.description}
                        </div>
                        ${sessionsHtml}
                    </div>
                    <div class="timeline-status ${statusClass}">
                        ${statusText}
                    </div>
                </div>
            `;
        }).join('');
    }

    getSubjectIcon(className) {
        const name = className.toLowerCase();
        if (name.includes('toán') || name.includes('math')) {
            return '<span class="subject-icon">📘</span>';
        } else if (name.includes('hóa') || name.includes('chemistry') || name.includes('chem')) {
            return '<span class="subject-icon">🔬</span>';
        } else if (name.includes('vật lý') || name.includes('physics') || name.includes('phys')) {
            return '<span class="subject-icon">⚙️</span>';
        } else if (name.includes('tiếng anh') || name.includes('english')) {
            return '<span class="subject-icon">📚</span>';
        } else if (name.includes('ngữ văn') || name.includes('literature')) {
            return '<span class="subject-icon">📖</span>';
        } else {
            return '<span class="subject-icon">🎓</span>';
        }
    }

    toggleSessions(registrationId) {
        const sessionsList = document.getElementById(`sessions-${registrationId}`);
        const toggleBtn = sessionsList.previousElementSibling;

        if (sessionsList && toggleBtn) {
            const isExpanded = sessionsList.classList.contains('expanded');
            if (isExpanded) {
                sessionsList.classList.remove('expanded');
                toggleBtn.classList.remove('expanded');
            } else {
                sessionsList.classList.add('expanded');
                toggleBtn.classList.add('expanded');
            }
        }
    }

    loadHistoryStats() {
        if (!this.studentData) return;

        const totalCourses = this.studentData.registrations?.length || 0;
        const completedCourses = this.studentData.registrations?.filter(r => r.status === 'completed').length || 0;
        const totalSessions = this.studentData.attendedClasses?.length || 0;
        const attendedSessions = totalSessions; // Assuming all listed sessions were attended

        const totalCoursesEl = document.getElementById('totalCourses');
        const completedCoursesEl = document.getElementById('completedCourses');
        const totalSessionsEl = document.getElementById('totalSessions');
        const attendedSessionsEl = document.getElementById('attendedSessions');
        
        if (totalCoursesEl) totalCoursesEl.textContent = totalCourses;
        if (completedCoursesEl) completedCoursesEl.textContent = completedCourses;
        if (totalSessionsEl) totalSessionsEl.textContent = totalSessions;
        if (attendedSessionsEl) attendedSessionsEl.textContent = attendedSessions;
    }

    initializeTimelineFilters() {
        // Timeline filter functionality
        const timelineFilter = document.getElementById('timelineDisplayFilter');
        if (timelineFilter) {
            timelineFilter.addEventListener('change', () => this.filterTimeline());
        }

        // Program filter functionality
        const programFilter = document.getElementById('programFilter');
        if (programFilter) {
            programFilter.addEventListener('change', () => this.filterByProgram());
        }

        // History type filter
        const historyTypeFilter = document.getElementById('historyTypeFilter');
        if (historyTypeFilter) {
            historyTypeFilter.addEventListener('change', () => this.filterHistoryType());
        }

        // Date range filter
        const dateRangeFilter = document.getElementById('dateRangeFilter');
        if (dateRangeFilter) {
            dateRangeFilter.addEventListener('change', () => this.filterDateRange());
        }
    }

    filterTimeline() {
        const filterValue = document.getElementById('timelineDisplayFilter').value;
        const timelineItems = document.querySelectorAll('.timeline-item');

        timelineItems.forEach(item => {
            const status = item.classList.contains('approved') ? 'approved' :
                          item.classList.contains('completed') ? 'completed' :
                          item.classList.contains('pending') ? 'pending' : 'all';

            if (filterValue === 'all' || status === filterValue) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    filterHistoryType() {
        const typeValue = document.getElementById('historyTypeFilter').value;
        // Implementation for history type filtering
        console.log('Filtering by type:', typeValue);
    }

    filterDateRange() {
        const rangeValue = document.getElementById('dateRangeFilter').value;
        // Implementation for date range filtering
        console.log('Filtering by date range:', rangeValue);
    }

    filterByProgram() {
        const programValue = document.getElementById('programFilter').value;
        const timelineItems = document.querySelectorAll('.timeline-item');

        timelineItems.forEach(item => {
            const className = item.querySelector('.timeline-course-name').textContent.toLowerCase();

            let matches = true;
            if (programValue !== 'all') {
                switch (programValue) {
                    case 'math':
                        matches = className.includes('toán') || className.includes('math');
                        break;
                    case 'physics':
                        matches = className.includes('vật lý') || className.includes('physics') || className.includes('phys');
                        break;
                    case 'chemistry':
                        matches = className.includes('hóa') || className.includes('chemistry') || className.includes('chem');
                        break;
                    case 'english':
                        matches = className.includes('tiếng anh') || className.includes('english');
                        break;
                    case 'literature':
                        matches = className.includes('ngữ văn') || className.includes('literature');
                        break;
                    default:
                        matches = true;
                }
            }

            item.style.display = matches ? 'block' : 'none';
        });
    }

    getRegistrationStatusClass(status) {
        const classes = {
            'approved': 'approved',
            'pending': 'pending',
            'rejected': 'pending',
            'completed': 'completed'
        };
        return classes[status] || 'pending';
    }

    getRegistrationStatusText(status) {
        const texts = {
            'approved': 'Đã duyệt',
            'pending': 'Chờ duyệt',
            'rejected': 'Từ chối',
            'completed': 'Hoàn thành'
        };
        return texts[status] || status;
    }

    loadRegistrations() {
        const registrationsList = document.getElementById('registrationsList');
        
        if (!this.studentData?.registrations || registrationsList === null) {
            if (registrationsList) {
                registrationsList.innerHTML = '<p class="empty-state">Chưa có lịch sử đăng ký lớp nào</p>';
            }
            return;
        }

        // Đảm bảo tab được active trước khi render
        const registrationsHistory = document.getElementById('registrationsHistory');
        if (registrationsHistory && !registrationsHistory.classList.contains('active')) {
            registrationsHistory.classList.add('active');
            // Remove active từ tab khác
            const learningHistory = document.getElementById('learningHistory');
            if (learningHistory) {
                learningHistory.classList.remove('active');
            }
        }

        try {
            const html = this.studentData.registrations.map(registration => `
            <div class="history-item">
                <div class="history-icon">
                    <i class="fas fa-clipboard-check"></i>
                </div>
                <div class="history-item-content">
                    <h4>${this.escapeHtml(registration.className || 'Lớp học')}</h4>
                    <div class="history-meta">
                        <span><i class="fas fa-calendar"></i> ${this.formatDate(registration.registrationDate)}</span>
                        <span><i class="fas fa-user-tie"></i> ${this.escapeHtml(registration.teacherName || 'Chưa có giáo viên')}</span>
                        <span class="status-badge ${registration.status}">${this.getRegistrationStatusText(registration.status)}</span>
                    </div>
                    <p>${this.escapeHtml(registration.description || '')}</p>
                    
                    <!-- Thông tin từ LopHoc -->
                    <div class="class-info-details" style="margin-top: 0.75rem; padding: 0.75rem; background: #f8f9fa; border-radius: 4px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; font-size: 0.9rem;">
                            ${registration.loaiNgay ? `<div><strong>Loại ngày:</strong> ${this.escapeHtml(registration.loaiNgay)}</div>` : ''}
                            ${registration.soBuoi ? `<div><strong>Số buổi:</strong> ${this.escapeHtml(registration.soBuoi)}</div>` : ''}
                            ${registration.hinhThucHoc ? `<div><strong>Hình thức:</strong> ${this.escapeHtml(registration.hinhThucHoc)}</div>` : ''}
                            ${registration.mucGiaThang ? `<div><strong>Mức giá/tháng:</strong> ${this.formatCurrency(registration.mucGiaThang)}</div>` : ''}
                            ${registration.trangThaiLop ? `<div><strong>Trạng thái lớp:</strong> ${this.escapeHtml(registration.trangThaiLop)}</div>` : ''}
                        </div>
                    </div>
                    
                    <!-- Thông tin từ HoaDon -->
                    ${registration.invoiceId ? `
                    <div class="invoice-info" style="margin-top: 0.75rem; padding: 0.75rem; background: #e7f3ff; border-radius: 4px; border-left: 3px solid #2196F3;">
                        <h5 style="margin: 0 0 0.5rem 0; color: #2196F3; font-size: 0.95rem;">
                            <i class="fas fa-receipt"></i> Hóa đơn: ${this.escapeHtml(registration.invoiceId)}
                        </h5>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; font-size: 0.9rem;">
                            ${registration.ngayDangKy ? `<div><strong>Ngày đăng ký:</strong> ${this.escapeHtml(registration.ngayDangKy)}</div>` : ''}
                            ${registration.ngayThanhToan ? `<div><strong>Ngày thanh toán:</strong> ${this.escapeHtml(registration.ngayThanhToan)}</div>` : ''}
                            ${registration.hanThanhToan ? `<div><strong>Hạn thanh toán:</strong> ${this.escapeHtml(registration.hanThanhToan)}</div>` : ''}
                            ${registration.soThang ? `<div><strong>Số tháng:</strong> ${this.escapeHtml(registration.soThang)}</div>` : ''}
                            ${registration.tongTien ? `<div><strong>Tổng tiền:</strong> ${this.formatCurrency(registration.tongTien)}</div>` : ''}
                            ${registration.trangThaiHoaDon ? `<div><strong>Trạng thái:</strong> <span class="status-badge ${registration.trangThaiHoaDon}">${this.escapeHtml(registration.trangThaiHoaDon)}</span></div>` : ''}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${registration.rating ? `
                    <div class="rating-display" style="margin-top: 0.75rem;">
                        <span style="color: #ffc107;">
                            ${'★'.repeat(registration.rating)}${'☆'.repeat(5 - registration.rating)}
                        </span>
                        ${registration.ratingComment ? `<p style="margin-top: 0.25rem; font-size: 0.9rem; color: var(--text-secondary);">${this.escapeHtml(registration.ratingComment)}</p>` : ''}
                    </div>
                    ` : ''}
                    <div class="history-actions" style="margin-top: 0.75rem;">
                        ${(registration.status === 'approved' || registration.status === 'completed') && !registration.rating ? `
                        <button class="btn btn-sm btn-primary" onclick="dashboard.rateClass('${registration.id}', '${this.escapeHtml(registration.className)}')">
                            <i class="fas fa-star"></i> Đánh giá lớp học
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
            
            registrationsList.innerHTML = html;
        } catch (error) {
            console.error('Error rendering registrations:', error);
            registrationsList.innerHTML = '<p class="empty-state">Lỗi khi hiển thị lịch sử đăng ký: ' + error.message + '</p>';
        }
    }

    loadAttendedClasses() {
        const classesHistoryList = document.getElementById('classesHistoryList');
        if (!this.studentData?.attendedClasses || classesHistoryList === null) {
            if (classesHistoryList) {
                classesHistoryList.innerHTML = '<p class="empty-state">Chưa có lịch sử học tập nào</p>';
            }
            return;
        }

        // Group attended classes by classId and remove duplicates
        const classesMap = new Map();
        const sessionKeys = new Set(); // Track unique sessions: classId_sessionNumber
        
        this.studentData.attendedClasses.forEach(attendedClass => {
            const classId = attendedClass.classId || 'unknown';
            const sessionNumber = attendedClass.sessionNumber || 0;
            
            // Skip invalid sessions
            if (sessionNumber <= 0) return;
            
            // Create unique key for this session
            const sessionKey = `${classId}_${sessionNumber}`;
            
            // Skip if we've already seen this session
            if (sessionKeys.has(sessionKey)) return;
            sessionKeys.add(sessionKey);
            
            if (!classesMap.has(classId)) {
                classesMap.set(classId, {
                    classId: classId,
                    className: attendedClass.className || 'Lớp học',
                    teacherName: attendedClass.teacherName || 'Chưa có giáo viên',
                    sessions: []
                });
            }
            classesMap.get(classId).sessions.push(attendedClass);
        });

        // Sort sessions by sessionNumber within each class
        classesMap.forEach((classData, classId) => {
            classData.sessions.sort((a, b) => {
                const numA = a.sessionNumber || 0;
                const numB = b.sessionNumber || 0;
                return numA - numB;
            });
        });

        // Render grouped classes
        if (classesMap.size === 0) {
            classesHistoryList.innerHTML = '<p class="empty-state">Chưa có lịch sử học tập nào</p>';
            return;
        }

        classesHistoryList.innerHTML = Array.from(classesMap.values()).map(classData => {
            const sessionsHtml = classData.sessions.map(session => {
                const sessionDate = session.sessionDate ? this.formatDate(session.sessionDate) : 'Chưa có ngày';
                const startTime = session.startTime ? session.startTime.substring(0, 5) : 'N/A';
                const endTime = session.endTime ? session.endTime.substring(0, 5) : 'N/A';
                
                return `
                    <div class="session-card">
                        <div class="session-header">
                            <div class="session-number-badge">Buổi ${session.sessionNumber || 'N/A'}</div>
                            <button class="btn btn-sm btn-primary" onclick="dashboard.rateSession('${session.id}', '${this.escapeHtml(session.className)}', ${session.sessionNumber})">
                                <i class="fas fa-star"></i> Đánh giá
                            </button>
                        </div>
                        <div class="session-details">
                            <div class="session-info-row">
                                <span class="session-info-item">
                                    <i class="fas fa-calendar"></i> ${sessionDate}
                                </span>
                                <span class="session-info-item">
                                    <i class="fas fa-clock"></i> ${startTime} - ${endTime}
                                </span>
                                <span class="session-info-item">
                                    <i class="fas fa-map-marker-alt"></i> ${this.escapeHtml(session.room || 'Chưa có phòng')}
                                </span>
                            </div>
                            ${session.content ? `<p class="session-content">${this.escapeHtml(session.content)}</p>` : ''}
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="class-history-group">
                    <div class="class-history-header">
                        <div class="class-info">
                            <h3>${this.escapeHtml(classData.className)}</h3>
                            <p class="teacher-info">
                                <i class="fas fa-user-tie"></i> Giáo viên: ${this.escapeHtml(classData.teacherName)}
                            </p>
                        </div>
                    </div>
                    <div class="sessions-container">
                        ${sessionsHtml}
                    </div>
                </div>
            `;
        }).join('');
    }

    getRegistrationStatusText(status) {
        const texts = {
            'approved': 'Đã duyệt',
            'pending': 'Chờ duyệt',
            'rejected': 'Từ chối',
            'completed': 'Hoàn thành'
        };
        return texts[status] || status;
    }

    // Support Section Methods
    async loadSupportRequests() {
        const supportRequestsList = document.getElementById('supportRequestsList');
        const supportEmptyState = document.getElementById('supportEmptyState');

        // Always fetch support requests from API
        try {
            const response = await this.apiCall('/api/portal/support');
            console.log('Support requests API response:', response);
            
            // Handle different response structures
            let requestsData = [];
            if (response && response.success && response.data) {
                requestsData = response.data;
            } else if (response && Array.isArray(response)) {
                // Direct array response
                requestsData = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                requestsData = response.data;
            }
            
            this.studentData.supportRequests = requestsData.map(req => ({
                id: req.id || req.idYc,
                type: req.type || req.loaiYeuCau,
                title: req.title || req.tieuDe,
                description: req.description || req.noiDung,
                className: req.className || req.tenLop,
                status: req.status || req.trangThai || 'pending',
                createdAt: req.createdAt || req.thoiDiemTao,
                respondedAt: req.respondedAt || req.thoiDiemDong,
                fileUrl: req.fileUrl || req.fileURL
            }));
            
            console.log('Processed support requests:', this.studentData.supportRequests);
        } catch (error) {
            console.error('Failed to load support requests from API:', error);
            this.studentData.supportRequests = [];
        }

        if (!supportRequestsList) return;

        // Update stats
        this.updateSupportStats();

        // Show empty state if no requests
        if (!this.studentData?.supportRequests || this.studentData.supportRequests.length === 0) {
            if (supportEmptyState) {
                supportEmptyState.style.display = 'block';
            }
            if (supportRequestsList) {
                supportRequestsList.innerHTML = '';
            }
            return;
        }

        // Hide empty state
        if (supportEmptyState) {
            supportEmptyState.style.display = 'none';
        }

        // Render support requests
        supportRequestsList.innerHTML = this.studentData.supportRequests.map(request => `
            <div class="support-request-card">
                <div class="support-request-header">
                    <h4>${this.escapeHtml(request.title || 'Không có tiêu đề')}</h4>
                    <div class="support-status ${request.status || 'pending'}">
                        ${this.getSupportStatusText(request.status || 'pending')}
                    </div>
                </div>
                <div class="support-request-body">
                    <div class="support-meta">
                        <span><i class="fas fa-tag"></i> ${this.getSupportTypeText(request.type || 'other')}</span>
                        <span><i class="fas fa-calendar"></i> ${this.formatDate(request.createdAt)}</span>
                        ${request.className ? `<span><i class="fas fa-graduation-cap"></i> ${this.escapeHtml(request.className)}</span>` : ''}
                    </div>
                    <p class="support-description">${this.escapeHtml(request.description || '')}</p>
                </div>
                <div class="support-request-actions">
                    <button class="btn btn-sm btn-info" onclick="dashboard.viewSupportRequest('${request.id}')">
                        <i class="fas fa-eye"></i> Xem chi tiết
                    </button>
                    ${request.status === 'pending' || request.status === 'processing' ? `
                    <button class="btn btn-sm btn-danger" onclick="dashboard.deleteSupportRequest('${request.id}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    updateSupportStats() {
        if (!this.studentData?.supportRequests) return;

        const activeRequests = this.studentData.supportRequests.filter(
            req => req.status === 'pending' || req.status === 'processing'
        ).length;
        const resolvedRequests = this.studentData.supportRequests.filter(
            req => req.status === 'resolved' || req.status === 'closed'
        ).length;

        const activeEl = document.getElementById('activeRequests');
        const resolvedEl = document.getElementById('resolvedRequests');
        
        if (activeEl) activeEl.textContent = activeRequests;
        if (resolvedEl) resolvedEl.textContent = resolvedRequests;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getSupportStatusText(status) {
        const texts = {
            'pending': 'Chờ xử lý',
            'processing': 'Đang xử lý',
            'resolved': 'Đã giải quyết',
            'closed': 'Đã đóng'
        };
        return texts[status] || status;
    }

    getSupportTypeText(type) {
        if (!type) return 'Khác';
        const texts = {
            'technical': 'Vấn đề kỹ thuật',
            'academic': 'Hỗ trợ học tập',
            'billing': 'Thanh toán & hóa đơn',
            'career': 'Tư vấn hướng nghiệp',
            'emergency': 'Hỗ trợ khẩn cấp',
            'other': 'Khác'
        };
        return texts[type] || type;
    }

    createSupportRequest() {
        const formContainer = document.getElementById('supportFormContainer');
        const requestsContainer = document.getElementById('supportRequestsContainer');
        
        if (formContainer) {
            formContainer.style.display = 'block';
            
            // Populate class dropdown with student's registered classes
            this.populateSupportClassDropdown();
        }
        
        // Ẩn bảng yêu cầu khi đang tạo form
        if (requestsContainer) {
            requestsContainer.style.display = 'none';
        }
    }
    
    populateSupportClassDropdown() {
        const classSelect = document.getElementById('supportClass');
        if (!classSelect) return;
        
        // Clear existing options except the first one
        classSelect.innerHTML = '<option value="">-- Chọn lớp học --</option>';
        
        // Get classes from studentData
        if (this.studentData && this.studentData.classes && this.studentData.classes.length > 0) {
            this.studentData.classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.classId || '';
                option.textContent = cls.className || 'Lớp học';
                classSelect.appendChild(option);
            });
        }
    }

    cancelSupportRequest() {
        const formContainer = document.getElementById('supportFormContainer');
        const requestsContainer = document.getElementById('supportRequestsContainer');
        
        if (formContainer) {
            formContainer.style.display = 'none';
        }
        
        // Hiển thị lại bảng yêu cầu khi đóng form
        if (requestsContainer) {
            requestsContainer.style.display = 'block';
        }
        
        const form = document.getElementById('supportRequestForm');
        if (form) {
            form.reset();
        }
    }

    async submitSupportRequest(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const classId = formData.get('supportClass');
        const supportData = {
            type: formData.get('supportType'),
            title: formData.get('supportTitle'),
            description: formData.get('supportDescription'),
            classId: classId && classId.trim() !== '' ? classId.trim() : null,
            fileUrl: null // File upload will be handled separately in future
        };

        // Validation
        if (!supportData.type || !supportData.title || !supportData.description) {
            this.showNotification('Vui lòng điền đầy đủ thông tin bắt buộc (Loại, Tiêu đề, Mô tả)', 'error');
            return;
        }

        this.showLoading();

        try {
            // Always use API to submit support request
            const response = await this.apiCall('/api/portal/support', {
                method: 'POST',
                body: JSON.stringify(supportData)
            });

            if (response.success) {
                this.hideLoading();
                this.cancelSupportRequest();
                
                // Reload danh sách yêu cầu để cập nhật trạng thái
                await this.loadSupportRequests();
                
                // Cập nhật lại UI để hiển thị yêu cầu mới và trạng thái
                this.updateSupportStats();
                
                this.showNotification('Yêu cầu hỗ trợ đã được gửi thành công!', 'success');
            } else {
                throw new Error(response.message || 'Không thể gửi yêu cầu hỗ trợ');
            }
        } catch (error) {
            this.hideLoading();
            this.showError('Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại.');
            console.error('Submit support request failed:', error);
        }
    }

    async deleteSupportRequest(requestId) {
        if (!confirm('Bạn có chắc chắn muốn xóa yêu cầu hỗ trợ này?')) {
            return;
        }

        this.showLoading();

        try {
            const response = await this.apiCall(`/api/portal/support/${requestId}`, {
                method: 'DELETE'
            });

            if (response && response.success) {
                this.hideLoading();
                this.showNotification('Yêu cầu hỗ trợ đã được xóa thành công!', 'success');
                
                // Reload danh sách yêu cầu
                await this.loadSupportRequests();
                this.updateSupportStats();
            } else {
                throw new Error(response?.message || 'Không thể xóa yêu cầu hỗ trợ');
            }
        } catch (error) {
            this.hideLoading();
            this.showNotification('Không thể xóa yêu cầu hỗ trợ. Vui lòng thử lại.', 'error');
            console.error('Delete support request failed:', error);
        }
    }

    async viewSupportRequest(requestId) {
        let request = this.studentData?.supportRequests?.find(r => r.id === requestId);

        // If not in static mode, try to fetch detailed info from API
        if (!this.isStaticMode() && !request) {
            try {
                const response = await this.apiCall(`/api/portal/support/${requestId}`);
                if (response.success && response.data) {
                    request = {
                        id: response.data.id,
                        type: response.data.type,
                        title: response.data.title,
                        description: response.data.description,
                        className: response.data.className,
                        status: response.data.status,
                        createdAt: response.data.createdAt,
                        response: response.data.response,
                        respondedAt: response.data.respondedAt
                    };
                }
            } catch (error) {
                console.warn('Failed to fetch support request details:', error);
            }
        }

        if (!request) {
            this.showError('Không tìm thấy thông tin yêu cầu hỗ trợ');
            return;
        }

        const modalContent = `
            <div class="support-detail-modal">
                <div class="support-detail-header">
                    <h3>${request.title}</h3>
                    <div class="support-status ${request.status}">
                        ${this.getSupportStatusText(request.status)}
                    </div>
                </div>
                <div class="support-detail-content">
                    <div class="detail-section">
                        <h4>Thông tin yêu cầu</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Loại yêu cầu:</label>
                                <span>${this.getSupportTypeText(request.type)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Thời gian tạo:</label>
                                <span>${this.formatDate(request.createdAt)}</span>
                            </div>
                            ${request.className ? `
                                <div class="detail-item">
                                    <label>Liên quan đến lớp:</label>
                                    <span>${request.className}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="detail-section">
                        <h4>Mô tả chi tiết</h4>
                        <p>${request.description}</p>
                    </div>
                    ${request.response ? `
                        <div class="detail-section">
                            <h4>Phản hồi từ hỗ trợ</h4>
                            <div class="support-response">
                                <p>${request.response}</p>
                                <small>${request.respondedAt ? this.formatDate(request.respondedAt) : ''}</small>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        this.showModal('Chi tiết yêu cầu hỗ trợ', modalContent, 'large-modal');
    }

    // History Tab Switching
    switchHistoryTab(tab) {
        // Remove active class from all tabs
        document.querySelectorAll('.history-tab').forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        const clickedTab = event?.target?.closest('.history-tab') || 
                          document.querySelector(`[onclick*="switchHistoryTab('${tab}')"]`);
        if (clickedTab) {
            clickedTab.classList.add('active');
        }

        // Show/hide content
        document.querySelectorAll('.history-content').forEach(content => content.classList.remove('active'));
        
        if (tab === 'learning') {
            const learningHistory = document.getElementById('learningHistory');
            if (learningHistory) {
                learningHistory.classList.add('active');
            }
            this.loadAttendedClasses();
        } else if (tab === 'registrations') {
            const registrationsHistory = document.getElementById('registrationsHistory');
            if (registrationsHistory) {
                // Active tab trước khi load để đảm bảo hiển thị
                registrationsHistory.classList.add('active');
                // Đảm bảo tab button cũng được active
                document.querySelectorAll('.history-tab').forEach(t => {
                    if (t.textContent.includes('Lịch sử đăng ký lớp')) {
                        t.classList.add('active');
                    } else {
                        t.classList.remove('active');
                    }
                });
            } else {
                console.error('registrationsHistory element not found');
            }
            // Load sau khi tab đã active
            setTimeout(() => {
                this.loadRegistrations();
            }, 0);
        }
    }

    // Rate Class Method
    rateClass(registrationId, className) {
        const modalContent = `
            <div class="rating-modal-content">
                <div class="form-group">
                    <label>Lớp học: <strong>${this.escapeHtml(className)}</strong></label>
                </div>
                <div class="form-group">
                    <label>Đánh giá (1-5 sao):</label>
                    <div class="rating-stars" id="ratingStars" role="group" aria-label="Đánh giá sao">
                        <i class="far fa-star" data-rating="1" onclick="dashboard.selectRating(1)" role="button" aria-label="1 sao" tabindex="0"></i>
                        <i class="far fa-star" data-rating="2" onclick="dashboard.selectRating(2)" role="button" aria-label="2 sao" tabindex="0"></i>
                        <i class="far fa-star" data-rating="3" onclick="dashboard.selectRating(3)" role="button" aria-label="3 sao" tabindex="0"></i>
                        <i class="far fa-star" data-rating="4" onclick="dashboard.selectRating(4)" role="button" aria-label="4 sao" tabindex="0"></i>
                        <i class="far fa-star" data-rating="5" onclick="dashboard.selectRating(5)" role="button" aria-label="5 sao" tabindex="0"></i>
                    </div>
                    <input type="hidden" id="selectedRating" value="0">
                </div>
                <div class="form-group">
                    <label for="ratingComment">Nhận xét:</label>
                    <textarea class="form-control" id="ratingComment" rows="4" placeholder="Nhập nhận xét của bạn về lớp học này..."></textarea>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="dashboard.closeModal()">Hủy</button>
                    <button class="btn btn-primary" onclick="dashboard.submitRating('${registrationId}')">Gửi đánh giá</button>
                </div>
            </div>
        `;
        this.showModal('Đánh giá lớp học', modalContent, 'medium-modal');
        this.currentRatingRegistrationId = registrationId;
        this.currentRating = 0;
    }

    // Rate Session Method (for learning history)
    async rateSession(sessionId, className, sessionNumber) {
        // Load existing rating first
        let existingRating = null;
        try {
            const response = await this.apiCall(`/api/portal/student/session-rating/${sessionId}`);
            if (response && response.success && response.data) {
                existingRating = response.data;
            }
        } catch (error) {
            console.warn('Could not load existing rating:', error);
            // Continue with empty form if error
        }

        const hasExistingRating = existingRating && existingRating.rating;
        const currentRating = hasExistingRating ? existingRating.rating : 0;
        const currentComment = hasExistingRating ? (existingRating.comment || '') : '';

        const modalContent = `
            <div class="rating-modal-content">
                ${hasExistingRating ? `
                    <div class="alert alert-info" style="margin-bottom: 1rem; padding: 0.75rem; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">
                        <i class="fas fa-info-circle"></i> Bạn đã đánh giá buổi học này. Bạn có thể xem lại và sửa đánh giá.
                    </div>
                ` : ''}
                <div class="form-group">
                    <label>Lớp học: <strong>${this.escapeHtml(className)}</strong></label>
                    <p style="margin-top: 0.5rem; color: var(--text-secondary);">Buổi học số: ${sessionNumber}</p>
                </div>
                <div class="form-group">
                    <label>Đánh giá (1-5 sao):</label>
                    <div class="rating-stars" id="ratingStars" role="group" aria-label="Đánh giá sao">
                        <i class="far fa-star" data-rating="1" onclick="dashboard.selectRating(1)" role="button" aria-label="1 sao" tabindex="0"></i>
                        <i class="far fa-star" data-rating="2" onclick="dashboard.selectRating(2)" role="button" aria-label="2 sao" tabindex="0"></i>
                        <i class="far fa-star" data-rating="3" onclick="dashboard.selectRating(3)" role="button" aria-label="3 sao" tabindex="0"></i>
                        <i class="far fa-star" data-rating="4" onclick="dashboard.selectRating(4)" role="button" aria-label="4 sao" tabindex="0"></i>
                        <i class="far fa-star" data-rating="5" onclick="dashboard.selectRating(5)" role="button" aria-label="5 sao" tabindex="0"></i>
                    </div>
                    <input type="hidden" id="selectedRating" value="${currentRating}">
                </div>
                <div class="form-group">
                    <label for="ratingComment">Nhận xét:</label>
                    <textarea class="form-control" id="ratingComment" rows="4" placeholder="Nhập nhận xét của bạn về buổi học này...">${this.escapeHtml(currentComment)}</textarea>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="dashboard.closeModal()">Hủy</button>
                    <button class="btn btn-primary" onclick="dashboard.submitSessionRating('${sessionId}', ${hasExistingRating})">
                        ${hasExistingRating ? '<i class="fas fa-save"></i> Cập nhật đánh giá' : '<i class="fas fa-paper-plane"></i> Gửi đánh giá'}
                    </button>
                </div>
            </div>
        `;
        this.showModal('Đánh giá buổi học', modalContent, 'medium-modal');
        this.currentRatingSessionId = sessionId;
        this.currentRating = currentRating;
        
        // Set initial rating stars if has existing rating
        if (hasExistingRating) {
            this.selectRating(currentRating);
        }
    }

    selectRating(rating) {
        this.currentRating = rating;
        const selectedRatingInput = document.getElementById('selectedRating');
        if (selectedRatingInput) {
            selectedRatingInput.value = rating;
        }
        const stars = document.querySelectorAll('#ratingStars i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('active');
                star.classList.add('far');
                star.classList.remove('fas');
            }
        });
    }

    async submitRating(registrationId) {
        const rating = this.currentRating || parseInt(document.getElementById('selectedRating')?.value || '0');
        const comment = document.getElementById('ratingComment')?.value.trim() || '';

        if (rating === 0) {
            this.showNotification('Vui lòng chọn số sao đánh giá!', 'error');
            return;
        }

        try {
            const response = await this.apiCall('/api/portal/student/rate-class', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    registrationId: registrationId,
                    rating: rating,
                    comment: comment
                })
            });

            if (response && (response.success !== false)) {
                this.showNotification('Đánh giá đã được gửi thành công!', 'success');
                this.closeModal();
                // Reload registrations to show updated rating
                this.loadRegistrations();
            } else {
                throw new Error(response?.message || 'Lỗi khi gửi đánh giá');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            this.showNotification('Lỗi khi gửi đánh giá: ' + (error.message || 'Vui lòng thử lại'), 'error');
        }
    }

    async submitSessionRating(sessionId, isUpdate = false) {
        const rating = this.currentRating || parseInt(document.getElementById('selectedRating')?.value || '0');
        const comment = document.getElementById('ratingComment')?.value.trim() || '';

        if (rating === 0) {
            this.showNotification('Vui lòng chọn số sao đánh giá!', 'error');
            return;
        }

        try {
            const response = await this.apiCall('/api/portal/student/rate-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    rating: rating,
                    comment: comment
                })
            });

            if (response && (response.success !== false)) {
                this.showNotification(
                    isUpdate ? 'Đánh giá buổi học đã được cập nhật thành công!' : 'Đánh giá buổi học đã được gửi thành công!', 
                    'success'
                );
                this.closeModal();
                // Reload attended classes to show updated rating
                this.loadAttendedClasses();
            } else {
                throw new Error(response?.message || 'Lỗi khi gửi đánh giá');
            }
        } catch (error) {
            console.error('Error submitting session rating:', error);
            this.showNotification('Lỗi khi gửi đánh giá: ' + (error.message || 'Vui lòng thử lại'), 'error');
        }
    }

    // Filter and Search Methods
    filterHistory() {
        const filterValue = document.getElementById('historyFilter').value;
        // Implementation for history filtering
        console.log('Filtering history:', filterValue);
    }

    filterSupportRequests() {
        const statusFilter = document.getElementById('supportStatusFilter').value;
        const requestCards = document.querySelectorAll('.support-request-card');

        requestCards.forEach(card => {
            const status = card.querySelector('.support-status').classList[1];
            const matches = statusFilter === 'all' || status === statusFilter;
            card.style.display = matches ? 'block' : 'none';
        });
    }

    searchSupportRequests() {
        const searchTerm = document.getElementById('supportSearch').value.toLowerCase();
        const requestCards = document.querySelectorAll('.support-request-card');

        requestCards.forEach(card => {
            const title = card.querySelector('h4').textContent.toLowerCase();
            const description = card.querySelector('.support-description').textContent.toLowerCase();
            const matches = title.includes(searchTerm) || description.includes(searchTerm);
            card.style.display = matches ? 'block' : 'none';
        });
    }

    exportHistory() {
        this.showNotification('Đang xuất lịch sử...', 'info');
        setTimeout(() => {
            this.showNotification('Đã xuất lịch sử thành công!', 'success');
        }, 2000);
    }

    printHistory() {
        this.showNotification('Đang chuẩn bị in lịch sử...', 'info');
        setTimeout(() => {
            window.print();
            this.showNotification('Đã gửi lịch sử đến máy in!', 'success');
        }, 1000);
    }

    shareHistory() {
        if (navigator.share) {
            navigator.share({
                title: 'Lịch sử học tập - MathBridge',
                text: 'Xem lịch sử học tập của tôi trên MathBridge',
                url: window.location.href + '#history'
            }).then(() => {
                this.showNotification('Đã chia sẻ lịch sử thành công!', 'success');
            }).catch(() => {
                this.showNotification('Đã hủy chia sẻ', 'info');
            });
        } else {
            // Fallback: copy URL to clipboard
            navigator.clipboard.writeText(window.location.href + '#history').then(() => {
                this.showNotification('Đã sao chép liên kết lịch sử vào clipboard!', 'success');
            }).catch(() => {
                this.showNotification('Không thể chia sẻ. Vui lòng sao chép URL thủ công.', 'warning');
            });
        }
    }

    // Mock Data Methods
    getDefaultRegistrations() {
        return [
            {
                id: 'DK001',
                className: 'Toán học nâng cao 10',
                teacherName: 'Thầy Nguyễn Văn Minh',
                registrationDate: '2024-09-01T08:00:00',
                status: 'approved',
                description: 'Lớp học chuyên sâu về đại số và hình học'
            },
            {
                id: 'DK002',
                className: 'Giải tích 11',
                teacherName: 'Cô Trần Thị Lan',
                registrationDate: '2024-09-05T10:30:00',
                status: 'approved',
                description: 'Kiến thức cơ bản về giải tích và đạo hàm'
            },
            {
                id: 'DK003',
                className: 'Đại số tuyến tính 12',
                teacherName: 'Thầy Lê Văn Hùng',
                registrationDate: '2024-08-20T14:00:00',
                status: 'completed',
                description: 'Lớp học chuyên sâu về ma trận và định thức'
            }
        ];
    }

    getDefaultAttendedClasses() {
        return [
            {
                id: 'BH001',
                className: 'Toán học nâng cao 10',
                sessionNumber: 1,
                sessionDate: '2024-09-10T08:00:00',
                startTime: '08:00',
                endTime: '10:00',
                room: 'Phòng 101',
                content: 'Giới thiệu về phương trình bậc hai'
            },
            {
                id: 'BH002',
                className: 'Toán học nâng cao 10',
                sessionNumber: 2,
                sessionDate: '2024-09-12T08:00:00',
                startTime: '08:00',
                endTime: '10:00',
                room: 'Phòng 101',
                content: 'Giải phương trình bậc hai bằng cách khai phương'
            },
            {
                id: 'BH003',
                className: 'Giải tích 11',
                sessionNumber: 1,
                sessionDate: '2024-09-14T10:30:00',
                startTime: '10:30',
                endTime: '12:30',
                room: 'Phòng 203',
                content: 'Khái niệm đạo hàm và quy tắc tính đạo hàm'
            },
            {
                id: 'BH004',
                className: 'Đại số tuyến tính 12',
                sessionNumber: 5,
                sessionDate: '2024-08-30T14:00:00',
                startTime: '14:00',
                endTime: '16:00',
                room: 'Phòng 305',
                content: 'Ma trận nghịch đảo và ứng dụng trong hệ phương trình'
            }
        ];
    }

    getDefaultSupportRequests() {
        return [
            {
                id: 'YC001',
                type: 'technical',
                title: 'Không thể tải bài tập',
                description: 'Tôi không thể tải bài tập về máy. Lỗi hiển thị "File not found".',
                className: 'Toán học nâng cao 10',
                status: 'resolved',
                createdAt: '2024-09-15T09:00:00',
                response: 'Vấn đề đã được khắc phục. Vui lòng thử lại.',
                respondedAt: '2024-09-15T11:30:00'
            },
            {
                id: 'YC002',
                type: 'academic',
                title: 'Cần hỗ trợ bài tập về phương trình bậc hai',
                description: 'Tôi không hiểu cách giải phương trình bậc hai có tham số. Có thể giải thích thêm được không?',
                className: 'Toán học nâng cao 10',
                status: 'processing',
                createdAt: '2024-09-18T14:20:00'
            },
            {
                id: 'YC003',
                type: 'academic',
                title: 'Hỗ trợ về đạo hàm và quy tắc tính đạo hàm',
                description: 'Tôi gặp khó khăn trong việc áp dụng quy tắc tính đạo hàm cho các hàm số phức tạp. Có thể hướng dẫn chi tiết hơn không?',
                className: 'Giải tích 11',
                status: 'pending',
                createdAt: '2024-09-20T16:45:00'
            },
            {
                id: 'YC004',
                type: 'academic',
                title: 'Ma trận nghịch đảo và định thức',
                description: 'Tôi không hiểu cách tính định thức của ma trận 3x3 và ứng dụng trong việc tìm ma trận nghịch đảo.',
                className: 'Đại số tuyến tính 12',
                status: 'pending',
                createdAt: '2024-09-22T10:15:00'
            }
        ];
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new StudentDashboard();
    
    // Expose functions to global scope for HTML onclick handlers
    window.createSupportRequest = function() {
        if (window.dashboard) {
            window.dashboard.createSupportRequest();
        }
    };
    
    window.submitSupportRequest = function(event) {
        if (window.dashboard) {
            window.dashboard.submitSupportRequest(event);
        }
    };
    
    window.cancelSupportRequest = function() {
        if (window.dashboard) {
            window.dashboard.cancelSupportRequest();
        }
    };
    
    window.closeErrorModal = function() {
        if (window.dashboard) {
            window.dashboard.closeErrorModal();
        }
    };
    
    window.retryLastAction = function() {
        if (window.dashboard) {
            window.dashboard.retryLastAction();
        }
    };
});

// Schedule loading methods
StudentDashboard.prototype.loadSchedule = async function() {
    try {
        // Load schedule data from API
        console.log('Loading schedule data from API...');
        const scheduleResponse = await this.apiCall('/api/portal/student/schedule');
        console.log('Schedule API response:', scheduleResponse);
        
        if (scheduleResponse && scheduleResponse.success && scheduleResponse.data) {
            this.scheduleData = scheduleResponse.data;
            console.log('Schedule data loaded:', this.scheduleData.length, 'sessions');
        } else if (scheduleResponse && Array.isArray(scheduleResponse)) {
            // Fallback: if response is array directly
            this.scheduleData = scheduleResponse;
            console.log('Schedule data loaded (array):', this.scheduleData.length, 'sessions');
        } else if (scheduleResponse && scheduleResponse.data) {
            // Fallback: if response has data directly
            this.scheduleData = scheduleResponse.data;
            console.log('Schedule data loaded (data field):', this.scheduleData.length, 'sessions');
        } else {
            // Không có dữ liệu từ API, để mảng rỗng
            this.scheduleData = [];
            console.log('No schedule data from API, using empty array');
        }

        // Update calendar
        this.updateCalendar();
    } catch (error) {
        console.error('Error loading schedule:', error);
        // Không có dữ liệu, để mảng rỗng
        this.scheduleData = [];
        this.updateCalendar();
    }
};

StudentDashboard.prototype.updateCalendar = function() {
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) {
            console.warn('[updateCalendar] Element calendarGrid not found');
            return;
        }
        
        console.log('[updateCalendar] Updating calendar with scheduleData length:', this.scheduleData?.length || 0);

        // Update month display
        const currentMonthElement = document.getElementById('currentMonth');
        const currentMonthDisplay = document.getElementById('currentMonthDisplay');
        const currentYearDisplay = document.getElementById('currentYearDisplay');
        
        const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                          'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        
        if (currentMonthElement) {
            currentMonthElement.textContent = `${monthNames[this.currentMonth]}, ${this.currentYear}`;
        }
        if (currentMonthDisplay) {
            currentMonthDisplay.textContent = monthNames[this.currentMonth];
        }
        if (currentYearDisplay) {
            currentYearDisplay.textContent = this.currentYear;
        }

        // Đếm số lượng lớp học mỗi ngày
        const dateClassCount = new Map(); // dateKey -> count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Chỉ đếm từ scheduleData (loaded from BuoiHocChiTiet API)
        const scheduleSource = this.scheduleData || [];
        
        if (scheduleSource && scheduleSource.length > 0) {
            scheduleSource.forEach(ac => {
                if (ac.sessionDate) {
                    // Parse date từ ISO format (có thể là "2025-11-15T12:10:00" hoặc "2025-11-15")
                    let date;
                    try {
                        // Thử parse ISO format trước
                        date = new Date(ac.sessionDate);
                        // Kiểm tra nếu date không hợp lệ
                        if (isNaN(date.getTime())) {
                            // Thử parse format khác
                            const dateStr = ac.sessionDate.split('T')[0]; // Lấy phần date nếu có T
                            date = new Date(dateStr + 'T00:00:00');
                        }
                    } catch (e) {
                        console.warn('[updateCalendar] Error parsing date:', ac.sessionDate, e);
                        return;
                    }
                    
                    if (!isNaN(date.getTime())) {
                        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        dateClassCount.set(dateKey, (dateClassCount.get(dateKey) || 0) + 1);
                    }
                }
            });
        }
        
        // Tính tổng số lớp trong tháng
        let monthTotalClasses = 0;
        dateClassCount.forEach(count => {
            monthTotalClasses += count;
        });
        const monthClassesCountEl = document.getElementById('monthClassesCount');
        if (monthClassesCountEl) {
            monthClassesCountEl.textContent = monthTotalClasses;
        }
        
        // Đếm số lớp hôm nay
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const todayCount = dateClassCount.get(todayKey) || 0;
        const todayClassesCountEl = document.getElementById('todayClassesCount');
        if (todayClassesCountEl) {
            todayClassesCountEl.textContent = todayCount;
        }
        
        // Tạo calendar grid
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
        
        // Tên các ngày trong tuần
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        
        let calendarHTML = '<div class="calendar-weekdays">';
        dayNames.forEach(day => {
            calendarHTML += `<div class="calendar-weekday">${day}</div>`;
        });
        calendarHTML += '</div><div class="calendar-days">';
        
        // Thêm các ô trống cho ngày đầu tháng
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Thêm các ngày trong tháng
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const classCount = dateClassCount.get(dateKey) || 0;
            
            let dayClass = 'calendar-day';
            let dayBadge = '';
            
            // Kiểm tra nếu là ngày hôm nay
            const isToday = date.getTime() === today.getTime();
            if (isToday) {
                dayClass += ' today';
            }
            
            // Hiển thị badge số lượng khóa học
            if (classCount > 0) {
                let badgeClass = 'day-badge';
                if (classCount >= 3) {
                    badgeClass += ' badge-many'; // Đỏ cho 3+ khóa học
                } else if (classCount === 2) {
                    badgeClass += ' badge-medium'; // Vàng cho 2 khóa học
                } else {
                    badgeClass += ' badge-few'; // Xanh cho 1 khóa học
                }
                dayBadge = `<div class="${badgeClass}">${classCount} khóa học</div>`;
            }
            
            // Kiểm tra nếu là ngày quá khứ nhưng không có lớp
            if (date < today && classCount === 0) {
                dayClass += ' past';
            }
            
            calendarHTML += `
                <div class="${dayClass}" data-date="${dateKey}" onclick="dashboard.showDaySchedule('${dateKey}')">
                    <span class="day-number">${day}</span>
                    ${dayBadge}
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        calendarGrid.innerHTML = calendarHTML;
    };

StudentDashboard.prototype.switchScheduleView = function(view) {
        this.scheduleView = view;
        const monthView = document.getElementById('monthView');
        const weekView = document.getElementById('weekView');
        const monthTab = document.getElementById('monthViewTab');
        const weekTab = document.getElementById('weekViewTab');
        
        if (view === 'month') {
            if (monthView) monthView.style.display = 'block';
            if (weekView) weekView.style.display = 'none';
            if (monthTab) monthTab.classList.add('active');
            if (weekTab) weekTab.classList.remove('active');
            this.updateCalendar();
        } else {
            if (monthView) monthView.style.display = 'none';
            if (weekView) weekView.style.display = 'block';
            if (monthTab) monthTab.classList.remove('active');
            if (weekTab) weekTab.classList.add('active');
            this.updateWeekView();
        }
    };

StudentDashboard.prototype.changeWeek = function(delta) {
        const today = new Date();
        const currentWeekNumber = this.getWeekNumber(today);
        this.currentWeek = currentWeekNumber + delta;
        this.updateWeekView();
    };

StudentDashboard.prototype.getWeekNumber = function(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

StudentDashboard.prototype.getWeekStartDate = function(date) {
        // Tạo bản sao để không modify date gốc
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const day = d.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
        // Tính số ngày cần trừ để về Thứ 2 (Monday = 1)
        // Nếu là Chủ nhật (0), trừ 6 ngày để về Thứ 2
        // Nếu là Thứ 2 (1), trừ 0 ngày
        // Nếu là Thứ 3 (2), trừ 1 ngày
        // Công thức: day === 0 ? -6 : 1 - day
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        return d;
    };

StudentDashboard.prototype.updateWeekView = function() {
        const weekSchedule = document.getElementById('weekSchedule');
        const currentWeekEl = document.getElementById('currentWeek');
        if (!weekSchedule) return;

        // Tính tuần hiện tại dựa trên currentWeek và currentYear
        const today = new Date();
        const currentWeekStart = this.getWeekStartDate(today);
        
        // Tính số tuần offset từ tuần hiện tại
        const currentWeekNumber = this.getWeekNumber(today);
        const weekOffset = this.currentWeek - currentWeekNumber;
        
        // Tính ngày bắt đầu tuần cần hiển thị
        const weekStart = new Date(currentWeekStart);
        weekStart.setDate(currentWeekStart.getDate() + (weekOffset * 7));
        
        if (currentWeekEl) {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            currentWeekEl.textContent = `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}, ${weekEnd.getFullYear()}`;
        }

        let weekHTML = '';
        // Thứ tự: Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6, Thứ 7, Chủ nhật
        const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
        
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(weekStart);
            currentDay.setDate(weekStart.getDate() + i);
            const dateKey = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
            
            // Lấy các lớp học trong ngày
            const dayClasses = this.getClassesForDate(dateKey);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            const checkDate = new Date(currentDay);
            checkDate.setHours(0, 0, 0, 0);
            const isToday = checkDate.getTime() === todayDate.getTime();
            
            weekHTML += `
                <div class="week-day ${isToday ? 'today' : ''}">
                    <div class="week-day-header">
                        <span class="week-day-name">${dayNames[i]}</span>
                        <span class="week-day-date">${currentDay.getDate()}/${currentDay.getMonth() + 1}</span>
                    </div>
                    <div class="week-day-classes">
                        ${dayClasses.length > 0 ? dayClasses.map(cls => {
                            const startTime = cls.startTime ? cls.startTime.substring(0, 5) : 'N/A';
                            return `
                            <div class="week-class-item" onclick="dashboard.showDaySchedule('${dateKey}')">
                                <div class="week-class-time">${startTime}</div>
                                <div class="week-class-name">${this.escapeHtml(cls.className || 'Lớp học')}</div>
                                <div class="week-class-room">${this.escapeHtml(cls.room || 'Chưa có phòng')}</div>
                            </div>
                        `;
                        }).join('') : '<div class="week-day-empty">Không có lịch học</div>'}
                    </div>
                </div>
            `;
        }
        
        weekSchedule.innerHTML = weekHTML;
    };

StudentDashboard.prototype.getClassesForDate = function(dateKey) {
        // Chỉ lấy từ scheduleData (BuoiHocChiTiet), không dùng fallback
        const scheduleSource = this.scheduleData || [];
        
        if (!scheduleSource || scheduleSource.length === 0) return [];
        
        return scheduleSource.filter(ac => {
            if (!ac.sessionDate) return false;
            try {
                // Parse date từ ISO format
                let date = new Date(ac.sessionDate);
                if (isNaN(date.getTime())) {
                    const dateStr = ac.sessionDate.split('T')[0];
                    date = new Date(dateStr + 'T00:00:00');
                }
                if (isNaN(date.getTime())) return false;
                
                const acDateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                return acDateKey === dateKey;
            } catch (e) {
                console.warn('[getClassesForDate] Error parsing date:', ac.sessionDate, e);
                return false;
            }
        });
    };

StudentDashboard.prototype.showDaySchedule = function(dateKey) {
        this.selectedDate = dateKey;
        const modal = document.getElementById('scheduleModal');
        const modalTitle = document.getElementById('modalDateTitle');
        const modalBody = document.getElementById('scheduleModalBody');
        
        if (!modal || !modalTitle || !modalBody) return;
        
        const date = new Date(dateKey + 'T00:00:00');
        const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        const dayName = dayNames[date.getDay()];
        const dateStr = `${dayName}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        
        const classes = this.getClassesForDate(dateKey);
        
        modalTitle.textContent = `${dateStr} (${classes.length} Lịch Học)`;
        
        if (classes.length > 0) {
            // Sắp xếp theo thời gian bắt đầu
            const sortedClasses = classes.sort((a, b) => {
                const timeA = a.startTime || '00:00';
                const timeB = b.startTime || '00:00';
                return timeA.localeCompare(timeB);
            });
            
            modalBody.innerHTML = sortedClasses.map((cls, index) => {
                const startTime = cls.startTime ? cls.startTime.substring(0, 5) : 'N/A';
                const endTime = cls.endTime ? cls.endTime.substring(0, 5) : 'N/A';
                const className = cls.className || 'Lớp học';
                const classId = cls.classId || '';
                const displayName = classId ? `${className} - ${classId}` : className;
                
                return `
                    <div class="schedule-modal-item">
                        <div class="schedule-modal-time">${startTime}</div>
                        <div class="schedule-modal-content">
                            <h4>${this.escapeHtml(displayName)}</h4>
                            <p><i class="fas fa-map-marker-alt"></i> Phòng: ${this.escapeHtml(cls.room || 'Chưa có phòng')}</p>
                            <p><i class="fas fa-clock"></i> Thời gian: ${startTime} → ${endTime}</p>
                            <p><i class="fas fa-sticky-note"></i> Ghi chú: ${cls.content ? this.escapeHtml(cls.content) : ''}</p>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            modalBody.innerHTML = '<div class="empty-state">Không có lịch học trong ngày này</div>';
        }
        
        modal.style.display = 'flex';
    };

StudentDashboard.prototype.closeScheduleModal = function() {
        const modal = document.getElementById('scheduleModal');
        if (modal) {
            modal.style.display = 'none';
        }
    };
