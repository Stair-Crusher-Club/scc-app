//
//  RNTSccMapView.m
//  sccReactNative
//
//  Created by Sangmin Kim on 7/14/25.
//

#import "RNTSccMapView.h"
#import "RNTSccMapViewImpl.h"
#import "RNTSccMarkerData.h"

#import <react/renderer/components/AppSpec/ComponentDescriptors.h>
#import <react/renderer/components/AppSpec/EventEmitters.h>
#import <react/renderer/components/AppSpec/Props.h>
#import <react/renderer/components/AppSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNTSccMapView() <RCTSccMapViewViewProtocol, NativeSccMapDelegate>
@end

@implementation RNTSccMapView {
  RNTMapView * _mapView;
}

-(instancetype)init
{
  if(self = [super init]) {
    // Init the Swift view
    _mapView = [[RNTMapView alloc] init];
    _mapView.mapDelegate = self;
    [self addSubview:_mapView];
  }
  return self;
}

- (void)dealloc {
  if (_mapView) {
    // Cleanup the references to the Swift view
    _mapView.mapDelegate = nil;
    _mapView = nil;
  }
}

// Seems required from RN
+ (void)load
{
  [super load];
}

// Seems good practice to notify child views about changes in bounds
-(void)layoutSubviews
{
  [super layoutSubviews];
  _mapView.frame = self.bounds;
}

// Helper function to deeply compare two marker vectors
static BOOL areMarkersEqual(const std::vector<SccMapViewMarkersStruct>& a, const std::vector<SccMapViewMarkersStruct>& b) {
  if (a.size() != b.size()) return NO;
  for (size_t i = 0; i < a.size(); ++i) {
    const auto& m1 = a[i];
    const auto& m2 = b[i];
    if (m1.id != m2.id ||
        m1.iconResource != m2.iconResource ||
        m1.position.lat != m2.position.lat ||
        m1.position.lng != m2.position.lng ||
        m1.captionText != m2.captionText ||
        m1.captionTextSize != m2.captionTextSize ||
        m1.isHideCollidedCaptions != m2.isHideCollidedCaptions ||
        m1.isHideCollidedMarkers != m2.isHideCollidedMarkers ||
        m1.isHideCollidedSymbols != m2.isHideCollidedSymbols ||
        m1.iconColor != m2.iconColor ||
        m1.zIndex != m2.zIndex
        ) {
      return NO;
    }
  }
  return YES;
}

// Updating the child view props
- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<SccMapViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<SccMapViewProps const>(props);
  
  // markers
  if (!areMarkersEqual(oldViewProps.markers, newViewProps.markers)) {
    NSMutableArray<RNTSccMarkerData *> *markerArray = [NSMutableArray arrayWithCapacity:newViewProps.markers.size()];
    for (const auto &markerStruct : newViewProps.markers) {
      NSString *identifier = [NSString stringWithUTF8String:markerStruct.id.c_str()];
      
      NSString *iconResource = [NSString stringWithUTF8String:markerStruct.iconResource.c_str()];
      NSString *iconColor = [NSString stringWithUTF8String:markerStruct.iconColor.c_str()];
      
      double latitude = markerStruct.position.lat;
      double longitude = markerStruct.position.lng;
      
      NSString *captionText = [NSString stringWithUTF8String: markerStruct.captionText.c_str()];
      CGFloat captionTextSize = markerStruct.captionTextSize;
      bool isHideCollidedCaptions = markerStruct.isHideCollidedCaptions;
      bool isHideCollidedMarkers = markerStruct.isHideCollidedMarkers;
      bool isHideCollidedSymbols = markerStruct.isHideCollidedSymbols;
      int zIndex = markerStruct.zIndex;
      RNTSccMarkerData *markerData = [[RNTSccMarkerData alloc] initWithLongitude:longitude
                                                                        latitude:latitude
                                                                      identifier:identifier
                                                                    iconResource:iconResource
                                                                     captionText:captionText
                                                                 captionTextSize:captionTextSize
                                                          isHideCollidedCaptions:isHideCollidedCaptions
                                                           isHideCollidedMarkers:isHideCollidedMarkers
                                                           isHideCollidedSymbols:isHideCollidedSymbols
                                                                       iconColor:iconColor
                                                                          zIndex:zIndex];
      [markerArray addObject:markerData];
    }
    [_mapView setMarkers:markerArray];
  }
  
  // initialRegion
  if (oldViewProps.initialRegion.northEastLat != newViewProps.initialRegion.northEastLat ||
      oldViewProps.initialRegion.northEastLng != newViewProps.initialRegion.northEastLng ||
      oldViewProps.initialRegion.southWestLat != newViewProps.initialRegion.southWestLat ||
      oldViewProps.initialRegion.southWestLng != newViewProps.initialRegion.southWestLng) {
    NMGLatLng *northEast = [NMGLatLng latLngWithLat:newViewProps.initialRegion.northEastLat lng:newViewProps.initialRegion.northEastLng];
    NMGLatLng *southWest = [NMGLatLng latLngWithLat:newViewProps.initialRegion.southWestLat lng:newViewProps.initialRegion.southWestLng];
    NMGLatLngBounds *bounds = [NMGLatLngBounds latLngBoundsSouthWest:southWest northEast:northEast];
    [_mapView setInitialRegion:bounds];
  }
  
  // mapPadding
  if (oldViewProps.mapPadding.top != newViewProps.mapPadding.top ||
      oldViewProps.mapPadding.left != newViewProps.mapPadding.left ||
      oldViewProps.mapPadding.right != newViewProps.mapPadding.right ||
      oldViewProps.mapPadding.bottom != newViewProps.mapPadding.bottom) {
    CGFloat top = (CGFloat)newViewProps.mapPadding.top;
    CGFloat left = (CGFloat)newViewProps.mapPadding.left;
    CGFloat right = (CGFloat)newViewProps.mapPadding.right;
    CGFloat bottom = (CGFloat)newViewProps.mapPadding.bottom;
    [_mapView setMapPaddingWithTop:top left:left right:right bottom:bottom];
  }
  
  [super updateProps:props oldProps:oldProps];
}

