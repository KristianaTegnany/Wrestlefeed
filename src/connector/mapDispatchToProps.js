import * as actions from "../action";

const loadAll = (dispatch, actions) => {
  return Object.getOwnPropertyNames(actions).reduce((obj, key) => {
    if (typeof actions[key] === "function")
      obj[key] = (...params) => dispatch(actions[key](...params));
    return obj;
  }, {});
};

const mapDispatchToProps = (dispatch) => ({
  ...loadAll(dispatch, actions),
});

export default mapDispatchToProps;
