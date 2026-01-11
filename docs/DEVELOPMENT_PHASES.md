# Wishper Pro - Development Phases

> Detailed development roadmap excluding Laravel backend

---

## Phase 1: Project Foundation (Week 1)

### 1.1 Tauri Project Setup
- [ ] Initialize Tauri v2 project with React + TypeScript
- [ ] Configure Vite for development
- [ ] Setup project structure:
  ```
  desktop-app/
  ├── src-tauri/
  │   ├── src/
  │   │   ├── main.rs
  │   │   └── lib.rs
  │   ├── Cargo.toml
  │   ├── tauri.conf.json
  │   └── capabilities/
  ├── src/
  │   ├── App.tsx
  │   ├── main.tsx
  │   └── index.css
  ├── package.json
  ├── tsconfig.json
  └── vite.config.ts
  ```

### 1.2 Dependencies Installation

**Rust (Cargo.toml):**
```toml
[dependencies]
tauri = { version = "2", features = ["tray-icon", "macos-private-api"] }
tauri-plugin-global-shortcut = "2"
tauri-plugin-shell = "2"
tauri-plugin-store = "2"
tauri-plugin-http = "2"
tauri-plugin-notification = "2"
tauri-plugin-clipboard-manager = "2"
tauri-plugin-os = "2"
tauri-plugin-process = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
cpal = "0.15"           # Audio capture
hound = "3.5"           # WAV encoding
opus = "0.3"            # Audio compression
reqwest = { version = "0.11", features = ["json", "multipart"] }
keyring = "2"           # Secure credential storage
cocoa = "0.25"          # macOS APIs
objc = "0.2"            # Objective-C runtime
```

