export interface ActiveIngredient {
  name: string;
  strength: string;
}

export interface Medicine {
  id: string;
  brandName: string;
  genericName: string;
  activeIngredients: ActiveIngredient[];
  dosageForm: "Tablet" | "Capsule" | "Syrup" | "Suspension" | "Ointment" | "Injection";
  strength: string;
  manufacturer: string;
  price: number;
  packageSize: string;
  isGeneric: boolean;
  prescriptionRequired: boolean;
  category: string;
  description?: string;
}

export interface IdentificationResponse {
  medicineName: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  confidence: "high" | "medium" | "low";
  notes?: string;
  matchedMedicine?: Medicine | null;
  alternatives: Array<Medicine & { savingsPercent: number; savingsAmount: number }>;
}

export const SAMPLE_MEDICINES: Medicine[] = [
  // --- Amoxicillin + Clavulanic Acid (Antibiotic) ---
  {
    id: "med_aug_625",
    brandName: "Augmentin 625 Duo",
    genericName: "Amoxicillin and Potassium Clavulanate Tablets IP",
    activeIngredients: [
      { name: "Amoxicillin", strength: "500mg" },
      { name: "Clavulanic Acid", strength: "125mg" }
    ],
    dosageForm: "Tablet",
    strength: "500mg + 125mg",
    manufacturer: "GlaxoSmithKline Pharmaceuticals India (Demo)",
    price: 201.20,
    packageSize: "10 Tablets / Strip",
    isGeneric: false,
    prescriptionRequired: true,
    category: "Antibiotics",
    description: "Well-known branded penicillin antibiotic with clavulanate for resistant bacterial infections."
  },
  {
    id: "med_amox_gen",
    brandName: "Amoxyclav Generic",
    genericName: "Amoxicillin and Potassium Clavulanate Tablets IP",
    activeIngredients: [
      { name: "Amoxicillin", strength: "500mg" },
      { name: "Clavulanic Acid", strength: "125mg" }
    ],
    dosageForm: "Tablet",
    strength: "500mg + 125mg",
    manufacturer: "Cipla Generic Division (Demo)",
    price: 58.00,
    packageSize: "10 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: true,
    category: "Antibiotics",
    description: "Affordable unbranded generic formulation delivering over 70% savings compared to brand leader."
  },
  {
    id: "med_clavam_625",
    brandName: "Clavam 625",
    genericName: "Amoxicillin and Potassium Clavulanate Tablets IP",
    activeIngredients: [
      { name: "Amoxicillin", strength: "500mg" },
      { name: "Clavulanic Acid", strength: "125mg" }
    ],
    dosageForm: "Tablet",
    strength: "500mg + 125mg",
    manufacturer: "Alkem Laboratories (Demo)",
    price: 152.00,
    packageSize: "10 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: true,
    category: "Antibiotics",
    description: "Popular Indian branded generic formulation of Amoxicillin and Clavulanate."
  },
  {
    id: "med_moxikind_cv",
    brandName: "Moxikind-CV 625",
    genericName: "Amoxicillin and Potassium Clavulanate Tablets IP",
    activeIngredients: [
      { name: "Amoxicillin", strength: "500mg" },
      { name: "Clavulanic Acid", strength: "125mg" }
    ],
    dosageForm: "Tablet",
    strength: "500mg + 125mg",
    manufacturer: "Mankind Pharma (Demo)",
    price: 134.50,
    packageSize: "10 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: true,
    category: "Antibiotics",
    description: "Widely accessible generic antibacterial alternative equivalent to Augmentin."
  },

  // --- Paracetamol / Acetaminophen (Analgesic & Antipyretic) ---
  {
    id: "med_crocin_650",
    brandName: "Crocin 650",
    genericName: "Paracetamol Fast Release Tablets IP",
    activeIngredients: [
      { name: "Paracetamol", strength: "650mg" }
    ],
    dosageForm: "Tablet",
    strength: "650mg",
    manufacturer: "Haleon / GSK India (Demo)",
    price: 33.60,
    packageSize: "15 Tablets / Strip",
    isGeneric: false,
    prescriptionRequired: false,
    category: "Pain & Fever",
    description: "Household antipyretic and analgesic brand in India for fever and moderate pain relief."
  },
  {
    id: "med_dolo_650",
    brandName: "Dolo 650",
    genericName: "Paracetamol Tablets IP",
    activeIngredients: [
      { name: "Paracetamol", strength: "650mg" }
    ],
    dosageForm: "Tablet",
    strength: "650mg",
    manufacturer: "Micro Labs Ltd (Demo)",
    price: 30.90,
    packageSize: "15 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: false,
    category: "Pain & Fever",
    description: "Most widely prescribed Indian generic alternative containing 650mg of Paracetamol."
  },
  {
    id: "med_paracip_650",
    brandName: "Paracip 650 Generic",
    genericName: "Paracetamol Tablets IP",
    activeIngredients: [
      { name: "Paracetamol", strength: "650mg" }
    ],
    dosageForm: "Tablet",
    strength: "650mg",
    manufacturer: "Cipla Health (Demo)",
    price: 20.50,
    packageSize: "15 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: false,
    category: "Pain & Fever",
    description: "High-value, low-cost generic paracetamol manufactured under Indian Pharmacopoeia standards."
  },
  {
    id: "med_pcm_jan_aushadhi",
    brandName: "Jan Aushadhi Paracetamol",
    genericName: "Paracetamol Tablets IP",
    activeIngredients: [
      { name: "Paracetamol", strength: "650mg" }
    ],
    dosageForm: "Tablet",
    strength: "650mg",
    manufacturer: "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (Demo)",
    price: 9.80,
    packageSize: "15 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: false,
    category: "Pain & Fever",
    description: "Government-supported Jan Aushadhi generic providing over 70% savings."
  },

  // --- Atorvastatin (Cholesterol / Cardiovascular) ---
  {
    id: "med_lipitor_20",
    brandName: "Lipitor 20mg",
    genericName: "Atorvastatin Calcium Tablets",
    activeIngredients: [
      { name: "Atorvastatin", strength: "20mg" }
    ],
    dosageForm: "Tablet",
    strength: "20mg",
    manufacturer: "Pfizer India (Demo)",
    price: 395.00,
    packageSize: "10 Tablets / Strip",
    isGeneric: false,
    prescriptionRequired: true,
    category: "Cardiovascular",
    description: "Original innovator statin prescribed to lower LDL cholesterol and prevent cardiac risk."
  },
  {
    id: "med_atorva_20",
    brandName: "Atorva 20",
    genericName: "Atorvastatin Calcium Tablets IP",
    activeIngredients: [
      { name: "Atorvastatin", strength: "20mg" }
    ],
    dosageForm: "Tablet",
    strength: "20mg",
    manufacturer: "Zydus Lifesciences (Demo)",
    price: 155.00,
    packageSize: "10 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: true,
    category: "Cardiovascular",
    description: "Equivalent Indian generic formulation saving over 60% compared to innovator Lipitor."
  },
  {
    id: "med_atorlip_20",
    brandName: "Atorlip 20 Generic",
    genericName: "Atorvastatin Calcium Tablets IP",
    activeIngredients: [
      { name: "Atorvastatin", strength: "20mg" }
    ],
    dosageForm: "Tablet",
    strength: "20mg",
    manufacturer: "Cipla Generics (Demo)",
    price: 95.00,
    packageSize: "10 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: true,
    category: "Cardiovascular",
    description: "Substantial savings on bioequivalent HMG-CoA reductase inhibitor therapy in India."
  },

  // --- Pantoprazole (GERD / Acid Reflux) ---
  {
    id: "med_pantocid_40",
    brandName: "Pantocid 40",
    genericName: "Pantoprazole Gastro-resistant Tablets IP",
    activeIngredients: [
      { name: "Pantoprazole", strength: "40mg" }
    ],
    dosageForm: "Tablet",
    strength: "40mg",
    manufacturer: "Sun Pharma (Demo)",
    price: 168.00,
    packageSize: "15 Tablets / Strip",
    isGeneric: false,
    prescriptionRequired: true,
    category: "Gastrointestinal",
    description: "Leading branded proton pump inhibitor reducing gastric acid in GERD and peptic ulcers."
  },
  {
    id: "med_pan_40",
    brandName: "Pan 40",
    genericName: "Pantoprazole Gastro-resistant Tablets IP",
    activeIngredients: [
      { name: "Pantoprazole", strength: "40mg" }
    ],
    dosageForm: "Tablet",
    strength: "40mg",
    manufacturer: "Alkem Laboratories (Demo)",
    price: 148.50,
    packageSize: "15 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: true,
    category: "Gastrointestinal",
    description: "Widely used branded generic proton pump inhibitor with verified bioavailability."
  },
  {
    id: "med_panto_jan_40",
    brandName: "Generic Pantoprazole 40mg",
    genericName: "Pantoprazole Gastro-resistant Tablets IP",
    activeIngredients: [
      { name: "Pantoprazole", strength: "40mg" }
    ],
    dosageForm: "Tablet",
    strength: "40mg",
    manufacturer: "Jan Aushadhi Scheme (Demo)",
    price: 28.00,
    packageSize: "15 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: true,
    category: "Gastrointestinal",
    description: "Government Jan Aushadhi generic equivalent offering more than 80% price reduction."
  },

  // --- Metformin (Diabetes) ---
  {
    id: "med_glucophage_500",
    brandName: "Glucophage 500",
    genericName: "Metformin Hydrochloride Tablets",
    activeIngredients: [
      { name: "Metformin", strength: "500mg" }
    ],
    dosageForm: "Tablet",
    strength: "500mg",
    manufacturer: "Merck Healthcare India (Demo)",
    price: 76.00,
    packageSize: "20 Tablets / Strip",
    isGeneric: false,
    prescriptionRequired: true,
    category: "Diabetes",
    description: "Innovator biguanide antidiabetic medicine for blood glucose management in Type 2 diabetes."
  },
  {
    id: "med_glycomet_500",
    brandName: "Glycomet 500",
    genericName: "Metformin Hydrochloride Tablets IP",
    activeIngredients: [
      { name: "Metformin", strength: "500mg" }
    ],
    dosageForm: "Tablet",
    strength: "500mg",
    manufacturer: "USV Private Limited (Demo)",
    price: 35.50,
    packageSize: "20 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: true,
    category: "Diabetes",
    description: "Widely trusted Indian generic Metformin formulation equivalent to Glucophage."
  },
  {
    id: "med_metformin_pure_500",
    brandName: "Metformin Generic 500mg",
    genericName: "Metformin Hydrochloride Tablets IP",
    activeIngredients: [
      { name: "Metformin", strength: "500mg" }
    ],
    dosageForm: "Tablet",
    strength: "500mg",
    manufacturer: "Torrent Pharma Generics (Demo)",
    price: 14.20,
    packageSize: "20 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: true,
    category: "Diabetes",
    description: "High-value generic alternative for long-term glycemic maintenance with >80% savings."
  },

  // --- Cetirizine (Allergy) ---
  {
    id: "med_zyrtec_10",
    brandName: "Zyrtec 10mg",
    genericName: "Cetirizine Hydrochloride Tablets",
    activeIngredients: [
      { name: "Cetirizine", strength: "10mg" }
    ],
    dosageForm: "Tablet",
    strength: "10mg",
    manufacturer: "Johnson & Johnson / GSK (Demo)",
    price: 62.00,
    packageSize: "10 Tablets / Strip",
    isGeneric: false,
    prescriptionRequired: false,
    category: "Allergy",
    description: "Branded second-generation antihistamine relieving allergic rhinitis, sneezing, and hives."
  },
  {
    id: "med_cetzine_10",
    brandName: "Cetzine 10",
    genericName: "Cetirizine Hydrochloride Tablets IP",
    activeIngredients: [
      { name: "Cetirizine", strength: "10mg" }
    ],
    dosageForm: "Tablet",
    strength: "10mg",
    manufacturer: "Dr. Reddy's Laboratories (Demo)",
    price: 23.50,
    packageSize: "10 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: false,
    category: "Allergy",
    description: "Proven Indian generic alternative matching 10mg Cetirizine active ingredient."
  },
  {
    id: "med_okacet_10",
    brandName: "Okacet 10 Generic",
    genericName: "Cetirizine Hydrochloride Tablets IP",
    activeIngredients: [
      { name: "Cetirizine", strength: "10mg" }
    ],
    dosageForm: "Tablet",
    strength: "10mg",
    manufacturer: "Cipla Health (Demo)",
    price: 18.00,
    packageSize: "10 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: false,
    category: "Allergy",
    description: "Economical daily antihistamine in India providing approximately 70% cost savings."
  },

  // --- Azithromycin (Antibiotic) ---
  {
    id: "med_zithromax_500",
    brandName: "Zithromax 500mg",
    genericName: "Azithromycin Tablets USP",
    activeIngredients: [
      { name: "Azithromycin", strength: "500mg" }
    ],
    dosageForm: "Tablet",
    strength: "500mg",
    manufacturer: "Pfizer India (Demo)",
    price: 132.00,
    packageSize: "3 Tablets / Strip",
    isGeneric: false,
    prescriptionRequired: true,
    category: "Antibiotics",
    description: "Innovator macrolide antibiotic used for respiratory, skin, and ear infections."
  },
  {
    id: "med_azithral_500",
    brandName: "Azithral 500",
    genericName: "Azithromycin Tablets IP",
    activeIngredients: [
      { name: "Azithromycin", strength: "500mg" }
    ],
    dosageForm: "Tablet",
    strength: "500mg",
    manufacturer: "Alembic Pharmaceuticals (Demo)",
    price: 119.50,
    packageSize: "3 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: true,
    category: "Antibiotics",
    description: "Widely prescribed Indian brand generic formulation of 500mg Azithromycin."
  },
  {
    id: "med_aziwok_500",
    brandName: "Aziwok 500 Generic",
    genericName: "Azithromycin Tablets IP",
    activeIngredients: [
      { name: "Azithromycin", strength: "500mg" }
    ],
    dosageForm: "Tablet",
    strength: "500mg",
    manufacturer: "Wockhardt Generics (Demo)",
    price: 74.00,
    packageSize: "3 Tablets / Strip",
    isGeneric: true,
    prescriptionRequired: true,
    category: "Antibiotics",
    description: "Quality generic macrolide delivering significant savings over brand leader in India."
  }
];

