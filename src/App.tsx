import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Upload,
  Search,
  CheckCircle2,
  X,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Filter,
  FileImage,
  AlertCircle,
  Pill,
  ChevronRight,
  Clock,
  ExternalLink,
  Info
} from "lucide-react";
import { Header } from "./components/Header.js";
import { DisclaimerBanner } from "./components/DisclaimerBanner.js";
import { ComparisonModal } from "./components/ComparisonModal.js";
import { AboutModal } from "./components/AboutModal.js";
import { Medicine, ExtractedAnalysis, ScanHistoryItem } from "./types.js";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"finder" | "history" | "about">("finder");

  // App Data State
  const [catalog, setCatalog] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedAnalysis | null>(null);
  const [alternatives, setAlternatives] = useState<Medicine[]>([]);
  const [allOriginals, setAllOriginals] = useState<Medicine[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"savings" | "price">("savings");
  const [formFilter, setFormFilter] = useState<string>("All");

  // Image Upload State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [lastScannedImage, setLastScannedImage] = useState<{ base64: string; mimeType: string; fileName: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const [hasAiKey, setHasAiKey] = useState(true);

  // Search & Input UI State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modals & History
  const [comparingAlternative, setComparingAlternative] = useState<Medicine | null>(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initial load: Fetch health and catalog
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Check health & Gemini key status
      const healthRes = await fetch("/api/health");
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHasAiKey(healthData.hasGeminiKey);
      }

      // Fetch all medicines
      const catRes = await fetch("/api/medicines");
      if (catRes.ok) {
        const catData = await catRes.json();
        setCatalog(catData.data || []);
        
        // Find brands that have alternatives to showcase on initial load
        const brands = (catData.data || []).filter((m: Medicine) => !m.isGeneric);
        setAllOriginals(brands);

        // Default to Augmentin 625 Duo (from the High Density theme design)
        const defaultMed = (catData.data || []).find((m: Medicine) => m.id === "med_aug_625") || brands[0];
        if (defaultMed) {
          loadMedicineAlternatives(defaultMed);
        }
      }
    } catch (err) {
      console.warn("Could not connect to API server, using fallback catalog", err);
    }
  };

  // Load alternatives for a specific medicine
  const loadMedicineAlternatives = async (med: Medicine, customExtracted?: ExtractedAnalysis) => {
    setSelectedMedicine(med);
    setScanError(null);

    if (customExtracted) {
      setExtractedInfo(customExtracted);
    } else {
      setExtractedInfo({
        medicineName: med.brandName,
        activeIngredient: med.activeIngredients.map(i => `${i.name} (${i.strength})`).join(" + "),
        strength: med.strength,
        dosageForm: med.dosageForm,
        confidence: "high",
        notes: "Catalog reference match"
      });
    }

    try {
      const res = await fetch(`/api/medicines/${med.id}/alternatives`);
      if (res.ok) {
        const data = await res.json();
        setAlternatives(data.alternatives || []);

        // Add to scan history
        const maxSav = (data.alternatives || []).reduce(
          (max: number, a: Medicine) => Math.max(max, a.savingsPercent || 0),
          0
        );
        addHistoryItem(med.brandName, med.activeIngredients.map(i => i.name).join(" + "), data.alternatives.length, maxSav);
      }
    } catch (err) {
      console.error("Failed to load alternatives:", err);
    }
  };

  const addHistoryItem = (medicineName: string, activeIngredient: string, alternativesCount: number, maxSavingsPercent: number) => {
    const newItem: ScanHistoryItem = {
      id: "hist_" + Date.now(),
      timestamp: Date.now(),
      medicineName,
      activeIngredient,
      alternativesCount,
      maxSavingsPercent
    };
    setScanHistory(prev => [newItem, ...prev.filter(p => p.medicineName !== medicineName)].slice(0, 10));
  };

  // Handle image upload & base64 conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setScanError("Please select a valid image file (JPG, PNG, WebP)");
      return;
    }

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      setLastScannedImage({ base64, mimeType: file.type, fileName: file.name });
      processImageIdentification(base64, file.type, file.name);
    };
    reader.readAsDataURL(file);

    // Reset input value so re-uploading the same file always works
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag and Drop handlers for file upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setScanError("Please drop a valid image file (JPG, PNG, WebP).");
      return;
    }

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      setLastScannedImage({ base64, mimeType: file.type, fileName: file.name });
      processImageIdentification(base64, file.type, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Dedicated manual medicine search handler (triggered by Search button or Enter)
  const handleManualSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setScanError("Please enter a medicine or salt name in the search box.");
      searchInputRef.current?.focus();
      return;
    }

    setScanError(null);
    setIsDropdownOpen(false);

    // Check local catalog matches first
    if (searchResults.length > 0) {
      const exactMatch = searchResults.find(
        m => m.brandName.toLowerCase() === query.toLowerCase() ||
             m.genericName.toLowerCase() === query.toLowerCase() ||
             m.activeIngredients.some(i => i.name.toLowerCase() === query.toLowerCase())
      ) || searchResults[0];

      loadMedicineAlternatives(exactMatch);
      setScanNotice(`Found and loaded alternatives for "${exactMatch.brandName}" (${exactMatch.genericName}).`);
      return;
    }

    // Query backend catalog API if not in immediate slice
    setIsSearching(true);
    try {
      const res = await fetch(`/api/medicines?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          const top = data.data[0];
          loadMedicineAlternatives(top);
          setScanNotice(`Found and loaded alternatives for "${top.brandName}" (${top.genericName}).`);
        } else {
          setScanError(`No medicine found matching "${query}". Try popular medicines like Augmentin, Crocin, Dolo, Lipitor, Pantocid, or Azithral.`);
        }
      } else {
        setScanError(`No medicine found matching "${query}".`);
      }
    } catch {
      setScanError("Network error while searching medicines. Please check your connection.");
    } finally {
      setIsSearching(false);
    }
  };

  // Send image to backend for AI identification
  const processImageIdentification = async (base64Image: string, mimeType: string, fileName?: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanNotice(null);

    const activeFileName = fileName || imageFileName;
    if (!lastScannedImage || lastScannedImage.base64 !== base64Image) {
      setLastScannedImage({ base64: base64Image, mimeType, fileName: activeFileName });
    }

    try {
      const res = await fetch("/api/identify-medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType,
          fileName: activeFileName
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setScanError(data.error || "Unable to clearly identify medicine from image. Try manual search below or use a preset demo.");
        setIsScanning(false);
        return;
      }

      if (data.warning || data.notice) {
        setScanNotice(data.warning || data.notice);
      }

      if (data.matchedMedicine) {
        loadMedicineAlternatives(data.matchedMedicine, data.extracted);
      } else {
        setExtractedInfo(data.extracted);
        setAlternatives(data.alternatives || []);
        setSelectedMedicine({
          id: "custom_scanned",
          brandName: data.extracted.medicineName || "Scanned Medicine",
          genericName: data.extracted.activeIngredient,
          activeIngredients: [{ name: data.extracted.activeIngredient, strength: data.extracted.strength }],
          dosageForm: (data.extracted.dosageForm as any) || "Tablet",
          strength: data.extracted.strength || "Standard",
          manufacturer: "Identified via OCR",
          price: 150.00,
          packageSize: "Standard Pack",
          isGeneric: false,
          prescriptionRequired: true,
          category: "Identified"
        });
      }
    } catch (err: any) {
      setScanError("Network error while connecting to scanner. Please try again or use the sample presets.");
    } finally {
      setIsScanning(false);
    }
  };

  // Preset sample testing (allows instant testing in college presentations)
  const handlePresetSelect = async (presetId: string) => {
    setIsScanning(true);
    setScanError(null);
    try {
      const res = await fetch("/api/identify-medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoKey: presetId })
      });
      const data = await res.json();
      if (data.success && data.matchedMedicine) {
        setUploadedImage(null);
        setImageFileName("");
        loadMedicineAlternatives(data.matchedMedicine, data.extracted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  // Manual search filter
  const searchResults = searchQuery.trim()
    ? catalog.filter(m =>
        m.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.activeIngredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  // Filter & sort alternatives
  const displayedAlternatives = alternatives
    .filter(alt => formFilter === "All" || alt.dosageForm === formFilter)
    .sort((a, b) => {
      if (sortBy === "savings") {
        return (b.savingsPercent || 0) - (a.savingsPercent || 0);
      }
      return a.price - b.price;
    });

  return (
    <div className="bg-slate-50 text-slate-900 font-sans h-screen w-full flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === "about") {
            setShowAboutModal(true);
          } else {
            setActiveTab(tab);
          }
        }}
        hasAiKey={hasAiKey}
      />

      {/* Main Content Layout (High Density 4-col Sidebar + 8-col Main) */}
      <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 overflow-hidden max-w-7xl mx-auto w-full">
        {activeTab === "history" ? (
          /* History View */
          <div className="col-span-12 bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4 overflow-hidden shadow-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Scans & Searches
                </h2>
                <p className="text-xs text-slate-500">
                  Quickly recall previously analyzed medicines from this session.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("finder")}
                className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 cursor-pointer"
              >
                Return to Finder
              </button>
            </div>

            {scanHistory.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                <FileImage className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                No medicines scanned yet in this session. Return to the Finder to upload or search.
              </div>
            ) : (
              <div className="overflow-y-auto divide-y divide-slate-100">
                {scanHistory.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 px-2 flex justify-between items-center hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => {
                      const matched = catalog.find(m =>
                        m.brandName.toLowerCase() === item.medicineName.toLowerCase() ||
                        m.brandName.toLowerCase().includes(item.medicineName.toLowerCase()) ||
                        item.medicineName.toLowerCase().includes(m.brandName.toLowerCase())
                      );
                      if (matched) {
                        loadMedicineAlternatives(matched);
                        setActiveTab("finder");
                      }
                    }}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.medicineName}</h4>
                      <p className="text-xs text-slate-500">Active: {item.activeIngredient}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                        Up to {item.maxSavingsPercent}% Savings
                      </span>
                      <span className="text-xs text-slate-400">
                        {item.alternativesCount} alternatives
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Finder View (Sidebar + Alternatives Grid) */
          <>
            {/* Left Column (Input Method + Last Scanned Result) */}
            <aside className="col-span-12 md:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
              {/* SECTION 1: Input Method */}
              <section className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <span>Input Method</span>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold lowercase">
                    photo or search
                  </span>
                </h2>

                <div className="flex flex-col gap-3">
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {uploadedImage ? (
                    /* Image preview state with dedicated scan & search action button */
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-900 flex flex-col">
                      <div className="relative">
                        <img
                          src={uploadedImage}
                          alt="Uploaded medicine"
                          className="w-full h-32 object-contain bg-slate-900/90"
                        />
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedImage(null);
                              setImageFileName("");
                            }}
                            title="Remove photo"
                            className="p-1 bg-red-600/90 hover:bg-red-700 text-white rounded text-xs transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="absolute bottom-1.5 left-2 text-[10px] text-white/90 truncate max-w-[85%] bg-slate-950/70 px-1.5 py-0.5 rounded">
                          {imageFileName || "Scanned medicine photo"}
                        </div>
                      </div>

                      {/* Explicit Action Row for Uploaded Photo */}
                      <div className="p-2 bg-slate-800 border-t border-slate-700 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          id="scan-uploaded-photo-btn"
                          onClick={() => processImageIdentification(uploadedImage, lastScannedImage?.mimeType || "image/jpeg", imageFileName)}
                          disabled={isScanning}
                          className="flex-1 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {isScanning ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Scanning Photo...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Scan & Find Alternatives</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isScanning}
                          className="py-1.5 px-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium transition-colors cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Drag & Drop Photo Upload Zone */
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center justify-center gap-2.5 p-4 sm:p-5 rounded-lg border-2 border-dashed transition-all cursor-pointer group ${
                        isDragging
                          ? "bg-blue-100/80 border-blue-500 scale-[1.01]"
                          : "bg-blue-50/70 border-blue-200 text-blue-700 hover:bg-blue-100/70 hover:border-blue-400"
                      }`}
                    >
                      {isScanning ? (
                        <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                          <Camera className="h-4 w-4 stroke-[2.2]" />
                        </div>
                      )}
                      <div className="text-left">
                        <span className="font-semibold text-sm block text-blue-900">
                          {isScanning ? "Scanning Label with Gemini..." : "Upload Medicine Photo"}
                        </span>
                        <span className="text-[11px] text-blue-600/80 font-normal">
                          Click to browse or drag & drop packaging image
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Manual Search with Explicit Search Button */}
                  <div ref={searchContainerRef} className="relative mt-1">
                    <label htmlFor="medicine-search-input" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Or Search By Brand / Active Salt:
                    </label>
                    <form onSubmit={handleManualSearchSubmit} className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          id="medicine-search-input"
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsDropdownOpen(true);
                          }}
                          onFocus={() => {
                            if (searchQuery.trim()) setIsDropdownOpen(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setIsDropdownOpen(false);
                            }
                          }}
                          className="block w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs focus:bg-white transition-colors"
                          placeholder="Type brand name (e.g. Augmentin, Dolo, Crocin)"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery("");
                              setIsDropdownOpen(false);
                            }}
                            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Clear search input"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Explicit Search Button in Upload/Input Section */}
                      <button
                        id="medicine-search-button"
                        type="submit"
                        disabled={isSearching}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer disabled:opacity-50"
                        title="Search for medicine and generic alternatives"
                      >
                        {isSearching ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Search className="w-3.5 h-3.5" />
                        )}
                        <span>Search</span>
                      </button>
                    </form>

                    {/* Autocomplete Dropdown */}
                    {isDropdownOpen && searchQuery.trim() && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {searchResults.slice(0, 6).map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              loadMedicineAlternatives(m);
                              setSearchQuery(m.brandName);
                              setIsDropdownOpen(false);
                              setScanNotice(`Found and loaded alternatives for ${m.brandName} (${m.genericName}).`);
                            }}
                            className="p-2.5 hover:bg-blue-50 cursor-pointer transition-colors text-xs flex justify-between items-center"
                          >
                            <div>
                              <div className="font-bold text-slate-900">{m.brandName}</div>
                              <div className="text-[11px] text-slate-500">
                                {m.activeIngredients.map(i => `${i.name} ${i.strength}`).join(" + ")}
                              </div>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {m.dosageForm}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Demo Preset Pills for Viva Presentation */}
                  <div className="pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                      Or Try Preset Demo Packaging:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: "med_aug_625", label: "Augmentin 625" },
                        { id: "med_crocin_650", label: "Crocin 650" },
                        { id: "med_lipitor_20", label: "Lipitor 20mg" },
                        { id: "med_pantocid_40", label: "Pantocid 40" },
                        { id: "med_glucophage_500", label: "Glucophage" }
                      ].map(pill => (
                        <button
                          key={pill.id}
                          onClick={() => handlePresetSelect(pill.id)}
                          className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors cursor-pointer ${
                            selectedMedicine?.id === pill.id
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                          }`}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Informational scan notice / fallback notice */}
                  {scanNotice && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold block">Scan Status:</span>
                        {scanNotice}
                      </div>
                    </div>
                  )}

                  {/* Scan error warning with 1-click retry */}
                  {scanError && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-semibold block text-amber-950">Recognition Notice:</span>
                          <span className="text-amber-800 leading-relaxed block">{scanError}</span>
                        </div>
                      </div>
                      {lastScannedImage && (
                        <div className="pt-1.5 border-t border-amber-200/80 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => processImageIdentification(lastScannedImage.base64, lastScannedImage.mimeType, lastScannedImage.fileName)}
                            disabled={isScanning}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${isScanning ? "animate-spin" : ""}`} />
                            {isScanning ? "Retrying..." : "Retry AI Scan"}
                          </button>
                          <span className="text-[10px] text-amber-700">or click a preset below</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 2: Last Scanned / Selected Result Card */}
              <section className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                    <span>Reference Medicine</span>
                    <span className="text-[10px] text-slate-500 font-medium">Original</span>
                  </h2>

                  {selectedMedicine ? (
                    <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900 text-sm">
                          {selectedMedicine.brandName}
                        </h3>
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider">
                          AI CONFIRMED
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1.5">
                        <p className="flex justify-between">
                          <span className="font-medium text-slate-500">Active:</span>
                          <span className="font-semibold text-slate-800 text-right truncate max-w-[65%]">
                            {selectedMedicine.activeIngredients.map(i => i.name).join(" + ")}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium text-slate-500">Strength:</span>
                          <span className="font-semibold text-slate-800">
                            {selectedMedicine.strength}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium text-slate-500">Dosage:</span>
                          <span className="font-semibold text-slate-800">
                            {selectedMedicine.dosageForm}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium text-slate-500">Maker:</span>
                          <span className="font-semibold text-slate-700 text-right truncate max-w-[65%]">
                            {selectedMedicine.manufacturer.replace(" (Demo)", "")}
                          </span>
                        </p>

                        <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                          <span className="text-[11px] text-slate-500">Ref. MRP in India (INR):</span>
                          <span className="text-blue-600 font-bold text-sm">
                            ₹{selectedMedicine.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      No medicine selected yet. Upload an image or select a preset above.
                    </div>
                  )}
                </div>

                {/* Quick educational tip */}
                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Generics match active chemical salt, strength, and delivery format.</span>
                </div>
              </section>
            </aside>

            {/* Right Column (Generic Alternatives Grid) */}
            <div className="col-span-12 md:col-span-8 flex flex-col gap-3.5 overflow-hidden">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-800">
                    Recommended Generic Alternatives
                  </h2>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full">
                    {displayedAlternatives.length} {displayedAlternatives.length === 1 ? "Match" : "Matches"} Found
                  </span>
                </div>

                {/* Sort and Filters */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[11px]">
                    <button
                      onClick={() => setSortBy("savings")}
                      className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                        sortBy === "savings"
                          ? "bg-blue-600 text-white font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Top Savings
                    </button>
                    <button
                      onClick={() => setSortBy("price")}
                      className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                        sortBy === "price"
                          ? "bg-blue-600 text-white font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Lowest Price
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid of Generic Alternatives (matching High Density theme) */}
              {displayedAlternatives.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-y-auto pb-4 pr-1">
                  {displayedAlternatives.map((alt) => {
                    const savings = alt.savingsPercent || 0;
                    return (
                      <div
                        key={alt.id}
                        className="bg-white border border-slate-200 rounded-xl p-4 sm:p-4.5 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
                      >
                        <div>
                          {/* Card Top Row: Emerald Icon + Price & Savings */}
                          <div className="flex justify-between items-start mb-2.5">
                            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                              <CheckCircle2 className="h-5 w-5 stroke-[2.2]" />
                            </div>
                            <div className="text-right">
                              <div className="text-emerald-600 font-bold text-base sm:text-lg leading-tight">
                                ₹{alt.price.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 inline-block mt-0.5">
                                Save {savings}%
                              </div>
                            </div>
                          </div>

                          {/* Medicine Name & Manufacturer */}
                          <h3 className="font-bold text-slate-900 text-sm mb-0.5 line-clamp-1">
                            {alt.brandName}
                          </h3>
                          <p className="text-[11px] text-slate-500 mb-3 truncate">
                            Manufacturer: {alt.manufacturer.replace(" (Demo)", "")}
                          </p>

                          {/* Compact Specs Grid */}
                          <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                            <div className="text-slate-500">Active</div>
                            <div className="text-slate-800 font-medium text-right truncate">
                              {alt.activeIngredients.map(i => i.name).join(" + ")}
                            </div>
                            <div className="text-slate-500">Strength</div>
                            <div className="text-slate-800 font-medium text-right">
                              {alt.strength}
                            </div>
                            <div className="text-slate-500">Package</div>
                            <div className="text-slate-800 font-medium text-right truncate">
                              {alt.packageSize}
                            </div>
                          </div>
                        </div>

                        {/* Action: Compare details */}
                        <button
                          onClick={() => setComparingAlternative(alt)}
                          className="w-full mt-3.5 py-2 text-xs font-bold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all uppercase tracking-wider cursor-pointer"
                        >
                          Compare details
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty state */
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center flex-1 flex flex-col items-center justify-center">
                  <Pill className="w-10 h-10 text-slate-300 mb-3" />
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    No Direct Generic Substitutions Found
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mb-4">
                    Try choosing another preset brand medicine like Augmentin, Crocin, Lipitor, or Pantocid from the sidebar.
                  </p>
                  <button
                    onClick={() => {
                      const aug = catalog.find(m => m.id === "med_aug_625");
                      if (aug) loadMedicineAlternatives(aug);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Load Sample Generic Alternatives
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* High Density Amber Disclaimer Footer */}
      <DisclaimerBanner />

      {/* Side-by-Side Equivalence Modal */}
      {comparingAlternative && (
        <ComparisonModal
          original={selectedMedicine}
          alternative={comparingAlternative}
          onClose={() => setComparingAlternative(null)}
        />
      )}

      {/* College Viva Notes Modal */}
      {showAboutModal && (
        <AboutModal onClose={() => setShowAboutModal(false)} />
      )}
    </div>
  );
}
