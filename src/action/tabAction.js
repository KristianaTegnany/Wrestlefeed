
export const pushTabData = (tab_name, tab_data) => {
    return (dispatch) => {
        if(tab_name == 'ALL'){
            dispatch({ type: tab_name, data: tab_data });
        }
    }
};