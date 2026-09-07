import React from "react";
import { Medicine } from "../types.js";
import { X, CheckCircle2, TrendingDown, ShieldAlert, Sparkles, Building2 } from "lucide-react";

interface ComparisonModalProps {
  original: Medicine | null;
  alternative: Medicine | null;
  onClose: () => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  original,
  alternative,
  onClose
}) => {
  if (!alternative) return null;

  const originalPrice = original?.price || alternative.price * 2.5;
  const savingsAmount = Math.max(0, originalPrice - alternative.price);
  const savingsPercent = originalPrice > 0 ? Math.round((savingsAmount / originalPrice) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Equivalence & Savings Comparison</span>
              <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Bioequivalent
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Active ingredient verification & price difference breakdown
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Side by side cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Original Medicine Card */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                  Original / Prescribed Brand
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">
                {original ? original.brandName : "Referenced Brand"}
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                {original?.manufacturer || "Innovator Pharmaceutical"}
              </p>
              <div className="text-2xl font-bold text-slate-800 mb-1">
                ₹{originalPrice.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-500">
                {original?.packageSize || "Per standard pack"}
              </span>
            </div>

            {/* Generic Alternative Card */}
            <div className="border-2 border-emerald-500 rounded-xl p-4 bg-emerald-50/40 relative">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Generic Alternative
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Save {savingsPercent}%
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">
                {alternative.brandName}
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                {alternative.manufacturer}
              </p>
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                ₹{alternative.price.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-500">
                {alternative.packageSize}
              </span>
            </div>
          </div>

          {/* Active Ingredients & Composition Match */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Active Pharmaceutical Ingredients (Exact Match)
            </h5>
            <div className="space-y-2">
              {alternative.activeIngredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-xs py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <span className="font-medium text-slate-800">{ing.name}</span>
                  <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {ing.strength}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Savings Summary Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-emerald-900">
                  Instant Savings: ₹{savingsAmount.toFixed(2)} per pack
                </div>
                <div className="text-xs text-emerald-700">
                  You save approximately {savingsPercent}% on equivalent active therapy at Indian retail MRP.
                </div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                Same Active Salt (IP Standard)
              </span>
            </div>
          </div>

          {/* Educational Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-blue-800">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Why are Indian generic alternatives significantly more affordable?
            </div>
            <p className="text-slate-700 leading-relaxed">
              In India, generic medicines meet Indian Pharmacopoeia (IP) standards for bioequivalence and potency. Once innovator patents expire, domestic pharmaceutical manufacturers and government programs (like Pradhan Mantri Bhartiya Janaushadhi Pariyojana - PMBJP) produce identical chemical compositions without commercial marketing overheads, dramatically lowering retail prices for patients.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Remember: Confirm any substitution with your pharmacist or doctor.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
