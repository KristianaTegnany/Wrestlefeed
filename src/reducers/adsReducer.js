const INITIAL_STATE = { adsShouldRefreshed: false };
  
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
    case 'REFRESH_ADS':
        return { ...state, adsShouldRefreshed: action.payload };
    default:
        return { ...state };
    }
};
  