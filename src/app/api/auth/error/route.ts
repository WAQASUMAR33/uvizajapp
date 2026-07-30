import { redirect } from "next/navigation";

export async function GET() {
  redirect("/not-found");
}

export async function POST() {
  redirect("/not-found");
}
