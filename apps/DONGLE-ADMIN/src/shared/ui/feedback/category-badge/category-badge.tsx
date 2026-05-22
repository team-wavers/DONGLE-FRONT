import { Badge } from "@dongle/ui/badge";
import { cn } from "@dongle/ui/utils";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const getCategoryVariant = (category: string) => {
  const categoryMap: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      className: string;
    }
  > = {
    학술분과: {
      variant: "default",
      className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
    },
    문예분과: {
      variant: "secondary",
      className:
        "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
    },
    체육분과: {
      variant: "outline",
      className:
        "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    },
    봉사분과: {
      variant: "destructive",
      className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    },
    종교분과: {
      variant: "secondary",
      className:
        "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
    },
  };

  return (
    categoryMap[category] || {
      variant: "outline" as const,
      className: "bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-200",
    }
  );
};

export default function CategoryBadge({
  category,
  className,
}: CategoryBadgeProps) {
  const { variant, className: categoryClassName } =
    getCategoryVariant(category);

  return (
    <Badge
      variant={variant}
      className={cn(
        "w-fit text-xs font-semibold",
        categoryClassName,
        className
      )}
    >
      {category}
    </Badge>
  );
}
