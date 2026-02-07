"use client";

import * as React from "react";
import { Input } from "@dongle/ui/input";
import { Label } from "@dongle/ui/label";
import { Button } from "@dongle/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@dongle/ui/utils";
import { useState, useId } from "react";
import Image from "next/image";

export interface FileUploadProps {
  defaultValue?: File[];
  existingUrls?: string[]; // 기존 S3 URL들
  label?: string;
  required?: boolean;
  error?: string;
  success?: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number; // 최대 파일 개수
  onFileChange?: (files: File[]) => void;
  onUrlRemove?: (url: string) => void; // 기존 URL 제거 콜백
  className?: string;
  id?: string;
  showPreview?: boolean;
  name?: string; // 폼 제출을 위한 name 속성
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      defaultValue,
      existingUrls = [],
      label,
      required,
      error,
      success,
      description,
      accept = "image/jpeg,image/jpg,image/png,image/gif,image/webp",
      multiple = false,
      maxSize = 5,
      maxFiles = 5,
      onFileChange,
      onUrlRemove,
      className,
      id,
      showPreview = true,
      name,
      ...props
    },
    ref
  ) => {
    const [files, setFiles] = useState<File[]>(defaultValue || []);
    const [previews, setPreviews] = useState<string[]>([]);
    const generatedId = useId();
    const fieldId = id || `file-${generatedId}`;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);

      // 파일 타입 및 크기 검증
      const validFiles = selectedFiles.filter((file) => {
        // 이미지 파일 타입 검증
        if (!file.type.startsWith("image/")) {
          return false;
        }

        // 허용된 이미지 형식 검증
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          return false;
        }

        // 파일 크기 검증
        if (file.size > maxSize * 1024 * 1024) {
          return false;
        }

        return true;
      });

      // 파일 개수 제한 (기존 URL + 기존 파일 + 새 파일)
      const existingUrlCount = existingUrls.length;
      const currentFileCount = files.length;
      const newFileCount = validFiles.length;
      const totalCount = existingUrlCount + currentFileCount + newFileCount;
      let allowedNewFiles = 0;
      let filesToProcess: File[] = [];

      if (totalCount > maxFiles) {
        allowedNewFiles = maxFiles - existingUrlCount - currentFileCount;
        if (allowedNewFiles > 0) {
          const limitedFiles = validFiles.slice(0, allowedNewFiles);
          const updatedFiles = [...files, ...limitedFiles];
          setFiles(updatedFiles);
          onFileChange?.(updatedFiles);
          filesToProcess = limitedFiles;
        } else {
          // 이미 최대 개수에 도달한 경우
          return;
        }
      } else {
        const updatedFiles = [...files, ...validFiles];
        setFiles(updatedFiles);
        onFileChange?.(updatedFiles);
        filesToProcess = validFiles;
      }

      // 이미지 미리보기 생성 (새로 추가된 파일들만)
      if (showPreview && accept.includes("image")) {
        filesToProcess.forEach((file) => {
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
              setPreviews((prev) => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
          }
        });
      }
    };

    const removeFile = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      const newPreviews = previews.filter((_, i) => i !== index);
      setFiles(newFiles);
      setPreviews(newPreviews);
      onFileChange?.(newFiles);
    };

    const removeExistingUrl = (url: string) => {
      onUrlRemove?.(url);
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label
            htmlFor={fieldId}
            className={cn(error && "text-red-600", success && "text-green-600")}
          >
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
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
              <Upload className="w-8 h-8 mb-4 text-zinc-500" />
              <p className=" text-sm text-zinc-500">
                <span className="font-semibold">
                  여기를 클릭하여 파일을 선택
                </span>
              </p>
              {/* <p className="text-xs text-zinc-500">
                {accept.replace("/*", "").toUpperCase() || "파일"} (최대{" "}
                {maxSize}
                MB)
              </p> */}
            </div>
            <Input
              ref={ref}
              id={fieldId}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileChange}
              className="hidden"
              {...props}
            />

            {/* 폼 제출을 위한 hidden inputs */}
            {files.map((file, index) => (
              <input
                key={index}
                type="file"
                name={name}
                style={{ display: "none" }}
                ref={(input) => {
                  if (input) {
                    // FileList를 생성하여 파일을 설정
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    input.files = dataTransfer.files;
                  }
                }}
              />
            ))}
          </label>

          {/* 기존 URL 파일 목록 */}
          {existingUrls.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-700">기존 이미지</p>
              {existingUrls.map((url, index) => (
                <div
                  key={`existing-${index}`}
                  className="flex items-center justify-between p-2 bg-blue-50 rounded-md"
                >
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-700">
                      기존 이미지 {index + 1}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExistingUrl(url)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* 새 파일 목록 */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-700">
                새로 추가된 파일
              </p>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-zinc-50 rounded-md"
                >
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm text-zinc-700">{file.name}</span>
                    <span className="text-xs text-zinc-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* 기존 URL 이미지 미리보기 */}
          {showPreview && existingUrls.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-700">
                기존 이미지 미리보기
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {existingUrls.map((url, index) => (
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
                      onClick={() => removeExistingUrl(url)}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 새 파일 이미지 미리보기 */}
          {showPreview && previews.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-700">
                새 파일 미리보기
              </p>
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
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {description && !error && !success && (
          <p className="text-sm text-muted-foreground">
            {description} (JPG, PNG, GIF, WebP만 가능, 최대 {maxSize}MB,{" "}
            {maxFiles}개까지)
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
      </div>
    );
  }
);
FileUpload.displayName = "FileUpload";

export { FileUpload };
