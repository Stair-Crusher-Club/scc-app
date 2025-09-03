package club.staircrusher

import android.graphics.Color
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

                val iconResource = item.getString("iconResource") ?: return@mapNotNull null
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
                val iconColor = item.getString("iconColor")
                val zIndex = if (item.hasKey("zIndex")) item.getInt("zIndex") else null

                MarkerData(
                    id = itemId,
                    location = location,
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

    @ReactProp(name = "circleOverlays")
    override fun setCircleOverlays(view: SccMapView, circleOverlays: ReadableArray?) {
        if (circleOverlays == null) {
            view.setCircleOverlays(emptyList())
            return
        }
        val items = (0 until circleOverlays.size()).mapNotNull {
            val overlay = circleOverlays.getMap(it) ?: return@mapNotNull null
            val overlayId = overlay.getString("id") ?: return@mapNotNull null
            val center = overlay.getMap("center")?.let { centerMap ->
                val lat = centerMap.getDouble("lat")
                val lng = centerMap.getDouble("lng")
                LatLng(lat, lng)
            } ?: return@mapNotNull null

            val radius = if (overlay.hasKey("radius")) overlay.getDouble("radius") else return@mapNotNull null
            val fillColor = overlay.getString("fillColor")?.let { runCatching { Color.parseColor(it) }.getOrNull() }
            val strokeColor = overlay.getString("strokeColor")?.let { runCatching { Color.parseColor(it) }.getOrNull() }
            val strokeWidth = if (overlay.hasKey("strokeWidth")) overlay.getDouble("strokeWidth").toFloat() else null

            CircleOverlayData(
                id = overlayId,
                center = center,
                radius = radius,
                fillColor = fillColor,
                strokeColor = strokeColor,
                strokeWidth = strokeWidth,
            )
        }
        view.setCircleOverlays(items)
    }
    @ReactProp(name = "rectangleOverlays")
    override fun setRectangleOverlays(view: SccMapView, rectangleOverlays: ReadableArray?) {
        if (rectangleOverlays == null) {
            view.setRectangleOverlays(emptyList())
            return
        }
        val items = (0 until rectangleOverlays.size()).mapNotNull {
            val overlay = rectangleOverlays.getMap(it) ?: return@mapNotNull null
            val overlayId = overlay.getString("id") ?: return@mapNotNull null

            val leftTopLocation = overlay.getMap("leftTopLocation")?.let { leftTopMap ->
                val lat = leftTopMap.getDouble("lat")
                val lng = leftTopMap.getDouble("lng")
                LatLng(lat, lng)
            } ?: return@mapNotNull null

            val rightBottomLocation = overlay.getMap("rightBottomLocation")?.let { rightBottomMap ->
                val lat = rightBottomMap.getDouble("lat")
                val lng = rightBottomMap.getDouble("lng")
                LatLng(lat, lng)
            } ?: return@mapNotNull null

            val fillColor = overlay.getString("fillColor")
                ?.let { runCatching { Color.parseColor(it) }.getOrNull() }
            val strokeColor = overlay.getString("strokeColor")
                ?.let { runCatching { Color.parseColor(it) }.getOrNull() }
            val strokeWidth = if (overlay.hasKey("strokeWidth")) {
                overlay.getDouble("strokeWidth").toFloat()
            } else null

            RectangleOverlayData(
                id = overlayId,
                leftTopLocation = leftTopLocation,
                rightBottomLocation = rightBottomLocation,
                fillColor = fillColor,
                strokeColor = strokeColor,
                strokeWidth = strokeWidth,
            )
        }
        view.setRectangleOverlays(items)
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