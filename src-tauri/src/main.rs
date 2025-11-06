// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::path::PathBuf;

mod error;
mod config;
mod db;

use config::AppConfig;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
async fn save_file(path: String, contents: String) -> Result<(), String> {
    use std::fs;
    fs::write(&path, contents).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    use std::fs;
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_app_version,
            save_file,
            read_file,
        ])
        .setup(|app| {
            // Set window title and configure window
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_title("FIRM AI");
                // Enable devtools in development
                #[cfg(debug_assertions)]
                let _ = window.open_devtools();
            }

            // Load configuration from environment
            let config = AppConfig::from_env();
            
            // Validate configuration
            if let Err(e) = config.validate() {
                eprintln!("Configuration warning: {}", e);
                eprintln!("App will run with limited functionality");
            }

            // Get app data directory for SQLite
            let app_data_dir = app.path().app_data_dir().unwrap_or_else(|_| {
                PathBuf::from(".")
            });
            
            // Ensure directory exists
            if let Err(e) = std::fs::create_dir_all(&app_data_dir) {
                eprintln!("Failed to create app data directory: {}", e);
            }
            
            let db_path = app_data_dir.join(&config.database_path);
            
            println!("FIRM AI initialized successfully");
            println!("Database path: {:?}", db_path);
            println!("OpenRouter API key configured: {}", config.openrouter_api_key.is_some());
            println!("Supabase configured: {}", config.supabase_url.is_some());
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
