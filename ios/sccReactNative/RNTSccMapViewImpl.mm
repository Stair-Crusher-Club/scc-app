//
// RNTMapView.mm
// sccReactNative
//
// Created by 김상민 on 9/16/24.
//

#import "RNTSccMapViewImpl.h"
#import "RNTSccMarkerData.h"
#import "RNTSccMarkerImageService.h"
#import "RNTSccCircleOverlayData.h"
#import "RNTSccRectangleOverlayData.h"
#import <NMapsMap/NMapsMap.h>

// Helper class for Objective-C++ to hold NMFMarker and MarkerData
@interface MarkerWithData : NSObject
@property(nonatomic, strong) NMFMarker *marker;
@property(nonatomic, strong) RNTSccMarkerData *data;
- (instancetype)initWithMarker:(NMFMarker *)marker
                          data:(RNTSccMarkerData *)data;
@end

@implementation MarkerWithData
- (instancetype)initWithMarker:(NMFMarker *)marker
                          data:(RNTSccMarkerData *)data {
  self = [super init];
  if (self) {
    _marker = marker;
    _data = data;
  }
  return self;
}
@end

// Helper class for Objective-C++ to hold NMFCircleOverlay and CircleOverlayData
@interface CircleOverlayWithData : NSObject
@property(nonatomic, strong) NMFCircleOverlay *overlay;
@property(nonatomic, strong) RNTSccCircleOverlayData *data;
- (instancetype)initWithOverlay:(NMFCircleOverlay *)overlay
                          data:(RNTSccCircleOverlayData *)data;
@end

@implementation CircleOverlayWithData
- (instancetype)initWithOverlay:(NMFCircleOverlay *)overlay
                          data:(RNTSccCircleOverlayData *)data {
  self = [super init];
  if (self) {
    _overlay = overlay;
    _data = data;
  }
  return self;
}
@end

// Helper class for Objective-C++ to hold NMFPolygonOverlay and RectangleOverlayData
@interface RectangleOverlayWithData : NSObject
@property(nonatomic, strong) NMFPolygonOverlay *overlay;
@property(nonatomic, strong) RNTSccRectangleOverlayData *data;
- (instancetype)initWithOverlay:(NMFPolygonOverlay *)overlay
                          data:(RNTSccRectangleOverlayData *)data;
@end

@implementation RectangleOverlayWithData
- (instancetype)initWithOverlay:(NMFPolygonOverlay *)overlay
                          data:(RNTSccRectangleOverlayData *)data {
  self = [super init];
  if (self) {
    _overlay = overlay;
    _data = data;
  }
  return self;
}
@end

@interface RNTMapView () {
  BOOL _isInitialRegionSet;
  MarkerWithData *_currentTargetMarker;
  NSMutableArray<MarkerWithData *> *_markerList;
  NSMutableArray<CircleOverlayWithData *> *_circleOverlayList;
  NSMutableArray<RectangleOverlayWithData *> *_rectangleOverlayList;
}
@end

@implementation RNTMapView

- (instancetype)initWithFrame:(CGRect)frame {
  self = [super initWithFrame:frame];
  if (self) {
    _isInitialRegionSet = NO;
    _markerList = [NSMutableArray array];
    _circleOverlayList = [NSMutableArray array];
    _rectangleOverlayList = [NSMutableArray array];
    [self addCameraDelegate:self];
  }
  return self;
}

- (instancetype)initWithCoder:(NSCoder *)aDecoder {
  self = [super initWithCoder:aDecoder];
  if (self) {
    _isInitialRegionSet = NO;
    _markerList = [NSMutableArray array];
    _circleOverlayList = [NSMutableArray array];
    _rectangleOverlayList = [NSMutableArray array];
    [self addCameraDelegate:self];
  }
  return self;
}

- (void)animateCamera:(NMGLatLng *)position duration:(double)duration {
  NMFCameraUpdate *cameraUpdate =
      [NMFCameraUpdate cameraUpdateWithScrollTo:position];
  cameraUpdate.animation = NMFCameraUpdateAnimationEaseIn;
  cameraUpdate.animationDuration = duration;
  [self moveCamera:cameraUpdate];
}

