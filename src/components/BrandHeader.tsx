import morsLogo from "@/assets/mors-logo.png.asset.json";
import { cn } from "@/lib/utils";

interface Props {
  compact?: boolean;
  className?: string;
}

export function BrandHeader({ compact = false, className }: Props) {
  return (
    <div className={cn("brand-header", compact && "brand-header-compact", className)}>
      <img src={morsLogo.url} alt="MORS" className="brand-logo" />
    </div>
  );
}