**React (package.json):**
```json
{
  "dependencies": {
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-global-shortcut": "^2.0.0",
    "@tauri-apps/plugin-store": "^2.0.0",
    "@tauri-apps/plugin-clipboard-manager": "^2.0.0",
    "@tauri-apps/plugin-notification": "^2.0.0",
    "@tauri-apps/plugin-http": "^2.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.0",
    "lucide-react": "^0.294.0",
    "tailwindcss": "^3.4.0",
    "framer-motion": "^10.16.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### 1.3 Tauri Configuration

**tauri.conf.json:**
```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Wishper Pro",
  "version": "0.1.0",
  "identifier": "com.wishper.pro",
  "build": {
    "frontendDist": "../dist"
  },
  "app": {
    "trayIcon": {
      "iconPath": "icons/tray.png",
      "iconAsTemplate": true
    },
    "windows": [
      {
        "label": "main",
        "title": "Wishper Pro",
        "width": 1000,
        "height": 700,
        "minWidth": 800,
        "minHeight": 600,
        "center": true,
        "visible": false,
        "decorations": true,
        "transparent": false
      },
      {
        "label": "menubar",
        "title": "Wishper",
        "width": 320,
        "height": 400,
        "visible": false,
        "decorations": false,
        "transparent": true,
        "alwaysOnTop": true,
        "skipTaskbar": true,
        "resizable": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "icon": ["icons/icon.icns"],
    "macOS": {
      "minimumSystemVersion": "12.0",
      "entitlements": "./entitlements.plist"
    }
  },
  "plugins": {
    "global-shortcut": {},
    "store": {},
    "clipboard-manager": {},
    "notification": {},
    "http": {
      "scope": ["https://*"]
    }
  }
}
```

### 1.4 macOS Entitlements

**entitlements.plist:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.audio-capture</key>
    <true/>
    <key>com.apple.security.device.audio-input</key>
    <true/>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
</dict>
</plist>
```

### 1.5 Project Structure Setup

Create folder structure:
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   ├── menubar/         # Menubar widget components
│   └── recording/       # Recording-related components
├── pages/               # Full page components
├── stores/              # Zustand state stores
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and API clients
├── types/               # TypeScript types
└── styles/              # Global styles

src-tauri/src/
├── api/                 # External API integrations
├── audio/               # Audio recording & processing
├── commands/            # Tauri commands
├── tray/                # System tray handling
└── utils/               # Rust utilities
```

### 1.6 Deliverables
- [ ] Running Tauri app with hot reload
- [ ] Basic window management (main + menubar)
- [ ] System tray icon visible
- [ ] TailwindCSS configured
- [ ] TypeScript strict mode enabled
- [ ] Basic routing setup

---

## Phase 2: Menubar Widget (Week 1-2)

### 2.1 System Tray Implementation

**src-tauri/src/tray/mod.rs:**
```rust
use tauri::{
    AppHandle, Manager, Runtime,
    tray::{TrayIcon, TrayIconBuilder, MouseButton, MouseButtonState},
    menu::{Menu, MenuItem},
};

pub fn setup_tray<R: Runtime>(app: &AppHandle<R>) -> Result<TrayIcon<R>, tauri::Error> {
    let quit = MenuItem::with_id(app, "quit", "Quit Wishper", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "Settings...", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&settings, &quit])?;

    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .on_menu_event(|app, event| {
            match event.id.as_ref() {
                "quit" => app.exit(0),
                "settings" => {
                    if let Some(window) = app.get_webview_window("main") {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let tauri::tray::TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event {
                let app = tray.app_handle();
                toggle_menubar_window(app);
            }
        })
        .build(app)
}

fn toggle_menubar_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window("menubar") {
        if window.is_visible().unwrap_or(false) {
            window.hide().unwrap();
        } else {
            position_menubar_window(&window);
            window.show().unwrap();
            window.set_focus().unwrap();
        }
    }
}

fn position_menubar_window<R: Runtime>(window: &tauri::WebviewWindow<R>) {
    // Position below the tray icon
    // Implementation depends on getting tray icon position
}
```

### 2.2 Menubar Window Component

**src/components/menubar/MenubarWidget.tsx:**
```tsx
import { useState, useEffect } from 'react';
import { Mic, MicOff, Settings, Copy, Check } from 'lucide-react';
import { useRecordingStore } from '@/stores/recordingStore';
import { Waveform } from './Waveform';
import { Timer } from './Timer';
import { LiveText } from './LiveText';
import { StyleSwitcher } from './StyleSwitcher';

export function MenubarWidget() {
  const { 
    isRecording, 
    isPaused,
    currentText,
    lastTranscription,
    startRecording,
    stopRecording,
    elapsedTime
  } = useRecordingStore();
  
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (lastTranscription) {
      await navigator.clipboard.writeText(lastTranscription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-80 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-sm text-gray-300">
            {isRecording ? 'Recording...' : 'Ready'}
          </span>
        </div>
        {isRecording && <Timer seconds={elapsedTime} />}
      </div>

      {/* Recording Area */}
      <div className="p-4">
        {isRecording ? (
          <div className="space-y-4">
            <Waveform />
            <LiveText text={currentText} />
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm mb-2">Press ⌥ Space to record</p>
            <p className="text-gray-500 text-xs">or click the microphone</p>
          </div>
        )}
      </div>

      {/* Record Button */}
      <div className="px-4 pb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
            isRecording 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
          }`}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>

      {/* Style Switcher */}
      <div className="px-4 pb-4">
        <StyleSwitcher />
      </div>

      {/* Last Transcription */}
      {lastTranscription && (
        <div className="px-4 pb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Last transcription</span>
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-sm text-gray-300 line-clamp-3">{lastTranscription}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-700/50 flex justify-between items-center">
        <span className="text-xs text-gray-500">23/30 mins used</span>
        <button className="text-gray-400 hover:text-white">
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
}
```

### 2.3 Waveform Visualization

**src/components/menubar/Waveform.tsx:**
```tsx
import { useEffect, useRef } from 'react';
import { useRecordingStore } from '@/stores/recordingStore';

export function Waveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioLevel } = useRecordingStore();
  const barsRef = useRef<number[]>(Array(32).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Shift bars left and add new value
    barsRef.current.shift();
    barsRef.current.push(audioLevel);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bars
    const barWidth = canvas.width / barsRef.current.length;
    const centerY = canvas.height / 2;

    barsRef.current.forEach((level, i) => {
      const height = level * canvas.height * 0.8;
      const x = i * barWidth;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, centerY - height/2, 0, centerY + height/2);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 1)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.8)');

      ctx.fillStyle = gradient;
      ctx.fillRect(x + 1, centerY - height/2, barWidth - 2, height);
    });
  }, [audioLevel]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={60}
      className="w-full h-15 rounded-lg bg-gray-800/30"
    />
  );
}
```

### 2.4 Timer Component

**src/components/menubar/Timer.tsx:**
```tsx
interface TimerProps {
  seconds: number;
}

export function Timer({ seconds }: TimerProps) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return (
    <span className="text-sm font-mono text-gray-400">
      {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
}
```

### 2.5 Live Text Preview

**src/components/menubar/LiveText.tsx:**
```tsx
import { motion, AnimatePresence } from 'framer-motion';

interface LiveTextProps {
  text: string;
}

export function LiveText({ text }: LiveTextProps) {
  return (
    <div className="min-h-[60px] bg-gray-800/30 rounded-lg p-3">
      <AnimatePresence mode="wait">
        {text ? (
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-200"
          >
            {text}
            <span className="animate-pulse">|</span>
          </motion.p>
        ) : (
          <p className="text-sm text-gray-500 italic">Listening...</p>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 2.6 Style Switcher

**src/components/menubar/StyleSwitcher.tsx:**
```tsx
import { useSettingsStore } from '@/stores/settingsStore';

const styles = [
  { id: 'formal', label: 'Formal', icon: '📝' },
  { id: 'casual', label: 'Casual', icon: '💬' },
  { id: 'extremely_casual', label: 'Chill', icon: '😎' },
] as const;

export function StyleSwitcher() {
  const { currentStyle, setStyle } = useSettingsStore();

  return (
    <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
      {styles.map((style) => (
        <button
          key={style.id}
          onClick={() => setStyle(style.id)}
          className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
            currentStyle === style.id
              ? 'bg-blue-500/20 text-blue-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span className="mr-1">{style.icon}</span>
          {style.label}
        </button>
      ))}
    </div>
  );
}
```

### 2.7 Deliverables
- [ ] Click tray icon toggles menubar popup
- [ ] Menubar positioned correctly below tray
- [ ] Waveform animation during recording
- [ ] Live text preview updates
- [ ] Timer counts up during recording
- [ ] Style switcher works
- [ ] Copy last transcription button
- [ ] Click outside closes menubar
- [ ] Smooth animations with Framer Motion

---

## Phase 3: Audio Recording System (Week 2)

### 3.1 Audio Recorder (Rust)

**src-tauri/src/audio/recorder.rs:**
```rust
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};
use tokio::sync::mpsc;

pub struct AudioRecorder {
    is_recording: Arc<AtomicBool>,
    audio_data: Arc<Mutex<Vec<f32>>>,
    sample_rate: u32,
}

impl AudioRecorder {
    pub fn new() -> Self {
        Self {
            is_recording: Arc::new(AtomicBool::new(false)),
            audio_data: Arc::new(Mutex::new(Vec::new())),
            sample_rate: 16000,
        }
    }

    pub fn start(&self, level_tx: mpsc::Sender<f32>) -> Result<(), String> {
        let host = cpal::default_host();
        let device = host.default_input_device()
            .ok_or("No input device available")?;
        
        let config = cpal::StreamConfig {
            channels: 1,
            sample_rate: cpal::SampleRate(self.sample_rate),
            buffer_size: cpal::BufferSize::Default,
        };

        self.is_recording.store(true, Ordering::SeqCst);
        let is_recording = self.is_recording.clone();
        let audio_data = self.audio_data.clone();

        let stream = device.build_input_stream(
            &config,
            move |data: &[f32], _: &cpal::InputCallbackInfo| {
                if !is_recording.load(Ordering::SeqCst) {
                    return;
                }

                // Store audio data
                if let Ok(mut buffer) = audio_data.lock() {
                    buffer.extend_from_slice(data);
                }

                // Calculate audio level for visualization
                let level = calculate_rms_level(data);
                let _ = level_tx.try_send(level);
            },
            |err| eprintln!("Audio stream error: {}", err),
            None,
        ).map_err(|e| e.to_string())?;

        stream.play().map_err(|e| e.to_string())?;
        
        // Keep stream alive (store in struct in real implementation)
        std::mem::forget(stream);
        
        Ok(())
    }

    pub fn stop(&self) -> Vec<f32> {
        self.is_recording.store(false, Ordering::SeqCst);
        
        let mut buffer = self.audio_data.lock().unwrap();
        let data = buffer.clone();
        buffer.clear();
        data
    }

    pub fn is_recording(&self) -> bool {
        self.is_recording.load(Ordering::SeqCst)
    }
}

fn calculate_rms_level(samples: &[f32]) -> f32 {
    if samples.is_empty() {
        return 0.0;
    }
    let sum: f32 = samples.iter().map(|s| s * s).sum();
    (sum / samples.len() as f32).sqrt().min(1.0)
}
```

### 3.2 Silence Detection

**src-tauri/src/audio/silence.rs:**
```rust
use std::time::{Duration, Instant};

pub struct SilenceDetector {
    threshold: f32,
    duration: Duration,
    silent_since: Option<Instant>,
}

impl SilenceDetector {
    pub fn new(threshold: f32, duration_secs: f32) -> Self {
        Self {
            threshold,
            duration: Duration::from_secs_f32(duration_secs),
            silent_since: None,
        }
    }

    pub fn process(&mut self, level: f32) -> bool {
        if level < self.threshold {
            match self.silent_since {
                None => {
                    self.silent_since = Some(Instant::now());
                    false
                }
                Some(since) => {
                    since.elapsed() >= self.duration
                }
            }
        } else {
            self.silent_since = None;
            false
        }
    }

    pub fn reset(&mut self) {
        self.silent_since = None;
    }
}
```

### 3.3 Audio Compression (WAV/Opus)

**src-tauri/src/audio/compress.rs:**
```rust
use hound::{WavSpec, WavWriter};
use std::io::Cursor;

pub fn samples_to_wav(samples: &[f32], sample_rate: u32) -> Result<Vec<u8>, String> {
    let spec = WavSpec {
        channels: 1,
        sample_rate,
        bits_per_sample: 16,
        sample_format: hound::SampleFormat::Int,
    };

    let mut cursor = Cursor::new(Vec::new());
    {
        let mut writer = WavWriter::new(&mut cursor, spec)
            .map_err(|e| e.to_string())?;

        for sample in samples {
            let amplitude = (sample * i16::MAX as f32) as i16;
            writer.write_sample(amplitude).map_err(|e| e.to_string())?;
        }

        writer.finalize().map_err(|e| e.to_string())?;
    }

    Ok(cursor.into_inner())
}

// Optional: Opus compression for smaller file sizes
pub fn samples_to_opus(samples: &[f32], sample_rate: u32) -> Result<Vec<u8>, String> {
    // Opus encoding implementation
    // Reduces file size by ~10x compared to WAV
    todo!("Implement Opus encoding")
}
```

### 3.4 Tauri Commands for Recording

**src-tauri/src/commands/recording.rs:**
```rust
use tauri::{AppHandle, Manager, State};
use crate::audio::{AudioRecorder, SilenceDetector};
use tokio::sync::mpsc;

#[tauri::command]
pub async fn start_recording(
    app: AppHandle,
    recorder: State<'_, AudioRecorder>,
) -> Result<(), String> {
    let (tx, mut rx) = mpsc::channel::<f32>(100);
    
    recorder.start(tx)?;

    // Emit audio levels to frontend
    let app_clone = app.clone();
    tokio::spawn(async move {
        while let Some(level) = rx.recv().await {
            let _ = app_clone.emit("audio-level", level);
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn stop_recording(
    recorder: State<'_, AudioRecorder>,
) -> Result<Vec<u8>, String> {
    let samples = recorder.stop();
    let wav_data = crate::audio::compress::samples_to_wav(&samples, 16000)?;
    Ok(wav_data)
}

#[tauri::command]
pub fn is_recording(recorder: State<'_, AudioRecorder>) -> bool {
    recorder.is_recording()
}
```

### 3.5 Recording Store (Frontend)

**src/stores/recordingStore.ts:**
```typescript
import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  audioLevel: number;
  elapsedTime: number;
  currentText: string;
  lastTranscription: string | null;
  
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  setAudioLevel: (level: number) => void;
  setCurrentText: (text: string) => void;
  setLastTranscription: (text: string) => void;
}

export const useRecordingStore = create<RecordingState>((set, get) => {
  let timer: NodeJS.Timeout | null = null;
  let unlistenLevel: (() => void) | null = null;

  return {
    isRecording: false,
    isPaused: false,
    audioLevel: 0,
    elapsedTime: 0,
    currentText: '',
    lastTranscription: null,

    startRecording: async () => {
      try {
        await invoke('start_recording');
        
        set({ isRecording: true, elapsedTime: 0, currentText: '' });
        
        // Start timer
        timer = setInterval(() => {
          set((state) => ({ elapsedTime: state.elapsedTime + 1 }));
        }, 1000);

        // Listen for audio levels
        unlistenLevel = await listen<number>('audio-level', (event) => {
          set({ audioLevel: event.payload });
        });

      } catch (error) {
        console.error('Failed to start recording:', error);
      }
    },

    stopRecording: async () => {
      try {
        const audioData = await invoke<number[]>('stop_recording');
        
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        
        if (unlistenLevel) {
          unlistenLevel();
          unlistenLevel = null;
        }

        set({ isRecording: false, audioLevel: 0 });

        // Transcribe audio (will be implemented in Phase 4)
        // const text = await transcribeAudio(audioData);
        // set({ lastTranscription: text });

      } catch (error) {
        console.error('Failed to stop recording:', error);
      }
    },

    setAudioLevel: (level) => set({ audioLevel: level }),
    setCurrentText: (text) => set({ currentText: text }),
    setLastTranscription: (text) => set({ lastTranscription: text }),
  };
});
```

### 3.6 Global Hotkey Setup

**src-tauri/src/commands/hotkey.rs:**
```rust
use tauri::{AppHandle, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

pub fn setup_global_hotkey(app: &AppHandle) -> Result<(), String> {
    let shortcut = Shortcut::new(Some(tauri_plugin_global_shortcut::Modifiers::ALT), tauri_plugin_global_shortcut::Code::Space);
    
    app.global_shortcut().on_shortcut(shortcut, |app, _shortcut, event| {
        if event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
            // Toggle recording
            let _ = app.emit("toggle-recording", ());
        }
    }).map_err(|e| e.to_string())?;

    app.global_shortcut().register(shortcut).map_err(|e| e.to_string())?;
    
    Ok(())
}
```

### 3.7 Deliverables
- [ ] Audio recording works via microphone
- [ ] Audio level meter updates in real-time
- [ ] Global hotkey (⌥ + Space) toggles recording
- [ ] Silence detection stops recording after 3 seconds
- [ ] Audio exported as WAV format
- [ ] Recording state managed in Zustand store
- [ ] Timer accurate to the second
- [ ] Clean start/stop without audio glitches

---

## Phase 4: Transcription Integration (Week 2-3)

### 4.1 API Client Structure

**src-tauri/src/api/mod.rs:**
```rust
pub mod groq;
pub mod openai;
pub mod deepgram;
pub mod gemini;

use async_trait::async_trait;

#[async_trait]
pub trait TranscriptionProvider {
    async fn transcribe(&self, audio: Vec<u8>) -> Result<String, String>;
    fn name(&self) -> &str;
}

#[async_trait]
pub trait PolishingProvider {
    async fn polish(&self, text: &str, style: &str, context: Option<&str>) -> Result<String, String>;
    fn name(&self) -> &str;
}
```

### 4.2 Groq Whisper Integration

**src-tauri/src/api/groq.rs:**
```rust
use reqwest::multipart;
use serde::Deserialize;

pub struct GroqClient {
    api_key: String,
    client: reqwest::Client,
}

#[derive(Deserialize)]
struct TranscriptionResponse {
    text: String,
}

impl GroqClient {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: reqwest::Client::new(),
        }
    }

    pub async fn transcribe(&self, audio: Vec<u8>) -> Result<String, String> {
        let part = multipart::Part::bytes(audio)
            .file_name("audio.wav")
            .mime_str("audio/wav")
            .map_err(|e| e.to_string())?;

        let form = multipart::Form::new()
            .part("file", part)
            .text("model", "whisper-large-v3-turbo")
            .text("response_format", "json");

        let response = self.client
            .post("https://api.groq.com/openai/v1/audio/transcriptions")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .multipart(form)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(format!("Groq API error: {}", error_text));
        }

        let result: TranscriptionResponse = response
            .json()
            .await
            .map_err(|e| e.to_string())?;

        Ok(result.text)
    }

    pub async fn polish(&self, text: &str, style: &str, context: Option<&str>) -> Result<String, String> {
        let system_prompt = build_polish_prompt(style, context);
        
        let body = serde_json::json!({
            "model": "llama-3.1-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            "temperature": 0.3,
            "max_tokens": 2048
        });

        let response = self.client
            .post("https://api.groq.com/openai/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        // Parse and return polished text
        // ...
        todo!()
    }
}

fn build_polish_prompt(style: &str, context: Option<&str>) -> String {
    let style_instructions = match style {
        "formal" => "Use proper grammar, full punctuation, and professional tone.",
        "casual" => "Use conversational tone with standard punctuation.",
        "extremely_casual" => "Use lowercase, minimal punctuation, very casual like texting.",
        _ => "Use natural, conversational tone.",
    };

    let context_info = context
        .map(|c| format!("\nContext: The user is typing in {}.", c))
        .unwrap_or_default();

    format!(
        r#"You are a transcription polisher. Clean up the spoken text while preserving the user's voice and intent.

Style: {}{}

Rules:
1. Fix obvious transcription errors
2. Apply appropriate punctuation for the style
3. Don't add or remove significant content
4. Keep the user's vocabulary and phrasing
5. Return ONLY the polished text, no explanations"#,
        style_instructions, context_info
    )
}
```

### 4.3 OpenAI Whisper Integration

**src-tauri/src/api/openai.rs:**
```rust
use reqwest::multipart;
use serde::Deserialize;

pub struct OpenAIClient {
    api_key: String,
    client: reqwest::Client,
}

impl OpenAIClient {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: reqwest::Client::new(),
        }
    }

    pub async fn transcribe(&self, audio: Vec<u8>) -> Result<String, String> {
        let part = multipart::Part::bytes(audio)
            .file_name("audio.wav")
            .mime_str("audio/wav")
            .map_err(|e| e.to_string())?;

        let form = multipart::Form::new()
            .part("file", part)
            .text("model", "whisper-1")
            .text("response_format", "json");

        let response = self.client
            .post("https://api.openai.com/v1/audio/transcriptions")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .multipart(form)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        // Parse response...
        todo!()
    }

    pub async fn polish(&self, text: &str, style: &str, context: Option<&str>) -> Result<String, String> {
        // Use GPT-4o-mini for polishing
        todo!()
    }
}
```

### 4.4 Deepgram Nova-3 Integration

**src-tauri/src/api/deepgram.rs:**
```rust
use serde::Deserialize;

pub struct DeepgramClient {
    api_key: String,
    client: reqwest::Client,
}

#[derive(Deserialize)]
struct DeepgramResponse {
    results: DeepgramResults,
}

#[derive(Deserialize)]
struct DeepgramResults {
    channels: Vec<DeepgramChannel>,
}

#[derive(Deserialize)]
struct DeepgramChannel {
    alternatives: Vec<DeepgramAlternative>,
}

#[derive(Deserialize)]
struct DeepgramAlternative {
    transcript: String,
}

impl DeepgramClient {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: reqwest::Client::new(),
        }
    }

    pub async fn transcribe(&self, audio: Vec<u8>) -> Result<String, String> {
        let response = self.client
            .post("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true")
            .header("Authorization", format!("Token {}", self.api_key))
            .header("Content-Type", "audio/wav")
            .body(audio)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let result: DeepgramResponse = response
            .json()
            .await
            .map_err(|e| e.to_string())?;

        result.results.channels
            .first()
            .and_then(|c| c.alternatives.first())
            .map(|a| a.transcript.clone())
            .ok_or("No transcription result".to_string())
    }
}
```

### 4.5 Gemini Flash Integration (Free Polishing)

**src-tauri/src/api/gemini.rs:**
```rust
use serde::{Deserialize, Serialize};

