import { FormField } from "@/components/atoms/form/form-field/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@dongle/ui/card";
import { Mail } from "lucide-react";
import { Club } from "@dongle/types/club/club.d";

interface ClubContactInfoProps {
  club?: Club;
}

export function ClubContactInfo({ club }: ClubContactInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          연락처 정보
        </CardTitle>
        <CardDescription>동아리 연락처 정보를 입력해주세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <label className="text-base font-medium">SNS</label>
          <div className="space-y-3">
            <FormField
              id="instagram"
              label="Instagram"
              type="text"
              name="instagram"
              placeholder="@username 또는 전체 URL"
              defaultValue={club?.sns?.instagram}
            />
            <FormField
              id="youtube"
              label="YouTube"
              type="text"
              name="youtube"
              placeholder="채널명 또는 전체 URL"
              defaultValue={club?.sns?.youtube}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
