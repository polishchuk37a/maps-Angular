import {Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {FormBuilder} from "@angular/forms";
import {featureGroup, Layer, marker} from "leaflet";
import 'leaflet-draw';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  map: L.Map;
  markers: Layer[] = [];
  defaultCoordinates = {x: 48.5132, y: 32.2597};

  markerIcon = L.icon({
    iconUrl: 'assets/images/ukrainian-flag.png',
    iconSize: [70, 80]
  })

  coordinateForm = this.formBuilder.group({
    coordinateX: [''],
    coordinateY: ['']
  });

  constructor(private readonly formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.initMap();
    this.drawOnTheMap();
  }

  initMap(): void {
    const startCoordinates = L.latLng(this.defaultCoordinates.x, this.defaultCoordinates.y);

    this.map = L.map('map').setView(startCoordinates, 12);

    this.markers.push(marker([this.defaultCoordinates.x, this.defaultCoordinates.y], {icon: this.markerIcon}));

    const mark = L.marker(startCoordinates, {
      icon: this.markerIcon,
      draggable: true
    }).addTo(this.map);

    mark.on('dragend',() => {
      this.coordinateForm.get('coordinateX')?.setValue(mark.getLatLng().lat);
      this.coordinateForm.get('coordinateY')?.setValue(mark.getLatLng().lng);
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 15,
    }).addTo(this.map);
  }

  drawOnTheMap(): void {
    const drawItems = L.featureGroup().addTo(this.map);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawItems,
      },
      draw: {
        marker: false,
        polyline: false
      },
      position: "topright"
    });

    this.map.addControl(drawControl);

    this.map.on(L.Draw.Event.CREATED, (event) => {
      drawItems.addLayer(event.layer);
    });
  }

  setViewAndMarkByCoordinates(): void {
    const x = this.coordinateForm.get('coordinateX')?.value;
    const y = this.coordinateForm.get('coordinateY')?.value;

    this.markers.push(marker([x, y], {icon: this.markerIcon}));

    const group = featureGroup(this.markers);

    group.addTo(this.map);
    this.map.fitBounds(group.getBounds());
  }

}
