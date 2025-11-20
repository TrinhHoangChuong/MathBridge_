// Tutor Dashboard JavaScript
class TutorDashboard {
  constructor() {
    this.currentSection = "dashboard";
    this.tutorInfo = null;
    this.consultationWeekStart = this.getStartOfWeek(new Date());
    this.consultationWeekData = [];
    this.consultationSlotConfig = this.getConsultationSlotConfig();
    this.consultationControlsReady = false;
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
    this.initializeConsultationSchedule();
    
    // Set initial page title
    this.updatePageTitle(this.currentSection);
  }

  checkAuthentication() {
    // Kiểm tra xem có thông tin đăng nhập không
    const authData = localStorage.getItem("mb_auth");
    const token = localStorage.getItem("mb_token");

    if (!authData && !token) {
      // Chưa đăng nhập, redirect về trang login
      window.location.href = "../LoginPortal.html";
      return false;
    }

    // Kiểm tra role
    if (authData) {
      try {
        const data = JSON.parse(authData);
        const user = data.user || data.account || {};
        const roles = user.roles || [];

        if (!roles.includes("R003")) {
          // Không phải cố vấn, redirect về login
          alert("Bạn không có quyền truy cập trang này.");
          window.location.href = "../LoginPortal.html";
          return false;
        }
      } catch (e) {
        console.error("Error parsing auth data:", e);
      }
    }

    return true;
  }

  loadTutorInfo() {
    // Đọc thông tin từ localStorage
    const authData = localStorage.getItem("mb_auth");
    let user = null;

    if (authData) {
      try {
        const data = JSON.parse(authData);
        user = data.user || data.account || {};
      } catch (e) {
        console.error("Error parsing auth data:", e);
      }
    }

    // Fallback về các keys cũ
    const name =
      user?.hoTen ||
      user?.ten ||
      user?.fullName ||
      localStorage.getItem("mb_user_name") ||
      user?.email ||
      "Cố vấn";
    const email = user?.email || localStorage.getItem("mb_user_email") || "";
    const roles = user?.roles || [];

    this.tutorInfo = {
      name: name,
      email: email,
      roles: roles,
      id: user?.idTk || user?.id || localStorage.getItem("mb_user_id") || "",
      avatar: user?.avatar || null,
    };
  }

  updateTutorAvatar() {
    if (!this.tutorInfo) return;

    const { name, email } = this.tutorInfo;

    // Cập nhật sidebar avatar
    const sidebarUserName = document.querySelector(
      ".sidebar-footer .user-name"
    );
    const sidebarUserRole = document.querySelector(
      ".sidebar-footer .user-role"
    );
    const sidebarAvatar = document.querySelector(
      ".sidebar-footer .user-avatar"
    );

    if (sidebarUserName) {
      sidebarUserName.textContent = name;
    }
    if (sidebarUserRole) {
      sidebarUserRole.textContent = "Cố vấn học tập";
    }
    if (sidebarAvatar) {
      // Tạo avatar initials từ tên
      const initials = this.getInitials(name);
      sidebarAvatar.innerHTML = `<span class="avatar-initials">${initials}</span>`;
    }

    // Cập nhật header avatar
    const headerUserName = document.querySelector(
      ".header .user-menu-btn span"
    );
    const headerAvatar = document.querySelector(".header .user-avatar-small");

    if (headerUserName) {
      headerUserName.textContent = name;
    }
    if (headerAvatar) {
      const initials = this.getInitials(name);
      headerAvatar.innerHTML = `<span class="avatar-initials">${initials}</span>`;
    }

    // Cập nhật dropdown user info
    const dropdownName = document.getElementById("dropdownName");
    const dropdownEmail = document.getElementById("dropdownEmail");
    const dropdownAvatar = document.querySelector(".dropdown-user-avatar");

    if (dropdownName) {
      dropdownName.textContent = name;
    }
    if (dropdownEmail) {
      dropdownEmail.textContent = email || "tutor@mathbridge.vn";
    }
    if (dropdownAvatar) {
      const initials = this.getInitials(name);
      dropdownAvatar.innerHTML = `<span class="avatar-initials">${initials}</span>`;
    }
  }

