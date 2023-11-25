import { getGroupById } from "@/lib/groups/getGroupById"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const groupId = searchParams.get("groupId")?.toString()

  if (!groupId) return NextResponse.json({})

  const group = await getGroupById(groupId)

  if (!group) return NextResponse.json({})

  return NextResponse.json({ theme: group.theme })
}
