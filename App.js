import React from 'react'
import {
  Alert,
  BackHandler,
  Linking
} from 'react-native'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'
import AppBase from './src/AppBase'
import reducers from './src/reducers'
import VersionCheck from 'react-native-version-check';
import { Component } from 'react'

const store = createStore(reducers, {}, applyMiddleware(ReduxThunk))
class App extends Component {
  
  async componentDidMount() {
    //this.checkForUpdates()
  }

  checkForUpdates = async () => {
    try {
      let updateNeeded = await VersionCheck.needUpdate();
      if (updateNeeded && updateNeeded.isNeeded) {
        Alert.alert(
          'Please Update', 
          'You will have to update your app to the latest version to continue using.',
          [
            {
              text: 'Update',
              onPress: () => {
                BackHandler.exitApp();
                Linking.openURL(updateNeeded.storeUrl)
              }
            }
          ],
          { cancelable: false }
        )
      }
    } catch(error) {
      console.log(error)
    }
  }

  render () {
    return (
      <Provider store={store}>
        <AppBase />
      </Provider>
    )
  }
}

export default App