pub struct GeminiClient {
    api_key: String,
    client: reqwest::Client,
}

#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<GeminiContent>,
}

#[derive(Serialize)]
struct GeminiContent {
    parts: Vec<GeminiPart>,
}

#[derive(Serialize)]
struct GeminiPart {
    text: String,
}

impl GeminiClient {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: reqwest::Client::new(),
        }
    }

    pub async fn polish(&self, text: &str, style: &str, context: Option<&str>) -> Result<String, String> {
        let prompt = format!(
            "Polish this transcribed text in {} style: {}",
            style, text
        );

        let body = GeminiRequest {
            contents: vec![GeminiContent {
                parts: vec![GeminiPart { text: prompt }],
            }],
        };

        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={}",
            self.api_key
        );

        let response = self.client
            .post(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        // Parse response...
        todo!()
    }
}
```

### 4.6 Transcription Command

**src-tauri/src/commands/transcription.rs:**
```rust
use tauri::State;
use crate::api::{GroqClient, OpenAIClient, DeepgramClient};
use crate::stores::SettingsStore;

#[tauri::command]
pub async fn transcribe_audio(
    audio: Vec<u8>,
    provider: String,
    settings: State<'_, SettingsStore>,
) -> Result<String, String> {
    match provider.as_str() {
        "groq" => {
            let api_key = settings.get_api_key("groq")?;
            let client = GroqClient::new(api_key);
            client.transcribe(audio).await
        }
        "openai" => {
            let api_key = settings.get_api_key("openai")?;
            let client = OpenAIClient::new(api_key);
            client.transcribe(audio).await
        }
        "deepgram" => {
            let api_key = settings.get_api_key("deepgram")?;
            let client = DeepgramClient::new(api_key);
            client.transcribe(audio).await
        }
        _ => Err("Unknown provider".to_string()),
    }
}

