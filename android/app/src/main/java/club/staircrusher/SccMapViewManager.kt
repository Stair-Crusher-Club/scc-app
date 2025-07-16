package club.staircrusher

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.SccMapViewManagerDelegate
import com.facebook.react.viewmanagers.SccMapViewManagerInterface
import com.naver.maps.geometry.LatLng
import com.naver.maps.geometry.LatLngBounds


@ReactModule(name = SccMapViewManager.REACT_CLASS)
internal class SccMapViewManager : SimpleViewManager<SccMapView>(),
    SccMapViewManagerInterface<SccMapView> {

    private val delegate: SccMapViewManagerDelegate<SccMapView, SccMapViewManager> =
        SccMapViewManagerDelegate(this)

    override fun getDelegate(): ViewManagerDelegate<SccMapView> = delegate

    override fun getName() = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext) = SccMapView(reactContext)

    override fun animateCamera(
        view: SccMapView?, latitude: Double, longitude: Double, duration: Int
    ) {
        val target = LatLng(latitude, longitude)
        view?.animateCamera(target, duration)
    }

    override fun fitToElements(view: SccMapView?) {
        view?.fitToElements()
    }

    override fun animateToRegion(
        view: SccMapView?,
        northEastLat: Double,
        northEastLng: Double,
        southWestLat: Double,
        southWestLng: Double,
        padding: Int,
        duration: Int
    ) {
        val ne = LatLng(northEastLat, northEastLng)
        val sw = LatLng(southWestLat, southWestLng)
        val bounds = LatLngBounds(sw, ne)
        view?.animateToRegion(bounds, padding.toLong(), duration.toLong())
    }

    override fun setPositionMode(view: SccMapView?, mode: String?) {
        mode?.let {
            view?.setPositionMode(mode)
        }
    }

    @ReactProp(name = "markers")
    override fun setMarkers(view: SccMapView, markers: ReadableArray?) {
        markers ?: return
        val items = markers.let { markerItems ->
            (0 until markerItems.size()).mapNotNull {
                val item = markerItems.getMap(it) ?: return@mapNotNull null
                val itemId = item.getString("id") ?: return@mapNotNull null
                val location = item.getMap("position")?.let { loc ->
                    val lat = loc.getDouble("lat")
                    val lng = loc.getDouble("lng")
                    LatLng(lat, lng)
                } ?: return@mapNotNull null

                val captionText = item.getString("captionText")
                val captionTextSize =
                    if (item.hasKey("captionTextSize")) item.getDouble("captionTextSize")
                        .toFloat() else null
                val isHideCollidedCaptions =
                    if (item.hasKey("isHideCollidedCaptions")) item.getBoolean("isHideCollidedCaptions") else null
                val isHideCollidedMarkers =
                    if (item.hasKey("isHideCollidedMarkers")) item.getBoolean("isHideCollidedMarkers") else null
                val isHideCollidedSymbols =
                    if (item.hasKey("isHideCollidedSymbols")) item.getBoolean("isHideCollidedSymbols") else null
                val iconResource = item.getString("iconResource")
                val iconColor = item.getString("iconColor")
                val zIndex = if (item.hasKey("zIndex")) item.getInt("zIndex") else null

                MarkerData(
                    id = itemId,
                    location = location,
                    displayName = captionText,
                    iconResource = iconResource,
                    captionText = captionText,
                    captionTextSize = captionTextSize,
                    isHideCollidedCaptions = isHideCollidedCaptions,
                    isHideCollidedMarkers = isHideCollidedMarkers,
                    isHideCollidedSymbols = isHideCollidedSymbols,
                    iconColor = iconColor,
                    zIndex = zIndex,
                )
            }
        }
        view.setMarkers(items)
    }

    @ReactProp(name = "initialRegion")
    override fun setInitialRegion(view: SccMapView, initialRegion: ReadableMap?) {
        initialRegion ?: return
        val northEast =
            LatLng(initialRegion.getDouble("northEastLat"), initialRegion.getDouble("northEastLng"))
        val southWest =
            LatLng(initialRegion.getDouble("southWestLat"), initialRegion.getDouble("southWestLng"))
        val bounds = LatLngBounds(southWest, northEast)
        view.setInitialRegion(bounds)
    }

    @ReactProp(name = "mapPadding")
    override fun setMapPadding(view: SccMapView, padding: ReadableMap?) {
        val density = view.resources.displayMetrics.density
        padding?.let {
            val left = if (it.hasKey("left")) padding.getInt("left") * density else 0
            val right = if (it.hasKey("right")) padding.getInt("right") * density else 0
            val top = if (it.hasKey("top")) padding.getInt("top") * density else 0
            val bottom = if (it.hasKey("bottom")) padding.getInt("bottom") * density else 0
            view.applyBaseMapPadding(left.toInt(), top.toInt(), right.toInt(), bottom.toInt())
        }
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
        return mutableMapOf(
            "onMarkerPress" to mapOf("registrationName" to "onMarkerPress"),
            "onCameraIdle" to mapOf("registrationName" to "onCameraIdle"),
        )
    }

    companion object {
        const val REACT_CLASS = "SccMapView"
    }
}