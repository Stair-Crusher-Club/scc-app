#import "SccCameraButtons.h"

#import <AVFoundation/AVFoundation.h>
#import <AVKit/AVKit.h>
#import <MediaPlayer/MediaPlayer.h>
#import <UIKit/UIKit.h>

static NSString *const kEventCapturePress = @"SccCameraButtonsCapturePress";

@interface SccCameraButtons ()

@property (nonatomic, assign) BOOL attached;
@property (nonatomic, assign) BOOL hasListeners;

// iOS 17.2+ path
@property (nonatomic, strong) id captureInteraction; // AVCaptureEventInteraction *
@property (nonatomic, weak) UIView *interactionHostView;

// iOS < 17.2 fallback path
@property (nonatomic, assign) BOOL volumeObserverInstalled;
@property (nonatomic, assign) float lastObservedVolume;
@property (nonatomic, strong) MPVolumeView *hiddenVolumeView;

@end

@implementation SccCameraButtons

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents {
  return @[kEventCapturePress];
}

- (void)startObserving {
  self.hasListeners = YES;
}

- (void)stopObserving {
  self.hasListeners = NO;
}

#pragma mark - JS exposed

RCT_EXPORT_METHOD(attach:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  if (self.attached) {
    resolve(@(YES));
    return;
  }
  self.attached = YES;

  if (@available(iOS 17.2, *)) {
    [self installCaptureInteraction];
  } else {
    [self installVolumeObserver];
  }
  resolve(@(YES));
}

RCT_EXPORT_METHOD(detach:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  if (!self.attached) {
    resolve(@(YES));
    return;
  }
  self.attached = NO;

  if (@available(iOS 17.2, *)) {
    [self uninstallCaptureInteraction];
  }
  [self uninstallVolumeObserver];
  resolve(@(YES));
}

#pragma mark - iOS 17.2+ AVCaptureEventInteraction

- (void)installCaptureInteraction API_AVAILABLE(ios(17.2)) {
  UIView *host = [self keyWindowRootView];
  if (host == nil) {
    // Window not ready yet (rare). Retry on next run loop.
    __weak typeof(self) weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
      typeof(self) strongSelf = weakSelf;
      if (strongSelf == nil || !strongSelf.attached) {
        return;
      }
      if (@available(iOS 17.2, *)) {
        [strongSelf installCaptureInteraction];
      }
    });
    return;
  }

  __weak typeof(self) weakSelf = self;
  AVCaptureEventInteraction *interaction = [[AVCaptureEventInteraction alloc] initWithHandler:^(AVCaptureEvent * _Nonnull event) {
    if (event.phase != AVCaptureEventPhaseBegan) {
      return;
    }
    typeof(self) strongSelf = weakSelf;
    if (strongSelf == nil || !strongSelf.attached || !strongSelf.hasListeners) {
      return;
    }
    [strongSelf sendEventWithName:kEventCapturePress body:nil];
  }];
  interaction.enabled = YES;
  [host addInteraction:interaction];
  self.captureInteraction = interaction;
  self.interactionHostView = host;
}

- (void)uninstallCaptureInteraction API_AVAILABLE(ios(17.2)) {
  UIView *host = self.interactionHostView;
  id interaction = self.captureInteraction;
  if (host != nil && interaction != nil && [interaction conformsToProtocol:@protocol(UIInteraction)]) {
    [host removeInteraction:(id<UIInteraction>)interaction];
  }
  self.captureInteraction = nil;
  self.interactionHostView = nil;
}

- (UIView *)keyWindowRootView {
  UIWindow *keyWindow = nil;
  for (UIScene *scene in UIApplication.sharedApplication.connectedScenes) {
    if (![scene isKindOfClass:[UIWindowScene class]]) continue;
    UIWindowScene *windowScene = (UIWindowScene *)scene;
    for (UIWindow *window in windowScene.windows) {
      if (window.isKeyWindow) {
        keyWindow = window;
        break;
      }
    }
    if (keyWindow != nil) break;
  }
  return keyWindow.rootViewController.view;
}

#pragma mark - iOS < 17.2 fallback (AVAudioSession KVO)

- (void)installVolumeObserver {
  if (self.volumeObserverInstalled) {
    return;
  }
  [self installHiddenVolumeView];

  NSError *error = nil;
  AVAudioSession *session = [AVAudioSession sharedInstance];
  [session setCategory:AVAudioSessionCategoryPlayback
           withOptions:AVAudioSessionCategoryOptionMixWithOthers
                 error:&error];
  [session setActive:YES error:&error];

  self.lastObservedVolume = session.outputVolume;
  [session addObserver:self
            forKeyPath:@"outputVolume"
               options:NSKeyValueObservingOptionNew
               context:nil];
  self.volumeObserverInstalled = YES;
}

- (void)uninstallVolumeObserver {
  if (!self.volumeObserverInstalled) {
    return;
  }
  @try {
    [[AVAudioSession sharedInstance] removeObserver:self forKeyPath:@"outputVolume"];
  } @catch (NSException *exception) {
    // ignore
  }
  self.volumeObserverInstalled = NO;
  [self uninstallHiddenVolumeView];
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary *)change
                       context:(void *)context {
  if (![keyPath isEqualToString:@"outputVolume"]) {
    return;
  }
  if (!self.attached || !self.hasListeners) {
    return;
  }
  NSNumber *newValue = change[NSKeyValueChangeNewKey];
  if (newValue == nil) {
    return;
  }
  float newVolume = newValue.floatValue;
  if (fabsf(newVolume - self.lastObservedVolume) < 0.0001f) {
    return;
  }
  self.lastObservedVolume = newVolume;
  [self sendEventWithName:kEventCapturePress body:nil];
}

- (void)installHiddenVolumeView {
  if (self.hiddenVolumeView != nil) return;
  // Place an off-screen MPVolumeView to suppress the system volume HUD while
  // we still observe outputVolume changes.
  MPVolumeView *view = [[MPVolumeView alloc] initWithFrame:CGRectMake(-1000, -1000, 1, 1)];
  view.showsRouteButton = NO;
  view.alpha = 0.01;
  self.hiddenVolumeView = view;
  UIView *host = [self keyWindowRootView];
  if (host != nil) {
    [host addSubview:view];
  }
}

- (void)uninstallHiddenVolumeView {
  [self.hiddenVolumeView removeFromSuperview];
  self.hiddenVolumeView = nil;
}

- (void)dealloc {
  if (self.volumeObserverInstalled) {
    @try {
      [[AVAudioSession sharedInstance] removeObserver:self forKeyPath:@"outputVolume"];
    } @catch (NSException *exception) {
      // ignore
    }
  }
}

@end
