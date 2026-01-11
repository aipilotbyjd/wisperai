mod api;
mod audio;
mod commands;
mod tray;
mod utils;

use audio::AudioRecorder;
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .manage(AudioRecorder::new())
        .setup(|app| {
            // Setup system tray
            tray::setup_tray(app.handle())?;

            // Setup global hotkey (Ctrl + Shift + R)
            let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyR);
            if let Err(e) = app.global_shortcut().on_shortcut(shortcut, |app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    let _ = app.emit("toggle-recording", ());
                }
            }) {
                eprintln!("Failed to setup hotkey handler: {}", e);
            }
            if let Err(e) = app.global_shortcut().register(shortcut) {
                eprintln!("Failed to register hotkey (Ctrl+Shift+R): {}", e);
            }

            // Show main window on startup
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::show_main_window,
            commands::hide_main_window,
            commands::toggle_menubar,
            commands::start_recording,
            commands::stop_recording,
            commands::is_recording,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
