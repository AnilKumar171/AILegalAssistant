import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { ArrowLeft, FileText, Download, Eye, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SurrenderPetitionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courtName: "Metropolitan Magistrate, Chennai", // Default court name
    crlMPNumber: "",
    crlMPYear: "",
    ccNumber: "",
    ccYear: "",
    policeStation: "",
    chennaiLocation: "Chennai", // Fixed Chennai location
    accusedName: "",
    accusedAddress: "",
    crimeNumber: "",
    offenceSection: "",
    petitionDate: "", // Single date input
    accusedCounsel: "Petitioner / Accused", // Fixed as Petitioner/Accused
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
    underlineText(formData.courtName, margin + 30, currentY, {maxWidth: 180}); // Slightly indented and max width
    currentY += 10;

    doc.setFont('helvetica', 'normal');
    doc.text("Crl. M.P. No.", margin, currentY);
    underlineText(formData.crlMPNumber, margin + 30, currentY, {maxWidth: 50});
    doc.text("of 20", margin + 90, currentY);
    underlineText(formData.crlMPYear, margin + 110, currentY, {maxWidth: 30});
    currentY += 10;
    doc.text("in", margin + 50, currentY, {align: 'center'}); // "in" centered below Crl. M.P. No.
    currentY += 10;

    doc.text("C.C. No.", margin, currentY);
    underlineText(formData.ccNumber, margin + 20, currentY, {maxWidth: 50});
    doc.text("of 20", margin + 80, currentY);
    underlineText(formData.ccYear, margin + 100, currentY, {maxWidth: 30});
    currentY += 20;

    // Parties
    doc.text("State by S.I. of Police,", margin, currentY);
    currentY += 10;
    underlineText(formData.policeStation, margin, currentY, {maxWidth: 100});
    doc.text("Police Station", margin + doc.getTextWidth(formData.policeStation) + 5, currentY);
    currentY += 10;
    underlineText(formData.chennaiLocation, margin, currentY, {maxWidth: 80});
    doc.text("... Petitioner / Accused", pageWidth - margin, currentY, { align: "right" });
    currentY += 10;

    doc.setFont('helvetica', 'bold');
    doc.text("Versus", pageWidth / 2, currentY, { align: "center" });
    doc.setFont('helvetica', 'normal');
    currentY += 10;
    doc.text("... Respondent / Complainant", pageWidth - margin, currentY, { align: "right" });
    currentY += 20;

    // Petition Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("SURRENDER PETITION", pageWidth / 2, currentY, { align: "center" });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    currentY += 20;

    // Petition Content
    let startX = margin;
    let currentLineY = currentY;
    const textLineHeight = 10;

    const petitionLines = [
        `The accused above named `,
        formData.accusedName,
        ` is a law abiding citizen and permanently residing at the above mentioned address `,
        formData.accusedAddress,
        `.`,
        `It is appears that the name of the accused has been implicated in the above Crime Number `,
        formData.crimeNumber,
        ` for an offence u/s `,
        formData.offenceSection,
        `.`,
        `And the accused being a law abiding citizen voluntarily surrenders before this Hon'ble Court.`,
        `Hence it is prayed that this Hon'ble Court may be pleased to accept the surrender of the accused and thus render justice.`
    ];

    petitionLines.forEach(linePart => {
        if (linePart.trim() !== "") {
            const lastY = underlineText(linePart, startX, currentLineY, {maxWidth: pageWidth - startX - margin});
            startX += doc.getTextWidth(linePart) + 2; // Adjust spacing
            if (lastY > currentLineY) {
              currentLineY = lastY;
              startX = margin; // Reset indent for next line part
            }
        } else {
          currentLineY += textLineHeight;
          startX = margin;
        }
    });

    currentY = currentLineY + 20;

    // Format the petition date
    const date = new Date(formData.petitionDate);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear().toString().slice(-2);

    // Date and Signature
    doc.text("Dated at Chennai on this the", margin, currentY);
    underlineText(day.toString(), margin + doc.getTextWidth("Dated at Chennai on this the ") + 5, currentY, {maxWidth: 30});
    doc.text("day of", margin + doc.getTextWidth("Dated at Chennai on this the ________") + 5, currentY);
    underlineText(month, margin + doc.getTextWidth("Dated at Chennai on this the ________ day of") + 5, currentY, {maxWidth: 80});
    underlineText(year, margin + doc.getTextWidth("Dated at Chennai on this the ________ day of _______________") + 5, currentY, {maxWidth: 40});
    currentY += 20;

    underlineText("_________________________", pageWidth - margin - 150, currentY, { align: "right", maxWidth: 150 });
    currentY += 5;
    doc.text(formData.accusedCounsel, pageWidth - margin, currentY, { align: "right" });

    // Generate preview
    const pdfDataUri = doc.output("datauristring");
    setPdfPreview(pdfDataUri);
    pdfRef.current = doc;
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (pdfRef.current) {
      pdfRef.current.save("surrender_petition.pdf");
    }
  };

  const formFields = [
    { key: "courtName", label: "Court Name", type: "text" },
    { key: "crlMPNumber", label: "Crl. M.P. No.", type: "text" },
    { key: "crlMPYear", label: "Crl. M.P. Year", type: "text" },
    { key: "ccNumber", label: "C.C. No.", type: "text" },
    { key: "ccYear", label: "C.C. Year", type: "text" },
    { key: "policeStation", label: "Police Station", type: "text" },
    { key: "accusedName", label: "Accused Name", type: "text" },
    { key: "accusedAddress", label: "Accused Address", type: "text" },
    { key: "crimeNumber", label: "Crime Number", type: "text" },
    { key: "offenceSection", label: "Offence Section (u/s)", type: "text" },
    { key: "petitionDate", label: "Petition Date", type: "date" },
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
              <h1 className="text-2xl font-bold text-gray-900">Surrender Petition</h1>
              <p className="text-gray-600">Fill in the details below to generate your Surrender Petition</p>
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
                    Fill the form and click "Generate Preview" to see the Surrender Petition here
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

export default SurrenderPetitionForm;