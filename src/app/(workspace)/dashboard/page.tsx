import { PageShell } from "@/components/layout/page-shell";
import { DashboardView } from "./dashboard-view";

export default function DashboardPage() {
  return (
    <PageShell
      title="Dashboard"
      description="Your creative command center"
    >
      <DashboardView />
    </PageShell>
  );
}
