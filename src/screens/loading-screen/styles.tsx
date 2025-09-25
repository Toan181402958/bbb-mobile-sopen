import React from 'react';
import {ActivityIndicator} from 'react-native-paper';
import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: #f5f5f5;
`;

const TitleText = styled.Text`
  font-size: 24px;
  font-weight: 500;
  text-align: center;
  color: ${Colors.black};
`;

const Loading = () => <ActivityIndicator color={Colors.black} size={40} />;

export default {
  ContainerView,
  TitleText,
  Loading,
};
