import { Newspaper, Megaphone, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MediaHubProps {
  onSelectSubTab: (id: string) => void;
}

const DOMAINS = [
  { id: "news", label: "News", icon: Newspaper, description: "Media sentiment, headlines, and press narratives" },
  { id: "public-affairs", label: "Public Affairs", icon: Megaphone, description: "Regional approval, public engagement, and zonal dynamics" },
  { id: "social-media", label: "Social Media", icon: Share2, description: "Online discourse, trending topics, and digital sentiment" },
];

export default function MediaHub({ onSelectSubTab }: MediaHubProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Media</h2>
        <p className="text-sm text-muted-foreground">Public communication, press, and digital presence</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOMAINS.map((domain) => {
          const Icon = domain.icon;
          return (
            <Card key={domain.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onSelectSubTab(domain.id)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{domain.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{domain.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
