import { NextRequest, NextResponse } from "next/server";
import { POST as cancelAdminSub } from "@/app/api/admin/subscriptions/cancel/route";

export async function POST(req: NextRequest) {
  return cancelAdminSub(req);
}
