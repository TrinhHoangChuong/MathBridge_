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
    return date.toISOString().split("T")[0];
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
      { id: "morning", label: "Ca sáng (05:00 - 11:00)", start: 5, end: 11 },
      { id: "midday", label: "Ca 3 (11:00 - 14:00)", start: 11, end: 14 },
      { id: "afternoon", label: "Chiều (14:00 - 17:30)", start: 14, end: 17.5 },
      { id: "evening", label: "Ca 4 (17:30 - 22:00)", start: 17.5, end: 22 },
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
    consultationWeekStart: getStartOfWeek(new Date()),
    consultationWeekData: [],
    consultationSlotConfig: getConsultationSlotConfig(),
    consultationControlsReady: false,

    async loadData() {
      const grid = document.getElementById("consultationWeekGrid");
      if (!grid) {
        setTimeout(() => this.loadData(), 300);
        return;
      }

      this.setupControls();
      this.updateWeekPickerValue();
      this.updateWeekRangeLabel(
        this.consultationWeekStart,
        getWeekEndDate(this.consultationWeekStart)
      );
      await this.loadSchedule();
    },

    setupControls() {
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
          this.consultationWeekStart = getStartOfWeek(new Date());
          this.updateWeekPickerValue();
          this.loadSchedule();
        });
      }

      if (weekPicker) {
        weekPicker.addEventListener("change", (event) => {
          const selected = event.target.value ? new Date(event.target.value) : null;
          if (selected && !isNaN(selected.getTime())) {
            this.consultationWeekStart = getStartOfWeek(selected);
            this.updateWeekPickerValue();
            this.loadSchedule();
          }
        });
      }

      this.consultationControlsReady = true;
    },

    updateWeekPickerValue() {
      const weekPicker = document.getElementById("consultationWeekPicker");
      if (weekPicker) {
        weekPicker.value = formatDateISO(this.consultationWeekStart);
      }
    },

    updateWeekRangeLabel(start, end) {
      const label = document.getElementById("consultationWeekRange");
      if (!label) return;
      label.textContent = `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`;
    },

    navigateWeek(direction) {
      const nextWeek = new Date(this.consultationWeekStart);
      nextWeek.setDate(nextWeek.getDate() + (direction * 7));
      this.consultationWeekStart = getStartOfWeek(nextWeek);
      this.updateWeekPickerValue();
      this.loadSchedule();
    },

    async loadSchedule() {
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
          startDate: formatDateISO(this.consultationWeekStart),
        });

        const weekStart = response?.weekStart
          ? getStartOfWeek(new Date(response.weekStart))
          : this.consultationWeekStart;
        const weekEnd = response?.weekEnd
          ? new Date(response.weekEnd)
          : getWeekEndDate(weekStart);

        this.consultationWeekStart = weekStart;
        this.consultationWeekData = response?.items || [];

        this.render(weekStart, weekEnd, this.consultationWeekData);
        this.updateStats(this.consultationWeekData);
        this.updateWeekPickerValue();
        this.updateWeekRangeLabel(weekStart, weekEnd);
      } catch (error) {
        console.error("Error loading consultation schedule:", error);
        if (errorState) {
          errorState.style.display = "flex";
          const message = errorState.querySelector("p");
          if (message) {
            message.textContent = "Không thể tải lịch tư vấn. Vui lòng thử lại sau.";
          }
        }
        this.updateWeekRangeLabel(
          this.consultationWeekStart,
          getWeekEndDate(this.consultationWeekStart)
        );
      } finally {
        if (loadingState) {
          loadingState.style.display = "none";
        }
      }
    },

    render(weekStart, weekEnd, items = []) {
      const grid = document.getElementById("consultationWeekGrid");
      if (!grid) return;

      grid.innerHTML = "";
      const slotsPerDay = {};

      for (let i = 0; i < 7; i++) {
        const current = new Date(weekStart);
        current.setDate(weekStart.getDate() + i);
        const dayKey = formatDateISO(current);

        const dayColumn = document.createElement("div");
        dayColumn.className = "week-day";
        if (isSameDate(current, new Date())) {
          dayColumn.classList.add("is-today");
        }

        const header = document.createElement("div");
        header.className = "week-day-header";
        header.innerHTML = `${getVietnameseDayName(i)}<span>${formatDisplayDate(current)}</span>`;
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
        const dayKey = formatDateISO(startDate);
        const slotId = getSlotIdForDate(startDate, this.consultationSlotConfig);
        const targetSlot = slotsPerDay[dayKey]?.[slotId];
        if (!targetSlot) return;
        targetSlot.appendChild(this.buildCard(item));
      });
    },

    buildCard(item) {
      const card = document.createElement("div");
      card.className = `consultation-card ${item.online ? "online" : "onsite"}`;
      const timeRange = formatTimeRange(item.startTime, item.endTime);
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
          <span class="badge ${item.online ? "lms" : "center"}">${item.online ? "LMS" : "Trực tiếp"}</span>
          <span class="badge">${status}</span>
        </div>
      `;

      return card;
    },

    updateStats(items = []) {
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
    },

    addSchedule() {
      if (typeof showAddConsultationModal === 'function') {
        showAddConsultationModal();
      } else if (typeof window.showAddConsultationModal === 'function') {
        window.showAddConsultationModal();
      } else {
        console.error('showAddConsultationModal function not found');
      }
    }
  };

  // Expose to window
  window.consultationScheduleModule = ConsultationScheduleModule;

  // Auto-initialize when section is loaded
  if (document.getElementById("consultation-schedule")) {
    setTimeout(() => {
      ConsultationScheduleModule.loadData();
    }, 100);
  }
})();

