<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Dashboard - MathBridge</title>
    <link rel="stylesheet" href="../assets/css/student-dashboard.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
<!-- Sidebar -->
<div class="sidebar" id="sidebar">
    <!-- Sidebar Header - Loaded dynamically -->
    <div id="sidebar-header-placeholder"></div>

    <!-- Sidebar Navigation - Loaded dynamically -->
    <div id="sidebar-nav-placeholder"></div>

    <!-- Sidebar Footer - Loaded dynamically -->
    <div id="sidebar-footer-placeholder"></div>
</div>

<!-- Main Content -->
<div class="main-content" id="mainContent">
    <!-- Header -->
    <header class="header">
        <div class="header-left">
            <button class="mobile-menu-toggle" id="mobileMenuToggle">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title" id="pageTitle">Dashboard</h1>
            <div class="current-time">
            </div>
        </div>
        <div class="header-right">
            <div class="notifications">
                <button class="notification-btn" id="notificationBtn">
                    <i class="fas fa-bell"></i>
                    <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
                </button>
            </div>
            <div class="user-menu">
                <button class="user-menu-btn" id="userMenuBtn">
                    <div class="user-avatar-small">
                        <i class="fas fa-user"></i>
                    </div>
                    <span id="headerUserName">Loading...</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="user-dropdown" id="userDropdown">
                    <div class="dropdown-menu">
                        <a href="#" class="dropdown-item" onclick="dashboard.openProfile(); dashboard.closeUserDropdown();">
                            <i class="fas fa-user"></i>
                            <span>Hồ sơ</span>
                        </a>
                        <a href="#" class="dropdown-item" onclick="dashboard.openSettings(); dashboard.closeUserDropdown();">
                            <i class="fas fa-cog"></i>
                            <span>Cài đặt</span>
                        </a>
                        <a href="#" class="dropdown-item" onclick="dashboard.openActivityLog(); dashboard.closeUserDropdown();">
                            <i class="fas fa-history"></i>
                            <span>Nhật ký hoạt động</span>
                        </a>
                        <a href="#" class="dropdown-item" onclick="dashboard.openNotifications(); dashboard.closeUserDropdown();">
                            <i class="fas fa-bell"></i>
                            <span>Thông báo</span>
                        </a>
                        <a href="#" class="dropdown-item" onclick="dashboard.openHelp(); dashboard.closeUserDropdown();">
                            <i class="fas fa-question-circle"></i>
                            <span>Trợ giúp</span>
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item logout-item" onclick="dashboard.logout(); dashboard.closeUserDropdown();">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Đăng xuất</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Content Sections -->
    <main class="content">
        <!-- Dashboard Section -->
        <section class="content-section active" id="dashboard">
            <!-- Hero Section -->
            <div class="hero-section">
                <div class="hero-content">
                    <h2 id="welcomeMessage">Chào mừng bạn trở lại!</h2>
                    <p id="heroSubtitle">Hôm nay bạn có <span id="todayClassesCount">0</span> lớp học và <span id="pendingAssignmentsCount">0</span> bài tập cần làm.</p>
                </div>
                <div class="hero-actions">
                    <button class="btn btn-secondary" onclick="dashboard.quickAction('viewSchedule')">
                        <i class="fas fa-calendar"></i> Xem lịch học
                    </button>
                </div>
            </div>

            <!-- Stats Overview -->
            <div class="stats-overview">
                <div class="stat-card primary" data-metric="totalClasses">
                    <div class="stat-icon">
                        <i class="fas fa-chalkboard-teacher"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="totalClasses">0</h3>
                        <p>Tổng số lớp</p>
                        <div class="stat-trend" id="classesTrend">
                            <i class="fas fa-arrow-up"></i>
                            <span>+0 so với tháng trước</span>
                        </div>
                    </div>
                </div>
                <div class="stat-card success" data-metric="completedAssignments">
                    <div class="stat-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="completedAssignments">0</h3>
                        <p>Bài tập hoàn thành</p>
                        <div class="stat-trend" id="assignmentsTrend">
                            <i class="fas fa-arrow-up"></i>
                            <span>+0 so với tuần trước</span>
                        </div>
                    </div>
                </div>
                <div class="stat-card warning" data-metric="averageGrade">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="averageGrade">0.0</h3>
                        <p>Điểm trung bình</p>
                        <div class="stat-trend" id="gradeTrend">
                            <i class="fas fa-arrow-up"></i>
                            <span>+0.0 so với kỳ trước</span>
                        </div>
                    </div>
                </div>
                <div class="stat-card info" data-metric="attendanceRate">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="attendanceRate">0%</h3>
                        <p>Tỷ lệ tham gia</p>
                        <div class="stat-trend" id="attendanceTrend">
                            <i class="fas fa-arrow-up"></i>
                            <span>+0% so với tháng trước</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-section">
                <div class="chart-container">
                    <div class="chart-header">
                        <h3>Điểm số theo thời gian</h3>
                        <select id="gradeChartPeriod" onchange="updateGradeChart()">
                            <option value="month">Tháng này</option>
                            <option value="semester">Học kỳ</option>
                            <option value="year">Năm học</option>
                        </select>
                    </div>
                    <canvas id="gradeChart" width="400" height="200"></canvas>
                </div>
                <div class="chart-container">
                    <div class="chart-header">
                        <h3>Trạng thái bài tập</h3>
                    </div>
                    <canvas id="assignmentChart" width="400" height="200"></canvas>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="recent-activity">
                <div class="activity-header">
                    <h3>Hoạt động gần đây</h3>
                    <button class="btn btn-link" onclick="viewAllActivity()">Xem tất cả</button>
                </div>
                <div class="activity-list" id="recentActivityList">
                    <!-- Activity items will be loaded here -->
                </div>
            </div>
        </section>

        <!-- Classes Section -->
        <section class="content-section" id="classes">
            <div class="section-header">
                <h2>Lớp học của tôi</h2>
                <div class="header-actions">
                    <div class="search-box">
                        <input type="text" id="classSearch" placeholder="Tìm kiếm lớp học..." onkeyup="filterClasses()">
                        <i class="fas fa-search"></i>
                    </div>
                    <select class="form-select" id="classFilter" onchange="filterClasses()">
                        <option value="all">Tất cả lớp</option>
                        <option value="active">Đang học</option>
                        <option value="completed">Đã hoàn thành</option>
                    </select>
                </div>
            </div>

            <div class="classes-grid" id="classesGrid">
                <!-- Classes will be loaded here -->
            </div>
        </section>

        <!-- Assignments Section -->
        <section class="content-section" id="assignments">
            <div class="section-header">
                <h2>Bài tập của tôi</h2>
                <div class="header-actions">
                    <div class="search-box">
                        <input type="text" id="assignmentSearch" placeholder="Tìm kiếm bài tập..." onkeyup="filterAssignments()">
                        <i class="fas fa-search"></i>
                    </div>
                    <select class="form-select" id="assignmentStatusFilter" onchange="filterAssignments()">
                        <option value="all">Tất cả</option>
                        <option value="pending">Chưa làm</option>
                        <option value="submitted">Đã nộp</option>
                        <option value="graded">Đã chấm</option>
                        <option value="overdue">Quá hạn</option>
                    </select>
                </div>
            </div>

            <div class="assignments-grid" id="assignmentsGrid">
                <!-- Assignments will be loaded here -->
            </div>
        </section>

        <!-- Grades Section -->
        <section class="content-section" id="grades">
            <div class="section-header">
                <h2>Điểm số của tôi</h2>
                <div class="header-actions">
                    <select class="form-select" id="gradeClassFilter" onchange="filterGrades()">
                        <option value="all">Tất cả khóa học</option>
                        <!-- Options will be populated by JavaScript -->
                    </select>
                </div>
            </div>

            <!-- Grade Statistics -->
            <div class="grade-stats-overview">
                <div class="grade-stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="overallAverage">0.0</h3>
                        <p>Điểm trung bình tổng thể</p>
                    </div>
                </div>
                <div class="grade-stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="gradeRanking">N/A</h3>
                        <p>Xếp loại</p>
                    </div>
                </div>
                <div class="grade-stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="totalGradesCount">0</h3>
                        <p>Tổng số điểm</p>
                    </div>
                </div>
            </div>

            <!-- Grade Chart -->
            <div class="grade-chart-container">
                <canvas id="detailedGradeChart" width="800" height="300"></canvas>
            </div>

            <!-- Grade Table -->
            <div class="grades-table-container">
                <h3>Chi tiết điểm số</h3>
                <div class="table-wrapper">
                    <table class="grades-table" id="gradesTable">
                        <thead>
                        <tr>
                            <th style="width: 50px;"></th>
                            <th>Buổi học</th>
                            <th>Ngày học</th>
                            <th>Lớp</th>
                            <th>Điểm bài tập</th>
                            <th>Điểm giáo viên</th>
                            <th>Điểm tổng hợp</th>
                            <th>Hành động</th>
                        </tr>
                        </thead>
                        <tbody id="gradesTableBody">
                        <!-- Grades will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- Schedule Section -->
        <section class="content-section" id="schedule">
            <div class="section-header">
                <h2>Lịch học của tôi</h2>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="exportSchedule()">
                        <i class="fas fa-download"></i>
                        Xuất lịch
                    </button>
                </div>
            </div>

            <!-- Schedule View Tabs -->
            <div class="schedule-view-tabs">
                <button class="schedule-tab active" id="monthViewTab" onclick="dashboard.switchScheduleView('month')">
                    <i class="fas fa-calendar-alt"></i> Lịch tháng
                </button>
                <button class="schedule-tab" id="weekViewTab" onclick="dashboard.switchScheduleView('week')">
                    <i class="fas fa-calendar-week"></i> Lịch tuần
                </button>
            </div>

            <!-- Summary Cards -->
            <div class="schedule-summary-cards">
                <div class="summary-card">
                    <div class="summary-label">Tháng</div>
                    <div class="summary-value" id="currentMonthDisplay">Tháng 11</div>
                    <div class="summary-year" id="currentYearDisplay">2025</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">
                        <i class="fas fa-calendar-check"></i> Hôm nay
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">
                        <i class="fas fa-cog"></i> Tháng
                    </div>
                    <div class="summary-value" id="monthClassesCount">0</div>
                </div>
            </div>

            <!-- Month View -->
            <div class="schedule-view" id="monthView">
                <div class="schedule-calendar">
                    <div class="calendar-header">
                        <button class="btn-icon" id="prevMonth" onclick="dashboard.changeMonth(-1)">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <h3 id="currentMonth">Tháng 12, 2024</h3>
                        <button class="btn-icon" id="nextMonth" onclick="dashboard.changeMonth(1)">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <div class="calendar-grid" id="calendarGrid">
                        <!-- Calendar will be populated by JavaScript -->
                    </div>
                </div>
            </div>

            <!-- Week View -->
            <div class="schedule-view" id="weekView" style="display: none;">
                <div class="week-navigation">
                    <button class="btn-icon" id="prevWeek" onclick="dashboard.changeWeek(-1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h3 id="currentWeek">Tuần hiện tại</h3>
                    <button class="btn-icon" id="nextWeek" onclick="dashboard.changeWeek(1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="week-schedule" id="weekSchedule">
                    <!-- Week schedule will be populated by JavaScript -->
                </div>
            </div>

            <!-- Selected Day Schedule Modal -->
            <div class="schedule-modal" id="scheduleModal">
                <div class="schedule-modal-content">
                    <div class="schedule-modal-header">
                        <h3 id="modalDateTitle">Lịch học</h3>
                        <button class="modal-close" onclick="dashboard.closeScheduleModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="schedule-modal-body" id="scheduleModalBody">
                        <!-- Schedule details will be loaded here -->
                    </div>
                </div>
            </div>
        </section>

        <!-- Messages Section -->
        <section class="content-section" id="messages">
            <div class="section-header">
                <h2>Tin nhắn</h2>
                <div class="header-actions">
                    <div class="connection-status">
                        <span class="status-indicator" id="connectionStatus"></span>
                        <span id="connectionText">Đang kết nối...</span>
                    </div>
                    <button class="btn btn-secondary" onclick="markAllAsRead()">
                        <i class="fas fa-check-double"></i>
                        Đánh dấu đã đọc
                    </button>
                    <button class="btn btn-primary" onclick="sendMessage()">
                        <i class="fas fa-plus"></i>
                        Soạn tin mới
                    </button>
                </div>
            </div>

            <!-- Message Filters -->
            <div class="message-filters">
                <div class="filter-tabs">
                    <button class="filter-tab active" onclick="filterMessages('all')">
                        <i class="fas fa-inbox"></i> Tất cả
                    </button>
                    <button class="filter-tab" onclick="filterMessages('teachers')">
                        <i class="fas fa-user-tie"></i> Giáo viên
                    </button>
                    <button class="filter-tab" onclick="filterMessages('classmates')">
                        <i class="fas fa-users"></i> Bạn học
                    </button>
                    <button class="filter-tab" onclick="filterMessages('admin')">
                        <i class="fas fa-cog"></i> Admin
                    </button>
                </div>
                <div class="search-box">
                    <input type="text" id="messageSearch" placeholder="Tìm kiếm tin nhắn..." onkeyup="searchMessages()">
                    <i class="fas fa-search"></i>
                </div>
            </div>

            <!-- Message Statistics -->
            <div class="message-stats">
                <div class="stat-item">
                    <span class="stat-number" id="totalMessages">0</span>
                    <span class="stat-label">Tổng tin nhắn</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number" id="unreadMessages">0</span>
                    <span class="stat-label">Chưa đọc</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number" id="todayMessages">0</span>
                    <span class="stat-label">Hôm nay</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number" id="urgentMessages">0</span>
                    <span class="stat-label">Khẩn cấp</span>
                </div>
            </div>

            <div class="messages-container" id="messagesContainer">
                <!-- Messages will be loaded here -->
            </div>
        </section>

        <!-- History Section - MathBridge Professional Design -->
        <section class="content-section" id="history">
            <!-- Professional Header with MathBridge Branding -->
            <div class="section-header">
                <div class="section-title-wrapper">
                    <div class="section-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="section-title-content">
                        <h2>📚 Lịch sử học tập MathBridge</h2>
                        <p class="section-subtitle">Theo dõi hành trình học tập của bạn với các chương trình toán quốc tế</p>
                    </div>
                </div>
                <div class="header-actions">
                    <div class="current-time">
                        <span id="currentDate"></span>
                        <span id="currentTime"></span>
                    </div>
                    <div class="user-avatar-small">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
            </div>

            <!-- MathBridge Programs Overview -->
            <div class="mathbridge-programs-overview">
                <div class="programs-grid">
                    <div class="program-card igcse">
                        <div class="program-icon">🎓</div>
                        <div class="program-info">
                            <h4>Cambridge IGCSE</h4>
                            <p>Chương trình toán quốc tế cơ bản</p>
                        </div>
                    </div>
                    <div class="program-card alevel">
                        <div class="program-icon">📈</div>
                        <div class="program-info">
                            <h4>A-Level Mathematics</h4>
                            <p>Toán nâng cao cho đại học</p>
                        </div>
                    </div>
                    <div class="program-card ib">
                        <div class="program-icon">🌍</div>
                        <div class="program-info">
                            <h4>IB Math</h4>
                            <p>Toán học song ngữ quốc tế</p>
                        </div>
                    </div>
                    <div class="program-card ap">
                        <div class="program-icon">📊</div>
                        <div class="program-info">
                            <h4>AP Calculus</h4>
                            <p>Tính toán nâng cao</p>
                        </div>
                    </div>
                    <div class="program-card vietnamese">
                        <div class="program-icon">🇻🇳</div>
                        <div class="program-info">
                            <h4>Toán nâng cao VN</h4>
                            <p>Ôn thi đại học Việt Nam</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- History Tabs -->
            <div class="history-tabs">
                <button class="history-tab active" onclick="dashboard.switchHistoryTab('learning')">
                    <i class="fas fa-book-open"></i> Lịch sử học tập
                </button>
                <button class="history-tab" onclick="dashboard.switchHistoryTab('registrations')">
                    <i class="fas fa-clipboard-list"></i> Lịch sử đăng ký lớp
                </button>
            </div>

            <!-- History Content -->
            <div class="history-content-container">
                <!-- Learning History Tab -->
                <div class="history-content active" id="learningHistory">
                    <div class="history-list" id="classesHistoryList">
                        <!-- Attended classes will be loaded here -->
                    </div>
                </div>

                <!-- Registration History Tab -->
                <div class="history-content" id="registrationsHistory">
                    <div class="history-list" id="registrationsList">
                        <!-- Registrations will be loaded here -->
                    </div>
                </div>
            </div>

            <!-- History Layout Container (Keep for backward compatibility) -->
            <div class="history-layout" style="display: none;">
                <!-- Left Column: Course Timeline -->
                <div class="history-timeline-column">
                    <div class="timeline-container">
                        <div class="timeline-header">
                            <h3><i class="fas fa-route"></i> Hành trình học tập</h3>
                            <div class="timeline-filters">
                                <select class="form-select timeline-filter" id="timelineDisplayFilter" onchange="filterTimeline()">
                                    <option value="all">Tất cả khóa học</option>
                                    <option value="active">Đang học</option>
                                    <option value="completed">Hoàn thành</option>
                                    <option value="pending">Chờ duyệt</option>
                                </select>
                                <select class="form-select program-filter" id="programFilter" onchange="filterByProgram()">
                                    <option value="all">Tất cả chương trình</option>
                                    <option value="igcse">IGCSE</option>
                                    <option value="alevel">A-Level</option>
                                    <option value="ib">IB Math</option>
                                    <option value="ap">AP Calculus</option>
                                    <option value="vietnamese">Toán VN</option>
                                </select>
                            </div>
                        </div>

                        <!-- Timeline -->
                        <div class="timeline" id="courseTimeline">
                            <!-- Timeline items will be loaded here -->
                        </div>
                    </div>
                </div>

                <!-- Right Column: Filters & Actions -->
                <div class="history-actions-column">
                    <!-- Academic Progress Card -->
                    <div class="progress-card">
                        <h4><i class="fas fa-trophy"></i> Tiến độ học tập</h4>
                        <div class="progress-stats">
                            <div class="progress-item">
                                <div class="progress-label">IGCSE Complete</div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 85%"></div>
                                </div>
                                <div class="progress-value">85%</div>
                            </div>
                            <div class="progress-item">
                                <div class="progress-label">A-Level Progress</div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 60%"></div>
                                </div>
                                <div class="progress-value">60%</div>
                            </div>
                            <div class="progress-item">
                                <div class="progress-label">IB Math AA</div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 40%"></div>
                                </div>
                                <div class="progress-value">40%</div>
                            </div>
                        </div>
                    </div>

                    <!-- Filters & Actions Card -->
                    <div class="actions-card">
                        <h4><i class="fas fa-sliders-h"></i> Bộ lọc & Hành động</h4>

                        <div class="filter-group">
                            <label for="historyTypeFilter">Loại hiển thị:</label>
                            <select class="form-select" id="historyTypeFilter" onchange="filterHistoryType()">
                                <option value="timeline">Dạng timeline</option>
                                <option value="list">Dạng danh sách</option>
                                <option value="calendar">Dạng lịch</option>
                            </select>
                        </div>

                        <div class="filter-group">
                            <label for="dateRangeFilter">Khoảng thời gian:</label>
                            <select class="form-select" id="dateRangeFilter" onchange="filterDateRange()">
                                <option value="all">Tất cả thời gian</option>
                                <option value="thisMonth">Tháng này</option>
                                <option value="lastMonth">Tháng trước</option>
                                <option value="thisYear">Năm nay</option>
                            </select>
                        </div>

                        <div class="action-buttons">
                            <button class="btn btn-success btn-block" onclick="dashboard.exportHistory()">
                                <i class="fas fa-download"></i>
                                Xuất báo cáo
                            </button>
                            <button class="btn btn-info btn-block" onclick="dashboard.printHistory()">
                                <i class="fas fa-print"></i>
                                In lịch sử
                            </button>
                            <button class="btn btn-secondary btn-block" onclick="dashboard.shareHistory()">
                                <i class="fas fa-share"></i>
                                Chia sẻ
                            </button>
                        </div>
                    </div>

                    <!-- Quick Stats -->
                    <div class="stats-card">
                        <h4><i class="fas fa-chart-bar"></i> Thống kê học tập</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-number" id="totalCourses">0</span>
                                <span class="stat-label">Tổng khóa học</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number" id="completedCourses">0</span>
                                <span class="stat-label">Đã hoàn thành</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number" id="totalSessions">0</span>
                                <span class="stat-label">Tổng buổi học</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number" id="attendedSessions">0</span>
                                <span class="stat-label">Đã tham gia</span>
                            </div>
                        </div>
                    </div>

                    <!-- Upcoming Milestones -->
                    <div class="milestones-card">
                        <h4><i class="fas fa-flag"></i> Mốc quan trọng sắp tới</h4>
                        <div class="milestones-list">
                            <div class="milestone-item">
                                <div class="milestone-icon">📝</div>
                                <div class="milestone-content">
                                    <h5>IGCSE Mock Exam</h5>
                                    <p>15/12/2024 - Phòng 101</p>
                                </div>
                            </div>
                            <div class="milestone-item">
                                <div class="milestone-icon">🎯</div>
                                <div class="milestone-content">
                                    <h5>A-Level Paper 1</h5>
                                    <p>20/01/2025 - Online</p>
                                </div>
                            </div>
                            <div class="milestone-item">
                                <div class="milestone-icon">🏆</div>
                                <div class="milestone-content">
                                    <h5>Math Competition</h5>
                                    <p>10/02/2025 - Đại học Quốc gia</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Assignment Workspace Section (Fullscreen) -->
        <section class="content-section" id="assignment-workspace" style="display: none;">
            <!-- Content will be rendered dynamically by JavaScript -->
        </section>

        <!-- Support Section - MathBridge Professional Design -->
        <section class="content-section" id="support">
            <!-- Professional Header with MathBridge Support Branding -->
            <div class="section-header">
                <div class="section-title-wrapper">
                    <div class="section-icon">
                        <i class="fas fa-headset"></i>
                    </div>
                    <div class="section-title-content">
                        <h2>🛠️ Hỗ trợ MathBridge</h2>
                        <p class="section-subtitle">Đội ngũ chuyên gia luôn sẵn sàng hỗ trợ bạn trên hành trình chinh phục toán học quốc tế</p>
                    </div>
                </div>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="createSupportRequest()">
                        <i class="fas fa-plus"></i>
                        Tạo yêu cầu hỗ trợ
                    </button>
                </div>
            </div>

            <!-- Support Overview Cards -->
            <div class="support-overview">
                <div class="overview-grid">
                    <div class="overview-card academic">
                        <div class="overview-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <div class="overview-content">
                            <h4>Hỗ trợ học tập</h4>
                            <p>Giải đáp thắc mắc về Cambridge IGCSE, A-Level, IB Math, AP Calculus</p>
                            <div class="response-time">Trả lời trong 2 giờ</div>
                        </div>
                    </div>
                    <div class="overview-card technical">
                        <div class="overview-icon">
                            <i class="fas fa-cogs"></i>
                        </div>
                        <div class="overview-content">
                            <h4>Hỗ trợ kỹ thuật</h4>
                            <p>Vấn đề về nền tảng, tài liệu, và công cụ học tập</p>
                            <div class="response-time">Trả lời trong 4 giờ</div>
                        </div>
                    </div>
                    <div class="overview-card career">
                        <div class="overview-icon">
                            <i class="fas fa-compass"></i>
                        </div>
                        <div class="overview-content">
                            <h4>Tư vấn hướng nghiệp</h4>
                            <p>Khuyên về lựa chọn trường, ngành học, và lộ trình phát triển</p>
                            <div class="response-time">Trả lời trong 24 giờ</div>
                        </div>
                    </div>
                    <div class="overview-card emergency">
                        <div class="overview-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="overview-content">
                            <h4>Hỗ trợ khẩn cấp</h4>
                            <p>Vấn đề quan trọng cần giải quyết ngay lập tức</p>
                            <div class="response-time">Trả lời trong 30 phút</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Support Request Form -->
            <div class="support-form-container" id="supportFormContainer" style="display: none;">
                <div class="support-form-card">
                    <div class="form-header">
                        <h3><i class="fas fa-plus-circle"></i> Tạo yêu cầu hỗ trợ mới</h3>
                        <p>Điền thông tin chi tiết để chúng tôi hỗ trợ bạn tốt nhất</p>
                    </div>
                    <form id="supportRequestForm" onsubmit="submitSupportRequest(event)">
                        <div class="form-group">
                            <label for="supportType">Loại yêu cầu hỗ trợ *</label>
                            <select id="supportType" name="supportType" required>
                                <option value="">Chọn loại yêu cầu</option>
                                <option value="academic">📚 Hỗ trợ học tập</option>
                                <option value="technical">🔧 Vấn đề kỹ thuật</option>
                                <option value="billing">💳 Thanh toán & hóa đơn</option>
                                <option value="career">🎯 Tư vấn hướng nghiệp</option>
                                <option value="emergency">🚨 Hỗ trợ khẩn cấp</option>
                                <option value="other">❓ Khác</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="supportTitle">Tiêu đề yêu cầu *</label>
                            <input type="text" id="supportTitle" name="supportTitle" placeholder="Ví dụ: Cần hỗ trợ bài tập về phương trình bậc hai" required>
                        </div>

                        <div class="form-group">
                            <label for="supportClass">Chọn lớp học (tùy chọn)</label>
                            <select id="supportClass" name="supportClass">
                                <option value="">-- Chọn lớp học --</option>
                                <!-- Options will be populated by JavaScript -->
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="supportDescription">Mô tả chi tiết vấn đề *</label>
                            <textarea id="supportDescription" name="supportDescription" rows="6" placeholder="Hãy mô tả chi tiết vấn đề bạn gặp phải, kèm theo thông tin cụ thể như:&#10;&#10;- Chương trình đang học&#10;- Bài học/bài tập cụ thể&#10;- Vấn đề gặp phải&#10;- Những gì bạn đã thử&#10;&#10;Điều này giúp chúng tôi hỗ trợ bạn nhanh chóng và chính xác hơn." required></textarea>
                        </div>

                        <div class="form-group">
                            <label for="supportFile">Đính kèm file (tùy chọn)</label>
                            <div class="file-upload-area">
                                <input type="file" id="supportFile" name="supportFile" accept="image/*,.pdf,.doc,.docx,.txt" multiple>
                                <div class="file-upload-content">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <div class="upload-text">
                                        <strong>Kéo thả file vào đây</strong> hoặc click để chọn
                                        <br><small>Chấp nhận: hình ảnh, PDF, Word, TXT. Tối đa 5 file, mỗi file 10MB</small>
                                    </div>
                                </div>
                            </div>
                            <div id="filePreview" class="file-preview"></div>
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="contactPermission" name="contactPermission" checked>
                                <span class="checkmark"></span>
                                Tôi đồng ý cho MathBridge liên hệ qua email/SMS để cập nhật tiến độ hỗ trợ
                            </label>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="cancelSupportRequest()">
                                <i class="fas fa-times"></i> Hủy
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane"></i> Gửi yêu cầu hỗ trợ
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Support Requests Management -->
            <div class="support-requests-container" id="supportRequestsContainer">
                <div class="requests-header">
                    <h3><i class="fas fa-list"></i> Yêu cầu hỗ trợ của bạn</h3>
                    <div class="requests-stats">
                        <div class="stat-badge">
                            <span class="stat-number" id="activeRequests">0</span>
                            <span class="stat-label">Đang xử lý</span>
                        </div>
                        <div class="stat-badge resolved">
                            <span class="stat-number" id="resolvedRequests">0</span>
                            <span class="stat-label">Đã giải quyết</span>
                        </div>
                    </div>
                </div>

                <div class="support-filters">
                    <div class="filter-row">
                        <select class="form-select" id="supportStatusFilter" onchange="filterSupportRequests()">
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="processing">Đang xử lý</option>
                            <option value="resolved">Đã giải quyết</option>
                            <option value="closed">Đã đóng</option>
                        </select>
                        <select class="form-select" id="supportTypeFilter" onchange="filterSupportRequests()">
                            <option value="all">Tất cả loại</option>
                            <option value="academic">Học tập</option>
                            <option value="technical">Kỹ thuật</option>
                            <option value="billing">Thanh toán</option>
                            <option value="career">Tư vấn</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>
                    <div class="search-box">
                        <input type="text" id="supportSearch" placeholder="Tìm kiếm yêu cầu hỗ trợ..." onkeyup="searchSupportRequests()">
                        <i class="fas fa-search"></i>
                    </div>
                </div>

                <div class="support-requests-list" id="supportRequestsList">
                    <!-- Support requests will be loaded here -->
                </div>

                <!-- Empty State -->
                <div class="support-empty-state" id="supportEmptyState" style="display: none;">
                    <div class="empty-state-content">
                        <div class="empty-icon">🛠️</div>
                        <h4>Chưa có yêu cầu hỗ trợ nào</h4>
                        <p>Nếu bạn gặp vấn đề gì trong quá trình học tập, đừng ngần ngại tạo yêu cầu hỗ trợ. Đội ngũ MathBridge luôn sẵn sàng giúp đỡ!</p>
                    </div>
                </div>
            </div>
        </section>
    </main>
</div>

<!-- Loading Overlay -->
<div class="loading-overlay" id="loadingOverlay" style="display: none;">
    <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Đang tải...</p>
    </div>
</div>

<!-- Error Modal -->
<div class="modal" id="errorModal">
    <div class="modal-content small-modal">
        <div class="modal-header">
            <h3>Lỗi</h3>
            <button class="modal-close" onclick="closeErrorModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="error-message" id="errorMessage"></div>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="retryLastAction()">Thử lại</button>
                <button class="btn btn-secondary" onclick="closeErrorModal()">Đóng</button>
            </div>
        </div>
    </div>
</div>

<!-- Authentication Check Script -->


<!-- Scripts -->
<script type="module" src="../assets/js/config.js"></script>
<script type="module" src="../assets/js/utils/http.js"></script>
<script type="module" src="../assets/js/utils/auth.js"></script>
<script type="module" src="../assets/js/utils/includePartials.js"></script>
<script type="module" src="js/student-dashboard.js"></script>

<!-- Modal Containers for Dynamic Content -->
<div id="profileModalContainer"></div>
<div id="settingsModalContainer"></div>
<div id="activityLogModalContainer"></div>
<div id="helpModalContainer"></div>
<div id="notificationsModalContainer"></div>
</body>
</html>