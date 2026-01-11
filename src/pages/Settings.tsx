import { useSettingsStore } from '../stores'

export function Settings() {
  const settings = useSettingsStore()

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

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

      <Section title="Transcription Provider">
        <select
          value={settings.transcriptionProvider}
          onChange={(e) => settings.setTranscriptionProvider(e.target.value as 'groq' | 'openai' | 'deepgram')}
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
          onChange={(e) => settings.setPolishProvider(e.target.value as 'groq' | 'gemini' | 'openai')}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
        >
          <option value="groq">Groq Llama (Free)</option>
          <option value="gemini">Gemini Flash (Free)</option>
          <option value="openai">GPT-4o-mini</option>
        </select>
      </Section>

      <Section title="API Keys">
        <div className="space-y-4">
          {['groq', 'openai', 'deepgram', 'gemini'].map((provider) => (
            <div key={provider}>
              <label className="text-sm text-gray-400 capitalize">{provider} API Key</label>
              <input
                type="password"
                placeholder="Enter API key..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mt-1"
              />
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-700'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full m-1 transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
    </label>
  )
}
