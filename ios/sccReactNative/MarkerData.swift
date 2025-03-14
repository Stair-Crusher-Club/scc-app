//
//  MarkerData.swift
//  sccReactNative
//
//  Created by 김상민 on 9/16/24.
//

import Foundation

class MarkerData {
  var longitude: Double
  var latitude: Double
  var id: String
  var displayName: String
  var iconResource: String
  
  init(longitude: Double, latitude: Double, id: String, displayName: String, iconResource: String) {
    self.longitude = longitude
    self.latitude = latitude
    self.id = id
    self.displayName = displayName
    self.iconResource = iconResource
  }
  
  init(json: NSDictionary) {
    if let loc = json["location"] as? NSDictionary,
       let longitude = (loc["lng"] as? NSNumber)?.doubleValue,
       let latitude = (loc["lat"] as? NSNumber)?.doubleValue,
       let displayName = json["displayName"] as? String,
       let id = json["id"] as? String {
      let iconResource = json["iconResource"] as? String
      self.longitude = longitude
      self.latitude = latitude
      self.id = id
      self.displayName = displayName
      self.iconResource = iconResource ?? "default_none"
    } else {
      self.longitude = 0.0
      self.latitude = 0.0
      self.id = "Unknown"
      self.displayName = "Unknown"
      self.iconResource = "default_none"
    }
  }
}
