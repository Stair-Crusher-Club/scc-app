package club.staircrusher

import android.annotation.SuppressLint
import android.content.Context
import android.util.Log
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.uimanager.ThemedReactContext
import com.mrousavy.camera.core.utils.runOnUiThread
import com.naver.maps.geometry.LatLng
import com.naver.maps.geometry.LatLngBounds
import com.naver.maps.map.CameraAnimation
import com.naver.maps.map.CameraUpdate
import com.naver.maps.map.LocationTrackingMode
import com.naver.maps.map.NaverMap
import com.naver.maps.map.NaverMapOptions
import com.naver.maps.map.overlay.LocationOverlay
import com.naver.maps.map.overlay.Marker
import com.naver.maps.map.util.FusedLocationSource

@SuppressLint("ViewConstructor")
class MapView(
    private val reactContext: ThemedReactContext,
    appContext: ReactApplicationContext,
    private val manager: MapViewManager,
) : com.naver.maps.map.MapView(
    appContext,
    NaverMapOptions().zoomControlEnabled(false)
) {
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
    private var currentSelectedMarker: Pair<Marker, MarkerData>? = null

    init {
        lifecycleListener = object : LifecycleEventListener {
            override fun onHostResume() {
                synchronized(this@MapView) {
                    if (!isDestroyed) {
                        this@MapView.onResume()
                    }
                    isPaused = false
                }
            }

            override fun onHostPause() {
                synchronized(this@MapView) {
                    if (!isDestroyed) {
                        this@MapView.onPause()
                    }
                    isPaused = true
                }
            }

            override fun onHostDestroy() {
                this@MapView.doDestroy()
            }
        }
        reactContext.addLifecycleEventListener(lifecycleListener)
        getMapAsync {
            map = it
            it.addOnCameraIdleListener {
                this@MapView.manager.pushEvent(
                    this@MapView.reactContext,
                    this@MapView,
                    "onCameraIdle",
                    WritableNativeMap().also { it ->
                        val bound = this@MapView.map?.contentBounds ?: return@also
                        val northEast = WritableNativeMap().also {
                            it.putDouble("latitude", bound.northLatitude)
                            it.putDouble("longitude", bound.eastLongitude)
                        }
                        val southWest = WritableNativeMap().also {
                            it.putDouble("latitude", bound.southLatitude)
                            it.putDouble("longitude", bound.westLongitude)
                        }
                        val region = WritableNativeMap().also {
                            it.putMap("northEast", northEast)
                            it.putMap("southWest", southWest)
                        }
                        it.putMap("region", region)
                    }
                )
            }
            reactContext.currentActivity?.let { activity ->
                it.locationSource = FusedLocationSource(activity, 100)
            }
            it.locationTrackingMode = LocationTrackingMode.NoFollow
            initialRegion?.let { region ->
                it.moveCamera(CameraUpdate.fitBounds(region))
            }
        }
    }

    fun setInitialRegion(bounds: LatLngBounds) {
        if (initialRegion == null) {
            this.initialRegion = bounds
            map?.moveCamera(CameraUpdate.fitBounds(bounds))
        }
    }

    fun applyBaseMapPadding(left: Int, top: Int, right: Int, bottom: Int) {
        val m = map ?: return
        m.setContentPadding(left, top, right, bottom)
        baseLeftMapPadding = left
        baseRightMapPadding = right
        baseTopMapPadding = top
        baseBottomMapPadding = bottom
    }

    fun setSelectedItemId(selectedItemId: String?) {
        runOnUiThread {
            currentSelectedMarker?.let {
                it.first.isHideCollidedCaptions = true
                it.first.icon = it.second.getIcon(isSelected = false)
                it.first.zIndex = 0
            }
            val nextSelectedMarker = markers.firstOrNull { it.second.id == selectedItemId }
            nextSelectedMarker?.let {
                it.first.isHideCollidedCaptions = false
                it.first.icon = it.second.getIcon(isSelected = true)
                it.first.zIndex = 99
            }
            currentSelectedMarker = nextSelectedMarker
        }
    }

    fun setMarkers(markerDatas: List<MarkerData>) {
        runOnUiThread {
            // clear all
            markers.forEach { it.first.map = null }

            markers = markerDatas.map { data ->
                val marker = Marker(data.location)
                marker.captionText = data.displayName
                marker.captionTextSize = 14.0f
                marker.isHideCollidedCaptions = true
                marker.map = this.map
                marker.icon = data.getIcon(isSelected = false)
                marker.setOnClickListener {
                    this@MapView.manager.pushEvent(
                        this@MapView.reactContext,
                        this@MapView,
                        "onMarkerPress",
                        WritableNativeMap().also {
                            it.putString("id", data.id)
                        }
                    )
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
            )
                .animate(CameraAnimation.Easing, 200)
        )
    }

    fun setPositionMode(mode: String) {
        val m = map ?: return
        when (mode) {
            "normal" -> m.locationTrackingMode = LocationTrackingMode.NoFollow
            "direction" -> m.locationTrackingMode = LocationTrackingMode.Follow
            "compass" -> m.locationTrackingMode = LocationTrackingMode.Face
        }
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

    @Synchronized
    fun doDestroy() {
        if (isDestroyed) {
            return
        }
        isDestroyed = true

        if (lifecycleListener != null) {
            reactContext.removeLifecycleEventListener(lifecycleListener)
            lifecycleListener = null
        }
        if (!isPaused) {
            onPause()
            isPaused = true
        }
        onDestroy()
    }
}