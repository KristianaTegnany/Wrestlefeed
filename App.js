import React from 'react'
import SpInAppUpdates, {
  IAUUpdateKind
} from 'sp-react-native-in-app-updates'
import RNIap, {
  purchaseErrorListener,
  purchaseUpdatedListener
} from 'react-native-iap'

import {
  Platform
} from 'react-native'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'
import AppBase from './src/AppBase'
import reducers from './src/reducers'
import RNIap, {
  Product,
  ProductPurchase,
  PurchaseError,
  acknowledgePurchaseAndroid,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';  

const productIds = Platform.select({
  ios: [
    'com.example.coins100'
  ],
  android: [
    'pro_user'
  ]
});
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
          console.log('purchaseUpdatedListener', purchase)
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
        //curVersion: '0.0.8'
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