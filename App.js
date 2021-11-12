import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import AppLoading from 'expo-app-loading';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Audio } from 'expo-av';
import moment from 'moment';
import { AntDesign, FontAwesome } from '@expo/vector-icons'; 
import { useFonts } from 'expo-font';

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const [sound, setSound] = React.useState();
  const [mode, setMode] = React.useState(0);    //0: start state, 1: ready to scan, 2: playing sound, 3: sound stopped
  const [loading, setLoading] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  let [fontsLoaded] = useFonts({
    'JosefinSans': require('./assets/fonts/JosefinSans.ttf'),
  });

  async function playSound(id) {
    let uri = ''
    switch(id) {
      case 'intro': 
        uri = 'https://firebasestorage.googleapis.com/v0/b/dailies-f17d7.appspot.com/o/SilentEpidemic%2Fintroduction.mp3?alt=media&token=05ed19e7-cf8c-434a-b502-24c2ca9fdb44';
      break;
      case 'facts': 
        uri = 'https://firebasestorage.googleapis.com/v0/b/dailies-f17d7.appspot.com/o/SilentEpidemic%2Ffacts.mp3?alt=media&token=31b606bb-f75f-482b-ab10-402fa69e0a77';
        break;
      case 'origins':
        uri = 'https://firebasestorage.googleapis.com/v0/b/dailies-f17d7.appspot.com/o/SilentEpidemic%2Forigins.mp3?alt=media&token=8521f6e4-d8f6-40e2-b64a-448683870525';
        break;
      case 'symptoms':
        uri = 'https://firebasestorage.googleapis.com/v0/b/dailies-f17d7.appspot.com/o/SilentEpidemic%2Fsymptoms.mp3?alt=media&token=2becb4dc-0eed-4f10-9352-413308b06723';
        break;
      case 'spread':
        uri = 'https://firebasestorage.googleapis.com/v0/b/dailies-f17d7.appspot.com/o/SilentEpidemic%2Fspread.mp3?alt=media&token=d3b442e2-ed56-4f9a-81f3-f7fead8ce99a';
        break;
      case 'impact':
        uri = 'https://firebasestorage.googleapis.com/v0/b/dailies-f17d7.appspot.com/o/SilentEpidemic%2Fimpact.mp3?alt=media&token=1d695e19-c645-409f-9739-fe0dae397f17';
        break;
      case 'steps':
        uri = 'https://firebasestorage.googleapis.com/v0/b/dailies-f17d7.appspot.com/o/SilentEpidemic%2Fsteps.mp3?alt=media&token=6e56cb35-997c-415a-bb8e-a78098ec1b2b';
        break;
      case 'track':
        uri = 'https://firebasestorage.googleapis.com/v0/b/dailies-f17d7.appspot.com/o/SilentEpidemic%2Ftrack.mp3?alt=media&token=811421ab-8cca-4d6e-878b-d7e667cd5224';
        break;
      case 'air':
        uri = 'https://firebasestorage.googleapis.com/v0/b/dailies-f17d7.appspot.com/o/SilentEpidemic%2Fair.mp3?alt=media&token=eec4cffb-9f97-4072-8a2e-bd13504ad5a9';
        break;
      default:
        uri = 'https://firebasestorage.googleapis.com/v0/b/dailies-f17d7.appspot.com/o/SilentEpidemic%2Ferror.mp3?alt=media&token=b300f434-15c6-4807-912f-9e3c0818eeb4';
      break;
    }
    if(uri === '') {
      setMode(1);
    }
    if (uri != '') {
      const { sound } = await Audio.Sound.createAsync(
       {uri}
      );
      setSound(sound);
      sound.setOnPlaybackStatusUpdate((object) => {
        setLoading(false); 
        setPosition(object.positionMillis);
        setDuration(object.durationMillis);
        if(object.didJustFinish){
          setMode(3);
        }
      })
  
      console.log('Playing Sound');

      await sound.playAsync();

    }

  }

  React.useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync(); }
      : undefined;
  }, [sound]);


  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setMode(2);
    setLoading(true);
    playSound(data);
  };

  const stopPressed = () => {
    sound.stopAsync();
    setMode(3);
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://firebasestorage.googleapis.com/v0/b/dailies-f17d7.appspot.com/o/dailies%2Fbackground(1).png?alt=media&token=9e531b10-c51c-4c7e-8807-924c5e9e0312',
        }}
        resizeMode="cover"
        style={styles.bg}
      >
      {mode === 1 && <BarCodeScanner
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />}
      {mode === 1 && <View style={styles.box} />}
      {(mode === 2) && 
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        {!loading && ((duration-position > 0) && (<Text style={styles.time}>{`${moment(duration-position).format('mm:ss')}`}</Text>) || <Text style={styles.time}>00:00</Text>)}
        {loading && (<Text style={styles.time}>Loading...</Text>)}
        <View style={styles.circle}>
          <TouchableOpacity style={{flex: 1, width: '100%'}} onPress={stopPressed} >
            <View style={[styles.circle2, styles.circleButton]}>
              <FontAwesome name="stop" size={40} color="gold" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      }
      {(mode === 0 || mode === 3) &&
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        {(mode === 0) &&         
          <Text style={styles.text}>
            Welcome! Touch the button below, and scan an Info Point to start listening. 
          </Text>
        }
        {(mode === 3) && 
          <Text style={styles.time}>
            Touch to scan 
        </Text>
        }
        <View style={styles.circle}>
          <TouchableOpacity style={{flex: 1, width: '100%'}} onPress={() => setMode(1)} >
            <View style={[styles.circle2, styles.circleButton]}>
              <AntDesign name="scan1" size={40} color="gold" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      }
      </ImageBackground>
      <StatusBar style="transparent" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderColor: 'gold',
    borderRadius: 10
  },
  time: {
    fontFamily: 'JosefinSans',
    textAlign: 'center',
    color: '#fff',
    fontSize: 60,
    padding: 16
  },
  text: {
    fontFamily: 'JosefinSans',
    textAlign: 'center',
    color: '#fff',
    fontSize: 30,
    padding: 16
  },
  circle: {
    backgroundColor: 'transparent',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  circle2: {
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: 'gold',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  circleButton: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  }
});





