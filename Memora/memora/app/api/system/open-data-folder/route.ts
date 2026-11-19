import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const dataDir = path.join(process.cwd(), '.data');

    // Create .data dir if it somehow doesn't exist yet
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const isWindows = process.platform === 'win32';
    const isMac = process.platform === 'darwin';

    let cmd = '';
    if (isWindows) {
      cmd = `explorer.exe "${dataDir}"`;
    } else if (isMac) {
      cmd = `open "${dataDir}"`;
    } else {
      cmd = `xdg-open "${dataDir}"`;
    }

    exec(cmd, (err) => {
      if (err) console.warn('Open data folder warning:', err.message);
    });

    return NextResponse.json({
      success: true,
      path: dataDir,
      message: 'Data folder opened in File Explorer',
    });
  } catch (err: any) {
    console.error('Open data folder error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to open data folder' },
      { status: 500 }
    );
  }
}
