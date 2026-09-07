import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Orientasi Jelajah Aman</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.cardContainer}>
        <ThemedText type="subtitle">Praktikum 1: Fondasi Platform</ThemedText>
        <ThemedText style={styles.identitasText}>
          Nama: Muhammad Agus
        </ThemedText>
        <ThemedText style={styles.identitasText}>
          NIM: 60324026
        </ThemedText>
        <ThemedText style={styles.statusText}>
          Status Lingkungan: Expo & Metro Bundler Siap
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Capaian Pembelajaran (Sub-CPMK 4.1)</ThemedText>
        <ThemedText>
          Berhasil menginisialisasi proyek React Native dan menjalankan Live Preview via Expo Go.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardContainer: {
    gap: 4,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(161, 206, 220, 0.15)',
  },
  identitasText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 4,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});