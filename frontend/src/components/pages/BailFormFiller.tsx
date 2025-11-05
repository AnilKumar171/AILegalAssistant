import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { ArrowLeft, FileText, Download, Eye, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BailFormFiller = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courtLocation: "Metropolitan Magistrate, Chennai", // Hardcoded as per the image, can be dynamic if needed
    ccNumber: "",
    year: "",
    policeStation: "",
    petitionerAccused: "",
    respondentComplainant: "State by S.I. of Police,", // Partially hardcoded
    arrestedOffenceSection: "",
    petitionDate: "", // For "Dated at Chennai"
    counselName: "",
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
    const marginX = 20;
    let currentY = 20;
    const lineHeight = 10;

    // Helper function to format and underline text
    const underlineText = (text: string, x: number, y: number, options?: { align?: "left" | "center" | "right" }) => {
      const textWidth = doc.getTextWidth(text);
      doc.text(text, x, y, options);
      doc.setLineWidth(0.3);
      if (options?.align === "center") {
        doc.line(x - textWidth / 2, y + 1, x + textWidth / 2, y + 1);
      } else if (options?.align === "right") {
        doc.line(x - textWidth, y + 1, x, y + 1);
      } else {
        doc.line(x, y + 1, x + textWidth, y + 1);
      }
    };

    // Set font and size
    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    // Header Section
    doc.setFontSize(14);
    doc.text(`In the Court of`, marginX, currentY);
    currentY += lineHeight;
    doc.setFontSize(16);
    underlineText(formData.courtLocation.split(',')[0], marginX + 40, currentY); // Underline only "Metropolitan Magistrate"
    doc.text(`, ${formData.courtLocation.split(',')[1]}`, marginX + 40 + doc.getTextWidth(formData.courtLocation.split(',')[0]), currentY); // Add ", Chennai" without underline
    currentY += 2 * lineHeight;

    // Case Number
    doc.setFontSize(12);
    doc.text(`C.C. No.`, marginX, currentY);
    underlineText(formData.ccNumber, marginX + 25, currentY);
    doc.text(`of 20`, marginX + 25 + doc.getTextWidth(formData.ccNumber) + 5, currentY);
    underlineText(formData.year, marginX + 25 + doc.getTextWidth(formData.ccNumber) + 30, currentY);
    currentY += 2 * lineHeight;

    // Petitioner/Accused
    underlineText(formData.petitionerAccused, pageWidth - marginX - 100, currentY, { align: 'right' });
    doc.text(`... Petitioner / Accused`, pageWidth - marginX, currentY, { align: 'right' });
    currentY += lineHeight;

    // Versus
    doc.text(`Versus`, pageWidth / 2, currentY, { align: 'center' });
    currentY += lineHeight;

    // Respondent/Complainant
    doc.text(`${formData.respondentComplainant}`, marginX, currentY);
    underlineText(formData.policeStation, marginX + doc.getTextWidth(`${formData.respondentComplainant} `), currentY);
    doc.text(`, ${formData.courtLocation.split(',')[1]}`, marginX + doc.getTextWidth(`${formData.respondentComplainant} ${formData.policeStation} `), currentY); // Add ", Chennai" without underline
    doc.text(`... Respondent / Complainant`, pageWidth - marginX, currentY, { align: 'right' });
    currentY += 2 * lineHeight;

    // Petition Title
    doc.setFontSize(14);
    doc.text(`Petition for Bail u/s 436 / 437 Cr. P.C.`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 2 * lineHeight;
    doc.setFontSize(12);

    // Content - Standard Clauses
    const startContentY = currentY;
    const leftContentX = marginX + 10; // Indentation for content

    doc.text(`The petitioner / accused submits as follows:`, marginX, currentY);
    currentY += 1.5 * lineHeight;
    doc.text(`The petitioner / accused was arrested by the respondent for the alleged offence u/s`, leftContentX, currentY);
    underlineText(formData.arrestedOffenceSection, leftContentX + doc.getTextWidth(`The petitioner / accused was arrested by the respondent for the alleged offence u/s `), currentY);
    currentY += 1.5 * lineHeight;
    doc.text(`The petitioner / accused submits that he is innocent of the said commission of the offence.`, leftContentX, currentY);
    currentY += 1.5 * lineHeight;
    doc.text(`The petitioner / accused undertakes to co-operate with the respondent in the investigation.`, leftContentX, currentY);
    currentY += 1.5 * lineHeight;
    doc.text(`The petitioner / accused assures that he will not tamper any of the witnesses.`, leftContentX, currentY);
    currentY += 1.5 * lineHeight;
    doc.text(`The petitioner / accused undertakes to appear regularly whenever and wherever he is ordered`, leftContentX, currentY);
    currentY += lineHeight;
    doc.text(`to do so by this Hon'ble Court and he will abide by any other condition this Hon'ble Court may`, leftContentX, currentY);
    currentY += lineHeight;
    doc.text(`be pleased to impose.`, leftContentX, currentY);
    currentY += 2 * lineHeight;
    doc.text(`Hence it is prayed that this Hon'ble Court may be pleased to enlarge the petitioner /`, marginX, currentY);
    currentY += lineHeight;
    doc.text(`accused on bail and thus render justice.`, marginX, currentY);
    currentY += 2 * lineHeight;


    // Date and Signature
    const [petitionDay, petitionMonth, petitionYear] = formData.petitionDate.split("-");
    doc.text(`Dated at Chennai on this the`, marginX, currentY);
    underlineText(petitionDay || "", marginX + 65, currentY);
    doc.text(`day of`, marginX + 65 + doc.getTextWidth(petitionDay || ""), currentY);
    underlineText(petitionMonth || "", marginX + 65 + doc.getTextWidth(petitionDay || "") + 20, currentY);
    doc.text(`20`, marginX + 65 + doc.getTextWidth(petitionDay || "") + 20 + doc.getTextWidth(petitionMonth || "") + 5, currentY);
    underlineText(petitionYear || "", marginX + 65 + doc.getTextWidth(petitionDay || "") + 20 + doc.getTextWidth(petitionMonth || "") + 30, currentY);
    currentY += 2 * lineHeight;

    underlineText(formData.counselName, pageWidth - marginX - 150, currentY, { align: 'right' });
    doc.text(`Counsel for the Petitioner / Accused`, pageWidth - marginX, currentY, { align: 'right' });


    // Generate preview
    const pdfDataUri = doc.output("datauristring");
    setPdfPreview(pdfDataUri);
    pdfRef.current = doc;
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (pdfRef.current) {
      pdfRef.current.save("bail_application_form.pdf");
    }
  };

  const formFields = [
    { key: "ccNumber", label: "C.C. No.", type: "text" },
    { key: "year", label: "Year", type: "text" },
    { key: "policeStation", label: "Police Station", type: "text" },
    { key: "petitionerAccused", label: "Petitioner / Accused Name", type: "text" },
    { key: "arrestedOffenceSection", label: "Arrested Offence u/s", type: "text" },
    { key: "petitionDate", label: "Dated Date", type: "date" },
    { key: "counselName", label: "Counsel Name", type: "text" },
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
              <h1 className="text-2xl font-bold text-gray-900">Bail Application Form</h1>
              <p className="text-gray-600">Fill in the details below to generate your form</p>
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

export default BailFormFiller;