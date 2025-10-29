import { NextResponse } from 'next/server';
import { vhcRepo } from '@/lib/vhc/mockRepo';

export async function GET() {
  const tpl = vhcRepo.getActiveTemplate();
  if (!tpl)
    return NextResponse.json({ error: 'No active template' }, { status: 404 });
  return NextResponse.json(tpl);
}
