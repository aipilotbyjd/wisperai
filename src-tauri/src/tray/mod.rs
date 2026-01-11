use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, Runtime,
};

pub fn setup_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<(), tauri::Error> {
    // Create right-click menu
    let settings = MenuItem::with_id(app, "settings", "Settings...", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit Wisper Pro", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&settings, &quit])?;

    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("Wisper Pro - Click to record")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "quit" => app.exit(0),
            "settings" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                position,
                ..
            } = event
            {
                let app = tray.app_handle();
                toggle_menubar_window(app, position);
            }
        })
        .build(app)?;

    Ok(())
}

fn toggle_menubar_window<R: Runtime>(
    app: &tauri::AppHandle<R>,
    tray_position: tauri::PhysicalPosition<f64>,
) {
    if let Some(window) = app.get_webview_window("menubar") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            // Position menubar below tray icon
            let window_width = 320.0;
            let x = tray_position.x - (window_width / 2.0);
            let y = tray_position.y + 5.0;

            let _ = window.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: x as i32,
                y: y as i32,
            }));
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}