// Helper: Normalize strings for fuzzy matching
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Find medicine by ID
export function findMedicineById(id: string): Medicine | undefined {
  return SAMPLE_MEDICINES.find(m => m.id === id);
}

// Search medicines by keyword
export function searchMedicines(query: string): Medicine[] {
  if (!query || !query.trim()) {
    return SAMPLE_MEDICINES.slice(0, 10);
  }
  const clean = query.toLowerCase().trim();
  return SAMPLE_MEDICINES.filter(m => {
    const inBrand = m.brandName.toLowerCase().includes(clean);
    const inGeneric = m.genericName.toLowerCase().includes(clean);
    const inIngredients = m.activeIngredients.some(ing =>
      ing.name.toLowerCase().includes(clean) || ing.strength.toLowerCase().includes(clean)
    );
    const inCategory = m.category.toLowerCase().includes(clean);
    return inBrand || inGeneric || inIngredients || inCategory;
  });
}

// Find generic alternatives for a given medicine or composition
export function findAlternativesForMedicine(
  targetMedicine: Medicine
): Array<Medicine & { savingsPercent: number; savingsAmount: number }> {
  const targetIngredients = targetMedicine.activeIngredients.map(ing => ({
    name: normalizeText(ing.name),
    strength: normalizeText(ing.strength)
  }));

  const alternatives = SAMPLE_MEDICINES.filter(cand => {
    if (cand.id === targetMedicine.id) return false;

    // Must match dosage form (or be comparable solid oral form like Tablet/Capsule)
    const formsMatch = cand.dosageForm === targetMedicine.dosageForm;
    if (!formsMatch) return false;

    // Check if cand has all target active ingredients
    if (cand.activeIngredients.length !== targetMedicine.activeIngredients.length) {
      return false;
    }

    const candIngredients = cand.activeIngredients.map(ing => ({
      name: normalizeText(ing.name),
      strength: normalizeText(ing.strength)
    }));

    const allMatch = targetIngredients.every(t =>
      candIngredients.some(c => c.name.includes(t.name) || t.name.includes(c.name))
    );

    return allMatch;
  });

  return alternatives.map(alt => {
    const savingsAmount = Math.max(0, targetMedicine.price - alt.price);
    const savingsPercent = targetMedicine.price > 0
      ? Math.round((savingsAmount / targetMedicine.price) * 100)
      : 0;
    return {
      ...alt,
      savingsAmount: Number(savingsAmount.toFixed(2)),
      savingsPercent
    };
  }).sort((a, b) => b.savingsPercent - a.savingsPercent);
}

