import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as L from "leaflet";
import 'leaflet.markercluster';
import 'leaflet-draw';
import {StorageService} from "../services/storage.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {Coordinate} from "../interface/coordinate";
import {fromEvent, Subject} from "rxjs";
import {takeUntil, tap} from "rxjs/operators";
import {GeoJsonObject} from "geojson";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  map: L.Map;
  drawnItems = new L.FeatureGroup();
  markerCluster = new L.MarkerClusterGroup({
      iconCreateFunction: cluster => {
        return L.divIcon({
          html: `<span>${cluster.getChildCount()}</span>`,
          className: 'custom-marker-cluster',
          iconSize: L.point(33, 33),
        });
      }
    }
  );
  markerIcon = L.icon({
    iconUrl: 'assets/images/ukrainian-flag.png',
    iconSize: [40, 50],
    iconAnchor: [20, 50]
  });
  drawnItemCollection = {features: <any>[], type: 'FeatureCollection'};

  fileControl = new FormControl('');

  coordinatesForm = this.formBuilder.group({
    coordinateX: ['', [Validators.required, Validators.pattern(/^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,15})?$/)]],
    coordinateY: ['', [Validators.required, Validators.pattern(/^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,15})?$/)]]
  });

  @ViewChild('coordinateXInput') coordinateXInput: ElementRef;

  private unsubscribe$ = new Subject<void>();

  get isCoordinateXInvalid(): boolean | undefined {
    return this.coordinatesForm.get('coordinateX')?.value !== '' && this.coordinatesForm.get('coordinateX')?.invalid;
  }

  get isCoordinateYInvalid(): boolean | undefined {
    return this.coordinatesForm.get('coordinateY')?.value !== '' && this.coordinatesForm.get('coordinateY')?.invalid;
  }

  get isSaveGeoDataButtonDisabled() : boolean {
    return this.drawnItemCollection.features.length === 0;
  }

  constructor(private readonly storageService: StorageService,
              private readonly formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.initMap();
    this.drawOnMap();
    this.getGeoDataFromStorage();
    this.hideOrShowDrawnItems();
  }

  initMap(): void {
    const startCoordinates = L.latLng(48.5132, 32.2597);

    this.map = L.map('map', {zoomControl: false}).setView(startCoordinates, 15);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 15,
    }).addTo(this.map);

    const startMarker = L.marker(startCoordinates, {icon: this.markerIcon});
    startMarker.addTo(this.drawnItems);
    this.drawnItems.addTo(this.map);
  }

  drawOnMap(): void {
    const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: this.drawnItems
        },
        draw: {
          marker: {
            icon: this.markerIcon
          },
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
          circlemarker: false
        }
      }
    );
    this.map.addControl(drawControl);

    this.map.on(L.Draw.Event.CREATED, event => {
      this.drawnItems.addLayer(event.layer).addTo(this.map);

      const layer = event.layer;
      const jsonLayer = layer.toGeoJSON();

      if (layer instanceof L.Circle) {
        const circleRadius = layer.getRadius();

        if (jsonLayer) {
          jsonLayer.properties = {...jsonLayer.properties, radius: circleRadius};
        }
      }

      this.drawnItemCollection.features.push(jsonLayer);

      this.storageService.setDataToLocalStorage('geoCoordinates', JSON.stringify(this.drawnItemCollection));
    });

    this.map.on(L.Draw.Event.EDITSTART, () => {
      this.map.removeLayer(this.markerCluster);
      this.map.scrollWheelZoom.disable();

      this.drawnItems.eachLayer(layer => {
        this.map.addLayer(layer);
      });
    });

    this.map.on(L.Draw.Event.EDITSTOP, () => {
      this.map.scrollWheelZoom.enable();
    });

    this.map.on(L.Draw.Event.DELETED, () => {
      this.storageService.setDataToLocalStorage('geoCoordinates', '');
    });
  }

  convertPointToCircle(geoJsonObj: GeoJsonObject): L.GeoJSON {
    return L.geoJSON(geoJsonObj, {
      pointToLayer: (feature, latlng) => {
        if (feature.geometry.type === 'Point' && feature.properties.radius) {
          return L.circle(latlng, {
            radius: feature.properties.radius,
            color: '#1540ad',
            fillColor: '#c1d10f'
          });
        }

        return L.marker(latlng,  {
          icon: this.markerIcon
        })
      }
    })
  }

  hideOrShowDrawnItems(): void {
    this.map.on("zoomend", () => {
      this.drawnItems.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          if (this.map.getZoom() < 10) {
            this.map.removeLayer(layer);
            this.map.removeLayer(this.markerCluster);
          } else {
            this.markerCluster.addLayer(layer);
            this.map.addLayer(this.markerCluster);
          }
        } else if (layer instanceof L.Polygon || layer instanceof L.Rectangle || L.Circle || L.CircleMarker) {
          if (this.map.getZoom() < 10) {
            this.map.addLayer(layer)
          } else {
            this.map.removeLayer(layer);
          }
        }
      });
    });
  }

  getGeoDataFromStorage(): void {
    const geoDataFromStorage = this.storageService.getDataFromLocalStorage('geoCoordinates');

    if (geoDataFromStorage !== '') {
      const localGeoJson = this.convertPointToCircle(JSON.parse(geoDataFromStorage));

      localGeoJson.eachLayer(layer => {
        layer.addTo(this.drawnItems);
      });

      localGeoJson.setStyle({
        color: '#1540ad',
        fillColor: '#c1d10f'
      });
    }
  }

  saveGeoDataInFile(): void {
    const fileName = 'geoData.geojson';
    const geoJsonFile = new Blob([JSON.stringify(this.drawnItemCollection)]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(geoJsonFile);
    link.download = fileName;
    link.click();
    link.remove();
  }

  getGeoDataFromFile(event: Event): void {
    if (event.target === null) {
      return;
    }

    const files = (event.target as HTMLInputElement).files;

    if (files === null || files === undefined) {
      return;
    }

    const file = files.item(0);

    if (file === null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsText(file as Blob);

    reader.onloadend = () => {
      const geoFromFile = reader.result?.toString() ?? '';
      const fileExtension = file.name.substr(file.name.lastIndexOf('.') + 1);

      if (fileExtension === 'geojson') {
        this.drawnItems.clearLayers();

        const localGeoJson = this.convertPointToCircle(JSON.parse(geoFromFile));

        localGeoJson.eachLayer(layer => {
          layer.addTo(this.drawnItems);
        });

        localGeoJson.setStyle({
          color: '#1540ad',
          fillColor: '#c1d10f'
        });
      } else {
        alert('Incorrect geoFromFile data');
      }
    }
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
    this.coordinatesForm.get('coordinateX')?.setValue(coordinate.x);
    this.coordinatesForm.get('coordinateY')?.setValue(coordinate.y);
  }

  setMarkerByCoordinates(): void {
    const x = this.coordinatesForm.get('coordinateX')?.value;
    const y = this.coordinatesForm.get('coordinateY')?.value;

    const marker = L.marker([x, y], {icon: this.markerIcon}).addTo(this.map);
    marker.addTo(this.drawnItems);
    this.map.fitBounds(this.drawnItems.getBounds());
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
