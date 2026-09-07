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
  savingsPercent?: number;
  savingsAmount?: number;
}

export interface ExtractedAnalysis {
  medicineName: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  confidence: "high" | "medium" | "low";
  notes?: string;
}

export interface IdentifyApiResponse {
  success: boolean;
  source?: "gemini_ai" | "demo_preset";
  extracted: ExtractedAnalysis;
  matchedMedicine: Medicine | null;
  alternatives: Medicine[];
  error?: string;
  isApiKeyMissing?: boolean;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  imageThumbnail?: string;
  medicineName: string;
  activeIngredient: string;
  alternativesCount: number;
  maxSavingsPercent: number;
}
