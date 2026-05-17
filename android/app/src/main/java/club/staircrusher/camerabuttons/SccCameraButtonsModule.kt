package club.staircrusher.camerabuttons

import android.view.KeyEvent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class SccCameraButtonsModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

    @Volatile
    private var attached: Boolean = false

    override fun getName(): String = NAME

    @ReactMethod
    fun attach() {
        attached = true
    }

    @ReactMethod
    fun detach() {
        attached = false
    }

    // RN built-in EventEmitter API. JS side calls these to add/remove listener counts.
    @ReactMethod
    fun addListener(eventName: String) {
        // no-op
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // no-op
    }

    /**
     * Called from MainActivity.dispatchKeyEvent. Returns true if the event was consumed.
     */
    fun handleKeyEvent(event: KeyEvent): Boolean {
        if (!attached) return false
        if (event.action != KeyEvent.ACTION_DOWN) return false
        if (event.keyCode != KeyEvent.KEYCODE_VOLUME_UP && event.keyCode != KeyEvent.KEYCODE_VOLUME_DOWN) {
            return false
        }
        // Ignore key repeats so holding the button doesn't fire continuously.
        if (event.repeatCount > 0) return true

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EVENT_CAPTURE_PRESS, null)
        return true
    }

    companion object {
        const val NAME = "SccCameraButtons"
        const val EVENT_CAPTURE_PRESS = "SccCameraButtonsCapturePress"
    }
}
