//
//  MarkerImageService.h
//  sccReactNative
//
//  Created by Sangmin Kim on 7/17/25.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
@class RNTSccMarkerData;

NS_ASSUME_NONNULL_BEGIN

@interface RNTSccMarkerImageService : NSObject

+ (instancetype)sharedService;
- (UIImage *)markerImageForData:(RNTSccMarkerData *)markerData;

@end

NS_ASSUME_NONNULL_END
