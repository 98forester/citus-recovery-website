import {
    Document,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    ImageRun,
    Packer,
    BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import {
    getServiceAgreementSections,
    AgreementClientData,
} from './serviceAgreementText';

const COMPANY_NAME = 'Citus Recovery Solutions LLC';

/**
 * Generates and downloads a signed Service Agreement as a .docx file.
 */
export const generateSignedAgreement = async (
    clientData: AgreementClientData,
    signatureDataUrl: string | null
) => {
    const sections = getServiceAgreementSections(clientData);
    const children: Paragraph[] = [];

    // Title
    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: 'SURPLUS FUNDS SERVICES AGREEMENT',
                    bold: true,
                    size: 32,
                    font: 'Times New Roman',
                    color: '000000',
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
        })
    );

    // Agreement sections
    for (const section of sections) {
        // Section heading
        children.push(
            new Paragraph({
                text: section.heading,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 100 },
                run: {
                    bold: true,
                    size: 24,
                    font: 'Times New Roman',
                    color: '000000',
                },
            })
        );

        // Section body
        if (section.body) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: section.body,
                            size: 22,
                            font: 'Times New Roman',
                            color: '000000',
                        }),
                    ],
                    spacing: { after: 100 },
                })
            );
        }

        // Bullet points
        if (section.bullets) {
            for (const bullet of section.bullets) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: bullet,
                                size: 22,
                                font: 'Times New Roman',
                                color: '000000',
                            }),
                        ],
                        bullet: { level: 0 },
                        spacing: { after: 60 },
                    })
                );
            }
        }
    }

    // Signature block
    children.push(
        new Paragraph({
            children: [new TextRun({ text: '' })],
            spacing: { before: 600 },
            border: {
                top: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: '999999',
                },
            },
        })
    );

    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: 'SIGNATURES',
                    bold: true,
                    size: 24,
                    font: 'Times New Roman',
                    color: '000000',
                }),
            ],
            spacing: { before: 300, after: 200 },
        })
    );

    // Client signature
    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: 'Client Signature:',
                    bold: true,
                    size: 22,
                    font: 'Times New Roman',
                    color: '000000',
                }),
            ],
            spacing: { after: 100 },
        })
    );

    // Embed the signature image if available
    if (signatureDataUrl) {
        try {
            const response = await fetch(signatureDataUrl);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            children.push(
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: uint8Array,
                            transformation: { width: 300, height: 100 },
                            type: 'png',
                        }),
                    ],
                    spacing: { after: 100 },
                })
            );
        } catch {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '[Signature on file]',
                            italics: true,
                            size: 22,
                            color: '000000',
                            font: 'Times New Roman',
                        }),
                    ],
                    spacing: { after: 100 },
                })
            );
        }
    }

    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: `Print Name: ${clientData.clientName}`,
                    size: 22,
                    font: 'Times New Roman',
                    color: '000000',
                }),
            ],
            spacing: { after: 100 },
        })
    );

    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: `Date: ${clientData.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
                    size: 22,
                    font: 'Times New Roman',
                    color: '000000',
                }),
            ],
            spacing: { after: 300 },
        })
    );

    // Company signature block
    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: `Company Representative: ${COMPANY_NAME}`,
                    bold: true,
                    size: 22,
                    font: 'Times New Roman',
                    color: '000000',
                }),
            ],
            spacing: { after: 100 },
        })
    );

    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: '___________________________',
                    size: 22,
                    font: 'Times New Roman',
                    color: '000000',
                }),
            ],
            spacing: { after: 100 },
        })
    );

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 1440,
                            right: 1440,
                            bottom: 1440,
                            left: 1440,
                        },
                    },
                },
                children,
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    const safeName = clientData.clientName.replace(/[^a-zA-Z0-9]/g, '_');
    saveAs(blob, `Services_Agreement_${safeName}.docx`);
};
