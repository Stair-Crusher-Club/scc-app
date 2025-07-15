//
// MarkerData.h
// sccReactNative
//
// Created by 김상민 on 9/16/24.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface MarkerData : NSObject

@property (nonatomic, assign) double longitude;
@property (nonatomic, assign) double latitude;
@property (nonatomic, strong) NSString *identifier; // Renamed 'id' to 'identifier' to avoid conflict with NSObject's id
@property (nonatomic, strong) NSString *displayName;
@property (nonatomic, strong) NSString *iconResource;

- (instancetype)initWithLongitude:(double)longitude
                         latitude:(double)latitude
                       identifier:(NSString *)identifier
                      displayName:(NSString *)displayName
                     iconResource:(NSString *)iconResource;

@end

NS_ASSUME_NONNULL_END
