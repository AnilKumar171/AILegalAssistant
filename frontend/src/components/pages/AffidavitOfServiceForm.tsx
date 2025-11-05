import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { ArrowLeft, FileText, Download, Eye, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AffidavitOfServiceForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courtName: "Chennai", // Default court name as per the template
    iaNumber: "",
    iaYear: "",
    osNumber: "",
    osYear: "",
    petitionerName: "",
    respondentName: "",
    affiantName: "",
    affiantAge: "",
    affiantFatherName: "",
    affiantAddress: "",
    returnableDate: "",
    affirmationDate: "", // Single date input
    advocateName: "Advocate, Chennai", // Default advocate location
  });

  const [pdfPreview, setPdfPreview] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const generatePDF = () => {
    setIsGenerating(true);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let currentY = 30;

    // Helper function to format and underline text
    const underlineText = (text: string, x: number, y: number, options?: { align?: "left" | "center" | "right", maxWidth?: number }) => {
      const align = options?.align || "left";
      const maxWidth = options?.maxWidth;
      let textWidth = doc.getTextWidth(text);

      if (maxWidth && textWidth > maxWidth) {
        const words = text.split(" ");
        let line = "";
        words.forEach(word => {
          const tempLine = line ? `${line} ${word}` : word;
          const tempWidth = doc.getTextWidth(tempLine);
          if (tempWidth <= maxWidth) {
            line = tempLine;
          } else {
            doc.text(line, x, y, { align });
            doc.setLineWidth(0.5);
            if (align === "center") {
              doc.line(x - doc.getTextWidth(line) / 2, y + 1, x + doc.getTextWidth(line) / 2, y + 1);
            } else if (align === "right") {
              doc.line(x - doc.getTextWidth(line), y + 1, x, y + 1);
            } else {
              doc.line(x, y + 1, x + doc.getTextWidth(line), y + 1);
            }
            y += 10; // Line height
            line = word;
          }
        });
        doc.text(line, x, y, { align });
        doc.setLineWidth(0.5);
        if (align === "center") {
          doc.line(x - doc.getTextWidth(line) / 2, y + 1, x + doc.getTextWidth(line) / 2, y + 1);
        } else if (align === "right") {
          doc.line(x - doc.getTextWidth(line), y + 1, x, y + 1);
        } else {
          doc.line(x, y + 1, x + doc.getTextWidth(line), y + 1);
        }
        return y; // Return the updated Y position
      } else {
        doc.text(text, x, y, { align });
        doc.setLineWidth(0.5);
        if (align === "center") {
          doc.line(x - textWidth / 2, y + 1, x + textWidth / 2, y + 1);
        } else if (align === "right") {
          doc.line(x - textWidth, y + 1, x, y + 1);
        } else {
          doc.line(x, y + 1, x + textWidth, y + 1);
        }
        return y;
      }
    };

    // Set font and size
    doc.setFontSize(12);

    // Header
    doc.setFont('helvetica', 'bold');
    doc.text("In the Court of", margin, currentY);
    currentY += 10;
    underlineText(formData.courtName, margin + 25, currentY, {maxWidth: 150}); // Slightly indented and max width
    currentY += 20; // Add space after court name

    doc.setFont('helvetica', 'normal');
    doc.text("I.A. No.", margin, currentY);
    underlineText(formData.iaNumber, margin + 20, currentY, {maxWidth: 50});
    doc.text("of 20", margin + 80, currentY);
    underlineText(formData.iaYear, margin + 98, currentY, {maxWidth: 30});
    currentY += 10;
    doc.text("In", margin + 50, currentY, {align: 'center'}); // "In" centered below I.A. No.
    currentY += 10;

    doc.text("O.S. No.", margin, currentY);
    underlineText(formData.osNumber, margin + 20, currentY, {maxWidth: 50});
    doc.text("of 20", margin + 80, currentY);
    underlineText(formData.osYear, margin + 98, currentY, {maxWidth: 30});
    currentY += 20;

    // Title Line
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    // Parties
    underlineText(formData.petitionerName, margin, currentY, {maxWidth: 200});
    doc.text("... Petitioner / Applicant / Plaintiff", pageWidth - margin, currentY, { align: "right" });
    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text("Versus", pageWidth / 2, currentY, { align: "center" });
    doc.setFont('helvetica', 'normal');
    currentY += 10;
    underlineText(formData.respondentName, margin, currentY, {maxWidth: 200});
    doc.text("... Respondent / Defendant", pageWidth - margin, currentY, { align: "right" });
    currentY += 20;

    // Affidavit Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("Affidavit of Service", pageWidth / 2, currentY, { align: "center" });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    currentY += 20;

    // Affidavit Content
    let startX = margin + 10;
    let currentLineY = currentY;

    const textLineHeight = 10;

    const affidavitLines = [
        `I, `,
        formData.affiantName,
        `, son of `,
        formData.affiantFatherName,
        `, aged about `,
        formData.affiantAge,
        ` years, residing at `,
        formData.affiantAddress,
        ` hereby solemnly affirm and sincerely state as follows:`,
        `1. I am the registered clerk of the Petitioner's Counsel on record / I am the Counsel on Record for the Petitioner and as such I am well aware of the facts of the case.`,
        `2. In the above Application / Petition, notice to the respondent was ordered returnable by `,
        formData.returnableDate,
        ` 20__ . As per the orders of this Hon'ble Court, notice is taken out to the Respondent. The copy of the notice along with acknowledgement is enclosed herein, as proof of service.`,
        `3. The Registered cover sent to the Respondent has been returned to the sender with an endorsement that the addressee has left / has refused to receive / has not claimed.`,
        `4. This may kindly be recorded and pray this Hon'ble Court to pass further orders.`
    ];

    affidavitLines.forEach(linePart => {
        if (linePart.startsWith('1.') || linePart.startsWith('2.') || linePart.startsWith('3.') || linePart.startsWith('4.')) {
            doc.text(linePart, margin, currentLineY);
            currentLineY += textLineHeight;
            startX = margin + 10; // Indent for subsequent lines within numbered points if needed
        } else if (linePart === ',') {
          doc.text(',', startX, currentLineY);
          startX += doc.getTextWidth(',') + 2; // Adjust spacing after comma
        }
        else if (linePart.trim() !== "") {
            const lastY = underlineText(linePart, startX, currentLineY, {maxWidth: pageWidth - startX - margin});
            startX += doc.getTextWidth(linePart) + 2; // Adjust spacing
            if (lastY > currentLineY) {
              currentLineY = lastY;
              startX = margin + 10; // Reset indent for next line part
            }
        }
    });

    currentY = currentLineY + 15;

    // Format the affirmation date
    const date = new Date(formData.affirmationDate);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear().toString().slice(-2);

    // Bottom section
    doc.text("Solemnly affirmed at Chennai on this the", margin, currentY);
    underlineText(day.toString(), margin + doc.getTextWidth("Solemnly affirmed at Chennai on this the ") + 5, currentY, {maxWidth: 30});
    doc.text("day of", margin + doc.getTextWidth("Solemnly affirmed at Chennai on this the ........") + 5, currentY);
    underlineText(month, margin + doc.getTextWidth("Solemnly affirmed at Chennai on this the ........day of") + 5, currentY, {maxWidth: 80});
    underlineText(year, margin + doc.getTextWidth("Solemnly affirmed at Chennai on this the ........day of......................") + 5, currentY, {maxWidth: 40});
    currentY += 10;
    doc.text("and signed his name in my presence", margin, currentY);
    currentY += 20;

    doc.text("Before me", pageWidth - margin - 80, currentY);
    currentY += 20;

    underlineText("_________________________", margin, currentY, {maxWidth: 150});
    underlineText(formData.advocateName, pageWidth - margin - 100, currentY, {maxWidth: 100});
    currentY += 5;
    doc.text("Counsel for Petitioner / Applicant / Plaintiff", margin, currentY);
    doc.text(formData.advocateName.split(',')[0], pageWidth - margin - 80, currentY); // Just the name, not location

    // Generate preview
    const pdfDataUri = doc.output("datauristring");
    setPdfPreview(pdfDataUri);
    pdfRef.current = doc;
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (pdfRef.current) {
      pdfRef.current.save("affidavit_of_service.pdf");
    }
  };

  const formFields = [
    { key: "courtName", label: "Court Name", type: "text" },
    { key: "iaNumber", label: "I.A. Number", type: "text" },
    { key: "iaYear", label: "I.A. Year", type: "text" },
    { key: "osNumber", label: "O.S. Number", type: "text" },
    { key: "osYear", label: "O.S. Year", type: "text" },
    { key: "petitionerName", label: "Petitioner/Applicant/Plaintiff Name", type: "text" },
    { key: "respondentName", label: "Respondent/Defendant Name", type: "text" },
    { key: "affiantName", label: "Affiant's Name", type: "text" },
    { key: "affiantFatherName", label: "Affiant's Father's Name", type: "text" },
    { key: "affiantAge", label: "Affiant's Age", type: "number" },
    { key: "affiantAddress", label: "Affiant's Address", type: "text" },
    { key: "returnableDate", label: "Returnable Date (Day Month)", type: "text" },
    { key: "affirmationDate", label: "Affirmation Date", type: "date" },
    { key: "advocateName", label: "Advocate Details", type: "text" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/forms')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
          Back to Forms
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Affidavit of Service</h1>
              <p className="text-gray-600">Fill in the details below to generate your Affidavit of Service</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Please ensure all information provided is accurate and matches your legal documents.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formFields.map(({ key, label, type }) => (
                  <div key={key} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {label}
                    </label>
                    <input
                      type={type}
                      name={key}
                      value={formData[key as keyof typeof formData]}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-5 h-5" />
                {isGenerating ? "Generating Preview..." : "Generate Preview"}
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Preview</h2>
              {pdfPreview ? (
                <div className="space-y-4">
                  <iframe
                    src={pdfPreview}
                    className="w-full h-[600px] rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>
                </div>
              ) : (
                <div className="h-[600px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">
                    Fill the form and click "Generate Preview" to see the PDF here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffidavitOfServiceForm;