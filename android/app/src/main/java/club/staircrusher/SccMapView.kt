package club.staircrusher

import android.annotation.SuppressLint
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.mrousavy.camera.core.utils.runOnUiThread
import com.naver.maps.geometry.LatLng
import com.naver.maps.geometry.LatLngBounds
import com.naver.maps.map.CameraAnimation
import com.naver.maps.map.CameraUpdate
import com.naver.maps.map.LocationTrackingMode
import com.naver.maps.map.MapView
import com.naver.maps.map.NaverMap
import com.naver.maps.map.NaverMapOptions
import com.naver.maps.map.overlay.Marker
import com.naver.maps.map.overlay.CircleOverlay
import com.naver.maps.map.overlay.PolygonOverlay
import com.naver.maps.map.util.FusedLocationSource

@SuppressLint("ViewConstructor")
class SccMapView(private val reactContext: ThemedReactContext) : MapView(
    reactContext, NaverMapOptions()
        .zoomControlEnabled(false)
) {
    private val markerImageService: MarkerImageService = MarkerImageService()
    private var isDestroyed = false
    private var isPaused = false
    private var lifecycleListener: LifecycleEventListener? = null
    private var map: NaverMap? = null

    private var initialRegion: LatLngBounds? = null

    private var baseLeftMapPadding: Int = 0
    private var baseRightMapPadding: Int = 0
    private var baseTopMapPadding: Int = 0
    private var baseBottomMapPadding: Int = 0
    private var markers: List<Pair<Marker, MarkerData>> = emptyList()
    private var circleOverlays: List<Pair<CircleOverlay, CircleOverlayData>> = emptyList()
    private var rectangleOverlays: List<Pair<PolygonOverlay, RectangleOverlayData>> = emptyList()
    private var locationTrackingMode: LocationTrackingMode? = null
    private var savedLogoPosition: String? = "leftBottom"
    private var lastCameraChangeReason: Int = -1

    init {
        Marker.DEFAULT_ANCHOR
        lifecycleListener = (object : LifecycleEventListener {
            override fun onHostResume() {
                synchronized(this@SccMapView) {
                    if (!isDestroyed) {
                        this@SccMapView.onResume()
                    }
                    isPaused = false
                }
            }

            override fun onHostPause() {
                synchronized(this@SccMapView) {
                    if (!isDestroyed) {
                        this@SccMapView.onPause()
                    }
                    isPaused = true
                }
            }

            override fun onHostDestroy() {
                this@SccMapView.doDestroy()
            }
        }).also {
            reactContext.addLifecycleEventListener(it)
        }

        getMapAsync {
            map = it
            // Fix logo at bottom-left so contentPadding changes don't move it
            it.uiSettings.logoGravity = Gravity.BOTTOM or Gravity.START
            it.uiSettings.setLogoMargin(0, 0, 0, 0)
            it.addOnCameraChangeListener { reason, _ ->
                lastCameraChangeReason = reason
            }
            it.addOnCameraIdleListener {
                val m = this@SccMapView.map ?: return@addOnCameraIdleListener
                emitCameraOnIdleEvent(m.contentBounds)
            }
            reactContext.currentActivity?.let { activity ->
                it.locationSource = FusedLocationSource(activity, 100)
            }
            it.locationTrackingMode = locationTrackingMode ?: LocationTrackingMode.NoFollow
            initialRegion?.let { region ->
                it.moveCamera(CameraUpdate.fitBounds(region))
            }
            applyBaseMapPadding(
                baseLeftMapPadding,
                baseTopMapPadding,
                baseRightMapPadding,
                baseBottomMapPadding
            )
            setMarkers(markers.map { it.second })
        }
    }

    fun setInitialRegion(bounds: LatLngBounds) {
        if (initialRegion == null) {
            this.initialRegion = bounds
            map?.moveCamera(CameraUpdate.fitBounds(bounds))
        }
    }

    fun applyBaseMapPadding(left: Int, top: Int, right: Int, bottom: Int) {
        baseLeftMapPadding = left
        baseRightMapPadding = right
        baseTopMapPadding = top
        baseBottomMapPadding = bottom
        val m = map ?: return
        m.setContentPadding(left, top, right, bottom)
        // Move logo & scale bar back toward viewport bottom after SDK layout
        post { fixBottomWidgetPositions(bottom) }
    }

    fun setMarkers(markerDatas: List<MarkerData>) {
        runOnUiThread {
            // clear all
            markers.forEach { it.first.map = null }

            markers = markerDatas.map { data ->
                val marker = Marker(data.location)
                marker.captionText = data.captionText ?: ""
                marker.captionTextSize = data.captionTextSize ?: 14.0f
                marker.isHideCollidedCaptions = data.isHideCollidedCaptions ?: true
                marker.isHideCollidedMarkers = data.isHideCollidedMarkers ?: false
                marker.isHideCollidedSymbols = data.isHideCollidedSymbols ?: false
                marker.zIndex = data.zIndex ?: 0
                marker.map = this.map
                marker.icon = markerImageService.getMarkerImage(data)
                marker.setOnClickListener {
                    emitMarkerPressEvent(data.id)
                    true
                }
                marker to data
            }
        }
    }

    fun animateCamera(target: LatLng, duration: Int) {
        val m = map ?: return
        m.moveCamera(
            CameraUpdate.scrollTo(target).animate(CameraAnimation.Easing, duration.toLong())
        )
    }

    fun animateToRegion(target: LatLngBounds, padding: Long, duration: Long) {
        val m = map ?: return
        m.moveCamera(
            CameraUpdate.fitBounds(target, padding.toInt())
                .animate(CameraAnimation.Easing, duration)
        )
    }

    fun fitToElements() {
        val m = map ?: return
        m.moveCamera(
            CameraUpdate.fitBounds(
                LatLngBounds.from(markers.map { it.first.position }), 10
            ).animate(CameraAnimation.Easing, 200)
        )
    }

    fun setCircleOverlays(circleOverlayDatas: List<CircleOverlayData>) {
        runOnUiThread {
            // clear all existing circle overlays
            circleOverlays.forEach { it.first.map = null }

            circleOverlays = circleOverlayDatas.map { data ->
                val circleOverlay = CircleOverlay()
                circleOverlay.center = data.center
                circleOverlay.radius = data.radius
                
                // Set colors if provided
                data.fillColor?.let { circleOverlay.color = it }
                data.strokeColor?.let { circleOverlay.outlineColor = it }
                data.strokeWidth?.let { circleOverlay.outlineWidth = it.toInt() }
                
                circleOverlay.map = this.map
                circleOverlay to data
            }
        }
    }

    fun setRectangleOverlays(rectangleOverlayDatas: List<RectangleOverlayData>) {
        runOnUiThread {
            // clear all existing rectangle overlays
            rectangleOverlays.forEach { it.first.map = null }

            rectangleOverlays = rectangleOverlayDatas.map { data ->
                val polygonOverlay = PolygonOverlay()
                
                // Create rectangle coordinates from leftTop and rightBottom
                val coords = listOf(
                    data.leftTopLocation, // 북서쪽
                    LatLng(data.leftTopLocation.latitude, data.rightBottomLocation.longitude), // 북동쪽  
                    data.rightBottomLocation, // 남동쪽
                    LatLng(data.rightBottomLocation.latitude, data.leftTopLocation.longitude), // 남서쪽
                )
                polygonOverlay.coords = coords
                
                // Set colors if provided
                data.fillColor?.let { polygonOverlay.color = it }
                data.strokeColor?.let { polygonOverlay.outlineColor = it }
                data.strokeWidth?.let { polygonOverlay.outlineWidth = it.toInt() }
                
                polygonOverlay.map = this.map
                polygonOverlay to data
            }
        }
    }

    fun setPositionMode(mode: String) {
        val parsedMode = when (mode) {
            "normal" -> LocationTrackingMode.NoFollow
            "direction" -> LocationTrackingMode.Follow
            "compass" -> LocationTrackingMode.Face
            else -> LocationTrackingMode.NoFollow
        }
        locationTrackingMode = parsedMode
        map?.let {
            it.locationTrackingMode = parsedMode
        }
    }

    fun setLogoPosition(position: String) {
        savedLogoPosition = position
        map?.let { applyLogoPosition(position, it) }
    }

    private fun fixBottomWidgetPositions(bottomPadding: Int) {
        val offset = resources.displayMetrics.density * 48
        val baseTranslation = bottomPadding.toFloat() - offset
        val widgets = findWidgetViews(this, listOf("logo", "scalebar"))
        if (widgets.isEmpty()) return

        // Find the widget with the lowest bottom edge (in MapView coordinates)
        var maxBottom = 0
        val bottomPositions = mutableMapOf<View, Int>()
        for (widget in widgets) {
            val bottom = getBottomInAncestor(widget)
            bottomPositions[widget] = bottom
            if (bottom > maxBottom) maxBottom = bottom
        }

        // Translate all widgets: align their bottom edges, then shift down
        for (widget in widgets) {
            val alignOffset = maxBottom - (bottomPositions[widget] ?: maxBottom)
            widget.translationY = baseTranslation + alignOffset
            disableClipping(widget)
        }
    }

    private fun getBottomInAncestor(view: View): Int {
        var y = view.bottom
        var parent = view.parent
        while (parent is View && parent !== this) {
            y += (parent as View).top
            parent = parent.parent
        }
        return y
    }

    private fun disableClipping(view: View) {
        var parent = view.parent
        while (parent is ViewGroup) {
            parent.clipChildren = false
            parent.clipToPadding = false
            if (parent === this) break
            parent = parent.parent
        }
    }

    private fun findWidgetViews(viewGroup: ViewGroup, keywords: List<String>): List<View> {
        val result = mutableListOf<View>()
        for (i in 0 until viewGroup.childCount) {
            val child = viewGroup.getChildAt(i)
            val className = child.javaClass.name.lowercase()
            if (keywords.any { className.contains(it) }) {
                result.add(child)
            }
            if (child is ViewGroup) {
                result.addAll(findWidgetViews(child, keywords))
            }
        }
        return result
    }

    private fun applyLogoPosition(position: String, naverMap: NaverMap) {
        val gravity = when (position) {
            "leftTop" -> Gravity.TOP or Gravity.LEFT
            "leftBottom" -> Gravity.BOTTOM or Gravity.LEFT
            "leftCenter" -> Gravity.CENTER_VERTICAL or Gravity.LEFT
            "rightTop" -> Gravity.TOP or Gravity.RIGHT
            "rightBottom" -> Gravity.BOTTOM or Gravity.RIGHT
            "rightCenter" -> Gravity.CENTER_VERTICAL or Gravity.RIGHT
            "bottomCenter" -> Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
            "topCenter" -> Gravity.TOP or Gravity.CENTER_HORIZONTAL
            else -> Gravity.BOTTOM or Gravity.LEFT
        }
        naverMap.uiSettings.logoGravity = gravity
        naverMap.uiSettings.setLogoMargin(0, 0, 0, 0)
    }

    override fun requestLayout() {
        super.requestLayout()
        post(measureAndLayout)
    }

    private val measureAndLayout = Runnable {
        measure(
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
        )
        layout(left, top, right, bottom)
    }

    private fun emitMarkerPressEvent(markerId: String) {
        val reactContext = context as ReactContext
        val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
        val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
        val payload = Arguments.createMap().apply {
            putString("id", markerId)
        }
        val event = OnMarkerPressEvent(surfaceId, id, payload)
        eventDispatcher?.dispatchEvent(event)
    }

    private fun emitCameraOnIdleEvent(region: LatLngBounds) {
        val m = map ?: return
        val cameraPosition = m.cameraPosition
        val reactContext = context as ReactContext
        val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
        val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
        val payload = Arguments.createMap().apply {
            putDouble("northEastLat", region.northLatitude)
            putDouble("northEastLng", region.eastLongitude)
            putDouble("southWestLat", region.southLatitude)
            putDouble("southWestLng", region.westLongitude)
            putDouble("zoom", cameraPosition.zoom)
            putDouble("centerLat", cameraPosition.target.latitude)
            putDouble("centerLng", cameraPosition.target.longitude)
            putInt("reason", when (lastCameraChangeReason) {
                -1 -> 0 // gesture
                -2 -> 1 // control
                -3 -> 2 // location
                else -> 3 // developer (0) or unknown
            })
        }
        val event = OnCameraIdleEvent(surfaceId, id, payload)
        eventDispatcher?.dispatchEvent(event)
    }

    @Synchronized
    fun doDestroy() {
        if (isDestroyed) {
            return
        }
        isDestroyed = true

        lifecycleListener?.let {
            reactContext.removeLifecycleEventListener(it)
            lifecycleListener = null
        }
        if (!isPaused) {
            onPause()
            isPaused = true
        }
        onDestroy()
    }

    inner class OnMarkerPressEvent(
        surfaceId: Int, viewId: Int, private val payload: WritableMap
    ) : Event<OnMarkerPressEvent>(surfaceId, viewId) {
        override fun getEventName() = "onMarkerPress"
        override fun getEventData() = payload
    }

    inner class OnCameraIdleEvent(
        surfaceId: Int, viewId: Int, private val payload: WritableMap
    ) : Event<OnCameraIdleEvent>(surfaceId, viewId) {
        override fun getEventName() = "onCameraIdle"
        override fun getEventData() = payload
    }
}