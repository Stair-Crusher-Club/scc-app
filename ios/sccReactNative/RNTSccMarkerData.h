//
// MarkerData.h
// sccReactNative
//
// Created by 김상민 on 9/16/24.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNTSccMarkerData : NSObject

@property (nonatomic, assign) double longitude;
@property (nonatomic, assign) double latitude;
@property (nonatomic, strong) NSString *identifier; // Renamed 'id' to 'identifier' to avoid conflict with NSObject's id
@property (nonatomic, strong) NSString *iconResource;
@property (nonatomic, strong, nullable) NSString *captionText;
@property (nonatomic, assign) float  captionTextSize;
@property (nonatomic, assign) bool isHideCollidedCaptions;
@property (nonatomic, assign) bool isHideCollidedMarkers;
@property (nonatomic, assign) bool isHideCollidedSymbols;
@property (nonatomic, strong, nullable) NSString *iconColor;
@property (nonatomic, assign) int zIndex;

- (instancetype)initWithLongitude:(double)longitude
                         latitude:(double)latitude
                       identifier:(NSString *)identifier
                     iconResource:(NSString *)iconResource
                      captionText:(nullable NSString *)captionText
                  captionTextSize:(float)captionTextSize
           isHideCollidedCaptions:(bool)isHideCollidedCaptions
           isHideCollidedMarkers:(bool)isHideCollidedMarkers
           isHideCollidedSymbols:(bool)isHideCollidedSymbols
                       iconColor:(nullable NSString *)iconColor
                            zIndex:(int)zIndex;

@end

NS_ASSUME_NONNULL_END