- (void)fitToElements {
  if (_markerList.count == 0) {
    return;
  }

  NSMutableArray<NMGLatLng *> *markerLatLngs = [NSMutableArray array];
  for (MarkerWithData *markerDataWrapper in _markerList) {
    [markerLatLngs addObject:markerDataWrapper.marker.position];
  }

  NMGLatLngBounds *bounds =
      [NMGLatLngBounds latLngBoundsWithLatLngs:markerLatLngs];
  NMFCameraUpdate *cameraUpdate =
      [NMFCameraUpdate cameraUpdateWithFitBounds:bounds padding:10];
  cameraUpdate.animationDuration = 0.15;
  cameraUpdate.animation = NMFCameraUpdateAnimationFly;
  [self moveCamera:cameraUpdate];
}

- (void)animateToRegion:(NMGLatLngBounds *)region
                padding:(double)padding
               duration:(double)duration {
  NMFCameraUpdate *cameraUpdate =
      [NMFCameraUpdate cameraUpdateWithFitBounds:region padding:padding];
  cameraUpdate.animationDuration = duration;
  cameraUpdate.animation = NMFCameraUpdateAnimationFly;
  [self moveCamera:cameraUpdate];
}

- (void)setMarkers:(NSArray<RNTSccMarkerData *> *)markers {
  // Remove existing markers from the map
  for (MarkerWithData *markerWrapper in _markerList) {
    markerWrapper.marker.mapView = nil;
  }
  [_markerList removeAllObjects];

  for (RNTSccMarkerData *markerData in markers) {
    NMFMarker *marker = [[NMFMarker alloc] init];
    marker.position = [NMGLatLng latLngWithLat:markerData.latitude
                                           lng:markerData.longitude];
    marker.captionText = markerData.captionText;
    marker.captionTextSize = markerData.captionTextSize;
    marker.isHideCollidedCaptions = markerData.isHideCollidedCaptions;
    marker.isHideCollidedMarkers = markerData.isHideCollidedMarkers;
    marker.isHideCollidedSymbols = markerData.isHideCollidedSymbols;
    marker.zIndex = markerData.zIndex;
    UIImage *markerUIImage = [[RNTSccMarkerImageService sharedService]
        markerImageForData:markerData];
    if (markerUIImage) {
      marker.iconImage = [NMFOverlayImage overlayImageWithImage:markerUIImage];
    }
    RNTMapView * __weak weakSelf = self;
    RNTSccMarkerData * __weak weakMarkerData = markerData;
    marker.touchHandler = ^BOOL(NMFOverlay *overlay) {
      RNTMapView *strongSelf = weakSelf;
      RNTSccMarkerData *strongMarkerData = weakMarkerData;
      if (strongSelf && strongMarkerData) {
        [strongSelf.mapDelegate onMarkerPress:strongMarkerData.identifier];
      }
      return YES;
    };
    marker.mapView = self;

    MarkerWithData *markerWithData =
        [[MarkerWithData alloc] initWithMarker:marker data:markerData];
    [_markerList addObject:markerWithData];
  }
}

- (void)setCircleOverlays:(NSArray<RNTSccCircleOverlayData *> *)circleOverlays {
  // Remove existing circle overlays from the map
  for (CircleOverlayWithData *overlayWrapper in _circleOverlayList) {
    overlayWrapper.overlay.mapView = nil;
  }
  [_circleOverlayList removeAllObjects];

  for (RNTSccCircleOverlayData *overlayData in circleOverlays) {
    NMFCircleOverlay *circleOverlay = [[NMFCircleOverlay alloc] init];
    circleOverlay.center = overlayData.center;
    circleOverlay.radius = overlayData.radius;
    
    // Set colors if provided
    if (overlayData.fillColor) {
      circleOverlay.fillColor = overlayData.fillColor;
    }
    if (overlayData.strokeColor) {
      circleOverlay.outlineColor = overlayData.strokeColor;
    }
    circleOverlay.outlineWidth = overlayData.strokeWidth;
    
    circleOverlay.mapView = self;

    CircleOverlayWithData *overlayWithData =
        [[CircleOverlayWithData alloc] initWithOverlay:circleOverlay data:overlayData];
    [_circleOverlayList addObject:overlayWithData];
  }
}

