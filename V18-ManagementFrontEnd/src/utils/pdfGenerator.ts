import { Student } from '../contexts/DataContext';

export interface ReceiptData {
  student: Student;
  receiptNumber: string;
  issueDate: Date;
  totalAmount: number;
  paymentMethod?: string;
}

export function generateReceiptPDF(data: ReceiptData): void {
  // Dynamic import to avoid build issues
  import('jspdf').then(({ jsPDF }) => {
    const { student, receiptNumber, issueDate, totalAmount } = data;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPosition = margin;
    
    // Header Section
    doc.setFillColor(59, 130, 246); // Blue background
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('V.18 PREMIUM TUITION', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Fee Payment Receipt', pageWidth / 2, 28, { align: 'center' });
    
    yPosition = 45;
    
    // Receipt Info Bar
    doc.setFillColor(243, 244, 246); // Light gray background
    doc.rect(margin, yPosition, contentWidth, 15, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Receipt #: ${receiptNumber}`, margin + 5, yPosition + 10);
    doc.text(`Date: ${issueDate.toLocaleDateString('en-IN')}`, pageWidth - margin - 5, yPosition + 10, { align: 'right' });
    
    yPosition += 25;
    
    // Student Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('STUDENT INFORMATION', margin, yPosition);
    
    // Draw line under section header
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition + 2, margin + 60, yPosition + 2);
    
    yPosition += 12;
    
    // Student details in two columns
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const leftColumn = margin;
    const rightColumn = pageWidth / 2 + 10;
    
    // Left column
    doc.setFont('helvetica', 'bold');
    doc.text('Name:', leftColumn, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(student.name, leftColumn + 25, yPosition);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', leftColumn, yPosition + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(student.email, leftColumn + 25, yPosition + 8);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', leftColumn, yPosition + 16);
    doc.setFont('helvetica', 'normal');
    doc.text(student.phone, leftColumn + 25, yPosition + 16);
    
    // Right column
    doc.setFont('helvetica', 'bold');
    doc.text('Grade:', rightColumn, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(student.grade, rightColumn + 25, yPosition);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Branch:', rightColumn, yPosition + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(student.branch, rightColumn + 25, yPosition + 8);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Class Type:', rightColumn, yPosition + 16);
    doc.setFont('helvetica', 'normal');
    doc.text(student.classType === 'vacation' ? 'Vacation Classes' : 'Regular Classes', rightColumn + 25, yPosition + 16);
    
    yPosition += 30;
    
    // Subjects Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('ENROLLED SUBJECTS', margin, yPosition);
    
    doc.setDrawColor(59, 130, 246);
    doc.line(margin, yPosition + 2, margin + 60, yPosition + 2);
    
    yPosition += 12;
    
    // Subjects in a neat grid
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const subjectsPerRow = 3;
    const subjectWidth = contentWidth / subjectsPerRow;
    
    student.subjects.forEach((subject, index) => {
      const col = index % subjectsPerRow;
      const row = Math.floor(index / subjectsPerRow);
      const x = margin + (col * subjectWidth);
      const y = yPosition + (row * 8);
      
      // Subject box
      doc.setFillColor(239, 246, 255); // Light blue background
      doc.setDrawColor(59, 130, 246);
      doc.rect(x, y - 4, subjectWidth - 5, 6, 'FD');
      
      doc.setTextColor(59, 130, 246);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${subject}`, x + 2, y);
    });
    
    const subjectRows = Math.ceil(student.subjects.length / subjectsPerRow);
    yPosition += (subjectRows * 8) + 15;
    
    // Payment Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('PAYMENT SUMMARY', margin, yPosition);
    
    doc.setDrawColor(59, 130, 246);
    doc.line(margin, yPosition + 2, margin + 60, yPosition + 2);
    
    yPosition += 12;
    
    // Payment details table
    const tableData = [
      ['Monthly Fee:', 'Rs.' + student.monthlyFee.toString()],
      ['Amount Paid:', 'Rs.' + student.feesPaid.toString()],
      ['Remaining Balance:', 'Rs.' + student.feesRemaining.toString()],
    ];
    
    doc.setFontSize(11);
    tableData.forEach((row, index) => {
      const y = yPosition + (index * 10);
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, y - 4, contentWidth, 8, 'F');
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(75, 85, 99);
      doc.text(row[0], margin + 5, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(row[1], pageWidth - margin - 5, y, { align: 'right' });
    });
    
    yPosition += 40;
    
    // Total Amount - Highlighted
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPosition - 5, contentWidth, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL PAID:', margin + 5, yPosition + 2);
    doc.text('Rs.' + totalAmount.toString(), pageWidth - margin - 5, yPosition + 2, { align: 'right' });
    
    yPosition += 20;
    
    // Payment Status
    if (student.feesRemaining <= 0) {
      doc.setFillColor(34, 197, 94); // Green background
      doc.rect(margin, yPosition, contentWidth, 15, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('FEES FULLY PAID', pageWidth / 2, yPosition + 10, { align: 'center' });
      
      yPosition += 25;
    }
    
    // Footer
    const footerY = pageHeight - 25;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your payment!', pageWidth / 2, footerY, { align: 'center' });
    doc.text('V.18 Premium Tuition | Contact: +91.8123144616 | Email: admin@v18tuition.com', pageWidth / 2, footerY + 8, { align: 'center' });
    
    // Save the PDF
    const fileName = `Receipt_${student.name.replace(/\s+/g, '_')}_${receiptNumber}.pdf`;
    doc.save(fileName);
  }).catch(error => {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  });
}

export function generateReceiptNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `V18-${year}${month}${day}-${random}`;
}