/* eslint max-classes-per-file: 0 */
import React from 'react';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import {createLogger, stdSerializers} from 'browser-bunyan';
import {ConsoleFormattedStream} from '@browser-bunyan/console-formatted-stream';
import {ConsoleRawStream} from '@browser-bunyan/console-raw-stream';
import {nameFromLevel} from '@browser-bunyan/levels';
import {ServerStream} from './server-stream';
import Settings from '../../../settings.json';

// App version & build number
const APP_VERSION = DeviceInfo.getVersion();
const BUILD_NUMBER = parseInt(DeviceInfo.getBuildNumber(), 10) || 0;

// Device info (some fields are async, here we use sync placeholders)
const DEVICE_INFORMATION = {
  brand: DeviceInfo.getBrand(),
  modelName: DeviceInfo.getModel(),
  deviceName: '', // optional: can fetch async via getDeviceName()
  manufacturer: '', // optional: can fetch async via getManufacturer()
  systemName: DeviceInfo.getSystemName(),
  systemVersion: DeviceInfo.getSystemVersion(),
  apiLevel: DeviceInfo.getApiLevelSync
    ? DeviceInfo.getApiLevelSync()
    : undefined,
  totalMemory: DeviceInfo.getTotalMemorySync
    ? DeviceInfo.getTotalMemorySync()
    : undefined,
};

// Logger configuration
const LOG_CONFIG = Settings.clientLog || {
  console: {enabled: true, level: 'debug'},
  server: {enabled: false, level: 'debug'},
};

// Auth & session functions (injectable)
let getAuthInfo = () => ({});
let makeCall = () => {};
let getCurrentSessionId = () => {};

export const injectMakeCall = (func: typeof makeCall) => {
  makeCall = func;
};
export const injectAuthInfoFetcher = (func: typeof getAuthInfo) => {
  getAuthInfo = func;
};
export const injectSessionIdFetcher = (func: typeof getCurrentSessionId) => {
  getCurrentSessionId = func;
};

// =====================
// Custom streams
// =====================

// 1. Stream to log to a remote server endpoint
class ServerLoggerStream extends ServerStream {
  static getRemoteLogEndpointURL(host: string, route: string) {
    return `https://${host}/${route}`;
  }

  private _connected = false;
  private logTagString?: string;
  private route?: string;
  private rec: any;

  constructor(options: {
    flushOnClose?: boolean;
    logTag?: string;
    method?: string;
    throttleInterval?: number;
    route?: string;
  }) {
    super(options);

    if (options.logTag) this.logTagString = options.logTag;
    if (options.route) this.route = options.route;

    this._trackConnectivityState();
    this.writeCondition = this._writeCondition.bind(this);
  }

  private _trackConnectivityState() {
    NetInfo.addEventListener(({isConnected}) => {
      this._connected = isConnected;
    });
  }

  private _writeCondition() {
    return this._connected;
  }

  write(rec: any) {
    const fullInfo = getAuthInfo();
    if (fullInfo?.host) {
      const remoteEndpointURL = ServerLoggerStream.getRemoteLogEndpointURL(
        fullInfo.host,
        this.route || '',
      );
      if (this.url !== remoteEndpointURL) this.url = remoteEndpointURL;
    }

    this.rec = rec;
    if (fullInfo?.meetingId != null) {
      this.rec.userInfo = fullInfo;
    }
    this.rec.appVersion = APP_VERSION;
    this.rec.clientBuild = BUILD_NUMBER;
    this.rec.deviceInformation = DEVICE_INFORMATION;
    this.rec.connectionId = getCurrentSessionId();
    if (this.logTagString) this.rec.logTag = this.logTagString;

    return super.write(this.rec);
  }
}

// 2. Stream to log to Meteor server
class MeteorStream {
  private rec: any;

  write(rec: any) {
    const fullInfo = getAuthInfo();
    this.rec = rec;

    const extraInfo = this.rec.extraInfo || {};

    try {
      if (fullInfo?.meetingId != null) {
        makeCall(
          'logClient',
          nameFromLevel[this.rec.level],
          this.rec.msg,
          this.rec.logCode,
          extraInfo,
          fullInfo,
        );
      } else {
        makeCall(
          'logClient',
          nameFromLevel[this.rec.level],
          this.rec.msg,
          this.rec.logCode,
          extraInfo,
        );
      }
    } catch (error) {
      console.debug('Logger makeCall failed', error);
    }
  }
}

// =====================
// Logger setup helpers
// =====================

function createStreamForTarget(target: string, options: any) {
  switch (target) {
    case 'external':
      return new ServerLoggerStream(options);
    case 'console':
      return new ConsoleFormattedStream(options);
    case 'server':
      return new MeteorStream();
    default:
      return new ConsoleFormattedStream(options);
  }
}

function generateLoggerStreams(config: any) {
  let result: any[] = [];
  Object.keys(config).forEach(key => {
    const logOption = config[key];
    if (logOption?.enabled) {
      const {level, ...streamOptions} = logOption;
      result.push({
        level,
        stream: createStreamForTarget(key, streamOptions),
      });
    }
  });
  return result;
}

// =====================
// Logger creation
// =====================

const logger = createLogger({
  name: 'clientLogger',
  streams: generateLoggerStreams(LOG_CONFIG),
  serializers: stdSerializers,
  src: true,
});

export default logger;