- (void)setRectangleOverlays:(NSArray<RNTSccRectangleOverlayData *> *)rectangleOverlays {
  // Remove existing rectangle overlays from the map
  for (RectangleOverlayWithData *overlayWrapper in _rectangleOverlayList) {
    overlayWrapper.overlay.mapView = nil;
  }
  [_rectangleOverlayList removeAllObjects];

  for (RNTSccRectangleOverlayData *overlayData in rectangleOverlays) {
    NMFPolygonOverlay *polygonOverlay = [[NMFPolygonOverlay alloc] init];
    
    // Create rectangle coordinates from leftTop and rightBottom
    NSArray<NMGLatLng *> *coords = @[
      overlayData.leftTopLocation, // 북서쪽
      [NMGLatLng latLngWithLat:overlayData.leftTopLocation.lat lng:overlayData.rightBottomLocation.lng], // 북동쪽
      overlayData.rightBottomLocation, // 남동쪽
      [NMGLatLng latLngWithLat:overlayData.rightBottomLocation.lat lng:overlayData.leftTopLocation.lng], // 남서쪽
    ];
    polygonOverlay.polygon = [NMGPolygon polygonWithRing:[NMGLineString lineStringWithPoints:coords]];
    
    // Set colors if provided
    if (overlayData.fillColor) {
      polygonOverlay.fillColor = overlayData.fillColor;
    }
    if (overlayData.strokeColor) {
      polygonOverlay.outlineColor = overlayData.strokeColor;
    }
    polygonOverlay.outlineWidth = overlayData.strokeWidth;
    
    polygonOverlay.mapView = self;

    RectangleOverlayWithData *overlayWithData =
        [[RectangleOverlayWithData alloc] initWithOverlay:polygonOverlay data:overlayData];
    [_rectangleOverlayList addObject:overlayWithData];
  }
}

- (void)setInitialRegion:(NMGLatLngBounds *)region {
  if (_isInitialRegionSet) {
    return;
  }
  if (!region) {
    return;
  }
  dispatch_after(
      dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)),
      dispatch_get_main_queue(), ^{
        NMFCameraUpdate *cameraUpdate =
            [NMFCameraUpdate cameraUpdateWithFitBounds:region];
        [self moveCamera:cameraUpdate];
        self->_isInitialRegionSet = YES;
      });
}

- (void)setMapPaddingWithTop:(CGFloat)top
                        left:(CGFloat)left
                       right:(CGFloat)right
                      bottom:(CGFloat)bottom {
  self.contentInset = UIEdgeInsetsMake(top, left, bottom, right);
}

- (void)markerPress:(NSString *)identifier {
  if ([self.mapDelegate respondsToSelector:@selector(onMarkerPress:)]) {
    [self.mapDelegate onMarkerPress:identifier];
  }
}

- (void)cameraIdle:(NMGLatLngBounds *)bounds {
  if ([self.mapDelegate respondsToSelector:@selector(onCameraIdle:)]) {
    [self.mapDelegate onCameraIdle:bounds];
  }
}

#pragma mark - NMFMapViewCameraDelegate

- (void)mapViewCameraIdle:(NMFMapView *)mapView {
  [self cameraIdle:mapView.contentBounds];
}

#pragma mark - Private Methods

+ (UIColor *)colorFromHexString:(NSString *)hexString {
  unsigned rgbValue = 0;
  NSScanner *scanner = [NSScanner scannerWithString:hexString];
  [scanner setScanLocation:([hexString hasPrefix:@"#"] ? 1 : 0)];
  [scanner scanHexInt:&rgbValue];
  return [UIColor colorWithRed:((rgbValue & 0xFF0000) >> 16) / 255.0
                         green:((rgbValue & 0xFF00) >> 8) / 255.0
                          blue:(rgbValue & 0xFF) / 255.0
                         alpha:1.0];
}

@end
