//
// RNTSccRectangleOverlayData.mm
// sccReactNative
//

#import "RNTSccRectangleOverlayData.h"

@implementation RNTSccRectangleOverlayData

- (instancetype)initWithId:(NSString *)overlayId
          leftTopLocation:(NMGLatLng *)leftTopLocation
       rightBottomLocation:(NMGLatLng *)rightBottomLocation
                 fillColor:(nullable UIColor *)fillColor
               strokeColor:(nullable UIColor *)strokeColor
               strokeWidth:(CGFloat)strokeWidth {
  self = [super init];
  if (self) {
    _overlayId = overlayId;
    _leftTopLocation = leftTopLocation;
    _rightBottomLocation = rightBottomLocation;
    _fillColor = fillColor;
    _strokeColor = strokeColor;
    _strokeWidth = strokeWidth;
  }
  return self;
}

@end