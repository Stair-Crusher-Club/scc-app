////
////  RNTSccMapViewManager.m
////  sccReactNative
////
////  Created by Sangmin Kim on 8/15/25.
////
//
//#import <React/RCTLog.h>
//#import <React/RCTUIManager.h>
//#import <React/RCTViewManager.h>
//
//@interface RNTSccMapViewManager : RCTViewManager
//@end
//
//@implementation RNTSccMapViewManager
//
//RCT_EXPORT_MODULE(RNTSccMapView)
//
//RCT_EXPORT_METHOD(callNativeMethodToChangeBackgroundColor : (nonnull NSNumber *)reactTag color : (NSString *)color)
//{
//  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
//    UIView *view = viewRegistry[reactTag];
//    if (!view || ![view isKindOfClass:[UIView class]]) {
//      RCTLogError(@"Cannot find NativeView with tag #%@", reactTag);
//      return;
//    }
//
//    [view setBackgroundColorWithColorString:color];
//  }];
//}
//
//- (UIView *)view
//{
//  return [[UIView alloc] init];
//}
//
//@end
