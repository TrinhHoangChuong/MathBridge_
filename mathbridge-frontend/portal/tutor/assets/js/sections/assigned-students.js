// Assigned Students Section Module
(function() {
  'use strict';

  // Helper functions
  function getStudentInitials(name) {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  function getStatusClass(status) {
    if (!status) return "default";
    const statusLower = status.toLowerCase();
    if (statusLower.includes("dang phu trach") || statusLower.includes("đang")) {
      return "success";
    } else if (statusLower.includes("tam dung") || statusLower.includes("tạm")) {
      return "warning";
    } else if (statusLower.includes("ket thuc") || statusLower.includes("kết")) {
      return "secondary";
    }
    return "default";
  }

  function getStatusText(status) {
    if (!status) return "Chưa xác định";
    if (status.includes("Dang phu trach")) return "Đang phụ trách";
    if (status.includes("Tam dung")) return "Tạm dừng";
    if (status.includes("Ket thuc")) return "Kết thúc";
    return status;
  }

  function showNotification(message, type) {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  // Assigned Students Module
  const AssignedStudentsModule = {
    assignedStudents: [],
    currentTutorId: null,
    currentStatusFilter: null,

    async loadData() {
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
            idTk = user.idTk || user.id || localStorage.getItem("mb_user_id") || null;
          } catch (e) {
            console.error("Error parsing auth data:", e);
          }
        }

        // If idNv not found in auth data, try to get it from idTk
        if (!idNv && idTk) {
          try {
            const tutorIdResponse = await window.tutorAPI.getTutorIdFromAccountId(idTk);
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
          showNotification("Không tìm thấy thông tin cố vấn. Vui lòng đăng nhập lại.", "warning");
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
          classFilter.innerHTML = '<option value="">Tất cả lớp</option>';
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
          this.render(this.assignedStudents);
        }
      } catch (error) {
        console.error("Error loading assigned students:", error);
        if (loadingEl) loadingEl.style.display = "none";
        if (emptyEl) emptyEl.style.display = "flex";
        showNotification("Không thể tải danh sách học sinh. Vui lòng thử lại.", "error");
        if (window.tutorAPI && window.tutorAPI.handleError) {
          window.tutorAPI.handleError(error);
        }
      }
    },

    render(students) {
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
          const initials = getStudentInitials(student.hoTen || "");
          const ngayBatDau = student.ngayBatDau
            ? new Date(student.ngayBatDau).toLocaleDateString("vi-VN")
            : "-";
          const ngayKetThuc = student.ngayKetThuc
            ? new Date(student.ngayKetThuc).toLocaleDateString("vi-VN")
            : "Đang phụ trách";
          const trangThai = student.trangThai || "Dang phu trach";
          const trangThaiClass = getStatusClass(trangThai);
          const trangThaiText = getStatusText(trangThai);
          const ghiChu = student.ghiChu || "Không có ghi chú";
          const gioiTinhIcon = student.gioiTinh ? "fa-venus" : "fa-mars";
          const gioiTinhText = student.gioiTinh ? "Nữ" : "Nam";

          return `
            <div class="table-row student-row" data-student-id="${student.idHs}">
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
                  <a href="mailto:${student.email || ""}">${student.email || "N/A"}</a>
                </div>
                <div class="contact-item">
                  <i class="fas fa-phone"></i>
                  <a href="tel:${student.sdt || ""}">${student.sdt || "N/A"}</a>
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
                <button class="btn btn-sm btn-primary" onclick="window.assignedStudentsModule.viewDetails('${student.idHs}')" title="Xem chi tiết">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="window.assignedStudentsModule.finishAdvising('${student.idHs}')" title="Kết thúc cố vấn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          `;
        })
        .join("");
    },

    filter() {
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
        this.loadData();
        return;
      }

      // If no students loaded yet, load them
      if (!this.assignedStudents) {
        this.loadData();
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

      this.render(filtered);
    },

    viewDetails(idHs) {
      // Use tutorDashboard method if available
      if (window.tutorDashboard && window.tutorDashboard.viewStudentDetails) {
        window.tutorDashboard.viewStudentDetails(idHs);
      } else {
        console.warn("viewStudentDetails method not available");
      }
    },

    async finishAdvising(idHs) {
      if (!confirm("Bạn có chắc chắn muốn kết thúc cố vấn cho học sinh này?")) {
        return;
      }

      try {
        const idNv = this.currentTutorId || 
                    (window.tutorDashboard && window.tutorDashboard.currentTutorId) ||
                    (window.tutorDashboard && window.tutorDashboard.tutorInfo && window.tutorDashboard.tutorInfo.idNv);

        if (!idNv) {
          showNotification("Không xác định được ID cố vấn. Vui lòng thử lại.", "error");
          return;
        }

        await window.tutorAPI.finishAssignedStudent(idNv, idHs);
        showNotification("Đã kết thúc cố vấn cho học sinh.", "success");
        // Reload assigned students list
        await this.loadData();
      } catch (error) {
        console.error("Error finishing advising:", error);
        if (window.tutorAPI && window.tutorAPI.handleError) {
          window.tutorAPI.handleError(error);
        }
        showNotification("Không thể kết thúc cố vấn. Vui lòng thử lại.", "error");
      }
    },

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
      link.download = `Danh_sach_hoc_sinh_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification("Đã xuất danh sách học sinh thành công", "success");
    }
  };

  // Expose to window
  window.assignedStudentsModule = AssignedStudentsModule;

  // Auto-initialize when section is loaded
  if (document.getElementById("assigned-students")) {
    // Wait a bit for DOM to be ready
    setTimeout(() => {
      AssignedStudentsModule.loadData();
    }, 100);
  }
})();

