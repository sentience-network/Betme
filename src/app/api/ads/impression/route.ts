import { NextResponse } from "next/server";
import { accrueImpressionRevenue } from "@/lib/ads.server";

// Records an ad impression served on a prediction and distributes its revenue
// share to the creator and participants. Called by the AdSlot component when an
// ad unit is displayed on a prediction page.
export async function POST(request: Request) {
  const { predictionId } = await request.json().catch(() => ({}));
  if (!predictionId || typeof predictionId !== "string") {
    return NextResponse.json({ error: "predictionId is required" }, { status: 400 });
  }
  const result = await accrueImpressionRevenue(predictionId);
  return NextResponse.json({ ok: true, ...result });
}
