/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import Settings from './settings.json';
import {registerGlobals} from '@livekit/react-native';
registerGlobals();
// import App from './App';
// export default App;
AppRegistry.registerComponent(appName, () => App);
