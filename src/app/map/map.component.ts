import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as L from "leaflet";
import 'leaflet.markercluster';
import 'leaflet-draw';
import {StorageService} from "../services/storage.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {fromEvent, Subject} from "rxjs";
import {takeUntil, tap} from "rxjs/operators";
import {GeoJsonObject} from "geojson";
import '@geoman-io/leaflet-geoman-free';
import {FileService} from "../services/file.service";
import {FocusMonitor} from "@angular/cdk/a11y";
import {CdkConnectedOverlay} from "@angular/cdk/overlay";
import {Router} from "@angular/router";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  map: L.Map;
  drawnItems = new L.FeatureGroup();
  geoJson = new L.GeoJSON();
  geoDataObj: GeoJsonObject;
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
  // drawnItemCollection = {features: <any>[], type: 'FeatureCollection'};
  splittedCoordinatesArray: string[] = [];

  fileControl = new FormControl('');

  coordinatesForm = this.formBuilder.group({
    coordinateX: ['', [Validators.required, Validators.pattern(/^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,15})?$/)]],
    coordinateY: ['', [Validators.required, Validators.pattern(/^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,15})?$/)]]
  });

  @ViewChild('coordinateXInput') coordinateXInput: ElementRef;
  @ViewChild('overlayInput', {static: true}) overlayInput: ElementRef;
  @ViewChild(CdkConnectedOverlay, {static: true}) overlay: CdkConnectedOverlay;

  private unsubscribe$ = new Subject<void>();

  get isCoordinateXInvalid(): boolean | undefined {
    return this.coordinatesForm.get('coordinateX')?.value !== '' && this.coordinatesForm.get('coordinateX')?.invalid;
  }

  get isCoordinateYInvalid(): boolean | undefined {
    return this.coordinatesForm.get('coordinateY')?.value !== '' && this.coordinatesForm.get('coordinateY')?.invalid;
  }

  get isSaveGeoDataButtonDisabled() : boolean {
    return this.geoDataObj === undefined;
  }

  constructor(private readonly storageService: StorageService,
              private readonly formBuilder: FormBuilder,
              private readonly fileService: FileService,
              private readonly focusMonitor: FocusMonitor,
              private readonly router: Router) { }

  ngOnInit(): void {
    this.initMap();
    this.drawOnMap();
    this.getGeoDataFromStorage();
    this.addMarkerClusters();
    // this.hideOrShowDrawnItems();
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

    // event to add circle radius property in object to save it in file or local storage
    // this.map.on(L.Draw.Event.CREATED, event => {
    //   this.drawnItems.addLayer(event.layer).addTo(this.map);
    //
    //   const layer = event.layer;
    //   const jsonLayer = layer.toGeoJSON();
    //
    //   if (layer instanceof L.Circle) {
    //     const circleRadius = layer.getRadius();
    //
    //     if (jsonLayer) {
    //       jsonLayer.properties = {...jsonLayer.properties, radius: circleRadius};
    //     }
    //   }
    //
    //   this.drawnItemCollection.features.push(jsonLayer);
    //
    //   this.storageService.setDataToLocalStorage('geoCoordinates', JSON.stringify(this.drawnItemCollection));
    // });

    this.map.on(L.Draw.Event.CREATED, event => {
      this.drawnItems.addLayer(event.layer).addTo(this.map);

      if (event.layer instanceof L.Circle) {
        const convertedCircle = L.PM.Utils.circleToPolygon(event.layer);
        convertedCircle.addTo(this.drawnItems);
      }

      this.geoDataObj = this.drawnItems.toGeoJSON();
      this.storageService.setDataToLocalStorage('geoCoordinates', JSON.stringify(this.geoDataObj));
    })

    this.map.on(L.Draw.Event.EDITSTART, () => {
      this.map.removeLayer(this.markerCluster);
      this.map.scrollWheelZoom.disable();

      this.drawnItems.eachLayer(layer => {
        this.map.addLayer(layer);
      });
    });

    this.map.on(L.Draw.Event.EDITSTOP, () => {
      this.map.addLayer(this.markerCluster);
      this.map.scrollWheelZoom.enable();
    });

    this.map.on(L.Draw.Event.DELETED, () => {
      this.storageService.setDataToLocalStorage('geoCoordinates', '');
    });
  }

  // convertPointToCircle(geoJsonObj: GeoJsonObject): L.GeoJSON {
  //   return L.geoJSON(geoJsonObj, {
  //     pointToLayer: (feature, latlng) => {
  //       if (feature.geometry.type === 'Point' && feature.properties.radius) {
  //         return L.circle(latlng, {
  //           radius: feature.properties.radius,
  //           color: '#1540ad',
  //           fillColor: '#c1d10f'
  //         });
  //       }
  //
  //       return L.marker(latlng,  {
  //         icon: this.markerIcon
  //       })
  //     }
  //   });
  // }

  showOrHideLayersBySelectedValueFromOverlay(selectedValue: string): void {
    switch (selectedValue) {
      case 'Points': {
        this.drawnItems.eachLayer(layer => this.map.addLayer(layer));
        this.map.addLayer(this.markerCluster);

        this.drawnItems.eachLayer(layer => {
          if (layer instanceof L.Circle || layer instanceof L.Polygon || layer instanceof L.Rectangle) {
            this.map.removeLayer(layer);
          }
        });

        break;
      }
      case 'Polygons': {
        this.drawnItems.eachLayer(layer => this.map.addLayer(layer));
        this.map.removeLayer(this.markerCluster);

        this.drawnItems.eachLayer(layer => {
          if (layer instanceof L.Rectangle || layer instanceof L.Marker || layer instanceof L.Circle) {
            this.map.removeLayer(layer);
          }
        });

        break;
      }
      default: {
        this.drawnItems.eachLayer(layer => this.map.addLayer(layer));
        this.map.addLayer(this.markerCluster);

        break;
      }
    }
  }

  addMarkerClusters(): void {
    this.drawnItems.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        this.markerCluster.addLayer(layer);
        this.map.addLayer(this.markerCluster);
      }
    })
  }

  watchSecondMap(): void {
    this.map.remove();
    this.router.navigate(['/second-map']);
  }

  getGeoDataFromStorage(): void {
    const geoDataFromStorage = this.storageService.getDataFromLocalStorage('geoCoordinates');

    if (geoDataFromStorage !== '') {
      this.geoJson.addData(JSON.parse(geoDataFromStorage));

      this.geoJson.eachLayer(layer => {
        layer.addTo(this.drawnItems);

        if (layer instanceof L.Marker) {
          layer.setIcon(this.markerIcon);
        }
      });

      this.geoJson.setStyle({
        color: '#1540ad',
        fillColor: '#c1d10f'
      });
    }
  }

  saveGeoDataInFile(): void {
    this.fileService.saveGeoData(this.geoDataObj);
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
        this.geoJson.clearLayers();

        this.geoJson.addData(JSON.parse(geoFromFile));

        this.geoJson.eachLayer(layer => {
          layer.addTo(this.drawnItems);

          if (layer instanceof L.Marker) {
            layer.setIcon(this.markerIcon);
          }
        });

        this.geoJson.setStyle({
          color: '#1540ad',
          fillColor: '#c1d10f'
        });
      } else {
        alert('Incorrect geoFromFile data');
      }
    }
  }

  readAndSetCoordinatesFromClipboardIntoForm(): void {
    navigator.clipboard.readText().then((value) => {
      this.splitCoordinates(value);
      this.setCoordinatesIntoForm();
    });
  }

  splitCoordinates(valueFromClipboard: string): void {
    this.splittedCoordinatesArray = valueFromClipboard.split('').filter(value => value !== ',').join('').split(' ', 2);
  }

  setCoordinatesIntoForm(): void {
    this.coordinatesForm.get('coordinateX')?.setValue(this.splittedCoordinatesArray[0]);
    this.coordinatesForm.get('coordinateY')?.setValue(this.splittedCoordinatesArray[1]);
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
            this.readAndSetCoordinatesFromClipboardIntoForm();
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
