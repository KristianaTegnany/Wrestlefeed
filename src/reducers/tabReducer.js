const INITIAL_STATE = { data: '' };
  
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'ALL':
            return { ...state, data: action.data };
        case 'MEMES':
            return { ...state, data: action.data };
        default:
            return { ...state };
    }
};
  