// Emitting event back to JS. This method is called from Swift view
- (void)onCameraIdle:(NMGLatLngBounds *)region {
  if (_eventEmitter) {
    SccMapViewEventEmitter::OnCameraIdle eventStruct;
    eventStruct.northEastLat = region.northEastLat;
    eventStruct.northEastLng = region.northEastLng;
    eventStruct.southWestLat = region.southWestLat;
    eventStruct.southWestLng = region.southWestLng;
    self.eventEmitter.onCameraIdle(eventStruct);
  }
}

- (void)onMarkerPress:(NSString *)markerId {
  if (_eventEmitter) {
    SccMapViewEventEmitter::OnMarkerPress eventStruct;
    eventStruct.id = std::string([markerId UTF8String]);
    self.eventEmitter.onMarkerPress(eventStruct);
  }
}

// Event emitter convenience method
- (const SccMapViewEventEmitter &)eventEmitter
{
  return static_cast<const SccMapViewEventEmitter &>(*_eventEmitter);
}

- (void)handleCommand:(const NSString *)commandName
                 args:(const NSArray *)args
{
  RCTSccMapViewHandleCommand(self, commandName, args);
}

- (void)animateCamera:(double)latitude longitude:(double)longitude duration:(NSInteger)duration {
  NMGLatLng *position = [NMGLatLng latLngWithLat:latitude lng:longitude];
  [_mapView animateCamera:position duration:(double)duration];
}

- (void)fitToElements {
  [_mapView fitToElements];
}

- (void)animateToRegion:(double)northEastLat northEastLng:(double)northEastLng southWestLat:(double)southWestLat southWestLng:(double)southWestLng padding:(NSInteger)padding duration:(NSInteger)duration {
  NMGLatLng *northEast = [NMGLatLng latLngWithLat:northEastLat lng:northEastLng];
  NMGLatLng *southWest = [NMGLatLng latLngWithLat:southWestLat lng:southWestLng];
  NMGLatLngBounds *bounds = [NMGLatLngBounds latLngBoundsSouthWest:southWest northEast:northEast];
  [_mapView animateToRegion:bounds padding:(double)padding duration:(double)duration];
}

- (void)setPositionMode:(NSString *)mode {
  NSArray *items = @[@"normal", @"direction", @"compass"];
  NSUInteger item = [items indexOfObject:mode];
  switch (item) {
    case 0:
      _mapView.positionMode = NMFMyPositionNormal;
      break;
    case 1:
      _mapView.positionMode = NMFMyPositionDirection;
      break;
    case 2:
      _mapView.positionMode = NMFMyPositionCompass;
      break;
    default:
      _mapView.positionMode = NMFMyPositionNormal;
      break;
  }
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<SccMapViewComponentDescriptor>();
}

@end
