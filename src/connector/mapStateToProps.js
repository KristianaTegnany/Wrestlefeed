const mapStateToProps = states => {
  return (state) => {
    if(states.includes('*')) return {...state}
    else return states.reduce((obj, key) => ({...obj, [key]: state[key]}), {})
  }
}

export default mapStateToProps;
