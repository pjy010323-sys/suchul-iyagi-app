# 캐릭터 웅얼웅얼 목소리(동물의 숲 스타일)와 배경 비트를 직접 합성한다. 외부 음원 없음.
import json, math, random, struct, sys, wave

SR = 48000
out_dir = sys.argv[1]
lines = json.load(open(sys.argv[2]))

def write(path, samples):
    with wave.open(path, 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, s)) * 32000)) for s in samples))

def units(text):
    return [c for c in text if c.isalnum()]

for i, ln in enumerate(lines):
    rnd = random.Random(i * 7 + 3)
    base = 165 if ln['who'] == 'doc' else 300
    syl = 0.1  # 한 글자 = 0.1초 (영상 3프레임과 맞춤)
    out = []
    n = len(units(ln['text']))
    for k in range(n):
        f = base * (1 + rnd.uniform(-0.22, 0.3))
        if k == n - 1 and ln['text'].rstrip().endswith(('?', '?!', '!?')):
            f *= 1.25  # 질문 끝은 올려서
        L = int(SR * syl)
        for t in range(L):
            x = t / SR
            env = min(1, x / 0.006) * math.exp(-x * 18)
            ph = 2 * math.pi * f * x
            s = 0.55 * math.sin(ph) + 0.25 * math.sin(2 * ph) + 0.12 * math.sin(3.02 * ph)
            out.append(0.6 * env * s)
    write(f"{out_dir}/L{i}.wav", out)

# 배경 비트: 120BPM, 30초 (킥 + 하이햇 + 베이스)
dur, bpm = 30.0, 120
beat = 60 / bpm
N = int(SR * dur)
bass_notes = [55, 55, 65.4, 49]
rnd = random.Random(1)
bgm = [0.0] * N
for b in range(int(dur / beat)):
    st = int(b * beat * SR)
    for t in range(int(0.25 * SR)):  # 킥
        if st + t >= N: break
        x = t / SR
        bgm[st + t] += 0.8 * math.sin(2 * math.pi * (50 + 120 * math.exp(-x * 40)) * x) * math.exp(-x * 14)
    hs = int((b + 0.5) * beat * SR)
    for t in range(int(0.05 * SR)):  # 하이햇
        if hs + t >= N: break
        bgm[hs + t] += 0.18 * (rnd.random() * 2 - 1) * math.exp(-t / SR * 90)
    f = bass_notes[(b // 4) % 4]
    for t in range(int(beat * 0.9 * SR)):  # 베이스
        if st + t >= N: break
        x = t / SR
        bgm[st + t] += 0.22 * math.sin(2 * math.pi * f * x) * math.exp(-x * 2.5)
write(f"{out_dir}/bgm.wav", [s * 0.7 for s in bgm])
print('ok', len(lines), 'lines')
