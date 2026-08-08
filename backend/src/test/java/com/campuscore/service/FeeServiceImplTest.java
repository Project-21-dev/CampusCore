package com.campuscore.service;

import com.campuscore.dto.FeeDTO;
import com.campuscore.entity.Fee;
import com.campuscore.entity.Student;
import com.campuscore.entity.User;
import com.campuscore.repository.FeeRepository;
import com.campuscore.repository.StudentRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link FeeServiceImpl}.
 * All collaborators are mocked; no Spring context is started and no database is used.
 */
@ExtendWith(MockitoExtension.class)
class FeeServiceImplTest {

    @Mock
    private FeeRepository feeRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private ModelMapper modelMapper;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private FeeServiceImpl feeService;

    private Student buildStudent(Long id, String username) {
        User user = new User();
        user.setUserId(id);
        user.setUsername(username);

        Student student = new Student();
        student.setStudentId(id);
        student.setUser(user);
        return student;
    }

    private Fee buildFee(Long id, Student student, String feeType, double amount, String status) {
        Fee fee = new Fee();
        fee.setFeeId(id);
        fee.setStudent(student);
        fee.setFeeType(feeType);
        fee.setAmount(amount);
        fee.setDueDate(LocalDate.of(2026, 1, 15));
        fee.setStatus(status);
        return fee;
    }

    // ---------- createFee() ----------

