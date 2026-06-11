package club.staircrusher

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class ShareIntentModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ShareIntentModule"

    @ReactMethod
    fun getPendingShareText(promise: Promise) {
        val text = MainActivity.pendingShareText
        MainActivity.pendingShareText = null  // 읽으면 바로 clear
        promise.resolve(text)
    }
}
