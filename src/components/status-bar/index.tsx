import React from 'react';
import {useSelector} from 'react-redux';
import {Platform, StatusBar} from 'react-native';
import Colors from '../../constants/colors';

const AppStatusBar = () => {
  const fullscreenActive = useSelector(state => state.layout.isFocused);
  const audioIsConnected = useSelector(state => state.audio.isConnected);
  const audioIsConnecting = useSelector(state => {
    return state.audio.isConnecting || state.audio.isReconnecting;
  });
  const clientIsDisconnected = useSelector(({client}) => {
    return (
      !client.sessionState.connected &&
      (client.sessionState.loggingIn ||
        (client.sessionState.loggedIn && !client.sessionState.loggingOut))
    );
  });

  const statusBarConnected = audioIsConnected && !clientIsDisconnected;
  const statusBarConnecting = audioIsConnecting || clientIsDisconnected;

  // Map Expo style -> React Native CLI barStyle
  let barStyle = 'default';
  if (Platform.OS === 'ios') {
    barStyle = 'light-content';
  } else {
    barStyle = statusBarConnecting ? 'dark-content' : 'light-content';
  }

  const backgroundColor = statusBarConnected
    ? Colors.statusBarConnected
    : statusBarConnecting
    ? Colors.statusBarConnecting
    : undefined; // null -> undefined

  return (
    <StatusBar
      backgroundColor={backgroundColor} // Android only
      barStyle={barStyle} // text/icons color
      hidden={fullscreenActive} // show/hide status bar
    />
  );
};

export default AppStatusBar;
