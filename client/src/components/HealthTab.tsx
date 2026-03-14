import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function HealthTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2"><Heart className="w-5 h-5" /> Health</h2>
      <Card><CardContent className="p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">Coming Soon</p>
        <p className="text-sm mt-1">Public health systems and healthcare access metrics will be available here.</p>
      </CardContent></Card>
    </div>
  );
}
