import React from "react";
import { X, BookOpen, Cpu, Database, CheckCircle, Lightbulb, Shield } from "lucide-react";

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              About Project & Viva Examination Notes
            </h3>
            <p className="text-xs text-slate-500">
              College Capstone Project: Generic Medicine Finder using AI & Structured Matching
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-sm text-slate-700">
          {/* Project Objective */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Project Objective
            </h4>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              To alleviate the financial burden of prescription healthcare costs by allowing consumers to scan or search brand-name medicines, extract their active pharmaceutical ingredients using multimodal computer vision (Gemini 3.8 Flash), and match them against bioequivalent generic formulations with clear price savings.
            </p>
          </div>

          {/* Architecture Pipeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              System Architecture (For Viva)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  1. Multimodal AI
                </div>
                <p className="text-slate-600">
                  Google Gemini 3.8 Flash extracts commercial title, salt composition, dosage form, and strength directly from packaging photos.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  2. Salt Matching Engine
                </div>
                <p className="text-slate-600">
                  Express backend matches active ingredients and dosage strength against the medicine catalog without hallucinating fake drugs.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-600" />
                  3. Safety & Economics
                </div>
                <p className="text-slate-600">
                  Computes exact percentage savings, verifies bioequivalence criteria, and enforces mandatory medical disclaimers.
                </p>
              </div>
            </div>
          </div>

          {/* Key Viva Questions & Answers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Key Viva Questions & Answers
            </h4>
            <div className="space-y-2 text-xs">
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <span className="font-bold text-slate-800">Q: What is the difference between a brand medicine and a generic medicine?</span>
                <p className="mt-1 text-slate-600">
                  A: Both contain the exact same active pharmaceutical ingredient (API) in the same strength, route of administration, and quality standards. The brand is the first innovator that patented the chemical, whereas generics are produced after patent expiration by verified manufacturers.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <span className="font-bold text-slate-800">Q: Why did we separate the AI image reader from the medicine catalog?</span>
                <p className="mt-1 text-slate-600">
                  A: LLMs should not be trusted to generate medical recommendations from scratch due to risk of hallucinations. We use AI strictly for OCR label extraction, while trusted substitution matching is handled deterministically via our validated database rules.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <span className="font-bold text-slate-800">Q: What is Bioequivalence?</span>
                <p className="mt-1 text-slate-600">
                  A: It means the generic drug delivers the same rate and extent of active ingredient absorption into the bloodstream as the brand drug, producing the identical therapeutic effect.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <span className="font-bold text-slate-800">Q: How do generic medicine pricing and quality work in India?</span>
                <p className="mt-1 text-slate-600">
                  A: In India, generic alternatives adhere to Indian Pharmacopoeia (IP) standards under CDSCO regulation. The Government of India also promotes generic accessibility through the Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) and caps ceiling prices via the National Pharmaceutical Pricing Authority (NPPA / DPCO), often reducing patient expenses by 50% to 85% compared to innovator brands.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Got It, Back to Finder
          </button>
        </div>
      </div>
    </div>
  );
};
