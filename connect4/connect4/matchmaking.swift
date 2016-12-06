
//
//  ViewController.swift
//  touchesBeganAnimation
//
//  Created by jacob frank on 12/4/16.
//  Copyright © 2016 jacob frank. All rights reserved.
//

import UIKit
import Foundation

class matchMaking: UIViewController {
    //var squareView: UIView!
    var squareView: UIImageView!
    var board : UIImageView!
    var gravity: UIGravityBehavior!
    var animator: UIDynamicAnimator!
    var collision: UICollisionBehavior!
    
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        
        let touchPoint = (touches.first)!.location(in: self.view) as CGPoint
        let xCoord = xPix2Coord(i: Int(touchPoint.x))
        let yCoord = yPix2Coord(i: Int(touchPoint.y))
        print(String(describing: touchPoint.x) +  ", " + String(describing: touchPoint.y))
        
        
        if(xCoord < 0 || xCoord > 6 || yCoord < 0 || yCoord > 5){
            return
        }
        
        squareView = UIImageView(frame: CGRect(x: xCoord2Pix(i: xCoord), y: 46, width: 40, height: 75))
        
        //Get image
        if let imgData = UserDefaults.standard.object(forKey: "myImageKey") as? NSData {
            let retrievedImg = UIImage(data: imgData as Data)
            squareView.image = retrievedImg
        }
        else{
        squareView.backgroundColor = UIColor.black
        }
       
        squareView.layer.cornerRadius = squareView.frame.width/2
        squareView.layer.masksToBounds = true
        squareView.layer.borderWidth=1.0;
        squareView.layer.borderColor=UIColor.black.cgColor;
        //squareView.transform = CGAffineTransform(rotationAngle: CGFloat(M_PI));
        //squareView.contentMode = UIViewContentMode.scaleAspectFit
        //let size = CGSize(width:75, height: 40)
        //squareView.sizeThatFits(size)
        view.insertSubview(squareView, belowSubview: board)
        
        
        
        
        
        animator = UIDynamicAnimator(referenceView: view)
        gravity = UIGravityBehavior(items: [squareView])
        animator.addBehavior(gravity)
        
        collision = UICollisionBehavior(items: [squareView])
        //collision.translatesReferenceBoundsIntoBoundary = true
        //collision.addBoundary(withIdentifier: "barrier" as NSCopying, from: CGPoint(x: self.view.frame.origin.x, y: 350), to: CGPoint(x:self.view.frame.origin.x + self.view.frame.width ,y: 350))
        collision.addBoundary(withIdentifier: "barrier" as NSCopying, from: CGPoint(x: board.frame.origin.x, y: CGFloat(yCoord2Pix(i: yCoord + 1))), to: CGPoint(x:board.frame.origin.x+board.frame.width ,y: CGFloat(yCoord2Pix(i: yCoord + 1))))
        
        animator.addBehavior(collision)
        
    }
    
    
    func xCoord2Pix(i: Int)->Int{
        return 45 + 40*i
        //return 40*i

    }
    func yCoord2Pix(i: Int)->Int{
        return 48 + 80*i
        //return 80*i
    }
    func xPix2Coord(i: Int)->Int{
        return (i-45)/40
        //return (i)/40

    }
    func yPix2Coord(i: Int)->Int{
        return (i-48)/80
        //return (i)/80
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        board = UIImageView(frame: self.view.frame)
        let image = UIImage(named: "connect4.png");
        board.image = image;
        self.view.addSubview(board);
        
        
        
        //var imageView : UIImageView
        //let rect = CGRect(origin: CGPoint(x: 50,y :50), size: CGSize(width: 400, height: 400))
        
        //board  = UIImageView(frame:CGRect(x:10, y:10, width:400, hieght:400));
        //board  = UIImageView(frame: rect);
        //let rect = CGRect(origin: CGPoint(x: 0,y :0), size: CGSize(width: 100, height: 100))
        //board.image = UIImage(named:"connect4.png")
        //self.view.addSubview(board)
        
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    
}

