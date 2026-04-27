"use client";

import * as React from "react";
import { Input } from "@dongle/ui/input";
import { Label } from "@dongle/ui/label";
import { Button } from "@dongle/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@dongle/ui/utils";
import { useEffect, useId, useState } from "react";
import Image from "next/image";

const IMAGE_ACCEPT = "image/jpeg,image/jpg,image/png,image/gif,image/webp";
const IMAGE_ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]);

type FileUploadType = "image" | "all";

export interface FileUploadProps {
    defaultValue?: string[]; // 기존 S3 URL들 초기값
    label?: string;
    required?: boolean;
    error?: string;
    success?: string;
    description?: string;
    fileType?: FileUploadType;
    multiple?: boolean;
    maxSize?: number; // in MB
    maxFiles?: number; // 최대 파일 개수
    onFileChange?: (files: File[]) => void;
    onUrlRemove?: (url: string) => void; // 기존 URL 제거 콜백
    onReplaceExistingUrls?: () => void;
    className?: string;
    id?: string;
    showPreview?: boolean;
    name?: string; // 폼 제출을 위한 name 속성
    selectionMode?: "append" | "replace";
    removedUrlsFieldName?: string;
    presentation?: "default" | "single-thumbnail";
}

function makeRemovedFieldName(name?: string, removedUrlsFieldName?: string) {
    if (removedUrlsFieldName) return removedUrlsFieldName;
    if (!name) return undefined;
    return `${name}_removed_urls`;
}

function makeExistingFieldName(name?: string) {
    if (!name) return undefined;
    return `${name}_existing_urls`;
}

function validateFiles(files: File[], maxSize: number, fileType: FileUploadType) {
    let invalidTypeCount = 0;
    let invalidSizeCount = 0;

    const validFiles = files.filter((file) => {
        if (fileType === "image" && !IMAGE_ALLOWED_TYPES.has(file.type)) {
            invalidTypeCount += 1;
            return false;
        }

        if (file.size > maxSize * 1024 * 1024) {
            invalidSizeCount += 1;
            return false;
        }

        return true;
    });

    return { validFiles, invalidTypeCount, invalidSizeCount };
}

function buildValidationMessages({
    invalidTypeCount,
    invalidSizeCount,
    maxSize,
    maxFilesExceeded,
    maxFiles,
}: {
    invalidTypeCount: number;
    invalidSizeCount: number;
    maxSize: number;
    maxFilesExceeded: boolean;
    maxFiles: number;
}) {
    const messages: string[] = [];

    if (maxFilesExceeded) {
        messages.push(`최대 ${maxFiles}개까지 선택할 수 있어 일부 파일은 제외되었습니다.`);
    }
    if (invalidTypeCount > 0) {
        messages.push(`허용되지 않는 파일 형식 ${invalidTypeCount}개를 제외했습니다.`);
    }
    if (invalidSizeCount > 0) {
        messages.push(`파일 크기 제한(${maxSize}MB) 초과 ${invalidSizeCount}개를 제외했습니다.`);
    }

    return messages;
}

function appendPreviewFiles(files: File[], setPreviews: React.Dispatch<React.SetStateAction<string[]>>) {
    files.forEach((file) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setPreviews((prev) => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
    });
}

function normalizeExistingUrl(value: string): string | null {
    const trimmed = value.trim();

    if (!trimmed) {
        return null;
    }

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
        return trimmed;
    }

    try {
        const parsed = JSON.parse(trimmed) as {
            icon_url?: unknown;
            image_url?: unknown;
            url?: unknown;
        };
        const candidate = parsed.icon_url ?? parsed.image_url ?? parsed.url;

        if (typeof candidate === "string" && candidate.trim()) {
            return candidate.trim();
        }
    } catch {
        return null;
    }

    return null;
}

function FileListItem({
    label,
    subLabel,
    onRemove,
    accent = "neutral",
}: {
    label: string;
    subLabel?: string;
    onRemove: () => void;
    accent?: "neutral" | "existing";
}) {
    const itemClass = accent === "existing" ? "bg-blue-50" : "bg-zinc-50";
    const iconClass = accent === "existing" ? "text-blue-500" : "text-zinc-500";
    const labelClass = accent === "existing" ? "text-blue-700" : "text-zinc-700";

    return (
        <div className={cn("flex items-center justify-between p-2 rounded-md", itemClass)}>
            <div className="flex items-center space-x-2">
                <ImageIcon className={cn("h-4 w-4", iconClass)} />
                <span className={cn("text-sm", labelClass)}>{label}</span>
                {subLabel && <span className="text-xs text-zinc-500">{subLabel}</span>}
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
            </Button>
        </div>
    );
}

