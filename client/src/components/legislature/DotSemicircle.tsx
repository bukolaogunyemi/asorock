import { useRef, useEffect, useCallback } from "react";
import type { VoteProjection } from "@/lib/legislativeTypes";

interface PartyBloc {
  name: string;
  seats: number;
  color: string;
}

interface DotSemicircleProps {
  totalSeats: number;
  blocs: PartyBloc[];
  /** When provided, dots render in vote-projection colors instead of party colors */
  voteProjection?: VoteProjection;
  width?: number;
  height?: number;
}

const VOTE_COLORS = {
  firmYes: "#22c55e",
  leaningYes: "#86efac",
  undecided: "#d1d5db",
  leaningNo: "#fb923c",
  firmNo: "#ef4444",
};

export function DotSemicircle({
  totalSeats,
  blocs,
  voteProjection,
  width = 280,
  height = 150,
}: DotSemicircleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height - 5;
    const dotRadius = totalSeats > 200 ? 3 : 4;
    const rows = totalSeats > 200 ? 8 : 5;
    const minR = 35;
    const maxR = Math.min(centerX - 10, centerY - 10);

    // Build color array
    let seatColors: string[];
    if (voteProjection) {
      seatColors = [];
      const vp = voteProjection;
      for (let i = 0; i < vp.firmYes; i++) seatColors.push(VOTE_COLORS.firmYes);
      for (let i = 0; i < vp.leaningYes; i++) seatColors.push(VOTE_COLORS.leaningYes);
      for (let i = 0; i < vp.undecided; i++) seatColors.push(VOTE_COLORS.undecided);
      for (let i = 0; i < vp.leaningNo; i++) seatColors.push(VOTE_COLORS.leaningNo);
      for (let i = 0; i < vp.firmNo; i++) seatColors.push(VOTE_COLORS.firmNo);
    } else {
      seatColors = [];
      for (const bloc of blocs) {
        for (let i = 0; i < bloc.seats; i++) seatColors.push(bloc.color);
      }
    }

    // Distribute seats across rows
    let seatIndex = 0;
    for (let row = 0; row < rows && seatIndex < seatColors.length; row++) {
      const rowR = minR + (maxR - minR) * (row / (rows - 1));
      const circumference = Math.PI * rowR;
      const seatsInRow = Math.min(
        Math.floor(circumference / (dotRadius * 2.4)),
        seatColors.length - seatIndex,
      );

      for (let s = 0; s < seatsInRow && seatIndex < seatColors.length; s++) {
        const angle = Math.PI - (Math.PI * (s + 0.5)) / seatsInRow;
        const x = centerX + rowR * Math.cos(angle);
        const y = centerY - rowR * Math.sin(angle);

        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = seatColors[seatIndex];
        ctx.fill();
        seatIndex++;
      }
    }
  }, [totalSeats, blocs, voteProjection, width, height]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="block mx-auto"
    />
  );
}

export const HOUSE_BLOCS: PartyBloc[] = [
  { name: "Core Ruling", seats: 145, color: "#166534" },
  { name: "Ruling Allies", seats: 56, color: "#4ade80" },
  { name: "Independents", seats: 5, color: "#94a3b8" },
  { name: "Opp. Moderates", seats: 34, color: "#f97316" },
  { name: "Main Opposition", seats: 120, color: "#dc2626" },
];

export const SENATE_BLOCS: PartyBloc[] = [
  { name: "Core Ruling", seats: 56, color: "#166534" },
  { name: "Ruling Allies", seats: 22, color: "#4ade80" },
  { name: "Independents", seats: 2, color: "#94a3b8" },
  { name: "Opp. Moderates", seats: 7, color: "#f97316" },
  { name: "Main Opposition", seats: 22, color: "#dc2626" },
];
