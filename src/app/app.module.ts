import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {ReactiveFormsModule} from "@angular/forms";
import { MapComponent } from './map/map.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {OverlayModule} from "@angular/cdk/overlay";
import {MatSelectModule} from "@angular/material/select";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import { AppRoutingModule } from './app-routing.module';
import { SecondMapComponent } from './second-map/second-map.component';
import {RouterModule} from "@angular/router";
import { CdkOverlayComponent } from './cdk-overlay/cdk-overlay.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SecondMapComponent,
    CdkOverlayComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    OverlayModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    AppRoutingModule,
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
