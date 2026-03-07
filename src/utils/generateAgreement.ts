import { jsPDF } from 'jspdf';
import {
    getServiceAgreementSections,
    AgreementClientData,
} from './serviceAgreementText';

const COMPANY_NAME = 'Citus Recovery Solutions LLC';

/**
 * Generates and downloads a signed Service Agreement as a PDF file.
 */
export const generateSignedAgreement = async (
    clientData: AgreementClientData,
    signatureDataUrl: string | null
): Promise<Blob> => {
    const sections = getServiceAgreementSections(clientData);
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
    });

    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;

    // Helper for adding multi-line text
    const addWrappedText = (text: string, fontSize: number, isBold: boolean = false, spacing: number = 7) => {
        doc.setFont('times', isBold ? 'bold' : 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(0, 0, 0); // Always black

        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, margin, y);
            y += spacing;
        });
        return y;
    };

    // Title
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('SURPLUS FUNDS SERVICES AGREEMENT', pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Agreement sections
    for (const section of sections) {
        // Section heading
        if (y > 260) {
            doc.addPage();
            y = 20;
        }

        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.text(section.heading, margin, y);
        y += 7;

        // Section body
        if (section.body) {
            addWrappedText(section.body, 10, false, 5);
            y += 2;
        }

        // Bullet points
        if (section.bullets) {
            for (const bullet of section.bullets) {
                addWrappedText(`• ${bullet}`, 10, false, 5);
                y += 1;
            }
            y += 4;
        }
    }

    // Signature block
    if (y > 220) {
        doc.addPage();
        y = 20;
    }

    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;

    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text('SIGNATURES', margin, y);
    y += 10;

    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.text('Client Signature:', margin, y);
    y += 5;

    // Embed signature
    if (signatureDataUrl) {
        try {
            // Signature is already in DataURL format
            doc.addImage(signatureDataUrl, 'PNG', margin, y, 60, 20);
            y += 25;
        } catch (err) {
            console.error('Error adding signature to PDF:', err);
            doc.setFont('times', 'italic');
            doc.text('[Signature on file]', margin, y);
            y += 10;
        }
    } else {
        doc.line(margin, y + 5, margin + 60, y + 5);
        y += 15;
    }

    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text(`Print Name: ${clientData.clientName}`, margin, y);
    y += 7;
    doc.text(`Date: ${clientData.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
    y += 15;

    doc.setFont('times', 'bold');
    doc.text(`Company Representative: ${COMPANY_NAME}`, margin, y);
    y += 10;
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, y, margin + 80, y);

    const safeName = clientData.clientName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Services_Agreement_${safeName}.pdf`;
    doc.save(fileName);

    // Return blob for storage upload
    return doc.output('blob');
};
