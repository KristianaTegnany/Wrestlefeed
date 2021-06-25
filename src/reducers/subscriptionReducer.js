export const CHANGE_PRO = 'CHANGE_PRO'
const INITIAL_STATE = {
  isPro: false
};
  
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
    case CHANGE_PRO:
        return {
          ...state,
          isPro: action.data
        };
    default:
        return { ...state };
    }
};
  