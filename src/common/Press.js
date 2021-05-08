import { TouchableOpacity as TouchableOpacityGesture } from 'react-native-gesture-handler';
import { TouchableOpacity as TouchableOpacityNative } from 'react-native';

export const
	TouchableComponent = Platform.select({ // workaround for reanimated-bottom-sheet
            ios: TouchableOpacityNative,
            android: TouchableOpacityGesture,
	});
;