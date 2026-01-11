import { create } from 'zustand'

interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  audioLevel: number
  elapsedTime: number
  currentText: string
  lastTranscription: string | null

  setIsRecording: (value: boolean) => void
  setIsPaused: (value: boolean) => void
  setAudioLevel: (level: number) => void
  setElapsedTime: (time: number) => void
  incrementElapsedTime: () => void
  setCurrentText: (text: string) => void
  setLastTranscription: (text: string | null) => void
  reset: () => void
}

export const useRecordingStore = create<RecordingState>((set) => ({
  isRecording: false,
  isPaused: false,
  audioLevel: 0,
  elapsedTime: 0,
  currentText: '',
  lastTranscription: null,

  setIsRecording: (value) => set({ isRecording: value }),
  setIsPaused: (value) => set({ isPaused: value }),
  setAudioLevel: (level) => set({ audioLevel: level }),
  setElapsedTime: (time) => set({ elapsedTime: time }),
  incrementElapsedTime: () => set((state) => ({ elapsedTime: state.elapsedTime + 1 })),
  setCurrentText: (text) => set({ currentText: text }),
  setLastTranscription: (text) => set({ lastTranscription: text }),
  reset: () => set({
    isRecording: false,
    isPaused: false,
    audioLevel: 0,
    elapsedTime: 0,
    currentText: '',
  }),
}))
