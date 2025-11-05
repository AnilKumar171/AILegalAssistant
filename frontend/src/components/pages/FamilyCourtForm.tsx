import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { ArrowLeft, FileText, Download, Eye, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PDFFormFiller = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courtNumber: "",
    year: "",
    petitionerName: "",
    respondentName: "",
    petitionDate: "",
    relief: "",
    appearanceDate: "",
    filingDate: "",
    givenDate: "",
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

    // Helper function to format and underline text
    const underlineText = (text: string, x: number, y: number, align: "left" | "center" | "right" = "left") => {
      const textWidth = doc.getTextWidth(text);
      doc.text(text, x, y, { align });
      doc.setLineWidth(0.5);
      if (align === "center") {
        doc.line(x - textWidth / 2, y + 1, x + textWidth / 2, y + 1);
      } else if (align === "right") {
        doc.line(x - textWidth, y + 1, x, y + 1);
      } else {
        doc.line(x, y + 1, x + textWidth, y + 1);
      }
    };

    // Set font and size
    doc.setFontSize(12);

    // Header section
    doc.text(`Before the`, pageWidth / 2, 20, { align: "center" });
    underlineText(formData.courtNumber, pageWidth / 2, 30, "center");
    doc.text(`Family Court at Chennai`, pageWidth / 2, 40, { align: "center" });

    // Case number section
    doc.text(`O.P. No.`, 20, 60);
    underlineText(formData.courtNumber, 45, 60);
    doc.text(`of`, 80, 60);
    underlineText(formData.year, 90, 60);

    // Act title
    doc.text("In the matter of Hindu Marriage Act", pageWidth / 2, 80, { align: "center" });

    // Petitioner and Respondent
    underlineText(formData.petitionerName, 20, 100);
    doc.text(`... Petitioner`, 150, 100);
    doc.text("Versus", pageWidth / 2, 110, { align: "center" });
    underlineText(formData.respondentName, 20, 120);
    doc.text(`...Respondent`, 150, 120);

    // Petition details
    const [petitionDay, petitionMonth, petitionYear] = formData.petitionDate.split("-");
    doc.text(`WHEREAS on the`, 20, 140);
    underlineText(petitionDay || "", 60, 140);
    doc.text(`day of`, 75, 140);
    underlineText(petitionMonth || "", 95, 140);
    underlineText(petitionYear || "", 130, 140);
    doc.text(`the above named petitioner`, 150, 140);
    doc.text(`filed a petition against the respondent for`, 20, 150);
    underlineText(formData.relief, pageWidth / 2, 160, "center");

    // Appearance date
    const [appearanceDay, appearanceMonth, appearanceYear] = formData.appearanceDate.split("-");
    doc.text(`You are hereby required to appear in this Court on`, 20, 180);
    underlineText(appearanceDay || "", 130, 180);
    doc.text(`day of`, 145, 180);
    underlineText(appearanceMonth || "", 165, 180);
    underlineText(appearanceYear || "", 190, 180);
    doc.text(`at 10.15 a.m. in the forenoon in person to answer all material questions relating to the above`, 20, 190);
    doc.text(`proceedings.`, 20, 200);

    // Filing date
    const [filingDay, filingMonth, filingYear] = formData.filingDate.split("-");
    doc.text(`You are required to file a written statement in Court on or before the`, 20, 220);
    underlineText(filingDay || "", 170, 220);
    doc.text(`day of`, 20, 230);
    underlineText(filingMonth || "", 40, 230);
    underlineText(filingYear || "", 80, 230);

    // Given date and signatures
    const [givenDay, givenMonth, givenYear] = formData.givenDate.split("-");
    doc.text(`GIVEN under my hand and the seal of the Court, this the`, 20, 250);
    underlineText(givenDay || "", 140, 250);
    doc.text(`day of`, 155, 250);
    underlineText(givenMonth || "", 175, 250);
    underlineText(givenYear || "", 200, 250);

    doc.text("Central Nazir", pageWidth / 2, 270, { align: "center" });
    doc.text(`This notice has been taken out by Mr.`, 20, 290);
    underlineText(formData.counselName, 100, 290);
    doc.text("Counsel for Petitioner", 20, 310);
    doc.text("Petitioner", pageWidth - 40, 310, { align: "right" });

    // Generate preview
    const pdfDataUri = doc.output("datauristring");
    setPdfPreview(pdfDataUri);
    pdfRef.current = doc;
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (pdfRef.current) {
      pdfRef.current.save("family_court_form.pdf");
    }
  };

  const formFields = [
    { key: "courtNumber", label: "Court Number", type: "text" },
    { key: "year", label: "Year", type: "text" },
    { key: "petitionerName", label: "Petitioner Name", type: "text" },
    { key: "respondentName", label: "Respondent Name", type: "text" },
    { key: "petitionDate", label: "Petition Date", type: "date" },
    { key: "relief", label: "Relief Sought", type: "text" },
    { key: "appearanceDate", label: "Appearance Date", type: "date" },
    { key: "filingDate", label: "Filing Date", type: "date" },
    { key: "givenDate", label: "Given Date", type: "date" },
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
              <h1 className="text-2xl font-bold text-gray-900">Family Court Form</h1>
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

export default PDFFormFiller;