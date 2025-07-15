//
// RNTMapView.mm
// sccReactNative
//
// Created by 김상민 on 9/16/24.
//

#import "RNTSccMapView.h"
#import <NMapsMap/NMapsMap.h>
#import "MarkerData.h"

// Helper class for Objective-C++ to hold NMFMarker and MarkerData
@interface MarkerWithData : NSObject
@property (nonatomic, strong) NMFMarker *marker;
@property (nonatomic, strong) MarkerData *data;
- (instancetype)initWithMarker:(NMFMarker *)marker data:(MarkerData *)data;
@end

@implementation MarkerWithData
- (instancetype)initWithMarker:(NMFMarker *)marker data:(MarkerData *)data {
  self = [super init];
  if (self) {
    _marker = marker;
    _data = data;
  }
  return self;
}
@end


@interface RNTMapView () {
  BOOL _isInitialRegionSet;
  MarkerWithData *_currentTargetMarker;
  NSMutableArray<MarkerWithData *> *_markerList;
  NSMutableDictionary<NSString *, NMFOverlayImage *> *_overlayImageMap;
}
@end

@implementation RNTMapView

- (instancetype)initWithFrame:(CGRect)frame {
  self = [super initWithFrame:frame];
  if (self) {
    _isInitialRegionSet = NO;
    _markerList = [NSMutableArray array];
    _overlayImageMap = [NSMutableDictionary dictionary];
    [self addCameraDelegate:self];
  }
  return self;
}

- (instancetype)initWithCoder:(NSCoder *)aDecoder {
  self = [super initWithCoder:aDecoder];
  if (self) {
    _isInitialRegionSet = NO;
    _markerList = [NSMutableArray array];
    _overlayImageMap = [NSMutableDictionary dictionary];
    [self addCameraDelegate:self];
  }
  return self;
}

- (void)animateCamera:(NMGLatLng *)position duration:(double)duration {
  NMFCameraUpdate *cameraUpdate = [NMFCameraUpdate cameraUpdateWithScrollTo:position];
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
  
  NMGLatLngBounds *bounds = [NMGLatLngBounds latLngBoundsWithLatLngs:markerLatLngs];
  NMFCameraUpdate *cameraUpdate = [NMFCameraUpdate cameraUpdateWithFitBounds:bounds padding:10];
  cameraUpdate.animationDuration = 0.15;
  cameraUpdate.animation = NMFCameraUpdateAnimationFly;
  [self moveCamera:cameraUpdate];
}

- (void)animateToRegion:(NMGLatLngBounds *)region padding:(double)padding duration:(double)duration {
  NMFCameraUpdate *cameraUpdate = [NMFCameraUpdate cameraUpdateWithFitBounds:region padding:padding];
  cameraUpdate.animationDuration = duration;
  cameraUpdate.animation = NMFCameraUpdateAnimationFly;
  [self moveCamera:cameraUpdate];
}

- (void)setMarkers:(NSArray<MarkerData *> *)markers {
  // Remove existing markers from the map
  for (MarkerWithData *markerWrapper in _markerList) {
    markerWrapper.marker.mapView = nil;
  }
  [_markerList removeAllObjects];

  for (MarkerData *markerData in markers) {
    NMFMarker *marker = [[NMFMarker alloc] init];
    marker.position = [NMGLatLng latLngWithLat:markerData.latitude lng:markerData.longitude];
    marker.captionText = markerData.displayName;
    marker.captionTextSize = 14;
    marker.iconImage = [self getMarkerOverlayImageWithIconResource:markerData.iconResource isSelected:NO];
    marker.isHideCollidedCaptions = YES;
    marker.isHideCollidedSymbols = YES;
    marker.touchHandler = ^BOOL (NMFOverlay *overlay) {
      [self.mapDelegate onMarkerPress:markerData.identifier];
      return YES;
    };
    marker.mapView = self;

    MarkerWithData *markerWithData = [[MarkerWithData alloc] initWithMarker:marker data:markerData];
    [_markerList addObject:markerWithData];
  }
}

- (void)setInitialRegion:(NMGLatLngBounds *)region {
  if (_isInitialRegionSet) {
    return;
  }
  if (!region) {
    return;
  }
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
    NMFCameraUpdate *cameraUpdate = [NMFCameraUpdate cameraUpdateWithFitBounds:region];
    [self moveCamera:cameraUpdate];
    self->_isInitialRegionSet = YES;
  });
}

- (void)setMapPaddingWithTop:(CGFloat)top left:(CGFloat)left right:(CGFloat)right bottom:(CGFloat)bottom {
  self.contentInset = UIEdgeInsetsMake(top, left, bottom, right);
}

- (void)setSelectedItemId:(NSString *)selectedItemId {
  MarkerWithData *targetMarker = nil;
  for (MarkerWithData *markerWrapper in _markerList) {
    if ([markerWrapper.data.identifier isEqualToString:selectedItemId]) { // Use 'identifier' property
      targetMarker = markerWrapper;
      break;
    }
  }
  
  if (!targetMarker) {
    return;
  }
  
  if (_currentTargetMarker) {
    _currentTargetMarker.marker.zIndex = 0;
    _currentTargetMarker.marker.isHideCollidedCaptions = YES;
    _currentTargetMarker.marker.iconImage = [self getMarkerOverlayImageWithIconResource:_currentTargetMarker.data.iconResource isSelected:NO];
  }
  
  targetMarker.marker.zIndex = 99;
  targetMarker.marker.isHideCollidedCaptions = NO;
  targetMarker.marker.iconImage = [self getMarkerOverlayImageWithIconResource:targetMarker.data.iconResource isSelected:YES];
  _currentTargetMarker = targetMarker;
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

- (NMFOverlayImage *)getMarkerOverlayImageWithIconResource:(NSString *)iconResource isSelected:(BOOL)isSelected {
  NSString *iconString = [iconResource stringByAppendingString:(isSelected ? @"_on" : @"_off")];
  
  NMFOverlayImage *cachedImage = _overlayImageMap[iconString];
  if (cachedImage) {
    return cachedImage;
  }
  
  NMFOverlayImage *newImage = [NMFOverlayImage overlayImageWithName:iconString];
  if (newImage) {
    _overlayImageMap[iconString] = newImage;
  }
  return newImage;
}

@end
