// Student Dashboard JavaScript
class StudentDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.studentData = null;
        this.charts = {};
        this.init();
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
        this.initializeSidebarState();
        this.updateDateTime();
        this.loadDashboardData();
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.initializeAccessibility();
        this.initializePerformanceOptimizations();
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.switchSection(section);
            });
        });

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
        // Detect if running in static/offline mode
        const isStaticMode = this.isStaticMode();

        if (!isStaticMode) {
            // Normal mode: try backend first, show loading
            try {
                this.showLoading();

                // Try to load student dashboard data from backend
                const dashboardResponse = await this.apiCall('/api/student/dashboard');
                this.studentData = dashboardResponse.data;

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

            } catch (error) {
                console.warn('Backend data loading failed, falling back to local:', error);

                // Load cached data or use default data
                this.studentData = this.loadCachedDashboardData() || this.getDefaultDashboardData();

                // Perform local calculations for metrics
                this.calculateLocalMetrics();

                this.hideLoading();

                // Update UI with calculated data
                this.updateDashboardUI();
                this.updateUserInfo();
                this.loadClasses();
                this.loadAssignments();
                this.loadGrades();
                this.loadMessages();

                // Show offline mode notification
                this.showNotification('Đang hiển thị dữ liệu ngoại tuyến. Một số tính năng có thể bị hạn chế.', 'warning', 8000);
            }
        } else {
            // Static mode: load default data immediately without loading screen
            console.log('Running in static mode, loading default data without loading screen');

            // Load default data directly
            this.studentData = this.getDefaultDashboardData();

            // Perform local calculations for metrics
            this.calculateLocalMetrics();

            // Update UI immediately with default data
            this.updateDashboardUI();
            this.updateUserInfo();
            this.loadClasses();
            this.loadAssignments();
            this.loadGrades();
            this.loadMessages();

            // Optional: Show a brief notification about static mode
            setTimeout(() => {
                this.showNotification('Đang chạy ở chế độ tĩnh với dữ liệu mẫu.', 'info', 3000);
            }, 1000);
        }
    }

    // Detect if running in static/offline mode
    isStaticMode() {
        // Check multiple indicators for static mode
        const isFileProtocol = window.location.protocol === 'file:';
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isNoBackendPort = window.location.port === '' || window.location.port === '80' || window.location.port === '443';
        const hasStaticIndicator = document.body.hasAttribute('data-static-mode');

        // For demo purposes, force static mode when opening HTML directly
        // Set to false in production to enable automatic backend detection
        const forceStaticMode = isFileProtocol || hasStaticIndicator;

        // Consider static mode if:
        // 1. File protocol (file://) - opening HTML directly
        // 2. Explicit static mode attribute on body
        // 3. Localhost without specific backend port (fallback)
        return forceStaticMode ||
               (isLocalhost && isNoBackendPort && !this.hasBackendConfig());
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

        // Update header
        document.getElementById('userName').textContent = fullName;
        document.getElementById('headerUserName').textContent = fullName;

        // Update hero section
        document.getElementById('welcomeMessage').textContent = `Chào mừng ${fullName.split(' ').pop()}!`;
        document.getElementById('todayClassesCount').textContent = stats.todayClasses;
        document.getElementById('pendingAssignmentsCount').textContent = stats.pendingAssignments;

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
        if (!this.studentData?.classes) return;

        classesGrid.innerHTML = this.studentData.classes.map(classItem => `
            <div class="class-card">
                <div class="class-header">
                    <h3>${classItem.className}</h3>
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
                            <span class="stat-value">${classItem.studentCount}</span>
                            <span class="stat-label">HỌC SINH</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${classItem.averageGrade.toFixed(1)}</span>
                            <span class="stat-label">ĐIỂM TB</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${classItem.attendancePercentage}%</span>
                            <span class="stat-label">THAM GIA</span>
                        </div>
                    </div>
                    <div class="class-schedule">
                        <p><i class="fas fa-clock"></i> ${classItem.schedule}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${classItem.room}</p>
                        <p><i class="fas fa-user-tie"></i> ${classItem.teacherName}</p>
                    </div>
                    <div class="class-actions-full">
                        <button class="btn btn-sm btn-primary" onclick="dashboard.viewClassDetails('${classItem.classId}')">
                            <i class="fas fa-eye"></i> Xem chi tiết
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadAssignments() {
        const assignmentsGrid = document.getElementById('assignmentsGrid');
        if (!this.studentData?.assignments) return;

        assignmentsGrid.innerHTML = this.studentData.assignments.map(assignment => {
            const statusClass = this.getAssignmentStatusClass(assignment.status);
            const statusText = this.getAssignmentStatusText(assignment.status);

            return `
                <div class="assignment-card ${statusClass}">
                    <div class="assignment-header">
                        <h3>${assignment.title}</h3>
                        <div class="assignment-meta">
                            <span class="assignment-class">${assignment.className}</span>
                            <span class="assignment-due">Hạn nộp: ${this.formatDate(assignment.dueDate)}</span>
                        </div>
                    </div>
                    <div class="assignment-body">
                        <div class="assignment-description">
                            <p>${assignment.description}</p>
                        </div>
                        <div class="assignment-progress">
                            <div class="progress-info">
                                <span>Trạng thái: ${statusText}</span>
                                ${assignment.grade ? `<span>Điểm: ${assignment.grade}/10</span>` : '<span>Điểm: Chưa có</span>'}
                            </div>
                        </div>
                    </div>
                    <div class="assignment-actions">
                        ${assignment.status === 'pending' ?
                            `<button class="btn btn-primary" onclick="dashboard.startAssignment('${assignment.assignmentId}')">
                                <i class="fas fa-play"></i> Làm bài
                            </button>` :
                            `<button class="btn btn-success" onclick="dashboard.viewSubmission('${assignment.assignmentId}')">
                                <i class="fas fa-eye"></i> Xem kết quả
                            </button>`
                        }
                        <button class="btn btn-info" onclick="dashboard.viewAssignmentDetails('${assignment.assignmentId}')">
                            <i class="fas fa-eye"></i> Xem chi tiết
                        </button>
                    </div>
                </div>
            `;
        }).join('');
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

        document.getElementById('overallAverage').textContent = average.toFixed(1);
        document.getElementById('totalGradesCount').textContent = grades.length;
        document.getElementById('gradeRanking').textContent = this.getGradeRanking(average);
    }

    loadMessages() {
        // Implementation for loading messages
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
            'overdue': 'overdue'
        };
        return classes[status] || '';
    }

    getAssignmentStatusText(status) {
        const texts = {
            'pending': 'Chưa làm',
            'submitted': 'Đã nộp',
            'graded': 'Đã chấm',
            'overdue': 'Quá hạn'
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

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
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
            'messages': 'Tin nhắn'
        };
        document.getElementById('pageTitle').textContent = titles[sectionName];

        // Show section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        this.currentSection = sectionName;
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

    startAssignment(assignmentId) {
        const assignment = this.studentData?.assignments?.find(a => a.assignmentId === assignmentId);
        if (!assignment) {
            this.showError('Không tìm thấy bài tập');
            return;
        }

        const modalContent = `
            <div class="assignment-workspace">
                <div class="assignment-header-modal">
                    <h3>${assignment.title}</h3>
                    <div class="assignment-meta">
                        <span><i class="fas fa-clock"></i> Hạn nộp: ${this.formatDate(assignment.dueDate)}</span>
                        <span><i class="fas fa-graduation-cap"></i> ${assignment.className}</span>
                    </div>
                </div>

                <div class="assignment-content">
                    <div class="assignment-description">
                        <h4>Nội dung bài tập:</h4>
                        <p>${assignment.description}</p>
                    </div>

                    <div class="assignment-questions">
                        <h4>Câu hỏi:</h4>
                        <div class="question-item">
                            <p><strong>Câu 1:</strong> Giải phương trình bậc hai: x² - 5x + 6 = 0</p>
                            <textarea class="answer-input" placeholder="Nhập đáp án của bạn..." rows="3"></textarea>
                        </div>
                        <div class="question-item">
                            <p><strong>Câu 2:</strong> Tìm nghiệm của bất phương trình: x² - 4x - 5 ≤ 0</p>
                            <textarea class="answer-input" placeholder="Nhập đáp án của bạn..." rows="3"></textarea>
                        </div>
                        <div class="question-item">
                            <p><strong>Câu 3:</strong> Vẽ đồ thị hàm số: y = x² - 2x + 1</p>
                            <div class="file-upload-area">
                                <input type="file" id="graphUpload" accept="image/*" style="display: none;">
                                <label for="graphUpload" class="file-upload-label">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <span>Kéo thả hình ảnh hoặc click để tải lên</span>
                                </label>
                                <div id="filePreview" class="file-preview"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="assignment-actions-modal">
                    <button class="btn btn-success" onclick="dashboard.submitAssignment('${assignmentId}')">
                        <i class="fas fa-paper-plane"></i> Nộp bài
                    </button>
                    <button class="btn btn-warning" onclick="dashboard.saveDraft('${assignmentId}')">
                        <i class="fas fa-save"></i> Lưu nháp
                    </button>
                    <button class="btn btn-secondary" onclick="dashboard.closeModal()">
                        <i class="fas fa-times"></i> Đóng
                    </button>
                </div>
            </div>
        `;

        this.showModal('Làm bài tập', modalContent, 'large-modal');

        // Add drag and drop functionality
        this.initializeFileUpload();
    }

    initializeFileUpload() {
        const uploadArea = document.querySelector('.file-upload-area');
        const fileInput = document.getElementById('graphUpload');
        const preview = document.getElementById('filePreview');

        if (!uploadArea || !fileInput) return;

        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0], preview);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0], preview);
            }
        });
    }

    handleFileUpload(file, preview) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `
                    <div class="uploaded-file">
                        <img src="${e.target.result}" alt="Uploaded image" style="max-width: 200px; max-height: 200px;">
                        <div class="file-info">
                            <span>${file.name}</span>
                            <button class="btn btn-sm btn-danger" onclick="this.parentElement.parentElement.remove()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            this.showError('Chỉ chấp nhận file hình ảnh');
        }
    }

    submitAssignment(assignmentId) {
        // Validate answers
        const answers = document.querySelectorAll('.answer-input');
        const hasAnswers = Array.from(answers).some(answer => answer.value.trim() !== '');

        if (!hasAnswers) {
            this.showError('Vui lòng nhập ít nhất một câu trả lời');
            return;
        }

        // Show confirmation
        if (confirm('Bạn có chắc muốn nộp bài tập này? Sau khi nộp sẽ không thể chỉnh sửa.')) {
            this.showLoading();
            setTimeout(() => {
                this.hideLoading();
                this.closeModal();
                this.showNotification('Đã nộp bài tập thành công!', 'success');
                this.loadAssignments(); // Refresh assignments
            }, 1500);
        }
    }

    saveDraft(assignmentId) {
        this.showNotification('Đã lưu nháp bài làm!', 'success');
    }

    viewSubmission(assignmentId) {
        const assignment = this.studentData?.assignments?.find(a => a.assignmentId === assignmentId);
        if (!assignment) return;

        const modalContent = `
            <div class="submission-modal">
                <div class="submission-header">
                    <h3>Kết quả bài tập: ${assignment.title}</h3>
                    <div class="submission-status ${assignment.status}">
                        ${assignment.status === 'graded' ? 'Đã chấm' : 'Đã nộp'}
                    </div>
                </div>

                <div class="submission-details">
                    <div class="submission-meta">
                        <div class="meta-item">
                            <label>Thời gian nộp:</label>
                            <span>${assignment.submittedAt ? this.formatDate(assignment.submittedAt) : 'N/A'}</span>
                        </div>
                        <div class="meta-item">
                            <label>Thời gian chấm:</label>
                            <span>${assignment.gradedAt ? this.formatDate(assignment.gradedAt) : 'Chưa chấm'}</span>
                        </div>
                        <div class="meta-item">
                            <label>Điểm số:</label>
                            <span class="grade-display ${assignment.grade ? 'graded' : 'pending'}">
                                ${assignment.grade ? `${assignment.grade}/10` : 'Chưa có'}
                            </span>
                        </div>
                    </div>

                    ${assignment.feedback ? `
                        <div class="submission-feedback">
                            <h4>Nhận xét của giáo viên:</h4>
                            <p>${assignment.feedback}</p>
                        </div>
                    ` : ''}

                    <div class="submission-actions">
                        <button class="btn btn-primary" onclick="dashboard.downloadSubmission('${assignmentId}')">
                            <i class="fas fa-download"></i> Tải xuống bài làm
                        </button>
                        <button class="btn btn-info" onclick="dashboard.viewAssignmentDetails('${assignmentId}')">
                            <i class="fas fa-eye"></i> Xem chi tiết bài tập
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.showModal('Kết quả bài nộp', modalContent, 'large-modal');
    }

    viewAssignmentDetails(assignmentId) {
        const assignment = this.studentData?.assignments?.find(a => a.assignmentId === assignmentId);
        if (!assignment) return;

        const modalContent = `
            <div class="assignment-detail-modal">
                <h3>${assignment.title}</h3>
                <div class="assignment-detail-content">
                    <div class="detail-section">
                        <h4>Thông tin bài tập</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Môn học:</label>
                                <span>${assignment.className}</span>
                            </div>
                            <div class="detail-item">
                                <label>Hạn nộp:</label>
                                <span>${this.formatDate(assignment.dueDate)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Trạng thái:</label>
                                <span class="status-badge ${assignment.status}">${this.getAssignmentStatusText(assignment.status)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Nội dung</h4>
                        <p>${assignment.description}</p>
                    </div>

                    ${assignment.grade ? `
                        <div class="detail-section">
                            <h4>Điểm số</h4>
                            <div class="grade-summary">
                                <div class="grade-circle ${this.getGradeBadgeClass(assignment.grade)}">
                                    ${assignment.grade}/10
                                </div>
                                ${assignment.feedback ? `<p><strong>Nhận xét:</strong> ${assignment.feedback}</p>` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        this.showModal('Chi tiết bài tập', modalContent, 'large-modal');
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
            modal.classList.remove('active');
            // Restore body scroll
            document.body.style.overflow = '';
            setTimeout(() => modal.remove(), 300);
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
                this.closeModal();
                break;

            case 'submitAssignment':
                this.switchSection('assignments');
                this.closeModal();
                break;
        }
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

                if (!this.isStaticMode()) {
                    // Real API call
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
                        // Optionally refresh classes or show pending status
                    } else {
                        throw new Error(response.message || 'Không thể tham gia lớp học');
                    }
                } else {
                    // Static mode simulation
                    this.hideLoading();
                    this.closeModal();
                    this.showNotification('Đã tham gia lớp học thành công!', 'success');
                    this.loadClasses(); // Refresh classes
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
        // Implementation for calendar navigation
        console.log('Changing month by:', delta);
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

    getDefaultDashboardData() {
        const data = {
            studentId: null,
            fullName: 'Loading...',
            email: '',
            classes: [],
            assignments: [],
            grades: [],
            stats: this.getDefaultStats(),
            _isOffline: true // Mark as offline data
        };

        return data;
    }

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

    getDefaultClasses() {
        return [];
    }

    getDefaultAssignments() {
        return [];
    }

    getDefaultGrades() {
        return [];
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
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            ...options
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }

        return await response.json();
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorModal').classList.add('active');
    }

    updateMessageStats() {
        // Implementation for updating message statistics
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
                            <input type="date" id="profileBirthDate" value="${this.studentData.birthDate || ''}">
                        </div>
                        <div class="form-field">
                            <label for="profileGender">Giới tính</label>
                            <select id="profileGender">
                                <option value="">Chọn giới tính</option>
                                <option value="male" ${this.studentData.gender === 'male' ? 'selected' : ''}>Nam</option>
                                <option value="female" ${this.studentData.gender === 'female' ? 'selected' : ''}>Nữ</option>
                                <option value="other" ${this.studentData.gender === 'other' ? 'selected' : ''}>Khác</option>
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
            gender: document.getElementById('profileGender').value
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
            // In static mode, just update local data
            if (this.isStaticMode()) {
                // Update local data
                this.studentData.fullName = `${profileData.firstName} ${profileData.middleName} ${profileData.lastName}`.trim();
                this.studentData.email = profileData.email;
                this.studentData.phone = profileData.phone;
                this.studentData.address = profileData.address;
                this.studentData.birthDate = profileData.birthDate;
                this.studentData.gender = profileData.gender;

                // Update UI
                this.updateDashboardUI();
                this.updateUserInfo();

                this.hideLoading();
                this.closeModal();
                this.showNotification('Hồ sơ đã được cập nhật thành công!', 'success');

            } else {
                // API call for backend
                await this.apiCall('/api/student/profile', {
                    method: 'PUT',
                    body: JSON.stringify(profileData)
                });

                this.hideLoading();
                this.closeModal();
                this.showNotification('Hồ sơ đã được cập nhật thành công!', 'success');

                // Reload data
                this.loadDashboardData();
            }

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
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new StudentDashboard();
});