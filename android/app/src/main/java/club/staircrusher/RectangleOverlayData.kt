package club.staircrusher

import com.naver.maps.geometry.LatLng

data class RectangleOverlayData(
    val id: String,
    val leftTopLocation: LatLng,
    val rightBottomLocation: LatLng,
    val fillColor: Int? = null,
    val strokeColor: Int? = null,
    val strokeWidth: Float? = null,
)