/**
 * Android Hardware Back Button Handler
 *
 * Integrates Android's native back button with React Router navigation.
 * On home screen, minimizes the app instead of exiting.
 */

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useNavigate, useLocation } from 'react-router-dom';

export function useAndroidBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only register on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const listener = App.addListener('backButton', ({ canGoBack }) => {
      // On root routes, minimize instead of exit
      const rootPaths = ['/', '/insights', '/community', '/settings'];
      const isRootPath = rootPaths.includes(location.pathname);

      if (isRootPath && !canGoBack) {
        // Minimize app on root screens
        App.minimizeApp();
      } else if (canGoBack) {
        // Use browser history if available
        window.history.back();
      } else {
        // Fallback: navigate to home
        navigate('/');
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [navigate, location.pathname]);
}

export default useAndroidBackButton;
