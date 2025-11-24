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
    async loadData() {
      this.updateWelcome();
      await this.loadStats();
      await this.loadRecentStudents();
      await this.loadRecentSupportRequests();
      await this.loadUpcomingConsultations();
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

        // Load today's consultations - load multiple weeks to ensure we get all today's consultations
        let todayConsultations = 0;
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const allTodayItems = [];

          // Load consultations for current week and previous week (in case today is early in the week)
          for (let weekOffset = -1; weekOffset < 2; weekOffset++) {
            const weekStart = getStartOfWeek(new Date());
            weekStart.setDate(weekStart.getDate() + (weekOffset * 7));
            weekStart.setHours(0, 0, 0, 0);
            const weekStartStr = weekStart.toISOString().split('T')[0];
            
            try {
              const scheduleResponse = await window.tutorAPI.getWeeklySchedule({
                startDate: weekStartStr
              });
              
              if (scheduleResponse && scheduleResponse.items) {
                const weekTodayItems = scheduleResponse.items.filter(item => {
                  if (!item.startTime) return false;
                  try {
                    const itemDate = new Date(item.startTime);
                    if (isNaN(itemDate.getTime())) return false;
                    const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
                    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    return itemDateOnly.getTime() === todayOnly.getTime();
                  } catch (e) {
                    return false;
                  }
                });
                allTodayItems.push(...weekTodayItems);
              }
            } catch (error) {
              console.error(`[Dashboard] Error loading week ${weekOffset} for today count:`, error);
            }
          }

          // Remove duplicates based on item ID or startTime
          const uniqueTodayItems = [];
          const seen = new Set();
          allTodayItems.forEach(item => {
            const key = item.id || item.startTime;
            if (key && !seen.has(key)) {
              seen.add(key);
              uniqueTodayItems.push(item);
            }
          });

          todayConsultations = uniqueTodayItems.length;
          console.log('[Dashboard] Today consultations count:', todayConsultations, 'items:', uniqueTodayItems);
        } catch (error) {
          console.error('[Dashboard] Error loading today consultations:', error);
        }

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

    async loadUpcomingConsultations() {
      const container = document.getElementById("dashboardUpcomingConsultations");
      if (!container) return;

      try {
        console.log('[Dashboard] Loading upcoming consultations...');
        const now = new Date();
        const allConsultations = [];

        // Load consultations for current week and next 3 weeks
        for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
          const weekStart = getStartOfWeek(new Date());
          weekStart.setDate(weekStart.getDate() + (weekOffset * 7));
          const weekStartStr = weekStart.toISOString().split('T')[0];

          try {
            console.log(`[Dashboard] Loading week ${weekOffset + 1}, startDate: ${weekStartStr}`);
            const scheduleResponse = await window.tutorAPI.getWeeklySchedule({
              startDate: weekStartStr
            });

            console.log(`[Dashboard] Week ${weekOffset + 1} response:`, scheduleResponse);

            if (scheduleResponse && scheduleResponse.items && scheduleResponse.items.length > 0) {
              allConsultations.push(...scheduleResponse.items);
              console.log(`[Dashboard] Added ${scheduleResponse.items.length} items from week ${weekOffset + 1}`);
            }
          } catch (error) {
            console.error(`[Dashboard] Error loading week ${weekOffset + 1}:`, error);
          }
        }

        console.log(`[Dashboard] Total consultations loaded: ${allConsultations.length}`);

        if (allConsultations.length === 0) {
          container.innerHTML = '<p class="empty-message">Không có lịch tư vấn sắp tới</p>';
          return;
        }

        // Filter upcoming consultations (from now onwards) and sort by time
        const upcomingConsultations = allConsultations
          .filter(item => {
            if (!item.startTime) {
              console.log('[Dashboard] Item missing startTime:', item);
              return false;
            }
            try {
              const itemDate = new Date(item.startTime);
              if (isNaN(itemDate.getTime())) {
                console.log('[Dashboard] Invalid date:', item.startTime);
                return false;
              }
              const isUpcoming = itemDate >= now;
              if (!isUpcoming) {
                console.log(`[Dashboard] Item is in the past: ${item.startTime}, now: ${now}`);
              }
              return isUpcoming;
            } catch (e) {
              console.error('[Dashboard] Error parsing date:', e, item);
              return false;
            }
          })
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
          .slice(0, 10); // Show up to 10 upcoming consultations

        console.log(`[Dashboard] Upcoming consultations after filter: ${upcomingConsultations.length}`);

        if (upcomingConsultations.length === 0) {
          container.innerHTML = '<p class="empty-message">Không có lịch tư vấn sắp tới</p>';
          return;
        }

        console.log('[Dashboard] Rendering consultations:', upcomingConsultations);
        container.innerHTML = upcomingConsultations
          .map((consultation) => {
            try {
              const startDate = new Date(consultation.startTime);
              const endDate = consultation.endTime ? new Date(consultation.endTime) : null;
              const timeStr = startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
              const endTimeStr = endDate ? endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
              
              // Format date - use same logic as counting today's consultations
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const itemDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
              const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              
              let dateStr = '';
              if (itemDateOnly.getTime() === todayOnly.getTime()) {
                dateStr = 'Hôm nay';
              } else {
                const tomorrow = new Date(todayOnly);
                tomorrow.setDate(tomorrow.getDate() + 1);
                if (itemDateOnly.getTime() === tomorrow.getTime()) {
                  dateStr = 'Ngày mai';
                } else {
                  dateStr = startDate.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' });
                }
              }

              const title = this.escapeHtml(consultation.title || consultation.studentName || 'Tư vấn');
              const studentName = this.escapeHtml(consultation.studentName || 'Học viên');
              const location = consultation.location ? this.escapeHtml(consultation.location) : '';
              
              // Determine status badge
              const status = consultation.status || 'Chưa xử lý';
              let statusClass = 'status-pending';
              let statusIcon = 'fa-clock';
              const statusLower = status.toLowerCase();
              if (statusLower.includes('đã') || statusLower.includes('hoàn') || statusLower.includes('xong')) {
                statusClass = 'status-completed';
                statusIcon = 'fa-check-circle';
              } else if (statusLower.includes('đang')) {
                statusClass = 'status-active';
                statusIcon = 'fa-spinner';
              } else if (statusLower.includes('hủy') || statusLower.includes('cancel')) {
                statusClass = 'status-cancelled';
                statusIcon = 'fa-times-circle';
              }
              const statusText = this.escapeHtml(status);

              return `
                <div class="consultation-item" onclick="tutorDashboard.switchSection('consultation-schedule')">
                  <div class="consultation-time">
                    <div class="consultation-time-main">${timeStr}${endTimeStr ? ` - ${endTimeStr}` : ''}</div>
                    <div class="consultation-date">${dateStr}</div>
                  </div>
                  <div class="consultation-info">
                    <div class="consultation-title">${title}</div>
                    <div class="consultation-student">
                      <i class="fas fa-user-graduate"></i> ${studentName}
                    </div>
                    ${location ? `
                      <div class="consultation-location">
                        <i class="fas fa-map-marker-alt"></i> ${location}
                      </div>
                    ` : ''}
                  </div>
                  <div class="consultation-status">
                    <span class="status-badge ${consultation.online ? 'online' : 'onsite'}">
                      <i class="fas ${consultation.online ? 'fa-laptop' : 'fa-building'}"></i>
                      ${consultation.online ? 'Online' : 'Trực tiếp'}
                    </span>
                    <span class="status-badge ${statusClass}">
                      <i class="fas ${statusIcon}"></i>
                      ${statusText}
                    </span>
                  </div>
                </div>
              `;
            } catch (e) {
              console.error('[Dashboard] Error rendering consultation:', e, consultation);
              return '';
            }
          })
          .filter(html => html !== '')
          .join("");

        console.log('[Dashboard] Successfully rendered consultations');

      } catch (error) {
        console.error("[Dashboard] Error loading upcoming consultations:", error);
        container.innerHTML = '<p class="empty-message">Không thể tải lịch tư vấn. Vui lòng thử lại sau.</p>';
      }
    },

    escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  // Expose to window
  window.dashboardModule = DashboardModule;


  // Auto-initialize when section is loaded
  if (document.getElementById("dashboard")) {
    DashboardModule.loadData();
  }
})();

