import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

const GLOBAL_WHERE = { scope: "global", userId: "" }

async function getOrCreateSettings() {
  let s = await db.aiSetting.findUnique({ where: { scope_userId: GLOBAL_WHERE } })
  if (!s) {
    s = await db.aiSetting.create({ data: { scope: "global", userId: "" } })
  }
  return s
}

export async function GET() {
  const s = await getOrCreateSettings()
  let customModels: string[] = []
  if (s.customModels) {
    try {
      customModels = JSON.parse(s.customModels)
    } catch {
      customModels = []
    }
  }
  return NextResponse.json({ customModels })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const s = await getOrCreateSettings()
  
  let customModels: string[] = []
  if (s.customModels) {
    try {
      customModels = JSON.parse(s.customModels)
    } catch {
      customModels = []
    }
  }
  
  const modelName = body.model?.trim()
  if (!modelName) {
    return NextResponse.json({ error: "Model nomi kerak" }, { status: 400 })
  }
  
  if (!customModels.includes(modelName)) {
    customModels.push(modelName)
    await db.aiSetting.update({
      where: { id: s.id },
      data: { customModels: JSON.stringify(customModels) },
    })
  }
  
  return NextResponse.json({ customModels })
}

export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const s = await getOrCreateSettings()
  
  let customModels: string[] = []
  if (s.customModels) {
    try {
      customModels = JSON.parse(s.customModels)
    } catch {
      customModels = []
    }
  }
  
  const modelName = body.model
  if (modelName) {
    customModels = customModels.filter((m) => m !== modelName)
    await db.aiSetting.update({
      where: { id: s.id },
      data: { customModels: JSON.stringify(customModels) },
    })
  }
  
  return NextResponse.json({ customModels })
}
