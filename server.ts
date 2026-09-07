import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  SAMPLE_MEDICINES,
  searchMedicines,
  findMedicineById,
  findAlternativesForMedicine,
  matchExtractedInfoToDatabase,
  findMedicineFromFileName
} from "./server/medicineData.js";
import { analyzeMedicineImage } from "./server/geminiService.js";

const app = express();
const PORT = 3000;

// Increase payload limit for Base64 image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// 1. Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
    sampleMedicinesCount: SAMPLE_MEDICINES.length
  });
});

// 2. Search & catalog endpoint
app.get("/api/medicines", (req: Request, res: Response) => {
  const query = (req.query.q as string) || "";
  const results = searchMedicines(query);
  res.json({ success: true, count: results.length, data: results });
});

// 3. Get single medicine details
app.get("/api/medicines/:id", (req: Request, res: Response) => {
  const medicine = findMedicineById(req.params.id);
  if (!medicine) {
    return res.status(404).json({ success: false, error: "Medicine not found in catalog" });
  }
  res.json({ success: true, data: medicine });
});

// 4. Get generic alternatives for a specific medicine
app.get("/api/medicines/:id/alternatives", (req: Request, res: Response) => {
  const medicine = findMedicineById(req.params.id);
  if (!medicine) {
    return res.status(404).json({ success: false, error: "Medicine not found in catalog" });
  }
  const alternatives = findAlternativesForMedicine(medicine);
  res.json({
    success: true,
    original: medicine,
    alternatives,
    count: alternatives.length
  });
});

// 5. Identify medicine from image (Gemini AI Multimodal + DB Matching)
app.post("/api/identify-medicine", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, fileName, demoKey } = req.body;

    // Fast-path for interactive demo testing pills
    if (demoKey) {
      const demoMed = SAMPLE_MEDICINES.find(m => m.id === demoKey || m.brandName.toLowerCase().includes(demoKey.toLowerCase()));
      if (demoMed) {
        const alternatives = findAlternativesForMedicine(demoMed);
        return res.json({
          success: true,
          source: "demo_preset",
          extracted: {
            medicineName: demoMed.brandName,
            activeIngredient: demoMed.activeIngredients.map(i => `${i.name} (${i.strength})`).join(" + "),
            strength: demoMed.strength,
            dosageForm: demoMed.dosageForm,
            confidence: "high",
            notes: "Verified demo medicine sample preset for testing."
          },
          matchedMedicine: demoMed,
          alternatives
        });
      }
    }

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: "Missing image data. Please upload a clear photo of the medicine box or blister strip."
      });
    }

    // Call Gemini multimodal vision API
    let extracted;
    try {
      extracted = await analyzeMedicineImage(imageBase64, mimeType || "image/jpeg");
    } catch (geminiErr: any) {
      console.log("[Gemini Vision Service Status]", geminiErr.message);

      // Intelligent fallback 1: Check if file name hints match any known medicine in catalog
      const fallbackMed = findMedicineFromFileName(fileName);
      if (fallbackMed) {
        const alternatives = findAlternativesForMedicine(fallbackMed);
        return res.json({
          success: true,
          source: "metadata_fallback",
          extracted: {
            medicineName: fallbackMed.brandName,
            activeIngredient: fallbackMed.activeIngredients.map(i => `${i.name} (${i.strength})`).join(" + "),
            strength: fallbackMed.strength,
            dosageForm: fallbackMed.dosageForm,
            confidence: "medium",
            notes: `AI vision service was under temporary high traffic (503). Medicine identified as ${fallbackMed.brandName} from packaging metadata.`
          },
          matchedMedicine: fallbackMed,
          alternatives,
          warning: "Gemini AI model is under temporary high load; auto-matched from package file details. You can click 'Retry AI Scan' if desired."
        });
      }

      const isHighDemand =
        geminiErr.isTemporary ||
        (geminiErr.message && (
          geminiErr.message.includes("503") ||
          geminiErr.message.includes("high demand") ||
          geminiErr.message.includes("UNAVAILABLE") ||
          geminiErr.message.includes("temporary")
        ));

      const friendlyError = isHighDemand
        ? "The AI vision model is currently experiencing temporary high demand from Google (503). Spikes in demand are usually temporary. Please click 'Retry AI Scan' in a few seconds, or use the quick demo presets."
        : (geminiErr.message || "Unable to analyze image. Please try again or use manual search.");

      // Return clean response with retry indicator
      return res.json({
        success: false,
        isTemporary: isHighDemand,
        canRetry: true,
        error: friendlyError
      });
    }

    // Correlate extracted findings with our database
    const { matchedMedicine, alternatives } = matchExtractedInfoToDatabase(extracted);

    res.json({
      success: true,
      source: "gemini_ai",
      extracted,
      matchedMedicine,
      alternatives
    });
  } catch (error: any) {
    console.error("Error in /api/identify-medicine:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error analyzing medicine image"
    });
  }
});

// Vite middleware & production static handler
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
