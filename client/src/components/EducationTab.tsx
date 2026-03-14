import { GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EducationTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Education</h2>
      <Card><CardContent className="p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">Coming Soon</p>
        <p className="text-sm mt-1">Education policy and institutional development tracking will be available here.</p>
      </CardContent></Card>
    </div>
  );
}
