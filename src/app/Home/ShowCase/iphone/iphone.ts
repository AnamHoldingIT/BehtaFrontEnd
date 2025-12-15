import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-iphone',
  imports: [],
  templateUrl: './iphone.html',
  styleUrl: './iphone.css',
})
export class Iphone {

    @Input() imageUrl: string = '/assets/img/bg/Gemini_Generated_Image_8c2nyp8c2nyp8c2n.png';

}
