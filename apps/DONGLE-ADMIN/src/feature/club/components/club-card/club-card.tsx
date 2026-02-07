import { Badge } from "@dongle/ui/badge";
import { Button } from "@dongle/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@dongle/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@dongle/ui/dropdown-menu";
import { Crown, MoreHorizontal, Trash2 } from "lucide-react";

export interface ClubCardProps {
  name: string;
  category: string;
  president: string;
  onDetail?: () => void;
  onDelete?: () => void;
}

export default function ClubCard({ name, category, onDelete }: ClubCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 min-w-sm w-full flex flex-row gap-2 justify-between">
      <CardHeader className="pb-1 flex-1 flex flex-col gap-2">
        <CardTitle className="text-xl font-bold text-zinc-900">
          {name}
        </CardTitle>
        <Badge variant="secondary" className="w-fit text-sm">
          {category}
        </Badge>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-row gap-4 justify-between">
        <div className="flex flex-col gap-2 justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-fit self-end">
              <Button size="sm" variant="outline">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:text-red-600 text-base"
              >
                <Trash2 className="w-3 h-3 mr-2 text-red-600" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* <LoadingButton
            onClick={onEditPresident}
            className="font-semibold text-base h-fit"
          >
            <Crown className="w-3 h-2 mr-1" />
            회장 지정
          </LoadingButton> */}
        </div>
      </CardContent>
    </Card>
  );
}
