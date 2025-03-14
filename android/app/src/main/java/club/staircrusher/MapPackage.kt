package club.staircrusher

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext

class MapPackage : ReactPackage {
    override fun createNativeModules(p0: ReactApplicationContext): MutableList<NativeModule> {
        return emptyList<NativeModule>().toMutableList()
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ) = listOf(MapViewManager(reactContext))
}