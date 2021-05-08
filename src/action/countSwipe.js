export const countSwipe = swipe => {
    return dispatch => {
        dispatch({ type: 'COUNT_SWIPE', count: swipe.count });
    };
};