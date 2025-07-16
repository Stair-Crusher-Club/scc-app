package club.staircrusher

import com.naver.maps.geometry.LatLng
import com.naver.maps.map.overlay.OverlayImage

data class MarkerData(
    val location: LatLng,
    val id: String,
    val displayName: String?,
    val iconResource: String?,
    val captionText: String? = null,
    val captionTextSize: Float? = null,
    val isHideCollidedCaptions: Boolean? = null,
    val isHideCollidedMarkers: Boolean? = null,
    val isHideCollidedSymbols: Boolean? = null,
    val iconColor: String? = null,
    val zIndex: Int? = null,
) {
    fun getIcon(): OverlayImage {
        return OverlayImage.fromResource(R.drawable.cafe_0_off)
    }
}
