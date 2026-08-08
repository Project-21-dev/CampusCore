package com.campuscore.service;

import com.campuscore.entity.Student;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.sender.name}")
    private String senderName;

    @Value("${app.mail.sender.email}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendAbsentNotification(Student student, java.time.LocalDate date) {
        String to = student.getEmail() != null && !student.getEmail().isBlank()
                ? student.getEmail()
                : (student.getUser() != null ? student.getUser().getEmail() : null);

        if (to == null || to.isBlank()) {
            return; // no email available
        }

//        String recipientName = (student.getUser() != null && student.getUser().getUsername() != null)
//                ? student.getUser().getUsername()
//                : "Parent";

        String childName = student.getDisplayName();

        String formattedDate = date != null ? date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                : "";

        String html = "<html>" +
                "<body style='font-family: Arial, sans-serif; padding: 20px;'>" +
                "<h2 style='color: #d32f2f;'>📧 Absence Notification</h2>" +
                "<p>Dear Parent,</p>" +
                "<p>This is to inform you that your child <strong>" + escapeHtml(childName)
                + "</strong> was marked as <strong>ABSENT</strong> on <strong>" + formattedDate + "</strong>.</p>" +
                "<p>Please contact the school if you have any questions.</p>" +
                "<hr>" +
                "<p style='color: #666; font-size: 12px;'>This is an automated message from CampusCore.</p>" +
                "</body></html>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setText(html, true);
            helper.setTo(to);
            helper.setSubject("Absence Notification - " + formattedDate);
            helper.setFrom(senderEmail, senderName);
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error while sending email: " + e.getMessage());
        }
    }

    public void sendAdmissionApprovalEmail(String recipientEmail, String applicantName, String rollNumber,
            String appliedClass, String loginEmail, String temporaryPassword) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            System.err.println("Cannot send admission approval email: recipient email is empty");
            return;
        }

        String html = "<html>" +
                "<body style='font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;'>" +
                "<div style='max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>"
                +
                "<h2 style='color: #4CAF50; text-align: center;'>🎉 Admission Approved!</h2>" +
                "<p>Dear <strong>" + escapeHtml(applicantName) + "</strong>,</p>" +
                "<p>Congratulations! We are pleased to inform you that your admission application has been <strong style='color: #4CAF50;'>APPROVED</strong>.</p>"
                +
                "<div style='background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0;'>" +
                "<h3 style='color: #2e7d32; margin-top: 0;'>Your Registration Details:</h3>" +
                "<p style='margin: 10px 0;'><strong>Roll Number:</strong> <span style='font-size: 24px; color: #1976d2;'>"
                + escapeHtml(rollNumber) + "</span></p>" +
                "<p style='margin: 10px 0;'><strong>Class:</strong> " + escapeHtml(appliedClass) + "</p>" +
                "</div>" +
                "<div style='background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;'>"
                +
                "<h4 style='color: #e65100; margin-top: 0;'>Your CampusCore Login:</h4>" +
                "<p><strong>Login Email:</strong> " + escapeHtml(loginEmail) + "</p>" +
                "<p><strong>Temporary Password:</strong> <span style='font-family: monospace; font-size: 16px;'>"
                + escapeHtml(temporaryPassword) + "</span></p>" +
                "<p>Your student account has already been created. You do not need to register separately.</p>" +
                "<p>Please keep this password private. After signing in, use the Change Password option from your account menu to set your own permanent password.</p>"
                +
                "</div>" +
                "<p>If you have any questions, please feel free to contact the school administration.</p>" +
                "<p style='margin-top: 30px;'>Best regards,<br><strong>CampusCore Administration</strong></p>" +
                "<hr style='border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;'>" +
                "<p style='color: #666; font-size: 12px; text-align: center;'>This is an automated message from CampusCore.</p>"
                +
                "</div>" +
                "</body></html>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setText(html, true);
            helper.setTo(recipientEmail);
            helper.setSubject("🎉 Admission Approved - Welcome to CampusCore!");
            helper.setFrom(senderEmail, senderName);
            mailSender.send(message);
            System.out.println("Admission approval email sent successfully to: " + recipientEmail);
        } catch (MessagingException e) {
            System.err.println("Failed to send admission approval email: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error while sending admission approval email: " + e.getMessage());
        }
    }

    
    public void sendFeeReminderEmail(Student student, String feeType, Double amount, java.time.LocalDate dueDate) {
        String to = student.getEmail() != null && !student.getEmail().isBlank()
                ? student.getEmail()
                : (student.getUser() != null ? student.getUser().getEmail() : null);

        if (to == null || to.isBlank()) {
            return;
        }

        String childName = student.getDisplayName();

        String formattedDue = dueDate != null
                ? dueDate.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                : "N/A";

        String html = "<html>" +
                "<body style='font-family: Arial, sans-serif; padding: 20px;'>" +
                "<h2 style='color: #e65100;'>💰 Fee Payment Reminder</h2>" +
                "<p>Dear Parent/Guardian,</p>" +
                "<p>This is a reminder that a fee payment for <strong>" + escapeHtml(childName)
                + "</strong> is pending.</p>" +
                "<div style='background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0;'>" +
                "<p><strong>Fee Type:</strong> " + escapeHtml(feeType) + "</p>" +
                "<p><strong>Amount Due:</strong> ₹" + (amount != null ? String.format("%.2f", amount) : "N/A")
                + "</p>" +
                "<p><strong>Due Date:</strong> " + formattedDue + "</p>" +
                "</div>" +
                "<p>Please make the payment at your earliest convenience to avoid late fees.</p>" +
                "<hr>" +
                "<p style='color: #666; font-size: 12px;'>This is an automated message from CampusCore.</p>" +
                "</body></html>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setText(html, true);
            helper.setTo(to);
            helper.setSubject("Fee Payment Reminder - " + feeType);
            helper.setFrom(senderEmail, senderName);
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send fee reminder email: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error while sending fee reminder email: " + e.getMessage());
        }
    }

    private String escapeHtml(String s) {
        if (s == null)
            return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'",
                "&#39;");
    }

}
