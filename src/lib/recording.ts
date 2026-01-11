import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'

export async function startRecording(): Promise<void> {
  await invoke('start_recording')
}

export async function stopRecording(): Promise<Uint8Array> {
  const data = await invoke<number[]>('stop_recording')
  return new Uint8Array(data)
}

export async function isRecording(): Promise<boolean> {
  return invoke<boolean>('is_recording')
}

export async function onAudioLevel(callback: (level: number) => void): Promise<UnlistenFn> {
  return listen<number>('audio-level', (event) => {
    callback(event.payload)
  })
}

export async function onToggleRecording(callback: () => void): Promise<UnlistenFn> {
  return listen('toggle-recording', () => {
    callback()
  })
}
