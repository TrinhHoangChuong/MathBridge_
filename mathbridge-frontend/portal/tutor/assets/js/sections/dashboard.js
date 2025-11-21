// Dashboard Section Module
(function() {
  'use strict';

  // Helper functions
  function getInitials(name) {
    if (!name) return "CV";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    } else {
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
  }

  function getTimeAgo(dateTime) {
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

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  // Dashboard Module
  const DashboardModule = {
    dashboardWeekStart: null,

    async loadData() {
      this.updateWelcome();
      await this.loadStats();
      await this.loadRecentStudents();
      await this.loadRecentSupportRequests();
      await this.loadWeeklySchedule();
      await this.loadRecentActivity();
    },

    updateWelcome() {
      const welcomeNameEl = document.getElementById("tutorWelcomeName");
      const currentDateEl = document.getElementById("dashboardCurrentDate");
      
      if (welcomeNameEl && window.tutorDashboard && window.tutorDashboard.tutorInfo) {
        const name = window.tutorDashboard.tutorInfo.name || "Cố vấn";
        const nameParts = name.trim().split(/\s+/);
        const lastName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : name;
        welcomeNameEl.textContent = lastName;
      }
      
      if (currentDateEl) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.textContent = now.toLocaleDateString('vi-VN', options);
      }
    },

    async loadStats() {
      try {
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
          this.updateStats({ assignedStudents: 0, todayConsultations: 0, openSupport: 0, pendingPayments: 0 });
          return;
        }

        const [assignedCount, supportRequests, unpaidInvoices] = await Promise.all([
          window.tutorAPI.getAssignedStudentsCount(idNv).catch(() => 0),
          window.tutorAPI.getOpenSupportRequests().catch(() => []),
          window.tutorAPI.getUnpaidInvoices().catch(() => [])
        ]);

        const todayConsultations = 0; // TODO: Add API endpoint

        this.updateStats({
          assignedStudents: assignedCount || 0,
          todayConsultations: todayConsultations,
          openSupport: supportRequests?.length || 0,
          pendingPayments: unpaidInvoices?.length || 0
        });

      } catch (error) {
        console.error("Error loading dashboard stats:", error);
        this.updateStats({ assignedStudents: 0, todayConsultations: 0, openSupport: 0, pendingPayments: 0 });
      }
    },

    updateStats(stats) {
      const assignedEl = document.getElementById("statAssignedStudents");
      const consultationsEl = document.getElementById("statTodayConsultations");
      const supportEl = document.getElementById("statOpenSupport");
      const paymentsEl = document.getElementById("statPendingPayments");

      if (assignedEl) assignedEl.textContent = stats.assignedStudents || 0;
      if (consultationsEl) consultationsEl.textContent = stats.todayConsultations || 0;
      if (supportEl) supportEl.textContent = stats.openSupport || 0;
      if (paymentsEl) paymentsEl.textContent = stats.pendingPayments || 0;
    },

    async loadRecentStudents() {
      const container = document.getElementById("dashboardStudentsNeedingSupport");
      if (!container) return;

      try {
        const idNv = window.tutorDashboard?.currentTutorId || 
                    (window.tutorDashboard?.tutorInfo && window.tutorDashboard.tutorInfo.idNv);
        if (!idNv) {
          container.innerHTML = '<p class="empty-message">Chưa có thông tin cố vấn</p>';
          return;
        }

        const students = await window.tutorAPI.getAssignedStudents(idNv, "active");
        
        if (!students || students.length === 0) {
          container.innerHTML = '<p class="empty-message">Chưa có học sinh được phân công</p>';
          return;
        }

        const topStudents = students.slice(0, 5);
        container.innerHTML = topStudents
          .map((student) => {
            const priority = this.determinePriority(student);
            return `
              <div class="student-item" onclick="window.tutorDashboard.viewStudentDetails('${student.idHs}')">
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
    },

    determinePriority(student) {
      if (student.trangThai && student.trangThai.includes("Ket thuc")) {
        return { class: "normal", text: "Đã kết thúc" };
      }
      if (student.trangThai && student.trangThai.includes("Tam dung")) {
        return { class: "high", text: "Tạm dừng" };
      }
      return { class: "success", text: "Đang phụ trách" };
    },

    async loadRecentSupportRequests() {
      const container = document.getElementById("dashboardRecentSupport");
      if (!container) return;

      try {
        const requests = await window.tutorAPI.getOpenSupportRequests();
        
        if (!requests || requests.length === 0) {
          container.innerHTML = '<p class="empty-message">Không có yêu cầu hỗ trợ mở</p>';
          return;
        }

        const topRequests = requests.slice(0, 5);
        container.innerHTML = topRequests
          .map((request) => {
            const statusClass = request.trangThai?.toLowerCase().includes("đang") ? "processing" : "open";
            const timeAgo = getTimeAgo(request.thoiDiemTao);
            return `
              <div class="support-request-item" onclick="window.tutorDashboard.viewSupportDetails('${request.idYc}')">
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
    },

    async loadRecentActivity() {
      const container = document.getElementById("dashboardRecentActivity");
      if (!container) return;

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
    },

    async loadWeeklySchedule() {
      const container = document.getElementById("dashboardWeeklySchedule");
      if (!container) return;

      try {
        const idNv = window.tutorDashboard?.currentTutorId || 
                    (window.tutorDashboard?.tutorInfo && window.tutorDashboard.tutorInfo.idNv);
        if (!idNv) {
          container.innerHTML = '<p class="empty-message">Chưa có thông tin cố vấn</p>';
          return;
        }

        const weekStart = this.dashboardWeekStart || getStartOfWeek(new Date());
        const weekStartStr = weekStart.toISOString().split('T')[0];

        const schedule = await window.tutorAPI.getWeeklySchedule({
          startDate: weekStartStr,
          idNv: idNv
        });

        this.renderWeeklyCalendar(container, weekStart, schedule || []);

      } catch (error) {
        console.error("Error loading weekly schedule:", error);
        container.innerHTML = '<p class="empty-message">Không thể tải lịch làm việc</p>';
      }
    },

    renderWeeklyCalendar(container, weekStart, schedule) {
      const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let html = '<div class="calendar-grid">';
      
      days.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
      });

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);
        const dayNumber = currentDate.getDate();
        const isToday = currentDate.getTime() === today.getTime();
        
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
    },

    navigateWeek(direction) {
      if (!this.dashboardWeekStart) {
        this.dashboardWeekStart = getStartOfWeek(new Date());
      }
      this.dashboardWeekStart.setDate(this.dashboardWeekStart.getDate() + (direction * 7));
      this.loadWeeklySchedule();
      this.updateWeekButton();
    },

    goToCurrentWeek() {
      this.dashboardWeekStart = getStartOfWeek(new Date());
      this.loadWeeklySchedule();
      this.updateWeekButton();
    },

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
  };

  // Expose to window
  window.dashboardModule = DashboardModule;

  // Setup event listeners for week navigation
  document.addEventListener('DOMContentLoaded', () => {
    const prevBtn = document.getElementById("prevWeekBtn");
    const nextBtn = document.getElementById("nextWeekBtn");
    const currentBtn = document.getElementById("currentWeekBtn");

    if (prevBtn) {
      prevBtn.addEventListener('click', () => DashboardModule.navigateWeek(-1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => DashboardModule.navigateWeek(1));
    }
    if (currentBtn) {
      currentBtn.addEventListener('click', () => DashboardModule.goToCurrentWeek());
    }
  });

  // Auto-initialize when section is loaded
  if (document.getElementById("dashboard")) {
    DashboardModule.loadData();
  }
})();

