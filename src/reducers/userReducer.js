const INITIAL_STATE = {
  dark_mode: true,
  tab_name: 'NEWS',
  
};
  
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
    case 'DARK_MODE':
        return { ...state, dark_mode: action.data };
    case 'TAB_UPDATE':
        return { ...state, tab_name: action.data };
    default:
        return { ...state };
    }
};
  