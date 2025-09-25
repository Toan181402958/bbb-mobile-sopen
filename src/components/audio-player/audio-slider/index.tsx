import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import Slider from '@react-native-community/slider';
import ActivityBar from '../../activity-bar';
import UtilsService from '../../../utils/functions/index';
import Styled from './styles';
import Colors from '../../../constants/colors';
import logger from '../../../services/logger';
import Sound from 'react-native-sound';

const AudioSlider = props => {
  const {audioSource, positionFromServer, isPlayingFromServer, filename} =
    props;
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(1);
  const {t} = useTranslation();

  useEffect(() => {
    setIsPlaying(isPlayingFromServer);
  }, [isPlayingFromServer]);

  useEffect(() => {
    if (sound) {
      sound.setCurrentTime(positionFromServer); // sync position (seconds)
      setPosition(positionFromServer * 1000);
    }
  }, [positionFromServer]);

  useEffect(() => {
    if (sound && audioSource === null) {
      sound.stop(() => sound.release());
      setSound(null);
    }
  }, [audioSource]);

  useEffect(() => {
    const handlePlayPause = () => {
      if (!isPlaying) {
        pauseSound();
      } else {
        playSound();
      }
    };

    handlePlayPause();
  }, [isPlaying, filename]);

  const updatePosition = () => {
    if (sound) {
      sound.getCurrentTime(seconds => {
        setPosition(Math.floor(seconds) * 1000);
      });
    }
  };

  const handleVolumeChange = _volume => {
    const v = Number(_volume.toFixed(2));
    setVolume(v);
    if (sound) {
      sound.setVolume(v);
    }
  };

  const playSound = () => {
    if (sound) {
      sound.stop(() => sound.release());
    }

    const newSound = new Sound(
      audioSource?.uri || audioSource,
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          logger.warn({logCode: 'audio_player_play'}, `${error}`);
          return;
        }
        setDuration(newSound.getDuration() * 1000); // seconds -> ms
        newSound.setVolume(volume);
        newSound.play(success => {
          if (!success) {
            logger.warn({logCode: 'audio_player_play'}, 'Playback failed');
          }
        });
        setSound(newSound);
      },
    );
  };

  const pauseSound = () => {
    if (sound) {
      sound.pause();
    }
  };

  return (
    <Styled.Container>
      <Styled.FileNameText numberOfLines={1}>
        {filename || t('mobileSdk.audioPlayer.modal.loading')}
      </Styled.FileNameText>
      <Styled.SliderContainer>
        <Styled.DurationText>
          {UtilsService.humanizeSeconds(position / 1000)}
        </Styled.DurationText>
        <ActivityBar
          width={`${
            Math.floor(
              (Math.floor(position / 1000) / Math.floor(duration / 1000)) * 100,
            ) || 0
          }%`}
          style={{flex: 1}}
        />
        <Styled.DurationText>
          {UtilsService.humanizeSeconds(Math.floor(duration / 1000))}
        </Styled.DurationText>
      </Styled.SliderContainer>
      <Styled.VolumeContainer>
        <Styled.VolumeComponent
          volumeLevel={volume}
          onPress={() => handleVolumeChange(volume > 0 ? 0 : 0.5)}
        />
        <Slider
          style={{width: 150, height: 40}}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          step={0.1}
          thumbTintColor={Colors.lightBlue}
          disabled={!sound}
          minimumTrackTintColor={Colors.lightBlue}
          maximumTrackTintColor={Colors.lightGray100}
          onValueChange={handleVolumeChange}
        />
      </Styled.VolumeContainer>
    </Styled.Container>
  );
};

export default AudioSlider;