function ExistingPreviewSection({ urls, onRemove }: { urls: string[]; onRemove: (url: string) => void }) {
    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-700">기존 이미지 미리보기</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {urls.map((url, index) => (
                    <div key={`existing-preview-${index}`} className="relative">
                        <Image
                            src={url}
                            alt={`기존 이미지 ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border"
                            width={100}
                            height={100}
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => onRemove(url)}
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full">
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function NewPreviewSection({ previews, onRemove }: { previews: string[]; onRemove: (index: number) => void }) {
    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-700">새 파일 미리보기</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                    <div key={index} className="relative">
                        <Image
                            src={preview || "/placeholder.svg"}
                            alt={`새 파일 ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border"
                            width={100}
                            height={100}
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => onRemove(index)}
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full">
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SingleThumbnailPreview({ previewUrl, onRemove }: { previewUrl: string; onRemove: () => void }) {
    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-700">썸네일 미리보기</p>
            <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                <Image
                    src={previewUrl}
                    alt="썸네일 미리보기"
                    width={320}
                    height={320}
                    className="h-full w-full object-cover"
                />
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onRemove}
                    className="absolute right-3 top-3 h-8 w-8 rounded-full p-0">
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
    (
        {
            defaultValue,
            label,
            required,
            error,
            success,
            description,
            fileType = "image",
            multiple = false,
            maxSize = 5,
            maxFiles = 5,
            onFileChange,
            onUrlRemove,
            onReplaceExistingUrls,
            className,
            id,
            showPreview = true,
            name,
            selectionMode = "append",
            removedUrlsFieldName,
            presentation = "default",
            ...props
        },
        ref
    ) => {
        const inputRef = React.useRef<HTMLInputElement | null>(null);
        const [files, setFiles] = useState<File[]>([]);
        const [previews, setPreviews] = useState<string[]>([]);
        const defaultUrlKey = (defaultValue || []).join("||");
        const [removedUrls, setRemovedUrls] = useState<string[]>([]);
        const [validationMessages, setValidationMessages] = useState<string[]>([]);

        const generatedId = useId();
        const fieldId = id || `file-${generatedId}`;
        const shouldShowPreview = fileType === "image" && showPreview;
        const isSingleThumbnail = presentation === "single-thumbnail";
        const acceptValue = fileType === "image" ? IMAGE_ACCEPT : "*/*";
        const baseExistingUrls = React.useMemo(
            () => (defaultValue ?? []).map(normalizeExistingUrl).filter((url): url is string => Boolean(url)),
            [defaultUrlKey, defaultValue]
        );
        const filteredExistingUrls = React.useMemo(
            () => baseExistingUrls.filter((url) => !removedUrls.includes(url)),
            [baseExistingUrls, removedUrls]
        );
        const effectiveExistingUrls = selectionMode === "replace" && files.length > 0 ? [] : filteredExistingUrls;
        const removedFieldName = makeRemovedFieldName(name, removedUrlsFieldName);
        const existingFieldName = makeExistingFieldName(name);
        const singleThumbnailPreviewUrl = previews[0] || effectiveExistingUrls[0];

        useEffect(() => {
            setRemovedUrls([]);
        }, [defaultUrlKey]);

        useEffect(() => {
            const input = inputRef.current;
            if (!input) return;

            const dataTransfer = new DataTransfer();
            files.forEach((file) => dataTransfer.items.add(file));
            input.files = dataTransfer.files;
        }, [files]);

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = Array.from(e.target.files || []);
            const { validFiles, invalidTypeCount, invalidSizeCount } = validateFiles(selectedFiles, maxSize, fileType);

            if (selectionMode === "replace") {
                applyReplaceSelection(validFiles, invalidTypeCount, invalidSizeCount);
                return;
            }

            applyAppendSelection(validFiles, invalidTypeCount, invalidSizeCount);
        };

        const applyReplaceSelection = (validFiles: File[], invalidTypeCount: number, invalidSizeCount: number) => {
            const replacedFiles = validFiles.slice(0, maxFiles);
            const maxFilesExceeded = validFiles.length > maxFiles;

            if (replacedFiles.length > 0) {
                onReplaceExistingUrls?.();
            }

            setFiles(replacedFiles);
            onFileChange?.(replacedFiles);

            setPreviews([]);
            if (shouldShowPreview) {
                appendPreviewFiles(replacedFiles, setPreviews);
            }

            setValidationMessages(
                buildValidationMessages({
                    invalidTypeCount,
                    invalidSizeCount,
                    maxSize,
                    maxFilesExceeded,
                    maxFiles,
                })
            );
        };

        const applyAppendSelection = (validFiles: File[], invalidTypeCount: number, invalidSizeCount: number) => {
            const existingUrlCount = effectiveExistingUrls.length;
            const currentFileCount = files.length;
            const allowedNewFilesCount = maxFiles - existingUrlCount - currentFileCount;

            if (allowedNewFilesCount <= 0) {
                setValidationMessages([`최대 ${maxFiles}개까지 업로드할 수 있습니다.`]);
                return;
            }

            const appendFiles = validFiles.slice(0, allowedNewFilesCount);
            const maxFilesExceeded = validFiles.length > appendFiles.length;
            const updatedFiles = [...files, ...appendFiles];

            setFiles(updatedFiles);
            onFileChange?.(updatedFiles);

            if (shouldShowPreview) {
                appendPreviewFiles(appendFiles, setPreviews);
            }

            setValidationMessages(
                buildValidationMessages({
                    invalidTypeCount,
                    invalidSizeCount,
                    maxSize,
                    maxFilesExceeded,
                    maxFiles,
                })
            );
        };

        const removeFile = (index: number) => {
            const newFiles = files.filter((_, i) => i !== index);
            const newPreviews = previews.filter((_, i) => i !== index);
            setFiles(newFiles);
            setPreviews(newPreviews);
            onFileChange?.(newFiles);
        };

        const removeExistingUrl = (url: string) => {
            setRemovedUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));
            onUrlRemove?.(url);
        };

        return (
            <div className="space-y-2">
                {label && (
                    <Label htmlFor={fieldId} className={cn(error && "text-red-600", success && "text-green-600")}>
                        <span className="p-1font-semibold">{label}</span>
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                )}

                <div className="space-y-4">
                    <label
                        htmlFor={fieldId}
                        className={cn(
                            "flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors",
                            error && "border-red-500 bg-red-50 hover:bg-red-100",
                            success && "border-green-500 bg-green-50 hover:bg-green-100",
                            className
                        )}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                            <Upload className="w-8 h-8 mb-4 text-zinc-500" />
                            <p className=" text-sm text-zinc-500">
                                <span className="font-semibold">여기를 클릭하여 파일을 선택</span>
                            </p>
                        </div>
                        <Input
                            ref={(node) => {
                                inputRef.current = node;
                                if (typeof ref === "function") {
                                    ref(node);
                                } else if (ref) {
                                    ref.current = node;
                                }
                            }}
                            id={fieldId}
                            type="file"
                            name={name}
                            accept={acceptValue}
                            multiple={multiple}
                            onChange={handleFileChange}
                            className="hidden"
                            {...props}
                        />
                    </label>

                    {existingFieldName && (
                        <input type="hidden" name={existingFieldName} value={JSON.stringify(effectiveExistingUrls)} />
                    )}
                    {removedFieldName && (
                        <input type="hidden" name={removedFieldName} value={JSON.stringify(removedUrls)} />
                    )}

                    {!isSingleThumbnail && effectiveExistingUrls.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-zinc-700">기존 파일</p>
                            {effectiveExistingUrls.map((url, index) => (
                                <FileListItem
                                    key={`existing-${index}`}
                                    label={`기존 파일 ${index + 1}`}
                                    onRemove={() => removeExistingUrl(url)}
                                    accent="existing"
                                />
                            ))}
                        </div>
                    )}

                    {!isSingleThumbnail && files.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-zinc-700">새로 추가된 파일</p>
                            {files.map((file, index) => (
                                <FileListItem
                                    key={index}
                                    label={file.name}
                                    subLabel={`(${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                                    onRemove={() => removeFile(index)}
                                />
                            ))}
                        </div>
                    )}

                    {!isSingleThumbnail && shouldShowPreview && effectiveExistingUrls.length > 0 && (
                        <ExistingPreviewSection urls={effectiveExistingUrls} onRemove={removeExistingUrl} />
                    )}

                    {!isSingleThumbnail && shouldShowPreview && previews.length > 0 && (
                        <NewPreviewSection previews={previews} onRemove={removeFile} />
                    )}

                    {isSingleThumbnail && shouldShowPreview && singleThumbnailPreviewUrl && (
                        <SingleThumbnailPreview
                            previewUrl={singleThumbnailPreviewUrl}
                            onRemove={() => {
                                if (previews.length > 0) {
                                    removeFile(0);
                                    return;
                                }

                                if (effectiveExistingUrls[0]) {
                                    removeExistingUrl(effectiveExistingUrls[0]);
                                }
                            }}
                        />
                    )}
                </div>

                {description && !error && !success && (
                    <p className="text-sm text-muted-foreground">
                        {description} (최대 {maxSize}MB, {maxFiles}개까지)
                    </p>
                )}

                {validationMessages.length > 0 && (
                    <div className="space-y-1">
                        {validationMessages.map((message, index) => (
                            <p key={`${message}-${index}`} className="text-xs text-amber-600">
                                {message}
                            </p>
                        ))}
                    </div>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}
            </div>
        );
    }
);

FileUpload.displayName = "FileUpload";

export { FileUpload };
