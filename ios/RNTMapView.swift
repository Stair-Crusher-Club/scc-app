//
//  RNTMapView.swift
//  sccReactNative
//
//  Created by 김상민 on 9/16/24.
//

import UIKit
import NMapsMap

class RNTMapView: NMFMapView, NMFMapViewCameraDelegate {
  
  class MarkerWithData {
    var marker: NMFMarker
    var data: MarkerData
    
    init(marker: NMFMarker, data: MarkerData) {
      self.marker = marker
      self.data = data
    }
  }
  
  
  private var isInitialRegionSet = false
  private var currentTargetMarker: MarkerWithData? = nil
  private var markerList: Array<MarkerWithData> = []
  private var overlayImageMap: [String:NMFOverlayImage] = [:]

  @objc func animateCamera(_ position: NMGLatLng, duration: Double) {
    let cameraUpdate = NMFCameraUpdate(scrollTo: position)
    cameraUpdate.animation = .easeIn
    cameraUpdate.animationDuration = duration
    moveCamera(cameraUpdate)
  }

  @objc func fitToElements() {
    if markerList.isEmpty {
      return
    }
    let markerLatlngs = markerList.map { marker in
      return marker.marker.position
    }
    let cameraUpdate = NMFCameraUpdate(fit: NMGLatLngBounds(latLngs: markerLatlngs), padding: 10)
    cameraUpdate.animationDuration = 0.15
    cameraUpdate.animation = .fly
    moveCamera(cameraUpdate)
  }
  
  @objc func animateToRegion(region: NMGLatLngBounds, padding: Double, duration: Double) {
    let cameraUpdate = NMFCameraUpdate(fit: region, padding: padding)
    cameraUpdate.animationDuration = duration
    cameraUpdate.animation = .fly
    moveCamera(cameraUpdate)
  }

  @objc func setMarkers(_ val: NSArray) {
    let markers = val.map { item in
      let item = MarkerData(json: (item as! NSDictionary))
      return item
    }
    markerList.forEach { marker in
      marker.marker.mapView = nil
    }
    markerList = markers.map { markerData in
      let marker = NMFMarker()
      marker.position = NMGLatLng(lat: markerData.latitude, lng: markerData.longitude)
      marker.captionText = markerData.displayName
      marker.captionTextSize = 14
      marker.iconImage = getMarkerOverlayImage(iconResource: markerData.iconResource, isSelected: false)
      marker.isHideCollidedCaptions = true
      marker.isHideCollidedSymbols = true
      marker.touchHandler = { (overlay: NMFOverlay) -> Bool in
        self.markerPress(markerData.id)
        return true
      }
      marker.mapView = self
      return MarkerWithData(marker: marker, data: markerData)
    }
  }
  
  @objc func setInitialRegion(_ json: NSDictionary) {
    if isInitialRegionSet {
      return
    }
    guard let region = Parser.parseRegion(json) else { return }
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
      let cameraUpdate = NMFCameraUpdate(fit: region)
      self?.moveCamera(cameraUpdate)
      self?.isInitialRegionSet = true
    }
  }
  
  @objc func setMapPadding(_ json: NSDictionary) {
    if let top = (json["top"] as? NSNumber)?.floatValue,
       let left = (json["left"] as? NSNumber)?.floatValue,
       let right = (json["right"] as? NSNumber)?.floatValue,
       let bottom = (json["bottom"] as? NSNumber)?.floatValue {
      contentInset = UIEdgeInsets(
        top: CGFloat(top),
        left: CGFloat(left),
        bottom: CGFloat(bottom),
        right: CGFloat(right)
      )
    }
  }
  
  @objc func setSelectedItemId(_ selectedItemId: NSString) {
    let selectedItemId = selectedItemId as String
    guard let targetMarker = (markerList.first { marker in
      marker.data.id == selectedItemId
    }) else { return }
    if let currentTargetMarker {
      currentTargetMarker.marker.zIndex = 0
      currentTargetMarker.marker.isHideCollidedCaptions = true
      currentTargetMarker.marker.iconImage = getMarkerOverlayImage(iconResource: currentTargetMarker.data.iconResource, isSelected: false)
    }
    targetMarker.marker.zIndex = 99
    targetMarker.marker.isHideCollidedCaptions = false
    targetMarker.marker.iconImage = getMarkerOverlayImage(iconResource: targetMarker.data.iconResource, isSelected: true)
    currentTargetMarker = targetMarker
  }
  
  @objc var onCameraIdle: RCTDirectEventBlock?
  @objc var onMarkerPress: RCTDirectEventBlock?
  
  @objc func markerPress(_ id: String) {
    guard let callback = onMarkerPress else { return }
    let event = ["id": id]
    callback(event)
  }
  
  @objc func cameraIdle(_ bounds: NMGLatLngBounds) {
    guard let callback = onCameraIdle else { return }
    let event = [
      "region": [
        "northEast": ["latitude": bounds.northEastLat, "longitude": bounds.northEastLng],
        "southWest": ["latitude": bounds.southWestLat, "longitude": bounds.southWestLng]
      ]
    ]
    callback(event)
  }
  
  func mapViewCameraIdle(_ mapView: NMFMapView) {
    cameraIdle(mapView.contentBounds)
  }
  
  private func getMarkerOverlayImage(iconResource: String, isSelected: Bool) -> NMFOverlayImage {
    let iconString = iconResource + (isSelected ? "_on" : "_off")
    if let cachedImage = overlayImageMap[iconString] {
      return cachedImage
    }
    let newImage = NMFOverlayImage(name: iconString)
    overlayImageMap[iconString] = newImage
    return newImage
  }
}
