import sys
import asyncio
import edge_tts
import argparse
import json
import os

async def generate_audio(text, output_path, voice="zh-CN-XiaoxiaoNeural", rate="+0%", volume="+0%", pitch="+0Hz"):
    communicate = edge_tts.Communicate(text, voice, rate=rate, volume=volume, pitch=pitch)
    await communicate.save(output_path)
    print(f"SUCCESS: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--text-file", required=True, help="Path to text file")
    parser.add_argument("--output", required=True, help="Output audio file path")
    parser.add_argument("--voice", default="zh-CN-XiaoxiaoNeural", help="Voice name")
    parser.add_argument("--config", help="JSON config file with rate/volume/pitch")
    
    args = parser.parse_args()
    
    rate = "+0%"
    volume = "+0%"
    pitch = "+0Hz"
    
    if args.config and os.path.exists(args.config):
        with open(args.config, 'r', encoding='utf-8') as f:
            config = json.load(f)
            if 'rate' in config:
                r = config['rate']
                rate = f"+{r}%" if r >= 0 else f"{r}%"
            if 'volume' in config:
                v = config['volume']
                volume = f"+{v}%" if v >= 0 else f"{v}%"
            if 'pitch' in config:
                p = config['pitch']
                pitch = f"+{p}Hz" if p >= 0 else f"{p}Hz"
    
    with open(args.text_file, 'r', encoding='utf-8') as f:
        text = f.read()
    
    asyncio.run(generate_audio(text, args.output, args.voice, rate, volume, pitch))
