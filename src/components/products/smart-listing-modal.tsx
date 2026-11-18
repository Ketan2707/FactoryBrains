'use client';

import { useState, useRef, useEffect } from 'react';
import type { Product } from '@/lib/types/entities';
import { INDUSTRY_TEMPLATES } from '@/lib/data/industry-templates';
import { 
  parseNaturalLanguageListing, 
  scanBillFile,
  parseInvoiceText,
  BARCODE_LOOKUP_DATABASE,
  SAMPLE_SUPPLIER_INVOICES,
  type ParsedItem,
  type InvoiceScanResult 
} from '@/lib/services/ai-listing-parser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Zap, 
  FileText, 
  Mic, 
  Table as TableIcon, 
  QrCode, 
  Plus, 
  Trash2, 
  Check, 
  CheckCircle2, 
  Sparkles, 
  Upload, 
  Camera, 
  ArrowRight,
  HelpCircle,
  Copy,
  ScanLine,
  RefreshCw,
  X,
  FileSpreadsheet,
  Settings2,
  Key,
  Eye,
  EyeOff,
  Edit3,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface SmartListingModalProps {
  open: boolean;
  onClose: () => void;
  currencySymbol: string;
  taxRatePercent: number;
  onImportItems: (items: Omit<Product, 'id'>[]) => void;
}