  getInitials(name) {
    if (!name) return "CV";

    // Tách tên thành các từ
    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      // Chỉ có 1 từ, lấy 2 ký tự đầu
      return words[0].substring(0, 2).toUpperCase();
    } else {
      // Lấy chữ cái đầu của từ đầu và từ cuối
      return (
        words[0].charAt(0) + words[words.length - 1].charAt(0)
      ).toUpperCase();
    }
  }

  setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        this.switchSection(section);
      });
    });

    // Sidebar toggle
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");

    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        mainContent.classList.toggle("sidebar-collapsed");
      });
    }

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById("mobileMenuToggle");
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
      });
    }

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.logout();
      });
    }

    // User menu button
    const userMenuBtn = document.getElementById("userMenuBtn");
    if (userMenuBtn) {
      userMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleUserDropdown();
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      const userMenu = document.querySelector(".user-menu");
      const userDropdown = document.getElementById("userDropdown");
      if (userMenu && userDropdown && !userMenu.contains(e.target)) {
        this.closeUserDropdown();
      }
    });

    // Notification button
    const notificationBtn = document.getElementById("notificationBtn");
    if (notificationBtn) {
      notificationBtn.addEventListener("click", () => {
        this.showNotifications();
      });
    }

    // Search functionality
    document.querySelectorAll(".search-box input").forEach((input) => {
      input.addEventListener("input", (e) => {
        this.handleSearch(
          e.target.value,
          e.target.closest(".content-section").id
        );
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
    const studentModal = document.getElementById("studentModal");
    const closeStudentModal = document.getElementById("closeStudentModal");
    const closeStudentModalBtn = document.getElementById(
      "closeStudentModalBtn"
    );

    if (closeStudentModal) {
      closeStudentModal.addEventListener("click", () => {
        studentModal.classList.remove("active");
      });
    }

    if (closeStudentModalBtn) {
      closeStudentModalBtn.addEventListener("click", () => {
        studentModal.classList.remove("active");
      });
    }

    // Teacher modal
    const teacherModal = document.getElementById("teacherModal");
    const closeTeacherModal = document.getElementById("closeTeacherModal");
    const closeTeacherModalBtn = document.getElementById(
      "closeTeacherModalBtn"
    );

    if (closeTeacherModal) {
      closeTeacherModal.addEventListener("click", () => {
        teacherModal.classList.remove("active");
      });
    }

    if (closeTeacherModalBtn) {
      closeTeacherModalBtn.addEventListener("click", () => {
        teacherModal.classList.remove("active");
      });
    }

    // Close modal when clicking outside
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
        }
      });
    });

    // Support Details Modal
    const supportModal = document.getElementById("supportDetailsModal");
    const closeSupportModal = document.getElementById("closeSupportModal");

    if (closeSupportModal) {
      closeSupportModal.addEventListener("click", () => {
        if (supportModal) {
          supportModal.style.display = "none";
        }
      });
    }

    // Close support modal when clicking outside
    if (supportModal) {
      supportModal.addEventListener("click", (e) => {
        if (e.target === supportModal) {
          supportModal.style.display = "none";
        }
      });
    }

    // Update Status Modal
    const statusModal = document.getElementById("updateStatusModal");
    const closeStatusModal = document.getElementById("closeStatusModal");
    const closeStatusModalBtn = document.getElementById("closeStatusModalBtn");

    if (closeStatusModal) {
      closeStatusModal.addEventListener("click", () => {
        if (statusModal) {
          statusModal.style.display = "none";
        }
      });
    }

    if (closeStatusModalBtn) {
      closeStatusModalBtn.addEventListener("click", () => {
        if (statusModal) {
          statusModal.style.display = "none";
        }
      });
    }

    // Close status modal when clicking outside
    if (statusModal) {
      statusModal.addEventListener("click", (e) => {
        if (e.target === statusModal) {
          statusModal.style.display = "none";
        }
      });
    }
  }

  initializeConsultationSchedule() {
    const grid = document.getElementById("consultationWeekGrid");
    if (!grid) {
      // Sections might not be injected yet
      setTimeout(() => this.initializeConsultationSchedule(), 300);
      return;
    }

    this.setupConsultationWeekControls();
    this.updateWeekPickerValue();
    this.updateWeekRangeLabel(
      this.consultationWeekStart,
      this.getWeekEndDate(this.consultationWeekStart)
    );
    this.loadConsultationSchedule();
  }

  setupConsultationWeekControls() {
    if (this.consultationControlsReady) {
      return;
    }

    const prevWeekBtn = document.getElementById("consultationPrevWeek");
    const nextWeekBtn = document.getElementById("consultationNextWeek");
    const todayBtn = document.getElementById("consultationTodayBtn");
    const weekPicker = document.getElementById("consultationWeekPicker");

    if (prevWeekBtn) {
      prevWeekBtn.addEventListener("click", () => {
        this.navigateWeek(-1);
      });
    }

    if (nextWeekBtn) {
      nextWeekBtn.addEventListener("click", () => {
        this.navigateWeek(1);
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener("click", () => {
        this.consultationWeekStart = this.getStartOfWeek(new Date());
        this.updateWeekPickerValue();
        this.loadConsultationSchedule();
      });
    }

    if (weekPicker) {
      weekPicker.addEventListener("change", (event) => {
        const selected = event.target.value ? new Date(event.target.value) : null;
        if (selected && !isNaN(selected.getTime())) {
          this.consultationWeekStart = this.getStartOfWeek(selected);
          this.updateWeekPickerValue();
          this.loadConsultationSchedule();
        }
      });
    }

    this.consultationControlsReady = true;
  }

  updateWeekPickerValue() {
    const weekPicker = document.getElementById("consultationWeekPicker");
    if (weekPicker) {
      weekPicker.value = this.formatDateISO(this.consultationWeekStart);
    }
  }

  updateWeekRangeLabel(start, end) {
    const label = document.getElementById("consultationWeekRange");
    if (!label) return;
    label.textContent = `${this.formatDisplayDate(start)} - ${this.formatDisplayDate(
      end
    )}`;
  }

  setupButtonActions() {
    // Student management buttons
    document.querySelectorAll("#students .btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = btn.textContent.trim();
        if (action === "Xem") {
          this.showStudentDetails();
        } else if (action === "Sửa") {
          this.editStudent();
        } else if (action === "Thêm học sinh") {
          this.addStudent();
        }
      });
    });

    // Teacher management buttons
    document.querySelectorAll("#teachers .btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = btn.textContent.trim();
        if (action === "Xem chi tiết") {
          this.showTeacherDetails();
        } else if (action === "Chỉnh sửa") {
          this.editTeacher();
        } else if (action === "Thêm gia sư") {
          this.addTeacher();
        }
      });
    });

    // Class management buttons
    document.querySelectorAll("#classes .btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = btn.textContent.trim();
        if (action === "Xem") {
          this.showClassDetails();
        } else if (action === "Sửa") {
          this.editClass();
        } else if (action === "Tạo lớp học") {
          this.createClass();
        }
      });
    });

    // Payment management buttons
    document.querySelectorAll("#payments .btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = btn.textContent.trim();
        if (action === "Xem") {
          this.viewPayment();
        } else if (action === "Xử lý") {
          this.processPayment();
        } else if (action === "In hóa đơn") {
          this.printInvoice();
        } else if (action === "Thêm thanh toán") {
          this.addPayment();
        }
      });
    });

    // Support buttons
    document.querySelectorAll("#support .btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = btn.textContent.trim();
        if (action === "Xử lý") {
          this.processSupportRequest();
        } else if (action === "Chi tiết") {
          this.viewSupportDetails();
        } else if (action === "Tạo yêu cầu hỗ trợ") {
          this.createSupportRequest();
        }
      });
    });

    // Message buttons
    document.querySelectorAll("#messages .btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = btn.textContent.trim();
        if (action === "Trả lời") {
          this.replyMessage();
        } else if (action === "Xem chi tiết") {
          this.viewMessageDetails();
        } else if (action === "Tin nhắn mới") {
          this.createNewMessage();
        }
      });
    });
  }

  switchSection(sectionId) {
    // Hide all sections
    document.querySelectorAll(".content-section").forEach((section) => {
      section.classList.remove("active");
    });

    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add("active");
      this.currentSection = sectionId;
      this.updatePageTitle(sectionId);
      this.updateActiveNavItem();
      this.loadSectionData(sectionId);
    }
  }

  updatePageTitle(sectionId) {
    const pageTitle = document.getElementById("pageTitle");
    const titles = {
      dashboard: "Dashboard",
      "assigned-students": "Học sinh được phân công",
      "consultation-schedule": "Lịch tư vấn",
      payments: "Thanh toán",
      support: "Hỗ trợ",
      consultations: "Yêu cầu tư vấn",
      messages: "Nhắn tin trực tiếp",
    };

    if (pageTitle) {
      // Get title from mapping or use section name
      const title = titles[sectionId] || this.getSectionTitleFromNav(sectionId) || "Dashboard";
      pageTitle.textContent = title;
    }
  }

  getSectionTitleFromNav(sectionId) {
    // Try to get title from navigation item
    const navItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (navItem) {
      const span = navItem.querySelector("span");
      if (span) {
        return span.textContent.trim();
      }
    }
    return null;
  }

  updateActiveNavItem() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });

    const activeItem = document.querySelector(
      `[data-section="${this.currentSection}"]`
    );
    if (activeItem) {
      activeItem.classList.add("active");
    }
  }

  updateDateTime() {
    const updateTime = () => {
      const now = new Date();
      const dateElement = document.getElementById("currentDate");
      const timeElement = document.getElementById("currentTime");

      if (dateElement) {
        dateElement.textContent = now.toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      }
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  async loadDashboardData() {
    // Update welcome name
    this.updateDashboardWelcome();
    
    // Load dashboard statistics
    await this.loadDashboardStats();
    await this.loadRecentStudents();
    await this.loadRecentSupportRequests();
    await this.loadWeeklySchedule();
    await this.loadRecentActivity();
  }

  updateDashboardWelcome() {
    const welcomeNameEl = document.getElementById("tutorWelcomeName");
    const currentDateEl = document.getElementById("dashboardCurrentDate");
    
    if (welcomeNameEl && this.tutorInfo) {
      const name = this.tutorInfo.name || "Cố vấn";
      // Lấy tên cuối cùng (tên chính)
      const nameParts = name.trim().split(/\s+/);
      const lastName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : name;
      welcomeNameEl.textContent = lastName;
    }
    
    if (currentDateEl) {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      currentDateEl.textContent = now.toLocaleDateString('vi-VN', options);
    }
  }

  async loadDashboardStats() {
    try {
      // Get tutor ID
      const authData = localStorage.getItem("mb_auth");
      let idNv = null;
      
      if (authData) {
        try {
          const data = JSON.parse(authData);
          const user = data.user || data.account || {};
          idNv = user.idNv || null;
        } catch (e) {
          console.error("Error parsing auth data:", e);
        }
      }

      // If no idNv, try to get from idTk
      if (!idNv) {
        const idTk = localStorage.getItem("mb_user_id");
        if (idTk) {
          try {
            const tutorIdResponse = await window.tutorAPI.getTutorIdFromAccountId(idTk);
            if (tutorIdResponse && tutorIdResponse.idNv) {
              idNv = tutorIdResponse.idNv;
            }
          } catch (error) {
            console.error("Error getting tutor ID:", error);
          }
        }
      }

      if (!idNv) {
        // Set default values
        this.updateDashboardStats({ assignedStudents: 0, todayConsultations: 0, openSupport: 0, pendingPayments: 0 });
        return;
      }

      // Load stats from APIs
      const [assignedCount, supportRequests, unpaidInvoices] = await Promise.all([
        window.tutorAPI.getAssignedStudentsCount(idNv).catch(() => 0),
        window.tutorAPI.getOpenSupportRequests().catch(() => []),
        window.tutorAPI.getUnpaidInvoices().catch(() => [])
      ]);

      // Count today consultations (would need API endpoint)
      const todayConsultations = 0; // TODO: Add API endpoint for today's consultations

      this.updateDashboardStats({
        assignedStudents: assignedCount || 0,
        todayConsultations: todayConsultations,
        openSupport: supportRequests?.length || 0,
        pendingPayments: unpaidInvoices?.length || 0
      });

    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      // Set default values on error
      this.updateDashboardStats({ assignedStudents: 0, todayConsultations: 0, openSupport: 0, pendingPayments: 0 });
    }
  }

  updateDashboardStats(stats) {
    const assignedEl = document.getElementById("statAssignedStudents");
    const consultationsEl = document.getElementById("statTodayConsultations");
    const supportEl = document.getElementById("statOpenSupport");
    const paymentsEl = document.getElementById("statPendingPayments");

    if (assignedEl) assignedEl.textContent = stats.assignedStudents || 0;
    if (consultationsEl) consultationsEl.textContent = stats.todayConsultations || 0;
    if (supportEl) supportEl.textContent = stats.openSupport || 0;
    if (paymentsEl) paymentsEl.textContent = stats.pendingPayments || 0;
  }

  async loadRecentStudents() {
    const container = document.getElementById("dashboardStudentsNeedingSupport");
    if (!container) return;

    try {
      // Get tutor ID
      const idNv = this.currentTutorId || (this.tutorInfo && this.tutorInfo.idNv);
      if (!idNv) {
        container.innerHTML = '<p class="empty-message">Chưa có thông tin cố vấn</p>';
        return;
      }

      // Load assigned students
      const students = await window.tutorAPI.getAssignedStudents(idNv, "active");
      
      if (!students || students.length === 0) {
        container.innerHTML = '<p class="empty-message">Chưa có học sinh được phân công</p>';
        return;
      }

      // Show top 5 students
      const topStudents = students.slice(0, 5);
      container.innerHTML = topStudents
        .map((student) => {
          const priority = this.determineStudentPriority(student);
          return `
            <div class="student-item" onclick="tutorDashboard.viewStudentDetails('${student.idHs}')">
              <div class="student-info">
                <h4>${student.hoTen || "N/A"}</h4>
                <p>${student.className || "Chưa có lớp"} • ${student.trangThai || "Đang phụ trách"}</p>
              </div>
              <div class="student-status">
                <span class="status-badge ${priority.class}">${priority.text}</span>
              </div>
            </div>
          `;
        })
        .join("");

    } catch (error) {
      console.error("Error loading recent students:", error);
      container.innerHTML = '<p class="empty-message">Không thể tải danh sách học sinh</p>';
    }
  }

  determineStudentPriority(student) {
    // Logic để xác định priority dựa trên thông tin học sinh
    if (student.trangThai && student.trangThai.includes("Ket thuc")) {
      return { class: "normal", text: "Đã kết thúc" };
    }
    if (student.trangThai && student.trangThai.includes("Tam dung")) {
      return { class: "high", text: "Tạm dừng" };
    }
    return { class: "success", text: "Đang phụ trách" };
  }

  async loadRecentSupportRequests() {
    const container = document.getElementById("dashboardRecentSupport");
    if (!container) return;

    try {
      const requests = await window.tutorAPI.getOpenSupportRequests();
      
      if (!requests || requests.length === 0) {
        container.innerHTML = '<p class="empty-message">Không có yêu cầu hỗ trợ mở</p>';
        return;
      }

      // Show top 5 requests
      const topRequests = requests.slice(0, 5);
      container.innerHTML = topRequests
        .map((request) => {
          const statusClass = request.trangThai?.toLowerCase().includes("đang") ? "processing" : "open";
          const timeAgo = this.getTimeAgo(request.thoiDiemTao);
          return `
            <div class="support-request-item" onclick="tutorDashboard.viewSupportDetails('${request.idYc}')">
              <div class="support-request-header">
                <div class="support-request-title">${request.tieuDe || "Yêu cầu hỗ trợ"}</div>
                <span class="support-request-status ${statusClass}">${request.trangThai || "Chưa xử lý"}</span>
              </div>
              <div class="support-request-student">
                <i class="fas fa-user"></i> ${request.studentName || "Học sinh"}
              </div>
              <div class="support-request-time">
                <i class="fas fa-clock"></i> ${timeAgo}
              </div>
            </div>
          `;
        })
        .join("");

    } catch (error) {
      console.error("Error loading recent support requests:", error);
      container.innerHTML = '<p class="empty-message">Không thể tải yêu cầu hỗ trợ</p>';
    }
  }

  getTimeAgo(dateTime) {
    if (!dateTime) return "Không xác định";
    
    try {
      const date = new Date(dateTime);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString('vi-VN');
    } catch (e) {
      return "Không xác định";
    }
  }

  async loadRecentActivity() {
    const container = document.getElementById("dashboardRecentActivity");
    if (!container) return;

    // For now, show static activity. Can be enhanced with real API later
    const activities = [
      { icon: "fa-user-check", text: "Đã phân công học sinh mới", time: "2 giờ trước" },
      { icon: "fa-check-circle", text: "Đã xử lý yêu cầu hỗ trợ", time: "5 giờ trước" },
      { icon: "fa-calendar-check", text: "Đã tạo lịch tư vấn", time: "Hôm qua" },
    ];

    container.innerHTML = activities
      .map((activity) => `
        <div class="activity-item">
          <div class="activity-icon">
            <i class="fas ${activity.icon}"></i>
          </div>
          <div class="activity-content">
            <p><strong>${activity.text}</strong></p>
            <span class="activity-time">${activity.time}</span>
          </div>
        </div>
      `)
      .join("");
  }

  loadRecentPayments() {
    // Simulate loading recent payments
    const payments = [
      {
        name: "Nguyễn Văn F",
        type: "Thanh toán học phí tháng 12",
        amount: "2,500,000đ",
        status: "success",
      },
      {
        name: "Trần Thị G",
        type: "Thanh toán học phí tháng 12",
        amount: "1,800,000đ",
        status: "pending",
      },
      {
        name: "Lê Văn H",
        type: "Phí đăng ký khóa học",
        amount: "500,000đ",
        status: "success",
      },
    ];

    const paymentList = document.querySelector(".payment-list");
    if (paymentList) {
      paymentList.innerHTML = payments
        .map(
          (payment) => `
                <div class="payment-item">
                    <div class="payment-info">
                        <h4>${payment.name}</h4>
                        <p>${payment.type}</p>
                    </div>
                    <div class="payment-amount">
                        <span class="amount">${payment.amount}</span>
                        <span class="status-badge ${
                          payment.status
                        }">${this.getStatusText(payment.status)}</span>
                    </div>
                </div>
            `
        )
        .join("");
    }
  }

  async loadWeeklySchedule() {
    const container = document.getElementById("dashboardWeeklySchedule");
    if (!container) return;

    try {
      // Get tutor ID
      const idNv = this.currentTutorId || (this.tutorInfo && this.tutorInfo.idNv);
      if (!idNv) {
        container.innerHTML = '<p class="empty-message">Chưa có thông tin cố vấn</p>';
        return;
      }

      // Get current week start
      const weekStart = this.getStartOfWeek(new Date());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Load consultation schedule
      const schedule = await window.tutorAPI.getWeeklySchedule({
        startDate: weekStartStr,
        idNv: idNv
      });

      // Render weekly calendar
      this.renderWeeklyCalendar(container, weekStart, schedule || []);

    } catch (error) {
      console.error("Error loading weekly schedule:", error);
      container.innerHTML = '<p class="empty-message">Không thể tải lịch làm việc</p>';
    }
  }

  renderWeeklyCalendar(container, weekStart, schedule) {
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = '<div class="calendar-grid">';
    
    // Day headers
    days.forEach(day => {
      html += `<div class="calendar-day-header">${day}</div>`;
    });

    // Calendar days
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      const dayNumber = currentDate.getDate();
      const isToday = currentDate.getTime() === today.getTime();
      
      // Find events for this day
      const dayEvents = schedule.filter(event => {
        if (!event.ngay) return false;
        const eventDate = new Date(event.ngay);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === currentDate.getTime();
      });

      html += `
        <div class="calendar-day ${isToday ? 'today' : ''}">
          <div class="calendar-day-number">${dayNumber}</div>
          ${dayEvents.length > 0 ? `
            <div class="calendar-events">
              ${dayEvents.slice(0, 2).map(event => `
                <div class="calendar-event" title="${event.tenHocSinh || 'Tư vấn'}">
                  ${event.tenHocSinh || 'Tư vấn'}
                </div>
              `).join('')}
              ${dayEvents.length > 2 ? `<div class="calendar-event-more">+${dayEvents.length - 2}</div>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;
  }

  navigateWeek(direction) {
    if (!this.dashboardWeekStart) {
      this.dashboardWeekStart = this.getStartOfWeek(new Date());
    }
    this.dashboardWeekStart.setDate(this.dashboardWeekStart.getDate() + (direction * 7));
    this.loadWeeklySchedule();
    this.updateWeekButton();
  }

  goToCurrentWeek() {
    this.dashboardWeekStart = this.getStartOfWeek(new Date());
    this.loadWeeklySchedule();
    this.updateWeekButton();
  }

  updateWeekButton() {
    const btn = document.getElementById("currentWeekBtn");
    if (btn && this.dashboardWeekStart) {
      const weekEnd = new Date(this.dashboardWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const startStr = this.dashboardWeekStart.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
      const endStr = weekEnd.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
      btn.textContent = `${startStr} - ${endStr}`;
    }
  }

  loadSectionData(sectionId) {
    switch (sectionId) {
      case "dashboard":
        this.loadDashboardData();
        break;
      case "students":
        this.loadStudentsData();
        break;
      case "assigned-students":
        this.loadAssignedStudentsData();
        break;
      case "teachers":
        this.loadTeachersData();
        break;
      case "classes":
        this.loadClassesData();
        break;
      case "payments":
        this.loadPaymentsData();
        break;
      case "support":
        this.loadSupportData();
        break;
      case "consultations":
        this.loadConsultationsData();
        break;
      case "messages":
        this.loadMessagesData();
        break;
    }
  }

  loadStudentsData() {
    // Simulate loading students data
    console.log("Loading students data...");
  }

  // Load assigned students data
  async loadAssignedStudentsData() {
    const loadingEl = document.getElementById("assignedStudentsLoading");
    const emptyEl = document.getElementById("assignedStudentsEmpty");
    const tableEl = document.getElementById("assignedStudentsTable");
    const tableBodyEl = document.getElementById("assignedStudentsTableBody");
    const statsEl = document.getElementById("assignedStudentsStats");

    // Show loading
    if (loadingEl) loadingEl.style.display = "flex";
    if (emptyEl) emptyEl.style.display = "none";
    if (tableEl) tableEl.style.display = "none";
    if (statsEl) statsEl.style.display = "none";

    try {
      // Get tutor ID from auth data
      const authData = localStorage.getItem("mb_auth");
      let idNv = null;
      let idTk = null;

      if (authData) {
        try {
          const data = JSON.parse(authData);
          const user = data.user || data.account || {};
          idNv = user.idNv || null;
          idTk =
            user.idTk || user.id || localStorage.getItem("mb_user_id") || null;
        } catch (e) {
          console.error("Error parsing auth data:", e);
        }
      }

      // If idNv not found in auth data, try to get it from idTk
      if (!idNv && idTk) {
        try {
          const tutorIdResponse = await window.tutorAPI.getTutorIdFromAccountId(
            idTk
          );
          if (tutorIdResponse && tutorIdResponse.idNv) {
            idNv = tutorIdResponse.idNv;
            // Cache it in auth data for next time
            if (authData) {
              try {
                const data = JSON.parse(authData);
                if (data.user) {
                  data.user.idNv = idNv;
                } else if (data.account) {
                  data.account.idNv = idNv;
                }
                localStorage.setItem("mb_auth", JSON.stringify(data));
              } catch (e) {
                console.error("Error updating auth data:", e);
              }
            }
          }
        } catch (error) {
          console.error("Error getting tutor ID from account ID:", error);
        }
      }

      if (!idNv) {
        // If no ID_NV, show empty state
        if (loadingEl) loadingEl.style.display = "none";
        if (emptyEl) emptyEl.style.display = "flex";
        showNotification(
          "Không tìm thấy thông tin cố vấn. Vui lòng đăng nhập lại.",
          "warning"
        );
        return;
      }

      // Get filter value
      const filterSelect = document.getElementById("assignmentStatusFilter");
      const filter = filterSelect ? filterSelect.value : "active";
      
      // Update current filter
      this.currentStatusFilter = filter;

      // Load students
      const students = await window.tutorAPI.getAssignedStudents(idNv, filter);
      this.assignedStudents = students || [];
      // Cache current tutor id for actions
      this.currentTutorId = idNv;

      // Load count
      const activeCount = await window.tutorAPI.getAssignedStudentsCount(idNv);

      // Hide loading
      if (loadingEl) loadingEl.style.display = "none";

      // Update stats (only active count)
      if (statsEl) {
        const activeCountEl = document.getElementById("activeStudentsCount");
        if (activeCountEl) activeCountEl.textContent = activeCount || 0;
        statsEl.style.display = "grid";
      }

      // Populate class filter options (based on assigned students)
      const classFilter = document.getElementById("classFilter");
      if (classFilter) {
        // Collect distinct classes
        const classes = [];
        (this.assignedStudents || []).forEach((s) => {
          if (s.classId && s.className) {
            if (!classes.find((c) => c.id === s.classId)) {
              classes.push({ id: s.classId, name: s.className });
            }
          }
        });

        // Clear existing options (keep first)
        const selected = classFilter.value || "";
        classFilter.innerHTML =
          '<option value="">-- Lọc theo lớp (tất cả) --</option>';
        classes.forEach((c) => {
          const opt = document.createElement("option");
          opt.value = c.id;
          opt.textContent = c.name;
          classFilter.appendChild(opt);
        });

        // Restore previous selection if still available
        if (selected) {
          classFilter.value = selected;
        }
      }

      // Render students
      if (this.assignedStudents.length === 0) {
        if (emptyEl) emptyEl.style.display = "flex";
        if (tableEl) tableEl.style.display = "none";
      } else {
        if (emptyEl) emptyEl.style.display = "none";
        if (tableEl) tableEl.style.display = "block";
        this.renderAssignedStudents(this.assignedStudents);
      }
    } catch (error) {
      console.error("Error loading assigned students:", error);
      if (loadingEl) loadingEl.style.display = "none";
      if (emptyEl) emptyEl.style.display = "flex";
      showNotification(
        "Không thể tải danh sách học sinh. Vui lòng thử lại.",
        "error"
      );
      window.tutorAPI.handleError(error);
    }
  }

  // Render assigned students table
  renderAssignedStudents(students) {
    const tableBodyEl = document.getElementById("assignedStudentsTableBody");
    if (!tableBodyEl) return;

    if (!students || students.length === 0) {
      tableBodyEl.innerHTML = `
                <div class="table-row">
                    <div colspan="7" style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
                        Không có học sinh nào
                    </div>
                </div>
            `;
      return;
    }

    tableBodyEl.innerHTML = students
      .map((student) => {
        const initials = this.getStudentInitials(student.hoTen || "");
        const ngayBatDau = student.ngayBatDau
          ? new Date(student.ngayBatDau).toLocaleDateString("vi-VN")
          : "-";
        const ngayKetThuc = student.ngayKetThuc
          ? new Date(student.ngayKetThuc).toLocaleDateString("vi-VN")
          : "Đang phụ trách";
        const trangThai = student.trangThai || "Dang phu trach";
        const trangThaiClass = this.getStatusClass(trangThai);
        const trangThaiText = this.getStatusText(trangThai);
        const ghiChu = student.ghiChu || "Không có ghi chú";
        const gioiTinhIcon = student.gioiTinh ? "fa-venus" : "fa-mars";
        const gioiTinhText = student.gioiTinh ? "Nữ" : "Nam";

        return `
                <div class="table-row student-row" data-student-id="${
                  student.idHs
                }">
                    <div class="col-name">
                        <div class="student-avatar">${initials}</div>
                        <div class="student-info">
                            <div class="student-name">
                                ${student.hoTen || "N/A"}
                                <i class="fas ${gioiTinhIcon}" title="${gioiTinhText}"></i>
                            </div>
                            <div class="student-id">${student.idHs || ""}</div>
                        </div>
                    </div>
                    <div class="contact-info">
                        <div class="contact-item">
                            <i class="fas fa-envelope"></i>
                            <a href="mailto:${student.email || ""}">${
          student.email || "N/A"
        }</a>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-phone"></i>
                            <a href="tel:${student.sdt || ""}">${
          student.sdt || "N/A"
        }</a>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${student.diaChi || "N/A"}</span>
                        </div>
                    </div>
                    <div class="class-info">
                        <i class="fas fa-school"></i>
                        <span>${student.className || "-"}</span>
                    </div>
                    <div class="date-info">
                        <i class="fas fa-calendar-check"></i>
                        <span>${ngayBatDau}</span>
                    </div>
                    <div class="date-info">
                        <i class="fas fa-calendar-times"></i>
                        <span>${ngayKetThuc}</span>
                    </div>
                    <div>
                        <span class="status-badge ${trangThaiClass}">${trangThaiText}</span>
                    </div>
                    <div class="notes-info">
                        <span class="notes-preview" title="${ghiChu}">${
          ghiChu.length > 50 ? ghiChu.substring(0, 50) + "..." : ghiChu
        }</span>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="tutorDashboard.viewStudentDetails('${
                          student.idHs
                        }')" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="tutorDashboard.finishAdvising('${
                          student.idHs
                        }')" title="Kết thúc cố vấn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  // Get student initials
  getStudentInitials(name) {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Get status class
  getStatusClass(status) {
    if (!status) return "default";
    const statusLower = status.toLowerCase();
    if (
      statusLower.includes("dang phu trach") ||
      statusLower.includes("đang")
    ) {
      return "success";
    } else if (
      statusLower.includes("tam dung") ||
      statusLower.includes("tạm")
    ) {
      return "warning";
    } else if (
      statusLower.includes("ket thuc") ||
      statusLower.includes("kết")
    ) {
      return "secondary";
    }
    return "default";
  }

  // Get status text
  getStatusText(status) {
    if (!status) return "Chưa xác định";
    if (status.includes("Dang phu trach")) return "Đang phụ trách";
    if (status.includes("Tam dung")) return "Tạm dừng";
    if (status.includes("Ket thuc")) return "Kết thúc";
    return status;
  }

  // Filter students
  filterStudents() {
    const searchInput = document.getElementById("studentSearchInput");
    const filterSelect = document.getElementById("assignmentStatusFilter");
    const classFilter = document.getElementById("classFilter");

    const filter = filterSelect ? filterSelect.value : "active";

    // Store current filter to check if it changed
    if (!this.currentStatusFilter) {
      this.currentStatusFilter = filter;
    }

    // If status filter changed, reload from API
    if (this.currentStatusFilter !== filter) {
      this.currentStatusFilter = filter;
      this.loadAssignedStudentsData();
      return;
    }

    // If no students loaded yet, load them
    if (!this.assignedStudents) {
      this.loadAssignedStudentsData();
      return;
    }

    // Filter by search term
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    let filtered = this.assignedStudents;
    
    if (searchTerm) {
      filtered = this.assignedStudents.filter((student) => {
        const name = (student.hoTen || "").toLowerCase();
        const email = (student.email || "").toLowerCase();
        const idHs = (student.idHs || "").toLowerCase();
        return (
          name.includes(searchTerm) ||
          email.includes(searchTerm) ||
          idHs.includes(searchTerm)
        );
      });
    }

    // Filter by class if selected
    const selectedClass = classFilter ? classFilter.value : "";
    if (selectedClass) {
      filtered = filtered.filter((s) => (s.classId || "") === selectedClass);
    }

    this.renderAssignedStudents(filtered);
  }

  // View student details
  viewStudentDetails(idHs) {
    const idNv =
      this.currentTutorId ||
      (this.tutorInfo && this.tutorInfo.idNv) ||
      this.tutorInfo?.id;

    if (!idNv) {
      showNotification(
        "Không xác định được ID cố vấn. Vui lòng thử lại.",
        "error"
      );
      return;
    }

    // Show loading state in modal
    const modal = document.getElementById("studentModal");
    const nameEl = document.getElementById("studentModalName");
    const emailEl = document.getElementById("studentModalEmail");
    const phoneEl = document.getElementById("studentModalPhone");
    const addressEl = document.getElementById("studentModalAddress");
    const primaryClassEl = document.getElementById("studentModalPrimaryClass");
    const avgEl = document.getElementById("studentStatAvg");
    const sessionsEl = document.getElementById("studentStatSessions");
    const attendanceEl = document.getElementById("studentStatAttendance");
    const classesList = document.getElementById("studentModalClasses");
    const assignmentsList = document.getElementById("studentModalAssignments");
    const gradesList = document.getElementById("studentModalGrades");

    if (nameEl) nameEl.textContent = "Đang tải...";
    if (emailEl) emailEl.textContent = "-";
    if (phoneEl) phoneEl.textContent = "-";
    if (addressEl) addressEl.textContent = "-";
    if (primaryClassEl) primaryClassEl.textContent = "Lớp: -";
    if (avgEl) avgEl.textContent = "-";
    if (sessionsEl) sessionsEl.textContent = "-";
    if (attendanceEl) attendanceEl.textContent = "-";
    if (classesList) classesList.innerHTML = "<li>Đang tải...</li>";
    if (assignmentsList) assignmentsList.innerHTML = "<li>Đang tải...</li>";
    if (gradesList) gradesList.innerHTML = "<li>Đang tải...</li>";

    // Open modal
    if (modal) modal.classList.add("active");

    // First, fetch basic student details
    window.tutorAPI
      .getStudentDetails(idHs, idNv)
      .then((student) => {
        if (!student) {
          showNotification(
            "Không tìm thấy thông tin học sinh.",
            "warning"
          );
          if (modal) modal.classList.remove("active");
          return;
        }

        // Fill basic info from student details
        if (nameEl) nameEl.textContent = student.hoTen || student.name || "-";
        if (emailEl) emailEl.textContent = student.email || "-";
        if (phoneEl) phoneEl.textContent = student.sdt || student.phone || "-";
        if (addressEl) addressEl.textContent = student.diaChi || student.address || "-";
        if (primaryClassEl) {
          const className = student.className || student.class || "-";
          primaryClassEl.textContent = `Lớp: ${className}`;
        }

        // Then try to fetch full dashboard for additional details
        return window.tutorAPI
          .getStudentDashboardForTutor(idNv, idHs)
          .then((dashboard) => {
            if (!dashboard) {
              // If dashboard fails, at least we have basic info
              return;
            }
        if (!dashboard) {
          showNotification(
            "Không có dữ liệu chi tiết cho học sinh.",
            "warning"
          );
          return;
        }

            // Update basic info from dashboard if available (may override student details)
            if (nameEl && dashboard.fullName)
              nameEl.textContent = dashboard.fullName;
            if (emailEl && dashboard.email) emailEl.textContent = dashboard.email;
            if (phoneEl && dashboard.phone) phoneEl.textContent = dashboard.phone;
            if (addressEl && dashboard.address) addressEl.textContent = dashboard.address;

            // Primary class - use first class in list
            const classes = dashboard.classes || [];
            if (classes.length > 0) {
              const first = classes[0];
              if (primaryClassEl)
                primaryClassEl.textContent = `Lớp: ${
                  first.className || first.classId || "-"
                }`;
            }

            // Stats
            const stats = dashboard.stats || {};
            if (avgEl)
              avgEl.textContent =
                stats.averageGrade != null ? stats.averageGrade : "-";
            if (sessionsEl)
              sessionsEl.textContent =
                stats.todayClasses != null ? stats.todayClasses : "-";
            if (attendanceEl)
              attendanceEl.textContent =
                stats.attendanceRate != null ? stats.attendanceRate + "%" : "-";

            // Populate classes list
            if (classesList) {
              classesList.innerHTML = "";
              classes.forEach((c) => {
                const li = document.createElement("li");
                li.textContent = `${c.className || c.classId || "-"} - Giáo viên: ${
                  c.teacherName || "-"
                }`;
                classesList.appendChild(li);
              });
              if (classes.length === 0)
                classesList.innerHTML = "<li>Không có lớp nào</li>";
            }

            // Populate assignments
            if (assignmentsList) {
              assignmentsList.innerHTML = "";
              const assignments = dashboard.assignments || [];
              assignments.forEach((a) => {
                const li = document.createElement("li");
                li.textContent = `${a.title || "-"} (${a.className || "-"}) - ${
                  a.status || ""
                } ${a.grade ? " - Điểm: " + a.grade : ""}`;
                assignmentsList.appendChild(li);
              });
              if (assignments.length === 0)
                assignmentsList.innerHTML = "<li>Không có bài tập</li>";
            }

            // Populate grades
            if (gradesList) {
              gradesList.innerHTML = "";
              const grades = dashboard.grades || [];
              grades.forEach((g) => {
                const li = document.createElement("li");
                li.textContent = `${g.gradeType || g.subject || "Kết quả"} - ${
                  g.className || "-"
                }: ${g.score || "-"} ${g.feedback ? "(" + g.feedback + ")" : ""}`;
                gradesList.appendChild(li);
              });
              if (grades.length === 0)
                gradesList.innerHTML = "<li>Không có kết quả</li>";
            }
          })
          .catch((dashboardErr) => {
            // Dashboard fetch failed, but we already have basic info
            console.warn("Could not load full dashboard, using basic info only:", dashboardErr);
            if (classesList) classesList.innerHTML = "<li>Không thể tải danh sách lớp</li>";
            if (assignmentsList) assignmentsList.innerHTML = "<li>Không thể tải bài tập</li>";
            if (gradesList) gradesList.innerHTML = "<li>Không thể tải kết quả</li>";
          });
      })
      .catch((err) => {
        console.error("Error loading student dashboard:", err);
        window.tutorAPI.handleError(err);
        showNotification(
          "Không thể tải chi tiết học sinh. Vui lòng thử lại.",
          "error"
        );
        if (modal) modal.classList.remove("active");
      });
  }

  // View support requests for student
  viewSupportRequests(idHs) {
    // Navigate to support section
    const supportNav = document.querySelector('[data-section="support"]');
    if (supportNav) {
      supportNav.click();
      // Filter by student ID
      setTimeout(() => {
        // This will be handled in support section
        showNotification(
          `Đang tải yêu cầu hỗ trợ của học sinh ${idHs}`,
          "info"
        );
      }, 500);
    }
  }

  // Finish advising a student (kết thúc cố vấn)
  async finishAdvising(idHs) {
    if (!confirm("Bạn có chắc muốn kết thúc cố vấn cho học sinh này?")) return;

    const idNv =
      this.currentTutorId ||
      (this.tutorInfo && this.tutorInfo.idNv) ||
      this.tutorInfo?.id;
    if (!idNv) {
      showNotification(
        "Không xác định được ID cố vấn. Vui lòng thử lại.",
        "error"
      );
      return;
    }

    try {
      await window.tutorAPI.finishAssignedStudent(idNv, idHs);
      showNotification("Đã kết thúc cố vấn cho học sinh.", "success");
      // Reload assigned students list
      await this.loadAssignedStudentsData();
    } catch (error) {
      console.error("Error finishing advising:", error);
      window.tutorAPI.handleError(error);
      showNotification("Không thể kết thúc cố vấn. Vui lòng thử lại.", "error");
    }
  }

  // Export students
  exportStudents() {
    if (!this.assignedStudents || this.assignedStudents.length === 0) {
      showNotification("Không có dữ liệu để xuất", "warning");
      return;
    }

    // Simple CSV export
    const headers = [
      "ID_HS",
      "Họ tên",
      "Email",
      "SĐT",
      "Địa chỉ",
      "Ngày bắt đầu",
      "Ngày kết thúc",
      "Trạng thái",
      "Ghi chú",
    ];
    const rows = this.assignedStudents.map((s) => [
      s.idHs || "",
      s.hoTen || "",
      s.email || "",
      s.sdt || "",
      s.diaChi || "",
      s.ngayBatDau ? new Date(s.ngayBatDau).toLocaleDateString("vi-VN") : "",
      s.ngayKetThuc ? new Date(s.ngayKetThuc).toLocaleDateString("vi-VN") : "",
      s.trangThai || "",
      (s.ghiChu || "").replace(/,/g, ";"),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Danh_sach_hoc_sinh_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();

    showNotification("Đã xuất danh sách học sinh thành công", "success");
  }

  loadTeachersData() {
    // Simulate loading teachers data
    console.log("Loading teachers data...");
  }

  loadClassesData() {
    // Simulate loading classes data
    console.log("Loading classes data...");
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
    const paymentDateInput = document.getElementById("paymentDate");
    if (paymentDateInput) {
      paymentDateInput.value = today.toLocaleDateString("vi-VN");
    }
  }

  async loadAllInvoices() {
    try {
      const invoices = await window.tutorAPI.getAllInvoices();
      this.allInvoices = invoices; // Store for filtering and sorting
      this.currentSortField = null;
      this.currentSortDirection = "asc";
      this.filterAndDisplayInvoicesList("");
    } catch (error) {
      console.error("Error loading invoices:", error);
      window.tutorAPI.handleError(error);
    }
  }

  filterAndDisplayInvoicesList(searchTerm = "") {
    const tableBody = document.getElementById("invoicesTableBody");
    if (!tableBody) return;

    if (!this.allInvoices) return;

    // Filter invoices by student name
    let filteredInvoices = this.allInvoices.filter((invoice) => {
      if (!searchTerm) return true;
      const studentName = invoice.studentName || "";
      return studentName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Apply sorting if exists
    if (this.currentSortField) {
      filteredInvoices = this.sortInvoices(
        filteredInvoices,
        this.currentSortField,
        this.currentSortDirection
      );
    }

    if (filteredInvoices.length === 0) {
      tableBody.innerHTML =
        '<div class="table-row"><div colspan="8" style="text-align: center; padding: 2rem; grid-column: 1 / -1;">Không có hóa đơn nào</div></div>';
      return;
    }

    tableBody.innerHTML = filteredInvoices
      .map((invoice) => {
        const ngayDangKy = invoice.ngayDangKy
          ? new Date(invoice.ngayDangKy).toLocaleDateString("vi-VN")
          : "-";
        const ngayThanhToan = invoice.ngayThanhToan
          ? new Date(invoice.ngayThanhToan).toLocaleDateString("vi-VN")
          : "-";
        const amount = invoice.tongTien
          ? invoice.tongTien.toLocaleString("vi-VN") + " VNĐ"
          : "-";
        const statusClass =
          invoice.trangThai === "Da Thanh Toan" ? "success" : "pending";
        const statusText =
          invoice.trangThai === "Da Thanh Toan"
            ? "Đã thanh toán"
            : "Chưa thanh toán";

        return `
                <div class="table-row invoice-row" data-invoice-id="${
                  invoice.idHoaDon
                }">
                    <div>${invoice.idHoaDon || "-"}</div>
                    <div class="col-name">
                        <div class="student-avatar">${this.getInitials(
                          invoice.studentName
                        )}</div>
                        <div class="student-info">
                            <div class="student-name">${
                              invoice.studentName || "-"
                            }</div>
                        </div>
                    </div>
                    <div>${invoice.tenLop || "-"}</div>
                    <div class="amount-info">
                        <span class="amount-value">${amount}</span>
                    </div>
                    <div>${ngayDangKy}</div>
                    <div>${ngayThanhToan}</div>
                    <div>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="window.tutorDashboard.viewInvoiceDetails('${
                          invoice.idHoaDon
                        }')">
                            <i class="fas fa-eye"></i> Xem chi tiết
                        </button>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  async viewInvoiceDetails(idHoaDon) {
    try {
      const invoice = await window.tutorAPI.getInvoiceDetails(idHoaDon);
      this.displayInvoiceDetails(invoice);

      // Open modal
      this.openInvoiceModal();
    } catch (error) {
      console.error("Error loading invoice details:", error);
      window.tutorAPI.handleError(error);
    }
  }

  openInvoiceModal() {
    const modal = document.getElementById("invoiceDetailsModal");
    if (modal) {
      modal.style.display = "flex";
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }
  }

  closeInvoiceModal() {
    const modal = document.getElementById("invoiceDetailsModal");
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = ""; // Restore scrolling
    }
  }

  async loadUnpaidInvoices() {
    try {
      const invoices = await window.tutorAPI.getUnpaidInvoices();
      this.allUnpaidInvoices = invoices; // Store for filtering
      this.filterAndDisplayUnpaidInvoices("");
    } catch (error) {
      console.error("Error loading unpaid invoices:", error);
      window.tutorAPI.handleError(error);
    }
  }

  filterAndDisplayUnpaidInvoices(searchTerm = "") {
    const invoiceSelectList = document.getElementById("invoiceSelectList");
    if (!invoiceSelectList) return;

    if (!this.allUnpaidInvoices) {
      invoiceSelectList.innerHTML =
        '<div class="custom-select-option disabled">Đang tải...</div>';
      return;
    }

    // Filter invoices by student name or class
    const filteredInvoices = this.allUnpaidInvoices.filter((invoice) => {
      if (!searchTerm) return true;
      const studentName = (invoice.studentName || "").toLowerCase();
      const tenLop = (invoice.tenLop || "").toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return studentName.includes(searchLower) || tenLop.includes(searchLower);
    });

    if (filteredInvoices.length === 0) {
      invoiceSelectList.innerHTML =
        '<div class="custom-select-option disabled">Không tìm thấy hóa đơn nào</div>';
      return;
    }

    // Clear and add filtered unpaid invoices - show student name and class
    invoiceSelectList.innerHTML = "";
    filteredInvoices.forEach((invoice) => {
      const option = document.createElement("div");
      option.className = "custom-select-option";
      option.dataset.value = invoice.idHoaDon;
      option.setAttribute("tabindex", "0");

      // Display format: "Tên học sinh - Lớp học"
      const displayText = invoice.tenLop
        ? `${invoice.studentName || "-"} - ${invoice.tenLop}`
        : invoice.studentName || "-";
      option.textContent = displayText;

      option.addEventListener("click", () => {
        this.selectInvoice(
          invoice.idHoaDon,
          invoice.studentName,
          invoice.tenLop
        );
      });
      option.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.selectInvoice(
            invoice.idHoaDon,
            invoice.studentName,
            invoice.tenLop
          );
        }
      });
      invoiceSelectList.appendChild(option);
    });
  }

  selectInvoice(idHoaDon, studentName, tenLop = null) {
    const hiddenInput = document.getElementById("invoiceSelect");
    const triggerText = document.getElementById("invoiceSelectText");
    const wrapper = document.getElementById("invoiceSelectWrapper");

    if (hiddenInput) {
      hiddenInput.value = idHoaDon;
    }
    if (triggerText) {
      // Display format: "Tên học sinh - Lớp học"
      const displayText = tenLop
        ? `${studentName || "-"} - ${tenLop}`
        : studentName || "Chọn hóa đơn...";
      triggerText.textContent = displayText;
    }
    if (wrapper) {
      wrapper.classList.remove("open");
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
      const paymentMethodSelect = document.getElementById("paymentMethod");
      if (paymentMethodSelect) {
        // Clear existing options except the first one
        paymentMethodSelect.innerHTML =
          '<option value="">Chọn phương thức thanh toán...</option>';

        // Add payment methods
        methods.forEach((method) => {
          const option = document.createElement("option");
          option.value = method.idPt;
          option.textContent = `${method.tenPt} (${method.hinhThucTt})`;
          paymentMethodSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
      window.tutorAPI.handleError(error);
    }
  }

  setupPaymentForm() {
    const invoiceSelect = document.getElementById("invoiceSelect");
    const paymentForm = document.getElementById("paymentForm");
    const resetBtn = document.getElementById("resetPaymentForm");

    console.log("Setting up payment form...", {
      paymentForm: !!paymentForm,
      invoiceSelect: !!invoiceSelect,
      resetBtn: !!resetBtn,
    });

    // Setup custom select dropdown
    this.setupCustomSelect();

    // Setup modal close buttons
    const closeModalBtn = document.getElementById("closeInvoiceModal");
    const closeModalBtnFooter = document.getElementById("closeInvoiceModalBtn");
    const modalOverlay = document.getElementById("invoiceDetailsModal");

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        this.closeInvoiceModal();
      });
    }

    if (closeModalBtnFooter) {
      closeModalBtnFooter.addEventListener("click", () => {
        this.closeInvoiceModal();
      });
    }

    // Close modal when clicking outside
    if (modalOverlay) {
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
          this.closeInvoiceModal();
        }
      });
    }

    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("invoiceDetailsModal");
        if (modal && modal.style.display === "flex") {
          this.closeInvoiceModal();
        }
      }
    });

    // Handle form submission
    if (paymentForm) {
      // Handle form submit event
      paymentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("Form submit event triggered");
        await this.handlePaymentSubmit();
        return false;
      });

      // Also handle button click directly as backup
      const submitButton = paymentForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.addEventListener("click", async (e) => {
          // Only handle if form validation passes
          if (paymentForm.checkValidity()) {
            e.preventDefault();
            console.log("Submit button clicked");
            await this.handlePaymentSubmit();
          }
        });
      }
    }

    // Handle reset
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.resetPaymentForm();
      });
    }

    // Handle refresh invoice list
    const refreshBtn = document.getElementById("refreshInvoiceList");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", async () => {
        await this.loadAllInvoices();
        showNotification("Danh sách hóa đơn đã được làm mới!", "success");
      });
    }

    // Handle invoice list search
    const invoiceListSearch = document.getElementById("invoiceListSearch");
    if (invoiceListSearch) {
      invoiceListSearch.addEventListener("input", (e) => {
        const searchTerm = e.target.value;
        this.filterAndDisplayInvoicesList(searchTerm);
      });
    }

    // Handle sortable headers - use event delegation for dynamically loaded content
    const invoicesTableContainer = document.querySelector(
      ".invoices-table-container"
    );
    if (invoicesTableContainer) {
      invoicesTableContainer.addEventListener("click", (e) => {
        // Handle click on sortable header or its children (icon, text)
        let sortable = e.target.closest(".sortable");

        // If clicked on icon, get parent sortable
        if (!sortable && e.target.tagName === "I") {
          sortable = e.target.parentElement;
        }

        // If clicked on text node, get parent sortable
        if (!sortable && e.target.parentElement) {
          sortable = e.target.parentElement.closest(".sortable");
        }

        if (sortable && sortable.classList.contains("sortable")) {
          const sortField = sortable.dataset.sort;
          if (sortField) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Sorting by:", sortField);
            this.sortInvoicesList(sortField);
          }
        }
      });
    }
  }

  async handlePaymentSubmit() {
    // Validate custom select
    const hiddenInput = document.getElementById("invoiceSelect");
    if (!hiddenInput || !hiddenInput.value) {
      showNotification("Vui lòng chọn hóa đơn!", "error");
      const wrapper = document.getElementById("invoiceSelectWrapper");
      if (wrapper) {
        wrapper.classList.add("open");
      }
      return;
    }

    // Validate payment method
    const paymentMethodSelect = document.getElementById("paymentMethod");
    if (!paymentMethodSelect || !paymentMethodSelect.value) {
      showNotification("Vui lòng chọn phương thức thanh toán!", "error");
      return;
    }

    try {
      await this.processPayment();
    } catch (error) {
      console.error("Error in payment submit handler:", error);
    }
  }

  sortInvoicesList(field) {
    // Toggle sort direction if same field
    if (this.currentSortField === field) {
      this.currentSortDirection =
        this.currentSortDirection === "asc" ? "desc" : "asc";
    } else {
      this.currentSortField = field;
      this.currentSortDirection = "asc";
    }

    // Update sort icons
    document.querySelectorAll(".sortable i").forEach((icon) => {
      icon.className = "fas fa-sort";
    });

    const activeHeader = document.querySelector(`[data-sort="${field}"] i`);
    if (activeHeader) {
      activeHeader.className =
        this.currentSortDirection === "asc"
          ? "fas fa-sort-up"
          : "fas fa-sort-down";
    }

    // Get current search term
    const searchInput = document.getElementById("invoiceListSearch");
    const searchTerm = searchInput ? searchInput.value : "";

    // Re-display with new sort
    this.filterAndDisplayInvoicesList(searchTerm);
  }

  sortInvoices(invoices, field, direction) {
    const sorted = [...invoices].sort((a, b) => {
      let aVal, bVal;

      switch (field) {
        case "idHoaDon":
          aVal = a.idHoaDon || "";
          bVal = b.idHoaDon || "";
          break;
        case "studentName":
          aVal = a.studentName || "";
          bVal = b.studentName || "";
          break;
        case "tenLop":
          aVal = a.tenLop || "";
          bVal = b.tenLop || "";
          break;
        case "tongTien":
          aVal = a.tongTien ? parseFloat(a.tongTien) : 0;
          bVal = b.tongTien ? parseFloat(b.tongTien) : 0;
          break;
        case "ngayDangKy":
          aVal = a.ngayDangKy ? new Date(a.ngayDangKy).getTime() : 0;
          bVal = b.ngayDangKy ? new Date(b.ngayDangKy).getTime() : 0;
          break;
        case "ngayThanhToan":
          aVal = a.ngayThanhToan ? new Date(a.ngayThanhToan).getTime() : 0;
          bVal = b.ngayThanhToan ? new Date(b.ngayThanhToan).getTime() : 0;
          break;
        case "trangThai":
          aVal = a.trangThai || "";
          bVal = b.trangThai || "";
          break;
        default:
          return 0;
      }

      if (typeof aVal === "string") {
        return direction === "asc"
          ? aVal.localeCompare(bVal, "vi")
          : bVal.localeCompare(aVal, "vi");
      } else {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }
    });

    return sorted;
  }

  async loadPaymentDetails(idHoaDon) {
    try {
      const details = await window.tutorAPI.getPaymentDetails(idHoaDon);
      this.displayStudentInfo(details);
    } catch (error) {
      console.error("Error loading payment details:", error);
      window.tutorAPI.handleError(error);
    }
  }

  displayStudentInfo(details) {
    // Show student info section
    const studentInfoSection = document.getElementById("studentInfoSection");
    if (studentInfoSection) {
      studentInfoSection.style.display = "block";
    }

    // Update student information
    document.getElementById("studentName").textContent =
      details.studentName || "-";
    document.getElementById("studentEmail").textContent =
      details.studentEmail || "-";
    document.getElementById("studentPhone").textContent =
      details.studentPhone || "-";
    document.getElementById("studentAddress").textContent =
      details.studentAddress || "-";

    // Display class information
    const classInfo = details.tenLop || "-";
    if (details.chuongTrinh) {
      document.getElementById(
        "studentClass"
      ).textContent = `${classInfo} (${details.chuongTrinh})`;
    } else {
      document.getElementById("studentClass").textContent = classInfo;
    }

    // Show and display payment amount section
    const paymentAmountSection = document.getElementById(
      "paymentAmountSection"
    );
    if (paymentAmountSection) {
      paymentAmountSection.style.display = "block";
    }

    // Format and display amount
    const amount = details.tongTien
      ? details.tongTien.toLocaleString("vi-VN") + " VNĐ"
      : "-";
    document.getElementById("paymentAmount").textContent = amount;

    // Display payment date (always today - auto)
    this.setPaymentDate();

    // Display payment deadline
    const paymentDeadlineInput = document.getElementById("paymentDeadline");
    if (paymentDeadlineInput && details.hanThanhToan) {
      const deadlineDate = new Date(details.hanThanhToan);
      paymentDeadlineInput.value = deadlineDate.toLocaleDateString("vi-VN");
    } else if (paymentDeadlineInput) {
      paymentDeadlineInput.value = "-";
    }
  }

  hideStudentInfo() {
    const studentInfoSection = document.getElementById("studentInfoSection");
    if (studentInfoSection) {
      studentInfoSection.style.display = "none";
    }

    // Hide payment amount section
    const paymentAmountSection = document.getElementById(
      "paymentAmountSection"
    );
    if (paymentAmountSection) {
      paymentAmountSection.style.display = "none";
    }

    // Clear payment deadline, but keep payment date as today
    const paymentDeadlineInput = document.getElementById("paymentDeadline");
    if (paymentDeadlineInput) {
      paymentDeadlineInput.value = "";
    }

    // Reset payment date to today
    this.setPaymentDate();
  }

  async processPayment() {
    const hiddenInput = document.getElementById("invoiceSelect");
    const paymentMethodSelect = document.getElementById("paymentMethod");
    const notesTextarea = document.getElementById("notes");

    console.log("Processing payment...", {
      invoiceId: hiddenInput?.value,
      paymentMethod: paymentMethodSelect?.value,
      notes: notesTextarea?.value,
    });

    if (!hiddenInput || !hiddenInput.value) {
      showNotification("Vui lòng chọn hóa đơn!", "error");
      const wrapper = document.getElementById("invoiceSelectWrapper");
      if (wrapper) {
        wrapper.classList.add("open");
      }
      return;
    }

    if (!paymentMethodSelect || !paymentMethodSelect.value) {
      showNotification("Vui lòng chọn phương thức thanh toán!", "error");
      return;
    }

    const paymentData = {
      idHoaDon: hiddenInput.value,
      idPt: paymentMethodSelect.value,
      ghiChu: notesTextarea ? notesTextarea.value : null,
    };

    console.log("Sending payment data:", paymentData);

    try {
      const result = await window.tutorAPI.processPayment(paymentData);
      console.log("Payment result:", result);

      // Show success message
      showNotification("Thanh toán thành công!", "success");

      // Display invoice details in modal
      this.displayInvoiceDetails(result);
      this.openInvoiceModal();

      // Reset form and reload unpaid invoices and all invoices
      this.resetPaymentForm();
      await this.loadUnpaidInvoices();
      await this.loadAllInvoices();
    } catch (error) {
      console.error("Error processing payment:", error);

      // Show user-friendly error message
      let errorMessage =
        "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 400) {
        errorMessage =
          "Dữ liệu thanh toán không hợp lệ. Vui lòng kiểm tra lại.";
      } else if (error.status === 500) {
        errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau.";
      } else if (error.status === 401 || error.status === 403) {
        errorMessage = "Bạn không có quyền thực hiện thao tác này.";
      }

      showNotification(errorMessage, "error");
      window.tutorAPI.handleError(error);
    }
  }

  displayInvoiceDetails(invoice) {
    // Check if invoice is paid
    const isPaid =
      invoice.trangThai === "Da Thanh Toan" ||
      (invoice.ngayThanhToan !== null && invoice.ngayThanhToan !== undefined) ||
      (invoice.idLs !== null &&
        invoice.idLs !== undefined &&
        invoice.idLs !== "");

    // Format date
    const paymentDate = invoice.ngayThanhToan
      ? new Date(invoice.ngayThanhToan).toLocaleDateString("vi-VN")
      : "-";

    // Helper function to set text with unpaid class
    const setInvoiceField = (elementId, value, isUnpaid = false) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = value;
        if (isUnpaid) {
          element.classList.add("invoice-unpaid");
        } else {
          element.classList.remove("invoice-unpaid");
        }
      }
    };

    // Update invoice information
    // Receipt number - show "Chưa thanh toán" if unpaid
    setInvoiceField(
      "invoiceReceiptNumber",
      isPaid ? invoice.idLs || "-" : "Chưa thanh toán",
      !isPaid
    );

    document.getElementById("invoiceId").textContent = invoice.idHoaDon || "-";
    document.getElementById("invoiceStudentName").textContent =
      invoice.studentName || "-";
    document.getElementById("invoiceStudentEmail").textContent =
      invoice.studentEmail || "-";
    document.getElementById("invoiceStudentPhone").textContent =
      invoice.studentPhone || "-";
    document.getElementById("invoiceStudentAddress").textContent =
      invoice.studentAddress || "-";

    // Display class information
    const classInfo = invoice.tenLop || "-";
    if (invoice.chuongTrinh) {
      document.getElementById(
        "invoiceClass"
      ).textContent = `${classInfo} (${invoice.chuongTrinh})`;
    } else {
      document.getElementById("invoiceClass").textContent = classInfo;
    }
    document.getElementById("invoiceProgram").textContent =
      invoice.chuongTrinh || "-";

    const amount = invoice.tongTien
      ? invoice.tongTien.toLocaleString("vi-VN") + " VNĐ"
      : "-";
    document.getElementById("invoiceAmount").textContent = amount;

    // Payment method - show "Chưa thanh toán" if unpaid
    setInvoiceField(
      "invoicePaymentMethod",
      isPaid ? invoice.paymentMethodName || "-" : "Chưa thanh toán",
      !isPaid
    );

    // Payment date - show "Chưa thanh toán" if unpaid
    setInvoiceField(
      "invoicePaymentDate",
      isPaid ? paymentDate : "Chưa thanh toán",
      !isPaid
    );

    // Notes - show "-" if unpaid, otherwise show ghiChu
    document.getElementById("invoiceNotes").textContent = isPaid
      ? invoice.ghiChu || "-"
      : "-";
  }

  setupCustomSelect() {
    const wrapper = document.getElementById("invoiceSelectWrapper");
    const trigger = document.getElementById("invoiceSelectTrigger");
    const options = document.getElementById("invoiceSelectOptions");
    const searchInput = document.getElementById("invoiceSelectSearch");

    if (!wrapper || !trigger || !options) return;

    // Toggle dropdown
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpening = !wrapper.classList.contains("open");
      wrapper.classList.toggle("open");

      if (isOpening) {
        // Load invoices if not loaded yet
        if (!this.allUnpaidInvoices) {
          this.loadUnpaidInvoices();
        } else {
          // Reset search and show all invoices
          if (searchInput) {
            searchInput.value = "";
          }
          this.filterAndDisplayUnpaidInvoices("");
        }

        // Focus search input
        if (searchInput) {
          setTimeout(() => searchInput.focus(), 100);
        }
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove("open");
      }
    });

    // Handle search in dropdown
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        e.stopPropagation();
        const searchTerm = e.target.value;
        this.filterAndDisplayUnpaidInvoices(searchTerm);
      });

      // Prevent dropdown from closing when clicking in search box
      searchInput.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      // Handle keyboard navigation
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          wrapper.classList.remove("open");
          trigger.focus();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          const firstOption = document.querySelector(
            ".custom-select-option:not(.disabled)"
          );
          if (firstOption) {
            firstOption.focus();
          }
        }
      });
    }

    // Prevent dropdown from closing when clicking in options list
    const optionsList = document.getElementById("invoiceSelectList");
    if (optionsList) {
      optionsList.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      // Keyboard navigation in options
      optionsList.addEventListener("keydown", (e) => {
        const options = Array.from(
          optionsList.querySelectorAll(".custom-select-option:not(.disabled)")
        );
        const currentIndex = options.findIndex(
          (opt) => opt === document.activeElement
        );

        if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex =
            currentIndex < options.length - 1 ? currentIndex + 1 : 0;
          options[nextIndex].focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : options.length - 1;
          options[prevIndex].focus();
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (
            document.activeElement.classList.contains("custom-select-option")
          ) {
            document.activeElement.click();
          }
        } else if (e.key === "Escape") {
          wrapper.classList.remove("open");
          trigger.focus();
        }
      });
    }

    // Make options focusable
    this.makeOptionsFocusable = () => {
      const options = document.querySelectorAll(
        ".custom-select-option:not(.disabled)"
      );
      options.forEach((option) => {
        option.setAttribute("tabindex", "0");
      });
    };
  }

  resetPaymentForm() {
    const paymentForm = document.getElementById("paymentForm");
    if (paymentForm) {
      paymentForm.reset();
    }

    // Reset custom select
    const hiddenInput = document.getElementById("invoiceSelect");
    const triggerText = document.getElementById("invoiceSelectText");
    const wrapper = document.getElementById("invoiceSelectWrapper");
    const searchInput = document.getElementById("invoiceSelectSearch");

    if (hiddenInput) {
      hiddenInput.value = "";
    }
    if (triggerText) {
      triggerText.textContent = "Chọn hóa đơn...";
    }
    if (wrapper) {
      wrapper.classList.remove("open");
    }
    if (searchInput) {
      searchInput.value = "";
    }

    this.filterAndDisplayUnpaidInvoices("");
    this.hideStudentInfo();

    // Reset payment date to today and clear deadline
    this.setPaymentDate();
    const paymentDeadlineInput = document.getElementById("paymentDeadline");
    if (paymentDeadlineInput) {
      paymentDeadlineInput.value = "";
    }

    // Close invoice modal if open
    this.closeInvoiceModal();
  }

  async loadSupportData() {
    await this.loadSupportRequests();
  }

  async loadSupportRequests() {
    const supportGrid = document.getElementById("supportGrid");
    const supportLoading = document.getElementById("supportLoading");
    const supportEmpty = document.getElementById("supportEmpty");

    if (!supportGrid) return;

    // Show loading state
    if (supportLoading) supportLoading.style.display = "block";
    supportGrid.innerHTML = "";
    if (supportEmpty) supportEmpty.style.display = "none";

    try {
      const requests = await window.tutorAPI.getAllSupportRequests();

      // Hide loading state
      if (supportLoading) supportLoading.style.display = "none";

      if (!requests || requests.length === 0) {
        if (supportEmpty) supportEmpty.style.display = "block";
        return;
      }

      // Store requests for filtering
      this.allSupportRequests = requests || [];

      // Setup filters
      this.setupSupportFilters();

      // Render support requests
      this.renderSupportRequests(this.allSupportRequests);
    } catch (error) {
      console.error("Error loading support requests:", error);
      if (supportLoading) supportLoading.style.display = "none";
      if (supportEmpty) supportEmpty.style.display = "block";
      supportGrid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Không thể tải dữ liệu</h3>
                    <p>Có lỗi xảy ra khi tải danh sách yêu cầu hỗ trợ</p>
                    <button class="btn btn-primary" onclick="tutorDashboard.loadSupportRequests()">
                        <i class="fas fa-redo"></i> Thử lại
                    </button>
                </div>
            `;
      showNotification("Không thể tải danh sách yêu cầu hỗ trợ", "error");
    }
  }

  setupSupportFilters() {
    const searchInput = document.getElementById("supportSearchInput");
    const statusFilter = document.getElementById("supportStatusFilter");
    const refreshBtn = document.getElementById("refreshSupportBtn");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.filterSupportRequests(e.target.value, statusFilter?.value || "");
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.filterSupportRequests(searchInput?.value || "", e.target.value);
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.loadSupportRequests();
      });
    }
  }

  filterSupportRequests(searchTerm = "", statusFilter = "") {
    if (!this.allSupportRequests) return;

    let filtered = [...this.allSupportRequests];

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(
        (request) => request.trangThai && request.trangThai === statusFilter
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          (request.tieuDe && request.tieuDe.toLowerCase().includes(term)) ||
          (request.studentName &&
            request.studentName.toLowerCase().includes(term)) ||
          (request.studentEmail &&
            request.studentEmail.toLowerCase().includes(term)) ||
          (request.studentPhone && request.studentPhone.includes(term)) ||
          (request.tenLop && request.tenLop.toLowerCase().includes(term)) ||
          (request.noiDung && request.noiDung.toLowerCase().includes(term)) ||
          (request.loaiYeuCau &&
            request.loaiYeuCau.toLowerCase().includes(term))
      );
    }

    // Re-render filtered results
    this.renderSupportRequests(filtered);
  }

  renderSupportRequests(requests) {
    const supportGrid = document.getElementById("supportGrid");
    const supportEmpty = document.getElementById("supportEmpty");

    if (!supportGrid) return;

    if (!requests || requests.length === 0) {
      supportGrid.innerHTML = "";
      if (supportEmpty) supportEmpty.style.display = "block";
      return;
    }

    if (supportEmpty) supportEmpty.style.display = "none";
    supportGrid.innerHTML = requests
      .map((request) => this.createSupportCard(request))
      .join("");
  }

  createSupportCard(request) {
    const statusClass = this.getStatusClass(request.trangThai);
    const statusText = request.trangThai || "Chưa xử lý";
    const formattedDate = this.formatDateTime(request.thoiDiemTao);
    const studentName = request.studentName || "Chưa có thông tin";
    const tenLop = request.tenLop || "Chưa có lớp";
    const chuongTrinh = request.chuongTrinh ? ` • ${request.chuongTrinh}` : "";
    const loaiYeuCau = request.loaiYeuCau || "Không xác định";
    const noiDung = request.noiDung || "Không có mô tả";
    const noiDungShort =
      noiDung.length > 150 ? noiDung.substring(0, 150) + "..." : noiDung;
    const isClosed = request.thoiDiemDong != null;
    const timeAgo = this.getTimeAgo(request.thoiDiemTao);

    return `
            <div class="support-card ${isClosed ? "closed" : ""}" data-id="${
      request.idYc
    }" data-status="${statusText}">
                <div class="support-card-header">
                    <div class="support-title-section">
                        <h3 class="support-title">
                            <i class="fas fa-question-circle"></i>
                            ${request.tieuDe || "Yêu cầu hỗ trợ"}
                        </h3>
                        <span class="support-time-ago">${timeAgo}</span>
                    </div>
                    <span class="status-badge ${statusClass}">
                        <i class="fas fa-circle"></i>
                        ${statusText}
                    </span>
                </div>
                
                <div class="support-card-body">
                    <div class="support-student-info">
                        <div class="student-avatar">
                            <i class="fas fa-user-graduate"></i>
                        </div>
                        <div class="student-details">
                            <h4 class="student-name">${studentName}</h4>
                            <div class="student-contact">
                                ${
                                  request.studentEmail
                                    ? `
                                    <span class="contact-item">
                                        <i class="fas fa-envelope"></i>
                                        ${request.studentEmail}
                                    </span>
                                `
                                    : ""
                                }
                                ${
                                  request.studentPhone
                                    ? `
                                    <span class="contact-item">
                                        <i class="fas fa-phone"></i>
                                        ${request.studentPhone}
                                    </span>
                                `
                                    : ""
                                }
                            </div>
                        </div>
                    </div>
                    
                    <div class="support-class-info">
                        <i class="fas fa-book-open"></i>
                        <span>${tenLop}${chuongTrinh}</span>
                    </div>
                    
                    <div class="support-content">
                        <div class="support-type">
                            <i class="fas fa-tag"></i>
                            <span>${loaiYeuCau}</span>
                        </div>
                        <p class="support-description">${noiDungShort}</p>
                    </div>
                    
                    ${
                      request.fileUrl
                        ? `
                        <div class="support-attachment">
                            <i class="fas fa-paperclip"></i>
                            <a href="${request.fileUrl}" target="_blank" class="attachment-link">
                                Xem file đính kèm
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        </div>
                    `
                        : ""
                    }
                    
                    <div class="support-meta">
                        <span class="meta-item">
                            <i class="fas fa-clock"></i>
                            ${formattedDate}
                        </span>
                        ${
                          isClosed
                            ? `
                            <span class="meta-item closed-time">
                                <i class="fas fa-check-circle"></i>
                                Đã đóng: ${this.formatDateTime(
                                  request.thoiDiemDong
                                )}
                            </span>
                        `
                            : ""
                        }
                    </div>
                </div>
                
                <div class="support-card-footer">
                    <button class="btn btn-sm btn-outline-primary" onclick="tutorDashboard.viewSupportDetails('${
                      request.idYc
                    }')">
                        <i class="fas fa-eye"></i>
                        Chi tiết
                    </button>
                    ${
                      !isClosed
                        ? `
                        <button class="btn btn-sm btn-success" onclick="tutorDashboard.markSupportAsProcessed('${request.idYc}')">
                            <i class="fas fa-check"></i>
                            Đánh dấu đã xử lý
                        </button>
                    `
                        : `
                        <span class="closed-badge">
                            <i class="fas fa-lock"></i>
                            Đã đóng
                        </span>
                    `
                    }
                </div>
            </div>
        `;
  }

  getTimeAgo(dateTime) {
    if (!dateTime) return "";
    const now = new Date();
    const date = new Date(dateTime);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return this.formatDateTime(dateTime);
  }

  async viewSupportDetails(idYc) {
    const modal = document.getElementById("supportDetailsModal");
    const modalBody = document.getElementById("supportModalBody");
    const modalFooter = document.getElementById("supportModalFooter");

    if (!modal) return;

    // Show modal with loading state
    modal.style.display = "flex";
    modalBody.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Đang tải thông tin...</p>
            </div>
        `;

    try {
      const request = await window.tutorAPI.getSupportRequestById(idYc);

      if (!request) {
        throw new Error("Không tìm thấy yêu cầu hỗ trợ");
      }

      // Render support details
      const statusClass = this.getStatusClass(request.trangThai);
      const formattedDate = this.formatDateTime(request.thoiDiemTao);
      const closedDate = request.thoiDiemDong
        ? this.formatDateTime(request.thoiDiemDong)
        : null;
      const isClosed = request.thoiDiemDong != null;

      modalBody.innerHTML = `
                <div class="support-detail-content">
                    <div class="detail-header">
                        <div class="detail-title-section">
                            <h4 class="detail-title">
                                <i class="fas fa-question-circle"></i>
                                ${request.tieuDe || "Yêu cầu hỗ trợ"}
                            </h4>
                            <span class="status-badge ${statusClass}">
                                <i class="fas fa-circle"></i>
                                ${request.trangThai || "Chưa xử lý"}
                            </span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5 class="section-title">
                            <i class="fas fa-user-graduate"></i>
                            Thông tin học sinh
                        </h5>
                        <div class="detail-info-grid">
                            <div class="info-item">
                                <span class="info-label">Họ tên:</span>
                                <span class="info-value">${
                                  request.studentName || "Chưa có thông tin"
                                }</span>
                            </div>
                            ${
                              request.studentEmail
                                ? `
                                <div class="info-item">
                                    <span class="info-label">Email:</span>
                                    <span class="info-value">
                                        <a href="mailto:${request.studentEmail}">${request.studentEmail}</a>
                                    </span>
                                </div>
                            `
                                : ""
                            }
                            ${
                              request.studentPhone
                                ? `
                                <div class="info-item">
                                    <span class="info-label">Số điện thoại:</span>
                                    <span class="info-value">
                                        <a href="tel:${request.studentPhone}">${request.studentPhone}</a>
                                    </span>
                                </div>
                            `
                                : ""
                            }
                            ${
                              request.idHs
                                ? `
                                <div class="info-item">
                                    <span class="info-label">Mã học sinh:</span>
                                    <span class="info-value">${request.idHs}</span>
                                </div>
                            `
                                : ""
                            }
                        </div>
                    </div>
                    
                    ${
                      request.tenLop
                        ? `
                        <div class="detail-section">
                            <h5 class="section-title">
                                <i class="fas fa-book-open"></i>
                                Thông tin lớp học
                            </h5>
                            <div class="detail-info-grid">
                                <div class="info-item">
                                    <span class="info-label">Tên lớp:</span>
                                    <span class="info-value">${
                                      request.tenLop
                                    }</span>
                                </div>
                                ${
                                  request.chuongTrinh
                                    ? `
                                    <div class="info-item">
                                        <span class="info-label">Chương trình:</span>
                                        <span class="info-value">${request.chuongTrinh}</span>
                                    </div>
                                `
                                    : ""
                                }
                                ${
                                  request.idLh
                                    ? `
                                    <div class="info-item">
                                        <span class="info-label">Mã lớp:</span>
                                        <span class="info-value">${request.idLh}</span>
                                    </div>
                                `
                                    : ""
                                }
                            </div>
                        </div>
                    `
                        : ""
                    }
                    
                    <div class="detail-section">
                        <h5 class="section-title">
                            <i class="fas fa-info-circle"></i>
                            Chi tiết yêu cầu
                        </h5>
                        <div class="detail-info-grid">
                            <div class="info-item full-width">
                                <span class="info-label">Loại yêu cầu:</span>
                                <span class="info-value">
                                    <span class="support-type-badge">${
                                      request.loaiYeuCau || "Không xác định"
                                    }</span>
                                </span>
                            </div>
                            <div class="info-item full-width">
                                <span class="info-label">Nội dung:</span>
                                <div class="info-value content-text">${
                                  request.noiDung || "Không có mô tả"
                                }</div>
                            </div>
                        </div>
                    </div>
                    
                    ${
                      request.fileUrl
                        ? `
                        <div class="detail-section">
                            <h5 class="section-title">
                                <i class="fas fa-paperclip"></i>
                                File đính kèm
                            </h5>
                            <div class="attachment-section">
                                <a href="${request.fileUrl}" target="_blank" class="attachment-link-large">
                                    <i class="fas fa-file"></i>
                                    <span>Xem file đính kèm</span>
                                    <i class="fas fa-external-link-alt"></i>
                                </a>
                            </div>
                        </div>
                    `
                        : ""
                    }
                    
                    <div class="detail-section">
                        <h5 class="section-title">
                            <i class="fas fa-clock"></i>
                            Thông tin thời gian
                        </h5>
                        <div class="detail-info-grid">
                            <div class="info-item">
                                <span class="info-label">Thời điểm tạo:</span>
                                <span class="info-value">${formattedDate}</span>
                            </div>
                            ${
                              closedDate
                                ? `
                                <div class="info-item">
                                    <span class="info-label">Thời điểm đóng:</span>
                                    <span class="info-value">${closedDate}</span>
                                </div>
                            `
                                : ""
                            }
                            <div class="info-item">
                                <span class="info-label">Mã yêu cầu:</span>
                                <span class="info-value code-value">${
                                  request.idYc
                                }</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

      // Update footer with action buttons
      modalFooter.innerHTML = `
                ${
                  !isClosed
                    ? `
                    <button class="btn btn-success" onclick="tutorDashboard.openUpdateStatusModal('${request.idYc}', 'Đã xử lý')">
                        <i class="fas fa-check-circle"></i>
                        Đánh dấu đã xử lý
                    </button>
                    <button class="btn btn-warning" onclick="tutorDashboard.openUpdateStatusModal('${request.idYc}', 'Đang xử lý')">
                        <i class="fas fa-spinner"></i>
                        Đang xử lý
                    </button>
                `
                    : ""
                }
                <button class="btn btn-secondary" id="closeSupportModalBtn">
                    <i class="fas fa-times"></i>
                    Đóng
                </button>
            `;

      // Setup close button
      const closeBtn = document.getElementById("closeSupportModalBtn");
      if (closeBtn) {
        closeBtn.onclick = () => this.closeSupportModal();
      }
    } catch (error) {
      console.error("Error loading support details:", error);
      modalBody.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Không thể tải thông tin</h3>
                    <p>${
                      error.message ||
                      "Có lỗi xảy ra khi tải chi tiết yêu cầu hỗ trợ"
                    }</p>
                    <button class="btn btn-primary" onclick="tutorDashboard.viewSupportDetails('${idYc}')">
                        <i class="fas fa-redo"></i> Thử lại
                    </button>
                </div>
            `;
      showNotification("Không thể tải chi tiết yêu cầu hỗ trợ", "error");
    }
  }

  closeSupportModal() {
    const modal = document.getElementById("supportDetailsModal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  openUpdateStatusModal(idYc, defaultStatus = "") {
    const modal = document.getElementById("updateStatusModal");
    const form = document.getElementById("updateStatusForm");
    const statusSelect = document.getElementById("statusSelect");
    const requestIdInput = document.getElementById("statusRequestId");

    if (!modal || !form) return;

    // Set request ID
    if (requestIdInput) {
      requestIdInput.value = idYc;
    }

    // Set default status if provided
    if (statusSelect && defaultStatus) {
      statusSelect.value = defaultStatus;
    } else if (statusSelect) {
      statusSelect.value = "";
    }

    // Clear note
    const noteTextarea = document.getElementById("statusNote");
    if (noteTextarea) {
      noteTextarea.value = "";
    }

    // Show modal
    modal.style.display = "flex";

    // Setup save button
    const saveBtn = document.getElementById("saveStatusBtn");
    if (saveBtn) {
      saveBtn.onclick = () => this.saveSupportStatus();
    }
  }

  closeStatusModal() {
    const modal = document.getElementById("updateStatusModal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  async saveSupportStatus() {
    const form = document.getElementById("updateStatusForm");
    const requestIdInput = document.getElementById("statusRequestId");
    const statusSelect = document.getElementById("statusSelect");
    const noteTextarea = document.getElementById("statusNote");
    const saveBtn = document.getElementById("saveStatusBtn");

    if (!form || !requestIdInput || !statusSelect) return;

    const idYc = requestIdInput.value;
    const trangThai = statusSelect.value;
    const ghiChu = noteTextarea ? noteTextarea.value.trim() : null;

    if (!trangThai) {
      showNotification("Vui lòng chọn trạng thái", "warning");
      return;
    }

    // Disable save button
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    }

    try {
      await window.tutorAPI.updateSupportStatus(idYc, trangThai, ghiChu);

      showNotification("Đã cập nhật trạng thái thành công", "success");

      // Close modal
      this.closeStatusModal();

      // Reload support requests
      await this.loadSupportRequests();
    } catch (error) {
      console.error("Error updating support status:", error);
      showNotification("Có lỗi xảy ra khi cập nhật trạng thái", "error");
    } finally {
      // Re-enable save button
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Lưu thay đổi';
      }
    }
  }

  async markSupportAsProcessed(idYc) {
    // Quick action: mark as processed
    await this.openUpdateStatusModal(idYc, "Đã xử lý");
  }

  getStatusClass(status) {
    if (!status) return "normal";
    const statusLower = status.toLowerCase();
    if (statusLower.includes("khẩn") || statusLower.includes("urgent"))
      return "urgent";
    if (statusLower.includes("ưu tiên") || statusLower.includes("high"))
      return "high";
    if (
      statusLower.includes("đã") &&
      (statusLower.includes("xử lý") || statusLower.includes("đóng"))
    )
      return "completed";
    if (statusLower.includes("đang")) return "processing";
    return "normal";
  }

  formatDateTime(dateTime) {
    if (!dateTime) return "Chưa có thông tin";
    const date = new Date(dateTime);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async loadConsultationsData() {
    const container = document.getElementById("consultationsContainer");
    const loadingState = document.getElementById("consultationsLoading");

    if (!container) return;

    try {
      if (loadingState) loadingState.style.display = "block";

      const consultations = await window.tutorAPI.getConsultations();

      if (loadingState) loadingState.style.display = "none";

      if (!consultations || consultations.length === 0) {
        container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có yêu cầu tư vấn nào</p>
                    </div>
                `;
        return;
      }

      // Sort by date (newest first)
      consultations.sort((a, b) => {
        const dateA = new Date(a.thoiDiemTao);
        const dateB = new Date(b.thoiDiemTao);
        return dateB - dateA;
      });

      container.innerHTML = consultations
        .map((consultation) => {
          const date = new Date(consultation.thoiDiemTao);
          const formattedDate = date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          const statusClass =
            consultation.trangThai === "Chưa xử lý"
              ? "urgent"
              : consultation.trangThai === "Đang xử lý"
              ? "high"
              : "normal";

          return `
                    <div class="consultation-item ${
                      consultation.trangThai === "Chưa xử lý" ? "unread" : ""
                    }">
                        <div class="consultation-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="consultation-content">
                            <div class="consultation-header">
                                <h4>${consultation.hoTen}</h4>
                                <span class="consultation-time">${formattedDate}</span>
                            </div>
                            <div class="consultation-subject">
                                <strong>Tiêu đề:</strong> ${consultation.tieuDe}
                            </div>
                            <div class="consultation-type">
                                <i class="fas fa-tag"></i> ${
                                  consultation.hinhThucTuVan
                                }
                            </div>
                            <div class="consultation-details">
                                <p><strong>Email:</strong> ${
                                  consultation.email || "N/A"
                                }</p>
                                <p><strong>SĐT:</strong> ${
                                  consultation.sdt || "N/A"
                                }</p>
                                ${
                                  consultation.noiDung
                                    ? `<p><strong>Nội dung:</strong> ${consultation.noiDung}</p>`
                                    : ""
                                }
                            </div>
                            <div class="consultation-actions">
                                ${
                                  consultation.trangThai === "Chưa xử lý"
                                    ? `<button class="btn btn-sm btn-primary" onclick="tutorDashboard.updateConsultationStatus('${consultation.idTv}', 'Đang xử lý')">
                                        <i class="fas fa-check"></i> Bắt đầu xử lý
                                    </button>`
                                    : ""
                                }
                                ${
                                  consultation.trangThai === "Đang xử lý"
                                    ? `<button class="btn btn-sm btn-success" onclick="tutorDashboard.updateConsultationStatus('${consultation.idTv}', 'Đã xử lý')">
                                        <i class="fas fa-check-circle"></i> Hoàn thành
                                    </button>`
                                    : ""
                                }
                                <button class="btn btn-sm btn-secondary" onclick="tutorDashboard.viewConsultationDetails('${
                                  consultation.idTv
                                }')">
                                    <i class="fas fa-info-circle"></i> Chi tiết
                                </button>
                            </div>
                        </div>
                        <div class="consultation-status">
                            <span class="status-badge ${statusClass}">${
            consultation.trangThai
          }</span>
                        </div>
                    </div>
                `;
        })
        .join("");

      // Setup search and filter
      this.setupConsultationFilters(consultations);
    } catch (error) {
      console.error("Error loading consultations:", error);
      if (loadingState) loadingState.style.display = "none";
      container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Có lỗi xảy ra khi tải yêu cầu tư vấn</p>
                    <button class="btn btn-primary" onclick="tutorDashboard.loadConsultationsData()">
                        Thử lại
                    </button>
                </div>
            `;
    }
  }

  setupConsultationFilters(allConsultations) {
    const searchInput = document.getElementById("consultationSearch");
    const statusFilter = document.getElementById("consultationStatusFilter");
    const refreshBtn = document.getElementById("refreshConsultations");
    const container = document.getElementById("consultationsContainer");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.filterConsultations(
          allConsultations,
          e.target.value,
          statusFilter?.value
        );
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.filterConsultations(
          allConsultations,
          searchInput?.value || "",
          e.target.value
        );
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.loadConsultationsData();
      });
    }
  }

  filterConsultations(allConsultations, searchTerm, statusFilter) {
    const container = document.getElementById("consultationsContainer");
    if (!container) return;

    let filtered = [...allConsultations];

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter((c) => c.trangThai === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.hoTen.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term) ||
          c.sdt?.includes(term) ||
          c.tieuDe.toLowerCase().includes(term) ||
          c.noiDung?.toLowerCase().includes(term)
      );
    }

    // Re-render filtered results
    if (filtered.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>Không tìm thấy yêu cầu tư vấn nào</p>
                </div>
            `;
      return;
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.thoiDiemTao);
      const dateB = new Date(b.thoiDiemTao);
      return dateB - dateA;
    });

    container.innerHTML = filtered
      .map((consultation) => {
        const date = new Date(consultation.thoiDiemTao);
        const formattedDate = date.toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const statusClass =
          consultation.trangThai === "Chưa xử lý"
            ? "urgent"
            : consultation.trangThai === "Đang xử lý"
            ? "high"
            : "normal";

        return `
                <div class="consultation-item ${
                  consultation.trangThai === "Chưa xử lý" ? "unread" : ""
                }">
                    <div class="consultation-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="consultation-content">
                        <div class="consultation-header">
                            <h4>${consultation.hoTen}</h4>
                            <span class="consultation-time">${formattedDate}</span>
                        </div>
                        <div class="consultation-subject">
                            <strong>Tiêu đề:</strong> ${consultation.tieuDe}
                        </div>
                        <div class="consultation-type">
                            <i class="fas fa-tag"></i> ${
                              consultation.hinhThucTuVan
                            }
                        </div>
                        <div class="consultation-details">
                            <p><strong>Email:</strong> ${
                              consultation.email || "N/A"
                            }</p>
                            <p><strong>SĐT:</strong> ${
                              consultation.sdt || "N/A"
                            }</p>
                            ${
                              consultation.noiDung
                                ? `<p><strong>Nội dung:</strong> ${consultation.noiDung}</p>`
                                : ""
                            }
                        </div>
                        <div class="consultation-actions">
                            ${
                              consultation.trangThai === "Chưa xử lý"
                                ? `<button class="btn btn-sm btn-primary" onclick="tutorDashboard.updateConsultationStatus('${consultation.idTv}', 'Đang xử lý')">
                                    <i class="fas fa-check"></i> Bắt đầu xử lý
                                </button>`
                                : ""
                            }
                            ${
                              consultation.trangThai === "Đang xử lý"
                                ? `<button class="btn btn-sm btn-success" onclick="tutorDashboard.updateConsultationStatus('${consultation.idTv}', 'Đã xử lý')">
                                    <i class="fas fa-check-circle"></i> Hoàn thành
                                </button>`
                                : ""
                            }
                            <button class="btn btn-sm btn-secondary" onclick="tutorDashboard.viewConsultationDetails('${
                              consultation.idTv
                            }')">
                                <i class="fas fa-info-circle"></i> Chi tiết
                            </button>
                        </div>
                    </div>
                    <div class="consultation-status">
                        <span class="status-badge ${statusClass}">${
          consultation.trangThai
        }</span>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  async updateConsultationStatus(idTv, trangThai) {
    try {
      await window.tutorAPI.updateConsultationStatus(idTv, trangThai);
      showNotification(
        `Đã cập nhật trạng thái thành "${trangThai}"`,
        "success"
      );
      await this.loadConsultationsData();
    } catch (error) {
      console.error("Error updating consultation status:", error);
      showNotification("Có lỗi xảy ra khi cập nhật trạng thái", "error");
    }
  }

  viewConsultationDetails(idTv) {
    // TODO: Implement modal for viewing consultation details
    alert("Chi tiết yêu cầu tư vấn sẽ được hiển thị ở đây");
  }

  loadMessagesData() {
    // Simulate loading messages data
    console.log("Loading messages data...");
  }

  handleSearch(query, sectionId) {
    console.log(`Searching "${query}" in ${sectionId}`);
    // Implement search functionality for each section
  }

  navigateWeek(direction) {
    if (!direction) return;
    const nextWeek = new Date(this.consultationWeekStart);
    nextWeek.setDate(nextWeek.getDate() + direction * 7);
    this.consultationWeekStart = this.getStartOfWeek(nextWeek);
    this.updateWeekPickerValue();
    this.loadConsultationSchedule();
  }

  async loadConsultationSchedule() {
    const loadingState = document.getElementById("consultationScheduleLoading");
    const errorState = document.getElementById("consultationScheduleError");

    if (loadingState) {
      loadingState.style.display = "flex";
    }
    if (errorState) {
      errorState.style.display = "none";
    }

    try {
      const response = await window.tutorAPI.getWeeklySchedule({
        startDate: this.formatDateISO(this.consultationWeekStart),
      });

      const weekStart = response?.weekStart
        ? this.getStartOfWeek(new Date(response.weekStart))
        : this.consultationWeekStart;
      const weekEnd = response?.weekEnd
        ? new Date(response.weekEnd)
        : this.getWeekEndDate(weekStart);

      this.consultationWeekStart = weekStart;
      this.consultationWeekData = response?.items || [];

      this.renderConsultationWeek(weekStart, weekEnd, this.consultationWeekData);
      this.updateConsultationStats(this.consultationWeekData);
      this.updateWeekPickerValue();
      this.updateWeekRangeLabel(weekStart, weekEnd);
    } catch (error) {
      console.error("Error loading consultation schedule:", error);
      if (errorState) {
        errorState.style.display = "flex";
        const message = errorState.querySelector("p");
        if (message) {
          message.textContent =
            "Không thể tải lịch tư vấn. Vui lòng thử lại sau.";
        }
      }
      this.updateWeekRangeLabel(
        this.consultationWeekStart,
        this.getWeekEndDate(this.consultationWeekStart)
      );
    } finally {
      if (loadingState) {
        loadingState.style.display = "none";
      }
    }
  }

  renderConsultationWeek(weekStart, weekEnd, items = []) {
    const grid = document.getElementById("consultationWeekGrid");
    if (!grid) return;

    grid.innerHTML = "";
    const slotsPerDay = {};

    for (let i = 0; i < 7; i++) {
      const current = new Date(weekStart);
      current.setDate(weekStart.getDate() + i);
      const dayKey = this.formatDateISO(current);

      const dayColumn = document.createElement("div");
      dayColumn.className = "week-day";
      if (this.isSameDate(current, new Date())) {
        dayColumn.classList.add("is-today");
      }

      const header = document.createElement("div");
      header.className = "week-day-header";
      header.innerHTML = `${this.getVietnameseDayName(i)}<span>${this.formatDisplayDate(
        current
      )}</span>`;
      dayColumn.appendChild(header);

      const slotContainer = document.createElement("div");
      slotContainer.className = "consultation-slots";
      slotsPerDay[dayKey] = {};

      this.consultationSlotConfig.forEach((slot) => {
        const slotEl = document.createElement("div");
        slotEl.className = "consultation-slot";
        const label = document.createElement("div");
        label.className = "slot-label";
        label.textContent = slot.label;
        slotEl.appendChild(label);
        slotContainer.appendChild(slotEl);
        slotsPerDay[dayKey][slot.id] = slotEl;
      });

      dayColumn.appendChild(slotContainer);
      grid.appendChild(dayColumn);
    }

    items.forEach((item) => {
      if (!item.startTime) return;
      const startDate = new Date(item.startTime);
      const dayKey = this.formatDateISO(startDate);
      const slotId = this.getSlotIdForDate(startDate);
      const targetSlot = slotsPerDay[dayKey]?.[slotId];
      if (!targetSlot) return;
      targetSlot.appendChild(this.buildConsultationCard(item));
    });
  }

  buildConsultationCard(item) {
    const card = document.createElement("div");
    card.className = `consultation-card ${item.online ? "online" : "onsite"}`;
    const timeRange = this.formatTimeRange(item.startTime, item.endTime);
    const student = item.studentName || "Học viên";
    const location = item.location || "Trung tâm MathBridge";
    const channel = item.channel || "Chưa xác định";
    const status = item.status || "Đang chờ";

    card.innerHTML = `
      <h4>${item.title || "Tư vấn cá nhân"}</h4>
      <div class="code">${item.referenceCode || item.id || ""}</div>
      <div class="time-range"><i class="fas fa-clock"></i> ${timeRange}</div>
      <div class="meta">
        <span><i class="fas fa-user-graduate"></i> ${student}</span>
        <span><i class="fas fa-location-dot"></i> ${location}</span>
        <span><i class="fas fa-headset"></i> ${channel}</span>
      </div>
      <div class="badges">
        <span class="badge ${item.online ? "lms" : "center"}">${
      item.online ? "LMS" : "Trực tiếp"
    }</span>
        <span class="badge">${status}</span>
      </div>
    `;

    return card;
  }

  updateConsultationStats(items = []) {
    const totalSessions = items.length;
    const totalMinutes = items.reduce((total, session) => {
      if (!session.startTime) return total;
      const start = new Date(session.startTime);
      const end = session.endTime ? new Date(session.endTime) : new Date(start.getTime() + 60 * 60000);
      return total + (end - start) / 60000;
    }, 0);

    const onlineSessions = items.filter((session) => session.online).length;
    const onsiteSessions = totalSessions - onlineSessions;

    const statsMap = {
      consultationTotalSessions: totalSessions,
      consultationTotalHours: `${Math.max(totalMinutes / 60, 0).toFixed(1)}h`,
      consultationOnlineSessions: onlineSessions,
      consultationOnsiteSessions: onsiteSessions,
    };

    Object.entries(statsMap).forEach(([elementId, value]) => {
      const el = document.getElementById(elementId);
      if (el) {
        el.textContent = value;
      }
    });
  }

  getConsultationSlotConfig() {
    return [
      { id: "morning", label: "Ca sáng (05:00 - 11:00)", start: 5, end: 11 },
      { id: "midday", label: "Ca 3 (11:00 - 14:00)", start: 11, end: 14 },
      { id: "afternoon", label: "Chiều (14:00 - 17:30)", start: 14, end: 17.5 },
      { id: "evening", label: "Ca 4 (17:30 - 22:00)", start: 17.5, end: 22 },
    ];
  }

  getSlotIdForDate(date) {
    const hour = date.getHours() + date.getMinutes() / 60;
    const fallback =
      this.consultationSlotConfig[this.consultationSlotConfig.length - 1].id;

    for (const slot of this.consultationSlotConfig) {
      if (hour >= slot.start && hour < slot.end) {
        return slot.id;
      }
    }
    return fallback;
  }

  getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setHours(0, 0, 0, 0);
    return new Date(d.setDate(diff));
  }

  getWeekEndDate(startDate) {
    const end = new Date(startDate);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  formatDateISO(date) {
    return date.toISOString().split("T")[0];
  }

  formatDisplayDate(date) {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  formatTimeRange(start, end) {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date(startDate.getTime() + 60 * 60000);
    return `${this.formatTime(startDate)} - ${this.formatTime(endDate)}`;
  }

  formatTime(date) {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  isSameDate(first, second) {
    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    );
  }

  getVietnameseDayName(index) {
    const days = [
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
      "Chủ nhật",
    ];
    return days[index] || "";
  }

  toggleUserDropdown() {
    const userDropdown = document.getElementById("userDropdown");
    const userMenuBtn = document.getElementById("userMenuBtn");
    
    if (userDropdown && userMenuBtn) {
      const isActive = userDropdown.classList.contains("active");
      
      if (isActive) {
        this.closeUserDropdown();
      } else {
        userDropdown.classList.add("active");
        userMenuBtn.classList.add("active");
      }
    }
  }

  closeUserDropdown() {
    const userDropdown = document.getElementById("userDropdown");
    const userMenuBtn = document.getElementById("userMenuBtn");
    
    if (userDropdown) {
      userDropdown.classList.remove("active");
    }
    if (userMenuBtn) {
      userMenuBtn.classList.remove("active");
    }
  }

  openProfile() {
    this.closeUserDropdown();
    showNotification("Tính năng hồ sơ cá nhân đang được phát triển.", "info");
    // TODO: Implement profile modal
  }

  openSettings() {
    this.closeUserDropdown();
    showNotification("Tính năng cài đặt đang được phát triển.", "info");
    // TODO: Implement settings modal
  }

  openHelp() {
    this.closeUserDropdown();
    showNotification("Tính năng trợ giúp đang được phát triển.", "info");
    // TODO: Implement help modal
  }

  toggleUserDropdown() {
    const userDropdown = document.getElementById("userDropdown");
    const userMenuBtn = document.getElementById("userMenuBtn");
    
    if (userDropdown && userMenuBtn) {
      const isActive = userDropdown.classList.contains("active");
      
      if (isActive) {
        this.closeUserDropdown();
      } else {
        userDropdown.classList.add("active");
        userMenuBtn.classList.add("active");
      }
    }
  }

  closeUserDropdown() {
    const userDropdown = document.getElementById("userDropdown");
    const userMenuBtn = document.getElementById("userMenuBtn");
    
    if (userDropdown) {
      userDropdown.classList.remove("active");
    }
    if (userMenuBtn) {
      userMenuBtn.classList.remove("active");
    }
  }

  openProfile() {
    this.closeUserDropdown();
    showNotification("Tính năng hồ sơ cá nhân đang được phát triển.", "info");
    // TODO: Implement profile modal
  }

  openSettings() {
    this.closeUserDropdown();
    showNotification("Tính năng cài đặt đang được phát triển.", "info");
    // TODO: Implement settings modal
  }

  openHelp() {
    this.closeUserDropdown();
    showNotification("Tính năng trợ giúp đang được phát triển.", "info");
    // TODO: Implement help modal
  }

  showNotifications() {
    console.log("Showing notifications");
    // Implement notifications display
  }

  // Student Management Methods
  showStudentDetails() {
    const studentModal = document.getElementById("studentModal");
    if (studentModal) {
      studentModal.classList.add("active");
    }
  }

  editStudent() {
    console.log("Edit student");
    // Implement edit student functionality
  }

  addStudent() {
    console.log("Add new student");
    // Implement add student functionality
  }

  // Teacher Management Methods
  showTeacherDetails() {
    const teacherModal = document.getElementById("teacherModal");
    if (teacherModal) {
      teacherModal.classList.add("active");
    }
  }

  editTeacher() {
    console.log("Edit teacher");
    // Implement edit teacher functionality
  }

  addTeacher() {
    console.log("Add new teacher");
    // Implement add teacher functionality
  }

  // Class Management Methods
  showClassDetails() {
    console.log("Show class details");
    // Implement show class details functionality
  }

  editClass() {
    console.log("Edit class");
    // Implement edit class functionality
  }

  createClass() {
    console.log("Create new class");
    // Implement create class functionality
  }

  // Payment Management Methods
  viewPayment() {
    console.log("View payment details");
    // Implement view payment functionality
  }

  // Note: processPayment() is defined earlier as async method for payment processing
  // This method is kept for backward compatibility but should not be used

  printInvoice() {
    console.log("Print invoice");
    // Implement print invoice functionality
  }

  addPayment() {
    console.log("Add new payment");
    // Implement add payment functionality
  }

  // Support Methods
  processSupportRequest() {
    console.log("Process support request");
    // Implement process support request functionality
  }

  viewSupportDetails() {
    console.log("View support details");
    // Implement view support details functionality
  }

  createSupportRequest() {
    console.log("Create support request");
    // Implement create support request functionality
  }

  // Message Methods
  replyMessage() {
    console.log("Reply to message");
    // Implement reply message functionality
  }

  viewMessageDetails() {
    console.log("View message details");
    // Implement view message details functionality
  }

  createNewMessage() {
    console.log("Create new message");
    // Implement create new message functionality
  }

  // Utility Methods
  getPriorityText(priority) {
    const priorityTexts = {
      urgent: "Khẩn cấp",
      high: "Ưu tiên cao",
      normal: "Bình thường",
    };
    return priorityTexts[priority] || "Bình thường";
  }

  getStatusText(status) {
    const statusTexts = {
      success: "Đã thanh toán",
      pending: "Chờ xử lý",
      active: "Đang học",
      inactive: "Tạm nghỉ",
    };
    return statusTexts[status] || status;
  }

  logout() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      // Xóa thông tin đăng nhập
      localStorage.removeItem("mb_auth");
      localStorage.removeItem("mb_token");
      localStorage.removeItem("mb_token_type");
      localStorage.removeItem("mb_user_id");
      localStorage.removeItem("mb_user_email");
      localStorage.removeItem("mb_user_name");
      localStorage.removeItem("mb_user_roles");
      localStorage.removeItem("authToken");

      // Gọi API logout nếu có
      if (window.tutorAPI) {
        window.tutorAPI.logout().catch((err) => {
          console.error("Logout API error:", err);
        });
      }

      // Redirect to login page
      window.location.href = "../LoginPortal.html";
    }
  }

  // API Methods using TutorAPI
  async fetchStudents() {
    try {
      return await window.tutorAPI.getStudents();
    } catch (error) {
      console.error("Error fetching students:", error);
      window.tutorAPI.handleError(error);
      return [];
    }
  }

  async fetchTeachers() {
    try {
      return await window.tutorAPI.getTeachers();
    } catch (error) {
      console.error("Error fetching teachers:", error);
      window.tutorAPI.handleError(error);
      return [];
    }
  }

  async fetchClasses() {
    try {
      return await window.tutorAPI.getClasses();
    } catch (error) {
      console.error("Error fetching classes:", error);
      window.tutorAPI.handleError(error);
      return [];
    }
  }

  async fetchPayments() {
    try {
      return await window.tutorAPI.getPayments();
    } catch (error) {
      console.error("Error fetching payments:", error);
      window.tutorAPI.handleError(error);
      return [];
    }
  }

  async fetchSupportRequests() {
    try {
      return await window.tutorAPI.getAllSupportRequests();
    } catch (error) {
      console.error("Error fetching support requests:", error);
      window.tutorAPI.handleError(error);
      return [];
    }
  }

  async fetchMessages() {
    try {
      return await window.tutorAPI.getMessages();
    } catch (error) {
      console.error("Error fetching messages:", error);
      window.tutorAPI.handleError(error);
      return [];
    }
  }

  async fetchDashboardStats() {
    try {
      return await window.tutorAPI.getDashboardStats();
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      window.tutorAPI.handleError(error);
      return {};
    }
  }

  async fetchRecentStudents() {
    try {
      return await window.tutorAPI.getRecentStudents();
    } catch (error) {
      console.error("Error fetching recent students:", error);
      window.tutorAPI.handleError(error);
      return [];
    }
  }

  async fetchRecentPayments() {
    try {
      return await window.tutorAPI.getRecentPayments();
    } catch (error) {
      console.error("Error fetching recent payments:", error);
      window.tutorAPI.handleError(error);
      return [];
    }
  }

  async fetchWeeklySchedule() {
    try {
      return await window.tutorAPI.getWeeklySchedule();
    } catch (error) {
      console.error("Error fetching weekly schedule:", error);
      window.tutorAPI.handleError(error);
      return [];
    }
  }
}

// Assigned Students functions
async function viewStudentDetails(studentId) {
  try {
    // Lấy idNv từ tutorInfo hoặc currentTutorId
    const tutorDashboard = window.tutorDashboard;
    const idNv = tutorDashboard?.currentTutorId || 
                 tutorDashboard?.tutorInfo?.idNv || 
                 tutorDashboard?.tutorInfo?.id;
    
    if (!idNv) {
      showNotification("Không xác định được ID cố vấn. Vui lòng thử lại.", "error");
      return;
    }
    
    const student = await window.tutorAPI.getStudentDetails(studentId, idNv);
    showStudentDetailsModal(student);
  } catch (error) {
    console.error("Error fetching student details:", error);
    window.tutorAPI.handleError(error);
  }
}

async function addNote(studentId) {
  const note = prompt("Nhập ghi chú cho học sinh:");
  if (note) {
    try {
      await window.tutorAPI.addStudentNote(studentId, note);
      showNotification("Ghi chú đã được thêm thành công!", "success");
      loadAssignedStudents();
    } catch (error) {
      console.error("Error adding note:", error);
      window.tutorAPI.handleError(error);
    }
  }
}

async function generateReport(studentId) {
  try {
    const report = await window.tutorAPI.generateStudentReport(studentId);
    showReportModal(report);
  } catch (error) {
    console.error("Error generating report:", error);
    window.tutorAPI.handleError(error);
  }
}

// Consultation Schedule functions
async function addConsultation() {
  const form = document.getElementById("consultationForm");
  if (form) {
    const formData = new FormData(form);
    try {
      await window.tutorAPI.createConsultation(formData);
      showNotification("Buổi tư vấn đã được tạo thành công!", "success");
      loadConsultationSchedule();
    } catch (error) {
      console.error("Error creating consultation:", error);
      window.tutorAPI.handleError(error);
    }
  }
}

async function updateConsultationContent(consultationId, content) {
  try {
    await window.tutorAPI.updateConsultationContent(consultationId, content);
    showNotification("Nội dung tư vấn đã được cập nhật!", "success");
    loadConsultationSchedule();
  } catch (error) {
    console.error("Error updating consultation:", error);
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
    showNotification("Lịch tư vấn đã được xuất thành công!", "success");
  } catch (error) {
    console.error("Error exporting consultation schedule:", error);
    window.tutorAPI.handleError(error);
  }
}

function changeConsultationMonth(direction) {
  // This would typically update the calendar view
  const currentMonthElement = document.getElementById("currentMonth");
  const months = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  const currentText = currentMonthElement.textContent;
  const currentMonth = months.indexOf(currentText.split(",")[0]);
  const newMonth = (currentMonth + direction + 12) % 12;
  const currentYear = new Date().getFullYear();
  currentMonthElement.textContent = `${months[newMonth]}, ${currentYear}`;

  // Load consultation data for the new month
  loadConsultationSchedule();
}

async function startConsultation(consultationId) {
  try {
    await window.tutorAPI.startConsultation(consultationId);
    showNotification("Buổi tư vấn đã được bắt đầu!", "success");
    loadConsultationSchedule();
  } catch (error) {
    console.error("Error starting consultation:", error);
    window.tutorAPI.handleError(error);
  }
}

async function viewConsultationDetails(consultationId) {
  try {
    const consultation = await window.tutorAPI.getConsultationById(
      consultationId
    );
    showConsultationDetailsModal(consultation);
  } catch (error) {
    console.error("Error fetching consultation details:", error);
    window.tutorAPI.handleError(error);
  }
}

async function reviewConsultation(consultationId) {
  try {
    const consultation = await window.tutorAPI.getConsultationById(
      consultationId
    );
    showConsultationReviewModal(consultation);
  } catch (error) {
    console.error("Error fetching consultation for review:", error);
    window.tutorAPI.handleError(error);
  }
}

function loadConsultationSchedule() {
  if (
    window.tutorDashboard &&
    typeof window.tutorDashboard.loadConsultationSchedule === "function"
  ) {
    window.tutorDashboard.loadConsultationSchedule();
  }
}

function downloadSchedule(schedule) {
  const blob = new Blob([schedule.content], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lich_tu_van_${new Date().toISOString().split("T")[0]}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Payment Processing functions
async function addPayment() {
  // This function is now handled by the TutorDashboard class
  console.log("Payment processing handled by TutorDashboard");
}

async function updatePaymentStatus(paymentId, status) {
  try {
    await window.tutorAPI.updatePaymentStatus(paymentId, status);
    showNotification("Trạng thái thanh toán đã được cập nhật!", "success");
    loadPayments();
    updatePaymentSummary();
  } catch (error) {
    console.error("Error updating payment status:", error);
    window.tutorAPI.handleError(error);
  }
}

async function viewPaymentDetails(paymentId) {
  try {
    const payment = await window.tutorAPI.getPaymentById(paymentId);
    showPaymentDetailsModal(payment);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    window.tutorAPI.handleError(error);
  }
}

async function editPayment(paymentId) {
  try {
    const payment = await window.tutorAPI.getPaymentById(paymentId);
    showEditPaymentModal(payment);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    window.tutorAPI.handleError(error);
  }
}

async function printReceipt(paymentId) {
  try {
    const receipt = await window.tutorAPI.generateReceipt(paymentId);
    showReceiptModal(receipt);
  } catch (error) {
    console.error("Error generating receipt:", error);
    window.tutorAPI.handleError(error);
  }
}

// Removed syncWithFinanceSystem, exportPaymentReport, viewFinanceSystem,
// updatePaymentSummary, and updateVerificationStatus functions as they are no longer needed

function downloadReport(report) {
  const blob = new Blob([report.content], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `payment_report_${new Date().toISOString().split("T")[0]}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Message functions
async function sendMessage(studentId, message) {
  try {
    await window.tutorAPI.sendMessage(studentId, message);
    loadMessages();
  } catch (error) {
    console.error("Error sending message:", error);
    window.tutorAPI.handleError(error);
  }
}

async function getQuickResponse(type) {
  try {
    const response = await window.tutorAPI.getQuickResponse(type);
    return response;
  } catch (error) {
    console.error("Error getting quick response:", error);
    return null;
  }
}

// Modal functions
function showStudentDetailsModal(student) {
  const modal = document.createElement("div");
  modal.className = "modal";
  
  // Map dữ liệu từ DTO backend
  const studentName = student.hoTen || student.name || "N/A";
  const className = student.className || student.class || "Chưa có lớp";
  const email = student.email || "N/A";
  const phone = student.sdt || student.phone || "N/A";
  const address = student.diaChi || student.address || "N/A";
  const gender = student.gioiTinh ? (student.gioiTinh === true ? "Nam" : "Nữ") : "N/A";
  const status = student.trangThai || student.status || "N/A";
  const note = student.ghiChu || student.notes || "Chưa có ghi chú";
  const studentId = student.idHs || student.id || "";
  
  modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chi tiết học sinh</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="student-details">
                        <h4>${studentName}</h4>
                        <div class="detail-section">
                            <h5>Thông tin liên hệ</h5>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Số điện thoại:</strong> ${phone}</p>
                            <p><strong>Địa chỉ:</strong> ${address}</p>
                            <p><strong>Giới tính:</strong> ${gender}</p>
                        </div>
                        <div class="detail-section">
                            <h5>Thông tin học tập</h5>
                            <p><strong>Lớp:</strong> ${className}</p>
                            <p><strong>Trạng thái phân công:</strong> ${status}</p>
                            <p><strong>Ghi chú:</strong> ${note}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Đóng</button>
                    ${studentId ? `<button class="btn btn-primary" onclick="addNote('${studentId}')">Thêm ghi chú</button>` : ''}
                </div>
            </div>
        `;
  document.body.appendChild(modal);
  modal.style.display = "block";
  
  // Đóng modal khi click bên ngoài
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function showReportModal(report) {
  const modal = document.createElement("div");
  modal.className = "modal";
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
  modal.style.display = "block";
}

function closeModal() {
  const modal = document.querySelector(".modal");
  if (modal) {
    modal.remove();
  }
}

function printReport() {
  window.print();
}

// Notification function
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Add styles if not already present
  if (!document.getElementById("notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
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
    notification.style.animation = "slideIn 0.3s ease-out reverse";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

function exportStudentList() {
  // Create CSV content
  const csvContent =
    "Học sinh,Lớp/Chương trình,Tiến độ,Điểm TB,Trạng thái,Ghi chú\n" +
    "Trần Văn C,Toán 10A1 • Cambridge IGCSE,75%,8.5,Tốt,Học tập tích cực\n" +
    "Lê Thị D,Toán 11B2 • IB Math HL,45%,6.2,Cần hỗ trợ,Cần hỗ trợ thêm\n" +
    "Phạm Văn E,Toán 12C1 • AP Calculus,30%,4.8,Nguy cơ thấp điểm,Cần can thiệp";

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "danh_sach_hoc_sinh.csv";
  a.click();
  window.URL.revokeObjectURL(url);
}

function showAddConsultationModal() {
  const modal = document.createElement("div");
  modal.className = "modal";
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
  modal.style.display = "block";
}

function showPaymentDetailsModal(payment) {
  const modal = document.createElement("div");
  modal.className = "modal";
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
                            <strong>Ngày/Giờ:</strong> ${payment.date} ${
    payment.time
  }
                        </div>
                        <div class="detail-row">
                            <strong>Số biên lai:</strong> ${
                              payment.receiptNumber
                            }
                        </div>
                        <div class="detail-row">
                            <strong>Trạng thái:</strong> ${payment.status}
                        </div>
                        <div class="detail-row">
                            <strong>Ghi chú:</strong> ${
                              payment.notes || "Không có ghi chú"
                            }
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Đóng</button>
                    <button class="btn btn-primary" onclick="printReceipt('${
                      payment.id
                    }')">In biên lai</button>
                </div>
            </div>
        `;
  document.body.appendChild(modal);
  modal.style.display = "block";
}

function showEditPaymentModal(payment) {
  const modal = document.createElement("div");
  modal.className = "modal";
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
                            <input type="number" class="form-control" id="editAmount" value="${
                              payment.amount
                            }" required>
                        </div>
                        <div class="form-group">
                            <label for="editPaymentType">Loại thanh toán</label>
                            <select class="form-select" id="editPaymentType" required>
                                <option value="tuition" ${
                                  payment.type === "tuition" ? "selected" : ""
                                }>Học phí tháng</option>
                                <option value="registration" ${
                                  payment.type === "registration"
                                    ? "selected"
                                    : ""
                                }>Phí đăng ký</option>
                                <option value="exam" ${
                                  payment.type === "exam" ? "selected" : ""
                                }>Phí thi</option>
                                <option value="material" ${
                                  payment.type === "material" ? "selected" : ""
                                }>Phí tài liệu</option>
                                <option value="other" ${
                                  payment.type === "other" ? "selected" : ""
                                }>Khác</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editNotes">Ghi chú</label>
                            <textarea class="form-control" id="editNotes" rows="3">${
                              payment.notes || ""
                            }</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Hủy</button>
                    <button class="btn btn-primary" onclick="savePaymentEdit('${
                      payment.id
                    }')">Lưu thay đổi</button>
                </div>
            </div>
        `;
  document.body.appendChild(modal);
  modal.style.display = "block";
}

function showReceiptModal(receipt) {
  const modal = document.createElement("div");
  modal.className = "modal";
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
                                <span>${receipt.notes || "Không có"}</span>
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
  modal.style.display = "block";
}

async function savePaymentEdit(paymentId) {
  const form = document.getElementById("editPaymentForm");
  if (form) {
    const formData = new FormData(form);
    try {
      await window.tutorAPI.updatePayment(paymentId, formData);
      showNotification("Giao dịch đã được cập nhật thành công!", "success");
      closeModal();
      loadPayments();
      updatePaymentSummary();
    } catch (error) {
      console.error("Error updating payment:", error);
      window.tutorAPI.handleError(error);
    }
  }
}

function printReceiptContent() {
  window.print();
}

function showConsultationDetailsModal(consultation) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chi tiết buổi tư vấn</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="consultation-details">
                        <div class="detail-row">
                            <strong>Học sinh:</strong> ${
                              consultation.studentName
                            }
                        </div>
                        <div class="detail-row">
                            <strong>Lớp:</strong> ${consultation.class}
                        </div>
                        <div class="detail-row">
                            <strong>Chương trình:</strong> ${
                              consultation.program
                            }
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
                            <strong>Nội dung:</strong> ${
                              consultation.content || "Chưa có nội dung"
                            }
                        </div>
                        <div class="detail-row">
                            <strong>Ghi chú:</strong> ${
                              consultation.notes || "Không có ghi chú"
                            }
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Đóng</button>
                    <button class="btn btn-primary" onclick="editConsultationContent('${
                      consultation.id
                    }')">Cập nhật nội dung</button>
                </div>
            </div>
        `;
  document.body.appendChild(modal);
  modal.style.display = "block";
}

function showConsultationReviewModal(consultation) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Đánh giá buổi tư vấn</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="consultation-review">
                        <h4>${consultation.studentName} - ${
    consultation.type
  }</h4>
                        <p><strong>Thời gian:</strong> ${consultation.time}</p>
                        <p><strong>Nội dung đã tư vấn:</strong></p>
                        <div class="review-content">
                            ${consultation.content || "Chưa có nội dung"}
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
                    <button class="btn btn-primary" onclick="saveConsultationReview('${
                      consultation.id
                    }')">Lưu đánh giá</button>
                </div>
            </div>
        `;
  document.body.appendChild(modal);
  modal.style.display = "block";
}

async function editConsultationContent(consultationId) {
  const content = prompt("Nhập nội dung tư vấn mới:");
  if (content) {
    try {
      await window.tutorAPI.updateConsultationContent(consultationId, content);
      showNotification("Nội dung tư vấn đã được cập nhật!", "success");
      closeModal();
      loadConsultationSchedule();
    } catch (error) {
      console.error("Error updating consultation content:", error);
      window.tutorAPI.handleError(error);
    }
  }
}

async function saveConsultationReview(consultationId) {
  const rating = document.getElementById("reviewRating").value;
  const notes = document.getElementById("reviewNotes").value;
  const followUpRequired = document.getElementById("followUpRequired").value;

  if (!rating) {
    showNotification("Vui lòng chọn mức độ hài lòng!", "error");
    return;
  }

  try {
    await window.tutorAPI.saveConsultationReview(consultationId, {
      rating,
      notes,
      followUpRequired,
    });
    showNotification("Đánh giá đã được lưu thành công!", "success");
    closeModal();
    loadConsultationSchedule();
  } catch (error) {
    console.error("Error saving consultation review:", error);
    window.tutorAPI.handleError(error);
  }
}

// Initialize the dashboard when DOM is loaded
let tutorDashboardInstance;

function bootstrapTutorDashboard() {
  if (tutorDashboardInstance) {
    return tutorDashboardInstance;
  }

  tutorDashboardInstance = new TutorDashboard();
  window.tutorDashboard = tutorDashboardInstance;
  return tutorDashboardInstance;
}

document.addEventListener("DOMContentLoaded", () => {
  const startDashboard = () => {
    try {
      bootstrapTutorDashboard();
    } catch (error) {
      console.error("Failed to initialize TutorDashboard:", error);
    }
  };

  const sectionsReady = window.tutorSectionsReady;
  if (sectionsReady && typeof sectionsReady.then === "function") {
    sectionsReady.then(startDashboard).catch((error) => {
      console.error("Tutor sections failed to load:", error);
      startDashboard();
    });
  } else {
    startDashboard();
  }
});

// Export for potential module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = TutorDashboard;
}
