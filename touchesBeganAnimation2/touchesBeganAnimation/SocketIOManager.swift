//
//  SocketIOManager.swift
//  Final
//
//  Created by Barnard, Ben on 11/20/16.
//  Copyright © 2016 Barnard, Ben. All rights reserved.
//

import UIKit

class SocketIOManager: NSObject {
    static let sharedInstance = SocketIOManager()
    
    var socket: SocketIOClient = SocketIOClient(socketURL: URL(string: "http://ec2-54-89-251-47.compute-1.amazonaws.com:3000")!, config: [.log(true)])
    
    override init() {
        super.init()
    }
    
    func establishConnection() {
        socket.connect()
    }
    
    func closeConnection() {
        socket.disconnect()
    }
}
