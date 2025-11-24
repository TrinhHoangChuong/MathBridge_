// Consultation Schedule Section Module
(function() {
  'use strict';

  // Helper functions
  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setHours(0, 0, 0, 0);
    return new Date(d.setDate(diff));
  }

  function getWeekEndDate(startDate) {
    const end = new Date(startDate);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  function formatDateISO(date) {
    // Format date without timezone conversion to avoid date shifting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDisplayDate(date) {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function formatTimeRange(start, end) {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date(startDate.getTime() + 60 * 60000);
    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
  }

  function isSameDate(first, second) {
    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    );
  }

  function getVietnameseDayName(index) {
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

  function getConsultationSlotConfig() {
    return [
      { id: "morning", label: "(07:00 - 09:00)", start: 7, end: 9 },
      { id: "midday", label: "(09:00 - 11:00)", start: 9, end: 11 },
      { id: "afternoon", label: "(13:00 - 15:00)", start: 13, end: 15 },
      { id: "evening", label: "(15:00 - 17:00)", start: 15, end: 17 },
    ];
  }

  function getSlotIdForDate(date, slotConfig) {
    const hour = date.getHours() + date.getMinutes() / 60;
    const fallback = slotConfig[slotConfig.length - 1].id;

    for (const slot of slotConfig) {
      if (hour >= slot.start && hour < slot.end) {
        return slot.id;
      }
    }
    return fallback;
  }

  // Consultation Schedule Module
  const ConsultationScheduleModule = {
    consultationControlsReady: false,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    allConsultationData: [], // Store all consultations for month view

    // Initialize current month/year from today
    init() {
      const today = new Date();
      this.currentMonth = today.getMonth();
      this.currentYear = today.getFullYear();
      console.log('[init] Initialized with month:', this.currentMonth, 'year:', this.currentYear);
    },

    async loadData() {
      console.log('[loadData] Starting loadData...');
      const calendarGrid = document.getElementById("consultationCalendarGrid");
      console.log('[loadData] Calendar grid found:', !!calendarGrid);
      
      if (!calendarGrid) {
        console.log('[loadData] Calendar grid not found, retrying...');
        setTimeout(() => this.loadData(), 300);
        return;
      }

      // Always render calendar first (even with empty data)
      console.log('[loadData] Rendering calendar...');
      this.updateCalendar();
      
      // Then load data
      console.log('[loadData] Loading consultations...');
      await this.loadAllConsultations();
      console.log('[loadData] Load complete');
    },

    setupControls() {
      // No controls needed for month-only view
      this.consultationControlsReady = true;
    },

    async loadAllConsultations() {
      try {
        console.log('[loadAllConsultations] Loading consultations for month:', this.currentMonth + 1, this.currentYear);
        
        // Load consultations for current month by loading all weeks in the month
        // Create dates in local timezone to avoid timezone issues
        const monthStart = new Date(this.currentYear, this.currentMonth, 1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(this.currentYear, this.currentMonth + 1, 0); // Last day of month
        monthEnd.setHours(23, 59, 59, 999);

        console.log('[loadAllConsultations] Month range:', formatDateISO(monthStart), 'to', formatDateISO(monthEnd));
        console.log('[loadAllConsultations] Month start:', monthStart.toISOString());
        console.log('[loadAllConsultations] Month end:', monthEnd.toISOString());

        // Get all weeks in the month
        const allConsultations = [];
        let currentWeekStart = getStartOfWeek(new Date(monthStart));
        const monthEndDate = new Date(monthEnd);
        
        while (currentWeekStart <= monthEndDate) {
          try {
            const response = await window.tutorAPI.getWeeklySchedule({
              startDate: formatDateISO(currentWeekStart),
            });
            
            const items = response?.items || [];
            console.log(`[loadAllConsultations] Week ${formatDateISO(currentWeekStart)}: ${items.length} items`);
            
            // Add items that are within the month
            items.forEach(item => {
              if (item.startTime) {
                try {
                  const itemDate = new Date(item.startTime);
                  if (!isNaN(itemDate.getTime())) {
                    // Normalize dates for comparison (set time to 00:00:00)
                    const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
                    const monthStartOnly = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate());
                    const monthEndOnly = new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate());
                    
                    // Check if item is within the month using date comparison
                    const isInMonth = itemDateOnly >= monthStartOnly && itemDateOnly <= monthEndOnly;
                    
                    if (isInMonth) {
                      allConsultations.push(item);
                      console.log('[loadAllConsultations] ✓ Added consultation:', item.id, 
                                  'date:', formatDateISO(itemDateOnly),
                                  'startTime:', item.startTime);
                    } else {
                      console.log('[loadAllConsultations] ✗ Skipped consultation:', item.id, 
                                  'itemDate:', formatDateISO(itemDateOnly),
                                  'monthStart:', formatDateISO(monthStartOnly), 
                                  'monthEnd:', formatDateISO(monthEndOnly),
                                  'comparison:', itemDateOnly.getTime(), 'vs', monthStartOnly.getTime(), '-', monthEndOnly.getTime());
                    }
                  }
                } catch (e) {
                  console.warn('[loadAllConsultations] Error parsing startTime:', item.startTime, e);
                }
              } else {
                console.warn('[loadAllConsultations] Item missing startTime:', item.id);
              }
            });
          } catch (error) {
            console.warn("[loadAllConsultations] Error loading week:", currentWeekStart, error);
          }
          
          // Move to next week
          currentWeekStart = new Date(currentWeekStart);
          currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }

        // Store all consultations
        this.allConsultationData = allConsultations;
        console.log('[loadAllConsultations] Total consultations loaded:', allConsultations.length);
        
        // Update calendar
        this.updateCalendar();
      } catch (error) {
        console.error("[loadAllConsultations] Error loading all consultations:", error);
        this.allConsultationData = [];
        this.updateCalendar();
      }
    },



    addSchedule() {
      if (typeof showAddConsultationModal === 'function') {
        showAddConsultationModal();
      } else if (typeof window.showAddConsultationModal === 'function') {
        window.showAddConsultationModal();
      } else {
        console.error('showAddConsultationModal function not found');
      }
    },

    // Month view functions
    changeMonth(delta) {
      this.currentMonth += delta;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.loadAllConsultations();
      this.updateCalendar();
    },


    updateCalendar() {
      console.log('[updateCalendar] Starting calendar update...');
      const calendarGrid = document.getElementById('consultationCalendarGrid');
      if (!calendarGrid) {
        console.error('[updateCalendar] Element consultationCalendarGrid not found!');
        return;
      }
      console.log('[updateCalendar] Calendar grid found, proceeding...');

      // Update month display
      const currentMonthElement = document.getElementById('consultationCurrentMonth');
      const currentMonthDisplay = document.getElementById('consultationCurrentMonthDisplay');
      const currentYearDisplay = document.getElementById('consultationCurrentYearDisplay');

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

      // Count consultations per day
      const dateConsultationCount = new Map();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Ensure allConsultationData is an array
      const consultationData = Array.isArray(this.allConsultationData) ? this.allConsultationData : [];
      console.log('[updateCalendar] Processing', consultationData.length, 'consultations');

      consultationData.forEach(item => {
        if (item.startTime) {
          try {
            const date = new Date(item.startTime);
            if (!isNaN(date.getTime())) {
              // Create date key from the date part only (ignore time)
              const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              const currentCount = dateConsultationCount.get(dateKey) || 0;
              dateConsultationCount.set(dateKey, currentCount + 1);
              console.log('[updateCalendar] Found consultation on', dateKey, 'total:', currentCount + 1);
            }
          } catch (e) {
            console.warn('[updateCalendar] Error parsing date:', item.startTime, e);
          }
        } else {
          console.warn('[updateCalendar] Item missing startTime:', item);
        }
      });
      
      console.log('[updateCalendar] Total unique days with consultations:', dateConsultationCount.size);

      // Calculate total consultations in month
      let monthTotalConsultations = 0;
      dateConsultationCount.forEach(count => {
        monthTotalConsultations += count;
      });
      const monthCountEl = document.getElementById('consultationMonthCount');
      if (monthCountEl) {
        monthCountEl.textContent = monthTotalConsultations;
      }

      // Count consultations today
      const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const todayCount = dateConsultationCount.get(todayKey) || 0;
      const todayCountEl = document.getElementById('consultationTodayCount');
      if (todayCountEl) {
        todayCountEl.textContent = todayCount;
      }

      // Create calendar grid
      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

      let calendarHTML = '<div class="calendar-weekdays">';
      dayNames.forEach(day => {
        calendarHTML += `<div class="calendar-weekday">${day}</div>`;
      });
      calendarHTML += '</div><div class="calendar-days">';

      // Add empty cells for days before month starts
      for (let i = 0; i < startingDayOfWeek; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
      }

      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(this.currentYear, this.currentMonth, day);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const consultationCount = dateConsultationCount.get(dateKey) || 0;

        let dayClass = 'calendar-day';
        let dayBadge = '';

        const isToday = date.getTime() === today.getTime();
        if (isToday) {
          dayClass += ' today';
        }

        if (consultationCount > 0) {
          let badgeClass = 'day-badge';
          if (consultationCount >= 3) {
            badgeClass += ' badge-many';
          } else if (consultationCount === 2) {
            badgeClass += ' badge-medium';
          } else {
            badgeClass += ' badge-few';
          }
          dayBadge = `<div class="${badgeClass}">${consultationCount} tư vấn</div>`;
        }

        if (date < today && consultationCount === 0) {
          dayClass += ' past';
        }

        calendarHTML += `
          <div class="${dayClass}" data-date="${dateKey}" onclick="window.consultationScheduleModule && window.consultationScheduleModule.showDaySchedule('${dateKey}')">
            <span class="day-number">${day}</span>
            ${dayBadge}
          </div>
        `;
      }

      calendarHTML += '</div>';
      console.log('[updateCalendar] Generated calendar HTML, length:', calendarHTML.length);
      calendarGrid.innerHTML = calendarHTML;
      console.log('[updateCalendar] Calendar rendered successfully');
    },

    getConsultationsForDate(dateKey) {
      const consultationData = Array.isArray(this.allConsultationData) ? this.allConsultationData : [];
      return consultationData.filter(item => {
        if (!item.startTime) return false;
        try {
          const date = new Date(item.startTime);
          if (isNaN(date.getTime())) return false;
          const itemDateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          return itemDateKey === dateKey;
        } catch (e) {
          return false;
        }
      });
    },

    showDaySchedule(dateKey) {
      const modal = document.getElementById('consultationScheduleModal');
      const modalTitle = document.getElementById('consultationModalDateTitle');
      const modalBody = document.getElementById('consultationScheduleModalBody');

      if (!modal || !modalTitle || !modalBody) return;

      const date = new Date(dateKey + 'T00:00:00');
      const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = dayNames[date.getDay()];
      const dateStr = `${dayName}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

      const consultations = this.getConsultationsForDate(dateKey);

      modalTitle.textContent = `${dateStr} (${consultations.length} Buổi Tư Vấn)`;

      if (consultations.length > 0) {
        const sortedConsultations = consultations.sort((a, b) => {
          const timeA = a.startTime || '00:00';
          const timeB = b.startTime || '00:00';
          return timeA.localeCompare(timeB);
        });

        modalBody.innerHTML = sortedConsultations.map((item, index) => {
          const startTime = item.startTime ? formatTime(new Date(item.startTime)) : 'N/A';
          const endTime = item.endTime ? formatTime(new Date(item.endTime)) : 'N/A';
          const title = item.title || 'Tư vấn cá nhân';
          const student = item.studentName || 'Học viên';
          const location = item.location || 'Trung tâm MathBridge';
          const channel = item.channel || 'Chưa xác định';
          const status = item.status || 'Đang chờ';
          const online = item.online ? 'LMS' : 'Trực tiếp';
          
          // Determine status badge class
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

          return `
            <div class="schedule-modal-item ${online ? 'online' : 'onsite'}">
              <div class="schedule-modal-time">
                <div class="time-display">${startTime}</div>
                <div class="time-end">${endTime}</div>
              </div>
              <div class="schedule-modal-content">
                <div class="consultation-header">
                  <h4>${this.escapeHtml(title)}</h4>
                  <div class="consultation-badges">
                    <span class="badge ${online ? 'badge-online' : 'badge-onsite'}">
                      <i class="fas ${online ? 'fa-laptop' : 'fa-building'}"></i>
                      ${online}
                    </span>
                    <span class="badge status-badge ${statusClass}">
                      <i class="fas ${statusIcon}"></i>
                      ${this.escapeHtml(status)}
                    </span>
                  </div>
                </div>
                <div class="consultation-details">
                  <div class="detail-row">
                    <div class="detail-item">
                      <i class="fas fa-user-graduate"></i>
                      <div class="detail-content">
                        <span class="detail-label">Học viên</span>
                        <span class="detail-value">${this.escapeHtml(student)}</span>
                      </div>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-clock"></i>
                      <div class="detail-content">
                        <span class="detail-label">Thời gian</span>
                        <span class="detail-value">${startTime} → ${endTime}</span>
                      </div>
                    </div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-item">
                      <i class="fas fa-location-dot"></i>
                      <div class="detail-content">
                        <span class="detail-label">Địa điểm</span>
                        <span class="detail-value">${this.escapeHtml(location)}</span>
                      </div>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-headset"></i>
                      <div class="detail-content">
                        <span class="detail-label">Kênh</span>
                        <span class="detail-value">${this.escapeHtml(channel)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        modalBody.innerHTML = '<div class="empty-state">Không có buổi tư vấn trong ngày này</div>';
      }

      modal.style.display = 'flex';
    },

    closeScheduleModal() {
      const modal = document.getElementById('consultationScheduleModal');
      if (modal) {
        modal.style.display = 'none';
      }
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  // Expose to window
  window.consultationScheduleModule = ConsultationScheduleModule;

  // Auto-initialize when section is loaded
  function initializeModule() {
    console.log('[initializeModule] Checking for consultation-schedule section...');
    const section = document.getElementById("consultation-schedule");
    if (section) {
      console.log('[initializeModule] Section found, checking elements...');
      // Check if calendar grid exists
      const calendarGrid = document.getElementById("consultationCalendarGrid");
      const weekGrid = document.getElementById("consultationWeekGrid");
      
      if (calendarGrid || weekGrid) {
        console.log('[initializeModule] Calendar elements found, initializing module...');
        ConsultationScheduleModule.init();
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          ConsultationScheduleModule.loadData();
        }, 50);
        return true;
      } else {
        console.log('[initializeModule] Calendar elements not found yet, retrying...');
        setTimeout(initializeModule, 200);
        return false;
      }
    } else {
      console.log('[initializeModule] Section not found, retrying...');
      setTimeout(initializeModule, 200);
      return false;
    }
  }

  // Try to initialize immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeModule, 100);
    });
  } else {
    setTimeout(initializeModule, 100);
  }

  // Listen for tutor sections loaded event
  document.addEventListener('tutor-sections:loaded', () => {
    console.log('[tutor-sections:loaded] Event received, initializing consultation schedule...');
    setTimeout(initializeModule, 200);
  });

  // Also listen for section visibility changes
  const observer = new MutationObserver((mutations) => {
    const section = document.getElementById("consultation-schedule");
    if (section) {
      const calendarGrid = document.getElementById("consultationCalendarGrid");
      // If section exists but calendar is empty, initialize
      if (calendarGrid && calendarGrid.innerHTML.trim() === '' && calendarGrid.offsetParent !== null) {
        console.log('[MutationObserver] Section visible but calendar empty, initializing...');
        initializeModule();
      }
    }
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  // Also listen for section switch events
  if (window.tutorDashboard) {
    const originalSwitchSection = window.tutorDashboard.switchSection;
    if (originalSwitchSection) {
      window.tutorDashboard.switchSection = function(sectionId) {
        const result = originalSwitchSection.call(this, sectionId);
        if (sectionId === 'consultation-schedule') {
          setTimeout(() => {
            console.log('[switchSection] Consultation schedule section switched, initializing...');
            initializeModule();
          }, 300);
        }
        return result;
      };
    }
  }
})();

