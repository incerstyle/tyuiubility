# Tyuiubility Extension

## Overview

This extension allows you to save your Tyumen Industrial University group's schedule and view it anytime, anywhere, even without an internet connection.

Source code: https://github.com/incerstyle/tyuiubility

## Permissions

The extension requests the following permissions:

- **Storage**: Saves your schedule locally for offline access.
- **Schedule tab access**: Reads schedule data from `https://my.tyuiu.ru/schedule*`.

## Privacy & Security

This extension:
- Does not make network requests to third-party resources.
- Does not collect or store any user confidential information.
- Operates entirely with local browser storage.

## Building and installation

### Prerequisites

- Node.js installed
- [Plasmo](https://docs.plasmo.com/) framework

### Build process for Firefox

1. Clone repo:
    ```bash
    git clone https://github.com/incerstyle/tyuiubility.git
    ```
    
2. Install dependencies:
    ```bash
    npm install
    ```

3. Build the extension:
    ```bash
    npm run build -- --target=firefox
    ```

4. The compiled extension will be available in the `build/` directory.

### Installing in Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on**.
3. Select the `manifest.json` file from `build/firefox-mv3/`.
4. The extension will now appear in your Firefox toolbar.

### Build process for Chrome

1. Clone repo:
    ```bash
    git clone https://github.com/incerstyle/tyuiubility.git
    ```
    
2. Install dependencies:
    ```bash
    npm install
    ```

3. Build the extension:
    ```bash
    npm run build
    ```

4. The compiled extension will be available in the ’build/chrome-mv3/ directory’.

### Installing in Chrome

1. Open Chrome and navigate to ’chrome://extensions’.
2. Enable **Developer mode** (toggle in the top right corner).
3. Click **Load unpacked**.
4. Select the folder ’build/chrome-mv3/’.
5. The extension will now appear in your Chrome toolbar.