// Match extracted info from AI/OCR against our database
export function matchExtractedInfoToDatabase(extracted: {
  medicineName?: string;
  activeIngredient?: string;
  strength?: string;
  dosageForm?: string;
}): {
  matchedMedicine: Medicine | null;
  alternatives: Array<Medicine & { savingsPercent: number; savingsAmount: number }>;
} {
  const queryName = (extracted.medicineName || "").toLowerCase().trim();
  const queryActive = (extracted.activeIngredient || "").toLowerCase().trim();

  // 1. Direct brand match
  let matched: Medicine | null = null;

  if (queryName) {
    matched = SAMPLE_MEDICINES.find(m =>
      m.brandName.toLowerCase() === queryName ||
      normalizeText(m.brandName) === normalizeText(queryName) ||
      m.brandName.toLowerCase().includes(queryName) ||
      queryName.includes(m.brandName.toLowerCase())
    ) || null;
  }

  // 2. Active ingredient match if brand was not found
  if (!matched && queryActive) {
    matched = SAMPLE_MEDICINES.find(m =>
      m.activeIngredients.some(ing =>
        queryActive.includes(ing.name.toLowerCase()) ||
        ing.name.toLowerCase().includes(queryActive)
      )
    ) || null;
  }

  if (matched) {
    const alternatives = findAlternativesForMedicine(matched);
    return { matchedMedicine: matched, alternatives };
  }

  // If no direct medicine in catalog, find any generics sharing the active ingredient
  if (queryActive) {
    const looseMatches = SAMPLE_MEDICINES.filter(m =>
      m.activeIngredients.some(ing =>
        queryActive.includes(ing.name.toLowerCase()) ||
        ing.name.toLowerCase().includes(queryActive)
      )
    );

    const alternatives = looseMatches.map(m => ({
      ...m,
      savingsAmount: 0,
      savingsPercent: m.isGeneric ? 50 : 0
    }));

    return { matchedMedicine: null, alternatives };
  }

  return { matchedMedicine: null, alternatives: [] };
}

// Find medicine by examining uploaded image filename clues (fallback for OCR/Vision service spikes)
export function findMedicineFromFileName(fileName?: string): Medicine | null {
  if (!fileName) return null;
  const clean = fileName.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!clean || clean.length < 3) return null;

  for (const med of SAMPLE_MEDICINES) {
    const brandClean = med.brandName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (brandClean.length >= 3 && (clean.includes(brandClean) || brandClean.includes(clean))) {
      return med;
    }
    const genericClean = med.genericName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (genericClean.length >= 4 && clean.includes(genericClean)) {
      return med;
    }
    for (const ing of med.activeIngredients) {
      const ingClean = ing.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (ingClean.length >= 4 && clean.includes(ingClean)) {
        return med;
      }
    }
  }
  return null;
}
