package club.staircrusher

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.util.Log
import android.util.LruCache
import androidx.core.graphics.createBitmap
import com.caverock.androidsvg.SVG
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.naver.maps.map.overlay.OverlayImage
import java.io.ByteArrayInputStream
import java.nio.charset.StandardCharsets

class MarkerImageService(
    private val context: Context,
) {
    private val cache: LruCache<MarkerData, OverlayImage> = LruCache(100)

    fun getMarkerImage(markerData: MarkerData): OverlayImage {
        val saved = cache.get(markerData)
        if (saved != null) {
            return saved
        }
        val bitmap = SVGUtils.loadAndColorizeSVGFromStringReplacement(
            rawSvgString = markerData.iconResource!!,
            colorToReplaceHex = "#9A9B9F",
            newColorHex = markerData.iconColor,
        )
        val image = OverlayImage.fromBitmap(bitmap)
        cache.put(markerData, image)
        return image
    }
}

fun Int.dpToPx(context: Context): Int {
    return this * context.resources.displayMetrics.density.toInt()
}

object SVGUtils {
    fun loadAndColorizeSVGFromStringReplacement(
        rawSvgString: String,
        colorToReplaceHex: String,
        newColorHex: String?,
    ): Bitmap {
        val modifiedSvgString = if (newColorHex == null) rawSvgString
        else rawSvgString.replace(colorToReplaceHex, newColorHex, ignoreCase = true)
        val modifiedInputStream =
            ByteArrayInputStream(modifiedSvgString.toByteArray(StandardCharsets.UTF_8))
        val svg = SVG.getFromInputStream(modifiedInputStream)
        // px 로 불러온 값이 그대로 렌더링 되기 때문에, dp 로 변환
        svg.documentWidth = svg.documentWidth.dpToPx()
        svg.documentHeight = svg.documentHeight.dpToPx()
        modifiedInputStream.close()
        val bitmap = createBitmap(svg.documentWidth.toInt(), svg.documentHeight.toInt())
        val canvas = Canvas(bitmap)
        svg.renderToCanvas(canvas)
        return bitmap
    }
}