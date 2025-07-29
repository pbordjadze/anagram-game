import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

export function CoquetteToggle() {
    const [coquette, setCoquette] = useState(false);

    useEffect(() => {
        document.body.classList.toggle("coquette-theme", coquette);
    }, [coquette]);

    return (
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
    );
}
