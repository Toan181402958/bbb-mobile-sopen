// import MeetingClientSettings from '../../types/meetingClientSettings';
import meetingClientSettingsInitialValues from './initial-values/meetingClientSettings';
import createUseLocalState from './createUseLocalState';

const initialMeetingSeetings: any = meetingClientSettingsInitialValues;
const [useMeetingSettings, setMeetingSettings] = createUseLocalState<any>(
  initialMeetingSeetings,
);

export default useMeetingSettings;
export {setMeetingSettings};
