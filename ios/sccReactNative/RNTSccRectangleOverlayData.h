//
// RNTSccRectangleOverlayData.h
// sccReactNative
//

#import <Foundation/Foundation.h>
#import <NMapsMap/NMapsMap.h>

@interface RNTSccRectangleOverlayData : NSObject

@property (nonatomic, strong) NSString *overlayId;
@property (nonatomic, strong) NMGLatLng *leftTopLocation;
@property (nonatomic, strong) NMGLatLng *rightBottomLocation;
@property (nonatomic, strong, nullable) UIColor *fillColor;
@property (nonatomic, strong, nullable) UIColor *strokeColor;
@property (nonatomic, assign) CGFloat strokeWidth;

- (instancetype)initWithId:(NSString *)overlayId
          leftTopLocation:(NMGLatLng *)leftTopLocation
       rightBottomLocation:(NMGLatLng *)rightBottomLocation
                 fillColor:(nullable UIColor *)fillColor
               strokeColor:(nullable UIColor *)strokeColor
               strokeWidth:(CGFloat)strokeWidth;

@end