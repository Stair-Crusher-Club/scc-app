//
//  RNTMapViewManager.swift
//  sccReactNative
//
//  Created by 김상민 on 9/16/24.
//
import NMapsMap

@objc(RNTMapViewManager)
class RNTMapViewManager: RCTViewManager {
 
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
 
  override func view() -> UIView! {
    let map = RNTMapView()
    map.positionMode = .normal
    map.addCameraDelegate(delegate: map)
    return map
  }
  
  @objc func fitToElements(_ node: NSNumber) {
    DispatchQueue.main.async { [weak self] in
      guard let component = (self?.bridge.uiManager.view(forReactTag: node) as? RNTMapView) else { return }
      component.fitToElements()
    }
  }
  
  @objc func animateToRegion(_ node: NSNumber, region: NSDictionary, padding: CGFloat, duration: CGFloat) {
    DispatchQueue.main.async { [weak self] in
      guard let component = (self?.bridge.uiManager.view(forReactTag: node) as? RNTMapView) else { return }
      guard let region = Parser.parseRegion(region) else { return }
      component.animateToRegion(
        region: region,
        padding: Double(padding),
        duration: Double(duration) / 1000
      )
    }
  }
  
  @objc func animateCamera(_ node: NSNumber, camera: NSDictionary, duration: CGFloat) {
    DispatchQueue.main.async { [weak self] in
      guard let center = camera["center"] as? NSDictionary else { return }
      guard let position = Parser.parseLatLng(center) else { return }
      guard let component = self?.bridge.uiManager.view(forReactTag: node) as? RNTMapView else { return }
      component.animateCamera(position, duration: Double(duration) / 1000)
    }
  }

  @objc func setPositionMode(_ node: NSNumber, mode: String) {
    DispatchQueue.main.async { [weak self] in
      guard let component = (self?.bridge.uiManager.view(forReactTag: node) as? RNTMapView) else { return }
      switch mode {
      case "normal":
        component.positionMode = .normal
      case "direction":
        component.positionMode = .direction
      case "compass":
        component.positionMode = .compass
      default:
        component.positionMode = .disabled
      }
    }
  }
}
