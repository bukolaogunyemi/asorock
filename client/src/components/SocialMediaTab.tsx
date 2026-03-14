import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { useGame } from "@/lib/GameContext";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
} from "lucide-react";

const socialSentimentBadge = (sentiment: string) => {
  if (sentiment === "Negative") return "destructive" as const;
  if (sentiment === "Positive") return "default" as const;
  return "secondary" as const;
};

export default function SocialMediaTab() {
  const { state } = useGame();

  const socialFeed = useMemo(() => {
    const seeds = [...state.turnLog].slice(-5).reverse();
    if (seeds.length === 0) {
      return [
        {
          id: "fallback-feed",
          handle: "@AsoRockWatch",
          name: "Aso Rock Watch",
          avatar: "AW",
          text: "Quiet cycles do not last in Abuja. The next decision will define the next headline.",
          likes: "2.4K",
          reposts: "1.1K",
          replies: "280",
          sentiment: "Neutral",
        },
      ];
    }

    return seeds.map((entry, index) => {
      const negative = /crisis|betrayal|anger|warning|fragile|strike/i.test(`${entry.event} ${entry.effects.join(" ")}`);
      const positive = /steady|calm|reform|restored|improves|goodwill/i.test(`${entry.event} ${entry.effects.join(" ")}`);
      return {
        id: `${entry.day}-${index}`,
        handle: ["@NaijaPulse", "@AsoVilla_NG", "@CivicLedger", "@PolicyDeskNG", "@StateHouseBeat"][index % 5],
        name: ["Naija Pulse", "Aso Villa", "Civic Ledger", "Policy Desk", "State House Beat"][index % 5],
        avatar: ["NP", "AV", "CL", "PD", "SB"][index % 5],
        text: `${entry.event}: ${entry.effects[0] ?? "The room is waiting for the presidency to shape the story."}`,
        likes: `${3 + index * 4}.${index + 1}K`,
        reposts: `${1 + index * 2}.${index + 3}K`,
        replies: `${280 + index * 140}`,
        sentiment: negative ? "Negative" : positive ? "Positive" : "Neutral",
      };
    });
  }, [state.turnLog]);

  return (
    <div className="space-y-4">
      <Card className="border border-border" data-testid="social-media-feed-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Social Feed</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          {socialFeed.map((post) => (
            <div key={post.id} className="border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-start gap-2.5">
                <CharacterAvatar name={post.name} initials={post.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold">{post.name}</span>
                    <span className="text-xs text-muted-foreground">{post.handle}</span>
                    <Badge variant={socialSentimentBadge(post.sentiment)} className="text-xs ml-auto">
                      {post.sentiment}
                    </Badge>
                  </div>
                  <p className="text-xs mt-1">{post.text}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageCircle className="h-3 w-3" /> {post.replies}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Repeat2 className="h-3 w-3" /> {post.reposts}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Share className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
