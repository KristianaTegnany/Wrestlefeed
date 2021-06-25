import {connect} from 'react-redux'
import mapStateToProps from './mapStateToProps'
import mapDispatchToProps from './mapDispatchToProps'

export default (component, states=['*']) => {
  return connect(mapStateToProps(states), mapDispatchToProps)(component)
}