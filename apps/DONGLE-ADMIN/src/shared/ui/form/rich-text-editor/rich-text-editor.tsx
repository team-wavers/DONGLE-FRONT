"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import {
    Bold,
    Heading1,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Redo2,
    Undo2,
} from "lucide-react";
import { Button } from "@dongle/ui/button";
import { Label } from "@dongle/ui/label";
import { Input } from "@dongle/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@dongle/ui/popover";
import { cn } from "@dongle/ui/utils";
import { toast } from "sonner";
import { getServiceErrorMessage } from "@/shared/action/get-service-error-message";
import { createRichTextExtensions, normalizeRichTextHtml, richTextContentClassName } from "@dongle/rich-text";
import BrowserInstance from "@dongle/api/browser-instance";
import type { Response } from "@dongle/types/response";

const browserInstance = BrowserInstance.getInstance();

export interface RichTextEditorProps {
    id: string;
    name: string;
    clubId?: string;
    enableImageUpload?: boolean;
    label?: string;
    required?: boolean;
    error?: string;
    description?: string;
    placeholder?: string;
    defaultValue?: string;
    value?: string;
    onChange?: (value: string) => void;
}

interface ToolbarButton {
    key: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
}

export function RichTextEditor({
    id,
    name,
    clubId,
    enableImageUpload = true,
    label,
    required,
    error,
    description,
    placeholder = "내용을 입력하세요.",
    defaultValue = "",
    value,
    onChange,
}: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [linkValue, setLinkValue] = useState("https://");
    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
    const resolvedValue = normalizeRichTextHtml(value ?? defaultValue);
    const [htmlValue, setHtmlValue] = useState(resolvedValue);
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            ...createRichTextExtensions(),
            Placeholder.configure({
                placeholder,
            }),
        ],
        editorProps: {
            attributes: {
                class: cn(
                    "min-h-[280px] px-4 py-3 text-base focus:outline-none",
                    richTextContentClassName,
                    "[&_.ProseMirror-selectednode]:outline [&_.ProseMirror-selectednode]:outline-2 [&_.ProseMirror-selectednode]:outline-zinc-300",
                    "[&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:float-left",
                    "[&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:text-zinc-400",
                    "[&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
                ),
            },
        },
        content: resolvedValue,
        onUpdate: ({ editor: currentEditor }) => {
            const nextValue = currentEditor.getHTML();
            setHtmlValue(nextValue);
            onChange?.(nextValue);
        },
    });

    useEffect(() => {
        setHtmlValue(resolvedValue);
    }, [resolvedValue]);

    useEffect(() => {
        if (!editor) {
            return;
        }

        if (editor.getHTML() !== resolvedValue) {
            editor.commands.setContent(resolvedValue, { emitUpdate: false });
        }
    }, [resolvedValue, editor]);

    const handleOpenLinkPopover = () => {
        if (!editor) {
            return;
        }

        const previousUrl = editor.getAttributes("link").href as string | undefined;
        setLinkValue(previousUrl ?? "https://");
        setIsLinkPopoverOpen(true);
    };

    const handleApplyLink = () => {
        if (!editor) {
            return;
        }

        const trimmedUrl = linkValue.trim();

        if (!trimmedUrl) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            setIsLinkPopoverOpen(false);
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: trimmedUrl }).run();
        setIsLinkPopoverOpen(false);
    };

    const handleRemoveLink = () => {
        if (!editor) {
            return;
        }

        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        setLinkValue("https://");
        setIsLinkPopoverOpen(false);
    };

    const handleInsertImage = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!editor || !clubId) {
            return;
        }

        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setIsUploadingImage(true);

        try {
            const data = await browserInstance.post<Response<string>>(
                `/api/clubs/${clubId}/report-images`,
                formData
            );

            if (!data.isSuccess) {
                toast.error(getServiceErrorMessage(data.error, "이미지 업로드에 실패했습니다."));
            } else {
                editor.chain().focus().setImage({ src: data.result }).run();
                toast.success("이미지를 본문에 추가했습니다.");
            }
        } catch (uploadError) {
            console.error(
                "리치텍스트 이미지 업로드 실패:",
                uploadError instanceof Error ? uploadError.message : uploadError
            );
            toast.error("이미지 업로드에 실패했습니다.");
        } finally {
            setIsUploadingImage(false);
            event.target.value = "";
        }
    };

    const toolbarButtons: ToolbarButton[] = editor
        ? [
              {
                  key: "bold",
                  icon: <Bold className="h-4 w-4" />,
                  label: "굵게",
                  onClick: () => editor.chain().focus().toggleBold().run(),
                  isActive: editor.isActive("bold"),
                  disabled: !editor.can().chain().focus().toggleBold().run(),
              },
              {
                  key: "italic",
                  icon: <Italic className="h-4 w-4" />,
                  label: "기울임",
                  onClick: () => editor.chain().focus().toggleItalic().run(),
                  isActive: editor.isActive("italic"),
                  disabled: !editor.can().chain().focus().toggleItalic().run(),
              },
              {
                  key: "heading1",
                  icon: <Heading1 className="h-4 w-4" />,
                  label: "제목 1",
                  onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
                  isActive: editor.isActive("heading", { level: 1 }),
              },
              {
                  key: "heading2",
                  icon: <Heading2 className="h-4 w-4" />,
                  label: "제목 2",
                  onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                  isActive: editor.isActive("heading", { level: 2 }),
              },
              {
                  key: "heading3",
                  icon: <Heading3 className="h-4 w-4" />,
                  label: "제목 3",
                  onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
                  isActive: editor.isActive("heading", { level: 3 }),
              },
              {
                  key: "bulletList",
                  icon: <List className="h-4 w-4" />,
                  label: "목록",
                  onClick: () => editor.chain().focus().toggleBulletList().run(),
                  isActive: editor.isActive("bulletList"),
              },
              {
                  key: "orderedList",
                  icon: <ListOrdered className="h-4 w-4" />,
                  label: "번호 목록",
                  onClick: () => editor.chain().focus().toggleOrderedList().run(),
                  isActive: editor.isActive("orderedList"),
              },
              {
                  key: "link",
                  icon: <LinkIcon className="h-4 w-4" />,
                  label: "링크",
                  onClick: handleOpenLinkPopover,
                  isActive: editor.isActive("link"),
              },
              ...(enableImageUpload
                  ? [
                        {
                            key: "image",
                            icon: <ImageIcon className="h-4 w-4" />,
                            label: isUploadingImage ? "이미지 업로드 중" : "이미지",
                            onClick: handleInsertImage,
                            disabled: isUploadingImage || !clubId,
                        },
                    ]
                  : []),
              {
                  key: "undo",
                  icon: <Undo2 className="h-4 w-4" />,
                  label: "실행 취소",
                  onClick: () => editor.chain().focus().undo().run(),
                  disabled: !editor.can().chain().focus().undo().run(),
              },
              {
                  key: "redo",
                  icon: <Redo2 className="h-4 w-4" />,
                  label: "다시 실행",
                  onClick: () => editor.chain().focus().redo().run(),
                  disabled: !editor.can().chain().focus().redo().run(),
              },
          ]
        : [];

    return (
        <div className="flex flex-col gap-2">
            {label && (
                <Label htmlFor={id} className="font-semibold text-zinc-700 text-base">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </Label>
            )}

            <input type="hidden" id={id} name={name} value={htmlValue} readOnly />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

            <div
                className={cn("overflow-hidden rounded-xl border border-zinc-200 bg-white", error && "border-red-400")}>
                <div className="flex flex-wrap gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2">
                    {toolbarButtons.map((button) =>
                        button.key === "link" ? (
                            <Popover key={button.key} open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant={button.isActive ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={button.onClick}
                                        disabled={button.disabled}
                                        className="h-8 px-2.5 text-zinc-700">
                                        {button.icon}
                                        <span className="sr-only">{button.label}</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-80 space-y-3">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-zinc-900">링크 설정</p>
                                        <p className="text-xs text-zinc-500">
                                            선택한 텍스트에 연결할 URL을 입력하세요.
                                        </p>
                                    </div>
                                    <Input
                                        value={linkValue}
                                        onChange={(event) => setLinkValue(event.target.value)}
                                        placeholder="https://example.com"
                                    />
                                    <div className="flex justify-between gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={handleRemoveLink}>
                                            링크 제거
                                        </Button>
                                        <Button type="button" size="sm" onClick={handleApplyLink}>
                                            적용
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        ) : (
                            <Button
                                key={button.key}
                                type="button"
                                variant={button.isActive ? "secondary" : "ghost"}
                                size="sm"
                                onClick={button.onClick}
                                disabled={button.disabled}
                                className="h-8 px-2.5 text-zinc-700">
                                {button.icon}
                                <span className="sr-only">{button.label}</span>
                            </Button>
                        )
                    )}
                </div>
                <EditorContent editor={editor} className="w-full" />
            </div>

            {description && !error && <p className="text-sm text-muted-foreground">{description}</p>}
            {!description && !error && enableImageUpload && clubId && (
                <p className="text-sm text-muted-foreground">
                    툴바의 이미지 버튼으로 이미지를 업로드해 본문에 삽입할 수 있습니다.
                </p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
