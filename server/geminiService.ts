import { GoogleGenAI } from "@google/genai";

let genAiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({ apiKey });
  }
  return genAiClient;
}

export interface ExtractedMedicineData {
  medicineName: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  confidence: "high" | "medium" | "low";
  notes: string;
  usedModel?: string;
}

export interface GeminiServiceError extends Error {
  isTemporary?: boolean;
  code?: number;
}

// Multimodal models in order of current cluster availability
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest"
];

function formatErrorMessage(err: any): { message: string; isTemporary: boolean; code?: number } {
  const rawMsg = err?.message || String(err);
  let parsedCode = err?.status;
  let cleanMsg = rawMsg;

  try {
    const jsonMatch = rawMsg.match(/\{[\s\S]*"error"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error?.message) {
        cleanMsg = parsed.error.message;
      }
      if (parsed?.error?.code) {
        parsedCode = parsed.error.code;
      }
    }
  } catch {
    // Keep cleanMsg
  }

  const isTemporary =
    parsedCode === 503 ||
    parsedCode === 429 ||
    cleanMsg.includes("503") ||
    cleanMsg.includes("high demand") ||
    cleanMsg.includes("UNAVAILABLE") ||
    cleanMsg.includes("temporary") ||
    cleanMsg.includes("timed out") ||
    cleanMsg.includes("RESOURCE_EXHAUSTED");

  if (isTemporary) {
    cleanMsg =
      "The AI model is currently experiencing temporary high demand (503). Spikes in demand are usually temporary. Please retry in a few seconds.";
  }

  return { message: cleanMsg, isTemporary, code: parsedCode };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMsg: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(timeoutMsg);
      (err as any).status = 503;
      reject(err);
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

export async function analyzeMedicineImage(
  base64Data: string,
  mimeType: string = "image/jpeg"
): Promise<ExtractedMedicineData> {
  const ai = getGeminiClient();

  if (!ai) {
    const err: GeminiServiceError = new Error(
      "GEMINI_API_KEY is not configured. Please set your Gemini API key in Settings/Secrets to enable live AI packaging scanning."
    );
    err.isTemporary = false;
    throw err;
  }

  // Strip prefix if included like "data:image/jpeg;base64,"
  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");

  const prompt = `
You are an educational AI assistant for an academic college project comparing branded medicines with generic alternatives.
Examine this medicine packaging or strip image carefully.
Extract the following information in strict JSON format:

{
  "medicineName": "Commercial/Brand name visible on the box or strip (e.g. Augmentin, Crocin, Lipitor, Zyrtec, Pan-40)",
  "activeIngredient": "The active pharmaceutical ingredient/salt (e.g. Amoxicillin + Clavulanic Acid, Paracetamol, Atorvastatin, Cetirizine)",
  "strength": "The dosage strength (e.g. 500mg + 125mg, 650mg, 20mg, 10mg)",
  "dosageForm": "Tablet, Capsule, Syrup, Suspension, Ointment, or Injection",
  "confidence": "high, medium, or low based on visual clarity and legibility",
  "notes": "Brief educational note on what was identified from the label"
}

Rules:
1. If the packaging is blurry, illegible, or not a medicine, set "confidence": "low" and explain clearly in "notes".
2. Do not invent false chemicals or prescription advice.
3. Return ONLY the JSON object, without markdown wraps if possible.
`;

  const contents = [
    {
      role: "user",
      parts: [
        {
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: cleanBase64
          }
        },
        {
          text: prompt
        }
      ]
    }
  ];

  const config = {
    responseMimeType: "application/json"
  };

  let lastErr: any = null;
  let successfulResponse: any = null;
  let successfulModel: string = "";

  // Try each candidate model with a 7-second individual timeout
  for (const model of CANDIDATE_MODELS) {
    try {
      console.log(`[Gemini Vision] Trying model: ${model}...`);
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents,
          config
        }),
        7000,
        `Call to ${model} timed out after 7s due to temporary network load.`
      );
      successfulResponse = response;
      successfulModel = model;
      console.log(`[Gemini Vision] Model ${model} succeeded!`);
      break;
    } catch (err: any) {
      lastErr = err;
      const errInfo = formatErrorMessage(err);
      console.log(`[Gemini Vision] ${model} unavailable (${errInfo.isTemporary ? 'high demand' : 'service response'}), trying fallback candidate...`);

      if (!errInfo.isTemporary) {
        // Fatal non-transient error (e.g. invalid arguments/blocked prompt)
        const customErr: GeminiServiceError = new Error(errInfo.message);
        customErr.isTemporary = false;
        customErr.code = errInfo.code;
        throw customErr;
      }
      // If temporary, continue to the next model in the candidate list
    }
  }

  if (!successfulResponse) {
    const errInfo = formatErrorMessage(lastErr);
    const customErr: GeminiServiceError = new Error(errInfo.message);
    customErr.isTemporary = errInfo.isTemporary;
    customErr.code = errInfo.code;
    throw customErr;
  }

  try {
    const responseText = successfulResponse.text || "{}";
    const parsed = JSON.parse(responseText);

    return {
      medicineName: parsed.medicineName || "Unknown Medicine",
      activeIngredient: parsed.activeIngredient || "Not clearly identified",
      strength: parsed.strength || "Unspecified",
      dosageForm: parsed.dosageForm || "Tablet",
      confidence: parsed.confidence === "high" || parsed.confidence === "medium" ? parsed.confidence : "low",
      notes: parsed.notes || `Image analyzed via ${successfulModel}.`,
      usedModel: successfulModel
    };
  } catch (parseError: any) {
    console.error("Error parsing Gemini JSON response:", parseError);
    return {
      medicineName: "Scanned Medicine",
      activeIngredient: "Identified via OCR",
      strength: "Standard",
      dosageForm: "Tablet",
      confidence: "low",
      notes: "Could not parse full label details. Please confirm salt name manually.",
      usedModel: successfulModel
    };
  }
}
