import { FormTextarea } from "@/components/atoms/form/form-textarea/form-textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@dongle/ui/card";
import { Tag } from "lucide-react";
import { Club } from "@dongle/types/club/club.d";

interface ClubIntroductionProps {
  club?: Club;
  values?: {
    description: string;
    mainActivities: string;
    tags: string;
  };
  onDescriptionChange?: (value: string) => void;
  onMainActivitiesChange?: (value: string) => void;
  onTagsChange?: (value: string) => void;
  fieldErrors?: {
    description?: string;
    main_activities?: string;
  };
}

export function ClubIntroduction({
  club,
  values,
  onDescriptionChange,
  onMainActivitiesChange,
  onTagsChange,
  fieldErrors,
}: ClubIntroductionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tag className="w-5 h-5 text-primary" />
          동아리 소개
        </CardTitle>
        <CardDescription>
          동아리에 대한 자세한 설명을 입력해주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 동아리 설명 */}
        <div className="space-y-2">
          <label className="text-base font-bold">
            동아리 설명 <span className="text-red-500">*</span>
          </label>
          <FormTextarea
            id="description"
            name="description"
            rows={4}
            placeholder="동아리에 대한 자세한 설명을 입력해주세요."
            defaultValue={values ? undefined : club?.description}
            value={values?.description}
            onChange={(event) => onDescriptionChange?.(event.target.value)}
            required
            error={fieldErrors?.description}
          />
        </div>

        {/* 주요 활동 */}
        <div className="space-y-2">
          <label className="text-base font-bold">
            주요 활동 <span className="text-red-500">*</span>
          </label>
          <FormTextarea
            id="main_activities"
            name="main_activities"
            rows={3}
            placeholder="동아리에서 주로 하는 활동을 소개해주세요."
            defaultValue={values ? undefined : club?.main_activities}
            value={values?.mainActivities}
            onChange={(event) => onMainActivitiesChange?.(event.target.value)}
            required
            error={fieldErrors?.main_activities}
          />
        </div>

        {/* 태그 */}
        <div className="space-y-2">
          <label className="text-base font-bold">태그</label>
          <div className="space-y-2">
            <input
              type="text"
              name="tags"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="태그를 입력하세요 (예: 개발, 디자인)"
              defaultValue={values ? undefined : club?.tags.join(", ")}
              value={values?.tags}
              onChange={(event) => onTagsChange?.(event.target.value)}
            />
            <p className="text-sm text-gray-500">
              여러 태그는 쉼표(,)로 구분해주세요
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
