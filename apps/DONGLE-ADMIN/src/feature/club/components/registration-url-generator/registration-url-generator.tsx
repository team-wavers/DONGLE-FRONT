"use client";

import { Button } from "@dongle/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@dongle/ui/card";
import { Input } from "@dongle/ui/input";

import { Link, Copy } from "lucide-react";
import { useUrlGenerator } from "@/hooks/use-url-generator";

export default function UrlGenerator() {
  const { generateUrl, copyUrl, isPending, state } = useUrlGenerator();

  const handleCopyUrl = async () => {
    await copyUrl();
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-2">
          <Link className="w-5 h-5 text-primary" />
          동아리 등록 URL 발급
        </CardTitle>
        <CardDescription>
          동아리 등록을 위한 임시 URL을 생성하고 관리할 수 있습니다
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* URL 생성 버튼 */}
        <Button
          onClick={generateUrl}
          className="h-12 w-full bg-primary text-base font-semibold hover:bg-primary/90"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              URL 생성 중...
            </>
          ) : (
            <>
              <Link className="w-4 h-4 mr-2" />
              등록 URL 생성
            </>
          )}
        </Button>

        {/* 에러 메시지 */}
        {state.error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{state.error}</p>
          </div>
        )}

        {/* 생성된 URL 표시 */}
        {state.success && state.registerUrl && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">
                  URL이 성공적으로 생성되었습니다
                </span>
              </div>

              {/* URL 입력 필드 */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="register-url"
                    value={state.registerUrl}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyUrl}
                    className="shrink-0"
                  >
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      복사
                    </>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
