package club.staircrusher;

import android.content.Intent
import android.os.Bundle;
import android.util.Log
import android.view.KeyEvent
import co.ab180.airbridge.reactnative.AirbridgeReactNative
import club.staircrusher.camerabuttons.SccCameraButtonsModule
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
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
        // ACTION_SEND intent를 React Native 초기화 전에 static으로 저장.
        // getCurrentActivity()가 null일 수 있는 타이밍 문제를 우회.
        extractAndSavePendingShareText(intent)
    }

    override fun onResume() {
        super.onResume()
        intent?.let { AirbridgeReactNative.trackDeeplink(it) }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        extractAndSavePendingShareText(intent)
    }

    private fun extractAndSavePendingShareText(intent: Intent?) {
        if (intent?.action == Intent.ACTION_SEND && intent.type == "text/plain") {
            val text = intent.getStringExtra(Intent.EXTRA_TEXT)
            if (!text.isNullOrBlank()) {
                pendingShareText = text
            }
        }
    }

    companion object {
        var pendingShareText: String? = null
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (event.keyCode == KeyEvent.KEYCODE_VOLUME_UP || event.keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            // bridgeless 모드에서 ReactContext.getNativeModule 이 legacy package 모듈을 못 찾는
            // 케이스가 있어, 모듈이 자신을 static 슬롯에 등록하고 그 슬롯을 거쳐 호출한다.
            try {
                if (SccCameraButtonsModule.dispatchKeyEventToActiveInstance(event)) {
                    return true
                }
            } catch (e: Throwable) {
                Log.e("SccCameraButtons", "dispatchKeyEvent failed", e)
            }
        }
        return super.dispatchKeyEvent(event)
    }
}
