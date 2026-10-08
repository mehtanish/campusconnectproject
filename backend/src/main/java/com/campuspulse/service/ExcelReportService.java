package com.campuspulse.service;

import com.campuspulse.model.Complaint;
import com.campuspulse.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelReportService {

    private final ComplaintRepository complaintRepository;

    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public byte[] generateComplaintsReport() throws IOException {
        List<Complaint> complaints = complaintRepository.findAllByOrderByPriorityScoreDesc();

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Complaints Report");

            CellStyle headerStyle = createHeaderStyle(workbook);

            Row headerRow = sheet.createRow(0);
            String[] headers = {"Title", "Category", "Location", "Status",
                    "Priority Score", "Upvotes", "Student", "Admin Note", "Created"};

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (Complaint c : complaints) {
                Row row = sheet.createRow(rowNum++);

                row.createCell(0).setCellValue(c.getTitle());
                row.createCell(1).setCellValue(c.getCategory().getName());
                row.createCell(2).setCellValue(c.getLocationPath());

                Cell statusCell = row.createCell(3);
                statusCell.setCellValue(c.getStatus().name());
                statusCell.setCellStyle(createStatusStyle(workbook, c.getStatus().name()));

                row.createCell(4).setCellValue(c.getPriorityScore());
                row.createCell(5).setCellValue(c.getUpvoteCount());
                row.createCell(6).setCellValue(c.getStudent().getName());
                row.createCell(7).setCellValue(c.getAdminNote() != null ? c.getAdminNote() : "—");
                row.createCell(8).setCellValue(
                        c.getCreatedAt() != null ? c.getCreatedAt().format(DATETIME_FMT) : "—");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 512);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private CellStyle createHeaderStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();

        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);

        // Indigo background
        style.setFillForegroundColor(new XSSFColor(new byte[]{79, 70, (byte) 229}, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        return style;
    }

    private CellStyle createStatusStyle(XSSFWorkbook workbook, String status) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);

        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 10);

        switch (status) {
            case "RESOLVED":
                font.setColor(new XSSFColor(new byte[]{16, (byte) 185, (byte) 129}, null)); // Emerald
                break;
            case "IN_PROGRESS":
                font.setColor(new XSSFColor(new byte[]{(byte) 245, (byte) 158, 11}, null)); // Amber
                break;
            case "REJECTED":
                font.setColor(new XSSFColor(new byte[]{(byte) 239, 68, 68}, null)); // Rose
                break;
            default:
                font.setColor(new XSSFColor(new byte[]{100, 116, (byte) 139}, null)); // Slate
                break;
        }

        style.setFont(font);
        return style;
    }
}
