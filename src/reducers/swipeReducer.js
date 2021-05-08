const INITIAL_STATE = { count: 0 };
  
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
    case 'COUNT_SWIPE':
        return { ...state, count: action.count };
    default:
        return { ...state };
    }
};
  