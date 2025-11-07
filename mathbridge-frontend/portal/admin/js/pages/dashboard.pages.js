// portal/admin/js/pages/dashboard.pages.js
import { fetchDashboardOverview } from "../api/dashboard.api.js";

// Format số đơn giản
function formatNumber(value) {
  if (value === null || value === undefined) return "0";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("vi-VN");
}

// Format tiền VND
function formatCurrency(value) {
  if (value === null || value === undefined) return "0";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("vi-VN") + " ₫";
}

// Set text cho 1 phần tử theo data-kpi
function setKpiText(kpiKey, value, formatter = formatNumber) {
  const el = document.querySelector(`[data-kpi="${kpiKey}"]`);
  if (!el) return;
  el.textContent = formatter(value);
}

// Render table body theo data-table
function renderTable(tableKey, rows, rowRenderer) {
  const tbody = document.querySelector(`tbody[data-table="${tableKey}"]`);
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!rows || rows.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 10;
    td.textContent = "Không có dữ liệu";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  rows.forEach((row) => {
    const tr = rowRenderer(row);
    tbody.appendChild(tr);
  });
}

// ================== KHỞI TẠO DASHBOARD ==================

export async function initDashboardPage() {
  try {
    const data = await fetchDashboardOverview();
    if (!data) {
      console.error("[Dashboard] Không nhận được dữ liệu từ API");
      return;
    }

    // ===== KPI 1-4 =====
    setKpiText("lop-dang-mo", data.lopDangMo);
    setKpiText("hs-active", data.hocSinhActive);
    setKpiText("nv-active", data.nhanVienActive);
    setKpiText("revenue-paid-total", data.tongDoanhThuDaThu, formatCurrency);

    // ===== KPI 5: Hóa đơn theo trạng thái =====
    setKpiText("invoice-paid-count", data.hoaDonDaThanhToan);
    setKpiText("invoice-unpaid-count", data.hoaDonChuaThanhToan);

    // ===== KPI 7: Doanh thu theo phương thức thanh toán =====
    setKpiText("pttt-pt001", data.doanhThuPT001, formatCurrency);
    setKpiText("pttt-pt002", data.doanhThuPT002, formatCurrency);
    setKpiText("pttt-pt003", data.doanhThuPT003, formatCurrency);
    setKpiText("pttt-pt004", data.doanhThuPT004, formatCurrency);
    setKpiText("pttt-pt005", data.doanhThuPT005, formatCurrency);

    // ===== KPI 6: Hóa đơn chưa thanh toán sắp đến hạn =====
    renderTable(
      "invoice-unpaid-soon",
      data.hoaDonChuaThanhToanSapDenHan,
      (item) => {
        const tr = document.createElement("tr");

        const tdIdHd = document.createElement("td");
        tdIdHd.textContent = item.idHoaDon || "";
        tr.appendChild(tdIdHd);

        const tdIdHs = document.createElement("td");
        tdIdHs.textContent = item.idHocSinh || "";
        tr.appendChild(tdIdHs);

        const tdIdLh = document.createElement("td");
        tdIdLh.textContent = item.idLopHoc || "";
        tr.appendChild(tdIdLh);

        const tdNgayDk = document.createElement("td");
        tdNgayDk.textContent = item.ngayDangKy || "";
        tr.appendChild(tdNgayDk);

        const tdHan = document.createElement("td");
        tdHan.textContent = item.hanThanhToan || "";
        tr.appendChild(tdHan);

        const tdSoTien = document.createElement("td");
        tdSoTien.textContent = formatCurrency(item.soTien);
        tr.appendChild(tdSoTien);

        return tr;
      }
    );

    // ===== KPI 8: Top lớp theo sĩ số =====
    renderTable(
      "top-class-by-student",
      data.topLopTheoSiSo,
      (item) => {
        const tr = document.createElement("tr");

        const tdIdLh = document.createElement("td");
        tdIdLh.textContent = item.idLopHoc || "";
        tr.appendChild(tdIdLh);

        const tdTenLop = document.createElement("td");
        tdTenLop.textContent = item.tenLop || "";
        tr.appendChild(tdTenLop);

        const tdSoHs = document.createElement("td");
        tdSoHs.textContent = formatNumber(item.soHocSinh);
        tr.appendChild(tdSoHs);

        return tr;
      }
    );

    // ===== KPI 9: Lớp theo chương trình =====
    renderTable(
      "class-per-program",
      data.lopTheoChuongTrinh,
      (item) => {
        const tr = document.createElement("tr");

        const tdIdCt = document.createElement("td");
        tdIdCt.textContent = item.idChuongTrinh || "";
        tr.appendChild(tdIdCt);

        const tdTenCt = document.createElement("td");
        tdTenCt.textContent = item.tenChuongTrinh || "";
        tr.appendChild(tdTenCt);

        const tdSoLop = document.createElement("td");
        tdSoLop.textContent = formatNumber(item.soLop);
        tr.appendChild(tdSoLop);

        return tr;
      }
    );

    // ===== KPI 10: Tin tuyển dụng & ứng viên =====
    renderTable(
      "recruitment-summary",
      data.tuyenDung,
      (item) => {
        const tr = document.createElement("tr");

        const tdIdTin = document.createElement("td");
        tdIdTin.textContent = item.idTin || "";
        tr.appendChild(tdIdTin);

        const tdTieuDe = document.createElement("td");
        tdTieuDe.textContent = item.tieuDe || "";
        tr.appendChild(tdTieuDe);

        const tdTrangThai = document.createElement("td");
        tdTrangThai.textContent = item.trangThai || "";
        tr.appendChild(tdTrangThai);

        const tdSoUv = document.createElement("td");
        tdSoUv.textContent = formatNumber(item.soUngVien);
        tr.appendChild(tdSoUv);

        return tr;
      }
    );

    // ===== KPI 11: Yêu cầu hỗ trợ =====
    setKpiText("support-open", data.supportOpen);
    setKpiText("support-processing", data.supportProcessing);
    setKpiText("support-closed", data.supportClosed);

    // ===== KPI 12: Hợp đồng theo trạng thái =====
    setKpiText("contract-active", data.contractActive);
    setKpiText("contract-expired", data.contractExpired);

    // ===== KPI 13: Hợp đồng / Nhân viên =====
    renderTable(
      "contract-per-teacher",
      data.hopDongTheoNhanVien,
      (item) => {
        const tr = document.createElement("tr");

        const tdIdNv = document.createElement("td");
        tdIdNv.textContent = item.idNhanVien || "";
        tr.appendChild(tdIdNv);

        const tdSoHd = document.createElement("td");
        tdSoHd.textContent = formatNumber(item.soHopDong);
        tr.appendChild(tdSoHd);

        return tr;
      }
    );

    console.log("[Dashboard] Render thành công");
  } catch (err) {
    console.error("[Dashboard] Lỗi khi load dữ liệu:", err);
  }
}
