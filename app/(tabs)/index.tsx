import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, ScrollView } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider as PaperProvider, Appbar, List } from 'react-native-paper';

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  const [showScanner, setShowScanner] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const storedCodes = await AsyncStorage.getItem('@codes');
      if (storedCodes !== null) {
        setCodes(JSON.parse(storedCodes));
      }
    } catch (error) {
      console.error('Erro ao carregar códigos:', error);
    }
  };

  const saveCode = async (code: string) => {
    try {
      const newCodes = [...codes, code];
      setCodes(newCodes);
      await AsyncStorage.setItem('@codes', JSON.stringify(newCodes));
    } catch (error) {
      console.error('Erro ao salvar código:', error);
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    if (!codes.includes(data)) {
      saveCode(data);
    }
    alert(`Código lido: ${data}`);
  };

  const generateReport = () => {
    const report = codes.join('\n');
    alert('Relatório:\n' + report);
  };

  if (hasPermission === null) {
    return <Text>Solicitando permissão para acessar a câmera...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Sem acesso à câmera</Text>;
  }

  return (
    <PaperProvider>
      <Appbar.Header>
        <Appbar.Content title="Leitor de Códigos" />
        <Appbar.Action icon="file" onPress={generateReport} />
      </Appbar.Header>
      <View style={styles.container}>
        {showScanner ? (
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <ScrollView>
            <List.Section>
              <List.Subheader>Códigos Lidos</List.Subheader>
              {codes.map((code, index) => (
                <List.Item key={index} title={code} />
              ))}
            </List.Section>
          </ScrollView>
        )}
        {scanned && <Button title="Escanear Novamente" onPress={() => setScanned(false)} />}
        <Button
          title={showScanner ? 'Ver Relatório' : 'Voltar ao Scanner'}
          onPress={() => setShowScanner(!showScanner)}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
