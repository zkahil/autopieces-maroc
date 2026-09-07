import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ODOO_PURPLE = rgb(0x71 / 255, 0x4b / 255, 0x67 / 255);
const GRAY = rgb(0.45, 0.45, 0.45);
const LIGHT_GRAY = rgb(0.92, 0.92, 0.9);

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      user: true,
      lines: { include: { part: { include: { brand: true } } } },
    },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  const STATUS_LABEL: Record<string, string> = {
    BROUILLON: "Brouillon",
    VALIDEE: "Validée",
    PAYEE: "Payée",
    ANNULEE: "Annulée",
  };

  const doc = await PDFDocument.create();
  doc.setTitle(`Facture ${invoice.number}`);
  doc.setAuthor("AutoPièces Maroc");
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 60;
  const marginX = 50;

  // ---- En-tête ----
  page.drawRectangle({ x: 0, y: height - 100, width, height: 100, color: ODOO_PURPLE });
  page.drawText("AutoPièces Maroc", {
    x: marginX,
    y: height - 45,
    size: 22,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Gestion de pièces détachées automobiles", {
    x: marginX,
    y: height - 65,
    size: 10,
    font,
    color: rgb(1, 1, 1),
  });
  page.drawText(`FACTURE N° ${invoice.number}`, {
    x: width - marginX - bold.widthOfTextAtSize(`FACTURE N° ${invoice.number}`, 14),
    y: height - 45,
    size: 14,
    font: bold,
    color: rgb(1, 1, 1),
  });
  const statusText = `Statut : ${STATUS_LABEL[invoice.status] || invoice.status}`;
  page.drawText(statusText, {
    x: width - marginX - font.widthOfTextAtSize(statusText, 10),
    y: height - 65,
    size: 10,
    font,
    color: rgb(1, 1, 1),
  });

  y = height - 130;

  // ---- Infos client / vendeur ----
  page.drawText("Client", { x: marginX, y, size: 11, font: bold, color: ODOO_PURPLE });
  page.drawText(`Date : ${new Date(invoice.createdAt).toLocaleDateString("fr-FR")}`, {
    x: width - marginX - 150,
    y,
    size: 11,
    font: bold,
    color: ODOO_PURPLE,
  });
  y -= 16;
  const clientLines = [
    invoice.client.name,
    invoice.client.address || "",
    [invoice.client.city, invoice.client.phone].filter(Boolean).join(" · "),
    invoice.client.ice ? `ICE : ${invoice.client.ice}` : "",
  ].filter(Boolean);
  for (const line of clientLines) {
    page.drawText(line, { x: marginX, y, size: 10, font, color: GRAY });
    y -= 14;
  }
  page.drawText(`Vendeur : ${invoice.user.name}`, {
    x: width - marginX - 150,
    y: height - 146,
    size: 10,
    font,
    color: GRAY,
  });

  y -= 20;

  // ---- Tableau des lignes ----
  const colX = { part: marginX, qty: 330, pu: 390, total: 470 };
  page.drawRectangle({
    x: marginX,
    y: y - 6,
    width: width - 2 * marginX,
    height: 22,
    color: LIGHT_GRAY,
  });
  page.drawText("Désignation", {
    x: colX.part + 4,
    y: y,
    size: 10,
    font: bold,
    color: rgb(0.2, 0.2, 0.2),
  });
  page.drawText("Qté", { x: colX.qty, y: y, size: 10, font: bold, color: rgb(0.2, 0.2, 0.2) });
  page.drawText("P.U. (DH)", { x: colX.pu, y: y, size: 10, font: bold, color: rgb(0.2, 0.2, 0.2) });
  page.drawText("Total (DH)", {
    x: colX.total,
    y: y,
    size: 10,
    font: bold,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 26;

  for (const line of invoice.lines) {
    if (y < 140) break; // sécurité simple anti-débordement pour ce document one-page
    const name = `${line.part.reference} — ${line.part.name}`;
    const truncated = name.length > 42 ? name.slice(0, 39) + "..." : name;
    page.drawText(truncated, {
      x: colX.part + 4,
      y,
      size: 9.5,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });
    page.drawText(String(line.quantity), {
      x: colX.qty,
      y,
      size: 9.5,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });
    page.drawText(line.unitPrice.toFixed(2), {
      x: colX.pu,
      y,
      size: 9.5,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });
    page.drawText(line.total.toFixed(2), {
      x: colX.total,
      y,
      size: 9.5,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });
    y -= 18;
    page.drawLine({
      start: { x: marginX, y: y + 8 },
      end: { x: width - marginX, y: y + 8 },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });
  }

  // ---- Totaux ----
  y -= 10;
  const totalsX = width - marginX - 180;
  const tva = invoice.totalTTC - invoice.totalHT;
  const totalsRows: [string, string, boolean][] = [
    ["Total HT", `${invoice.totalHT.toFixed(2)} DH`, false],
    [`TVA (${invoice.tva}%)`, `${tva.toFixed(2)} DH`, false],
    ["Total TTC", `${invoice.totalTTC.toFixed(2)} DH`, true],
  ];
  for (const [label, value, isBold] of totalsRows) {
    const f = isBold ? bold : font;
    const size = isBold ? 13 : 10.5;
    const color = isBold ? ODOO_PURPLE : rgb(0.3, 0.3, 0.3);
    page.drawText(label, { x: totalsX, y, size, font: f, color });
    page.drawText(value, {
      x: width - marginX - f.widthOfTextAtSize(value, size),
      y,
      size,
      font: f,
      color,
    });
    y -= isBold ? 20 : 16;
  }

  // ---- Pied de page ----
  page.drawLine({
    start: { x: marginX, y: 70 },
    end: { x: width - marginX, y: 70 },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });
  page.drawText(
    "AutoPièces Maroc — Casablanca, Maroc — Document généré automatiquement, sans valeur fiscale sans cachet.",
    { x: marginX, y: 52, size: 8, font, color: GRAY }
  );

  const bytes = await doc.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Facture-${invoice.number}.pdf"`,
    },
  });
}
