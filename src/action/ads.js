export const refreshAds = (isRefreshed) => {
    return dispatch => {
        dispatch({ type: 'REFRESH_ADS', payload: isRefreshed });
    };
};