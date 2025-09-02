//
// RNTSccCircleOverlayData.mm
// sccReactNative
//

#import "RNTSccCircleOverlayData.h"

@implementation RNTSccCircleOverlayData

- (instancetype)initWithId:(NSString *)overlayId
                    center:(NMGLatLng *)center
                    radius:(double)radius
                 fillColor:(nullable UIColor *)fillColor
               strokeColor:(nullable UIColor *)strokeColor
               strokeWidth:(CGFloat)strokeWidth {
  self = [super init];
  if (self) {
    _overlayId = overlayId;
    _center = center;
    _radius = radius;
    _fillColor = fillColor;
    _strokeColor = strokeColor;
    _strokeWidth = strokeWidth;
  }
  return self;
}

@end