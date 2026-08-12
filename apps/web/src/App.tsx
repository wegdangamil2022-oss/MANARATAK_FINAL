import React from 'react';
import { ThemeProvider, RTLProvider } from '@manaratak/ui';
import { AppRouter } from './router';
import { I18nProvider } from './i18n/I18nProvider';

export function App() {
  return (
    <I18nProvider>
      <ThemeProvider defaultTheme="system">
        <RTLProvider>
          <AppRouter />
        </RTLProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

export default App;
