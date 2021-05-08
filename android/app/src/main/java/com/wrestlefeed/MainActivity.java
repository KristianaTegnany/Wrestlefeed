package com.wrestlefeed;

import android.os.Bundle;
import org.devio.rn.splashscreen.SplashScreen;
import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
   @Override
    protected void onCreate(Bundle savedInstanceState) {
        // setTheme(R.style.SplashStatusBarTheme);
        // setContentView(R.layout.launch_screen);
        // SplashScreen.show(this);
        SplashScreen.show(this, R.style.SplashTheme);
        super.onCreate(savedInstanceState);
    }

    @Override
    protected String getMainComponentName() {
        return "wrestlefeed";
    }
}
