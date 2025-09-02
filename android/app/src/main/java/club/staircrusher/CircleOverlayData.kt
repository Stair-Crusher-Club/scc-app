package club.staircrusher

import com.naver.maps.geometry.LatLng

data class CircleOverlayData(
    val id: String,
    val center: LatLng,
    val radius: Double,
    val fillColor: Int? = null,
    val strokeColor: Int? = null,
    val strokeWidth: Float? = null,
)