#[tauri::command]
pub async fn polish_text(
    text: String,
    style: String,
    context: Option<String>,
    provider: String,
    settings: State<'_, SettingsStore>,
) -> Result<String, String> {
    match provider.as_str() {
        "groq" => {
            let api_key = settings.get_api_key("groq")?;
            let client = GroqClient::new(api_key);
            client.polish(&text, &style, context.as_deref()).await
        }
        "gemini" => {
            let api_key = settings.get_api_key("gemini")?;
            let client = crate::api::gemini::GeminiClient::new(api_key);
            client.polish(&text, &style, context.as_deref()).await
        }
        _ => Err("Unknown provider".to_string()),
    }
}
```

### 4.7 Frontend API Integration

**src/lib/api.ts:**
```typescript
import { invoke } from '@tauri-apps/api/core';

export type TranscriptionProvider = 'groq' | 'openai' | 'deepgram';
export type PolishProvider = 'groq' | 'gemini' | 'openai';
export type Style = 'formal' | 'casual' | 'extremely_casual';

export async function transcribeAudio(
  audio: Uint8Array,
  provider: TranscriptionProvider = 'groq'
): Promise<string> {
  return invoke('transcribe_audio', {
    audio: Array.from(audio),
    provider,
  });
}

export async function polishText(
  text: string,
  style: Style,
  context?: string,
  provider: PolishProvider = 'groq'
): Promise<string> {
  return invoke('polish_text', {
    text,
    style,
    context,
    provider,
  });
}
```

### 4.8 Deliverables
- [ ] Groq Whisper transcription working
- [ ] OpenAI Whisper integration
- [ ] Deepgram Nova-3 integration
- [ ] Groq Llama polishing working
- [ ] Gemini Flash polishing working
- [ ] Provider selection in settings
- [ ] API key secure storage (keychain)
- [ ] Error handling with user feedback
- [ ] Fallback to alternative provider on failure

---

## Phase 5: Main App Window & UI (Week 3-4)

### 5.1 App Layout

**src/components/layout/AppLayout.tsx:**
```tsx
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

