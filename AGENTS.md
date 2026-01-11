# Wisper Pro - AI Voice-to-Text Desktop App

A Tauri v2 desktop application for macOS with real-time voice transcription, AI polishing, and menubar widget.

## Core Commands

- Dev server: `yarn dev` (starts Vite frontend)
- Tauri dev: `yarn tauri dev` (runs full Tauri app with hot reload)
- Build: `yarn build` (TypeScript + Vite build)
- Tauri build: `yarn tauri build` (production macOS app)
- Type check: `tsc --noEmit`

## Project Layout

```
├── src/                    → React + TypeScript frontend
│   ├── components/         → Reusable UI components
│   │   ├── ui/            → Base UI components
│   │   ├── layout/        → Layout components (Sidebar, etc.)
│   │   ├── menubar/       → Menubar widget components
│   │   └── recording/     → Recording-related components
│   ├── pages/             → Full page components
│   ├── stores/            → Zustand state stores
│   ├── hooks/             → Custom React hooks
│   ├── lib/               → Utilities and API clients
│   ├── types/             → TypeScript types
│   └── styles/            → Global styles
├── src-tauri/             → Rust backend
│   ├── src/
│   │   ├── api/           → External API integrations (Groq, OpenAI, etc.)
│   │   ├── audio/         → Audio recording & processing
│   │   ├── commands/      → Tauri commands
│   │   ├── tray/          → System tray handling
│   │   └── utils/         → Rust utilities
│   ├── Cargo.toml
│   └── tauri.conf.json
├── docs/                   → Project documentation
│   └── DEVELOPMENT_PHASES.md → 8-phase development roadmap
└── public/                 → Static assets
```

## Development Patterns & Constraints

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Zustand, Framer Motion
- **Backend**: Tauri v2, Rust
- **Audio**: cpal (capture), hound (WAV), opus (compression)
- **APIs**: Groq Whisper, OpenAI Whisper, Deepgram Nova-3, Gemini Flash

### Coding Style
- TypeScript strict mode enabled
- Use functional React components with hooks
- State management via Zustand stores
- Styling with TailwindCSS utility classes
- Dark theme throughout (gray-900/950 backgrounds)
- Use `clsx` for conditional class names
- Icons from `lucide-react`

### Tauri Conventions
- Commands in `src-tauri/src/commands/`
- Use `#[tauri::command]` for frontend-callable functions
- Events via `app.emit()` for Rust → Frontend communication
- Plugins configured in `tauri.conf.json`

## Key Features (Per Phase)

1. **Phase 1**: Project foundation, Tauri setup, TailwindCSS
2. **Phase 2**: Menubar widget with waveform visualization
3. **Phase 3**: Audio recording with silence detection
4. **Phase 4**: Transcription APIs (Groq, OpenAI, Deepgram)
5. **Phase 5**: Main app UI (Dashboard, Settings, Dictionary)
6. **Phase 6**: Voice commands, snippets, notes
7. **Phase 7**: Team features, backend integration
8. **Phase 8**: Polish, testing, distribution

## External Services

- **Groq API**: Whisper transcription + Llama polishing (free tier)
- **OpenAI API**: Whisper-1 transcription, GPT-4o-mini polishing
- **Deepgram API**: Nova-3 transcription
- **Gemini API**: Flash polishing (free tier)

## Gotchas

- macOS requires `entitlements.plist` for audio capture permissions
- Menubar window needs `decorations: false`, `transparent: true`, `alwaysOnTop: true`
- Global shortcuts require `tauri-plugin-global-shortcut`
- API keys stored securely via `keyring` crate (macOS Keychain)
- Audio sample rate: 16kHz mono for Whisper compatibility

## Git Workflow

1. Branch from `main` with descriptive names
2. Run type check before committing
3. Keep commits atomic with clear messages
4. Reference development phase in PR descriptions
