
import jsPDF from 'jspdf';
import { format } from 'date-fns';

// Types for export data
export interface ConversationExportData {
  id: string;
  transcript: string;
  ai_response: string;
  created_at: string;
}

export interface AdviceExportData {
  id: string;
  advice_text: string;
  created_at: string;
  personalization_level: 'minimal' | 'moderate' | 'full';
}

export interface ExportOptions {
  format: 'pdf' | 'txt' | 'markdown';
  includeConversations: boolean;
  includeAdvice: boolean;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  title?: string;
}

// PDF Export Utility
export const exportToPDF = async (
  conversations: ConversationExportData[],
  advice: AdviceExportData[],
  options: ExportOptions
): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add text with wrapping
  const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont(undefined, 'bold');
    } else {
      doc.setFont(undefined, 'normal');
    }
    
    const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin);
    
    // Check if we need a new page
    if (yPosition + (splitText.length * fontSize * 0.5) > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.text(splitText, margin, yPosition);
    yPosition += splitText.length * fontSize * 0.5 + 5;
  };

  // Title
  addText(options.title || 'Lumi Export', 18, true);
  addText(`Generated on: ${format(new Date(), 'PPP')}`, 10);
  yPosition += 10;

  // Export conversations
  if (options.includeConversations && conversations.length > 0) {
    addText('CONVERSATIONS', 16, true);
    yPosition += 5;

    conversations.forEach((conversation) => {
      const date = format(new Date(conversation.created_at), 'PPP');
      addText(`Date: ${date}`, 12, true);
      
      addText('You:', 11, true);
      addText(conversation.transcript, 11);
      
      addText('Lumi:', 11, true);
      addText(conversation.ai_response, 11);
      
      yPosition += 10;
    });
  }

  // Export advice
  if (options.includeAdvice && advice.length > 0) {
    addText('DAILY WISDOM', 16, true);
    yPosition += 5;

    advice.forEach((item) => {
      const date = format(new Date(item.created_at), 'PPP');
      const level = item.personalization_level;
      
      addText(`Date: ${date} | Level: ${level}`, 12, true);
      addText(item.advice_text, 11);
      yPosition += 10;
    });
  }

  // Save the PDF
  const fileName = `lumi-export-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};

// Text Export Utility
export const exportToText = (
  conversations: ConversationExportData[],
  advice: AdviceExportData[],
  options: ExportOptions
): string => {
  let content = '';
  
  // Header
  content += `${options.title || 'Lumi Export'}\n`;
  content += `Generated on: ${format(new Date(), 'PPP')}\n\n`;
  content += '=' .repeat(50) + '\n\n';

  // Conversations
  if (options.includeConversations && conversations.length > 0) {
    content += 'CONVERSATIONS\n\n';
    
    conversations.forEach((conversation, index) => {
      const date = format(new Date(conversation.created_at), 'PPP');
      content += `Conversation ${index + 1} - ${date}\n`;
      content += '-'.repeat(30) + '\n';
      content += `You: ${conversation.transcript}\n\n`;
      content += `Lumi: ${conversation.ai_response}\n\n`;
      content += '\n';
    });
  }

  // Advice
  if (options.includeAdvice && advice.length > 0) {
    content += 'DAILY WISDOM\n\n';
    
    advice.forEach((item, index) => {
      const date = format(new Date(item.created_at), 'PPP');
      content += `Wisdom ${index + 1} - ${date} (${item.personalization_level})\n`;
      content += '-'.repeat(30) + '\n';
      content += `${item.advice_text}\n\n`;
    });
  }

  return content;
};

// Markdown Export Utility
export const exportToMarkdown = (
  conversations: ConversationExportData[],
  advice: AdviceExportData[],
  options: ExportOptions
): string => {
  let content = '';
  
  // Header
  content += `# ${options.title || 'Lumi Export'}\n\n`;
  content += `**Generated on:** ${format(new Date(), 'PPP')}\n\n`;
  content += '---\n\n';

  // Conversations
  if (options.includeConversations && conversations.length > 0) {
    content += '## Conversations\n\n';
    
    conversations.forEach((conversation, index) => {
      const date = format(new Date(conversation.created_at), 'PPP');
      content += `### Conversation ${index + 1} - ${date}\n\n`;
      content += `**You:** ${conversation.transcript}\n\n`;
      content += `**Lumi:** ${conversation.ai_response}\n\n`;
      content += '---\n\n';
    });
  }

  // Advice
  if (options.includeAdvice && advice.length > 0) {
    content += '## Daily Wisdom\n\n';
    
    advice.forEach((item, index) => {
      const date = format(new Date(item.created_at), 'PPP');
      content += `### Wisdom ${index + 1} - ${date}\n\n`;
      content += `**Personalization Level:** ${item.personalization_level}\n\n`;
      content += `${item.advice_text}\n\n`;
      content += '---\n\n';
    });
  }

  return content;
};

// Download utility for text/markdown files
export const downloadTextFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
