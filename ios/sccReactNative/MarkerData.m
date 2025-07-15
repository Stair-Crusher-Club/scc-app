//
// MarkerData.m
// sccReactNative
//
// Created by 김상민 on 9/16/24.
//

#import "MarkerData.h"

@implementation MarkerData

- (instancetype)initWithLongitude:(double)longitude
                         latitude:(double)latitude
                       identifier:(NSString *)identifier
                      displayName:(NSString *)displayName
                     iconResource:(NSString *)iconResource {
    self = [super init];
    if (self) {
        _longitude = longitude;
        _latitude = latitude;
        _identifier = [identifier copy];
        _displayName = [displayName copy];
        _iconResource = [iconResource copy];
    }
    return self;
}

@end
