/**
 * Status Bar Service
 *
 * Configure Android/iOS status bar appearance.
 * Matches the app's theme colors.
 */

import { Capacitor } from '@capacitor/core';

/**
 * Initialize status bar with app theme colors
 */
export async function initializeStatusBar(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');

    // Set status bar to overlay WebView (Android only)
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#E8DFC9' }); // Cream color
    }

    // Use dark content (dark icons) on light background
    await StatusBar.setStyle({ style: Style.Light });
  } catch (error) {
    console.error('Error initializing status bar:', error);
  }
}

/**
 * Set status bar for dark theme
 */
export async function setDarkStatusBar(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');

    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#1C1917' }); // Dark background
    }

    await StatusBar.setStyle({ style: Style.Dark });
  } catch (error) {
    console.error('Error setting dark status bar:', error);
  }
}
