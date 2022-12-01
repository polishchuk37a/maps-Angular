import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {MapComponent} from "./map/map.component";
import {SecondMapComponent} from "./second-map/second-map.component";

const routes: Routes = [
  {path: '', component: MapComponent},
  {path: 'second-map', component: SecondMapComponent}
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ]
})
export class AppRoutingModule { }
