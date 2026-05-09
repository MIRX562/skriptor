"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  FileText, 
  FileCode, 
  Copy,
  ChevronDown,
  LayoutList
} from "lucide-react";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import { unparse } from "papaparse";
import { formatSrtTime, formatTime } from "@/lib/utils";
import { type Dictionary } from "@/i18n/dictionaries";
import { type Speaker } from "../model/use-transcription";

interface DownloadOptionsProps {
  metadata: {
    id: string;
    title: string;
    date: string;
    duration: string;
    isSpeakerDiarized: boolean;
    [key: string]: any;
  };
  segments: Array<{
    id: string;
    text: string;
    start: number;
    end: number;
    speakerIndex: number | null;
  }>;
  speakers: Speaker[];
  dict: Dictionary;
  trigger?: React.ReactNode;
  onCopy: () => void;
}

export function DownloadOptions({ 
  metadata, 
  segments, 
  speakers, 
  dict, 
  trigger, 
  onCopy 
}: DownloadOptionsProps) {
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [includeSpeaker, setIncludeSpeaker] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const getSpeakerLabel = (speakerIndex: number | null) => {
    if (speakerIndex === null || speakerIndex === undefined) return null;
    const speaker = speakers.find((s) => s.index === speakerIndex);
    return speaker?.label ?? `Speaker ${speakerIndex}`;
  };

  const handleExportTxt = () => {
    let content = "";
    let currentSpeaker: string | null = null;

    segments.forEach((segment) => {
      const speakerLabel = getSpeakerLabel(segment.speakerIndex);
      const timestamp = formatTime(segment.start);
      
      if (includeTimestamp) {
        if (includeSpeaker && speakerLabel) {
          content += `${speakerLabel} (${timestamp}):\n${segment.text}\n\n`;
        } else {
          content += `(${timestamp}):\n${segment.text}\n\n`;
        }
      } else {
        if (includeSpeaker && speakerLabel) {
          if (speakerLabel !== currentSpeaker) {
            content += `\n${speakerLabel}:\n`;
            currentSpeaker = speakerLabel;
          }
          content += `${segment.text} `;
        } else {
          content += `${segment.text} `;
        }
      }
    });

    const blob = new Blob([content.trim()], { type: "text/plain" });
    saveAs(blob, `${metadata.title}.txt`);
  };

  const handleExportSrt = () => {
    let content = "";
    segments.forEach((segment, index) => {
      const speakerLabel = getSpeakerLabel(segment.speakerIndex);
      const speakerText = includeSpeaker && speakerLabel ? `${speakerLabel}: ` : "";
      
      content += `${index + 1}\n`;
      content += `${formatSrtTime(segment.start)} --> ${formatSrtTime(segment.end)}\n`;
      content += `${speakerText}${segment.text}\n\n`;
    });

    const blob = new Blob([content.trim()], { type: "text/plain" });
    saveAs(blob, `${metadata.title}.srt`);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(metadata.title, margin, y);
    y += 10;

    // Metadata
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${dict.view.metadata.date}: ${metadata.date} | ${dict.view.metadata.duration}: ${metadata.duration}`, margin, y);
    y += 15;

    doc.setFontSize(11);
    
    let currentSpeaker: string | null = null;
    let currentSpeakerSegments: string[] = [];
    let currentStartTime: number = 0;

    const flushBlock = (speaker: string | null, text: string, startTime: number) => {
      const header = [];
      if (includeSpeaker && speaker) header.push(speaker);
      if (includeTimestamp) header.push(`(${formatTime(startTime)})`);
      
      const headerText = header.join(" ");
      
      if (headerText) {
        // Check for page break before header
        if (y + 10 > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.text(headerText, margin, y);
        y += 6;
      }

      doc.setFont("helvetica", "normal");
      
      const lines = doc.splitTextToSize(text, contentWidth);
      
      lines.forEach((line: string, index: number) => {
        if (y + 6 > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = 20;
        }
        
        // Only justify if it's NOT the last line of the paragraph
        const isLastLine = index === lines.length - 1;
        doc.text(line, margin, y, { 
          align: isLastLine || lines.length === 1 ? "left" : "justify", 
          maxWidth: contentWidth 
        });
        y += 6;
      });
      
      y += 4; // Paragraph spacing
    };

    segments.forEach((segment, index) => {
      const speakerLabel = getSpeakerLabel(segment.speakerIndex);
      
      // If including timestamps, we want each segment as a separate block
      const shouldFlush = includeTimestamp || (includeSpeaker && speakerLabel !== currentSpeaker) || !includeSpeaker;

      if (shouldFlush) {
        if (currentSpeakerSegments.length > 0) {
          flushBlock(currentSpeaker, currentSpeakerSegments.join(" "), currentStartTime);
        }
        currentSpeaker = speakerLabel;
        currentSpeakerSegments = [segment.text];
        currentStartTime = segment.start;
      } else {
        currentSpeakerSegments.push(segment.text);
      }

      // Last segment
      if (index === segments.length - 1) {
        flushBlock(currentSpeaker, currentSpeakerSegments.join(" "), currentStartTime);
      }
    });

    doc.save(`${metadata.title}.pdf`);
  };

  const handleExportDocx = () => {
    let currentSpeaker: string | null = null;
    let currentSpeakerSegments: string[] = [];
    let currentStartTime: number = 0;
    const docChildren: any[] = [
      new Paragraph({
        text: metadata.title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun(`${dict.view.metadata.date}: ${metadata.date} | ${dict.view.metadata.duration}: ${metadata.duration}`),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    ];

    const createBlock = (speaker: string | null, text: string, startTime: number) => {
      const headerElements = [];
      if (includeSpeaker && speaker) {
        headerElements.push(new TextRun({ text: speaker, bold: true }));
      }
      if (includeTimestamp) {
        if (headerElements.length > 0) headerElements.push(new TextRun({ text: " " }));
        headerElements.push(new TextRun({ text: `(${formatTime(startTime)})`, bold: true }));
      }

      if (headerElements.length > 0) {
        docChildren.push(
          new Paragraph({
            children: headerElements,
            spacing: { before: 200 },
          })
        );
      }

      docChildren.push(
        new Paragraph({
          children: [new TextRun(text)],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200 },
        })
      );
    };

    segments.forEach((segment, index) => {
      const speakerLabel = getSpeakerLabel(segment.speakerIndex);
      
      const shouldFlush = includeTimestamp || (includeSpeaker && speakerLabel !== currentSpeaker) || !includeSpeaker;

      if (shouldFlush) {
        if (currentSpeakerSegments.length > 0) {
          createBlock(currentSpeaker, currentSpeakerSegments.join(" "), currentStartTime);
        }
        currentSpeaker = speakerLabel;
        currentSpeakerSegments = [segment.text];
        currentStartTime = segment.start;
      } else {
        currentSpeakerSegments.push(segment.text);
      }

      if (index === segments.length - 1) {
        createBlock(currentSpeaker, currentSpeakerSegments.join(" "), currentStartTime);
      }
    });

    const doc = new Document({
      sections: [{ children: docChildren }],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${metadata.title}.docx`);
    });
  };

  const handleExportCsv = () => {
    const rows = segments.map((s) => ({
      Speaker: getSpeakerLabel(s.speakerIndex) || "Unknown",
      Start: formatTime(s.start),
      End: formatTime(s.end),
      Text: s.text,
    }));

    const filteredRows = rows.map(row => {
      const filtered: any = {};
      if (includeSpeaker) filtered.Speaker = row.Speaker;
      if (includeTimestamp) {
        filtered.Start = row.Start;
        filtered.End = row.End;
      }
      filtered.Text = row.Text;
      return filtered;
    });

    const csv = unparse(filteredRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${metadata.title}.csv`);
  };

  const handleExportExcel = () => {
    const data = segments.map((s) => ({
      Speaker: getSpeakerLabel(s.speakerIndex) || "Unknown",
      Start: formatTime(s.start),
      End: formatTime(s.end),
      Text: s.text,
    }));

    const filteredData = data.map(row => {
      const filtered: any = {};
      if (includeSpeaker) filtered.Speaker = row.Speaker;
      if (includeTimestamp) {
        filtered.Start = row.Start;
        filtered.End = row.End;
      }
      filtered.Text = row.Text;
      return filtered;
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transcription");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `${metadata.title}.xlsx`);
  };

  const handleDownload = async (format: string) => {
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      switch (format) {
        case "txt": handleExportTxt(); break;
        case "srt": handleExportSrt(); break;
        case "pdf": handleExportPdf(); break;
        case "docx": handleExportDocx(); break;
        case "csv": handleExportCsv(); break;
        case "xlsx": handleExportExcel(); break;
        case "copy": onCopy(); break;
      }
      toast.success(dict.view.download.success);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(dict.view.download.error || "Export failed");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-8 sm:h-9 shrink-0">
            <Download className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">{dict.view.actions.download}</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dict.view.download.title}</DialogTitle>
          <DialogDescription>
            {dict.view.download.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="timestamp" className="flex flex-col gap-1 cursor-pointer">
                <span>{dict.view.download.includeTimestamp}</span>
                <span className="font-normal text-xs text-muted-foreground">Add time codes to each segment</span>
              </Label>
              <Switch 
                id="timestamp" 
                checked={includeTimestamp}
                onCheckedChange={setIncludeTimestamp}
              />
            </div>
            
            {metadata.isSpeakerDiarized && (
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="speaker" className="flex flex-col gap-1 cursor-pointer">
                  <span>{dict.view.download.includeSpeaker}</span>
                  <span className="font-normal text-xs text-muted-foreground">Add speaker names/labels</span>
                </Label>
                <Switch 
                  id="speaker" 
                  checked={includeSpeaker}
                  onCheckedChange={setIncludeSpeaker}
                />
              </div>
            )}
          </div>

          <Separator />
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="justify-start h-11" 
              disabled={isDownloading}
              onClick={() => handleDownload("txt")}
            >
              <FileText className="mr-2 h-4 w-4 text-blue-500" />
              Text (.txt)
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-11" 
              disabled={isDownloading}
              onClick={() => handleDownload("docx")}
            >
              <FileText className="mr-2 h-4 w-4 text-blue-600" />
              Word (.docx)
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-11" 
              disabled={isDownloading}
              onClick={() => handleDownload("pdf")}
            >
              <FileText className="mr-2 h-4 w-4 text-red-500" />
              PDF (.pdf)
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-11" 
              disabled={isDownloading}
              onClick={() => handleDownload("srt")}
            >
              <FileCode className="mr-2 h-4 w-4 text-purple-500" />
              Subtitle (.srt)
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-11" 
              disabled={isDownloading}
              onClick={() => handleDownload("csv")}
            >
              <LayoutList className="mr-2 h-4 w-4 text-green-600" />
              CSV (.csv)
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-11" 
              disabled={isDownloading}
              onClick={() => handleDownload("xlsx")}
            >
              <LayoutList className="mr-2 h-4 w-4 text-green-700" />
              Excel (.xlsx)
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-11 border-teal-200 dark:border-teal-900/50 bg-teal-50/30 dark:bg-teal-950/20" 
              asChild
            >
              <a href={`/api/transcription/${metadata.id}/audio?download=true`} download>
                <Download className="mr-2 h-4 w-4 text-teal-600" />
                {dict.view.download.originalAudio || "Original Audio"}
              </a>
            </Button>
          </div>
          
          <Button 
            variant="secondary" 
            className="w-full mt-2"
            onClick={() => handleDownload("copy")}
          >
            <Copy className="mr-2 h-4 w-4" />
            {dict.view.download.copy}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
