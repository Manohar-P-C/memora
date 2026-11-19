import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'memora_store.json');

function readLocalStore() {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { files: [], memories: [], important_dates: [], tags: [], entities: [] };
  }
}

function writeLocalStore(data: object) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Memory ID is required' }, { status: 400 });
  }

  try {
    // --- Supabase path ---
    if (supabase) {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', id);

      if (!error) {
        return NextResponse.json({ success: true, deleted_id: id });
      }
      // Fall through to local on error
    }

    // --- Local store path ---
    const store = readLocalStore();

    const memoryIndex = store.memories.findIndex((m: any) => m.id === id);
    if (memoryIndex === -1) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    const memory = store.memories[memoryIndex];

    // Also delete the uploaded file from disk if it exists
    if (memory.source_file_id) {
      const fileRecord = store.files.find((f: any) => f.id === memory.source_file_id);
      if (fileRecord?.storage_path) {
        const uploadsDir = path.join(DATA_DIR, 'uploads');
        const fileName = path.basename(fileRecord.storage_path);
        const filePath = path.join(uploadsDir, fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        // Remove file record
        store.files = store.files.filter((f: any) => f.id !== memory.source_file_id);
      }
    }

    // Remove related records
    store.important_dates = store.important_dates.filter((d: any) => d.memory_id !== id);
    store.tags = store.tags.filter((t: any) => t.memory_id !== id);
    store.entities = store.entities.filter((e: any) => e.memory_id !== id);

    // Remove memory itself
    store.memories.splice(memoryIndex, 1);

    writeLocalStore(store);

    return NextResponse.json({ success: true, deleted_id: id });
  } catch (err: any) {
    console.error('Delete memory error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to delete memory' },
      { status: 500 }
    );
  }
}
