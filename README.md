# Cronometer

Small Electron countdown app for stand-ups and short speaking rounds.

## Features

- Frameless desktop widget UI.
- Countdown timer with start and stop controls.
- Custom right-click context menu:
	- Settings
	- Quit
- Settings window to configure:
	- Time (in seconds)
	- Question text shown on the main window
- Local persistence for timer and question using browser localStorage.
- Draggable window behavior implemented from the renderer for Linux-friendly interaction.

## Requirements

- Node.js
- Yarn

## Install

```bash
yarn install
```

## Run

```bash
yarn start
```

## How To Use

1. Launch the app with yarn start.
2. Click Start to begin the countdown.
3. Click Stop while running to stop the countdown.
4. Click Stop again while already stopped to reset the timer to the configured duration.
5. Right-click anywhere in the app to open the context menu.
6. Select Settings to change timer seconds and question text.
7. Save settings to apply them immediately. The settings window closes automatically after save.

## Context Menu

- Settings: Opens the settings window.
- Quit: Exits the application.

## Project Structure

- main.js: Electron main process (windows, context menu, IPC, drag updates).
- preload.js: Secure IPC bridge exposed to renderer windows.
- index.html: Main app UI.
- scripts.js: Main timer logic, drag handling, renderer events.
- styles.css: Main UI styling.
- settings.html: Settings window UI.
- settings.js: Settings form behavior and save action.

## Notes

- Default timer is 90 seconds.
- Minimum allowed configured time is 1 second.
- User settings are stored locally under key cronometer-settings.

## License

MIT
