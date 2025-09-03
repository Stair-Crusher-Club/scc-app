//
// RNTSccCircleOverlayData.h
// sccReactNative
//

#import <Foundation/Foundation.h>
#import <NMapsMap/NMapsMap.h>

@interface RNTSccCircleOverlayData : NSObject

@property (nonatomic, strong) NSString *overlayId;
@property (nonatomic, strong) NMGLatLng *center;
@property (nonatomic, assign) double radius;
@property (nonatomic, strong, nullable) UIColor *fillColor;
@property (nonatomic, strong, nullable) UIColor *strokeColor;
@property (nonatomic, assign) CGFloat strokeWidth;

- (instancetype)initWithId:(NSString *)overlayId
                    center:(NMGLatLng *)center
                    radius:(double)radius
                 fillColor:(nullable UIColor *)fillColor
               strokeColor:(nullable UIColor *)strokeColor
               strokeWidth:(CGFloat)strokeWidth;

@end