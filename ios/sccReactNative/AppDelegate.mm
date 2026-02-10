#import "AppDelegate.h"
#import <Firebase.h>
#import "RNFBMessagingModule.h"

#import <AirbridgeReactNative/AirbridgeReactNative.h>
#import "ReactNativeConfig.h"
#import <RNKakaoLogins.h>
#import <React/RCTBundleURLProvider.h>
#import <HotUpdater/HotUpdater.h>
#import <React/RCTLinkingManager.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];

  // Airbridge SDK: production에서만 초기화 (sandbox 데이터 오염 방지)
  NSString *flavor = [ReactNativeConfig envFor:@"FLAVOR"];
  if ([flavor isEqualToString:@"production"]) {
    [AirbridgeReactNative initializeSDKWithName:@"scc" token:@"270c418e2f3e40118622b749b94c590e"];
  }

  self.moduleName = @"StairCrusherClub";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = [RNFBMessagingModule addCustomPropsToUserProps:nil withLaunchOptions:launchOptions];
  self.dependencyProvider = [RCTAppDependencyProvider new];
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (BOOL)application:(UIApplication *)app
     openURL:(NSURL *)url
     options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  // Airbridge 딥링크 트래킹 (SDK 미초기화 시 no-op)
  [AirbridgeReactNative trackDeeplinkWithUrl:url];

  dispatch_async(dispatch_get_global_queue( DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^(void){
    dispatch_async(dispatch_get_main_queue(), ^(void){
      if ([RNKakaoLogins isKakaoTalkLoginUrl:url]) {
        [RNKakaoLogins handleOpenUrl: url];
      }
    });
  });
  return [RCTLinkingManager application:app openURL:url options:options];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
  return [HotUpdater bundleURL];
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  return true;
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  [AirbridgeReactNative trackDeeplinkWithUserActivity:userActivity];
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

- (BOOL)bridgelessEnabled
{
  return YES;
}

@end
