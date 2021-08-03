import React from 'react'
import SpInAppUpdates, {
  IAUUpdateKind
} from 'sp-react-native-in-app-updates'
import {
  Platform
} from 'react-native'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'
import AppBase from './src/AppBase'
import reducers from './src/reducers'
import RNIap, {
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';  

import { Component } from 'react'

const store = createStore(reducers, {}, applyMiddleware(ReduxThunk))
class App extends Component {

  constructor(props) {
    super(props)
    this.inAppUpdates = new SpInAppUpdates(
      true
    )
    this.purchaseUpdateSubscription = null
    this.purchaseErrorSubscription = null
  }
  
  async componentDidMount() {
    this.checkForUpdates()
    
    RNIap.initConnection().then(() => {
      RNIap.flushFailedPurchasesCachedAsPendingAndroid().catch(() => {
      }).then(() => {
        this.purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
          const receipt = purchase.transactionReceipt
          if (receipt) {
            if (Platform.OS === 'ios') {
              await RNIap.finishTransactionIOS(purchase.transactionId)
            } else if (Platform.OS === 'android') {
              await RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken)
            }
            await RNIap.finishTransaction(purchase, false)
            // Eto no antsoina ilay API manao update Purchase
            if (Platform.OS === 'ios') {
              await RNIap.finishTransactionIOS(purchase.transactionId)
            } else if (Platform.OS === 'android') {
              await RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken)
            }
            await RNIap.finishTransaction(purchase, false)
          }
        })

        this.purchaseErrorSubscription = purchaseErrorListener((error) => {
          console.warn('purchaseErrorListener', error)
        })
      })
    }).catch(e => console.log('initConnection' + e))
  }

  componentWillUnmount() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove()
      this.purchaseUpdateSubscription = null
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove()
      this.purchaseErrorSubscription = null
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