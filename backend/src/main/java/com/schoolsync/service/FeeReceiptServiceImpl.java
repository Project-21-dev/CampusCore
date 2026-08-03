package com.schoolsync.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.schoolsync.entity.Fee;
import com.schoolsync.repository.FeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class FeeReceiptServiceImpl implements FeeReceiptService {

    private final FeeRepository feeRepository;

    @Override
    public byte[] generateReceipt(Long feeId) {
        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee not found"));

        if (!"Paid".equalsIgnoreCase(fee.getStatus())) {
            throw new RuntimeException("Receipt can only be generated for paid fees");
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

   
            Paragraph header = new Paragraph("SCHOOL SYNC")
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(new DeviceRgb(41, 128, 185));
            document.add(header);

            Paragraph subHeader = new Paragraph("Fee Payment Receipt")
                    .setFontSize(16)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(subHeader);

            // Receipt Number
            Paragraph receiptNo = new Paragraph("Receipt No: " + fee.getReceiptNumber())
                    .setFontSize(12)
                    .setBold()
                    .setTextAlignment(TextAlignment.RIGHT);
            document.add(receiptNo);

            // Date
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy");
            Paragraph date = new Paragraph(
                    "Date: " + (fee.getPaidDate() != null ? fee.getPaidDate().format(formatter) : "N/A"))
                    .setFontSize(11)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setMarginBottom(20);
            document.add(date);

            // Student Details Table
            Table studentTable = new Table(UnitValue.createPercentArray(new float[] { 1, 2 }))
                    .useAllAvailableWidth()
                    .setMarginBottom(20);

            addTableHeader(studentTable, "Student Information");
            addTableRow(studentTable, "Student Name:", fee.getStudent().getUser().getUsername());
            addTableRow(studentTable, "Roll Number:", fee.getStudent().getRollNo());
            addTableRow(studentTable, "Class:", fee.getStudent().getClassName());
            addTableRow(studentTable, "Email:",
                    fee.getStudent().getEmail() != null ? fee.getStudent().getEmail() : "N/A");

            document.add(studentTable);

            // Fee Details Table
            Table feeTable = new Table(UnitValue.createPercentArray(new float[] { 1, 2 }))
                    .useAllAvailableWidth()
                    .setMarginBottom(20);

            addTableHeader(feeTable, "Fee Details");
            addTableRow(feeTable, "Fee Type:", fee.getFeeType());
            addTableRow(feeTable, "Amount:", "₹" + String.format("%.2f", fee.getAmount()));
            addTableRow(feeTable, "Due Date:", fee.getDueDate() != null ? fee.getDueDate().format(formatter) : "N/A");
            addTableRow(feeTable, "Payment Date:",
                    fee.getPaidDate() != null ? fee.getPaidDate().format(formatter) : "N/A");
            addTableRow(feeTable, "Payment Method:", fee.getPaymentMethod() != null ? fee.getPaymentMethod() : "N/A");
            addTableRow(feeTable, "Transaction ID:", fee.getTransactionId() != null ? fee.getTransactionId() : "N/A");
            addTableRow(feeTable, "Status:", fee.getStatus());

            document.add(feeTable);

            // Amount in Words (simplified)
            Paragraph amountWords = new Paragraph(
                    "Amount in Words: " + convertToWords(fee.getAmount()) + " Rupees Only")
                    .setFontSize(11)
                    .setBold()
                    .setMarginBottom(30);
            document.add(amountWords);

            // Footer
            Paragraph footer = new Paragraph("This is a computer-generated receipt and does not require a signature.")
                    .setFontSize(9)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setItalic()
                    .setFontColor(ColorConstants.GRAY);
            document.add(footer);

            Paragraph thankYou = new Paragraph("Thank you for your payment!")
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setBold()
                    .setMarginTop(10);
            document.add(thankYou);

            document.close();

            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF receipt: " + e.getMessage(), e);
        }
    }

    private void addTableHeader(Table table, String headerText) {
        Cell headerCell = new Cell(1, 2)
                .add(new Paragraph(headerText).setBold().setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(new DeviceRgb(52, 152, 219))
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(8);
        table.addHeaderCell(headerCell);
    }

    private void addTableRow(Table table, String label, String value) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label).setBold())
                .setBackgroundColor(new DeviceRgb(236, 240, 241))
                .setPadding(5);
        Cell valueCell = new Cell()
                .add(new Paragraph(value))
                .setPadding(5);
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private String convertToWords(Double amount) {
        // Simplified number to words conversion
        if (amount == null)
            return "Zero";

        String[] ones = { "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine" };
        String[] tens = { "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety" };
        String[] teens = { "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
                "Eighteen", "Nineteen" };

        int num = amount.intValue();
        if (num == 0)
            return "Zero";

        String result = "";

        // Lakhs
        if (num >= 100000) {
            int lakhs = num / 100000;
            result += convertTwoDigits(lakhs, ones, tens, teens) + " Lakh ";
            num %= 100000;
        }

        // Thousands
        if (num >= 1000) {
            int thousands = num / 1000;
            result += convertTwoDigits(thousands, ones, tens, teens) + " Thousand ";
            num %= 1000;
        }

        // Hundreds
        if (num >= 100) {
            result += ones[num / 100] + " Hundred ";
            num %= 100;
        }

        // Remaining
        if (num > 0) {
            result += convertTwoDigits(num, ones, tens, teens);
        }

        return result.trim();
    }

    private String convertTwoDigits(int num, String[] ones, String[] tens, String[] teens) {
        if (num < 10) {
            return ones[num];
        } else if (num < 20) {
            return teens[num - 10];
        } else {
            return tens[num / 10] + " " + ones[num % 10];
        }
    }
}
