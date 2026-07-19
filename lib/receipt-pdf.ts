import type { BookingRecord } from "@/types";

type PdfLine = {
  text: string;
  x: number;
  y: number;
  size?: number;
  font?: "F1" | "F2";
  color?: [number, number, number];
};

type PdfRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: [number, number, number];
  stroke?: [number, number, number];
  lineWidth?: number;
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

function pdfText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r?\n/g, " ");
}

function fmtColor([r, g, b]: [number, number, number]) {
  return `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)}`;
}

function drawRect(rect: PdfRect) {
  const commands: string[] = ["q"];

  if (rect.lineWidth) {
    commands.push(`${rect.lineWidth} w`);
  }

  if (rect.fill) {
    commands.push(`${fmtColor(rect.fill)} rg`);
  }

  if (rect.stroke) {
    commands.push(`${fmtColor(rect.stroke)} RG`);
  }

  const operation = rect.fill && rect.stroke ? "B" : rect.fill ? "f" : "S";
  commands.push(`${rect.x} ${rect.y} ${rect.width} ${rect.height} re ${operation}`);
  commands.push("Q");

  return commands.join("\n");
}

function drawLine(line: PdfLine) {
  const font = line.font ?? "F1";
  const size = line.size ?? 12;
  const color = line.color ?? [30, 41, 59];

  return [
    "BT",
    `${fmtColor(color)} rg`,
    `/${font} ${size} Tf`,
    `1 0 0 1 ${line.x} ${line.y} Tm`,
    `(${pdfText(line.text)}) Tj`,
    "ET"
  ].join("\n");
}

function buildPdf(content: string) {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${offsets[index].toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "binary");
}

export function generateReceiptPdf(input: {
  booking: BookingRecord;
  generatedAt: string;
}) {
  const { booking, generatedAt } = input;

  const rects: PdfRect[] = [
    { x: 0, y: 742, width: PAGE_WIDTH, height: 100, fill: [11, 77, 58] },
    { x: 36, y: 520, width: 523, height: 164, fill: [248, 250, 252], stroke: [209, 213, 219], lineWidth: 1 },
    { x: 36, y: 342, width: 250, height: 150, fill: [255, 255, 255], stroke: [209, 213, 219], lineWidth: 1 },
    { x: 309, y: 342, width: 250, height: 150, fill: [255, 255, 255], stroke: [209, 213, 219], lineWidth: 1 },
    { x: 36, y: 168, width: 523, height: 146, fill: [248, 250, 252], stroke: [209, 213, 219], lineWidth: 1 },
    { x: 420, y: 220, width: 110, height: 42, fill: [232, 245, 233], stroke: [134, 239, 172], lineWidth: 1 }
  ];

  const lines: PdfLine[] = [
    { text: "HariOm Vastu Solutions", x: 36, y: 793, size: 24, font: "F2", color: [255, 255, 255] },
    { text: "Professional Payment Receipt", x: 36, y: 768, size: 11, color: [226, 232, 240] },
    { text: "RECEIPT", x: 435, y: 791, size: 20, font: "F2", color: [255, 255, 255] },

    { text: "Receipt Summary", x: 54, y: 656, size: 16, font: "F2", color: [15, 23, 42] },
    { text: `Booking ID: ${booking.bookingId}`, x: 54, y: 628, size: 11 },
    { text: `Generated On: ${generatedAt}`, x: 54, y: 608, size: 11 },
    { text: `Program Date: ${booking.eventDate}`, x: 54, y: 588, size: 11 },
    { text: `Payment Status: ${booking.paymentStatus.toUpperCase()}`, x: 54, y: 568, size: 11 },
    { text: `Booking Status: ${booking.bookingStatus.toUpperCase()}`, x: 54, y: 548, size: 11 },

    { text: "Billed To", x: 54, y: 462, size: 14, font: "F2", color: [15, 23, 42] },
    { text: booking.customerName, x: 54, y: 436, size: 12, font: "F2" },
    { text: `Phone: ${booking.phone}`, x: 54, y: 416, size: 11 },
    { text: `Email: ${booking.email ?? "Not provided"}`, x: 54, y: 396, size: 11 },
    { text: `Place: ${booking.place}`, x: 54, y: 376, size: 11 },

    { text: "Event Details", x: 327, y: 462, size: 14, font: "F2", color: [15, 23, 42] },
    { text: booking.program, x: 327, y: 436, size: 12, font: "F2" },
    { text: `Venue: ${booking.venue}`, x: 327, y: 416, size: 11 },
    { text: `Date: ${booking.eventDate}`, x: 327, y: 396, size: 11 },
    { text: `Payment ID: ${booking.paymentId}`, x: 327, y: 376, size: 11 },

    { text: "Payment Breakdown", x: 54, y: 284, size: 14, font: "F2", color: [15, 23, 42] },
    { text: "Registration Fee", x: 54, y: 248, size: 12 },
    { text: booking.amountPaid.toLocaleString("en-IN", { style: "currency", currency: "INR" }), x: 450, y: 248, size: 12, font: "F2" },
    { text: "Total Paid", x: 54, y: 218, size: 13, font: "F2" },
    { text: booking.amountPaid.toLocaleString("en-IN", { style: "currency", currency: "INR" }), x: 438, y: 218, size: 16, font: "F2", color: [11, 77, 58] },
    { text: "PAID", x: 456, y: 236, size: 13, font: "F2", color: [21, 128, 61] },

    { text: "Notes", x: 36, y: 118, size: 10, font: "F2", color: [100, 116, 139] },
    { text: "This receipt confirms successful payment for the registered event.", x: 36, y: 100, size: 10, color: [100, 116, 139] },
    { text: "Please keep this PDF for your records and bring your booking ID on the event day.", x: 36, y: 84, size: 10, color: [100, 116, 139] }
  ];

  const content = [
    ...rects.map(drawRect),
    ...lines.map(drawLine)
  ].join("\n");

  return buildPdf(content);
}
