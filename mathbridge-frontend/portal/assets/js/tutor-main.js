// Tutor Dashboard JavaScript
class TutorDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.tutorInfo = null;
        this.init();
    }

    init() {
        // Kiểm tra đăng nhập trước
        if (!this.checkAuthentication()) {
            return;
        }
        
        this.loadTutorInfo();
        this.setupEventListeners();
        this.updateDateTime();
        this.loadDashboardData();
        this.setupSidebar();
        this.setupModals();
        this.updateTutorAvatar();
    }

    checkAuthentication() {
        // Kiểm tra xem có thông tin đăng nhập không
        const authData = localStorage.getItem('mb_auth');
        const token = localStorage.getItem('mb_token');
        
        if (!authData && !token) {
            // Chưa đăng nhập, redirect về trang login
            window.location.href = '../LoginPortal.html';
            return false;
        }
        
        // Kiểm tra role
        if (authData) {
            try {
                const data = JSON.parse(authData);
                const user = data.user || data.account || {};
                const roles = user.roles || [];
                
                if (!roles.includes('R003')) {
                    // Không phải cố vấn, redirect về login
                    alert('Bạn không có quyền truy cập trang này.');
                    window.location.href = '../LoginPortal.html';
                    return false;
                }
            } catch (e) {
                console.error('Error parsing auth data:', e);
            }
        }
        
        return true;
    }

    loadTutorInfo() {
        // Đọc thông tin từ localStorage
        const authData = localStorage.getItem('mb_auth');
        let user = null;
        
        if (authData) {
            try {
                const data = JSON.parse(authData);
                user = data.user || data.account || {};
            } catch (e) {
                console.error('Error parsing auth data:', e);
            }
        }
        
        // Fallback về các keys cũ
        const name = user?.hoTen || user?.ten || user?.fullName || 
                    localStorage.getItem('mb_user_name') || 
                    user?.email || 'Cố vấn';
        const email = user?.email || localStorage.getItem('mb_user_email') || '';
        const roles = user?.roles || [];
        
        this.tutorInfo = {
            name: name,
            email: email,
            roles: roles,
            id: user?.idTk || user?.id || localStorage.getItem('mb_user_id') || '',
            avatar: user?.avatar || null
        };
    }

    updateTutorAvatar() {
        if (!this.tutorInfo) return;
        
        const { name, email } = this.tutorInfo;
        
        // Cập nhật sidebar avatar
        const sidebarUserName = document.querySelector('.sidebar-footer .user-name');
        const sidebarUserRole = document.querySelector('.sidebar-footer .user-role');
        const sidebarAvatar = document.querySelector('.sidebar-footer .user-avatar');
        
        if (sidebarUserName) {
            sidebarUserName.textContent = name;
        }
        if (sidebarUserRole) {
            sidebarUserRole.textContent = 'Cố vấn học tập';
        }
        if (sidebarAvatar) {
            // Tạo avatar initials từ tên
            const initials = this.getInitials(name);
            sidebarAvatar.innerHTML = `<span class="avatar-initials">${initials}</span>`;
        }
        
        // Cập nhật header avatar
        const headerUserName = document.querySelector('.header .user-menu-btn span');
        const headerAvatar = document.querySelector('.header .user-avatar-small');
        
        if (headerUserName) {
            headerUserName.textContent = name;
        }
        if (headerAvatar) {
            const initials = this.getInitials(name);
            headerAvatar.innerHTML = `<span class="avatar-initials">${initials}</span>`;
        }
    }

    getInitials(name) {
        if (!name) return 'CV';
        
        // Tách tên thành các từ
        const words = name.trim().split(/\s+/);
        
        if (words.length === 1) {
            // Chỉ có 1 từ, lấy 2 ký tự đầu
            return words[0].substring(0, 2).toUpperCase();
        } else {
            // Lấy chữ cái đầu của từ đầu và từ cuối
            return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
        }
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
        // Load unpaid invoices and payment methods
        this.loadUnpaidInvoices();
        this.loadPaymentMethods();
        this.loadAllInvoices();
        
        // Set current date as payment date
        this.setPaymentDate();
        
        // Setup payment form handler
        this.setupPaymentForm();
    }

    setPaymentDate() {
        const today = new Date();
        const paymentDateInput = document.getElementById('paymentDate');
        if (paymentDateInput) {
            paymentDateInput.value = today.toLocaleDateString('vi-VN');
        }
    }

    async loadAllInvoices() {
        try {
            const invoices = await window.tutorAPI.getAllInvoices();
            this.allInvoices = invoices; // Store for filtering and sorting
            this.currentSortField = null;
            this.currentSortDirection = 'asc';
            this.filterAndDisplayInvoicesList('');
        } catch (error) {
            console.error('Error loading invoices:', error);
            window.tutorAPI.handleError(error);
        }
    }

    filterAndDisplayInvoicesList(searchTerm = '') {
        const tableBody = document.getElementById('invoicesTableBody');
        if (!tableBody) return;

        if (!this.allInvoices) return;

        // Filter invoices by student name
        let filteredInvoices = this.allInvoices.filter(invoice => {
            if (!searchTerm) return true;
            const studentName = invoice.studentName || '';
            return studentName.toLowerCase().includes(searchTerm.toLowerCase());
        });

        // Apply sorting if exists
        if (this.currentSortField) {
            filteredInvoices = this.sortInvoices(filteredInvoices, this.currentSortField, this.currentSortDirection);
        }

        if (filteredInvoices.length === 0) {
            tableBody.innerHTML = '<div class="table-row"><div colspan="8" style="text-align: center; padding: 2rem; grid-column: 1 / -1;">Không có hóa đơn nào</div></div>';
            return;
        }

        tableBody.innerHTML = filteredInvoices.map(invoice => {
            const ngayDangKy = invoice.ngayDangKy ? 
                new Date(invoice.ngayDangKy).toLocaleDateString('vi-VN') : '-';
            const ngayThanhToan = invoice.ngayThanhToan ? 
                new Date(invoice.ngayThanhToan).toLocaleDateString('vi-VN') : '-';
            const amount = invoice.tongTien ? 
                invoice.tongTien.toLocaleString('vi-VN') + ' VNĐ' : '-';
            const statusClass = invoice.trangThai === 'Da Thanh Toan' ? 'success' : 'pending';
            const statusText = invoice.trangThai === 'Da Thanh Toan' ? 'Đã thanh toán' : 'Chưa thanh toán';

            return `
                <div class="table-row invoice-row" data-invoice-id="${invoice.idHoaDon}">
                    <div>${invoice.idHoaDon || '-'}</div>
                    <div class="col-name">
                        <div class="student-avatar">${this.getInitials(invoice.studentName)}</div>
                        <div class="student-info">
                            <div class="student-name">${invoice.studentName || '-'}</div>
                        </div>
                    </div>
                    <div>${invoice.tenLop || '-'}</div>
                    <div class="amount-info">
                        <span class="amount-value">${amount}</span>
                    </div>
                    <div>${ngayDangKy}</div>
                    <div>${ngayThanhToan}</div>
                    <div>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="window.tutorDashboard.viewInvoiceDetails('${invoice.idHoaDon}')">
                            <i class="fas fa-eye"></i> Xem chi tiết
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async viewInvoiceDetails(idHoaDon) {
        try {
            const invoice = await window.tutorAPI.getInvoiceDetails(idHoaDon);
            this.displayInvoiceDetails(invoice);
            
            // Open modal
            this.openInvoiceModal();
        } catch (error) {
            console.error('Error loading invoice details:', error);
            window.tutorAPI.handleError(error);
        }
    }

    openInvoiceModal() {
        const modal = document.getElementById('invoiceDetailsModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    closeInvoiceModal() {
        const modal = document.getElementById('invoiceDetailsModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    async loadUnpaidInvoices() {
        try {
            const invoices = await window.tutorAPI.getUnpaidInvoices();
            this.allUnpaidInvoices = invoices; // Store for filtering
            this.filterAndDisplayUnpaidInvoices('');
        } catch (error) {
            console.error('Error loading unpaid invoices:', error);
            window.tutorAPI.handleError(error);
        }
    }

    filterAndDisplayUnpaidInvoices(searchTerm = '') {
        const invoiceSelectList = document.getElementById('invoiceSelectList');
        if (!invoiceSelectList) return;

        if (!this.allUnpaidInvoices) {
            invoiceSelectList.innerHTML = '<div class="custom-select-option disabled">Đang tải...</div>';
            return;
        }

        // Filter invoices by student name or class
        const filteredInvoices = this.allUnpaidInvoices.filter(invoice => {
            if (!searchTerm) return true;
            const studentName = (invoice.studentName || '').toLowerCase();
            const tenLop = (invoice.tenLop || '').toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            return studentName.includes(searchLower) || tenLop.includes(searchLower);
        });

        if (filteredInvoices.length === 0) {
            invoiceSelectList.innerHTML = '<div class="custom-select-option disabled">Không tìm thấy hóa đơn nào</div>';
            return;
        }

        // Clear and add filtered unpaid invoices - show student name and class
        invoiceSelectList.innerHTML = '';
        filteredInvoices.forEach(invoice => {
            const option = document.createElement('div');
            option.className = 'custom-select-option';
            option.dataset.value = invoice.idHoaDon;
            option.setAttribute('tabindex', '0');
            
            // Display format: "Tên học sinh - Lớp học"
            const displayText = invoice.tenLop 
                ? `${invoice.studentName || '-'} - ${invoice.tenLop}`
                : invoice.studentName || '-';
            option.textContent = displayText;
            
            option.addEventListener('click', () => {
                this.selectInvoice(invoice.idHoaDon, invoice.studentName, invoice.tenLop);
            });
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectInvoice(invoice.idHoaDon, invoice.studentName, invoice.tenLop);
                }
            });
            invoiceSelectList.appendChild(option);
        });
    }

    selectInvoice(idHoaDon, studentName, tenLop = null) {
        const hiddenInput = document.getElementById('invoiceSelect');
        const triggerText = document.getElementById('invoiceSelectText');
        const wrapper = document.getElementById('invoiceSelectWrapper');

        if (hiddenInput) {
            hiddenInput.value = idHoaDon;
        }
        if (triggerText) {
            // Display format: "Tên học sinh - Lớp học"
            const displayText = tenLop 
                ? `${studentName || '-'} - ${tenLop}`
                : studentName || 'Chọn hóa đơn...';
            triggerText.textContent = displayText;
        }
        if (wrapper) {
            wrapper.classList.remove('open');
        }

        // Load payment details
        if (idHoaDon) {
            this.loadPaymentDetails(idHoaDon);
        } else {
            this.hideStudentInfo();
        }
    }

    async loadPaymentMethods() {
        try {
            const methods = await window.tutorAPI.getPaymentMethods();
            const paymentMethodSelect = document.getElementById('paymentMethod');
            if (paymentMethodSelect) {
                // Clear existing options except the first one
                paymentMethodSelect.innerHTML = '<option value="">Chọn phương thức thanh toán...</option>';
                
                // Add payment methods
                methods.forEach(method => {
                    const option = document.createElement('option');
                    option.value = method.idPt;
                    option.textContent = `${method.tenPt} (${method.hinhThucTt})`;
                    paymentMethodSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
            window.tutorAPI.handleError(error);
        }
    }

    setupPaymentForm() {
        const invoiceSelect = document.getElementById('invoiceSelect');
        const paymentForm = document.getElementById('paymentForm');
        const resetBtn = document.getElementById('resetPaymentForm');

        console.log('Setting up payment form...', {
            paymentForm: !!paymentForm,
            invoiceSelect: !!invoiceSelect,
            resetBtn: !!resetBtn
        });

        // Setup custom select dropdown
        this.setupCustomSelect();

        // Setup modal close buttons
        const closeModalBtn = document.getElementById('closeInvoiceModal');
        const closeModalBtnFooter = document.getElementById('closeInvoiceModalBtn');
        const modalOverlay = document.getElementById('invoiceDetailsModal');

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.closeInvoiceModal();
            });
        }

        if (closeModalBtnFooter) {
            closeModalBtnFooter.addEventListener('click', () => {
                this.closeInvoiceModal();
            });
        }

        // Close modal when clicking outside
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeInvoiceModal();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('invoiceDetailsModal');
                if (modal && modal.style.display === 'flex') {
                    this.closeInvoiceModal();
                }
            }
        });

        // Handle form submission
        if (paymentForm) {
            // Handle form submit event
            paymentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Form submit event triggered');
                await this.handlePaymentSubmit();
                return false;
            });
            
            // Also handle button click directly as backup
            const submitButton = paymentForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.addEventListener('click', async (e) => {
                    // Only handle if form validation passes
                    if (paymentForm.checkValidity()) {
                        e.preventDefault();
                        console.log('Submit button clicked');
                        await this.handlePaymentSubmit();
                    }
                });
            }
        }

        // Handle reset
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetPaymentForm();
            });
        }

        // Handle refresh invoice list
        const refreshBtn = document.getElementById('refreshInvoiceList');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                await this.loadAllInvoices();
                showNotification('Danh sách hóa đơn đã được làm mới!', 'success');
            });
        }

        // Handle invoice list search
        const invoiceListSearch = document.getElementById('invoiceListSearch');
        if (invoiceListSearch) {
            invoiceListSearch.addEventListener('input', (e) => {
                const searchTerm = e.target.value;
                this.filterAndDisplayInvoicesList(searchTerm);
            });
        }

        // Handle sortable headers - use event delegation for dynamically loaded content
        const invoicesTableContainer = document.querySelector('.invoices-table-container');
        if (invoicesTableContainer) {
            invoicesTableContainer.addEventListener('click', (e) => {
                // Handle click on sortable header or its children (icon, text)
                let sortable = e.target.closest('.sortable');
                
                // If clicked on icon, get parent sortable
                if (!sortable && e.target.tagName === 'I') {
                    sortable = e.target.parentElement;
                }
                
                // If clicked on text node, get parent sortable
                if (!sortable && e.target.parentElement) {
                    sortable = e.target.parentElement.closest('.sortable');
                }
                
                if (sortable && sortable.classList.contains('sortable')) {
                    const sortField = sortable.dataset.sort;
                    if (sortField) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Sorting by:', sortField);
                        this.sortInvoicesList(sortField);
                    }
                }
            });
        }
    }

    async handlePaymentSubmit() {
        // Validate custom select
        const hiddenInput = document.getElementById('invoiceSelect');
        if (!hiddenInput || !hiddenInput.value) {
            showNotification('Vui lòng chọn hóa đơn!', 'error');
            const wrapper = document.getElementById('invoiceSelectWrapper');
            if (wrapper) {
                wrapper.classList.add('open');
            }
            return;
        }
        
        // Validate payment method
        const paymentMethodSelect = document.getElementById('paymentMethod');
        if (!paymentMethodSelect || !paymentMethodSelect.value) {
            showNotification('Vui lòng chọn phương thức thanh toán!', 'error');
            return;
        }
        
        try {
            await this.processPayment();
        } catch (error) {
            console.error('Error in payment submit handler:', error);
        }
    }

    sortInvoicesList(field) {
        // Toggle sort direction if same field
        if (this.currentSortField === field) {
            this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSortField = field;
            this.currentSortDirection = 'asc';
        }

        // Update sort icons
        document.querySelectorAll('.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });

        const activeHeader = document.querySelector(`[data-sort="${field}"] i`);
        if (activeHeader) {
            activeHeader.className = this.currentSortDirection === 'asc' 
                ? 'fas fa-sort-up' 
                : 'fas fa-sort-down';
        }

        // Get current search term
        const searchInput = document.getElementById('invoiceListSearch');
        const searchTerm = searchInput ? searchInput.value : '';
        
        // Re-display with new sort
        this.filterAndDisplayInvoicesList(searchTerm);
    }

    sortInvoices(invoices, field, direction) {
        const sorted = [...invoices].sort((a, b) => {
            let aVal, bVal;

            switch (field) {
                case 'idHoaDon':
                    aVal = a.idHoaDon || '';
                    bVal = b.idHoaDon || '';
                    break;
                case 'studentName':
                    aVal = a.studentName || '';
                    bVal = b.studentName || '';
                    break;
                case 'tenLop':
                    aVal = a.tenLop || '';
                    bVal = b.tenLop || '';
                    break;
                case 'tongTien':
                    aVal = a.tongTien ? parseFloat(a.tongTien) : 0;
                    bVal = b.tongTien ? parseFloat(b.tongTien) : 0;
                    break;
                case 'ngayDangKy':
                    aVal = a.ngayDangKy ? new Date(a.ngayDangKy).getTime() : 0;
                    bVal = b.ngayDangKy ? new Date(b.ngayDangKy).getTime() : 0;
                    break;
                case 'ngayThanhToan':
                    aVal = a.ngayThanhToan ? new Date(a.ngayThanhToan).getTime() : 0;
                    bVal = b.ngayThanhToan ? new Date(b.ngayThanhToan).getTime() : 0;
                    break;
                case 'trangThai':
                    aVal = a.trangThai || '';
                    bVal = b.trangThai || '';
                    break;
                default:
                    return 0;
            }

            if (typeof aVal === 'string') {
                return direction === 'asc' 
                    ? aVal.localeCompare(bVal, 'vi')
                    : bVal.localeCompare(aVal, 'vi');
            } else {
                return direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
        });

        return sorted;
    }

    async loadPaymentDetails(idHoaDon) {
        try {
            const details = await window.tutorAPI.getPaymentDetails(idHoaDon);
            this.displayStudentInfo(details);
        } catch (error) {
            console.error('Error loading payment details:', error);
            window.tutorAPI.handleError(error);
        }
    }

    displayStudentInfo(details) {
        // Show student info section
        const studentInfoSection = document.getElementById('studentInfoSection');
        if (studentInfoSection) {
            studentInfoSection.style.display = 'block';
        }

        // Update student information
        document.getElementById('studentName').textContent = details.studentName || '-';
        document.getElementById('studentEmail').textContent = details.studentEmail || '-';
        document.getElementById('studentPhone').textContent = details.studentPhone || '-';
        document.getElementById('studentAddress').textContent = details.studentAddress || '-';
        
        // Display class information
        const classInfo = details.tenLop || '-';
        if (details.chuongTrinh) {
            document.getElementById('studentClass').textContent = `${classInfo} (${details.chuongTrinh})`;
        } else {
            document.getElementById('studentClass').textContent = classInfo;
        }
        
        // Show and display payment amount section
        const paymentAmountSection = document.getElementById('paymentAmountSection');
        if (paymentAmountSection) {
            paymentAmountSection.style.display = 'block';
        }
        
        // Format and display amount
        const amount = details.tongTien ? details.tongTien.toLocaleString('vi-VN') + ' VNĐ' : '-';
        document.getElementById('paymentAmount').textContent = amount;

        // Display payment date (always today - auto)
        this.setPaymentDate();

        // Display payment deadline
        const paymentDeadlineInput = document.getElementById('paymentDeadline');
        if (paymentDeadlineInput && details.hanThanhToan) {
            const deadlineDate = new Date(details.hanThanhToan);
            paymentDeadlineInput.value = deadlineDate.toLocaleDateString('vi-VN');
        } else if (paymentDeadlineInput) {
            paymentDeadlineInput.value = '-';
        }
    }

    hideStudentInfo() {
        const studentInfoSection = document.getElementById('studentInfoSection');
        if (studentInfoSection) {
            studentInfoSection.style.display = 'none';
        }

        // Hide payment amount section
        const paymentAmountSection = document.getElementById('paymentAmountSection');
        if (paymentAmountSection) {
            paymentAmountSection.style.display = 'none';
        }

        // Clear payment deadline, but keep payment date as today
        const paymentDeadlineInput = document.getElementById('paymentDeadline');
        if (paymentDeadlineInput) {
            paymentDeadlineInput.value = '';
        }
        
        // Reset payment date to today
        this.setPaymentDate();
    }

    async processPayment() {
        const hiddenInput = document.getElementById('invoiceSelect');
        const paymentMethodSelect = document.getElementById('paymentMethod');
        const notesTextarea = document.getElementById('notes');

        console.log('Processing payment...', {
            invoiceId: hiddenInput?.value,
            paymentMethod: paymentMethodSelect?.value,
            notes: notesTextarea?.value
        });

        if (!hiddenInput || !hiddenInput.value) {
            showNotification('Vui lòng chọn hóa đơn!', 'error');
            const wrapper = document.getElementById('invoiceSelectWrapper');
            if (wrapper) {
                wrapper.classList.add('open');
            }
            return;
        }

        if (!paymentMethodSelect || !paymentMethodSelect.value) {
            showNotification('Vui lòng chọn phương thức thanh toán!', 'error');
            return;
        }

        const paymentData = {
            idHoaDon: hiddenInput.value,
            idPt: paymentMethodSelect.value,
            ghiChu: notesTextarea ? notesTextarea.value : null
        };

        console.log('Sending payment data:', paymentData);

        try {
            const result = await window.tutorAPI.processPayment(paymentData);
            console.log('Payment result:', result);
            
            // Show success message
            showNotification('Thanh toán thành công!', 'success');
            
            // Display invoice details in modal
            this.displayInvoiceDetails(result);
            this.openInvoiceModal();
            
            // Reset form and reload unpaid invoices and all invoices
            this.resetPaymentForm();
            await this.loadUnpaidInvoices();
            await this.loadAllInvoices();
        } catch (error) {
            console.error('Error processing payment:', error);
            
            // Show user-friendly error message
            let errorMessage = 'Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.status === 400) {
                errorMessage = 'Dữ liệu thanh toán không hợp lệ. Vui lòng kiểm tra lại.';
            } else if (error.status === 500) {
                errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
            } else if (error.status === 401 || error.status === 403) {
                errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
            }
            
            showNotification(errorMessage, 'error');
            window.tutorAPI.handleError(error);
        }
    }

    displayInvoiceDetails(invoice) {
        // Check if invoice is paid
        const isPaid = invoice.trangThai === 'Da Thanh Toan' || 
                      (invoice.ngayThanhToan !== null && invoice.ngayThanhToan !== undefined) ||
                      (invoice.idLs !== null && invoice.idLs !== undefined && invoice.idLs !== '');

        // Format date
        const paymentDate = invoice.ngayThanhToan ? 
            new Date(invoice.ngayThanhToan).toLocaleDateString('vi-VN') : '-';

        // Helper function to set text with unpaid class
        const setInvoiceField = (elementId, value, isUnpaid = false) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = value;
                if (isUnpaid) {
                    element.classList.add('invoice-unpaid');
                } else {
                    element.classList.remove('invoice-unpaid');
                }
            }
        };

        // Update invoice information
        // Receipt number - show "Chưa thanh toán" if unpaid
        setInvoiceField('invoiceReceiptNumber', isPaid ? (invoice.idLs || '-') : 'Chưa thanh toán', !isPaid);
        
        document.getElementById('invoiceId').textContent = invoice.idHoaDon || '-';
        document.getElementById('invoiceStudentName').textContent = invoice.studentName || '-';
        document.getElementById('invoiceStudentEmail').textContent = invoice.studentEmail || '-';
        document.getElementById('invoiceStudentPhone').textContent = invoice.studentPhone || '-';
        document.getElementById('invoiceStudentAddress').textContent = invoice.studentAddress || '-';
        
        // Display class information
        const classInfo = invoice.tenLop || '-';
        if (invoice.chuongTrinh) {
            document.getElementById('invoiceClass').textContent = `${classInfo} (${invoice.chuongTrinh})`;
        } else {
            document.getElementById('invoiceClass').textContent = classInfo;
        }
        document.getElementById('invoiceProgram').textContent = invoice.chuongTrinh || '-';
        
        const amount = invoice.tongTien ? invoice.tongTien.toLocaleString('vi-VN') + ' VNĐ' : '-';
        document.getElementById('invoiceAmount').textContent = amount;
        
        // Payment method - show "Chưa thanh toán" if unpaid
        setInvoiceField('invoicePaymentMethod', isPaid ? (invoice.paymentMethodName || '-') : 'Chưa thanh toán', !isPaid);
        
        // Payment date - show "Chưa thanh toán" if unpaid
        setInvoiceField('invoicePaymentDate', isPaid ? paymentDate : 'Chưa thanh toán', !isPaid);
        
        // Notes - show "-" if unpaid, otherwise show ghiChu
        document.getElementById('invoiceNotes').textContent = isPaid ? (invoice.ghiChu || '-') : '-';
    }

    setupCustomSelect() {
        const wrapper = document.getElementById('invoiceSelectWrapper');
        const trigger = document.getElementById('invoiceSelectTrigger');
        const options = document.getElementById('invoiceSelectOptions');
        const searchInput = document.getElementById('invoiceSelectSearch');

        if (!wrapper || !trigger || !options) return;

        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpening = !wrapper.classList.contains('open');
            wrapper.classList.toggle('open');
            
            if (isOpening) {
                // Load invoices if not loaded yet
                if (!this.allUnpaidInvoices) {
                    this.loadUnpaidInvoices();
                } else {
                    // Reset search and show all invoices
                    if (searchInput) {
                        searchInput.value = '';
                    }
                    this.filterAndDisplayUnpaidInvoices('');
                }
                
                // Focus search input
                if (searchInput) {
                    setTimeout(() => searchInput.focus(), 100);
                }
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                wrapper.classList.remove('open');
            }
        });

        // Handle search in dropdown
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                e.stopPropagation();
                const searchTerm = e.target.value;
                this.filterAndDisplayUnpaidInvoices(searchTerm);
            });

            // Prevent dropdown from closing when clicking in search box
            searchInput.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            // Handle keyboard navigation
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    wrapper.classList.remove('open');
                    trigger.focus();
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const firstOption = document.querySelector('.custom-select-option:not(.disabled)');
                    if (firstOption) {
                        firstOption.focus();
                    }
                }
            });
        }

        // Prevent dropdown from closing when clicking in options list
        const optionsList = document.getElementById('invoiceSelectList');
        if (optionsList) {
            optionsList.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            // Keyboard navigation in options
            optionsList.addEventListener('keydown', (e) => {
                const options = Array.from(optionsList.querySelectorAll('.custom-select-option:not(.disabled)'));
                const currentIndex = options.findIndex(opt => opt === document.activeElement);

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
                    options[nextIndex].focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                    options[prevIndex].focus();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (document.activeElement.classList.contains('custom-select-option')) {
                        document.activeElement.click();
                    }
                } else if (e.key === 'Escape') {
                    wrapper.classList.remove('open');
                    trigger.focus();
                }
            });
        }

        // Make options focusable
        this.makeOptionsFocusable = () => {
            const options = document.querySelectorAll('.custom-select-option:not(.disabled)');
            options.forEach(option => {
                option.setAttribute('tabindex', '0');
            });
        };
    }

    resetPaymentForm() {
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.reset();
        }
        
        // Reset custom select
        const hiddenInput = document.getElementById('invoiceSelect');
        const triggerText = document.getElementById('invoiceSelectText');
        const wrapper = document.getElementById('invoiceSelectWrapper');
        const searchInput = document.getElementById('invoiceSelectSearch');

        if (hiddenInput) {
            hiddenInput.value = '';
        }
        if (triggerText) {
            triggerText.textContent = 'Chọn hóa đơn...';
        }
        if (wrapper) {
            wrapper.classList.remove('open');
        }
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.filterAndDisplayUnpaidInvoices('');
        this.hideStudentInfo();
        
        // Reset payment date to today and clear deadline
        this.setPaymentDate();
        const paymentDeadlineInput = document.getElementById('paymentDeadline');
        if (paymentDeadlineInput) {
            paymentDeadlineInput.value = '';
        }
        
        // Close invoice modal if open
        this.closeInvoiceModal();
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

    // Note: processPayment() is defined earlier as async method for payment processing
    // This method is kept for backward compatibility but should not be used

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
            // Xóa thông tin đăng nhập
            localStorage.removeItem('mb_auth');
            localStorage.removeItem('mb_token');
            localStorage.removeItem('mb_token_type');
            localStorage.removeItem('mb_user_id');
            localStorage.removeItem('mb_user_email');
            localStorage.removeItem('mb_user_name');
            localStorage.removeItem('mb_user_roles');
            localStorage.removeItem('authToken');
            
            // Gọi API logout nếu có
            if (window.tutorAPI) {
                window.tutorAPI.logout().catch(err => {
                    console.error('Logout API error:', err);
                });
            }
            
            // Redirect to login page
            window.location.href = '../LoginPortal.html';
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
        // This function is now handled by the TutorDashboard class
        console.log('Payment processing handled by TutorDashboard');
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

    // Removed syncWithFinanceSystem, exportPaymentReport, viewFinanceSystem, 
    // updatePaymentSummary, and updateVerificationStatus functions as they are no longer needed

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

    // Notification function
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 5px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .notification-success { background-color: #10b981; }
                .notification-error { background-color: #ef4444; }
                .notification-info { background-color: #3b82f6; }
                .notification-warning { background-color: #f59e0b; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
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
let tutorDashboardInstance;
document.addEventListener('DOMContentLoaded', () => {
    tutorDashboardInstance = new TutorDashboard();
    window.tutorDashboard = tutorDashboardInstance;
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorDashboard;
}
