package club.staircrusher;

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.ViewManagerOnDemandReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
import com.hotupdater.HotUpdater

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    // Packages that cannot be autolinked yet can be added manually here, for example:
                    add(object : ReactPackage, ViewManagerOnDemandReactPackage {
                        override fun getViewManagerNames(reactContext: ReactApplicationContext) =
                            listOf(
                                "SccMapView",
                                "RNTMyLegacyNativeView",
                                "RNTReportFullyDrawnView"
                            )

                        override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
                            return emptyList()
                        }

                        override fun createViewManagers(
                            reactContext: ReactApplicationContext
                        ): List<ViewManager<*, *>> =
                            listOf(SccMapViewManager())


                        override fun createViewManager(
                            reactContext: ReactApplicationContext,
                            viewManagerName: String
                        ): ViewManager<*, out ReactShadowNode<*>>? =
                            when (viewManagerName) {
                                "SccMapView" -> SccMapViewManager()
                                else -> null
                            }
                    })
                }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED

            override fun getJSBundleFile(): String? {
                return HotUpdater.getJSBundleFile(applicationContext)
            }
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(this.applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        loadReactNative(this)
    }
}