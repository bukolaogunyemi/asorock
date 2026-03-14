import { HardHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function InfrastructureTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2"><HardHat className="w-5 h-5" /> Infrastructure</h2>
      <Card><CardContent className="p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">Coming Soon</p>
        <p className="text-sm mt-1">National infrastructure projects and development tracking will be available here.</p>
      </CardContent></Card>
    </div>
  );
}
