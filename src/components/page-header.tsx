import type { LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      {Icon && (
        <div className="h-11 w-11 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-glow">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
}
