#!/usr/bin/env python3
"""Render two-host QntDesk episodes with Microsoft neural voices via edge-tts."""

from __future__ import annotations

import asyncio
import json
import re
import subprocess
import tempfile
from pathlib import Path

import edge_tts

ROOT = Path("/workspace")
OUT = ROOT / "public/podcast/audio"
DATA = Path("/tmp/qntdesk-podcast.json")

VOICES = {
    "James Hale": "en-GB-RyanNeural",
    "Amelia Crowe": "en-GB-SoniaNeural",
}

RATE = {
    "James Hale": "+9%",
    "Amelia Crowe": "+7%",
}


def lines_of(script: str) -> list[tuple[str, str]]:
    parts: list[tuple[str, str]] = []
    current = "James Hale"
    buf: list[str] = []
    for raw in script.splitlines():
        line = raw.strip()
        if not line:
            continue
        m = re.match(r"^(James Hale|Amelia Crowe):\s*(.*)$", line)
        if m:
            if buf:
                parts.append((current, " ".join(buf)))
                buf = []
            current = m.group(1)
            rest = m.group(2).strip()
            if rest:
                buf.append(rest)
        else:
            buf.append(line)
    if buf:
        parts.append((current, " ".join(buf)))
    return parts


async def speak(text: str, voice: str, rate: str, dest: Path) -> None:
    comm = edge_tts.Communicate(text, voice, rate=rate)
    await comm.save(str(dest))


async def render_episode(ep: dict) -> None:
    dest = OUT / f"{ep['slug']}.mp3"
    parts = lines_of(ep["script"])
    if not parts:
        raise SystemExit(f"empty script {ep['slug']}")
    with tempfile.TemporaryDirectory() as tmp:
        tmp_p = Path(tmp)
        files: list[Path] = []
        silence = tmp_p / "silence.wav"
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-f",
                "lavfi",
                "-i",
                "anullsrc=r=44100:cl=stereo",
                "-t",
                "0.22",
                str(silence),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        for i, (who, text) in enumerate(parts):
            clip = tmp_p / f"{i:03d}.mp3"
            await speak(text, VOICES[who], RATE[who], clip)
            files.append(clip)
            if i < len(parts) - 1:
                files.append(silence)
        concat = tmp_p / "list.txt"
        concat.write_text("".join(f"file '{p}'\n" for p in files))
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(concat),
                "-c:a",
                "libmp3lame",
                "-b:a",
                "192k",
                "-ar",
                "44100",
                "-ac",
                "2",
                str(dest),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    print("ok", ep["n"], dest.name, dest.stat().st_size, flush=True)


async def main() -> None:
    episodes = json.loads(DATA.read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    for ep in episodes:
        await render_episode(ep)


if __name__ == "__main__":
    asyncio.run(main())
