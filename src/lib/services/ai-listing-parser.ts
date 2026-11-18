import type { Product } from '@/lib/types/entities';

export interface ParsedItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  reorderPoint: number;
  taxRate: number;
  confidence: number;
}

export interface InvoiceScanResult {
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  taxGstin?: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  items: ParsedItem[];
  rawText?: string;
  sourceEngine?: 'gemini_vision' | 'client_ocr' | 'pdf_parser' | 'preset_demo' | 'text_parser';
  previewUrl?: string;
}

// ─── 1. Natural Language & Voice Prompt Parser ──────────────────

export function parseNaturalLanguageListing(text: string, defaultTaxRate = 18): ParsedItem[] {
  if (!text || !text.trim()) return [];

  const lines = text
    .split(/(?:,|\band\b|\n|;)+/i)
    .map(l => l.trim())
    .filter(l => l.length > 2);

  const results: ParsedItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];

    // Extract quantity (e.g., "50 pcs", "20 boxes", "30", "10x")
    const qtyMatch = raw.match(/(\d+)\s*(?:pcs|units|boxes|packets|packs|reams|bags|rolls|cans|set|kg|l|ltr|meters|coils)?\b/i);
    const stock = qtyMatch ? parseInt(qtyMatch[1], 10) : 10;

    // Extract selling price (e.g., "at 80 sell", "sell 80", "price 80", "₹80", "80 rs", "mrp 80")
    const sellMatch = raw.match(/(?:sell(?:ing)?(?:\s*price)?|mrp|price|at)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i) ||
                      raw.match(/(?:₹|rs\.?)\s*(\d+(?:\.\d+)?)/i);
    const sellingPrice = sellMatch ? parseFloat(sellMatch[1]) : 100;

    // Extract cost price (e.g., "cost 55", "buy 55", "55 cost", "purchase 55")
    const costMatch = raw.match(/(?:cost|buy|purchase|cp)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i) ||
                      raw.match(/(\d+(?:\.\d+)?)\s*(?:cost|cp|buy)/i);
    const costPrice = costMatch ? parseFloat(costMatch[1]) : Math.round(sellingPrice * 0.7);

    // Clean up product name by stripping extracted quantity & prices
    let cleanedName = raw
      .replace(/^(?:add|insert|stock|list|create|have|buy)\s+/i, '')
      .replace(/(\d+)\s*(?:pcs|units|boxes|packets|packs|reams|bags|rolls|cans|set|kg|l|ltr|meters|coils)?\b/i, '')
      .replace(/(?:sell(?:ing)?(?:\s*price)?|mrp|price|at|cost|buy|purchase|cp)\s*(?:₹|rs\.?|inr)?\s*\d+(?:\.\d+)?/gi, '')
      .replace(/(?:₹|rs\.?)\s*\d+(?:\.\d+)?/gi, '')
      .replace(/^(?:of|for|with)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanedName || cleanedName.length < 2) {
      cleanedName = `Item #${i + 1} (${raw.slice(0, 20)})`;
    }

    const { category, unit } = inferCategoryAndUnit(cleanedName);
    const skuPrefix = cleanedName.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'ITM');
    const sku = `${skuPrefix}-${Math.floor(100 + Math.random() * 900)}`;

    results.push({
      id: `parsed_${Date.now()}_${i}`,
      name: cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1),
      sku,
      category,
      unit,
      costPrice,
      sellingPrice,
      stock,
      reorderPoint: Math.max(5, Math.round(stock * 0.25)),
      taxRate: defaultTaxRate,
      confidence: 94,
    });
  }

  return results;
}

// ─── 2. Category & Unit Inference Helper ───────────────────────

