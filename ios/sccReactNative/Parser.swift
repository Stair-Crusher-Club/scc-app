//
//  Parser.swift
//  sccReactNative
//
//  Created by 김상민 on 9/20/24.
//

import Foundation
import NMapsMap

class Parser {
  static func parseLatLng(_ position: NSDictionary) -> NMGLatLng? {
    guard let latitude = (position.object(forKey: "latitude") as? NSNumber)?.doubleValue,
      let longitude = (position.object(forKey: "longitude") as? NSNumber)?.doubleValue
    else { return nil }
    return NMGLatLng(lat: latitude, lng: longitude)
  }
  
  static func parseRegion(_ region: NSDictionary) -> NMGLatLngBounds? {
    guard 
      let northEastJson = (region["northEast"] as? NSDictionary),
      let southWestJson = (region["southWest"] as? NSDictionary),
      let northEast = parseLatLng(northEastJson),
      let southWest = parseLatLng(southWestJson) else { return nil }
    return NMGLatLngBounds(southWest: southWest, northEast: northEast)
  }
}
