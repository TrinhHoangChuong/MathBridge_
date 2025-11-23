// Payments Section Module
(function() {
  'use strict';

  // Helper functions
  function getInitials(name) {
    if (!name) return "??";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  function showNotification(message, type) {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  // Payments Module
  const PaymentsModule = {
    allInvoices: [],
    currentSortField: null,
    currentSortDirection: "asc",

    async loadData() {
      // Load unpaid invoices and payment methods
      await this.loadUnpaidInvoices();
      await this.loadPaymentMethods();
      await this.loadAllInvoices();

      // Set current date as payment date
      this.setPaymentDate();

      // Setup payment form handler
      this.setupPaymentForm();
    },

    setPaymentDate() {
      const today = new Date();
      const paymentDateInput = document.getElementById("paymentDate");
      if (paymentDateInput) {
        paymentDateInput.value = today.toLocaleDateString("vi-VN");
      }
    },

    async loadUnpaidInvoices() {
      try {
        const invoices = await window.tutorAPI.getUnpaidInvoices();
        this.populateInvoiceSelect(invoices || []);
      } catch (error) {
        console.error("Error loading unpaid invoices:", error);
        if (window.tutorAPI && window.tutorAPI.handleError) {
          window.tutorAPI.handleError(error);
        }
      }
    },

    async loadPaymentMethods() {
      try {
        const methods = await window.tutorAPI.getPaymentMethods();
        const select = document.getElementById("paymentMethod");
        if (select && methods) {
          select.innerHTML = '<option value="">Chọn phương thức thanh toán...</option>';
          methods.forEach((method) => {
            const option = document.createElement("option");
            // Ưu tiên sử dụng idPt từ DTO
            const idPt = method.idPt || method.id;
            if (!idPt) {
              console.warn("Payment method missing idPt:", method);
              return; // Bỏ qua method không có idPt
            }
            option.value = idPt;
            option.textContent = method.tenPt || method.tenPhuongThuc || method.name || "";
            select.appendChild(option);
          });
        }
      } catch (error) {
        console.error("Error loading payment methods:", error);
        showNotification("Không thể tải danh sách phương thức thanh toán", "error");
      }
    },

    async loadAllInvoices() {
      try {
        const invoices = await window.tutorAPI.getAllInvoices();
        this.allInvoices = invoices || [];
        this.currentSortField = null;
        this.currentSortDirection = "asc";
        this.filterAndDisplay("");
      } catch (error) {
        console.error("Error loading invoices:", error);
        if (window.tutorAPI && window.tutorAPI.handleError) {
          window.tutorAPI.handleError(error);
        }
      }
    },

    populateInvoiceSelect(invoices) {
      const list = document.getElementById("invoiceSelectList");
      if (!list) return;

      list.innerHTML = "";
      invoices.forEach((invoice) => {
        const option = document.createElement("div");
        option.className = "custom-select-option";
        option.dataset.value = invoice.idHoaDon;
        option.innerHTML = `
          <div style="font-weight: 600;">${invoice.studentName || "-"}</div>
          <div style="font-size: 0.875rem; color: var(--text-secondary);">
            ${invoice.tenLop || "-"} • ${invoice.tongTien ? invoice.tongTien.toLocaleString("vi-VN") + " VNĐ" : "-"}
          </div>
        `;
        option.addEventListener("click", () => {
          this.selectInvoice(invoice);
        });
        list.appendChild(option);
      });
    },

    selectInvoice(invoice) {
      const hiddenInput = document.getElementById("invoiceSelect");
      const trigger = document.getElementById("invoiceSelectTrigger");
      const text = document.getElementById("invoiceSelectText");
      const wrapper = document.getElementById("invoiceSelectWrapper");
      const studentInfoSection = document.getElementById("studentInfoSection");
      const paymentAmountSection = document.getElementById("paymentAmountSection");
      const paymentAmount = document.getElementById("paymentAmount");
      const paymentDeadline = document.getElementById("paymentDeadline");

      if (hiddenInput) hiddenInput.value = invoice.idHoaDon;
      if (text) text.textContent = `${invoice.studentName || "-"} - ${invoice.tenLop || "-"}`;
      if (wrapper) wrapper.classList.remove("open");

      // Show student info
      if (studentInfoSection) {
        document.getElementById("studentName").textContent = invoice.studentName || "-";
        document.getElementById("studentEmail").textContent = invoice.studentEmail || "-";
        document.getElementById("studentPhone").textContent = invoice.studentPhone || "-";
        document.getElementById("studentAddress").textContent = invoice.studentAddress || "-";
        document.getElementById("studentClass").textContent = invoice.tenLop || "-";
        studentInfoSection.style.display = "block";
      }

      // Show payment amount
      if (paymentAmountSection && paymentAmount) {
        paymentAmount.textContent = invoice.tongTien
          ? invoice.tongTien.toLocaleString("vi-VN") + " VNĐ"
          : "-";
        paymentAmountSection.style.display = "block";
      }

      // Set deadline
      if (paymentDeadline && invoice.hanThanhToan) {
        const deadline = new Date(invoice.hanThanhToan);
        paymentDeadline.value = deadline.toLocaleDateString("vi-VN");
      }
    },

    filterAndDisplay(searchTerm = "") {
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
            <div class="table-row invoice-row" data-invoice-id="${invoice.idHoaDon}">
              <div>${invoice.idHoaDon || "-"}</div>
              <div class="col-name">
                <div class="student-avatar">${getInitials(invoice.studentName)}</div>
                <div class="student-info">
                  <div class="student-name">${invoice.studentName || "-"}</div>
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
                <button class="btn btn-sm btn-primary" onclick="window.paymentsModule.viewInvoice('${invoice.idHoaDon}')" title="Xem chi tiết">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </div>
          `;
        })
        .join("");
    },

    sortInvoices(invoices, field, direction) {
      return [...invoices].sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        if (field === "tongTien") {
          aVal = aVal || 0;
          bVal = bVal || 0;
        } else if (field.includes("ngay")) {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        } else {
          aVal = (aVal || "").toString().toLowerCase();
          bVal = (bVal || "").toString().toLowerCase();
        }

        if (direction === "asc") {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    },

    setupPaymentForm() {
      // Setup invoice select dropdown
      const trigger = document.getElementById("invoiceSelectTrigger");
      const wrapper = document.getElementById("invoiceSelectWrapper");
      const searchInput = document.getElementById("invoiceSelectSearch");

      if (trigger && wrapper) {
        trigger.addEventListener("click", () => {
          wrapper.classList.toggle("open");
        });

        // Close on outside click
        document.addEventListener("click", (e) => {
          if (!wrapper.contains(e.target)) {
            wrapper.classList.remove("open");
          }
        });

        // Search functionality
        if (searchInput) {
          searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const options = wrapper.querySelectorAll(".custom-select-option");
            options.forEach((option) => {
              const text = option.textContent.toLowerCase();
              option.style.display = text.includes(term) ? "block" : "none";
            });
          });
        }
      }

      // Setup form submit
      const form = document.getElementById("paymentForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handlePaymentSubmit();
        });
      }

      // Setup reset button
      const resetBtn = document.getElementById("resetPaymentForm");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          this.resetForm();
        });
      }

      // Setup invoice list search
      const invoiceListSearch = document.getElementById("invoiceListSearch");
      if (invoiceListSearch) {
        invoiceListSearch.addEventListener("input", (e) => {
          this.filterAndDisplay(e.target.value);
        });
      }

      // Setup refresh button
      const refreshBtn = document.getElementById("refreshInvoiceList");
      if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
          this.loadAllInvoices();
          showNotification("Danh sách hóa đơn đã được làm mới!", "success");
        });
      }

      // Setup sortable headers
      document.querySelectorAll(".sortable").forEach((header) => {
        header.addEventListener("click", () => {
          const field = header.dataset.sort;
          if (this.currentSortField === field) {
            this.currentSortDirection = this.currentSortDirection === "asc" ? "desc" : "asc";
          } else {
            this.currentSortField = field;
            this.currentSortDirection = "asc";
          }
          const searchInput = document.getElementById("invoiceListSearch");
          this.filterAndDisplay(searchInput ? searchInput.value : "");
        });
      });
    },

    async handlePaymentSubmit() {
      const hiddenInput = document.getElementById("invoiceSelect");
      const paymentMethodSelect = document.getElementById("paymentMethod");
      const notesTextarea = document.getElementById("notes");

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
        idHoaDon: hiddenInput.value.trim(),
        idPt: paymentMethodSelect.value.trim(),
        ghiChu: notesTextarea && notesTextarea.value ? notesTextarea.value.trim() : null,
      };

      // Validate data before sending
      if (!paymentData.idHoaDon || paymentData.idHoaDon === "") {
        showNotification("Vui lòng chọn hóa đơn!", "error");
        return;
      }

      if (!paymentData.idPt || paymentData.idPt === "") {
        showNotification("Vui lòng chọn phương thức thanh toán!", "error");
        return;
      }

      console.log("Sending payment data:", paymentData);

      try {
        const result = await window.tutorAPI.processPayment(paymentData);
        console.log("Payment processed successfully:", result);
        showNotification("Thanh toán thành công!", "success");

        // Display invoice details in modal if tutorDashboard method exists
        if (window.tutorDashboard && window.tutorDashboard.displayInvoiceDetails) {
          window.tutorDashboard.displayInvoiceDetails(result);
          if (window.tutorDashboard.openInvoiceModal) {
            window.tutorDashboard.openInvoiceModal();
          }
        }

        // Reset form and reload data
        this.resetForm();
        await this.loadUnpaidInvoices();
        await this.loadAllInvoices();
      } catch (error) {
        console.error("Error processing payment:", error);
        console.error("Payment data that was sent:", paymentData);
        console.error("Error details:", {
          message: error.message,
          status: error.status,
          errorData: error.errorData
        });

        let errorMessage = "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.";
        
        // Extract error message từ errorData (đã được parse trong API request)
        if (error.errorData) {
          if (error.errorData.message) {
            errorMessage = error.errorData.message;
          } else if (error.errorData.error) {
            errorMessage = error.errorData.error;
          }
        }
        
        // Extract error message từ error object nếu chưa có
        if (error.message && !error.message.includes("HTTP error") && errorMessage === "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.") {
          errorMessage = error.message;
        } else if (error.status === 400 && errorMessage === "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.") {
          errorMessage = "Dữ liệu thanh toán không hợp lệ. Vui lòng kiểm tra:\n- Hóa đơn đã được chọn đúng chưa\n- Phương thức thanh toán đã được chọn chưa\n- Hóa đơn có thể đã được thanh toán rồi";
        } else if (error.status === 500 && errorMessage === "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.") {
          errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau.";
        }

        showNotification(errorMessage, "error");
        if (window.tutorAPI && window.tutorAPI.handleError) {
          window.tutorAPI.handleError(error);
        }
      }
    },

    resetForm() {
      const form = document.getElementById("paymentForm");
      if (form) form.reset();
      
      const studentInfoSection = document.getElementById("studentInfoSection");
      const paymentAmountSection = document.getElementById("paymentAmountSection");
      const trigger = document.getElementById("invoiceSelectTrigger");
      const text = document.getElementById("invoiceSelectText");
      const wrapper = document.getElementById("invoiceSelectWrapper");

      if (studentInfoSection) studentInfoSection.style.display = "none";
      if (paymentAmountSection) paymentAmountSection.style.display = "none";
      if (text) text.textContent = "Chọn hóa đơn...";
      if (wrapper) wrapper.classList.remove("open");

      this.setPaymentDate();
    },

    viewInvoice(idHoaDon) {
      // Use tutorDashboard method if available
      if (window.tutorDashboard && window.tutorDashboard.viewInvoiceDetails) {
        window.tutorDashboard.viewInvoiceDetails(idHoaDon);
      } else {
        console.warn("viewInvoiceDetails method not available");
      }
    }
  };

  // Expose to window
  window.paymentsModule = PaymentsModule;

  // Auto-initialize when section is loaded
  if (document.getElementById("payments")) {
    setTimeout(() => {
      PaymentsModule.loadData();
    }, 100);
  }
})();

