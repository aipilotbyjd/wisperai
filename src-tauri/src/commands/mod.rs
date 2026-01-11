use crate::audio::{samples_to_wav, AudioRecorder};
use tauri::{Manager, State};

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Wisper Pro.", name)
}

#[tauri::command]
pub async fn show_main_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn hide_main_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn toggle_menubar(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("menubar") {
        if window.is_visible().unwrap_or(false) {
            window.hide().map_err(|e| e.to_string())?;
        } else {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn start_recording(app: tauri::AppHandle, recorder: State<'_, AudioRecorder>) -> Result<(), String> {
    recorder.start(app)
}

#[tauri::command]
pub fn stop_recording(recorder: State<'_, AudioRecorder>) -> Result<Vec<u8>, String> {
    let samples = recorder.stop()?;
    let sample_rate = recorder.sample_rate();
    samples_to_wav(&samples, sample_rate)
}

#[tauri::command]
pub fn is_recording(recorder: State<'_, AudioRecorder>) -> bool {
    recorder.is_recording()
}