### 5.2 Sidebar Navigation

**src/components/layout/Sidebar.tsx:**
```tsx
import { NavLink } from 'react-router-dom';
import { 
  Home, Book, Wand2, MessageSquare, History, 
  Settings, FileText, StickyNote, Users, Gift
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/dictionary', icon: Book, label: 'Dictionary' },
  { path: '/styles', icon: Wand2, label: 'Styles' },
  { path: '/commands', icon: MessageSquare, label: 'Commands' },
  { path: '/snippets', icon: FileText, label: 'Snippets' },
  { path: '/notes', icon: StickyNote, label: 'Notes' },
  { path: '/history', icon: History, label: 'History' },
];

const bottomItems = [
  { path: '/team', icon: Users, label: 'Team' },
  { path: '/referrals', icon: Gift, label: 'Referrals' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="w-56 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Wishper Pro</h1>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            )}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-2 border-t border-gray-800 space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            )}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Usage Indicator */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 mb-1">Usage this month</div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: '76%' }} />
        </div>
        <div className="text-xs text-gray-400 mt-1">23 / 30 minutes</div>
      </div>
    </aside>
  );
}
```

### 5.3 Dashboard Page

**src/pages/Dashboard.tsx:**
```tsx
import { Mic, Clock, TrendingUp, Zap } from 'lucide-react';
import { useRecordingStore } from '@/stores/recordingStore';

export function Dashboard() {
  const { lastTranscription, startRecording, isRecording } = useRecordingStore();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-left hover:from-blue-400 hover:to-blue-500 transition-all"
        >
          <Mic className="mb-2" size={24} />
          <h3 className="font-semibold">Start Recording</h3>
          <p className="text-sm text-blue-200">⌥ + Space</p>
        </button>

        <div className="bg-gray-800/50 p-6 rounded-xl">
          <Clock className="mb-2 text-gray-400" size={24} />
          <h3 className="font-semibold">Minutes Used</h3>
          <p className="text-2xl font-bold text-blue-400">23</p>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl">
          <TrendingUp className="mb-2 text-gray-400" size={24} />
          <h3 className="font-semibold">This Week</h3>
          <p className="text-2xl font-bold text-green-400">+15%</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Transcriptions" value="142" />
        <StatCard label="Words" value="12,450" />
        <StatCard label="Avg. Accuracy" value="98%" />
        <StatCard label="Time Saved" value="4.2h" />
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Transcriptions</h2>
        {/* Recent transcription list */}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
```

### 5.4 Dictionary Page

**src/pages/Dictionary.tsx:**
```tsx
import { useState } from 'react';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { useDictionaryStore } from '@/stores/dictionaryStore';

export function Dictionary() {
  const { words, addWord, removeWord, categories } = useDictionaryStore();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredWords = words.filter(w => 
    w.word.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dictionary</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-400"
        >
          <Plus size={18} />
          Add Word
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search words..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6">
        {['All', ...categories].map((cat) => (
          <button
            key={cat}
            className="px-3 py-1 rounded-full text-sm bg-gray-800 hover:bg-gray-700"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Words List */}
      <div className="space-y-2">
        {filteredWords.map((word) => (
          <div
            key={word.id}
            className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg"
          >
            <div>
              <span className="font-medium">{word.word}</span>
              <span className="ml-2 text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
                {word.category}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="text-gray-400 hover:text-white">
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => removeWord(word.id)}
                className="text-gray-400 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5.5 Style Matching Page

**src/pages/StyleMatching.tsx:**
```tsx
import { useSettingsStore } from '@/stores/settingsStore';

const styles = [
  {
    id: 'formal',
    name: 'Formal',
    description: 'Full punctuation, proper grammar, professional tone',
    example: 'Hello, I hope this message finds you well. I wanted to follow up on our previous conversation regarding the project timeline.',
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Conversational, standard punctuation',
    example: 'Hey, hope you\'re doing well! Just wanted to check in about the project timeline we discussed.',
  },
  {
    id: 'extremely_casual',
    name: 'Extremely Casual',
    description: 'Lowercase, minimal punctuation, like texting',
    example: 'hey hope ur doing well just checking in about the project',
  },
];

