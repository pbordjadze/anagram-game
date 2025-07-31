import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

// If you want to persist the toggles across reloads, add localStorage here.

export function ThemeToggles() {
    // Optional: initialize from localStorage, or just useState(false)
    const [coquette, setCoquette] = useState(false);
    const [emo, setEmo] = useState(false);

    // Core logic: only one theme class on <body> at a time
    useEffect(() => {
        document.body.classList.remove(
            "coquette-theme",
            "emo-theme",
            "coquette-dark-theme"
        );
        if (coquette && emo) {
            document.body.classList.add("coquette-dark-theme");
        } else if (coquette) {
            document.body.classList.add("coquette-theme");
        } else if (emo) {
            document.body.classList.add("emo-theme");
        }
        // If neither, leave default
    }, [coquette, emo]);

    return (
        <div className="flex flex-row gap-6 items-center mt-2">
            {/* Coquette Toggle */}
            <div className="flex items-center gap-2 my-3">
                <span className={`text-2xl transition-colors ${coquette ? "text-pink-500" : "text-gray-300"}`}>🎀</span>
                <Switch
                    checked={coquette}
                    onCheckedChange={setCoquette}
                    className={coquette
                        ? "bg-pink-200 border-pink-400 ring-2 ring-pink-200 transition-all"
                        : "bg-gray-200 border-gray-300 transition-all"
                    }
                />
            </div>
            {/* Emo Toggle */}
            <div className="flex items-center gap-2 my-3">
                <span className={`text-2xl transition-colors ${emo ? "text-rose-800" : "text-gray-400"}`}>🖤</span>
                <Switch
                    checked={emo}
                    onCheckedChange={setEmo}
                    className={emo
                        ? "bg-gray-900 border-rose-800 ring-2 ring-rose-800 transition-all"
                        : "bg-gray-200 border-gray-300 transition-all"
                    }
                />
            </div>
        </div>
    );
}
