package club.staircrusher

import android.util.Log
import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.LayoutShadowNode
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIViewOperationQueue
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.naver.maps.geometry.LatLng
import com.naver.maps.geometry.LatLngBounds


class MapViewManager(
    private val appContext: ReactApplicationContext
) : ViewGroupManager<MapView>() {

    override fun getName() = REACT_CLASS

    /**
     * Return a FrameLayout which will later hold the Fragment
     */
    override fun createViewInstance(reactContext: ThemedReactContext) =
        MapView(reactContext, this.appContext, this)

    override fun getCommandsMap() =
        mapOf(
            "animateCamera" to COMMAND_ANIMATE_CAMERA,
            "fitToElements" to COMMAND_FIT_TO_ELEMENTS,
            "animateToRegion" to COMMAND_ANIMATE_TO_REGION,
        )

    /**
     * Handle "create" command (called from JS) and call createFragment method
     */
    override fun receiveCommand(
        root: MapView,
        commandId: String,
        args: ReadableArray?
    ) {
        super.receiveCommand(root, commandId, args)
        when (commandId) {
            "animateCamera" -> {
                args?.let {
                    val camera = args.getMap(0)
                    val duration = args.getInt(1)
                    val center = camera.getMap("center") ?: return
                    val target = LatLng(center.getDouble("latitude"), center.getDouble("longitude"))
                    root.animateCamera(target, duration)
                }
            }

            "fitToElements" -> {
                args?.let {
                    root.fitToElements()
                }
            }

            "animateToRegion" -> {
                args?.let {
                    val region = args.getMap(0)
                    val padding = args.getDouble(1).toLong()
                    val duration = args.getDouble(2).toLong()
                    val northEast = region.getMap("northEast") ?: return
                    val southWest = region.getMap("southWest") ?: return
                    val ne =
                        LatLng(northEast.getDouble("latitude"), northEast.getDouble("longitude"))
                    val sw =
                        LatLng(southWest.getDouble("latitude"), southWest.getDouble("longitude"))
                    root.animateToRegion(LatLngBounds(sw, ne), padding, duration)
                }
            }
        }
    }

    @ReactProp(name = "markers")
    fun setMarkers(view: MapView, markers: ReadableArray?) {
        markers ?: return
        val items = markers.let { markers ->
            (0 until markers.size()).mapNotNull {
                val item = markers.getMap(it)
                val itemId = item.getString("id") ?: return@mapNotNull null
                val displayName = item.getString("displayName") ?: return@mapNotNull null
                val iconResource = item.getString("iconResource") ?: return@mapNotNull null
                val location = item.getMap("location")?.let { loc ->
                    val lat = loc.getDouble("lat")
                    val lng = loc.getDouble("lng")
                    LatLng(lat, lng)
                } ?: return@mapNotNull null
                MarkerData(
                    id = itemId,
                    location = location,
                    displayName = displayName,
                    iconResource = iconResource,
                )
            }
        }
        view.setMarkers(items)
    }

    @ReactProp(name = "selectedItemId")
    fun setSelectedItemId(view: MapView, selectedItemId: String?) {
        view.setSelectedItemId(selectedItemId)
    }

    @ReactProp(name = "initialRegion")
    fun setInitialRegion(view: MapView, initialRegion: ReadableMap?) {
        initialRegion ?: return
        val northEast = initialRegion.getMap("northEast")?.let {
            LatLng(it.getDouble("latitude"), it.getDouble("longitude"))
        } ?: return
        val southWest = initialRegion.getMap("southWest")?.let {
            LatLng(it.getDouble("latitude"), it.getDouble("longitude"))
        } ?: return
        val bounds = LatLngBounds(southWest, northEast)
        view.setInitialRegion(bounds)
    }

    @ReactProp(name = "mapPadding")
    fun setMapPadding(view: MapView, padding: ReadableMap?) {
        val density = view.resources.displayMetrics.density
        padding?.let {
            val left = if (it.hasKey("left")) padding.getDouble("left") * density else 0
            val right = if (it.hasKey("right")) padding.getDouble("right") * density else 0
            val top = if (it.hasKey("top")) padding.getDouble("top") * density else 0
            val bottom = if (it.hasKey("bottom")) padding.getDouble("bottom") * density else 0
            view.applyBaseMapPadding(left.toInt(), top.toInt(), right.toInt(), bottom.toInt())
        }
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
        return mutableMapOf(
            "onMarkerPress" to mapOf("registrationName" to "onMarkerPress"),
            "onCameraIdle" to mapOf("registrationName" to "onCameraIdle"),
        )
    }

    override fun createShadowNodeInstance(): LayoutShadowNode {
        // A custom shadow node is needed in order to pass back the width/height of the map to the
        // view manager so that it can start applying camera moves with bounds.
        return SizeReportingShadowNode()
    }

    fun pushEvent(context: ThemedReactContext, view: View, name: String, data: WritableMap) {
        context.reactApplicationContext
            .getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(view.id, name, data)
    }

    companion object {
        private const val COMMAND_ANIMATE_CAMERA = 0
        private const val COMMAND_FIT_TO_ELEMENTS = 1
        private const val COMMAND_ANIMATE_TO_REGION = 2
        private const val REACT_CLASS = "RNTMapView"
    }

    class SizeReportingShadowNode : LayoutShadowNode() {
        override fun onCollectExtraUpdates(uiViewOperationQueue: UIViewOperationQueue) {
            super.onCollectExtraUpdates(uiViewOperationQueue)

            val data: MutableMap<String, Float> = HashMap()
            data["width"] = layoutWidth
            data["height"] = layoutHeight

            uiViewOperationQueue.enqueueUpdateExtraData(reactTag, data)
        }
    }
}