export function StyleMatching() {
  const { currentStyle, setStyle, appStyles, setAppStyle } = useSettingsStore();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Style Matching</h1>
      <p className="text-gray-400 mb-8">Choose how your transcriptions are formatted</p>

      {/* Default Style */}
      <h2 className="text-lg font-semibold mb-4">Default Style</h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => setStyle(style.id as any)}
            className={`p-4 rounded-xl text-left transition-all ${
              currentStyle === style.id
                ? 'bg-blue-500/20 border-2 border-blue-500'
                : 'bg-gray-800/50 border-2 border-transparent hover:border-gray-700'
            }`}
          >
            <h3 className="font-semibold mb-1">{style.name}</h3>
            <p className="text-sm text-gray-400 mb-3">{style.description}</p>
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300">{style.example}</p>
            </div>
          </button>
        ))}
      </div>

      {/* App-Specific Styles */}
      <h2 className="text-lg font-semibold mb-4">App-Specific Styles</h2>
      <p className="text-gray-400 text-sm mb-4">
        Override the default style for specific applications
      </p>
      <div className="space-y-2">
        {Object.entries(appStyles).map(([app, style]) => (
          <div
            key={app}
            className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg"
          >
            <span className="font-medium">{app}</span>
            <select
              value={style}
              onChange={(e) => setAppStyle(app, e.target.value as any)}
              className="bg-gray-700 border-none rounded-lg px-3 py-1"
            >
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="extremely_casual">Extremely Casual</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5.6 Settings Page

**src/pages/Settings.tsx:**
```tsx
import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { invoke } from '@tauri-apps/api/core';

export function Settings() {
  const settings = useSettingsStore();
  const [apiKeys, setApiKeys] = useState({
    groq: '',
    openai: '',
    deepgram: '',
    gemini: '',
  });

  const saveApiKey = async (provider: string, key: string) => {
    await invoke('save_api_key', { provider, apiKey: key });
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* General */}
      <Section title="General">
        <Toggle
          label="Launch at login"
          checked={settings.launchAtLogin}
          onChange={settings.setLaunchAtLogin}
        />
        <Toggle
          label="Show in menu bar"
          checked={settings.showInMenuBar}
          onChange={settings.setShowInMenuBar}
        />
        <Toggle
          label="Play sounds"
          checked={settings.playSounds}
          onChange={settings.setPlaySounds}
        />
      </Section>

      {/* Recording */}
      <Section title="Recording">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Recording hotkey</label>
            <input
              type="text"
              value="⌥ + Space"
              readOnly
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Silence threshold (seconds)</label>
            <input
              type="number"
              value={settings.silenceThreshold}
              onChange={(e) => settings.setSilenceThreshold(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mt-1"
            />
          </div>
        </div>
      </Section>

      {/* Providers */}
      <Section title="Transcription Provider">
        <select
          value={settings.transcriptionProvider}
          onChange={(e) => settings.setTranscriptionProvider(e.target.value as any)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
        >
          <option value="groq">Groq Whisper (Free)</option>
          <option value="openai">OpenAI Whisper</option>
          <option value="deepgram">Deepgram Nova-3</option>
        </select>
      </Section>

      <Section title="Polishing Provider">
        <select
          value={settings.polishProvider}
          onChange={(e) => settings.setPolishProvider(e.target.value as any)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
        >
          <option value="groq">Groq Llama (Free)</option>
          <option value="gemini">Gemini Flash (Free)</option>
          <option value="openai">GPT-4o-mini</option>
        </select>
      </Section>

      {/* API Keys */}
      <Section title="API Keys">
        <div className="space-y-4">
          {['groq', 'openai', 'deepgram', 'gemini'].map((provider) => (
            <div key={provider}>
              <label className="text-sm text-gray-400 capitalize">{provider} API Key</label>
              <input
                type="password"
                placeholder="Enter API key..."
                value={apiKeys[provider as keyof typeof apiKeys]}
                onChange={(e) => setApiKeys({ ...apiKeys, [provider]: e.target.value })}
                onBlur={() => saveApiKey(provider, apiKeys[provider as keyof typeof apiKeys])}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mt-1"
              />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2">
      <span>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-700'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full m-1 transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
    </label>
  );
}
```

### 5.7 Deliverables
- [ ] Full app layout with sidebar navigation
- [ ] Dashboard with stats and quick actions
- [ ] Dictionary page (CRUD operations)
- [ ] Style Matching page with 3 styles
- [ ] Commands page for voice commands
- [ ] Snippets page for text templates
- [ ] Notes page for voice notes
- [ ] History page with search/filter
- [ ] Settings page with all options
- [ ] Responsive and polished UI
- [ ] Dark theme throughout
- [ ] Smooth page transitions

---

## Phase 6: Advanced Features (Week 4-5)

### 6.1 Voice Commands System

**src-tauri/src/utils/voice_commands.rs:**
```rust
use std::collections::HashMap;
use regex::Regex;

pub struct VoiceCommandProcessor {
    built_in_commands: HashMap<String, String>,
    custom_commands: HashMap<String, String>,
}

impl VoiceCommandProcessor {
    pub fn new() -> Self {
        let mut built_in = HashMap::new();
        built_in.insert("new paragraph".to_string(), "\n\n".to_string());
        built_in.insert("new line".to_string(), "\n".to_string());
        built_in.insert("period".to_string(), ".".to_string());
        built_in.insert("comma".to_string(), ",".to_string());
        built_in.insert("question mark".to_string(), "?".to_string());
        built_in.insert("exclamation mark".to_string(), "!".to_string());
        built_in.insert("colon".to_string(), ":".to_string());
        built_in.insert("semicolon".to_string(), ";".to_string());

        Self {
            built_in_commands: built_in,
            custom_commands: HashMap::new(),
        }
    }

    pub fn process(&self, text: &str) -> String {
        let mut result = text.to_string();

        // Process built-in commands
        for (trigger, replacement) in &self.built_in_commands {
            let pattern = format!(r"(?i)\b{}\b", regex::escape(trigger));
            let re = Regex::new(&pattern).unwrap();
            result = re.replace_all(&result, replacement.as_str()).to_string();
        }

        // Process custom commands
        for (trigger, replacement) in &self.custom_commands {
            let pattern = format!(r"(?i)\b{}\b", regex::escape(trigger));
            let re = Regex::new(&pattern).unwrap();
            result = re.replace_all(&result, replacement.as_str()).to_string();
        }

        result
    }

    pub fn add_custom_command(&mut self, trigger: String, replacement: String) {
        self.custom_commands.insert(trigger, replacement);
    }

    pub fn remove_custom_command(&mut self, trigger: &str) {
        self.custom_commands.remove(trigger);
    }
}
```

### 6.2 Active App Detection

**src-tauri/src/utils/active_app.rs:**
```rust
#[cfg(target_os = "macos")]
pub fn get_active_app() -> Option<String> {
    use cocoa::appkit::NSWorkspace;
    use cocoa::base::nil;
    use cocoa::foundation::NSString;
    use objc::{msg_send, sel, sel_impl};

    unsafe {
        let workspace: *mut objc::runtime::Object = msg_send![class!(NSWorkspace), sharedWorkspace];
        let app: *mut objc::runtime::Object = msg_send![workspace, frontmostApplication];
        
        if app.is_null() {
            return None;
        }

        let name: *mut objc::runtime::Object = msg_send![app, localizedName];
        if name.is_null() {
            return None;
        }

        let cstr: *const std::os::raw::c_char = msg_send![name, UTF8String];
        if cstr.is_null() {
            return None;
        }

        Some(std::ffi::CStr::from_ptr(cstr).to_string_lossy().into_owned())
    }
}

#[tauri::command]
pub fn get_active_application() -> Option<String> {
    get_active_app()
}
```

### 6.3 Clipboard Integration

**src-tauri/src/commands/clipboard.rs:**
```rust
use tauri_plugin_clipboard_manager::ClipboardExt;

#[tauri::command]
pub async fn paste_text(app: tauri::AppHandle, text: String) -> Result<(), String> {
    // Write to clipboard
    app.clipboard().write_text(&text).map_err(|e| e.to_string())?;

    // Simulate Cmd+V to paste
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        Command::new("osascript")
            .args(["-e", r#"tell application "System Events" to keystroke "v" using command down"#])
            .output()
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}
```

### 6.4 Snippets System

**src/stores/snippetsStore.ts:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Snippet {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  createdAt: Date;
}

interface SnippetsState {
  snippets: Snippet[];
  categories: string[];
  addSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt'>) => void;
  updateSnippet: (id: string, updates: Partial<Snippet>) => void;
  removeSnippet: (id: string) => void;
  expandSnippet: (id: string, variables?: Record<string, string>) => string;
}

export const useSnippetsStore = create<SnippetsState>()(
  persist(
    (set, get) => ({
      snippets: [],
      categories: ['General', 'Email', 'Code', 'Meeting'],

      addSnippet: (snippet) => set((state) => ({
        snippets: [...state.snippets, {
          ...snippet,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        }],
      })),

      updateSnippet: (id, updates) => set((state) => ({
        snippets: state.snippets.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      })),

      removeSnippet: (id) => set((state) => ({
        snippets: state.snippets.filter((s) => s.id !== id),
      })),

      expandSnippet: (id, variables = {}) => {
        const snippet = get().snippets.find((s) => s.id === id);
        if (!snippet) return '';

        let content = snippet.content;
        
        // Built-in variables
        const now = new Date();
        content = content
          .replace(/{date}/g, now.toLocaleDateString())
          .replace(/{time}/g, now.toLocaleTimeString())
          .replace(/{year}/g, now.getFullYear().toString());

        // Custom variables
        for (const [key, value] of Object.entries(variables)) {
          content = content.replace(new RegExp(`{${key}}`, 'g'), value);
        }

        return content;
      },
    }),
    { name: 'snippets-storage' }
  )
);
```

### 6.5 Voice Notes

**src/stores/notesStore.ts:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VoiceNote {
  id: string;
  title: string;
  content: string;
  audioPath?: string;
  tags: string[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NotesState {
  notes: VoiceNote[];
  addNote: (note: Omit<VoiceNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<VoiceNote>) => void;
  deleteNote: (id: string) => void;
  pinNote: (id: string) => void;
  searchNotes: (query: string) => VoiceNote[];
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (note) => set((state) => ({
        notes: [{
          ...note,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }, ...state.notes],
      })),

      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n
        ),
      })),

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
      })),

      pinNote: (id) => set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, isPinned: !n.isPinned } : n
        ),
      })),

      searchNotes: (query) => {
        const q = query.toLowerCase();
        return get().notes.filter((n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        );
      },
    }),
    { name: 'notes-storage' }
  )
);
```

### 6.6 History with Search

**src/stores/historyStore.ts:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Transcription {
  id: string;
  originalText: string;
  polishedText: string;
  style: string;
  appContext: string;
  duration: number;
  createdAt: Date;
}

interface HistoryState {
  transcriptions: Transcription[];
  addTranscription: (t: Omit<Transcription, 'id' | 'createdAt'>) => void;
  deleteTranscription: (id: string) => void;
  clearHistory: () => void;
  searchHistory: (query: string) => Transcription[];
  filterByDate: (start: Date, end: Date) => Transcription[];
  filterByApp: (app: string) => Transcription[];
  exportHistory: (format: 'json' | 'csv') => string;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      transcriptions: [],

      addTranscription: (t) => set((state) => ({
        transcriptions: [{
          ...t,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        }, ...state.transcriptions],
      })),

      deleteTranscription: (id) => set((state) => ({
        transcriptions: state.transcriptions.filter((t) => t.id !== id),
      })),

      clearHistory: () => set({ transcriptions: [] }),

      searchHistory: (query) => {
        const q = query.toLowerCase();
        return get().transcriptions.filter((t) =>
          t.originalText.toLowerCase().includes(q) ||
          t.polishedText.toLowerCase().includes(q)
        );
      },

      filterByDate: (start, end) => get().transcriptions.filter((t) => {
        const date = new Date(t.createdAt);
        return date >= start && date <= end;
      }),

      filterByApp: (app) => get().transcriptions.filter((t) =>
        t.appContext.toLowerCase() === app.toLowerCase()
      ),

      exportHistory: (format) => {
        const data = get().transcriptions;
        if (format === 'json') {
          return JSON.stringify(data, null, 2);
        }
        // CSV format
        const headers = 'ID,Original,Polished,Style,App,Duration,Date\n';
        const rows = data.map((t) =>
          `"${t.id}","${t.originalText}","${t.polishedText}","${t.style}","${t.appContext}",${t.duration},"${t.createdAt}"`
        ).join('\n');
        return headers + rows;
      },
    }),
    { name: 'history-storage' }
  )
);
```

### 6.7 Deliverables
- [ ] Voice commands processing (built-in + custom)
- [ ] Active app detection working
- [ ] App-specific style switching
- [ ] Clipboard paste integration
- [ ] Snippets CRUD with variables
- [ ] Voice notes with search/tags
- [ ] History search and filtering
- [ ] History export (JSON/CSV)
- [ ] Silence detection auto-stop
- [ ] All stores persisted locally

---

## Phase 7: Polish & Testing (Week 5-6)

### 7.1 Error Handling

```typescript
// src/lib/errors.ts
export class WishperError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'WishperError';
  }
}

