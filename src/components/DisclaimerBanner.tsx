import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export const DisclaimerBanner: React.FC = () => {
  return (
    <footer className="bg-amber-50 border-t border-amber-200 px-4 sm:px-8 py-2.5 shrink-0 z-10">
      <div className="flex gap-3 items-center max-w-7xl mx-auto">
        <div className="bg-amber-100 text-amber-700 p-1.5 rounded shrink-0">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <p className="text-[11px] leading-tight text-amber-900 font-medium">
          <span className="font-bold uppercase tracking-wider text-amber-800 mr-1.5">
            Educational Project Disclaimer:
          </span>
          These alternatives are provided for informational and educational purposes. Please verify any substitution with a qualified doctor or pharmacist. All pricing shown reflects estimated Indian retail market MRPs (INR ₹) for educational demonstration purposes only.
        </p>
      </div>
    </footer>
  );
};
