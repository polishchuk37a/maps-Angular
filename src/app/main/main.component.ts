import {Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  map: L.Map;

  coordinateForm = this.formBuilder.group({
    coordinateX: [''],
    coordinateY: ['']
  });

  constructor(private readonly formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.initMap();
  }

  initMap(): void {
    const defaultCoordinates = L.latLng(48.5132, 32.2597);

    this.map = L.map('map').setView(defaultCoordinates, 12);
    L.marker(defaultCoordinates).addTo(this.map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 15,
    }).addTo(this.map);
  }

  setViewAndMarkByCoordinates(): void {
    const x = this.coordinateForm.get('coordinateX')?.value;
    const y = this.coordinateForm.get('coordinateY')?.value;
    const coordinates = L.latLng(x, y);

    this.map.setView(coordinates, 12);
    L.marker(coordinates).addTo(this.map);
  }
}
