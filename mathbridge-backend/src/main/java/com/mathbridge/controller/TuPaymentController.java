package com.mathbridge.controller;

import com.mathbridge.dto.*;
import com.mathbridge.service.TuPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portal/tutor/payments")
@CrossOrigin(origins = "*")
public class TuPaymentController {

    private final TuPaymentService paymentService;

    public TuPaymentController(TuPaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Lấy danh sách học sinh chưa thanh toán
    @GetMapping("/unpaid")
    public ResponseEntity<List<TuUnpaidInvoiceDTO>> getUnpaidInvoices() {
        try {
            List<TuUnpaidInvoiceDTO> unpaidInvoices = paymentService.getUnpaidInvoices();
            return ResponseEntity.ok(unpaidInvoices);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Lấy thông tin chi tiết học sinh và hóa đơn
    @GetMapping("/details/{idHoaDon}")
    public ResponseEntity<TuPaymentDTO> getPaymentDetails(@PathVariable String idHoaDon) {
        try {
            TuPaymentDTO details = paymentService.getPaymentDetails(idHoaDon);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Lấy danh sách phương thức thanh toán
    @GetMapping("/methods")
    public ResponseEntity<List<TuPaymentMethodDTO>> getPaymentMethods() {
        try {
            List<TuPaymentMethodDTO> methods = paymentService.getPaymentMethods();
            return ResponseEntity.ok(methods);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Xử lý thanh toán
    @PostMapping("/process")
    public ResponseEntity<TuPaymentDTO> processPayment(@RequestBody TuProcessPaymentRequestDTO request) {
        try {
            TuPaymentDTO result = paymentService.processPayment(request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Lấy thông tin hóa đơn sau khi thanh toán
    @GetMapping("/invoice/{idHoaDon}")
    public ResponseEntity<TuPaymentDTO> getInvoiceDetails(@PathVariable String idHoaDon) {
        try {
            TuPaymentDTO invoice = paymentService.getInvoiceDetails(idHoaDon);
            return ResponseEntity.ok(invoice);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Lấy danh sách tất cả hóa đơn
    @GetMapping("/all")
    public ResponseEntity<List<TuInvoiceDTO>> getAllInvoices() {
        try {
            List<TuInvoiceDTO> invoices = paymentService.getAllInvoices();
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

