// Support Section Module
(function() {
  'use strict';

  // Helper functions
  function getTimeAgo(dateTime) {
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
    return formatDateTime(dateTime);
  }

  function formatDateTime(dateTime) {
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

  function getStatusClass(status) {
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

  function showNotification(message, type) {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  // Support Module
  const SupportModule = {
    allSupportRequests: [],

    async loadData() {
      await this.loadSupportRequests();
    },

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
        this.setupFilters();

        // Render support requests
        this.render(this.allSupportRequests);
      } catch (error) {
        console.error("Error loading support requests:", error);
        if (supportLoading) supportLoading.style.display = "none";
        if (supportEmpty) supportEmpty.style.display = "block";
        supportGrid.innerHTML = `
          <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Không thể tải dữ liệu</h3>
            <p>Có lỗi xảy ra khi tải danh sách yêu cầu hỗ trợ</p>
            <button class="btn btn-primary" onclick="window.supportModule.loadSupportRequests()">
              <i class="fas fa-redo"></i> Thử lại
            </button>
          </div>
        `;
        showNotification("Không thể tải danh sách yêu cầu hỗ trợ", "error");
      }
    },

    setupFilters() {
      const searchInput = document.getElementById("supportSearchInput");
      const statusFilter = document.getElementById("supportStatusFilter");
      const refreshBtn = document.getElementById("refreshSupportBtn");

      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          this.filter(e.target.value, statusFilter?.value || "");
        });
      }

      if (statusFilter) {
        statusFilter.addEventListener("change", (e) => {
          this.filter(searchInput?.value || "", e.target.value);
        });
      }

      if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
          this.loadSupportRequests();
        });
      }
    },

    filter(searchTerm = "", statusFilter = "") {
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
      this.render(filtered);
    },

    render(requests) {
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
        .map((request) => this.createCard(request))
        .join("");
    },

    createCard(request) {
      const statusClass = getStatusClass(request.trangThai);
      const statusText = request.trangThai || "Chưa xử lý";
      const formattedDate = formatDateTime(request.thoiDiemTao);
      const studentName = request.studentName || "Chưa có thông tin";
      const tenLop = request.tenLop || "Chưa có lớp";
      const chuongTrinh = request.chuongTrinh ? ` • ${request.chuongTrinh}` : "";
      const loaiYeuCau = request.loaiYeuCau || "Không xác định";
      const noiDung = request.noiDung || "Không có mô tả";
      const noiDungShort =
        noiDung.length > 150 ? noiDung.substring(0, 150) + "..." : noiDung;
      const isClosed = request.thoiDiemDong != null;
      const timeAgo = getTimeAgo(request.thoiDiemTao);

      return `
        <div class="support-card ${isClosed ? "closed" : ""}" data-id="${request.idYc}" data-status="${statusText}">
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
                  ${request.studentEmail ? `
                    <span class="contact-item">
                      <i class="fas fa-envelope"></i>
                      ${request.studentEmail}
                    </span>
                  ` : ""}
                  ${request.studentPhone ? `
                    <span class="contact-item">
                      <i class="fas fa-phone"></i>
                      ${request.studentPhone}
                    </span>
                  ` : ""}
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
            
            ${request.fileUrl ? `
              <div class="support-attachment">
                <i class="fas fa-paperclip"></i>
                <a href="${request.fileUrl}" target="_blank" class="attachment-link">
                  Xem file đính kèm
                  <i class="fas fa-external-link-alt"></i>
                </a>
              </div>
            ` : ""}
            
            <div class="support-meta">
              <span class="meta-item">
                <i class="fas fa-clock"></i>
                ${formattedDate}
              </span>
              ${isClosed ? `
                <span class="meta-item closed-time">
                  <i class="fas fa-check-circle"></i>
                  Đã đóng: ${formatDateTime(request.thoiDiemDong)}
                </span>
              ` : ""}
            </div>
          </div>
          
          <div class="support-card-footer">
            <button class="btn btn-sm btn-outline-primary" onclick="window.supportModule.viewDetails('${request.idYc}')">
              <i class="fas fa-eye"></i>
              Chi tiết
            </button>
            ${!isClosed ? `
              <button class="btn btn-sm btn-success" onclick="window.supportModule.markAsProcessed('${request.idYc}')">
                <i class="fas fa-check"></i>
                Đánh dấu đã xử lý
              </button>
            ` : `
              <span class="closed-badge">
                <i class="fas fa-lock"></i>
                Đã đóng
              </span>
            `}
          </div>
        </div>
      `;
    },

    viewDetails(idYc) {
      // Use tutorDashboard method if available
      if (window.tutorDashboard && window.tutorDashboard.viewSupportDetails) {
        window.tutorDashboard.viewSupportDetails(idYc);
      } else {
        console.warn("viewSupportDetails method not available");
      }
    },

    async markAsProcessed(idYc) {
      // Use tutorDashboard method if available
      if (window.tutorDashboard && window.tutorDashboard.markSupportAsProcessed) {
        window.tutorDashboard.markSupportAsProcessed(idYc);
      } else {
        console.warn("markSupportAsProcessed method not available");
      }
    }
  };

  // Expose to window
  window.supportModule = SupportModule;

  // Auto-initialize when section is loaded
  if (document.getElementById("support")) {
    setTimeout(() => {
      SupportModule.loadData();
    }, 100);
  }
})();

