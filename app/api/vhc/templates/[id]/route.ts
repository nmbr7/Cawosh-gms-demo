import { NextResponse } from 'next/server';
import { vhcRepo } from '@/lib/vhc/mockRepo';

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const id = segments[segments.length - 1];

  const template = vhcRepo.getTemplate(id);
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  return NextResponse.json(template);
}
