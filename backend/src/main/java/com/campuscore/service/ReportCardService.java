package com.campuscore.service;

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
import com.campuscore.entity.Result;
import com.campuscore.entity.Student;
import com.campuscore.repository.AttendanceRepository;
import com.campuscore.repository.ResultRepository;
import com.campuscore.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportCardService {

    private final StudentRepository studentRepository;
    private final ResultRepository resultRepository;
    private final AttendanceRepository attendanceRepository;

    public byte[] generateReportCard(Long studentId, String academicYear) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Result> results = resultRepository.findByStudentStudentId(studentId);
        if (academicYear != null && !academicYear.isBlank()) {
            results = results.stream()
                    .filter(r -> academicYear.equals(r.getAcademicYear()))
                    .toList();
        }

        long presentDays = attendanceRepository.findByStudentStudentId(studentId).stream()
                .filter(a -> "Present".equalsIgnoreCase(a.getStatus())).count();
        long totalDays = attendanceRepository.findByStudentStudentId(studentId).size();
        double attendancePct = totalDays > 0 ? (presentDays * 100.0) / totalDays : 0.0;

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            Paragraph header = new Paragraph("CAMPUSCORE")
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(new DeviceRgb(41, 128, 185));
            document.add(header);

            Paragraph subHeader = new Paragraph("Student Report Card")
                    .setFontSize(16)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(subHeader);

            Table studentTable = new Table(UnitValue.createPercentArray(new float[] { 1, 2 }))
                    .useAllAvailableWidth()
                    .setMarginBottom(20);
            addTableHeader(studentTable, "Student Information");
            addTableRow(studentTable, "Student Name:",
                    student.getUser() != null ? student.getUser().getUsername() : "N/A");
            addTableRow(studentTable, "Roll Number:", student.getRollNo());
            addTableRow(studentTable, "Class:", student.getClassName());
            addTableRow(studentTable, "Attendance:", String.format("%.1f%%", attendancePct));
            document.add(studentTable);

            if (results.isEmpty()) {
                document.add(new Paragraph("No results recorded yet.").setItalic());
            } else {
                Table resultsTable = new Table(UnitValue.createPercentArray(new float[] { 2, 1, 1, 1, 1, 2 }))
                        .useAllAvailableWidth()
                        .setMarginBottom(20);

                addResultHeaderCell(resultsTable, "Subject");
                addResultHeaderCell(resultsTable, "Exam Type");
                addResultHeaderCell(resultsTable, "Marks");
                addResultHeaderCell(resultsTable, "%");
                addResultHeaderCell(resultsTable, "Grade");
                addResultHeaderCell(resultsTable, "Academic Year");

                double totalPct = 0;
                for (Result r : results) {
                    resultsTable.addCell(new Cell().add(new Paragraph(r.getSubject())).setPadding(5));
                    resultsTable.addCell(new Cell().add(new Paragraph(r.getExamType())).setPadding(5));
                    resultsTable.addCell(new Cell()
                            .add(new Paragraph(r.getMarks() + "/" + r.getMaxMarks())).setPadding(5));
                    resultsTable.addCell(
                            new Cell().add(new Paragraph(String.format("%.1f", r.getPercentage()))).setPadding(5));
                    resultsTable.addCell(new Cell().add(new Paragraph(r.getGrade())).setPadding(5));
                    resultsTable.addCell(new Cell().add(new Paragraph(r.getAcademicYear())).setPadding(5));
                    totalPct += r.getPercentage();
                }
                document.add(resultsTable);

                double avgPct = totalPct / results.size();
                Paragraph overall = new Paragraph("Overall Average: " + String.format("%.2f%%", avgPct))
                        .setFontSize(13)
                        .setBold()
                        .setMarginBottom(20);
                document.add(overall);
            }

            Paragraph footer = new Paragraph("This is a computer-generated report card and does not require a signature.")
                    .setFontSize(9)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setItalic()
                    .setFontColor(ColorConstants.GRAY);
            document.add(footer);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating report card PDF: " + e.getMessage(), e);
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
        Cell valueCell = new Cell().add(new Paragraph(value)).setPadding(5);
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addResultHeaderCell(Table table, String text) {
        Cell cell = new Cell()
                .add(new Paragraph(text).setBold().setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(new DeviceRgb(52, 152, 219))
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(6);
        table.addHeaderCell(cell);
    }
}
