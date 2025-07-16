/**
 * Funlynk Mobile App
 * https://github.com/funlynk/funlynk-v2
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import StoreProvider from '@/store/StoreProvider';
import { ThemeProvider, ErrorBoundary, Toast } from '@/components';
import RootNavigator from '@/navigation/RootNavigator';

function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <ThemeProvider>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <RootNavigator />
          <Toast />
        </ThemeProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
}

export default App;
