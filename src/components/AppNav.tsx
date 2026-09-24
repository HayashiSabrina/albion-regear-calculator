import { Link } from "@tanstack/react-router";
import { Hammer, Users } from "lucide-react";

const linkClass =
  "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground";

export function AppNav() {
  return (
    <nav className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
      <Link
        to="/"
        className={linkClass}
        activeOptions={{ exact: true }}
        activeProps={{ className: "bg-accent text-accent-foreground" }}
      >
        <Hammer className="size-3.5" /> Regears
      </Link>
      <Link to="/party" className={linkClass} activeProps={{ className: "bg-accent text-accent-foreground" }}>
        <Users className="size-3.5" /> Party Builds
      </Link>
    </nav>
  );
}
