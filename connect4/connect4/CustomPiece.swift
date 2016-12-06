//
//  CustomPiece.swift
//  connect4
//
//  Created by jacob frank on 11/30/16.
//  Copyright © 2016 jacob frank. All rights reserved.
//

import UIKit
import AssetsLibrary
class CustomPiece: UIViewController, UIImagePickerControllerDelegate,UINavigationControllerDelegate {
    
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var PhotosOutlet: UIButton!
    @IBOutlet weak var cameraOutlet: UIButton!
    override func viewDidLoad() {
        super.viewDidLoad()
        if let imgData = UserDefaults.standard.object(forKey: "myImageKey") as? NSData {
        let retrievedImg = UIImage(data: imgData as Data)
        imageView.image = retrievedImg
            
        }
        else{
            imageView.backgroundColor = UIColor.black
        }
        imageView.layer.backgroundColor = UIColor.white.cgColor
        imageView.layer.cornerRadius=imageView.frame.size.width/2;
        imageView.layer.borderWidth=3.0;
        imageView.layer.masksToBounds = true;
        imageView.layer.borderColor=UIColor.black.cgColor;
        print("roatating")
       // imageView.transform = CGAffineTransform(rotationAngle: CGFloat(M_PI_2));


        // Do any additional setup after loading the view, typically from a nib.
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func PhotoLibrary(_ sender: UIButton) {
        let picker = UIImagePickerController()
        picker.delegate = self
        picker.sourceType = .photoLibrary
        present(picker,animated:true, completion: nil)
    }
    
    @IBAction func Camera(_ sender: UIButton) {
        let picker = UIImagePickerController()
        picker.delegate = self
        picker.sourceType = .camera
        present(picker,animated:true, completion: nil)

    }
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        let img = info[UIImagePickerControllerOriginalImage] as? UIImage; dismiss(animated: true, completion: nil)
        //let image: UIImage = (info[UIImagePickerControllerOriginalImage] as? UIImage)!;dismiss(animated: true, completion: nil)

        imageView.image = img
        imageView.transform = CGAffineTransform(rotationAngle: CGFloat(2*M_PI));
        imageView.layer.backgroundColor = UIColor.white.cgColor
        imageView.layer.cornerRadius=imageView.frame.size.width/2;
        imageView.layer.borderWidth=2.0;
        imageView.layer.masksToBounds = true;
        imageView.layer.borderColor=UIColor.black.cgColor;
        
        
        
    
        
        let data = UIImageJPEGRepresentation(img!, 0.75)
        UserDefaults.standard.set(data, forKey: "myImageKey")
        UserDefaults.standard.synchronize()
        
        
    }
    
    
    
    
 
}
