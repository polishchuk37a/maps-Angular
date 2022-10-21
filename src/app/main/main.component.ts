import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as L from 'leaflet';
import { featureGroup, Layer, marker} from 'leaflet';
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import 'leaflet-draw';
import {fromEvent, Subject} from "rxjs";
import {takeUntil, tap} from "rxjs/operators";
import {Coordinate} from "../interface/coordinate";
import {StorageService} from "../services/storage.service";
import {GeoJsonObject} from "geojson";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, AfterViewInit, OnDestroy {
  map: L.Map;
  markers: Layer[] = [];
  geoJson = new L.GeoJSON();
  defaultCoordinates = {x: 48.5132, y: 32.2597};

  markerIcon = L.icon({
    iconUrl: 'assets/images/ukrainian-flag.png',
    iconSize: [50, 60]
  });

  coordinateForm = this.formBuilder.group({
    coordinateX: ['', [Validators.required, Validators.pattern(/^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,15})?$/)]],
    coordinateY: ['', [Validators.required, Validators.pattern(/^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,15})?$/)]]
  });

  fileControl = new FormControl('');

  @ViewChild('coordinateXInput') coordinateXInput: ElementRef;

  private unsubscribe$ = new Subject<void>();

  get isCoordinateXInvalid(): boolean | undefined {
    return this.coordinateForm.get('coordinateX')?.value !== '' && this.coordinateForm.get('coordinateX')?.invalid;
  }

  get isCoordinateYInvalid(): boolean | undefined {
    return this.coordinateForm.get('coordinateY')?.value !== '' && this.coordinateForm.get('coordinateY')?.invalid;
  }

  constructor(private readonly formBuilder: FormBuilder, private readonly storageService: StorageService) { }

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

    const dataFromStorage = this.storageService.getDataFromLocalStorage('geoCoordinates');

    if (dataFromStorage !== '') {
      this.geoJson.addData(JSON.parse(dataFromStorage)).addTo(this.map);
      this.geoJson.setStyle({
        color: '#1540ad',
        fillColor: '#c1d10f'
      });
    }
  }

  drawOnTheMap(): void {
    const drawItems = L.featureGroup().addTo(this.map);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawItems,
      },
      draw: {
        marker: false,
        polyline: false,
        circle: {
          shapeOptions: {
            color: '#1540ad',
            fillColor: '#c1d10f'
          }
        },
        rectangle: {
          shapeOptions: {
            color: '#1540ad',
            fillColor: '#c1d10f'
          }
        },
        polygon: {
          shapeOptions: {
            color: '#1540ad',
            fillColor: '#c1d10f'
          }
        },
        circlemarker: {
          color: '#1540ad',
          fillColor: '#c1d10f'
        }
      },
      position: "topright",
    });

    this.map.addControl(drawControl);

    this.map.on(L.Draw.Event.CREATED, (event) => {
      drawItems.addLayer(event.layer);
      const geoJsonData = drawItems.toGeoJSON();
      this.storageService.setDataToLocalStorage('geoCoordinates', JSON.stringify(geoJsonData));
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

  readDataFromClipBoard(): void {
    navigator.clipboard.readText().then((value) => {
      this.splitCoordinates(value);
    });
  }

  splitCoordinates(valueFromClipboard: string): void {
    const coordinatesArray = valueFromClipboard.split('').filter(value => value !== ',').join('').split(' ', 2);
    this.setCoordinatesIntoForm({x: coordinatesArray[0], y: coordinatesArray[1]});
  }

  setCoordinatesIntoForm(coordinate: Coordinate): void {
    this.coordinateForm.get('coordinateX')?.setValue(coordinate.x);
    this.coordinateForm.get('coordinateY')?.setValue(coordinate.y);
  }

  readFile(event: Event): void {
    if (event.target === null) {
      return;
    }

    const files = (event.target as HTMLInputElement).files;

    if (files === null || files === undefined) {
      return;
    }

    const file = files.item(0);
    const reader = new FileReader();

    reader.onloadend = () => {
      const geo = reader.result?.toString() ?? '';

      if (file) {
        const fileExtension = file.name.substr(file.name.lastIndexOf('.') + 1);

        if (fileExtension === 'geojson') {
          this.geoJson.addData(JSON.parse(geo)).addTo(this.map);
          this.geoJson.setStyle({
            color: '#1540ad',
            fillColor: '#c1d10f'
          });
        } else {
          alert('Incorrect geo data')
        }
      }
    }

    reader.readAsText(file as Blob);
  }

  ngAfterViewInit(): void {
    fromEvent<KeyboardEvent>(this.coordinateXInput.nativeElement, 'keydown')
      .pipe(
        tap((e: KeyboardEvent) => {
          if (e.keyCode === 86 && e.ctrlKey) {
            this.readDataFromClipBoard();
          }
        }),
        takeUntil(this.unsubscribe$)
      ).subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