export function SmartListingModal({
  open,
  onClose,
  currencySymbol,
  taxRatePercent,
  onImportItems,
}: SmartListingModalProps) {
  const [activeTab, setActiveTab] = useState('invoice');

  // ─── 1. Industry Starter Packs State ───────────────────────────
  const [selectedIndustryId, setSelectedIndustryId] = useState('stationery');
  const [selectedTemplateItems, setSelectedTemplateItems] = useState<Record<string, boolean>>({});

  const activeIndustry = INDUSTRY_TEMPLATES.find(t => t.id === selectedIndustryId) || INDUSTRY_TEMPLATES[0];

  const handleToggleTemplateItem = (index: number) => {
    setSelectedTemplateItems(prev => ({
      ...prev,
      [index]: prev[index] !== undefined ? !prev[index] : false,
    }));
  };

  const handleSelectAllIndustryItems = () => {
    const allSelected: Record<string, boolean> = {};
    activeIndustry.items.forEach((_, idx) => {
      allSelected[idx] = true;
    });
    setSelectedTemplateItems(allSelected);
  };

  const handleImportIndustryItems = () => {
    const itemsToImport = activeIndustry.items.filter((_, idx) => {
      return selectedTemplateItems[idx] !== false;
    });

    if (itemsToImport.length === 0) {
      toast.error('Please select at least one item to import');
      return;
    }

    onImportItems(itemsToImport);
    toast.success(`Successfully imported ${itemsToImport.length} items from ${activeIndustry.name}!`);
    onClose();
  };

  // ─── 2. AI Bill / Invoice Scanner State ────────────────────────
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [invoiceResult, setInvoiceResult] = useState<InvoiceScanResult | null>(null);
  const [selectedInvoiceItems, setSelectedInvoiceItems] = useState<Record<number, boolean>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [showRawTextEditor, setShowRawTextEditor] = useState(false);
  const [rawTextContent, setRawTextContent] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load saved Gemini API Key if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('factorybrain_gemini_key') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      if (savedKey) setGeminiApiKey(savedKey);
    }
  }, []);

  const handleSaveGeminiKey = (key: string) => {
    setGeminiApiKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('factorybrain_gemini_key', key);
    }
    toast.success(key ? 'Gemini Vision AI API key saved!' : 'API key cleared');
    setShowApiKeyInput(false);
  };

  // Scan Real Uploaded File
  const handleProcessFile = async (file: File) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanStatus('Reading document...');

    try {
      const result = await scanBillFile(file, {
        apiKey: geminiApiKey || undefined,
        defaultTaxRate: taxRatePercent,
        onProgress: (pct, msg) => {
          setScanProgress(pct);
          setScanStatus(msg);
        },
      });

      setInvoiceResult(result);
      setRawTextContent(result.rawText || '');
      
      // Select all extracted items by default
      const initialSelected: Record<number, boolean> = {};
      result.items.forEach((_, idx) => {
        initialSelected[idx] = true;
      });
      setSelectedInvoiceItems(initialSelected);

      const engineLabel = 
        result.sourceEngine === 'gemini_vision' ? 'Gemini AI Vision' :
        result.sourceEngine === 'pdf_parser' ? 'PDF Text Engine' : 'In-Browser OCR';

      toast.success(`Successfully extracted ${result.items.length} items using ${engineLabel}!`);
    } catch (err: any) {
      console.error('Scan error:', err);
      toast.error(err.message || 'Failed to scan bill. Try uploading a clearer photo or enter raw text.');
    } finally {
      setIsScanning(false);
      setScanProgress(0);
      setScanStatus('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Sample Demo Presets
  const handleScanPreset = (presetKey: string) => {
    const preset = SAMPLE_SUPPLIER_INVOICES[presetKey];
    if (preset) {
      setInvoiceResult(preset);
      setRawTextContent(preset.rawText || '');
      const initialSelected: Record<number, boolean> = {};
      preset.items.forEach((_, idx) => {
        initialSelected[idx] = true;
      });
      setSelectedInvoiceItems(initialSelected);
      toast.success(`Loaded sample preset: ${preset.supplierName}`);
    }
  };

  // Edit Line Item in Extracted Result
  const handleUpdateInvoiceItem = (index: number, field: keyof ParsedItem, value: any) => {
    if (!invoiceResult) return;
    const updatedItems = [...invoiceResult.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setInvoiceResult({
      ...invoiceResult,
      items: updatedItems,
    });
  };

  const handleDeleteInvoiceItem = (index: number) => {
    if (!invoiceResult) return;
    const updatedItems = invoiceResult.items.filter((_, i) => i !== index);
    setInvoiceResult({
      ...invoiceResult,
      items: updatedItems,
    });
  };

  const handleAddEmptyInvoiceItem = () => {
    if (!invoiceResult) return;
    const newItem: ParsedItem = {
      id: `item_${Date.now()}`,
      name: 'New Item',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'General Goods',
      unit: 'pcs',
      costPrice: 50,
      sellingPrice: 75,
      stock: 10,
      reorderPoint: 2,
      taxRate: taxRatePercent,
      confidence: 100,
    };
    const updatedItems = [...invoiceResult.items, newItem];
    setInvoiceResult({
      ...invoiceResult,
      items: updatedItems,
    });
    setSelectedInvoiceItems(prev => ({
      ...prev,
      [updatedItems.length - 1]: true,
    }));
  };

  // Re-parse from raw text
  const handleReparseRawText = () => {
    if (!rawTextContent.trim()) {
      toast.error('Raw text is empty');
      return;
    }
    const parsed = parseInvoiceText(rawTextContent, taxRatePercent);
    setInvoiceResult(parsed);
    const initialSelected: Record<number, boolean> = {};
    parsed.items.forEach((_, idx) => {
      initialSelected[idx] = true;
    });
    setSelectedInvoiceItems(initialSelected);
    setShowRawTextEditor(false);
    toast.success(`Re-parsed ${parsed.items.length} items from raw text!`);
  };

  const handleImportInvoiceItems = () => {
    if (!invoiceResult || invoiceResult.items.length === 0) {
      toast.error('No items to import');
      return;
    }

    const itemsToImport = invoiceResult.items.filter((_, idx) => selectedInvoiceItems[idx] !== false);

    if (itemsToImport.length === 0) {
      toast.error('Please select at least one item to import');
      return;
    }

    const items: Omit<Product, 'id'>[] = itemsToImport.map(i => ({
      name: i.name,
      sku: i.sku,
      category: i.category,
      unit: i.unit,
      costPrice: Number(i.costPrice) || 0,
      sellingPrice: Number(i.sellingPrice) || 0,
      taxRate: Number(i.taxRate) || taxRatePercent,
      stock: Number(i.stock) || 1,
      reorderPoint: Number(i.reorderPoint) || 5,
      status: 'active',
      supplierName: invoiceResult.supplierName,
    }));

    onImportItems(items);
    toast.success(`Successfully imported ${items.length} items from ${invoiceResult.supplierName}!`);
    onClose();
  };

  // ─── 3. AI Natural Language / Voice State ──────────────────────
  const [aiPrompt, setAiPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [parsedAiItems, setParsedAiItems] = useState<ParsedItem[]>([]);

  const samplePrompts = [
    'Add 50 Classmate spiral notebooks at ₹80 sell, ₹52 cost, and 30 boxes of Cello ballpoint pens at ₹120 sell',
    'List 20 reams of A4 copier paper at ₹310 selling price, 15 desk staplers at ₹190, and 40 packs of sticky notes at ₹45',
    'Add 40 fast chargers 33W at ₹599 sell, ₹280 cost, and 60 braided Type-C cables at ₹249 sell',
  ];

  const handleParseAiPrompt = () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a description or voice note');
      return;
    }

    const items = parseNaturalLanguageListing(aiPrompt, taxRatePercent);
    setParsedAiItems(items);
    toast.success(`AI recognized ${items.length} items from your note!`);
  };

  const handleSimulateVoice = () => {
    setIsListening(true);
    toast.info('🎙️ Listening... (Speak your items and prices)');
    setTimeout(() => {
      setIsListening(false);
      const voiceText = 'Add 50 spiral notebooks at ₹80 sell, ₹55 cost, and 25 packs of highlighter pens at ₹120 sell';
      setAiPrompt(voiceText);
      const items = parseNaturalLanguageListing(voiceText, taxRatePercent);
      setParsedAiItems(items);
      toast.success('Voice transcript converted into catalog items!');
    }, 2000);
  };

  const handleImportParsedAiItems = () => {
    if (parsedAiItems.length === 0) return;

    const items: Omit<Product, 'id'>[] = parsedAiItems.map(i => ({
      name: i.name,
      sku: i.sku,
      category: i.category,
      unit: i.unit,
      costPrice: i.costPrice,
      sellingPrice: i.sellingPrice,
      taxRate: i.taxRate,
      stock: i.stock,
      reorderPoint: i.reorderPoint,
      status: 'active',
    }));

    onImportItems(items);
    toast.success(`Imported ${items.length} items into inventory!`);
    onClose();
  };

  // ─── 4. Bulk Excel / Copy-Paste State ───────────────────────────
  const [gridRows, setGridRows] = useState<Array<{ name: string; category: string; cost: string; price: string; stock: string; sku: string }>>([
    { name: '', category: 'General', cost: '50', price: '80', stock: '20', sku: '' },
    { name: '', category: 'General', cost: '100', price: '160', stock: '15', sku: '' },
    { name: '', category: 'General', cost: '30', price: '50', stock: '50', sku: '' },
  ]);

  const handleAddGridRow = () => {
    setGridRows(prev => [...prev, { name: '', category: 'General', cost: '0', price: '0', stock: '10', sku: '' }]);
  };

  const handlePasteSpreadsheet = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;

    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const parsed = lines.map((line, idx) => {
      const cols = line.split(/\t|,/);
      return {
        name: cols[0]?.trim() || `Pasted Item ${idx + 1}`,
        category: cols[1]?.trim() || 'General',
        cost: cols[2]?.trim().replace(/[^\d.]/g, '') || '50',
        price: cols[3]?.trim().replace(/[^\d.]/g, '') || '80',
        stock: cols[4]?.trim().replace(/[^\d.]/g, '') || '20',
        sku: cols[5]?.trim() || `SKU-${Date.now().toString().slice(-4)}-${idx}`,
      };
    });

    if (parsed.length > 0) {
      setGridRows(parsed);
      toast.success(`Pasted ${parsed.length} rows from clipboard!`);
    }
  };

  const handleImportGridRows = () => {
    const validRows = gridRows.filter(r => r.name.trim().length > 0);
    if (validRows.length === 0) {
      toast.error('Please enter at least one product name in the grid');
      return;
    }

    const items: Omit<Product, 'id'>[] = validRows.map((r, idx) => ({
      name: r.name.trim(),
      sku: r.sku.trim() || `SKU-${Date.now().toString().slice(-4)}-${idx}`,
      category: r.category.trim() || 'General',
      unit: 'pcs',
      costPrice: Number(r.cost) || 0,
      sellingPrice: Number(r.price) || 0,
      stock: Number(r.stock) || 10,
      reorderPoint: 5,
      taxRate: taxRatePercent,
      status: 'active',
    }));

    onImportItems(items);
    toast.success(`Imported ${items.length} items from bulk spreadsheet!`);
    onClose();
  };

  // ─── 5. Barcode Scanner State ─────────────────────────────────
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeStock, setBarcodeStock] = useState('20');
  const [barcodeFoundProduct, setBarcodeFoundProduct] = useState<Omit<Product, 'id' | 'stock'> | null>(null);

  const handleLookupBarcode = (code: string) => {
    setBarcodeInput(code);
    const found = BARCODE_LOOKUP_DATABASE[code.trim()];
    if (found) {
      setBarcodeFoundProduct(found);
      toast.success(`Found: ${found.name}`);
    } else {
      const autoProduct: Omit<Product, 'id' | 'stock'> = {
        name: `Barcode Item (${code})`,
        sku: code,
        category: 'Packaged Goods',
        unit: 'pcs',
        costPrice: 50,
        sellingPrice: 85,
        taxRate: taxRatePercent,
        reorderPoint: 5,
        status: 'active',
      };
      setBarcodeFoundProduct(autoProduct);
      toast.info(`Created new entry for barcode ${code}`);
    }
  };

  const handleImportBarcodeProduct = () => {
    if (!barcodeFoundProduct) return;

    onImportItems([
      {
        ...barcodeFoundProduct,
        stock: Number(barcodeStock) || 10,
      },
    ]);

    toast.success(`Added ${barcodeFoundProduct.name} to catalog!`);
    setBarcodeFoundProduct(null);
    setBarcodeInput('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                Smart Item Listing Studio
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                  AI OCR & Vision Enabled
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Scan supplier bills, take camera photos, paste Excel tables, or speak voice notes
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b px-4 sm:px-6 bg-card shrink-0">
            <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto p-1 bg-muted/60 my-2">
              <TabsTrigger value="invoice" className="text-xs py-2 gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5 text-blue-500" /> AI Bill Scanner
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs py-2 gap-1.5 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> 1-Click Packs
              </TabsTrigger>
              <TabsTrigger value="voice" className="text-xs py-2 gap-1.5 font-medium">
                <Mic className="w-3.5 h-3.5 text-purple-500" /> Voice / Prompt
              </TabsTrigger>
              <TabsTrigger value="spreadsheet" className="text-xs py-2 gap-1.5 font-medium">
                <TableIcon className="w-3.5 h-3.5 text-emerald-500" /> Bulk Paste
              </TabsTrigger>
              <TabsTrigger value="barcode" className="text-xs py-2 gap-1.5 font-medium">
                <QrCode className="w-3.5 h-3.5 text-cyan-500" /> Barcode Scan
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* ─── TAB 1: AI BILL & INVOICE SCANNER ─── */}
            <TabsContent value="invoice" className="mt-0 space-y-4">
              {/* Top Controls / Engine Badge Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-muted/40 border text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" /> Active OCR Engine:
                  </span>
                  {geminiApiKey ? (
                    <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] gap-1 shadow-xs">
                      ⚡ Gemini 2.0 Flash Multimodal AI (Active)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                      🔍 In-Browser Tesseract OCR (Offline Ready)
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={geminiApiKey ? "ghost" : "default"}
                    size="sm"
                    className={`h-7 text-xs gap-1 ${geminiApiKey ? 'text-muted-foreground hover:text-foreground' : 'bg-primary text-primary-foreground font-semibold'}`}
                    onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  >
                    <Key className="w-3 h-3 text-amber-300" /> {geminiApiKey ? 'Change AI Key' : 'Add Gemini API Key'}
                  </Button>
                </div>
              </div>

              {/* API Key Modal / Popover Bar */}
              {showApiKeyInput && (
                <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-primary" /> Google Gemini Vision API Key
                    </Label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                    >
                      Get Free Key from Google AI Studio ↗
                    </a>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Enables pixel-perfect extraction of complex supplier bills, GST tax tables, handwriting, and photos. (You can also add it to <code className="text-primary bg-muted px-1 rounded">.env.local</code> as <code className="text-primary bg-muted px-1 rounded">GEMINI_API_KEY</code>).
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Paste AI Studio Key: AIzaSy..."
                      value={geminiApiKey}
                      onChange={e => setGeminiApiKey(e.target.value)}
                      className="text-xs h-8 font-mono bg-background"
                    />
                    <Button size="sm" className="text-xs h-8 shrink-0 font-medium" onClick={() => handleSaveGeminiKey(geminiApiKey)}>
                      Save Key
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs h-8 shrink-0" onClick={() => setShowApiKeyInput(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload Dropzone & Action Bar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Col: Upload Card + Presets */}
                <div className="lg:col-span-4 space-y-3">
                  {/* File Dropzone */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all space-y-2.5 ${
                      isDragging 
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/30 scale-[0.99]' 
                        : 'border-muted-foreground/30 hover:border-primary/60 hover:bg-primary/5 bg-card'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*,.pdf,text/plain,.csv" 
                      onChange={handleFileUpload} 
                    />
                    <input 
                      type="file" 
                      ref={cameraInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      capture="environment"
                      onChange={handleFileUpload} 
                    />

                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Upload Your Supplier Bill / Invoice</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Drag & Drop or browse photo, PDF, or document
                      </p>
                    </div>

                    <div className="pt-1 flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="text-[11px] h-7 gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          cameraInputRef.current?.click();
                        }}
                      >
                        <Camera className="w-3 h-3 text-primary" /> Camera Snap
                      </Button>
                      <span className="text-[10px] text-muted-foreground">PNG, JPG, PDF</span>
                    </div>
                  </div>

                  {/* Document Preview Thumbnail if available */}
                  {invoiceResult?.previewUrl && (
                    <div className="p-3 rounded-xl border bg-card space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-primary" /> Scanned Document
                        </span>
                        <Badge variant="outline" className="text-[9px]">Loaded</Badge>
                      </div>
                      <div className="rounded-lg overflow-hidden border max-h-36 flex items-center justify-center bg-black/5">
                        <img 
                          src={invoiceResult.previewUrl} 
                          alt="Bill preview" 
                          className="max-h-36 object-contain w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Sample Invoice Presets */}
                  <div className="space-y-1.5 p-3 rounded-xl border bg-muted/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Or Test with Sample Invoices:
                    </span>
                    <div className="space-y-1">
                      <button
                        type="button"
                        disabled={isScanning}
                        onClick={() => handleScanPreset('rama_company_bill')}
                        className="w-full text-left p-2 rounded-lg border border-primary/40 bg-primary/5 hover:bg-primary/10 text-xs transition-colors flex items-center justify-between group"
                      >
                        <span className="font-semibold truncate text-primary">📄 Rama & Co. (Stationery Bill - 11 Items)</span>
                        <span className="text-[10px] text-primary font-bold">Load →</span>
                      </button>
                      <button
                        type="button"
                        disabled={isScanning}
                        onClick={() => handleScanPreset('stationery_bill')}
                        className="w-full text-left p-2 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/40 text-xs transition-colors flex items-center justify-between group"
                      >
                        <span className="font-medium truncate">📄 Shree Balaji (Paper & Notebooks)</span>
                        <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-semibold">Load →</span>
                      </button>
                      <button
                        type="button"
                        disabled={isScanning}
                        onClick={() => handleScanPreset('fmcg_bill')}
                        className="w-full text-left p-2 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/40 text-xs transition-colors flex items-center justify-between group"
                      >
                        <span className="font-medium truncate">📄 Metro Provisions (Kirana & Oils)</span>
                        <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-semibold">Load →</span>
                      </button>
                      <button
                        type="button"
                        disabled={isScanning}
                        onClick={() => handleScanPreset('industrial_bill')}
                        className="w-full text-left p-2 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/40 text-xs transition-colors flex items-center justify-between group"
                      >
                        <span className="font-medium truncate">📄 Apex Fasteners (Tools & Bolts)</span>
                        <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-semibold">Load →</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Col: Extracted Data Table & Controls */}
                <div className="lg:col-span-8 space-y-3">
                  {isScanning ? (
                    <div className="h-80 border-2 border-primary/30 rounded-2xl flex flex-col items-center justify-center space-y-4 bg-primary/5 p-6 text-center animate-in fade-in">
                      <div className="relative">
                        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <ScanLine className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <div className="space-y-1 max-w-sm">
                        <p className="text-sm font-bold text-foreground animate-pulse">
                          {scanStatus || 'AI Reading Invoice Line Items...'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Extracting product names, quantities, unit prices, HSN, and GST rates
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full max-w-xs space-y-1">
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-primary h-2 transition-all duration-300 rounded-full" 
                            style={{ width: `${Math.max(10, scanProgress)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{scanProgress}% completed</span>
                      </div>
                    </div>
                  ) : invoiceResult ? (
                    <div className="space-y-3 animate-in fade-in">
                      {/* Bill Header Info Card (Editable) */}
                      <div className="p-3.5 rounded-xl bg-card border shadow-xs space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Supplier / Vendor:</span>
                            <Input
                              value={invoiceResult.supplierName}
                              onChange={e => setInvoiceResult({ ...invoiceResult, supplierName: e.target.value })}
                              className="h-7 text-xs font-bold max-w-xs bg-muted/20"
                            />
                          </div>

                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <span className="text-[10px] text-muted-foreground block">Invoice # & Date</span>
                              <div className="flex items-center gap-1.5">
                                <Input
                                  value={invoiceResult.invoiceNumber}
                                  onChange={e => setInvoiceResult({ ...invoiceResult, invoiceNumber: e.target.value })}
                                  className="h-7 text-[11px] font-mono w-28 bg-muted/20"
                                />
                                <Input
                                  type="date"
                                  value={invoiceResult.invoiceDate}
                                  onChange={e => setInvoiceResult({ ...invoiceResult, invoiceDate: e.target.value })}
                                  className="h-7 text-[11px] w-32 bg-muted/20"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="flex items-center gap-2">
                            {invoiceResult.taxGstin && (
                              <Badge variant="outline" className="text-[10px] font-mono">
                                GSTIN: {invoiceResult.taxGstin}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 font-medium">
                              ✅ {invoiceResult.items.length} items parsed from bill
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 text-[10px] gap-1 px-2"
                              onClick={() => setShowRawTextEditor(!showRawTextEditor)}
                            >
                              <Edit3 className="w-2.5 h-2.5" />
                              {showRawTextEditor ? 'Hide Raw Text' : 'View / Edit Raw OCR'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 text-[10px] gap-1 px-2"
                              onClick={handleAddEmptyInvoiceItem}
                            >
                              <Plus className="w-2.5 h-2.5" /> Add Row
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Raw Text Editor Section (Optional) */}
                      {showRawTextEditor && (
                        <div className="p-3 rounded-xl border bg-muted/20 space-y-2 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold">Raw Extracted OCR Text from Bill</Label>
                            <span className="text-[10px] text-muted-foreground">Edit text lines if needed & re-parse</span>
                          </div>
                          <textarea
                            rows={4}
                            value={rawTextContent}
                            onChange={e => setRawTextContent(e.target.value)}
                            className="w-full p-2.5 text-xs font-mono rounded-lg border bg-background resize-none focus:ring-1 focus:ring-primary"
                          />
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="default" className="text-xs h-7 gap-1" onClick={handleReparseRawText}>
                              <RefreshCw className="w-3 h-3" /> Re-Parse Text
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Editable Items Table */}
                      <div className="border rounded-xl overflow-hidden max-h-72 overflow-y-auto bg-card">
                        <Table>
                          <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur">
                            <TableRow>
                              <TableHead className="w-8 text-center text-xs">Import</TableHead>
                              <TableHead className="text-xs">Product Name *</TableHead>
                              <TableHead className="text-xs">Category</TableHead>
                              <TableHead className="text-xs text-right">Qty</TableHead>
                              <TableHead className="text-xs text-right">Unit</TableHead>
                              <TableHead className="text-xs text-right">Cost ({currencySymbol})</TableHead>
                              <TableHead className="text-xs text-right">Sell ({currencySymbol})</TableHead>
                              <TableHead className="text-xs text-right">GST %</TableHead>
                              <TableHead className="text-xs w-8"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoiceResult.items.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={9} className="text-center py-6 text-muted-foreground text-xs">
                                  No items found in this bill. Click &quot;+ Add Row&quot; or check raw text.
                                </TableCell>
                              </TableRow>
                            ) : (
                              invoiceResult.items.map((item, idx) => {
                                const isChecked = selectedInvoiceItems[idx] !== false;
                                return (
                                  <TableRow 
                                    key={item.id || idx} 
                                    className={`text-xs transition-colors ${isChecked ? 'bg-card' : 'opacity-40 bg-muted/10'}`}
                                  >
                                    <TableCell className="text-center">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                          setSelectedInvoiceItems(prev => ({
                                            ...prev,
                                            [idx]: !isChecked,
                                          }));
                                        }}
                                        className="rounded border-primary text-primary h-3.5 w-3.5"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <input
                                        value={item.name}
                                        onChange={e => handleUpdateInvoiceItem(idx, 'name', e.target.value)}
                                        className="w-full h-7 px-2 text-xs rounded border bg-background font-medium"
                                        placeholder="Item description"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <input
                                        value={item.category}
                                        onChange={e => handleUpdateInvoiceItem(idx, 'category', e.target.value)}
                                        className="w-24 h-7 px-2 text-xs rounded border bg-background"
                                        placeholder="Category"
                                      />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <input
                                        type="number"
                                        value={item.stock}
                                        onChange={e => handleUpdateInvoiceItem(idx, 'stock', Number(e.target.value))}
                                        className="w-14 h-7 px-1.5 text-xs text-right rounded border bg-background font-bold"
                                      />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <input
                                        value={item.unit}
                                        onChange={e => handleUpdateInvoiceItem(idx, 'unit', e.target.value)}
                                        className="w-14 h-7 px-1 text-xs text-center rounded border bg-background"
                                      />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <input
                                        type="number"
                                        value={item.costPrice}
                                        onChange={e => handleUpdateInvoiceItem(idx, 'costPrice', Number(e.target.value))}
                                        className="w-16 h-7 px-1 text-xs text-right rounded border bg-background"
                                      />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <input
                                        type="number"
                                        value={item.sellingPrice}
                                        onChange={e => handleUpdateInvoiceItem(idx, 'sellingPrice', Number(e.target.value))}
                                        className="w-16 h-7 px-1 text-xs text-right rounded border bg-background font-bold text-primary"
                                      />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <input
                                        type="number"
                                        value={item.taxRate}
                                        onChange={e => handleUpdateInvoiceItem(idx, 'taxRate', Number(e.target.value))}
                                        className="w-12 h-7 px-1 text-xs text-right rounded border bg-background"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteInvoiceItem(idx)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                        <div className="text-xs text-muted-foreground">
                          Ready to import <span className="font-bold text-foreground">
                            {invoiceResult.items.filter((_, idx) => selectedInvoiceItems[idx] !== false).length}
                          </span> of {invoiceResult.items.length} items
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs h-9"
                            onClick={() => {
                              setInvoiceResult(null);
                              fileInputRef.current?.click();
                            }}
                          >
                            Scan Another Bill
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleImportInvoiceItems}
                            className="gap-2 text-xs font-bold h-9 shadow-md bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Import Items to Inventory Catalog
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-3 bg-muted/10">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                        <ScanLine className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">No Bill Scanned Yet</p>
                        <p className="text-xs max-w-sm">
                          Upload your supplier bill, take a photo with your phone camera, or click a sample invoice preset on the left to extract inventory.
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="text-xs h-8 gap-1.5 font-semibold"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-3.5 h-3.5" /> Select Bill to Scan
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ─── TAB 2: 1-CLICK INDUSTRY STARTER PACKS ─── */}
            <TabsContent value="templates" className="mt-0 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm">Select Your Industry Starter Catalog</h3>
                  <p className="text-xs text-muted-foreground">
                    Pre-configured items with standard SKUs, categories, and benchmark prices.
                  </p>
                </div>
                <Button size="sm" variant="outline" className="text-xs h-8" onClick={handleSelectAllIndustryItems}>
                  <Check className="w-3.5 h-3.5 mr-1" /> Select All ({activeIndustry.items.length})
                </Button>
              </div>

              {/* Industry Selector Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {INDUSTRY_TEMPLATES.map(tmpl => (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedIndustryId(tmpl.id);
                      setSelectedTemplateItems({});
                    }}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      selectedIndustryId === tmpl.id
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/30 shadow-xs'
                        : 'hover:border-primary/40 bg-card'
                    }`}
                  >
                    <div className="text-xl mb-1">{tmpl.icon}</div>
                    <p className="font-semibold text-xs truncate">{tmpl.name.split(',')[0]}</p>
                    <p className="text-[10px] text-muted-foreground">{tmpl.items.length} items</p>
                  </div>
                ))}
              </div>

              {/* Items Selection Table */}
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-10 text-center text-xs">Pick</TableHead>
                      <TableHead className="text-xs">Product Name</TableHead>
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-xs text-right">Cost ({currencySymbol})</TableHead>
                      <TableHead className="text-xs text-right">Selling Price ({currencySymbol})</TableHead>
                      <TableHead className="text-xs text-right">Default Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeIndustry.items.map((item, idx) => {
                      const isChecked = selectedTemplateItems[idx] !== false;
                      return (
                        <TableRow 
                          key={idx} 
                          onClick={() => handleToggleTemplateItem(idx)}
                          className={`cursor-pointer text-xs transition-colors ${isChecked ? 'bg-primary/5' : 'opacity-50'}`}
                        >
                          <TableCell className="text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleTemplateItem(idx)}
                              className="rounded border-primary text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                          <TableCell><Badge variant="secondary" className="text-[10px]">{item.category}</Badge></TableCell>
                          <TableCell className="text-right text-muted-foreground">{currencySymbol}{item.costPrice}</TableCell>
                          <TableCell className="text-right font-bold text-foreground">{currencySymbol}{item.sellingPrice}</TableCell>
                          <TableCell className="text-right font-semibold">{item.stock} {item.unit}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  Ready to add to <span className="font-semibold text-foreground">{activeIndustry.name}</span>
                </p>
                <Button onClick={handleImportIndustryItems} className="gap-2 text-xs font-semibold h-9 shadow-md">
                  <CheckCircle2 className="w-4 h-4" /> Import Selected Items to Catalog
                </Button>
              </div>
            </TabsContent>

            {/* ─── TAB 3: AI VOICE / NATURAL LANGUAGE PROMPT ─── */}
            <TabsContent value="voice" className="mt-0 space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Speak or Type Product Note
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant={isListening ? 'destructive' : 'outline'}
                      className="text-xs h-7 gap-1.5"
                      onClick={handleSimulateVoice}
                    >
                      <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-pulse' : ''}`} />
                      {isListening ? 'Recording Audio...' : 'Use Voice Mic'}
                    </Button>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="e.g. Add 50 spiral notebooks at ₹80 sell, ₹55 cost, and 30 boxes of Cello gripper pens at ₹120 sell"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                {/* Quick Prompts */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Click an example to test:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {samplePrompts.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setAiPrompt(p); setParsedAiItems(parseNaturalLanguageListing(p, taxRatePercent)); }}
                        className="text-[11px] p-2 rounded-lg border bg-card hover:bg-accent/60 text-left transition-colors"
                      >
                        💡 {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button size="sm" onClick={handleParseAiPrompt} className="text-xs h-8 gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Parse Items with AI
                  </Button>
                </div>

                {/* Parsed Items Preview */}
                {parsedAiItems.length > 0 && (
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        AI Recognized Items ({parsedAiItems.length})
                      </span>
                      <Button size="sm" onClick={handleImportParsedAiItems} className="text-xs h-8 gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Import These Items
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {parsedAiItems.map(item => (
                        <div key={item.id} className="p-3 rounded-xl border bg-card/60 flex items-start justify-between text-xs">
                          <div>
                            <p className="font-semibold text-foreground">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">Category: {item.category} • SKU: {item.sku}</p>
                            <p className="text-[11px] font-medium text-emerald-600 mt-1">
                              Stock: {item.stock} {item.unit} • Sell: {currencySymbol}{item.sellingPrice} (Cost: {currencySymbol}{item.costPrice})
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[9px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                            {item.confidence}% Match
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ─── TAB 4: BULK EXCEL / COPY-PASTE SPREADSHEET ─── */}
            <TabsContent value="spreadsheet" className="mt-0 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-xs">Copy-Paste from Excel, Tally or WhatsApp</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Paste tab-separated rows into the box or edit the live spreadsheet below.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={handleAddGridRow}>
                    <Plus className="w-3 h-3" /> Add Row
                  </Button>
                </div>

                <textarea
                  rows={2}
                  placeholder="Paste copied table rows from Excel (Ctrl + V) here..."
                  onPaste={handlePasteSpreadsheet}
                  className="w-full p-2.5 text-xs rounded-lg border bg-muted/20 font-mono resize-none focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Editable Grid Table */}
              <div className="border rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs">Product Name *</TableHead>
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-xs text-right">Cost ({currencySymbol})</TableHead>
                      <TableHead className="text-xs text-right">Price ({currencySymbol}) *</TableHead>
                      <TableHead className="text-xs text-right">Stock</TableHead>
                      <TableHead className="text-xs w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gridRows.map((row, idx) => (
                      <TableRow key={idx} className="text-xs">
                        <TableCell>
                          <input
                            placeholder="e.g. Spiral Notebook"
                            value={row.name}
                            onChange={e => {
                              const updated = [...gridRows];
                              updated[idx].name = e.target.value;
                              setGridRows(updated);
                            }}
                            className="w-full h-7 px-2 text-xs rounded-md border bg-background"
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            placeholder="Category"
                            value={row.category}
                            onChange={e => {
                              const updated = [...gridRows];
                              updated[idx].category = e.target.value;
                              setGridRows(updated);
                            }}
                            className="w-24 h-7 px-2 text-xs rounded-md border bg-background"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <input
                            type="number"
                            value={row.cost}
                            onChange={e => {
                              const updated = [...gridRows];
                              updated[idx].cost = e.target.value;
                              setGridRows(updated);
                            }}
                            className="w-20 h-7 px-2 text-xs rounded-md border bg-background text-right"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <input
                            type="number"
                            value={row.price}
                            onChange={e => {
                              const updated = [...gridRows];
                              updated[idx].price = e.target.value;
                              setGridRows(updated);
                            }}
                            className="w-20 h-7 px-2 text-xs rounded-md border bg-background text-right font-bold"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <input
                            type="number"
                            value={row.stock}
                            onChange={e => {
                              const updated = [...gridRows];
                              updated[idx].stock = e.target.value;
                              setGridRows(updated);
                            }}
                            className="w-16 h-7 px-2 text-xs rounded-md border bg-background text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive"
                            onClick={() => setGridRows(prev => prev.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-xs text-muted-foreground">
                  {gridRows.filter(r => r.name.trim()).length} valid items ready
                </span>
                <Button size="sm" onClick={handleImportGridRows} className="gap-2 text-xs font-semibold h-9">
                  <CheckCircle2 className="w-4 h-4" /> Import Spreadsheet Rows
                </Button>
              </div>
            </TabsContent>

            {/* ─── TAB 5: BARCODE & QR SCANNER ─── */}
            <TabsContent value="barcode" className="mt-0 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Scanner Viewfinder */}
                <div className="p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-muted/10 relative overflow-hidden">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                    <ScanLine className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs">Ready to Scan Barcode</p>
                    <p className="text-[10px] text-muted-foreground">Point camera or scan with handheld USB reader</p>
                  </div>

                  {/* Manual Barcode Input */}
                  <div className="w-full max-w-xs space-y-1.5 pt-2">
                    <Label className="text-[11px] font-medium">Or Enter Barcode Number:</Label>
                    <div className="flex gap-1.5">
                      <Input
                        placeholder="e.g. 8901030382901"
                        value={barcodeInput}
                        onChange={e => setBarcodeInput(e.target.value)}
                        className="text-xs h-8 font-mono"
                      />
                      <Button size="sm" className="text-xs h-8" onClick={() => handleLookupBarcode(barcodeInput)}>
                        Lookup
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Sample Barcode Buttons & Found Product */}
                <div className="space-y-3">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Test with Sample Retail Barcodes:
                  </span>
                  <div className="space-y-1.5">
                    {Object.entries(BARCODE_LOOKUP_DATABASE).map(([code, item]) => (
                      <div
                        key={code}
                        onClick={() => handleLookupBarcode(code)}
                        className="p-2.5 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">Barcode: {code}</p>
                        </div>
                        <span className="text-primary text-xs font-semibold">{currencySymbol}{item.sellingPrice} →</span>
                      </div>
                    ))}
                  </div>

                  {/* Scanned Card */}
                  {barcodeFoundProduct && (
                    <div className="p-3.5 rounded-xl border-2 border-primary/30 bg-primary/5 space-y-3 animate-in fade-in">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-xs">{barcodeFoundProduct.name}</p>
                          <p className="text-[10px] text-muted-foreground">Category: {barcodeFoundProduct.category}</p>
                        </div>
                        <Badge variant="default" className="text-[10px]">
                          {currencySymbol}{barcodeFoundProduct.sellingPrice}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium shrink-0">Quantity to Add:</Label>
                        <Input
                          type="number"
                          value={barcodeStock}
                          onChange={e => setBarcodeStock(e.target.value)}
                          className="text-xs h-8 w-24"
                        />
                        <Button size="sm" className="text-xs h-8 ml-auto gap-1" onClick={handleImportBarcodeProduct}>
                          <Plus className="w-3.5 h-3.5" /> Add to Catalog
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
