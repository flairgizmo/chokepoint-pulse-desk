#!/bin/sh
set -eu
cd /workspace
mkdir -p public/podcast/audio
npx --yes tsx -e "
import { writeFileSync } from 'node:fs';
import { EPISODES, HOSTS } from './src/data/podcast.ts';
writeFileSync('/tmp/qntdesk-episodes.json', JSON.stringify(EPISODES.map((e) => ({
  n: e.n,
  voice: HOSTS[e.host].voice,
  script: e.script,
}))));
"
python3 - <<'PY'
import json, subprocess, os
from pathlib import Path

rows = json.loads(Path("/tmp/qntdesk-episodes.json").read_text())
out_dir = Path("/workspace/public/podcast/audio")
out_dir.mkdir(parents=True, exist_ok=True)
piper = "/tmp/piper/piper"
voices = Path("/tmp/piper-voices")
models = {
    "alan": voices / "en_GB-alan-medium.onnx",
    "cori": voices / "en_GB-cori-high.onnx",
}

for row in rows:
    n = int(row["n"])
    mp3 = out_dir / f"ep-{n:02d}.mp3"
    wav = Path(f"/tmp/qntdesk-ep-{n:02d}.wav")
    force = os.environ.get("FORCE_PODCAST") == "1"
    if not force and mp3.exists() and mp3.stat().st_size > 80_000:
        print(f"skip {mp3.name}", flush=True)
        continue
    model = models[row["voice"]]
    print(f"render {mp3.name} ({row['voice']})", flush=True)
    subprocess.run(
        [piper, "-m", str(model), "-f", str(wav), "--sentence_silence", "0.44", "--length_scale", "1.08"],
        input=row["script"].encode("utf-8"),
        check=True,
    )
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(wav), "-codec:a", "libmp3lame", "-b:a", "64k", "-ac", "1", str(mp3)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    wav.unlink(missing_ok=True)
    print(f"done {mp3.name} {mp3.stat().st_size}", flush=True)
PY
ls -lh /workspace/public/podcast/audio
