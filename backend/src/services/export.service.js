const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const userModel = require("../models/user.models");
const interviewReportModel = require("../models/interviewReportModel");
const mockInterviewModel = require("../models/mockInterview.model");
const aiAnalyticsModel = require("../models/aiAnalytics.model");

// CSV Helper: escape cells and write lines directly to writable stream
const writeCsvRow = (stream, cells) => {
    const escaped = cells.map(cell => {
        if (cell === null || cell === undefined) return "";
        const str = String(cell);
        if (/[",\n\r]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    });
    stream.write(escaped.join(",") + "\r\n");
};

// Excel Helper: Stream rows into xlsx workbook writer directly to response
const exportExcel = async (res, cursor, columns, rowMapper) => {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
        stream: res,
        useStyles: true,
        useSharedStrings: true
    });
    const worksheet = workbook.addWorksheet("Export Data");
    
    // Set columns structure
    worksheet.columns = columns.map(col => ({
        header: col.header,
        key: col.key,
        width: col.width || 20
    }));

    // Style headers row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F2937' } // Charcoal Gray
    };
    headerRow.commit();

    let doc;
    while ((doc = await cursor.next())) {
        const mapped = rowMapper(doc);
        const row = worksheet.addRow(mapped);
        row.commit();
    }

    worksheet.commit();
    await workbook.commit();
};

// PDF Helper: Generate styled, tabular PDF reports and pipe directly to response
const exportPdf = async (res, cursor, title, columns, rowMapper) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);

    // Render professional corporate header
    doc.fillColor("#1F2937").rect(0, 0, 595.28, 80).fill(); // Full A4 width charcoal banner (595.28 pt)
    
    doc.fillColor("#FFFFFF")
       .font("Helvetica-Bold")
       .fontSize(18)
       .text("NEURAL FORGE", 30, 22)
       .fontSize(9)
       .font("Helvetica")
       .text(`SYSTEM DATA EXPORT REPORT: ${title.toUpperCase()}`, 30, 48);

    doc.fillColor("#FFFFFF")
       .fontSize(8)
       .text(`Generated: ${new Date().toLocaleString()}`, 400, 48, { align: 'right', width: 165 });

    let y = 110;
    
    const drawTableHeaders = () => {
        // Table header background
        doc.fillColor("#E5E7EB").rect(30, y, 535.28, 20).fill();
        doc.fillColor("#1F2937").font("Helvetica-Bold").fontSize(8);
        
        let currentX = 35;
        columns.forEach(col => {
            doc.text(col.header, currentX, y + 6, { width: col.pdfWidth - 4, lineBreak: false });
            currentX += col.pdfWidth;
        });
        
        y += 20;
        doc.font("Helvetica").fontSize(7.5);
    };

    drawTableHeaders();

    let record;
    let rowIndex = 0;
    while ((record = await cursor.next())) {
        const rowData = rowMapper(record);
        
        // Page overflow protection
        if (y > 770) {
            doc.addPage();
            y = 40;
            drawTableHeaders();
        }

        // Alternating row styling
        if (rowIndex % 2 === 1) {
            doc.fillColor("#F9FAFB").rect(30, y, 535.28, 16).fill();
        }

        doc.fillColor("#374151"); // Charcoal text
        let currentX = 35;
        columns.forEach(col => {
            const rawVal = rowData[col.key];
            const val = rawVal !== undefined && rawVal !== null ? String(rawVal) : "";
            doc.text(val, currentX, y + 4, { width: col.pdfWidth - 4, lineBreak: false });
            currentX += col.pdfWidth;
        });

        y += 16;
        rowIndex++;
    }

    doc.end();
};

/**
 * Driver function to route exports to the correct streaming writer.
 */
const exportStream = async (res, format, cursor, columns, rowMapper, title) => {
    if (format === 'csv') {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${title.toLowerCase().replace(/\s+/g, '_')}_export.csv"`);
        
        // Write header
        writeCsvRow(res, columns.map(c => c.header));
        
        let doc;
        while ((doc = await cursor.next())) {
            const mapped = rowMapper(doc);
            writeCsvRow(res, columns.map(c => mapped[c.key]));
        }
        res.end();
    } else if (format === 'xlsx') {
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${title.toLowerCase().replace(/\s+/g, '_')}_export.xlsx"`);
        
        await exportExcel(res, cursor, columns, rowMapper);
    } else if (format === 'pdf') {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${title.toLowerCase().replace(/\s+/g, '_')}_export.pdf"`);
        
        await exportPdf(res, cursor, title, columns, rowMapper);
    } else {
        throw new Error("Invalid export format requested. Supported: csv, xlsx, pdf");
    }
};

module.exports = {
    exportStream
};
