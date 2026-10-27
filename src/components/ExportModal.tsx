import React, { useState } from 'react';
import { Itinerary } from '../types/trip';
import { downloadICalendar, generateMarkdown } from '../utils/exportUtils';
import { X, Calendar, Printer, FileText, Check, Download } from 'lucide-react';

interface ExportModalProps {
  itinerary: Itinerary | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ itinerary, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !itinerary) return null;

  const handleDownloadICal = () => {
    downloadICalendar(itinerary);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = async () => {
    const md = generateMarkdown(itinerary);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 text-stone-900 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">Export Itinerary</h3>
            <p className="text-xs text-stone-500">{itinerary.title}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {/* iCal .ics download */}
          <div
            onClick={handleDownloadICal}
            className="p-4 rounded-xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200 transition cursor-pointer flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-stone-900">Sync to Calendar (.ics)</h4>
              <p className="text-[11px] text-stone-500">
                Adds all scheduled stops into Apple Calendar, Google Calendar, or Outlook.
              </p>
            </div>
          </div>

          {/* Copy Markdown */}
          <div
            onClick={handleCopyMarkdown}
            className="p-4 rounded-xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200 transition cursor-pointer flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center shrink-0 shadow-2xs">
              {copied ? <Check className="w-5 h-5 text-stone-900" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-stone-900">
                {copied ? 'Copied to Clipboard' : 'Copy Formatted Text'}
              </h4>
              <p className="text-[11px] text-stone-500">
                Markdown format for Notion, notes, or messaging.
              </p>
            </div>
          </div>

          {/* Print / Save to PDF */}
          <div
            onClick={handlePrint}
            className="p-4 rounded-xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200 transition cursor-pointer flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Printer className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-stone-900">Print or Save as PDF</h4>
              <p className="text-[11px] text-stone-500">
                Clean printed overview for offline reference.
              </p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
