import React, {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import InCallManager from 'react-native-incall-manager';
import {DeviceEventEmitter, EmitterSubscription, Platform} from 'react-native';
import {
  setAudioDevices,
  setSelectedAudioDevice,
} from '../store/redux/slices/wide-app/audio';
import logger from '../services/logger';

interface AudioDeviceChangedEvent {
  availableAudioDeviceList: string[];
  selectedAudioDevice: string;
}

const InCallManagerController: React.FC = () => {
  const audioIsConnected = useSelector((state: any) => state.audio.isConnected);
  const dispatch = useDispatch<any>();
  const nativeEventListeners = useRef<EmitterSubscription[]>([]);

  useEffect(() => {
    // InCallManager cannot get DeviceChange from iOS
    if (Platform.OS === 'ios') {
      return;
    }

    const subscription = DeviceEventEmitter.addListener(
      'onAudioDeviceChanged',
      (event: AudioDeviceChangedEvent) => {
        const {availableAudioDeviceList, selectedAudioDevice} = event;

        logger.info(
          {
            logCode: 'audio_devices_changed',
            extraInfo: {
              availableAudioDeviceList,
              selectedAudioDevice,
            },
          },
          `Audio devices changed: selected=${selectedAudioDevice} available=${availableAudioDeviceList}`,
        );

        dispatch(setAudioDevices(availableAudioDeviceList));
        dispatch(setSelectedAudioDevice(selectedAudioDevice));
      },
    );

    nativeEventListeners.current.push(subscription);

    return () => {
      nativeEventListeners.current.forEach(eventListener =>
        eventListener.remove(),
      );
    };
  }, [dispatch]);

  useEffect(() => {
    if (audioIsConnected) {
      InCallManager.start({media: 'video'});
      return;
    }
    InCallManager.stop({media: 'video'});
  }, [audioIsConnected]);

  return null;
};

export default InCallManagerController;
