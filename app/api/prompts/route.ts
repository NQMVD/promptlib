import { storage } from "@/lib/storage"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await storage.getPrompts()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await storage.createPrompt({
      title: body.title,
      content: body.content,
      parent_id: body.parent_id || null,
      variant_type: body.variant_type || "base",
    })
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
