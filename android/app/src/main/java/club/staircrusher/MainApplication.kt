package club.staircrusher;

import android.app.Application
import android.util.Log
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
import java.io.File

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
                Log.e("DEADBEEF", "just check fetch correctly")
                val str = HotUpdater.getJSBundleFile(applicationContext)
                Log.e("DEADBEEF", "yeah no problem")
                return str
            }
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(this.applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        clean()
        loadReactNative(this)
    }

    private fun clean() {
        try {
            val prefs = getSharedPreferences("app_migrations", MODE_PRIVATE)
            val now = packageManager.getPackageInfo(packageName, 0).versionCode
            val last = prefs.getInt("cleanedForVersionCode", -1)
            if (last != now) {
                listOf(
                    File(filesDir, "CodePush"),
                    File(filesDir, "ReactNativeDevBundle"),
                    File(filesDir, "RNCodeCache"),
                    File(filesDir, "com.facebook.react.devsupport"),
                    cacheDir
                ).forEach { it.deleteRecursively() }
                getExternalFilesDirs(null).forEach { dir ->
                    if (dir != null) {
                        val bundleStoreDir = File(dir, "bundle-store")
                        if (bundleStoreDir.exists()) {
                            bundleStoreDir.deleteRecursively()
                        }
                    }
                }
                prefs.edit().putInt("cleanedForVersionCode", now).apply()
            }
        } catch (e: Exception) {
            Log.e("CleanRN", "clean failed", e)
        }
    }
}