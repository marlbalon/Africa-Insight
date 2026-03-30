import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface DownloadReportButtonProps {
  elementRef: React.RefObject<HTMLDivElement>;
  fileName: string;
  title: string;
  backgroundColor?: string;
}

export const DownloadReportButton: React.FC<DownloadReportButtonProps> = ({ 
  elementRef, 
  fileName, 
  title,
  backgroundColor = '#0f172a'
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!elementRef.current) return;
    
    setIsDownloading(true);
    toast.info(`Preparing ${title} report...`);
    
    try {
      const element = elementRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: backgroundColor,
        logging: false,
        height: element.scrollHeight,
        width: element.scrollWidth,
        windowHeight: element.scrollHeight,
        windowWidth: element.scrollWidth,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${fileName}.pdf`);
      toast.success("Report downloaded successfully!", {
        description: "Saved to your local storage.",
      });
    } catch (error) {
      console.error("PDF Error:", error);
      toast.error("Failed to generate PDF report.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isDownloading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all disabled:opacity-50 text-sm border border-white/10"
    >
      {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {isDownloading ? 'Downloading...' : 'Download Report'}
    </button>
  );
};