export const ErrorCodes = {
  MICROPHONE_ACCESS_DENIED: 'MICROPHONE_ACCESS_DENIED',
  API_KEY_MISSING: 'API_KEY_MISSING',
  API_RATE_LIMITED: 'API_RATE_LIMITED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TRANSCRIPTION_FAILED: 'TRANSCRIPTION_FAILED',
} as const;
```

### 7.2 Notifications

```typescript
// src/lib/notifications.ts
import { sendNotification } from '@tauri-apps/plugin-notification';

export async function notify(title: string, body: string) {
  await sendNotification({ title, body });
}

export async function notifyTranscriptionComplete(text: string) {
  await notify('Transcription Complete', text.slice(0, 100) + '...');
}

export async function notifyError(message: string) {
  await notify('Error', message);
}
```

### 7.3 Analytics Events

```typescript
// src/lib/analytics.ts
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

class Analytics {
  private events: AnalyticsEvent[] = [];

  track(event: string, properties?: Record<string, any>) {
    this.events.push({
      event,
      properties,
      timestamp: new Date(),
    });
    // Send to analytics service in production
  }

  trackRecording(duration: number, provider: string) {
    this.track('recording_completed', { duration, provider });
  }

  trackError(code: string, message: string) {
    this.track('error', { code, message });
  }
}

