use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::{Arc, Mutex};
use tauri::Emitter;

pub struct AudioRecorder {
    is_recording: Arc<AtomicBool>,
    audio_data: Arc<Mutex<Vec<f32>>>,
    sample_rate: AtomicU32,
    stream: Mutex<Option<cpal::Stream>>,
}

unsafe impl Send for AudioRecorder {}
unsafe impl Sync for AudioRecorder {}

impl AudioRecorder {
    pub fn new() -> Self {
        Self {
            is_recording: Arc::new(AtomicBool::new(false)),
            audio_data: Arc::new(Mutex::new(Vec::new())),
            sample_rate: AtomicU32::new(16000),
            stream: Mutex::new(None),
        }
    }

    pub fn start<R: tauri::Runtime>(&self, app: tauri::AppHandle<R>) -> Result<(), String> {
        if self.is_recording.load(Ordering::SeqCst) {
            return Err("Already recording".to_string());
        }

        let host = cpal::default_host();
        let device = host
            .default_input_device()
            .ok_or("No input device available")?;

        // Get supported config
        let supported_config = device
            .supported_input_configs()
            .map_err(|e| e.to_string())?
            .find(|c| c.channels() == 1 && c.sample_format() == cpal::SampleFormat::F32)
            .or_else(|| {
                device
                    .supported_input_configs()
                    .ok()?
                    .find(|c| c.sample_format() == cpal::SampleFormat::F32)
            })
            .ok_or("No suitable audio config found")?;

        let sample_rate = self.sample_rate.load(Ordering::SeqCst);
        let config = cpal::StreamConfig {
            channels: supported_config.channels(),
            sample_rate: cpal::SampleRate(sample_rate),
            buffer_size: cpal::BufferSize::Default,
        };

        // Clear previous audio data
        if let Ok(mut data) = self.audio_data.lock() {
            data.clear();
        }

        self.is_recording.store(true, Ordering::SeqCst);
        let is_recording = self.is_recording.clone();
        let audio_data = self.audio_data.clone();
        let channels = config.channels as usize;

        let stream = device
            .build_input_stream(
                &config,
                move |data: &[f32], _: &cpal::InputCallbackInfo| {
                    if !is_recording.load(Ordering::SeqCst) {
                        return;
                    }

                    // Convert to mono if needed and store
                    let mono_samples: Vec<f32> = if channels > 1 {
                        data.chunks(channels)
                            .map(|chunk| chunk.iter().sum::<f32>() / channels as f32)
                            .collect()
                    } else {
                        data.to_vec()
                    };

                    // Store audio data
                    if let Ok(mut buffer) = audio_data.lock() {
                        buffer.extend_from_slice(&mono_samples);
                    }

                    // Calculate and emit audio level
                    let level = calculate_rms_level(&mono_samples);
                    let _ = app.emit("audio-level", level);
                },
                |err| eprintln!("Audio stream error: {}", err),
                None,
            )
            .map_err(|e| e.to_string())?;

        stream.play().map_err(|e| e.to_string())?;

        // Store stream to keep it alive
        if let Ok(mut s) = self.stream.lock() {
            *s = Some(stream);
        }

        Ok(())
    }

    pub fn stop(&self) -> Result<Vec<f32>, String> {
        if !self.is_recording.load(Ordering::SeqCst) {
            return Err("Not recording".to_string());
        }

        self.is_recording.store(false, Ordering::SeqCst);

        // Stop and drop stream
        if let Ok(mut s) = self.stream.lock() {
            *s = None;
        }

        // Get recorded audio data
        let data = self
            .audio_data
            .lock()
            .map_err(|_| "Failed to lock audio data")?
            .clone();

        Ok(data)
    }

    pub fn is_recording(&self) -> bool {
        self.is_recording.load(Ordering::SeqCst)
    }

    pub fn sample_rate(&self) -> u32 {
        self.sample_rate.load(Ordering::SeqCst)
    }
}

impl Default for AudioRecorder {
    fn default() -> Self {
        Self::new()
    }
}

fn calculate_rms_level(samples: &[f32]) -> f32 {
    if samples.is_empty() {
        return 0.0;
    }
    let sum: f32 = samples.iter().map(|s| s * s).sum();
    (sum / samples.len() as f32).sqrt().min(1.0)
}
