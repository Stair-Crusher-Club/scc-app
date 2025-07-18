//
// MarkerData.m
// sccReactNative
//
// Created by 김상민 on 9/16/24.
//

#import "RNTSccMarkerData.h"

@implementation RNTSccMarkerData

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
                            zIndex:(int)zIndex {
    self = [super init];
    if (self) {
        _longitude = longitude;
        _latitude = latitude;
        _identifier = [identifier copy];
        _iconResource = [iconResource copy];
        _captionText = [captionText copy];
        _captionTextSize = captionTextSize;
        _isHideCollidedCaptions = isHideCollidedCaptions;
        _isHideCollidedMarkers = isHideCollidedMarkers;
        _isHideCollidedSymbols = isHideCollidedSymbols;
        _iconColor = [iconColor copy];
        _zIndex = zIndex;
    }
    return self;
}

@end