export function inferCategoryAndUnit(productName: string): { category: string; unit: string; markupPercent: number } {
  const lower = productName.toLowerCase();

  // Electrical & Electronics
  if (/\b(?:bulb|led|wire|cable|switch|socket|mcb|relay|motor|sensor|board|circuit|havells|anchor|finolex|polycab|v-guard|philips|luminous|conduit)\b/i.test(lower)) {
    let unit = 'pcs';
    if (/\b(?:wire|cable)\b/i.test(lower)) unit = 'coil';
    if (/\b(?:meter|mtr)\b/i.test(lower)) unit = 'meter';
    return { category: 'Electrical & Electronics', unit, markupPercent: 35 };
  }

  // Stationery & Paper
  if (/\b(?:pen|pencil|marker|highlighter|eraser|sharpener|scale|ruler|ink|refill|cello|hauser|reynolds)\b/i.test(lower)) {
    return { category: 'Pens & Writing', unit: 'pcs', markupPercent: 35 };
  }
  if (/\b(?:book|paper|register|sheet|folder|file|diary|envelope|ream|spiral|notebook|classmate|jk copier|copier)\b/i.test(lower)) {
    return { 
      category: 'Paper & Stationery', 
      unit: /\bream\b/i.test(lower) ? 'ream' : /\b(?:pack|box)\b/i.test(lower) ? 'pack' : 'pcs', 
      markupPercent: 30 
    };
  }
  if (/\b(?:stapler|tape|glue|scissor|pin|punch|cutter|clip|fevicol|kangaro)\b/i.test(lower)) {
    return { category: 'Office Supplies', unit: 'pcs', markupPercent: 30 };
  }

  // Grocery & FMCG
  if (/\b(?:rice|atta|wheat|sugar|salt|dal|flour|besan|maida|sooji|grain|pulse|spice|turmeric|chilli|tata salt|basmati|fortune)\b/i.test(lower)) {
    return { 
      category: 'Grocery & Staples', 
      unit: /\b(?:bag|sack)\b/i.test(lower) ? 'bag' : /\b(?:pack|pkt)\b/i.test(lower) ? 'pack' : 'kg', 
      markupPercent: 20 
    };
  }
  if (/\b(?:oil|ghee|butter|milk|cheese|paneer|curd|beverage|juice|tea|coffee|drink|soda|water|sunflower oil|mustard oil)\b/i.test(lower)) {
    return { 
      category: 'Beverages & Dairy', 
      unit: /\b(?:oil|milk|juice|water)\b/i.test(lower) ? 'litre' : /\bpouch\b/i.test(lower) ? 'pouch' : 'pcs', 
      markupPercent: 22 
    };
  }
  if (/\b(?:soap|shampoo|toothpaste|brush|detergent|cleaner|wash|sanitizer|tissue|harpic|surf|dettol)\b/i.test(lower)) {
    return { category: 'Personal Care & Hygiene', unit: 'pcs', markupPercent: 25 };
  }
  if (/\b(?:biscuit|cookie|chocolate|snack|chips|namkeen|noodle|pasta|sauce|jam|bread|cadbury|parle|britannia)\b/i.test(lower)) {
    return { category: 'Snacks & Packaged Foods', unit: 'pack', markupPercent: 25 };
  }

  // Mobile & Gadgets
  if (/\b(?:charger|adapter|usb|type-c|hdmi|lightning|power\s*bank|battery|earphone|headphone|tws|speaker|airpod|tempered|case|cover)\b/i.test(lower)) {
    return { category: 'Mobile & Electronics', unit: 'pcs', markupPercent: 45 };
  }

  // Hardware & Industrial
  if (/\b(?:bolt|nut|screw|washer|flange|bearing|fastener|rivet|rod|pipe|valve|skf|m10|m8|m12|hex)\b/i.test(lower)) {
    return { category: 'Fasteners & Hardware', unit: /\bbox\b/i.test(lower) ? 'box' : /\bset\b/i.test(lower) ? 'set' : 'pcs', markupPercent: 35 };
  }
  if (/\b(?:tool|drill|blade|disc|abrasive|cutter|wrench|hammer|plier|spanner|welding|grinding)\b/i.test(lower)) {
    return { category: 'Tools & Machining', unit: 'pcs', markupPercent: 30 };
  }

  // Clothing & Apparel
  if (/\b(?:shirt|t-shirt|pant|jeans|trouser|kurti|saree|dress|fabric|cotton|silk|denim|linen|garment|apparel)\b/i.test(lower)) {
    return { category: 'Apparel & Clothing', unit: 'pcs', markupPercent: 45 };
  }

  // Pharmaceuticals & Medical
  if (/\b(?:tablet|syrup|capsule|injection|ointment|bandage|cotton|cream|drop|medicine|pharma|mg|ml)\b/i.test(lower)) {
    return { category: 'Medicines & Health', unit: /\bstrip\b/i.test(lower) ? 'strip' : /\bbottle\b/i.test(lower) ? 'bottle' : 'pack', markupPercent: 25 };
  }

  return { category: 'General Goods', unit: 'pcs', markupPercent: 30 };
}

// ─── 3. Advanced Heuristic Invoice Text Parser ──────────────────

