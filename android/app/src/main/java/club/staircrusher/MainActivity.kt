package club.staircrusher;

import android.content.Intent
import android.os.Bundle;
import android.view.KeyEvent
import co.ab180.airbridge.reactnative.AirbridgeReactNative
import club.staircrusher.camerabuttons.SccCameraButtonsModule
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactApplication
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import org.devio.rn.splashscreen.SplashScreen;

class MainActivity : ReactActivity() {

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "StairCrusherClub"

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        SplashScreen.show(this)
        // https://github.com/software-mansion/react-native-screens/issues/17#issuecomment-424704067
        super.onCreate(null)
    }

    override fun onResume() {
        super.onResume()
        AirbridgeReactNative.trackDeeplink(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (event.keyCode == KeyEvent.KEYCODE_VOLUME_UP || event.keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            try {
                // 우리 앱은 bridgeless(new architecture)라 reactInstanceManager 직접 접근은
                // throw를 일으킨다. application.reactHost.currentReactContext 경유로 안전하게 조회.
                val reactContext = (application as? ReactApplication)?.reactHost?.currentReactContext
                val module = reactContext?.getNativeModule(SccCameraButtonsModule::class.java)
                if (module?.handleKeyEvent(event) == true) {
                    return true
                }
            } catch (e: Throwable) {
                // 어떤 이유로든 module lookup이 실패하면 시스템 기본 동작으로 넘긴다.
            }
        }
        return super.dispatchKeyEvent(event)
    }
}
