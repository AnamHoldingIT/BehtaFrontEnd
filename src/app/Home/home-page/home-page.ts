import { Component } from '@angular/core';
import { NavBar } from "../../Core/nav-bar/nav-bar";
import { Hero } from "../hero/hero";
import { About } from "../about/about";
import { Features } from "../features/features";
import { Structure } from "../ShowCase/structure/structure";
import { HowItWork } from "../how-it-work/how-it-work";
import { Decription } from "../decription/decription";
import { Cta } from "../cta/cta";
import { Faq } from "../faq/faq";
import { Partners } from "../partners/partners";
import { Footer } from "../../Core/footer/footer";
import { PatchnotesDialog } from "../patchnotes-dialog/patchnotes-dialog";

@Component({
  selector: 'app-home-page',
  imports: [NavBar, Hero, About, Features, Structure, HowItWork, Decription, Cta, Faq, Partners, Footer, PatchnotesDialog],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

}
