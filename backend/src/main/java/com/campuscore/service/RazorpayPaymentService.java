package com.campuscore.service;

import com.campuscore.entity.Fee;
import com.campuscore.repository.FeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RazorpayPaymentService {

    private static final String RAZORPAY_API_BASE = "https://api.razorpay.com/v1";
    private static final String CURRENCY = "INR";

    private final RestTemplate restTemplate;
    private final FeeRepository feeRepository;
    private final AuditLogService auditLogService;

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    @Transactional
    public Map<String, Object> createOrder(Long feeId) {
        ensureConfigured();

        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee not found"));

        if ("Paid".equalsIgnoreCase(fee.getStatus())) {
            throw new RuntimeException("This fee is already paid");
        }
        if (fee.getAmount() == null || fee.getAmount() <= 0) {
            throw new RuntimeException("Fee amount must be greater than zero");
        }

        long amountInPaise = toPaise(fee.getAmount());
        String receipt = "FEE-" + fee.getFeeId() + "-" + System.currentTimeMillis();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount", amountInPaise);
        body.put("currency", CURRENCY);
        body.put("receipt", receipt);

        Map<String, String> notes = new LinkedHashMap<>();
        notes.put("feeId", String.valueOf(fee.getFeeId()));
        notes.put("studentId", String.valueOf(fee.getStudent().getStudentId()));
        notes.put("feeType", fee.getFeeType());
        body.put("notes", notes);

        Map<String, Object> razorpayOrder = exchange(
                HttpMethod.POST,
                RAZORPAY_API_BASE + "/orders",
                body
        );

        String orderId = stringValue(razorpayOrder.get("id"));
        if (orderId == null || orderId.isBlank()) {
            throw new RuntimeException("Razorpay did not return an order id");
        }

        fee.setRazorpayOrderId(orderId);
        feeRepository.save(fee);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("keyId", keyId);
        response.put("orderId", orderId);
        response.put("amount", amountInPaise);
        response.put("currency", CURRENCY);
        response.put("feeId", fee.getFeeId());
        response.put("feeType", fee.getFeeType());
        response.put("studentName", fee.getStudent().getDisplayName());
        return response;
    }

    @Transactional
    public void verifyAndRecordPayment(Long feeId, Map<String, String> request) {
        ensureConfigured();

        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee not found"));

        if ("Paid".equalsIgnoreCase(fee.getStatus())) {
            throw new RuntimeException("This fee is already paid");
        }

        String paymentId = required(request, "razorpayPaymentId", "Razorpay payment id is required");
        String checkoutOrderId = required(request, "razorpayOrderId", "Razorpay order id is required");
        String signature = required(request, "razorpaySignature", "Razorpay signature is required");

        String storedOrderId = fee.getRazorpayOrderId();
        if (storedOrderId == null || storedOrderId.isBlank()) {
            throw new RuntimeException("No Razorpay order is associated with this fee");
        }
        if (!storedOrderId.equals(checkoutOrderId)) {
            throw new RuntimeException("Payment order does not match the fee order");
        }

        String expectedSignature = hmacSha256(storedOrderId + "|" + paymentId, keySecret);
        if (!constantTimeEquals(expectedSignature, signature)) {
            throw new RuntimeException("Payment signature verification failed");
        }

        long expectedAmount = toPaise(fee.getAmount());
        Map<String, Object> payment = fetchPayment(paymentId);
        validatePaymentAgainstFee(payment, storedOrderId, expectedAmount);

        String status = stringValue(payment.get("status"));
        if ("authorized".equalsIgnoreCase(status)) {
            payment = capturePayment(paymentId, expectedAmount);
            validatePaymentAgainstFee(payment, storedOrderId, expectedAmount);
            status = stringValue(payment.get("status"));
        }

        if (!"captured".equalsIgnoreCase(status)) {
            throw new RuntimeException("Payment is not captured yet. Current Razorpay status: " + status);
        }

        String method = stringValue(payment.get("method"));

        fee.setStatus("Paid");
        fee.setPaidDate(java.time.LocalDate.now());
        fee.setPaymentMethod(formatRazorpayMethod(method));
        fee.setTransactionId(paymentId);
        fee.setReceiptNumber("RCP-" + fee.getFeeId() + "-" + System.currentTimeMillis());
        feeRepository.save(fee);

        auditLogService.log(
                "Fee",
                fee.getFeeId(),
                "ONLINE_PAY",
                "Student/Parent",
                "Verified Razorpay payment " + paymentId + " for fee amount " + fee.getAmount()
        );
    }

    private Map<String, Object> fetchPayment(String paymentId) {
        return exchange(HttpMethod.GET, RAZORPAY_API_BASE + "/payments/" + paymentId, null);
    }

    private Map<String, Object> capturePayment(String paymentId, long amountInPaise) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount", amountInPaise);
        body.put("currency", CURRENCY);
        return exchange(HttpMethod.POST, RAZORPAY_API_BASE + "/payments/" + paymentId + "/capture", body);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> exchange(HttpMethod method, String url, Object body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(keyId, keySecret, StandardCharsets.UTF_8);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));
        if (body != null) {
            headers.setContentType(MediaType.APPLICATION_JSON);
        }

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    method,
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            if (response.getBody() == null) {
                throw new RuntimeException("Empty response from Razorpay");
            }
            return (Map<String, Object>) response.getBody();
        } catch (HttpStatusCodeException e) {
            throw new RuntimeException(extractRazorpayError(e));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().startsWith("Razorpay:")) {
                throw e;
            }
            throw new RuntimeException("Unable to communicate with Razorpay: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private String extractRazorpayError(HttpStatusCodeException e) {
        try {
            String body = e.getResponseBodyAsString();
            if (body != null && !body.isBlank()) {
                // Keep the server message useful without exposing credentials.
                return "Razorpay: " + body;
            }
        } catch (Exception ignored) {
        }
        return "Razorpay request failed with HTTP " + e.getStatusCode().value();
    }

    private void validatePaymentAgainstFee(Map<String, Object> payment, String orderId, long expectedAmount) {
        String paymentOrderId = stringValue(payment.get("order_id"));
        if (!orderId.equals(paymentOrderId)) {
            throw new RuntimeException("Razorpay payment belongs to a different order");
        }

        long actualAmount = numberValue(payment.get("amount"));
        if (actualAmount != expectedAmount) {
            throw new RuntimeException("Razorpay payment amount does not match the assigned fee");
        }

        String currency = stringValue(payment.get("currency"));
        if (!CURRENCY.equalsIgnoreCase(currency)) {
            throw new RuntimeException("Unexpected Razorpay payment currency");
        }
    }

    private long toPaise(Double amount) {
        return BigDecimal.valueOf(amount)
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
    }

    private long numberValue(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception e) {
            throw new RuntimeException("Invalid amount returned by Razorpay");
        }
    }

    private String formatRazorpayMethod(String method) {
        if (method == null || method.isBlank()) return "Razorpay";
        String normalized = method.trim().toLowerCase();
        return switch (normalized) {
            case "upi" -> "Razorpay UPI";
            case "card" -> "Razorpay Card";
            case "netbanking" -> "Razorpay Netbanking";
            case "wallet" -> "Razorpay Wallet";
            case "emi" -> "Razorpay EMI";
            case "paylater" -> "Razorpay Pay Later";
            default -> "Razorpay " + method;
        };
    }

    private String required(Map<String, String> request, String key, String message) {
        String value = request == null ? null : request.get(key);
        if (value == null || value.isBlank()) {
            throw new RuntimeException(message);
        }
        return value.trim();
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private void ensureConfigured() {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            throw new RuntimeException("Razorpay Test Mode is not configured on the server");
        }
    }

    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte b : digest) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Unable to verify Razorpay payment signature");
        }
    }

    private boolean constantTimeEquals(String expected, String actual) {
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                actual.getBytes(StandardCharsets.UTF_8)
        );
    }
}
