// Tutor Dashboard JavaScript
class TutorDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDateTime();
        this.loadDashboardData();
        this.setupSidebar();
        this.setupModals();
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('sidebar-collapsed');
            });
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Notification button
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }

        // Calendar navigation
        const prevWeekBtn = document.getElementById('prevWeek');
        const nextWeekBtn = document.getElementById('nextWeek');
        
        if (prevWeekBtn) {
            prevWeekBtn.addEventListener('click', () => {
                this.navigateWeek(-1);
            });
        }
        
        if (nextWeekBtn) {
            nextWeekBtn.addEventListener('click', () => {
                this.navigateWeek(1);
            });
        }

        // Search functionality
        document.querySelectorAll('.search-box input').forEach(input => {
            input.addEventListener('input', (e) => {
                this.handleSearch(e.target.value, e.target.closest('.content-section').id);
            });
        });

        // Button actions
        this.setupButtonActions();
    }

    setupSidebar() {
        // Highlight current section
        this.updateActiveNavItem();
    }

    setupModals() {
        // Student modal
        const studentModal = document.getElementById('studentModal');
        const closeStudentModal = document.getElementById('closeStudentModal');
        const closeStudentModalBtn = document.getElementById('closeStudentModalBtn');

        if (closeStudentModal) {
            closeStudentModal.addEventListener('click', () => {
                studentModal.classList.remove('active');
            });
        }

        if (closeStudentModalBtn) {
            closeStudentModalBtn.addEventListener('click', () => {
                studentModal.classList.remove('active');
            });
        }

        // Teacher modal
        const teacherModal = document.getElementById('teacherModal');
        const closeTeacherModal = document.getElementById('closeTeacherModal');
        const closeTeacherModalBtn = document.getElementById('closeTeacherModalBtn');

        if (closeTeacherModal) {
            closeTeacherModal.addEventListener('click', () => {
                teacherModal.classList.remove('active');
            });
        }

        if (closeTeacherModalBtn) {
            closeTeacherModalBtn.addEventListener('click', () => {
                teacherModal.classList.remove('active');
            });
        }

        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    setupButtonActions() {
        // Student management buttons
        document.querySelectorAll('#students .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.textContent.trim();
                if (action === 'Xem') {
                    this.showStudentDetails();
                } else if (action === 'Sửa') {
                    this.editStudent();
                } else if (action === 'Thêm học sinh') {
                    this.addStudent();
                }
            });
        });

        // Teacher management buttons
        document.querySelectorAll('#teachers .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.textContent.trim();
                if (action === 'Xem chi tiết') {
                    this.showTeacherDetails();
                } else if (action === 'Chỉnh sửa') {
                    this.editTeacher();
                } else if (action === 'Thêm gia sư') {
                    this.addTeacher();
                }
            });
        });

        // Class management buttons
        document.querySelectorAll('#classes .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.textContent.trim();
                if (action === 'Xem') {
                    this.showClassDetails();
                } else if (action === 'Sửa') {
                    this.editClass();
                } else if (action === 'Tạo lớp học') {
                    this.createClass();
                }
            });
        });

        // Payment management buttons
        document.querySelectorAll('#payments .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.textContent.trim();
                if (action === 'Xem') {
                    this.viewPayment();
                } else if (action === 'Xử lý') {
                    this.processPayment();
                } else if (action === 'In hóa đơn') {
                    this.printInvoice();
                } else if (action === 'Thêm thanh toán') {
                    this.addPayment();
                }
            });
        });

        // Support buttons
        document.querySelectorAll('#support .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.textContent.trim();
                if (action === 'Xử lý') {
                    this.processSupportRequest();
                } else if (action === 'Chi tiết') {
                    this.viewSupportDetails();
                } else if (action === 'Tạo yêu cầu hỗ trợ') {
                    this.createSupportRequest();
                }
            });
        });

        // Message buttons
        document.querySelectorAll('#messages .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.textContent.trim();
                if (action === 'Trả lời') {
                    this.replyMessage();
                } else if (action === 'Xem chi tiết') {
                    this.viewMessageDetails();
                } else if (action === 'Tin nhắn mới') {
                    this.createNewMessage();
                }
            });
        });
    }

    switchSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            this.updatePageTitle(sectionId);
            this.updateActiveNavItem();
            this.loadSectionData(sectionId);
        }
    }

    updatePageTitle(sectionId) {
        const pageTitle = document.getElementById('pageTitle');
        const titles = {
            'dashboard': 'Dashboard',
            'students': 'Quản lý học sinh',
            'teachers': 'Quản lý gia sư',
            'classes': 'Quản lý lớp học',
            'payments': 'Thanh toán',
            'support': 'Hỗ trợ',
            'messages': 'Nhắn tin trực tiếp'
        };
        
        if (pageTitle && titles[sectionId]) {
            pageTitle.textContent = titles[sectionId];
        }
    }

    updateActiveNavItem() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeItem = document.querySelector(`[data-section="${this.currentSection}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    updateDateTime() {
        const updateTime = () => {
            const now = new Date();
            const dateElement = document.getElementById('currentDate');
            const timeElement = document.getElementById('currentTime');

            if (dateElement) {
                dateElement.textContent = now.toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

            if (timeElement) {
                timeElement.textContent = now.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    loadDashboardData() {
        // Load dashboard statistics
        this.loadDashboardStats();
        this.loadRecentStudents();
        this.loadRecentPayments();
        this.loadWeeklySchedule();
    }

    loadDashboardStats() {
        // Simulate API call
        const stats = {
            students: 156,
            teachers: 12,
            classes: 8,
            payments: 25
        };

        // Update stat cards
        const statCards = document.querySelectorAll('.stat-card .stat-content h3');
        if (statCards.length >= 4) {
            statCards[0].textContent = stats.students;
            statCards[1].textContent = stats.teachers;
            statCards[2].textContent = stats.classes;
            statCards[3].textContent = stats.payments;
        }
    }

    loadRecentStudents() {
        // Simulate loading recent students needing support
        const students = [
            { name: 'Trần Văn C', class: 'Lớp 10A1', issue: 'Cần hỗ trợ Toán', priority: 'urgent' },
            { name: 'Lê Thị D', class: 'Lớp 11B2', issue: 'Cần tư vấn học tập', priority: 'high' },
            { name: 'Phạm Văn E', class: 'Lớp 12C1', issue: 'Cần hỗ trợ đăng ký', priority: 'normal' }
        ];

        const studentList = document.querySelector('.student-list');
        if (studentList) {
            studentList.innerHTML = students.map(student => `
                <div class="student-item">
                    <div class="student-info">
                        <h4>${student.name}</h4>
                        <p>${student.class} • ${student.issue}</p>
                    </div>
                    <div class="student-status">
                        <span class="status-badge ${student.priority}">${this.getPriorityText(student.priority)}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    loadRecentPayments() {
        // Simulate loading recent payments
        const payments = [
            { name: 'Nguyễn Văn F', type: 'Thanh toán học phí tháng 12', amount: '2,500,000đ', status: 'success' },
            { name: 'Trần Thị G', type: 'Thanh toán học phí tháng 12', amount: '1,800,000đ', status: 'pending' },
            { name: 'Lê Văn H', type: 'Phí đăng ký khóa học', amount: '500,000đ', status: 'success' }
        ];

        const paymentList = document.querySelector('.payment-list');
        if (paymentList) {
            paymentList.innerHTML = payments.map(payment => `
                <div class="payment-item">
                    <div class="payment-info">
                        <h4>${payment.name}</h4>
                        <p>${payment.type}</p>
                    </div>
                    <div class="payment-amount">
                        <span class="amount">${payment.amount}</span>
                        <span class="status-badge ${payment.status}">${this.getStatusText(payment.status)}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    loadWeeklySchedule() {
        // Load weekly schedule data
        const scheduleData = [
            { day: '16', event: 'Hỗ trợ học sinh' },
            { day: '17', event: 'Tư vấn phụ huynh' },
            { day: '18', event: 'Xử lý thanh toán', today: true },
            { day: '19', event: 'Họp với gia sư' },
            { day: '20', event: 'Kiểm tra lớp học' },
            { day: '21', event: 'Báo cáo tuần' },
            { day: '22', event: '' }
        ];

        const calendarGrid = document.querySelector('.calendar-grid');
        if (calendarGrid) {
            const dayElements = calendarGrid.querySelectorAll('.calendar-day');
            dayElements.forEach((dayElement, index) => {
                if (scheduleData[index]) {
                    const dayNumber = dayElement.querySelector('.calendar-day-number');
                    const event = dayElement.querySelector('.calendar-event');
                    
                    if (dayNumber) {
                        dayNumber.textContent = scheduleData[index].day;
                    }
                    
                    if (event && scheduleData[index].event) {
                        event.textContent = scheduleData[index].event;
                    } else if (event && !scheduleData[index].event) {
                        event.style.display = 'none';
                    }
                    
                    if (scheduleData[index].today) {
                        dayElement.classList.add('today');
                    }
                }
            });
        }
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'students':
                this.loadStudentsData();
                break;
            case 'teachers':
                this.loadTeachersData();
                break;
            case 'classes':
                this.loadClassesData();
                break;
            case 'payments':
                this.loadPaymentsData();
                break;
            case 'support':
                this.loadSupportData();
                break;
            case 'messages':
                this.loadMessagesData();
                break;
        }
    }

    loadStudentsData() {
        // Simulate loading students data
        console.log('Loading students data...');
    }

    loadTeachersData() {
        // Simulate loading teachers data
        console.log('Loading teachers data...');
    }

    loadClassesData() {
        // Simulate loading classes data
        console.log('Loading classes data...');
    }

    loadPaymentsData() {
        // Simulate loading payments data
        console.log('Loading payments data...');
    }

    loadSupportData() {
        // Simulate loading support data
        console.log('Loading support data...');
    }

    loadMessagesData() {
        // Simulate loading messages data
        console.log('Loading messages data...');
    }

    handleSearch(query, sectionId) {
        console.log(`Searching "${query}" in ${sectionId}`);
        // Implement search functionality for each section
    }

    navigateWeek(direction) {
        console.log(`Navigate week: ${direction}`);
        // Implement week navigation
    }

    showNotifications() {
        console.log('Showing notifications');
        // Implement notifications display
    }

    // Student Management Methods
    showStudentDetails() {
        const studentModal = document.getElementById('studentModal');
        if (studentModal) {
            studentModal.classList.add('active');
        }
    }

    editStudent() {
        console.log('Edit student');
        // Implement edit student functionality
    }

    addStudent() {
        console.log('Add new student');
        // Implement add student functionality
    }

    // Teacher Management Methods
    showTeacherDetails() {
        const teacherModal = document.getElementById('teacherModal');
        if (teacherModal) {
            teacherModal.classList.add('active');
        }
    }

    editTeacher() {
        console.log('Edit teacher');
        // Implement edit teacher functionality
    }

    addTeacher() {
        console.log('Add new teacher');
        // Implement add teacher functionality
    }

    // Class Management Methods
    showClassDetails() {
        console.log('Show class details');
        // Implement show class details functionality
    }

    editClass() {
        console.log('Edit class');
        // Implement edit class functionality
    }

    createClass() {
        console.log('Create new class');
        // Implement create class functionality
    }

    // Payment Management Methods
    viewPayment() {
        console.log('View payment details');
        // Implement view payment functionality
    }

    processPayment() {
        console.log('Process payment');
        // Implement process payment functionality
    }

    printInvoice() {
        console.log('Print invoice');
        // Implement print invoice functionality
    }

    addPayment() {
        console.log('Add new payment');
        // Implement add payment functionality
    }

    // Support Methods
    processSupportRequest() {
        console.log('Process support request');
        // Implement process support request functionality
    }

    viewSupportDetails() {
        console.log('View support details');
        // Implement view support details functionality
    }

    createSupportRequest() {
        console.log('Create support request');
        // Implement create support request functionality
    }

    // Message Methods
    replyMessage() {
        console.log('Reply to message');
        // Implement reply message functionality
    }

    viewMessageDetails() {
        console.log('View message details');
        // Implement view message details functionality
    }

    createNewMessage() {
        console.log('Create new message');
        // Implement create new message functionality
    }

    // Utility Methods
    getPriorityText(priority) {
        const priorityTexts = {
            'urgent': 'Khẩn cấp',
            'high': 'Ưu tiên cao',
            'normal': 'Bình thường'
        };
        return priorityTexts[priority] || 'Bình thường';
    }

    getStatusText(status) {
        const statusTexts = {
            'success': 'Đã thanh toán',
            'pending': 'Chờ xử lý',
            'active': 'Đang học',
            'inactive': 'Tạm nghỉ'
        };
        return statusTexts[status] || status;
    }

    logout() {
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            // Implement logout functionality
            console.log('Logging out...');
            // Redirect to login page
            window.location.href = '/login';
        }
    }

    // API Methods using TutorAPI
    async fetchStudents() {
        try {
            return await window.tutorAPI.getStudents();
        } catch (error) {
            console.error('Error fetching students:', error);
            window.tutorAPI.handleError(error);
            return [];
        }
    }

    async fetchTeachers() {
        try {
            return await window.tutorAPI.getTeachers();
        } catch (error) {
            console.error('Error fetching teachers:', error);
            window.tutorAPI.handleError(error);
            return [];
        }
    }

    async fetchClasses() {
        try {
            return await window.tutorAPI.getClasses();
        } catch (error) {
            console.error('Error fetching classes:', error);
            window.tutorAPI.handleError(error);
            return [];
        }
    }

    async fetchPayments() {
        try {
            return await window.tutorAPI.getPayments();
        } catch (error) {
            console.error('Error fetching payments:', error);
            window.tutorAPI.handleError(error);
            return [];
        }
    }

    async fetchSupportRequests() {
        try {
            return await window.tutorAPI.getSupportRequests();
        } catch (error) {
            console.error('Error fetching support requests:', error);
            window.tutorAPI.handleError(error);
            return [];
        }
    }

    async fetchMessages() {
        try {
            return await window.tutorAPI.getMessages();
        } catch (error) {
            console.error('Error fetching messages:', error);
            window.tutorAPI.handleError(error);
            return [];
        }
    }

    async fetchDashboardStats() {
        try {
            return await window.tutorAPI.getDashboardStats();
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            window.tutorAPI.handleError(error);
            return {};
        }
    }

    async fetchRecentStudents() {
        try {
            return await window.tutorAPI.getRecentStudents();
        } catch (error) {
            console.error('Error fetching recent students:', error);
            window.tutorAPI.handleError(error);
            return [];
        }
    }

    async fetchRecentPayments() {
        try {
            return await window.tutorAPI.getRecentPayments();
        } catch (error) {
            console.error('Error fetching recent payments:', error);
            window.tutorAPI.handleError(error);
            return [];
        }
    }

    async fetchWeeklySchedule() {
        try {
            return await window.tutorAPI.getWeeklySchedule();
        } catch (error) {
            console.error('Error fetching weekly schedule:', error);
            window.tutorAPI.handleError(error);
            return [];
        }
    }
}

    // Assigned Students functions
    async function viewStudentDetails(studentId) {
        try {
            const student = await window.tutorAPI.getStudentDetails(studentId);
            showStudentDetailsModal(student);
        } catch (error) {
            console.error('Error fetching student details:', error);
            window.tutorAPI.handleError(error);
        }
    }

    async function addNote(studentId) {
        const note = prompt('Nhập ghi chú cho học sinh:');
        if (note) {
            try {
                await window.tutorAPI.addStudentNote(studentId, note);
                showNotification('Ghi chú đã được thêm thành công!', 'success');
                loadAssignedStudents();
            } catch (error) {
                console.error('Error adding note:', error);
                window.tutorAPI.handleError(error);
            }
        }
    }

    async function generateReport(studentId) {
        try {
            const report = await window.tutorAPI.generateStudentReport(studentId);
            showReportModal(report);
        } catch (error) {
            console.error('Error generating report:', error);
            window.tutorAPI.handleError(error);
        }
    }

    // Consultation Schedule functions
    async function addConsultation() {
        const form = document.getElementById('consultationForm');
        if (form) {
            const formData = new FormData(form);
            try {
                await window.tutorAPI.createConsultation(formData);
                showNotification('Buổi tư vấn đã được tạo thành công!', 'success');
                loadConsultationSchedule();
            } catch (error) {
                console.error('Error creating consultation:', error);
                window.tutorAPI.handleError(error);
            }
        }
    }

    async function updateConsultationContent(consultationId, content) {
        try {
            await window.tutorAPI.updateConsultationContent(consultationId, content);
            showNotification('Nội dung tư vấn đã được cập nhật!', 'success');
            loadConsultationSchedule();
        } catch (error) {
            console.error('Error updating consultation:', error);
            window.tutorAPI.handleError(error);
        }
    }

    // Enhanced Consultation Schedule functions
    async function addConsultationSchedule() {
        showAddConsultationModal();
    }

    async function exportConsultationSchedule() {
        try {
            const schedule = await window.tutorAPI.exportConsultationSchedule();
            downloadSchedule(schedule);
            showNotification('Lịch tư vấn đã được xuất thành công!', 'success');
        } catch (error) {
            console.error('Error exporting consultation schedule:', error);
            window.tutorAPI.handleError(error);
        }
    }

    function changeConsultationMonth(direction) {
        // This would typically update the calendar view
        const currentMonthElement = document.getElementById('currentMonth');
        const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                       'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        const currentText = currentMonthElement.textContent;
        const currentMonth = months.indexOf(currentText.split(',')[0]);
        const newMonth = (currentMonth + direction + 12) % 12;
        const currentYear = new Date().getFullYear();
        currentMonthElement.textContent = `${months[newMonth]}, ${currentYear}`;
        
        // Load consultation data for the new month
        loadConsultationSchedule();
    }

    async function startConsultation(consultationId) {
        try {
            await window.tutorAPI.startConsultation(consultationId);
            showNotification('Buổi tư vấn đã được bắt đầu!', 'success');
            loadConsultationSchedule();
        } catch (error) {
            console.error('Error starting consultation:', error);
            window.tutorAPI.handleError(error);
        }
    }

    async function viewConsultationDetails(consultationId) {
        try {
            const consultation = await window.tutorAPI.getConsultationById(consultationId);
            showConsultationDetailsModal(consultation);
        } catch (error) {
            console.error('Error fetching consultation details:', error);
            window.tutorAPI.handleError(error);
        }
    }

    async function reviewConsultation(consultationId) {
        try {
            const consultation = await window.tutorAPI.getConsultationById(consultationId);
            showConsultationReviewModal(consultation);
        } catch (error) {
            console.error('Error fetching consultation for review:', error);
            window.tutorAPI.handleError(error);
        }
    }

    function downloadSchedule(schedule) {
        const blob = new Blob([schedule.content], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lich_tu_van_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Payment Processing functions
    async function addPayment() {
        const form = document.getElementById('paymentForm');
        if (form) {
            const formData = new FormData(form);
            try {
                await window.tutorAPI.createPayment(formData);
                showNotification('Giao dịch đã được lưu thành công!', 'success');
                form.reset();
                loadPayments();
                updatePaymentSummary();
            } catch (error) {
                console.error('Error creating payment:', error);
                window.tutorAPI.handleError(error);
            }
        }
    }

    async function updatePaymentStatus(paymentId, status) {
        try {
            await window.tutorAPI.updatePaymentStatus(paymentId, status);
            showNotification('Trạng thái thanh toán đã được cập nhật!', 'success');
            loadPayments();
            updatePaymentSummary();
        } catch (error) {
            console.error('Error updating payment status:', error);
            window.tutorAPI.handleError(error);
        }
    }

    async function viewPaymentDetails(paymentId) {
        try {
            const payment = await window.tutorAPI.getPaymentById(paymentId);
            showPaymentDetailsModal(payment);
        } catch (error) {
            console.error('Error fetching payment details:', error);
            window.tutorAPI.handleError(error);
        }
    }

    async function editPayment(paymentId) {
        try {
            const payment = await window.tutorAPI.getPaymentById(paymentId);
            showEditPaymentModal(payment);
        } catch (error) {
            console.error('Error fetching payment details:', error);
            window.tutorAPI.handleError(error);
        }
    }

    async function printReceipt(paymentId) {
        try {
            const receipt = await window.tutorAPI.generateReceipt(paymentId);
            showReceiptModal(receipt);
        } catch (error) {
            console.error('Error generating receipt:', error);
            window.tutorAPI.handleError(error);
        }
    }

    async function syncWithFinanceSystem() {
        try {
            showNotification('Đang đồng bộ với hệ thống tài chính...', 'info');
            await window.tutorAPI.syncWithFinanceSystem();
            showNotification('Đồng bộ thành công!', 'success');
            updateVerificationStatus();
        } catch (error) {
            console.error('Error syncing with finance system:', error);
            window.tutorAPI.handleError(error);
        }
    }

    async function exportPaymentReport() {
        try {
            const report = await window.tutorAPI.generatePaymentReport();
            downloadReport(report);
            showNotification('Báo cáo đã được xuất thành công!', 'success');
        } catch (error) {
            console.error('Error exporting payment report:', error);
            window.tutorAPI.handleError(error);
        }
    }

    function viewFinanceSystem() {
        // Open finance system in new tab
        window.open('/finance-system', '_blank');
    }

    function updatePaymentSummary() {
        // Update payment summary statistics
        const today = new Date().toISOString().split('T')[0];
        // This would typically fetch real data from API
        const summary = {
            transactions: 4,
            totalAmount: 7200000,
            verified: 3,
            pending: 1
        };
        
        document.querySelector('.stat-item:nth-child(1) .stat-value').textContent = summary.transactions;
        document.querySelector('.stat-item:nth-child(2) .stat-value').textContent = summary.totalAmount.toLocaleString();
        document.querySelector('.stat-item:nth-child(3) .stat-value').textContent = summary.verified;
        document.querySelector('.stat-item:nth-child(4) .stat-value').textContent = summary.pending;
    }

    function updateVerificationStatus() {
        const now = new Date();
        const timeString = now.toLocaleString('vi-VN');
        document.querySelector('.status-item:nth-child(2) span').textContent = `Lần đồng bộ cuối: ${timeString}`;
    }

    function downloadReport(report) {
        const blob = new Blob([report.content], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment_report_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Message functions
    async function sendMessage(studentId, message) {
        try {
            await window.tutorAPI.sendMessage(studentId, message);
            loadMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            window.tutorAPI.handleError(error);
        }
    }

    async function getQuickResponse(type) {
        try {
            const response = await window.tutorAPI.getQuickResponse(type);
            return response;
        } catch (error) {
            console.error('Error getting quick response:', error);
            return null;
        }
    }

    // Modal functions
    function showStudentDetailsModal(student) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chi tiết học sinh</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="student-details">
                        <h4>${student.name}</h4>
                        <p><strong>Lớp:</strong> ${student.class}</p>
                        <p><strong>Chương trình:</strong> ${student.program}</p>
                        <p><strong>Tiến độ học tập:</strong> ${student.progress}%</p>
                        <p><strong>Điểm trung bình:</strong> ${student.averageGrade}</p>
                        <p><strong>Trạng thái:</strong> ${student.status}</p>
                        <p><strong>Ghi chú:</strong> ${student.notes || 'Chưa có ghi chú'}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Đóng</button>
                    <button class="btn btn-primary" onclick="addNote('${student.id}')">Thêm ghi chú</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    function showReportModal(report) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Báo cáo học sinh</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="report-content">
                        <h4>${report.title}</h4>
                        <p><strong>Học sinh:</strong> ${report.studentName}</p>
                        <p><strong>Lớp:</strong> ${report.class}</p>
                        <p><strong>Thời gian:</strong> ${report.date}</p>
                        <div class="report-body">
                            ${report.content}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Đóng</button>
                    <button class="btn btn-primary" onclick="printReport()">In báo cáo</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    function closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
    }

    function printReport() {
        window.print();
    }

    function exportStudentList() {
        // Create CSV content
        const csvContent = "Học sinh,Lớp/Chương trình,Tiến độ,Điểm TB,Trạng thái,Ghi chú\n" +
            "Trần Văn C,Toán 10A1 • Cambridge IGCSE,75%,8.5,Tốt,Học tập tích cực\n" +
            "Lê Thị D,Toán 11B2 • IB Math HL,45%,6.2,Cần hỗ trợ,Cần hỗ trợ thêm\n" +
            "Phạm Văn E,Toán 12C1 • AP Calculus,30%,4.8,Nguy cơ thấp điểm,Cần can thiệp";
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'danh_sach_hoc_sinh.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    function showAddConsultationModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Thêm buổi tư vấn</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="consultationForm">
                        <div class="form-group">
                            <label for="studentSelect">Học sinh</label>
                            <select class="form-select" id="studentSelect" required>
                                <option value="">Chọn học sinh</option>
                                <option value="TC">Trần Văn C - Lớp 10A1</option>
                                <option value="LD">Lê Thị D - Lớp 11B2</option>
                                <option value="PE">Phạm Văn E - Lớp 12C1</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="consultationDate">Ngày tư vấn</label>
                            <input type="date" class="form-control" id="consultationDate" required>
                        </div>
                        <div class="form-group">
                            <label for="consultationTime">Thời gian</label>
                            <input type="time" class="form-control" id="consultationTime" required>
                        </div>
                        <div class="form-group">
                            <label for="consultationType">Loại tư vấn</label>
                            <select class="form-select" id="consultationType" required>
                                <option value="">Chọn loại tư vấn</option>
                                <option value="study-guidance">Định hướng học tập</option>
                                <option value="exam-prep">Chuẩn bị thi</option>
                                <option value="course-selection">Chọn lớp nâng cao</option>
                                <option value="career-guidance">Định hướng nghề nghiệp</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="consultationContent">Nội dung tư vấn</label>
                            <textarea class="form-control" id="consultationContent" rows="4" placeholder="Mô tả nội dung tư vấn..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Hủy</button>
                    <button class="btn btn-primary" onclick="addConsultation()">Tạo buổi tư vấn</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    function showPaymentDetailsModal(payment) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chi tiết giao dịch</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="payment-details">
                        <div class="detail-row">
                            <strong>Học sinh:</strong> ${payment.studentName}
                        </div>
                        <div class="detail-row">
                            <strong>Số tiền:</strong> ${payment.amount.toLocaleString()} VNĐ
                        </div>
                        <div class="detail-row">
                            <strong>Loại thanh toán:</strong> ${payment.type}
                        </div>
                        <div class="detail-row">
                            <strong>Ngày/Giờ:</strong> ${payment.date} ${payment.time}
                        </div>
                        <div class="detail-row">
                            <strong>Số biên lai:</strong> ${payment.receiptNumber}
                        </div>
                        <div class="detail-row">
                            <strong>Trạng thái:</strong> ${payment.status}
                        </div>
                        <div class="detail-row">
                            <strong>Ghi chú:</strong> ${payment.notes || 'Không có ghi chú'}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Đóng</button>
                    <button class="btn btn-primary" onclick="printReceipt('${payment.id}')">In biên lai</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    function showEditPaymentModal(payment) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chỉnh sửa giao dịch</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="editPaymentForm">
                        <div class="form-group">
                            <label for="editAmount">Số tiền (VNĐ)</label>
                            <input type="number" class="form-control" id="editAmount" value="${payment.amount}" required>
                        </div>
                        <div class="form-group">
                            <label for="editPaymentType">Loại thanh toán</label>
                            <select class="form-select" id="editPaymentType" required>
                                <option value="tuition" ${payment.type === 'tuition' ? 'selected' : ''}>Học phí tháng</option>
                                <option value="registration" ${payment.type === 'registration' ? 'selected' : ''}>Phí đăng ký</option>
                                <option value="exam" ${payment.type === 'exam' ? 'selected' : ''}>Phí thi</option>
                                <option value="material" ${payment.type === 'material' ? 'selected' : ''}>Phí tài liệu</option>
                                <option value="other" ${payment.type === 'other' ? 'selected' : ''}>Khác</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editNotes">Ghi chú</label>
                            <textarea class="form-control" id="editNotes" rows="3">${payment.notes || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Hủy</button>
                    <button class="btn btn-primary" onclick="savePaymentEdit('${payment.id}')">Lưu thay đổi</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    function showReceiptModal(receipt) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Biên lai thanh toán</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="receipt-content">
                        <div class="receipt-header">
                            <h4>MATHBRIDGE EDUCATION CENTER</h4>
                            <p>Biên lai thanh toán</p>
                        </div>
                        <div class="receipt-body">
                            <div class="receipt-item">
                                <span>Số biên lai:</span>
                                <span>${receipt.receiptNumber}</span>
                            </div>
                            <div class="receipt-item">
                                <span>Ngày:</span>
                                <span>${receipt.date}</span>
                            </div>
                            <div class="receipt-item">
                                <span>Học sinh:</span>
                                <span>${receipt.studentName}</span>
                            </div>
                            <div class="receipt-item">
                                <span>Số tiền:</span>
                                <span>${receipt.amount.toLocaleString()} VNĐ</span>
                            </div>
                            <div class="receipt-item">
                                <span>Loại:</span>
                                <span>${receipt.type}</span>
                            </div>
                            <div class="receipt-item">
                                <span>Ghi chú:</span>
                                <span>${receipt.notes || 'Không có'}</span>
                            </div>
                        </div>
                        <div class="receipt-footer">
                            <p>Cảm ơn quý khách!</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Đóng</button>
                    <button class="btn btn-primary" onclick="printReceiptContent()">In biên lai</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    async function savePaymentEdit(paymentId) {
        const form = document.getElementById('editPaymentForm');
        if (form) {
            const formData = new FormData(form);
            try {
                await window.tutorAPI.updatePayment(paymentId, formData);
                showNotification('Giao dịch đã được cập nhật thành công!', 'success');
                closeModal();
                loadPayments();
                updatePaymentSummary();
            } catch (error) {
                console.error('Error updating payment:', error);
                window.tutorAPI.handleError(error);
            }
        }
    }

    function printReceiptContent() {
        window.print();
    }

    function showConsultationDetailsModal(consultation) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chi tiết buổi tư vấn</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="consultation-details">
                        <div class="detail-row">
                            <strong>Học sinh:</strong> ${consultation.studentName}
                        </div>
                        <div class="detail-row">
                            <strong>Lớp:</strong> ${consultation.class}
                        </div>
                        <div class="detail-row">
                            <strong>Chương trình:</strong> ${consultation.program}
                        </div>
                        <div class="detail-row">
                            <strong>Loại tư vấn:</strong> ${consultation.type}
                        </div>
                        <div class="detail-row">
                            <strong>Thời gian:</strong> ${consultation.time}
                        </div>
                        <div class="detail-row">
                            <strong>Phòng:</strong> ${consultation.room}
                        </div>
                        <div class="detail-row">
                            <strong>Trạng thái:</strong> ${consultation.status}
                        </div>
                        <div class="detail-row">
                            <strong>Nội dung:</strong> ${consultation.content || 'Chưa có nội dung'}
                        </div>
                        <div class="detail-row">
                            <strong>Ghi chú:</strong> ${consultation.notes || 'Không có ghi chú'}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Đóng</button>
                    <button class="btn btn-primary" onclick="editConsultationContent('${consultation.id}')">Cập nhật nội dung</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    function showConsultationReviewModal(consultation) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Đánh giá buổi tư vấn</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="consultation-review">
                        <h4>${consultation.studentName} - ${consultation.type}</h4>
                        <p><strong>Thời gian:</strong> ${consultation.time}</p>
                        <p><strong>Nội dung đã tư vấn:</strong></p>
                        <div class="review-content">
                            ${consultation.content || 'Chưa có nội dung'}
                        </div>
                        <div class="review-form">
                            <h5>Đánh giá kết quả:</h5>
                            <div class="form-group">
                                <label for="reviewRating">Mức độ hài lòng:</label>
                                <select class="form-select" id="reviewRating">
                                    <option value="">Chọn mức độ</option>
                                    <option value="excellent">Rất hài lòng</option>
                                    <option value="good">Hài lòng</option>
                                    <option value="average">Bình thường</option>
                                    <option value="poor">Không hài lòng</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="reviewNotes">Ghi chú đánh giá:</label>
                                <textarea class="form-control" id="reviewNotes" rows="4" placeholder="Nhập đánh giá chi tiết..."></textarea>
                            </div>
                            <div class="form-group">
                                <label for="followUpRequired">Cần tư vấn tiếp:</label>
                                <select class="form-select" id="followUpRequired">
                                    <option value="no">Không</option>
                                    <option value="yes">Có</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Hủy</button>
                    <button class="btn btn-primary" onclick="saveConsultationReview('${consultation.id}')">Lưu đánh giá</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    async function editConsultationContent(consultationId) {
        const content = prompt('Nhập nội dung tư vấn mới:');
        if (content) {
            try {
                await window.tutorAPI.updateConsultationContent(consultationId, content);
                showNotification('Nội dung tư vấn đã được cập nhật!', 'success');
                closeModal();
                loadConsultationSchedule();
            } catch (error) {
                console.error('Error updating consultation content:', error);
                window.tutorAPI.handleError(error);
            }
        }
    }

    async function saveConsultationReview(consultationId) {
        const rating = document.getElementById('reviewRating').value;
        const notes = document.getElementById('reviewNotes').value;
        const followUpRequired = document.getElementById('followUpRequired').value;
        
        if (!rating) {
            showNotification('Vui lòng chọn mức độ hài lòng!', 'error');
            return;
        }
        
        try {
            await window.tutorAPI.saveConsultationReview(consultationId, {
                rating,
                notes,
                followUpRequired
            });
            showNotification('Đánh giá đã được lưu thành công!', 'success');
            closeModal();
            loadConsultationSchedule();
        } catch (error) {
            console.error('Error saving consultation review:', error);
            window.tutorAPI.handleError(error);
        }
    }

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TutorDashboard();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorDashboard;
}
