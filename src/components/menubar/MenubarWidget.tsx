import { useState, useEffect, useCallback } from 'react'
import { Mic, MicOff, Settings, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { useRecordingStore } from '../../stores'
import { startRecording, stopRecording, onAudioLevel, onToggleRecording } from '../../lib'
import { Waveform } from './Waveform'
import { Timer } from './Timer'
import { LiveText } from './LiveText'
import { StyleSwitcher } from './StyleSwitcher'

export function MenubarWidget() {
  const {
    isRecording,
    audioLevel,
    currentText,
    lastTranscription,
    elapsedTime,
    setIsRecording,
    setAudioLevel,
    incrementElapsedTime,
    reset,
  } = useRecordingStore()

  const [copied, setCopied] = useState(false)

  // Listen for audio levels from Rust
  useEffect(() => {
    const unlisten = onAudioLevel((level) => {
      setAudioLevel(level)
    })
    return () => {
      unlisten.then((fn) => fn())
    }
  }, [setAudioLevel])

  // Listen for global hotkey toggle
  useEffect(() => {
    const unlisten = onToggleRecording(() => {
      if (isRecording) {
        handleStopRecording()
      } else {
        handleStartRecording()
      }
    })
    return () => {
      unlisten.then((fn) => fn())
    }
  }, [isRecording])

  // Timer effect
  useEffect(() => {
    if (!isRecording) return

    const interval = setInterval(() => {
      incrementElapsedTime()
    }, 1000)

    return () => clearInterval(interval)
  }, [isRecording, incrementElapsedTime])

  const handleStartRecording = useCallback(async () => {
    try {
      reset()
      await startRecording()
      setIsRecording(true)
    } catch (err) {
      console.error('Failed to start recording:', err)
    }
  }, [reset, setIsRecording])

  const handleStopRecording = useCallback(async () => {
    try {
      const wavData = await stopRecording()
      setIsRecording(false)
      setAudioLevel(0)
      console.log('Recording stopped, WAV size:', wavData.length, 'bytes')
      // TODO: Send to transcription API in Phase 4
    } catch (err) {
      console.error('Failed to stop recording:', err)
      setIsRecording(false)
    }
  }, [setIsRecording, setAudioLevel])

  const handleCopy = async () => {
    if (lastTranscription) {
      try {
        await writeText(lastTranscription)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const handleSettingsClick = () => {
    // TODO: Open main window settings in Phase 3
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="w-80 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'
            }`}
          />
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
            <Waveform audioLevel={audioLevel} />
            <LiveText text={currentText} />
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm mb-2">Press Ctrl+Shift+R to record</p>
            <p className="text-gray-500 text-xs">or click the microphone</p>
          </div>
        )}
      </div>

      {/* Record Button */}
      <div className="px-4 pb-4">
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all font-medium ${
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
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-sm text-gray-300 line-clamp-3">{lastTranscription}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-700/50 flex justify-between items-center">
        <span className="text-xs text-gray-500">0/30 mins used</span>
        <button
          onClick={handleSettingsClick}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>
    </motion.div>
  )
}
