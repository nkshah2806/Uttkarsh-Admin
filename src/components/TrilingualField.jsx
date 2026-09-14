import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Languages, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { translateTexts } from "@/lib/translate";

// Admin translation-management field.
//
// Renders the English (source) input plus Hindi and Gujarati inputs for a
// single logical field. The "Translate Automatically" button calls the secure
// backend `/translate` endpoint (Google Translate) to pre-fill the Hindi and
// Gujarati values, which the admin can then edit manually before saving.
//
// The field maps to flat siblings on the form object:
//   base      -> English value   (e.g. title)
//   base_hi   -> Hindi value     (e.g. title_hi)
//   base_gu   -> Gujarati value  (e.g. title_gu)
export default function TrilingualField({
    label,
    base,
    form,
    setForm,
    required = false,
    multiline = false,
    rows = 3,
    placeholder = "",
    className = "",
}) {
    const { t } = useTranslation();
    const enKey = base;
    const hiKey = `${base}_hi`;
    const guKey = `${base}_gu`;
    const [translating, setTranslating] = useState(false);

    const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleAutoTranslate = async () => {
        const source = (form[enKey] || "").trim();
        if (!source) {
            toast.error(t("common.enterEnglish"));
            return;
        }
        setTranslating(true);
        try {
            const [hi, gu] = await Promise.all([
                translateTexts([source], "hi").then((arr) => arr[0]),
                translateTexts([source], "gu").then((arr) => arr[0]),
            ]);
            setForm((prev) => ({
                ...prev,
                [hiKey]: hi || prev[hiKey] || "",
                [guKey]: gu || prev[guKey] || "",
            }));
            toast.success(t("common.success"));
        } catch {
            toast.error(t("common.error"));
        } finally {
            setTranslating(false);
        }
    };

    const Field = multiline ? Textarea : Input;
    const fieldProps = multiline ? { rows } : {};

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex items-center justify-between gap-2">
                <Label className="flex items-center gap-1.5">
                    <Languages className="h-3.5 w-3.5 text-indigo-600" />
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleAutoTranslate}
                    disabled={translating}
                >
                    {translating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                    )}
                    {translating ? t("common.translating") : t("common.autoTranslate")}
                </Button>
            </div>

            <div className="grid gap-2">
                <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground">
                        {t("common.english")}
                    </span>
                    <Field
                        value={form[enKey] || ""}
                        placeholder={placeholder}
                        onChange={(e) => set(enKey, e.target.value)}
                        {...fieldProps}
                    />
                </div>

                <div className="grid sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground">
                            {t("common.hindi")}
                        </span>
                        <Field
                            value={form[hiKey] || ""}
                            onChange={(e) => set(hiKey, e.target.value)}
                            {...fieldProps}
                        />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground">
                            {t("common.gujarati")}
                        </span>
                        <Field
                            value={form[guKey] || ""}
                            onChange={(e) => set(guKey, e.target.value)}
                            {...fieldProps}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
