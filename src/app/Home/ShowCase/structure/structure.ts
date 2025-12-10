import { Component } from '@angular/core';
import { Iphone } from "../iphone/iphone";

@Component({
  selector: 'app-structure',
  imports: [Iphone],
  templateUrl: './structure.html',
  styleUrl: './structure.css',
})
export class Structure {

    img1 = '/assets/img/bg/Gemini_Generated_Image_8c2nyp8c2nyp8c2n.png';
  img2 = 'assets/img/bg/Gemini_Generated_Image_o3cna7o3cna7o3cn.png';
  img3 = 'assets/img/bg/voice.png'; // مسیر خودت رو درست بزن

  activeImage = this.img1;

  setActiveImage(img: string) {
    this.activeImage = img;
  }

}
