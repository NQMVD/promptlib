import { storage } from "@/lib/storage"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await storage.getPromptById(id)
    if (!data) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = await storage.updatePrompt(id, {
      title: body.title,
      content: body.content,
    })
    if (!data) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const success = await storage.deletePrompt(id)
    if (!success) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
