package club.staircrusher

import android.annotation.SuppressLint
import android.view.Gravity
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
    private var savedLogoPosition: String? = null

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
            it.addOnCameraIdleListener {
                val bound = this@SccMapView.map?.contentBounds ?: return@addOnCameraIdleListener
                emitCameraOnIdleEvent(bound)
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

        // Re-apply logo settings after changing content padding
        // to prevent SDK from auto-adjusting logo position
        savedLogoPosition?.let { applyLogoPosition(it, m) }
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
        val reactContext = context as ReactContext
        val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
        val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
        val payload = Arguments.createMap().apply {
            putDouble("northEastLat", region.northLatitude)
            putDouble("northEastLng", region.eastLongitude)
            putDouble("southWestLat", region.southLatitude)
            putDouble("southWestLng", region.westLongitude)
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