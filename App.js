// ─────────────────────────────────────────────────────
//  ATC RADAR — Expo WebView wrapper
//  1. npx expo install expo-web-view
//  2. Coloque atc_radar.html em /assets/atc_radar.html
//  3. Substitua este App.js
// ─────────────────────────────────────────────────────
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';

export default function App() {
  const [html, setHtml] = useState(null);

  useEffect(() => {
    // Carrega o HTML dos assets e injeta como string
    async function load() {
      try {
        const asset = Asset.fromModule(require('./assets/atc_radar.html'));
        await asset.downloadAsync();
        const content = await FileSystem.readAsStringAsync(asset.localUri);
        console.log('HTML loaded, length:', content.length);
        setHtml(content);
      } catch (error) {
        console.error('Error loading HTML:', error);
      }
    }
    load();
  }, []);

  if (!html) return <View style={styles.loading} />;

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="#040a06" />
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
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onLoadEnd={() => console.log('WebView loaded')}
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