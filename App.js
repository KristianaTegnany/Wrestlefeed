import React from 'react'
import SpInAppUpdates, {
  IAUUpdateKind
} from 'sp-react-native-in-app-updates'
import moment from 'moment'
import {
  Platform
} from 'react-native'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'
import AppBase from './src/AppBase'
import reducers from './src/reducers'
import RNIap from 'react-native-iap';  

import { Component } from 'react'

const store = createStore(reducers, {}, applyMiddleware(ReduxThunk))
class App extends Component {

  constructor(props) {
    super(props)
    this.inAppUpdates = new SpInAppUpdates(
      true
    )
  }
  
  async componentDidMount() {
    this.checkForUpdates()
    try {
      await RNIap.initConnection();
      await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
      //const purchases = await RNIap.getAvailablePurchases();
      //console.info('Available purchases : ', moment(purchases.sort((a, b) => b.transactionDate - a.transactionDate)[0].transactionDate).format('DD/MM/YYYY HH:mm'));
    } catch (err) {
      console.warn(err.code, err.message);
    }
  }
  
  checkForUpdates = () => {
    this.inAppUpdates
      .checkNeedsUpdate({
        curVersion: Platform.select({
          android: '42',
          ios: '1.9'
        })
      })
      .then((result) => {
         if (result && result.shouldUpdate) {
          let updateOptions = {}
          if (Platform.OS === 'android') {
            updateOptions = {
              updateType: IAUUpdateKind.IMMEDIATE,
            }
          }
          this.inAppUpdates.startUpdate(updateOptions)
        }
      })
      .catch((error) => {
        
      })
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