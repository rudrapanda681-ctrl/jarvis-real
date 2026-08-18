# JARVIS Real V1

This is the first REAL voice architecture, not a fake static chatbot.

## What it uses
- Browser microphone + WebRTC
- OpenAI Realtime API for speech-to-speech
- Secure server-side API key
- Natural multilingual conversation instructions
- Semantic turn detection + interruption
- JARVIS persona

OpenAI documents the Realtime API as a low-latency speech-to-speech interface over WebRTC/WebSocket/SIP, and recommends the `marin` or `cedar` voices for quality. API keys must remain server-side, not in browser code.

## Run
1. Install Node.js 20+
2. Copy `.env.example` to `.env`
3. Put your OpenAI API key in `.env`
4. Run `npm install`
5. Run `npm start`
6. Open http://localhost:3000
7. Tap Connect JARVIS and allow microphone

Do NOT put the API key in `public/index.html`.

This V1 is intentionally focused on getting the core realtime voice conversation working correctly before adding persistent cloud memory and tool actions.
