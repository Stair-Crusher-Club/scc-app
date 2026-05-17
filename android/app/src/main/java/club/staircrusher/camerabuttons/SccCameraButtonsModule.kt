package club.staircrusher.camerabuttons

import android.util.Log
import android.view.KeyEvent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class SccCameraButtonsModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

    @Volatile
    private var attached: Boolean = false

    init {
        activeInstance = this
    }

    override fun invalidate() {
        super.invalidate()
        if (activeInstance === this) {
            activeInstance = null
        }
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun attach(promise: Promise) {
        attached = true
        Log.d(TAG, "attach() -> attached=true")
        promise.resolve(true)
    }

    @ReactMethod
    fun detach(promise: Promise) {
        attached = false
        Log.d(TAG, "detach() -> attached=false")
        promise.resolve(true)
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
        Log.d(TAG, "handleKeyEvent attached=$attached action=${event.action} keyCode=${event.keyCode} repeat=${event.repeatCount}")
        if (!attached) return false
        if (event.action != KeyEvent.ACTION_DOWN) return false
        if (event.keyCode != KeyEvent.KEYCODE_VOLUME_UP && event.keyCode != KeyEvent.KEYCODE_VOLUME_DOWN) {
            return false
        }
        // Ignore key repeats so holding the button doesn't fire continuously.
        if (event.repeatCount > 0) return true

        // bridgeless-safe emit. ReactContext.emitDeviceEvent는 내부에서 getJSModule null 체크를 한다.
        try {
            reactContext.emitDeviceEvent(EVENT_CAPTURE_PRESS, null)
            Log.d(TAG, "emitted $EVENT_CAPTURE_PRESS")
        } catch (e: Throwable) {
            Log.e(TAG, "emit failed", e)
        }
        return true
    }

    companion object {
        const val NAME = "SccCameraButtons"
        const val EVENT_CAPTURE_PRESS = "SccCameraButtonsCapturePress"
        const val TAG = "SccCameraButtons"

        // bridgeless 모드에서 ReactContext.getNativeModule(...) 이 legacy ReactPackage로 등록된
        // 모듈을 찾지 못하는 케이스가 있어, MainActivity가 lookup 없이 직접 호출할 수 있도록
        // 활성 인스턴스를 static 슬롯에 보관한다.
        @Volatile
        private var activeInstance: SccCameraButtonsModule? = null

        @JvmStatic
        fun dispatchKeyEventToActiveInstance(event: KeyEvent): Boolean {
            return activeInstance?.handleKeyEvent(event) ?: false
        }
    }
}
