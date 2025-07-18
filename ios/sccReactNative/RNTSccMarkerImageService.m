//
//  MarkerImageService.m
//  sccReactNative
//
//  Created by Sangmin Kim on 7/17/25.
//

#import <Foundation/Foundation.h>
#import "RNTSccMarkerImageService.h"
#import "RNTSccMarkerData.h"
#import <SVGKit/SVGKit.h>

@interface RNTSccMarkerImageService ()
@property (nonatomic, strong) NSCache<NSString *, UIImage *> *cache;
@end

@implementation RNTSccMarkerImageService

+ (instancetype)sharedService {
  static RNTSccMarkerImageService *service;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    service = [[RNTSccMarkerImageService alloc] init];
  });
  return service;
}

- (instancetype)init {
  if (self = [super init]) {
    _cache = [[NSCache alloc] init];
    _cache.countLimit = 100;
  }
  return self;
}

- (NSString *)cacheKeyForMarkerData:(RNTSccMarkerData *)data {
  // Compose a unique key based on relevant marker properties
  return [NSString stringWithFormat:@"%@_%@",
          data.iconResource,
          data.iconColor ?: @""
  ];
}

- (UIImage *)markerImageForData:(RNTSccMarkerData *)markerData {
  NSString *key = [self cacheKeyForMarkerData:markerData];
  UIImage *cached = [self.cache objectForKey:key];
  if (cached) return cached;
  
  // Optionally replace color in SVG string
  NSString *svgString = markerData.iconResource;
  if (markerData.iconColor) {
    svgString = [svgString stringByReplacingOccurrencesOfString:@"#9A9B9F"
                                                     withString:markerData.iconColor
                                                        options:NSCaseInsensitiveSearch
                                                          range:NSMakeRange(0, svgString.length)];
  }
  
  NSData *svgData = [svgString dataUsingEncoding:NSUTF8StringEncoding];
  SVGKImage *svgImage = [SVGKImage imageWithData:svgData];
  // Optionally set size here if needed: svgImage.size = CGSizeMake(..., ...);
  
  UIImage *uiImage = svgImage.UIImage;
  if (uiImage) {
    [self.cache setObject:uiImage forKey:key];
  }
  return uiImage;
}

@end
