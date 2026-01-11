import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Style = 'formal' | 'casual' | 'extremely_casual'
export type TranscriptionProvider = 'groq' | 'openai' | 'deepgram'
export type PolishProvider = 'groq' | 'gemini' | 'openai'

interface SettingsState {
  currentStyle: Style
  transcriptionProvider: TranscriptionProvider
  polishProvider: PolishProvider
  launchAtLogin: boolean
  showInMenuBar: boolean
  playSounds: boolean
  silenceThreshold: number
  appStyles: Record<string, Style>

  setStyle: (style: Style) => void
  setTranscriptionProvider: (provider: TranscriptionProvider) => void
  setPolishProvider: (provider: PolishProvider) => void
  setLaunchAtLogin: (value: boolean) => void
  setShowInMenuBar: (value: boolean) => void
  setPlaySounds: (value: boolean) => void
  setSilenceThreshold: (value: number) => void
  setAppStyle: (app: string, style: Style) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currentStyle: 'casual',
      transcriptionProvider: 'groq',
      polishProvider: 'groq',
      launchAtLogin: false,
      showInMenuBar: true,
      playSounds: true,
      silenceThreshold: 3,
      appStyles: {},

      setStyle: (style) => set({ currentStyle: style }),
      setTranscriptionProvider: (provider) => set({ transcriptionProvider: provider }),
      setPolishProvider: (provider) => set({ polishProvider: provider }),
      setLaunchAtLogin: (value) => set({ launchAtLogin: value }),
      setShowInMenuBar: (value) => set({ showInMenuBar: value }),
      setPlaySounds: (value) => set({ playSounds: value }),
      setSilenceThreshold: (value) => set({ silenceThreshold: value }),
      setAppStyle: (app, style) => set((state) => ({
        appStyles: { ...state.appStyles, [app]: style }
      })),
    }),
    { name: 'wisper-settings' }
  )
)
