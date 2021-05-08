import AsyncStorage from "@react-native-community/async-storage";

export const updateDarkMode = (is_change, status) => {
    return (dispatch) => {
        if(is_change){
            dispatch({ type: 'DARK_MODE', data: !status });
            if(status){
                AsyncStorage.removeItem("dark_mode");
            }else{
                AsyncStorage.setItem("dark_mode", "true")
            }
        }else{
            AsyncStorage.getItem('dark_mode').then((resDark) => {
                if(resDark){
                    dispatch({ type: 'DARK_MODE', data: true });
                }else{
                    dispatch({ type: 'DARK_MODE', data: false });
                }
            })
        }
    }
};