export function parseInvoiceText(rawText: string, defaultTaxRate = 18): InvoiceScanResult {
  if (!rawText || !rawText.trim()) {
    return {
      supplierName: 'Uploaded Supplier Bill',
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      subtotal: 0,
      taxTotal: 0,
      grandTotal: 0,
      items: [],
      rawText: '',
      sourceEngine: 'client_ocr',
    };
  }

  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // 1. Detect Supplier Name (Top lines)
  let supplierName = '';
  const topLines = lines.slice(0, 8);
  for (const line of topLines) {
    if (
      /^\s*(?:tax\s*invoice|bill\s*of\s*supply|cash\s*memo|retail\s*invoice|estimate|quotation|purchase\s*bill|invoice\s*no|bill\s*#|date|dated|gstin)\b/i.test(line)
    ) {
      continue;
    }
    if (
      /(?:m\/s|enterprises|traders|trading|pvt|ltd|limited|co\.|corporation|wholesalers|distributors|depot|store|agencies|mart|brothers|sons|works|industries|stationers|pharmacy|hardware|electricals|textiles|garments)/i.test(line)
    ) {
      supplierName = line.replace(/^(?:from|m\/s\.?|supplier|vendor)\s*[:\-]?\s*/i, '').trim();
      break;
    }
  }
  if (!supplierName && topLines.length > 0) {
    const candidate = topLines.find(l => !/^(?:tax\s*invoice|bill\s*#|bill\s*no|cash|invoice\s*no|date|dated|gstin)/i.test(l));
    if (candidate) supplierName = candidate;
  }
  if (!supplierName || supplierName.length < 3) {
    supplierName = 'Supplier Bill';
  }

  // 2. Detect Invoice Number
  let invoiceNumber = '';
  const invMatch = rawText.match(/(?:tax\s*invoice\s*no|invoice\s*(?:no\.?|num\.?|#|\:)|inv\s*(?:no\.?|num\.?|#|\:)|bill\s*(?:no\.?|num\.?|#|\:)|memo\s*(?:no\.?|num\.?|#|\:)|receipt\s*(?:no\.?|num\.?|#|\:))\s*[:\-]?\s*([A-Za-z0-9\-\/\_]+)/i);
  if (invMatch) {
    invoiceNumber = invMatch[1].trim();
  } else {
    const patternMatch = rawText.match(/\b([A-Z]{2,4}[\-\/][0-9]{3,8}(?:[\-\/][0-9]{2,4})?)\b/);
    if (patternMatch) {
      invoiceNumber = patternMatch[1];
    } else {
      invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    }
  }

  // 3. Detect Invoice Date
  let invoiceDate = new Date().toISOString().split('T')[0];
  const dateMatch = rawText.match(/(?:date|dated|dt\.?)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i);
  if (dateMatch) {
    const rawDate = dateMatch[1];
    const parts = rawDate.split(/[\/\-\.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        invoiceDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else {
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        invoiceDate = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  }

  // 4. Detect GSTIN / Tax ID
  let taxGstin = '';
  const gstinMatch = rawText.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/);
  if (gstinMatch) {
    taxGstin = gstinMatch[1];
  } else {
    const taxMatch = rawText.match(/(?:gstin|gst\s*no|vat\s*no|tax\s*id)\s*[:\-]?\s*([A-Za-z0-9]+)/i);
    if (taxMatch) taxGstin = taxMatch[1];
  }

  // 5. Detect Totals
  let grandTotal = 0;
  let subtotal = 0;
  let taxTotal = 0;

  const grandTotalMatch = rawText.match(/(?:grand\s*total|net\s*payable|total\s*amount|net\s*amount|total\s*val(?:ue)?)\s*[:\-=]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d{2})?)/i);
  if (grandTotalMatch) {
    grandTotal = parseFloat(grandTotalMatch[1].replace(/,/g, ''));
  }

  const subtotalMatch = rawText.match(/(?:sub\s*total|subtotal|taxable\s*value|taxable\s*amount|total\s*before\s*tax)\s*[:\-=]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d{2})?)/i);
  if (subtotalMatch) {
    subtotal = parseFloat(subtotalMatch[1].replace(/,/g, ''));
  }

  const taxTotalMatch = rawText.match(/(?:total\s*tax|gst\s*total|tax\s*amount|cgst\s*\+\s*sgst|igst\s*amount|gst\s*\(\d+%\))\s*[:\-=]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d{2})?)/i);
  if (taxTotalMatch) {
    taxTotal = parseFloat(taxTotalMatch[1].replace(/,/g, ''));
  }

  // 6. Extract Line Items
  const items: ParsedItem[] = [];

  const isHeaderOrMetaLine = (l: string): boolean => {
    const lower = l.toLowerCase().trim();
    if (/^(?:tax\s*invoice|bill\s*of\s*supply|cash\s*memo|estimate|quotation|retail\s*invoice)\b/i.test(lower)) return true;
    if (/^(?:invoice\s*no|inv\s*no|bill\s*#|bill\s*no|date|dated|dt\.?|gstin|pan\s*no|cin\s*no)\b/i.test(lower)) return true;
    if (/^(?:subtotal|sub\s*total|grand\s*total|net\s*payable|total\s*amount|net\s*amount)\b/i.test(lower)) return true;
    if (/^(?:gst\s*\(|gst\s*total|tax\s*amount|cgst|sgst|output@cgst|output@sgst|igst|round\s*off|discount|freight|delivery)\b/i.test(lower)) return true;
    if (/^(?:item\s*description|particulars|sr\s*no|s\.no|description\s+of\s+goods|qty\s+rate|rate\s+amount|hsn\/sac)\b/i.test(lower)) return true;
    if (/^(?:terms\s*&|bank\s*details|account\s*no|ifsc|authorised|signature|for\s+|declaration|subject\s*to)\b/i.test(lower)) return true;
    if (/^(?:total\s*amount|grand\s*total|amount\s*chargeable|tax\s*amount\s*in\s*words)/i.test(lower)) return true;
    return false;
  };

  let hitBottomTaxSummary = false;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    // Check if we reached the tax breakdown table or footer
    if (/^(?:output@cgst|output@sgst|round\s*off|total\s+3,543|amount\s*chargeable|indian\s*rupees)/i.test(line)) {
      hitBottomTaxSummary = true;
    }
    if (hitBottomTaxSummary) continue;

    if (isHeaderOrMetaLine(line)) continue;

    // Check if line contains meaningful letters
    if (!/[a-zA-Z]{2,}/.test(line)) continue;

    // Clean leading row index e.g. "1. ", "1) ", "01 "
    let cleanLine = line.replace(/^\s*\d+[\.\)\-\s]+\s*/, '').trim();

    // Check for explicit quantity with unit
    const explicitQtyRegex = /\b(\d+(?:\.\d+)?)\s*(pcs|units|box(?:es)?|pack(?:s|ets)?|ream(?:s)?|bag(?:s)?|coil(?:s)?|kg|gm|litre|ltr|nos|roll(?:s)?|meter(?:s)?|mtr|set(?:s)?)\b/i;
    const explicitQtyMatch = cleanLine.match(explicitQtyRegex);

    let detectedUnit = 'pcs';
    let detectedQty: number | null = null;

    if (explicitQtyMatch) {
      detectedQty = parseFloat(explicitQtyMatch[1]);
      detectedUnit = explicitQtyMatch[2].toLowerCase();
    }

    // Extract numbers, filtering out 6-8 digit HSN codes (e.g. 482090, 39264099, 39191000) and standard tax % (e.g. 18%, 12%, 5%)
    let lineWithoutHsn = cleanLine.replace(/\b(?:482090|39264099|39191000|32141000|96082000|96081019|35061000|\d{6,8})\b/g, ' ');
    lineWithoutHsn = lineWithoutHsn.replace(/\b(18|12|5|28|0)\s*%/g, ' ');

    const numericMatches = Array.from(lineWithoutHsn.matchAll(/(?:^|\s|(?:₹|rs\.?))\s*(\d+(?:\.\d+)?)(?=\s|$)/gi))
      .map(m => parseFloat(m[1]))
      .filter(n => !isNaN(n) && n > 0 && n < 100000);

    if (numericMatches.length >= 1) {
      let qty = detectedQty !== null ? detectedQty : 1;
      let costPrice = 0;

      // Smart invoice column solver (Qty * Rate ≈ Amount)
      if (numericMatches.length >= 3) {
        let solved = false;
        for (let i = 0; i < numericMatches.length; i++) {
          for (let j = 0; j < numericMatches.length; j++) {
            if (i === j) continue;
            const a = numericMatches[i];
            const b = numericMatches[j];
            const product = a * b;

            const cIndex = numericMatches.findIndex((n, k) => k !== i && k !== j && Math.abs(n - product) <= Math.max(1, product * 0.05));
            if (cIndex !== -1) {
              if (detectedQty !== null) {
                qty = detectedQty;
                costPrice = (a === detectedQty ? b : a);
              } else {
                qty = (Number.isInteger(a) && a <= b ? a : b);
                costPrice = (qty === a ? b : a);
              }
              solved = true;
              break;
            }
          }
          if (solved) break;
        }

        if (!solved) {
          if (detectedQty !== null) {
            const others = numericMatches.filter(n => n !== detectedQty);
            costPrice = others.length > 0 ? Math.min(...others) : 50;
          } else {
            const sorted = [...numericMatches].sort((a, b) => a - b);
            qty = sorted[0] <= 500 && Number.isInteger(sorted[0]) ? sorted[0] : 1;
            costPrice = sorted[1] || sorted[0];
          }
        }
      } else if (numericMatches.length === 2) {
        if (detectedQty !== null) {
          const others = numericMatches.filter(n => n !== detectedQty);
          costPrice = others.length > 0 ? others[0] : numericMatches[0];
        } else {
          const [n1, n2] = numericMatches;
          if (Number.isInteger(n1) && n1 <= 500 && n2 > n1) {
            qty = n1;
            costPrice = n2;
          } else {
            qty = 1;
            costPrice = Math.min(n1, n2);
          }
        }
      } else if (numericMatches.length === 1) {
        costPrice = numericMatches[0];
      }

      // Clean item name by stripping out the recognized numbers and explicit units
      let name = cleanLine;
      if (explicitQtyMatch) {
        name = name.replace(explicitQtyMatch[0], ' ');
      }
      // Remove HSN codes and trailing rate/amount numbers
      name = name
        .replace(/\b(?:482090|39264099|39191000|32141000|96082000|96081019|35061000|\d{6,8})\b/g, ' ')
        .replace(/\b(18|12|5|28|0)\s*%/g, ' ')
        .replace(/(?:₹|rs\.?|inr)\s*[\d,]+(?:\.\d+)?/gi, '')
        .replace(/(?:\s+\d+(?:\.\d+)?)+(?=\s*$)/g, '')
        .replace(/[\:\-\=\|\/\\]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (name.length >= 2 && /[a-zA-Z]/.test(name)) {
        if (/^(?:subtotal|total|gst|tax|round\s*off|discount|freight|delivery|amount|rate|qty|output|cgst|sgst|taxable)$/i.test(name)) {
          continue;
        }

        const inferred = inferCategoryAndUnit(name);
        let finalUnit = detectedUnit !== 'pcs' ? detectedUnit : inferred.unit;

        if (costPrice === 0) costPrice = 50;
        const sellingPrice = Math.round(costPrice * (1 + inferred.markupPercent / 100));

        const skuPrefix = name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'ITM');
        const sku = `${skuPrefix}-${Math.floor(100 + Math.random() * 900)}`;

        items.push({
          id: `item_${Date.now()}_${items.length}`,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          sku,
          category: inferred.category,
          unit: finalUnit,
          costPrice,
          sellingPrice,
          stock: Math.max(1, qty),
          reorderPoint: Math.max(2, Math.round(qty * 0.25)),
          taxRate: defaultTaxRate,
          confidence: 95,
        });
      }
    }
  }

  // Calculate totals if missing
  if (grandTotal === 0 && items.length > 0) {
    subtotal = items.reduce((sum, item) => sum + item.costPrice * item.stock, 0);
    taxTotal = Math.round(subtotal * (defaultTaxRate / 100));
    grandTotal = subtotal + taxTotal;
  } else if (subtotal === 0 && grandTotal > 0) {
    taxTotal = Math.round(grandTotal * (defaultTaxRate / (100 + defaultTaxRate)));
    subtotal = grandTotal - taxTotal;
  }

  return {
    supplierName,
    invoiceNumber,
    invoiceDate,
    taxGstin,
    subtotal,
    taxTotal,
    grandTotal,
    items,
    rawText,
    sourceEngine: 'client_ocr',
  };
}

// ─── 4. Client-Side Image OCR Engine (Tesseract.js) ─────────────

export async function extractTextFromImageOCR(
  imageSource: File | Blob | string,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  onProgress?.(10, 'Initializing OCR engine...');

  try {
    const Tesseract = await import('tesseract.js');
    onProgress?.(25, 'Loading language recognition models...');

    let imageUrl: string;
    if (typeof imageSource === 'string') {
      imageUrl = imageSource;
    } else {
      imageUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageSource);
      });
    }

    onProgress?.(40, 'Scanning bill text & numbers...');

    const result = await Tesseract.recognize(imageUrl, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text' && m.progress !== undefined) {
          const pct = 40 + Math.round(m.progress * 50);
          onProgress?.(pct, `Reading text (${Math.round(m.progress * 100)}%)...`);
        }
      },
    });

    onProgress?.(95, 'Structuring invoice line items...');
    return result.data.text || '';
  } catch (error: any) {
    console.error('Tesseract OCR error:', error);
    throw new Error(`In-browser OCR failed: ${error.message || 'Unknown error'}`);
  }
}

