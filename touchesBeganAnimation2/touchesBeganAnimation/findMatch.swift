//
//  ViewController.swift
//  touchesBeganAnimation
//
//  Created by jacob frank on 12/4/16.
//  Copyright © 2016 jacob frank. All rights reserved.
//

import UIKit
import Foundation

class findMatch: UIViewController {
    //var squareView: UIImageView!
    var board : UIImageView!
    var gravity: UIGravityBehavior!
    var animator: UIDynamicAnimator!
    var collision: UICollisionBehavior!
    var name:String = ""
    var oppImage: UIImage?
    
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        
        let touchPoint = (touches.first)!.location(in: self.view) as CGPoint
        let xCoord = xPix2Coord(i: Int(touchPoint.x))
        let yCoord = yPix2Coord(i: Int(touchPoint.y))
        print(String(describing: touchPoint.x) +  ", " + String(describing: touchPoint.y))
        
        
        if(xCoord < 0 || xCoord > 6 || yCoord < 0 || yCoord > 6){
            return
        }
        
        
        SocketIOManager.sharedInstance.socket.emit("playerMove", xCoord)
        
    }
    
    
    func xCoord2Pix(i: Int)->Int{
        return 45 + 40*i
    }
    func yCoord2Pix(i: Int)->Int{
        return 48 + 80*i
    }
    func xPix2Coord(i: Int)->Int{
        return (i-45)/40
    }
    func yPix2Coord(i: Int)->Int{
        return (i-48)/80
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        board = UIImageView(frame: self.view.frame)
        let image = UIImage(named: "connect4.png");
        board.image = image;
        self.view.addSubview(board);
        
        
        SocketIOManager.sharedInstance.socket.on("connect") {data, ack in
            print("socket connected")
            if let imgData = UserDefaults.standard.object(forKey: "myImageKey") as? NSData {
                print("image found")
                //let retrievedImg = UIImage(data: imgData as Data)
                //let imageData = UIImagePNGRepresentation(retrievedImg!)
                let base64encoding = imgData.base64EncodedString()
                SocketIOManager.sharedInstance.socket.emit("image", base64encoding)
            }
        }
        
        SocketIOManager.sharedInstance.socket.on("name") {data, ack in
            print("name")
            // name is either X or O for now. should probably use players images?
            self.name = data[0] as! String
            print(self.name)
        }
        
        SocketIOManager.sharedInstance.socket.on("image") { objects, ack in
            // receive opponents image
            let binaryImage = objects[0] as? String
            print(binaryImage?.characters.count)
            let decodedData = NSData(base64Encoded: binaryImage!)
            self.oppImage = UIImage(data: decodedData! as Data)
        }
        
        SocketIOManager.sharedInstance.socket.on("startGame") {data, ack in
            print("startGame")
        }
        
        SocketIOManager.sharedInstance.socket.on("currentTurn") {data, ack in
            print("currentTurn")
            // Will be either X or O
            if(data[0] as! String == self.name) {
                // My turn
            } else {
                // Opponents turn
            }
        }
        
        SocketIOManager.sharedInstance.socket.on("playerMove") {data, ack in
            print("playerMove")
            // should bring back col and y
            if(data[1] as? Int == nil || data[2] as? Int == nil) {
                return
            }
            let xCoord = data[1] as! Int
            let yCoord = 6 - (data[2] as! Int)
            
            print(String(xCoord) + ", " + String(yCoord))
            
            let squareView = UIImageView(frame: CGRect(x: self.xCoord2Pix(i: xCoord), y: 46, width: 40, height: 75))
            
            if self.name == data[0] as! String, let imgData = UserDefaults.standard.object(forKey: "myImageKey") as? NSData {
                print("my image found")
                let retrievedImg = UIImage(data: imgData as Data)
                squareView.image = retrievedImg
            } else if self.name != data[0] as! String, self.oppImage != nil{
                print("opp image found")
                squareView.image = self.oppImage
            }
            else{
                print("image not found")
                squareView.backgroundColor = UIColor.black
                if(data[0] as? String == "O") {
                    squareView.backgroundColor = UIColor.red
                }
            }
            
            squareView.layer.cornerRadius = squareView.frame.width/2
            squareView.layer.masksToBounds = true
            squareView.layer.borderWidth=1.0;
            
            self.view.insertSubview(squareView, belowSubview: self.board)
            
            
            
            if(self.animator == nil) {
                self.animator = UIDynamicAnimator(referenceView: self.view)
            }
            let gravity = UIGravityBehavior(items: [squareView])
            self.animator.addBehavior(gravity)
            
            let collision = UICollisionBehavior(items: [squareView])
            collision.addBoundary(withIdentifier: "barrier" as NSCopying, from: CGPoint(x: self.board.frame.origin.x, y: CGFloat(self.yCoord2Pix(i: yCoord + 1))), to: CGPoint(x:self.board.frame.origin.x+self.board.frame.width ,y: CGFloat(self.yCoord2Pix(i: yCoord + 1))))
            
            self.animator.addBehavior(collision)
        }
        
        SocketIOManager.sharedInstance.socket.on("win") {data, ack in
            print("win")
        }
        
        SocketIOManager.sharedInstance.socket.on("draw") {data, ack in
            print("draw")
        }
        
        SocketIOManager.sharedInstance.socket.on("gameReset") {data, ack in
            print("gameReset")
            // Should respond with yes or no
        }
        
        SocketIOManager.sharedInstance.socket.on("gameOver") {data, ack in
            print("gameOver")
            // One or both players responded no to rematch
        }
        
        SocketIOManager.sharedInstance.establishConnection()
        print("connecting")
        
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    
}

