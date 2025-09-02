//
// RNTMapView.h
// sccReactNative
//
// Created by 김상민 on 9/16/24.
//

#import <UIKit/UIKit.h>
#import <NMapsMap/NMapsMap.h>

// Forward declaration for MarkerData if it's an Objective-C class
// If MarkerData is a C++ struct, you might need to include its header.
@class RNTSccMarkerData;
@class RNTSccCircleOverlayData;
@class RNTSccRectangleOverlayData;
@class RCTDirectEventBlock; // Assuming this is from React Native for event callbacks

@protocol NativeSccMapDelegate <NSObject>
- (void)onCameraIdle:(NMGLatLngBounds *)region;
- (void)onMarkerPress:(NSString *)markerId;
@end

@interface RNTMapView : NMFMapView <NMFMapViewCameraDelegate>

@property (nonatomic, weak) id<NativeSccMapDelegate> mapDelegate;

- (void)animateCamera:(NMGLatLng *)position duration:(double)duration;
- (void)fitToElements;
- (void)animateToRegion:(NMGLatLngBounds *)region padding:(double)padding duration:(double)duration;
- (void)setMarkers:(NSArray<RNTSccMarkerData *> *)markers;
- (void)setCircleOverlays:(NSArray<RNTSccCircleOverlayData *> *)circleOverlays;
- (void)setRectangleOverlays:(NSArray<RNTSccRectangleOverlayData *> *)rectangleOverlays;
- (void)setInitialRegion:(NMGLatLngBounds *)region;
- (void)setMapPaddingWithTop:(CGFloat)top left:(CGFloat)left right:(CGFloat)right bottom:(CGFloat)bottom;

@end
