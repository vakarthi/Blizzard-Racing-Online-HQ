import type { AnalysisResult } from '../types';

declare const jspdf: any;

export const generatePdfReport = (result: AnalysisResult) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });
    
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;

    // --- Header ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185);
    doc.text('Blizzard Racing - Aerodynamic Analysis Report', margin, y);
    y += 10;
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text(`Vehicle Model: ${result.fileName}`, margin, y);
    y += 8;
    doc.setLineWidth(0.5);
    doc.setDrawColor(224, 224, 224);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    // --- Scrutineering Summary ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Scrutineering Summary', margin, y);
    y += 7;
    
    const scrutineering = result.scrutineeringReport;
    const scoreColor = scrutineering.finalScore > 270 ? [39, 174, 96] : scrutineering.finalScore > 240 ? [243, 156, 18] : [192, 57, 43];
    doc.setFontSize(22);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`${scrutineering.finalScore} / ${scrutineering.basePoints}`, margin, y);
    doc.setFontSize(11);
    doc.setTextColor(127, 140, 141);
    doc.text('Final Score', margin, y + 5);

    doc.setFontSize(22);
    doc.setTextColor(192, 57, 43);
    doc.text(`-${scrutineering.totalPenalty} pts`, margin + 60, y);
    doc.setFontSize(11);
    doc.setTextColor(127, 140, 141);
    doc.text('Total Penalties', margin + 60, y + 5);

    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text('Eligible for Fastest Car:', margin + 120, y);
    doc.setFontSize(16);
    if(scrutineering.isEligibleForFastestCar) {
        doc.setTextColor(39, 174, 96);
        doc.text('YES', margin + 120, y + 7);
    } else {
        doc.setTextColor(192, 57, 43);
        doc.text('NO', margin + 120, y + 7);
    }
    y += 15;

     // --- Key Metrics ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Key Aerodynamic Metrics', margin, y);
    y += 8;

    const metrics = [
        { label: 'Drag Coefficient (Cd)', value: result.dragCoefficient.toFixed(4) },
        { label: 'Downforce Coefficient (Cl)', value: result.liftCoefficient.toFixed(4) },
        { label: 'Lift-to-Drag (L/D) Ratio', value: result.liftToDragRatio.toFixed(3) },
        { label: 'Drag Force @ 80km/h', value: `${result.dragForceNewtons.toFixed(2)} N` },
        { label: 'Downforce @ 80km/h', value: `${result.downforceNewtons.toFixed(2)} N`},
        { label: 'Total Weight', value: `${result.weightGrams.toFixed(2)} g` }
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    metrics.forEach((metric, index) => {
        doc.setTextColor(44, 62, 80);
        doc.text(metric.label + ':', margin + (index % 2 === 0 ? 0 : 95), y);
        doc.setFont('helvetica', 'bold');
        doc.text(metric.value, margin + 50 + (index % 2 === 0 ? 0 : 95), y);
        if (index % 2 !== 0) y += 7;
    });
    if (metrics.length % 2 !== 0) y += 7;
    y += 5;


    // --- Suggestions ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Improvement Suggestions', margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    result.suggestions.forEach(s => {
        if (y > pageHeight - 25) {
            doc.addPage();
            y = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(`• ${s.title} (Impact: ${s.impact})`, margin, y);
        doc.setFont('helvetica', 'normal');
        const splitDescription = doc.splitTextToSize(s.description, pageWidth - margin * 2 - 5);
        doc.text(splitDescription, margin + 5, y + 4);
        y += 4 + splitDescription.length * 3.5;
        y += 3;
    });

    // --- Scrutineering Details (New Page) ---
    doc.addPage();
    y = margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text('Detailed Scrutineering Report', margin, y);
    y += 10;
    
    if (scrutineering.infractions.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(39, 174, 96);
        doc.text('Congratulations! No rule infractions were detected.', margin, y);
    } else {
        // Table Header
        doc.setFontSize(10);
        doc.setFillColor(236, 240, 241);
        doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
        doc.setTextColor(44, 62, 80);
        doc.text('Rule', margin + 2, y + 6);
        doc.text('Description', margin + 25, y + 6);
        doc.text('Type', margin + 130, y + 6);
        doc.text('Penalty', margin + 160, y + 6);
        y += 8;

        // Table Rows
        scrutineering.infractions.forEach(infraction => {
            if (y > pageHeight - 20) {
                 doc.addPage();
                 y = margin;
            }
            const descriptionLines = doc.splitTextToSize(infraction.description, 100);
            const rowHeight = descriptionLines.length * 4 + 4;
            doc.setDrawColor(224, 224, 224);
            doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

            doc.setFont('helvetica', 'bold');
            doc.text(infraction.rule, margin + 2, y + 6);
            doc.setFont('helvetica', 'normal');
            doc.text(descriptionLines, margin + 25, y + 6);
            doc.text(infraction.type, margin + 130, y + 6);
            doc.setTextColor(192, 57, 43);
            doc.setFont('helvetica', 'bold');
            doc.text(`-${infraction.penalty} pts`, margin + 160, y + 6);
            doc.setTextColor(44, 62, 80);

            y += rowHeight;
        });
    }

    doc.save(`${result.fileName}_Analysis.pdf`);
};