export const analytics = new Analytics();
```

### 7.4 Testing Checklist

**Unit Tests:**
- [ ] Audio recorder start/stop
- [ ] Silence detection accuracy
- [ ] Voice command parsing
- [ ] Style formatting
- [ ] Dictionary word matching
- [ ] Snippet variable expansion
- [ ] History search/filter

**Integration Tests:**
- [ ] Full recording → transcription flow
- [ ] API provider switching
- [ ] Settings persistence
- [ ] Hotkey registration

**E2E Tests:**
- [ ] App launches correctly
- [ ] Menubar widget opens/closes
- [ ] Recording via hotkey
- [ ] Text appears in target app
- [ ] Style switching works

**Performance Tests:**
- [ ] Recording latency < 100ms
- [ ] Transcription latency < 2s
- [ ] Memory usage < 100MB
- [ ] CPU idle < 1%

### 7.5 Accessibility

- [ ] VoiceOver support
- [ ] Keyboard navigation
- [ ] High contrast mode
- [ ] Reduced motion option
- [ ] Screen reader labels

### 7.6 Deliverables
- [ ] All error states handled gracefully
- [ ] User-friendly error messages
- [ ] Notification system working
- [ ] Analytics events tracked
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Memory leaks fixed
- [ ] All edge cases handled

---

## Phase 8: Build & Distribution (Week 6-7)

### 8.1 Code Signing Setup

```bash
# Apple Developer setup
# 1. Create Developer ID Application certificate
# 2. Create Developer ID Installer certificate
# 3. Download and install certificates

# Environment variables
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAMID)"
export APPLE_ID="your@email.com"
export APPLE_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="TEAMID"
```

### 8.2 Tauri Build Configuration

**src-tauri/tauri.conf.json (build section):**
```json
{
  "bundle": {
    "active": true,
    "targets": ["dmg", "app"],
    "identifier": "com.wishper.pro",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns"
    ],
    "macOS": {
      "minimumSystemVersion": "12.0",
      "signingIdentity": null,
      "entitlements": "./entitlements.plist",
      "dmg": {
        "appPosition": { "x": 180, "y": 170 },
        "applicationFolderPosition": { "x": 480, "y": 170 },
        "background": "./dmg-background.png"
      }
    }
  }
}
```

### 8.3 Notarization Script

**scripts/notarize.sh:**
```bash
#!/bin/bash

APP_PATH="$1"
DMG_PATH="$2"

# Submit for notarization
xcrun notarytool submit "$DMG_PATH" \
  --apple-id "$APPLE_ID" \
  --password "$APPLE_PASSWORD" \
  --team-id "$APPLE_TEAM_ID" \
  --wait

# Staple the notarization ticket
xcrun stapler staple "$DMG_PATH"

echo "Notarization complete!"
```

### 8.4 Auto-Update Configuration

**src-tauri/tauri.conf.json (updater section):**
```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://releases.wishper.pro/{{target}}/{{arch}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY"
    }
  }
}
```

### 8.5 Build Scripts

**package.json:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "tauri:build:universal": "tauri build --target universal-apple-darwin",
    "release": "npm run build && npm run tauri:build:universal",
    "notarize": "./scripts/notarize.sh"
  }
}
```

### 8.6 GitHub Actions CI/CD

**.github/workflows/release.yml:**
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: aarch64-apple-darwin,x86_64-apple-darwin

      - name: Install dependencies
        run: npm ci

      - name: Build Tauri app
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
          APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        with:
          tagName: v__VERSION__
          releaseName: 'Wishper Pro v__VERSION__'
          releaseBody: 'See the release notes for details.'
          releaseDraft: true
          prerelease: false
          args: --target universal-apple-darwin
```

### 8.7 Deliverables
- [ ] App signed with Developer ID
- [ ] App notarized by Apple
- [ ] DMG installer created
- [ ] Universal binary (Intel + Apple Silicon)
- [ ] Auto-update system working
- [ ] GitHub Actions CI/CD pipeline
- [ ] Release workflow automated
- [ ] Version bumping automated
- [ ] Crash reporting integrated (Sentry)

---

## Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| 1. Foundation | Week 1 | Project setup, dependencies, structure |
| 2. Menubar Widget | Week 1-2 | Tray icon, popup, waveform, live text |
| 3. Audio Recording | Week 2 | Recording, silence detection, hotkey |
| 4. Transcription | Week 2-3 | STT providers, polishing, API integration |
| 5. Main App UI | Week 3-4 | All pages, navigation, settings |
| 6. Advanced Features | Week 4-5 | Commands, snippets, notes, history |
| 7. Polish & Testing | Week 5-6 | Error handling, tests, performance |
| 8. Distribution | Week 6-7 | Signing, notarization, auto-update |

**Total Estimated Time: 6-7 weeks**

---

*Created: January 2026*
