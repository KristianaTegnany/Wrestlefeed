import React, { useEffect } from 'react'
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

const store = createStore(reducers, {}, applyMiddleware(ReduxThunk))
const App = () => {
  const inAppUpdates = new SpInAppUpdates(true)

  useEffect(() => {
    checkForUpdates();

    // TEst
    (async _ => {
      console.log('GOING TO CONNECT');
      const result = await RNIap.initConnection();
      console.log('connection is => ', result);
      // const products = await RNIap.getProducts(productIds)
      // console.log("vtdjckyfkvvk", products)
    })()
  }, [])

  checkForUpdates = () => {
    inAppUpdates
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
          inAppUpdates.startUpdate(updateOptions)
        }
      })
      .catch((error) => {
        
      })
  }

  return (
    <Provider store={store}>
      <AppBase />
    </Provider>
  )
}

export default App