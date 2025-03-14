//
//  RNTMapViewManager.m
//  sccReactNative
//
//  Created by 김상민 on 9/16/24.
//
#import <React/RCTViewManager.h>
 
@interface RNTMapViewManager : RCTViewManager
@end

@interface RNTMapViewManager(RCTExternModule)<RCTBridgeModule>
@end

@implementation RNTMapViewManager(RCTExternModule)
RCT_EXPORT_MODULE()

RCT_EXPORT_VIEW_PROPERTY(markers, NSArray)
RCT_EXPORT_VIEW_PROPERTY(initialRegion, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(mapPadding, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(selectedItemId, NSString)

RCT_EXPORT_VIEW_PROPERTY(onCameraIdle, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onMarkerPress, RCTDirectEventBlock)

RCT_EXTERN_METHOD(animateCamera:(nonnull NSNumber *)reactTag camera:(NSDictionary)json duration:(CGFloat)duration)
RCT_EXTERN_METHOD(animateToRegion:(nonnull NSNumber *)reactTag region:(NSDictionary)json padding:(CGFloat)padding duration:(CGFloat)duration)
RCT_EXTERN_METHOD(fitToElements:(nonnull NSNumber *)reactTag)

@end
