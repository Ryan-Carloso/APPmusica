import React from 'react';
import { SafeAreaView } from 'react-native';
import DownloadAudio from '../components/DownloadAudio';

const App = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <DownloadAudio />
        </SafeAreaView>
    );
};

export default App;