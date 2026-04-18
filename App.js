import { StatusBar } from 'expo-status-bar';
import { AppState, BackHandler, Linking, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as NavigationBar from 'expo-navigation-bar';

export default function App() {
  const [html, setHtml] = useState(null);
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const androidPackageId = 'com.campagner.atcradarsbvt';

  async function openRateApp() {
    const webFallbackUrl = `https://play.google.com/store/apps/details?id=${androidPackageId}`;

    if (Platform.OS === 'android') {
      const androidStoreUrl = `market://details?id=${androidPackageId}`;
      try {
        const canOpenStore = await Linking.canOpenURL(androidStoreUrl);
        if (canOpenStore) {
          await Linking.openURL(androidStoreUrl);
          return;
        }
      } catch (error) {
        console.warn('Could not open Play Store deep link:', error);
      }
    }

    try {
      await Linking.openURL(webFallbackUrl);
    } catch (error) {
      console.warn('Could not open rate URL:', error);
    }
  }

  async function applyAndroidImmersiveMode() {
    if (Platform.OS !== 'android') return;

    try {
      // Keep Android system navigation hidden while allowing temporary swipe reveal.
      await NavigationBar.setPositionAsync('absolute');
      await NavigationBar.setBehaviorAsync('overlay-swipe');
      await NavigationBar.setBackgroundColorAsync('#040a06');
      await NavigationBar.setButtonStyleAsync('light');
      await NavigationBar.setVisibilityAsync('hidden');
    } catch (error) {
      console.warn('Could not apply Android immersive mode:', error);
    }
  }

  function handleWebViewMessage(event) {
    const raw = event?.nativeEvent?.data;
    if (!raw) return;

    try {
      const payload = JSON.parse(raw);
      if (payload?.type === 'exit-app') {
        if (Platform.OS === 'android') {
          BackHandler.exitApp();
        }
      }
      if (payload?.type === 'rate-app') {
        openRateApp();
      }
      return;
    } catch (error) {
      if (raw === 'exit-app') {
        if (Platform.OS === 'android') {
          BackHandler.exitApp();
        }
      }
      if (raw === 'rate-app') {
        openRateApp();
      }
    }
  }

  useEffect(() => {
    // Carrega o HTML dos assets e injeta como string
    async function load() {
      try {
        await applyAndroidImmersiveMode();
        const asset = Asset.fromModule(require('./assets/atc_radar.html'));
        await asset.downloadAsync();
        const content = await FileSystem.readAsStringAsync(asset.localUri);
        const configuredContent = content
          .replace('__SUPABASE_URL__', String(supabaseUrl))
          .replace('__SUPABASE_ANON_KEY__', String(supabaseAnonKey));
        console.log('HTML loaded, length:', configuredContent.length);
        setHtml(configuredContent);
      } catch (error) {
        console.error('Error loading HTML:', error);
      }
    }

    load();
  }, [supabaseAnonKey, supabaseUrl]);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    applyAndroidImmersiveMode();

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        applyAndroidImmersiveMode();
      }
    });

    return () => {
      appStateSubscription.remove();
    };
  }, []);

  if (!html) return <View style={styles.loading} />;

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="#040a06" translucent hidden />
      <WebView
        style={styles.webview}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={handleWebViewMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onLoadEnd={() => console.log('WebView loaded')}
        onLoadProgress={() => {
          applyAndroidImmersiveMode();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#040a06',
  },
  webview: {
    flex: 1,
    backgroundColor: '#040a06',
  },
  loading: {
    flex: 1,
    backgroundColor: '#040a06',
  },
});