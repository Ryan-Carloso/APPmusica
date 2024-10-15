import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import axios from 'axios';

const DownloadAudio = () => {
    const [videoURL, setVideoURL] = useState('');
    const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]);
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    const downloadAudio = async () => {
        if (!videoURL) {
            Alert.alert('Erro', 'Por favor, insira um link do YouTube.');
            return;
        }

        try {
            // Chamada à API para obter o link do áudio
            const response = await axios.post('https://ytmp3.cc/en15/convert', {
                url: videoURL,
                format: 'mp3',
            });

            // Suponha que a URL do áudio esteja na resposta
            const audioFileURL = response.data.link; // Ajuste conforme a resposta da API

            const fileName = `audio_${Date.now()}.mp3`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            // Faça o download do áudio
            const downloadObject = FileSystem.createDownloadResumable(
                audioFileURL,
                fileUri
            );
            const { uri } = await downloadObject.downloadAsync();
            console.log('Download completo!', uri);
            listDownloadedFiles(); // Atualiza a lista de arquivos baixados
        } catch (error) {
            console.error('Erro no download:', error);
            Alert.alert('Erro', 'Não foi possível baixar o áudio.');
        }
    };

    const listDownloadedFiles = async () => {
        const directoryUri = FileSystem.documentDirectory;
        const files = await FileSystem.readDirectoryAsync(directoryUri);
        setDownloadedFiles(files);
    };

    const playAudio = async (filePath: string) => {
        if (sound) {
            await sound.unloadAsync(); // Para evitar que o áudio anterior continue tocando
        }

        const { sound: newSound } = await Audio.Sound.createAsync({ uri: filePath });
        setSound(newSound);
        await newSound.playAsync(); // Inicia a reprodução do áudio
    };

    useEffect(() => {
        listDownloadedFiles(); // Chama ao iniciar o componente
    }, []);

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Insira o link do YouTube"
                value={videoURL}
                onChangeText={setVideoURL}
                style={styles.input}
            />
            <Button title="Baixar Áudio" onPress={downloadAudio} />
            <Text style={styles.title}>Arquivos Baixados:</Text>
            <FlatList
                data={downloadedFiles}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => playAudio(`${FileSystem.documentDirectory}${item}`)}>
                        <Text style={styles.audioItem}>{item}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
    },
    title: {
        marginVertical: 20,
        fontSize: 18,
        fontWeight: 'bold',
    },
    audioItem: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        marginVertical: 5,
        elevation: 2,
    },
});

export default DownloadAudio;