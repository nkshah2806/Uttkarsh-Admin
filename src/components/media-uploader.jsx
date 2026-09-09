import { useState, useEffect, useCallback, useRef, useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { Trash2, UploadCloud, FileVideo, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Config } from "@/lib/Config";
import axiosInstance from "@/lib/axios";

/**
 * MediaUploader — a single reusable component for uploading images AND videos
 * from the local device. It performs client-side validation, shows a preview,
 * uploads the file to POST /api/upload/:folder, and reports the resulting
 * server-relative file reference (/uploads/<folder>/<file>) via onUploaded.
 *
 * Props:
 *   label        — field label
 *   value        — current server-relative file reference (e.g. /uploads/gallery/123.webp)
 *   onUploaded   — (fileRef) called with the server-relative reference after upload
 *   onClear      — () called when the user removes the current media
 *   folder       — upload sub-folder on the server (gallery, gallery-video, health-camps, ...)
 *   accept       — media kind: "image" | "video"
 *   required     — show an asterisk in the label
 *   helpText     — small helper text under the label
 *   className    — extra wrapper classes
 */
export function MediaUploader({
    label = "Media",
    value = "",
    onUploaded,
    onClear,
    folder = "misc",
    accept = "image",
    required = false,
    helpText = "",
    className = "",
}) {
    const MAX_IMAGE_MB = 5;
    const MAX_VIDEO_MB = 100;
    const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];
    const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
    const VIDEO_EXTS = [".mp4", ".webm", ".mov"];

    const isVideo = accept === "video";
    const acceptedTypes = isVideo ? VIDEO_TYPES : IMAGE_TYPES;
    const acceptedExts = isVideo ? VIDEO_EXTS : IMAGE_EXTS;
    const maxMB = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;

    const inputRef = useRef(null);
    const inputId = useId();
    const [preview, setPreview] = useState("");
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Build a previewable URL from either a blob or a server-relative reference.
    useEffect(() => {
        if (!value) {
            setPreview("");
            return;
        }
        if (value.startsWith("blob:") || value.startsWith("data:")) {
            setPreview(value);
        } else if (value.startsWith("/uploads/")) {
            setPreview(`${Config.API_URL}${value.replace(/^\//, "")}`);
        } else if (/^https?:\/\//.test(value)) {
            // Legacy records may still hold external URLs — keep them viewable but
            // they are never allowed for new uploads.
            setPreview(value);
        } else {
            setPreview("");
        }
    }, [value]);

    useEffect(() => {
        return () => {
            if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const validateFile = (file) => {
        const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
        if (!acceptedTypes.includes(file.type)) {
            toast.error(`${file.name} is not a valid ${isVideo ? "video" : "image"} file.`);
            return false;
        }
        if (!acceptedExts.includes(ext)) {
            toast.error(`Invalid file extension. Allowed: ${acceptedExts.join(", ")}`);
            return false;
        }
        if (file.size > maxMB * 1024 * 1024) {
            toast.error(`${file.name} exceeds the ${maxMB}MB size limit.`);
            return false;
        }
        return true;
    };

    const uploadFile = async (file) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            if (isVideo) formData.append("kind", "video");

            const res = await axiosInstance.post(`upload/${folder}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const fileRef = res.data?.data?.url || res.data?.data?.path;
            if (!fileRef) {
                throw new Error("Upload response did not include a file reference.");
            }
            toast.success("File uploaded successfully");
            onUploaded && onUploaded(fileRef);
            return fileRef;
        } catch (err) {
            const message = err?.response?.data?.message || err.message || "Upload failed. Try again.";
            toast.error(message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!validateFile(file)) {
            e.target.value = null;
            return;
        }
        // Show a blob preview immediately while the upload runs.
        setPreview(URL.createObjectURL(file));
        uploadFile(file);
        e.target.value = null; // allow re-selecting the same file
    };

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (!file) return;
            if (!validateFile(file)) return;
            setPreview(URL.createObjectURL(file));
            uploadFile(file);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [accept, folder, maxMB]
    );

    const handleRemove = (e) => {
        e.stopPropagation();
        if (uploading) return;
        if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
        setPreview("");
        onClear && onClear();
    };

    const acceptAttr = acceptedTypes.join(",");

    return (
        <div className={className}>
            <Label className="mb-3 block">
                {label} {required && <span className="text-violet-500">*</span>}
            </Label>
            {helpText && <p className="text-[11px] text-slate-400 mb-2">{helpText}</p>}

            <div className="flex flex-wrap items-start gap-4">
                {/* Dropzone / click-to-upload */}
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    className={`flex-none border-2 border-dashed p-4 rounded-lg cursor-pointer flex items-center justify-center transition-colors ${isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-gray-400"
                        }`}
                >
                    <label htmlFor={inputId} className="flex items-center justify-center flex-col cursor-pointer">
                        {uploading ? (
                            <Loader2 size={45} className="animate-spin text-indigo-500" />
                        ) : (
                            <UploadCloud size={45} />
                        )}
                        <p className="text-sm text-gray-500 mt-2 text-center max-w-[180px]">
                            {uploading
                                ? "Uploading…"
                                : isVideo
                                    ? "Drag & drop or click to upload video"
                                    : "Drag & drop or click to upload image"}
                        </p>
                        <Input
                            ref={inputRef}
                            className="hidden"
                            id={inputId}
                            type="file"
                            accept={acceptAttr}
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>
                </div>

                {/* Preview + actions */}
                {preview ? (
                    <div className="relative min-w-[160px] max-w-[280px]">
                        {isVideo ? (
                            <video
                                src={preview}
                                controls
                                className="w-full max-h-44 rounded-lg border border-slate-200 dark:border-slate-700 bg-black object-contain"
                            />
                        ) : (
                            <img
                                src={preview}
                                alt="media-preview"
                                onError={({ currentTarget }) => {
                                    currentTarget.onerror = null;
                                    currentTarget.style.display = "none";
                                }}
                                className="w-full max-h-44 rounded-lg border border-slate-200 dark:border-slate-700 object-cover"
                            />
                        )}
                        <div className="absolute top-2 right-2 flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                disabled={uploading}
                                onClick={() => inputRef.current?.click()}
                                className="bg-white/90 dark:bg-slate-800/90"
                                title="Replace media"
                            >
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                disabled={uploading}
                                onClick={handleRemove}
                                className="bg-white/90 dark:bg-slate-800/90"
                                title="Remove media"
                            >
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                        </div>
                        {isVideo && (
                            <p className="text-[11px] text-slate-400 mt-1 truncate max-w-[260px]" title={value}>
                                <FileVideo className="inline h-3 w-3 mr-1" />
                                {value || "Video uploaded"}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 min-w-[160px] max-w-[280px] rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center text-xs text-slate-400">
                        {isVideo ? "MP4, WebM or MOV (max 100MB)" : "JPG, JPEG, PNG or WebP (max 5MB)"}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MediaUploader;