    @Test
    void shouldCreateFeeSuccessfully() {
        Student student = buildStudent(1L, "alice");
        Map<String, Object> request = new HashMap<>();
        request.put("studentId", "1");
        request.put("feeType", "Tuition");
        request.put("amount", "5000.0");
        request.put("dueDate", "2026-03-01");
        request.put("status", "Pending");

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(feeRepository.save(any(Fee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        feeService.createFee(request);

        ArgumentCaptor<Fee> captor = ArgumentCaptor.forClass(Fee.class);
        verify(feeRepository, times(1)).save(captor.capture());
        Fee saved = captor.getValue();
        assertEquals("Tuition", saved.getFeeType());
        assertEquals(5000.0, saved.getAmount());
        assertEquals("Pending", saved.getStatus());
        assertEquals(LocalDate.of(2026, 3, 1), saved.getDueDate());
    }

    @Test
    void shouldThrowExceptionWhenCreatingFeeForNonExistentStudent() {
        Map<String, Object> request = new HashMap<>();
        request.put("studentId", "99");

        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> feeService.createFee(request));
        assertEquals("Student not found", ex.getMessage());
        verify(feeRepository, never()).save(any(Fee.class));
    }

    // ---------- read operations ----------

    @Test
    void shouldReturnAllFees() {
        Student student = buildStudent(1L, "alice");
        Fee fee = buildFee(1L, student, "Tuition", 5000.0, "Pending");
        FeeDTO dto = new FeeDTO();

        when(feeRepository.findAll()).thenReturn(List.of(fee));
        when(modelMapper.map(eq(fee), eq(FeeDTO.class))).thenReturn(dto);

        List<FeeDTO> result = feeService.getAllFees();

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getStudentId());
        assertEquals("alice", result.get(0).getStudentName());
    }

    @Test
    void shouldReturnStudentFees() {
        Student student = buildStudent(1L, "alice");
        Fee fee = buildFee(1L, student, "Library", 200.0, "Paid");
        FeeDTO dto = new FeeDTO();
        dto.setFeeType("Library");

        when(feeRepository.findByStudentStudentId(1L)).thenReturn(List.of(fee));
        when(modelMapper.map(eq(fee), eq(FeeDTO.class))).thenReturn(dto);

        List<FeeDTO> result = feeService.getStudentFees(1L);

        assertEquals(1, result.size());
        assertEquals("Library", result.get(0).getFeeType());
    }

    // ---------- payFee() business rules ----------

    @Test
    void shouldPayFeeSuccessfully() {
        Student student = buildStudent(1L, "alice");
        Fee fee = buildFee(1L, student, "Tuition", 5000.0, "Pending");
        Map<String, String> request = new HashMap<>();
        request.put("paymentMethod", "UPI");
        request.put("transactionId", "TXN999");

        when(feeRepository.findById(1L)).thenReturn(Optional.of(fee));
        when(feeRepository.save(any(Fee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        feeService.payFee(1L, request);

        assertEquals("Paid", fee.getStatus());
        assertEquals("UPI", fee.getPaymentMethod());
        assertEquals("TXN999", fee.getTransactionId());
        assertEquals(LocalDate.now(), fee.getPaidDate());
        assertTrue(fee.getReceiptNumber().startsWith("RCP-1-"));
        verify(auditLogService, times(1)).log(eq("Fee"), eq(1L), eq("PAY"), eq("Admin"), anyString());
    }

    @Test
    void shouldGenerateTransactionIdWhenNotProvidedDuringPayment() {
        Student student = buildStudent(1L, "alice");
        Fee fee = buildFee(1L, student, "Tuition", 5000.0, "Pending");
        Map<String, String> request = new HashMap<>();
        request.put("paymentMethod", "Cash");

        when(feeRepository.findById(1L)).thenReturn(Optional.of(fee));
        when(feeRepository.save(any(Fee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        feeService.payFee(1L, request);

        assertTrue(fee.getTransactionId().startsWith("TXN"));
    }

    @Test
    void shouldThrowExceptionWhenPayingNonExistentFee() {
        Map<String, String> request = new HashMap<>();
        when(feeRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> feeService.payFee(99L, request));
        assertEquals("Fee not found", ex.getMessage());
        verify(auditLogService, never()).log(anyString(), any(), anyString(), anyString(), anyString());
    }

    // ---------- deleteFee() ----------

    @Test
    void shouldDeleteFeeSuccessfully() {
        feeService.deleteFee(1L);

        verify(feeRepository, times(1)).deleteById(1L);
        verify(auditLogService, times(1)).log(eq("Fee"), eq(1L), eq("DELETE"), eq("Admin"), anyString());
    }

    // ---------- reminders ----------

    @Test
    void shouldThrowExceptionWhenSendingReminderForNonExistentFee() {
        when(feeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> feeService.sendReminder(99L));
        verify(emailService, never()).sendFeeReminderEmail(any(), anyString(), any(), any());
    }

    @Test
    void shouldSendReminderSuccessfully() {
        Student student = buildStudent(1L, "alice");
        Fee fee = buildFee(1L, student, "Tuition", 5000.0, "Pending");

        when(feeRepository.findById(1L)).thenReturn(Optional.of(fee));
        doNothing().when(emailService).sendFeeReminderEmail(student, "Tuition", 5000.0, fee.getDueDate());

        feeService.sendReminder(1L);

        verify(emailService, times(1)).sendFeeReminderEmail(student, "Tuition", 5000.0, fee.getDueDate());
        verify(auditLogService, times(1)).log(eq("Fee"), eq(1L), eq("REMIND"), eq("Admin"), anyString());
    }

    @Test
    void shouldSendOverdueRemindersForUnpaidFeesOnly() {
        Student student = buildStudent(1L, "alice");
        Fee paidFee = buildFee(1L, student, "Tuition", 5000.0, "Paid");
        Fee pendingFee = buildFee(2L, student, "Library", 200.0, "Pending");

        when(feeRepository.findAll()).thenReturn(List.of(paidFee, pendingFee));

        int sentCount = feeService.sendOverdueReminders();

        assertEquals(1, sentCount);
        verify(emailService, times(1)).sendFeeReminderEmail(any(), anyString(), any(), any());
        verify(auditLogService, times(1)).log(eq("Fee"), isNull(), eq("REMIND_ALL"), eq("Admin"), anyString());
    }

    @Test
    void shouldContinueSendingRemindersWhenEmailServiceThrowsException() {
        Student student = buildStudent(1L, "alice");
        Fee fee1 = buildFee(1L, student, "Tuition", 5000.0, "Pending");
        Fee fee2 = buildFee(2L, student, "Library", 200.0, "Pending");

        when(feeRepository.findAll()).thenReturn(List.of(fee1, fee2));
        doThrow(new RuntimeException("SMTP unavailable"))
                .doNothing()
                .when(emailService).sendFeeReminderEmail(any(), anyString(), any(), any());

        int sentCount = feeService.sendOverdueReminders();

        assertEquals(1, sentCount);
        verify(emailService, times(2)).sendFeeReminderEmail(any(), anyString(), any(), any());
    }
}