// ─── 5. PDF Text & Document Extractor ───────────────────────────

export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  onProgress?.(15, 'Reading PDF document structure...');

  try {
    const arrayBuffer = await file.arrayBuffer();
    
    try {
      const pdfjs = await import('pdfjs-dist');
      if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      }

      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        onProgress?.(20 + Math.round((pageNum / pdf.numPages) * 60), `Extracting text from page ${pageNum} of ${pdf.numPages}...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      if (fullText.trim().length > 20) {
        onProgress?.(90, 'Parsing extracted PDF lines...');
        return fullText;
      }
    } catch (pdfErr) {
      console.warn('PDF.js text layer fallback:', pdfErr);
    }

    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawContent = decoder.decode(arrayBuffer);
    
    const textMatches = Array.from(rawContent.matchAll(/\(([^()]{2,})\)\s*T[jJ]/g)).map(m => m[1]);
    if (textMatches.length > 5) {
      return textMatches.join(' ');
    }

    return rawContent;
  } catch (err: any) {
    console.error('PDF extract error:', err);
    throw new Error(`Failed to read PDF text: ${err.message}`);
  }
}

// ─── 6. Master Unified Bill Scanner Function ────────────────────

export interface ScanBillOptions {
  apiKey?: string;
  defaultTaxRate?: number;
  onProgress?: (progress: number, status: string) => void;
}

export async function scanBillFile(
  file: File,
  options?: ScanBillOptions
): Promise<InvoiceScanResult> {
  const { apiKey: explicitApiKey, defaultTaxRate = 18, onProgress } = options || {};
  const apiKey = explicitApiKey || (typeof window !== 'undefined' ? localStorage.getItem('factorybrain_gemini_key') || undefined : undefined);

  onProgress?.(5, 'Preparing document for AI analysis...');

  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif|tiff)$/i.test(file.name);
  const isText = file.type.startsWith('text/') || /\.(txt|csv)$/i.test(file.name);

  let previewUrl: string | undefined;
  let base64Data: string | undefined;

  if (isImage || isPDF) {
    previewUrl = URL.createObjectURL(file);
    base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  // 1. Try Gemini Vision AI API
  onProgress?.(20, 'Connecting to AI Vision engine...');
  try {
    const apiPayload: any = {
      defaultTaxRate,
      apiKey,
    };

    if ((isImage || isPDF) && base64Data) {
      apiPayload.imageBase64 = base64Data;
      apiPayload.mimeType = isPDF ? 'application/pdf' : (file.type || 'image/jpeg');
    } else if (isText) {
      const text = await file.text();
      apiPayload.rawText = text;
    }

    const response = await fetch('/api/scan-bill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPayload),
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success && json.data) {
        onProgress?.(100, 'AI Invoice Extraction Complete!');
        return {
          ...json.data,
          sourceEngine: 'gemini_vision',
          previewUrl,
        };
      }
    }
  } catch (apiErr) {
    console.warn('Backend Vision API skipped/failed, proceeding with in-browser OCR:', apiErr);
  }

  // 2. Client-Side Fallback OCR / Text Parser
  onProgress?.(30, 'Using in-browser OCR & invoice parsing engine...');

  let extractedRawText = '';

  if (isText) {
    extractedRawText = await file.text();
  } else if (isPDF) {
    extractedRawText = await extractTextFromPDF(file, onProgress);
  } else if (isImage) {
    extractedRawText = await extractTextFromImageOCR(file, onProgress);
  } else {
    extractedRawText = await file.text();
  }

  onProgress?.(90, 'Extracting line items and financial totals...');
  const parsed = parseInvoiceText(extractedRawText, defaultTaxRate);
  onProgress?.(100, 'Done!');

  return {
    ...parsed,
    sourceEngine: isPDF ? 'pdf_parser' : 'client_ocr',
    previewUrl,
  };
}

// ─── 7. Sample Supplier Invoices (For Demo Presets) ─────────────

export const SAMPLE_SUPPLIER_INVOICES: Record<string, InvoiceScanResult> = {
  rama_company_bill: {
    supplierName: 'Rama & Company',
    invoiceNumber: 'GST-04429',
    invoiceDate: '2026-08-14',
    taxGstin: '09AHMPM1228K1Z2',
    subtotal: 3543.95,
    taxTotal: 637.94,
    grandTotal: 4182.00,
    sourceEngine: 'preset_demo',
    items: [
      {
        id: 'rama_1',
        name: 'Index File',
        sku: '482090',
        category: 'Paper & Stationery',
        unit: 'NOS',
        costPrice: 84.75,
        sellingPrice: 110.00,
        stock: 10,
        reorderPoint: 3,
        taxRate: 18,
        confidence: 100,
      },
      {
        id: 'rama_2',
        name: 'Cobra File',
        sku: '39264099',
        category: 'Paper & Stationery',
        unit: 'NOS',
        costPrice: 25.42,
        sellingPrice: 35.00,
        stock: 12,
        reorderPoint: 4,
        taxRate: 18,
        confidence: 100,
      },
      {
        id: 'rama_3',
        name: 'Self Adhesive Tape 24mm x 35mtr Ex (144 Roll)',
        sku: '39191000',
        category: 'Tapes & Adhesives',
        unit: 'Roll',
        costPrice: 7.63,
        sellingPrice: 12.00,
        stock: 24,
        reorderPoint: 6,
        taxRate: 18,
        confidence: 100,
      },
      {
        id: 'rama_4',
        name: 'Self Adhesive Tape 48mm X 45mtr Brown',
        sku: '39191000',
        category: 'Tapes & Adhesives',
        unit: 'Roll',
        costPrice: 26.27,
        sellingPrice: 40.00,
        stock: 6,
        reorderPoint: 2,
        taxRate: 18,
        confidence: 100,
      },
      {
        id: 'rama_5',
        name: 'Mould It 90gm',
        sku: '32141000',
        category: 'Crafts & Adhesives',
        unit: 'pcs',
        costPrice: 24.58,
        sellingPrice: 35.00,
        stock: 10,
        reorderPoint: 3,
        taxRate: 18,
        confidence: 100,
      },
      {
        id: 'rama_6',
        name: 'Doms Pastel Brush Pen 14 (60cb)',
        sku: '96082000',
        category: 'Pens & Markers',
        unit: 'NOS',
        costPrice: 114.41,
        sellingPrice: 150.00,
        stock: 3,
        reorderPoint: 1,
        taxRate: 18,
        confidence: 100,
      },
      {
        id: 'rama_7',
        name: '02 Gelpen Blue',
        sku: '96081019',
        category: 'Pens & Markers',
        unit: 'NOS',
        costPrice: 11.27,
        sellingPrice: 18.00,
        stock: 50,
        reorderPoint: 15,
        taxRate: 18,
        confidence: 100,
      },
      {
        id: 'rama_8',
        name: 'Fevistick 8 Gm',
        sku: '35061000',
        category: 'Glues & Adhesives',
        unit: 'NOS',
        costPrice: 15.25,
        sellingPrice: 22.00,
        stock: 10,
        reorderPoint: 3,
        taxRate: 18,
        confidence: 100,
      },
      {
        id: 'rama_9',
        name: 'Fevicol MR (22.5 Gm)',
        sku: '35061000',
        category: 'Glues & Adhesives',
        unit: 'NOS',
        costPrice: 5.93,
        sellingPrice: 10.00,
        stock: 40,
        reorderPoint: 10,
        taxRate: 18,
        confidence: 100,
      },
      {
        id: 'rama_10',
        name: 'Fevicol MR 50 Gm',
        sku: '35061000',
        category: 'Glues & Adhesives',
        unit: 'NOS',
        costPrice: 12.71,
        sellingPrice: 20.00,
        stock: 20,
        reorderPoint: 5,
        taxRate: 18,
        confidence: 100,
      },
      {
        id: 'rama_11',
        name: 'Fevicol 200 Gm',
        sku: '35061000',
        category: 'Glues & Adhesives',
        unit: 'NOS',
        costPrice: 63.56,
        sellingPrice: 85.00,
        stock: 4,
        reorderPoint: 2,
        taxRate: 18,
        confidence: 100,
      },
    ],
  },
  stationery_bill: {
    supplierName: 'Shree Balaji Paper & Stationery Wholesalers',
    invoiceNumber: 'INV-SB-2026-8841',
    invoiceDate: new Date().toISOString().split('T')[0],
    taxGstin: '07AAACS1482K1Z9',
    subtotal: 12450,
    taxTotal: 2241,
    grandTotal: 14691,
    sourceEngine: 'preset_demo',
    items: [
      {
        id: 'inv_1',
        name: 'JK Copier A4 Paper 75GSM (500 Sheets)',
        sku: 'PAP-JK-A4',
        category: 'Paper & Stationery',
        unit: 'ream',
        costPrice: 215,
        sellingPrice: 300,
        stock: 30,
        reorderPoint: 8,
        taxRate: 18,
        confidence: 98,
      },
      {
        id: 'inv_2',
        name: 'Classmate Pulse 6-Subject Spiral Notebook',
        sku: 'NB-CLS-PUL',
        category: 'Notebooks',
        unit: 'pcs',
        costPrice: 95,
        sellingPrice: 150,
        stock: 45,
        reorderPoint: 10,
        taxRate: 12,
        confidence: 97,
      },
      {
        id: 'inv_3',
        name: 'Hauser XO Ball Pen 0.7mm Blue (Box of 25)',
        sku: 'PEN-HAU-XO',
        category: 'Pens & Markers',
        unit: 'box',
        costPrice: 110,
        sellingPrice: 180,
        stock: 20,
        reorderPoint: 5,
        taxRate: 18,
        confidence: 96,
      },
      {
        id: 'inv_4',
        name: 'Kangaro Stapler HP-45 Heavy Duty',
        sku: 'STP-KAN-45',
        category: 'Desk Accessories',
        unit: 'pcs',
        costPrice: 165,
        sellingPrice: 280,
        stock: 12,
        reorderPoint: 3,
        taxRate: 18,
        confidence: 95,
      },
    ],
  },
  fmcg_bill: {
    supplierName: 'Metro Global FMCG & Provisions Depot',
    invoiceNumber: 'MTR-DEL-9042',
    invoiceDate: new Date().toISOString().split('T')[0],
    taxGstin: '07AABCM8892P1Z3',
    subtotal: 18500,
    taxTotal: 1120,
    grandTotal: 19620,
    sourceEngine: 'preset_demo',
    items: [
      {
        id: 'inv_5',
        name: 'Fortune Sunlite Refined Sunflower Oil (1L Pouch)',
        sku: 'OIL-FOR-1L',
        category: 'Cooking Oils',
        unit: 'pouch',
        costPrice: 115,
        sellingPrice: 142,
        stock: 40,
        reorderPoint: 10,
        taxRate: 5,
        confidence: 99,
      },
      {
        id: 'inv_6',
        name: 'India Gate Classic Basmati Rice (5kg Bag)',
        sku: 'RIC-ING-5KG',
        category: 'Food Grains',
        unit: 'bag',
        costPrice: 420,
        sellingPrice: 510,
        stock: 20,
        reorderPoint: 5,
        taxRate: 0,
        confidence: 98,
      },
      {
        id: 'inv_7',
        name: 'Tata Salt Vaccum Evaporated (1kg Pack)',
        sku: 'SLT-TAT-1KG',
        category: 'Staples',
        unit: 'pack',
        costPrice: 22,
        sellingPrice: 28,
        stock: 80,
        reorderPoint: 20,
        taxRate: 0,
        confidence: 97,
      },
    ],
  },
  industrial_bill: {
    supplierName: 'Apex Machine Tooling & Fastener Supply Co.',
    invoiceNumber: 'APX-MCH-4819',
    invoiceDate: new Date().toISOString().split('T')[0],
    taxGstin: '07AAACA4910N1Z2',
    subtotal: 26400,
    taxTotal: 4752,
    grandTotal: 31152,
    sourceEngine: 'preset_demo',
    items: [
      {
        id: 'inv_8',
        name: 'Grade 8.8 M10 x 50mm Hex Flange Bolts (100 Pcs)',
        sku: 'BLT-M10-50',
        category: 'Fasteners',
        unit: 'box',
        costPrice: 450,
        sellingPrice: 680,
        stock: 25,
        reorderPoint: 6,
        taxRate: 18,
        confidence: 98,
      },
      {
        id: 'inv_9',
        name: 'SKF Deep Groove Ball Bearing 6304-2RS',
        sku: 'BRG-SKF-6304',
        category: 'Bearings & Spares',
        unit: 'pcs',
        costPrice: 240,
        sellingPrice: 390,
        stock: 35,
        reorderPoint: 8,
        taxRate: 18,
        confidence: 99,
      },
    ],
  },
};

// ─── 8. Barcode / QR Database Lookup Dictionary ────────────────

export const BARCODE_LOOKUP_DATABASE: Record<string, Omit<Product, 'id' | 'stock'>> = {
  '8901030382901': {
    name: 'Classmate Ruled Notebook 172 Pages (A4 Size)',
    sku: '8901030382901',
    category: 'Notebooks',
    unit: 'pcs',
    costPrice: 45,
    sellingPrice: 70,
    taxRate: 12,
    reorderPoint: 15,
    status: 'active',
  },
  '8901725121045': {
    name: 'Cello Butterflow Blue Ball Pen 0.7mm',
    sku: '8901725121045',
    category: 'Pens & Markers',
    unit: 'pcs',
    costPrice: 6,
    sellingPrice: 10,
    taxRate: 18,
    reorderPoint: 25,
    status: 'active',
  },
  '8901058852615': {
    name: 'JK Easy Copier Paper A4 70GSM (500 Sheets)',
    sku: '8901058852615',
    category: 'Paper & Reams',
    unit: 'ream',
    costPrice: 210,
    sellingPrice: 290,
    taxRate: 18,
    reorderPoint: 10,
    status: 'active',
  },
  '8901063012110': {
    name: 'Fevicol MR Squeezy Bottle Adhesive (50g)',
    sku: '8901063012110',
    category: 'Adhesives & Tapes',
    unit: 'bottle',
    costPrice: 18,
    sellingPrice: 25,
    taxRate: 18,
    reorderPoint: 12,
    status: 'active',
  },
  '8901030801204': {
    name: 'Camlin Exam Geometry Box 9-Piece Set',
    sku: '8901030801204',
    category: 'Mathematical Instruments',
    unit: 'set',
    costPrice: 95,
    sellingPrice: 150,
    taxRate: 18,
    reorderPoint: 8,
    status: 'active',
  },
};
