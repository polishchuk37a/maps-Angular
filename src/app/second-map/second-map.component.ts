import { Component, OnInit } from '@angular/core';
import * as L from "leaflet";
import {GeoJsonObject} from "geojson";

@Component({
  selector: 'app-second-map',
  templateUrl: './second-map.component.html',
  styleUrls: ['./second-map.component.scss']
})
export class SecondMapComponent implements OnInit {
  map: L.Map;
  geoJson = new L.GeoJSON();
  geoJsonFeatures = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[38.034668,49.941499],[37.990723,49.728918],[37.902832,49.472586],[37.96875,49.257946],[38.100586,48.999141],[38.342285,48.666478],[38.605957,48.34621],[38.825684,48.0533],[39.067383,47.817765],[39.418945,47.86201],[39.726563,47.832518],[39.836426,48.097343],[40.056152,48.287762],[39.836426,48.608398],[39.418945,48.651964],[39.70459,48.854776],[40.209961,48.869232],[39.550781,49.013555],[40.012207,49.171828],[40.231934,49.415441],[40.12207,49.643624],[39.616699,49.743119],[39.001465,49.913209],[38.474121,50.040384],[38.034668,49.941499]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[33.991699,49.55818]}},{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[33.991699,50.30272],[34.113188,50.298579],[34.233283,50.286202],[34.350609,50.265732],[34.463829,50.237402],[34.571655,50.201538],[34.672871,50.158547],[34.766344,50.10892],[34.85104,50.053219],[34.926031,49.992075],[34.990512,49.926177],[35.043803,49.856263],[35.085359,49.783116],[35.11477,49.70755],[35.131768,49.630401],[35.136224,49.55252],[35.12815,49.474761],[35.107693,49.397975],[35.075132,49.322995],[35.030873,49.250633],[34.975443,49.181668],[34.909481,49.116841],[34.833732,49.056844],[34.749036,49.002317],[34.656318,48.953837],[34.556581,48.911919],[34.450893,48.877004],[34.340378,48.84946],[34.226202,48.829576],[34.109568,48.817562],[33.991699,48.813543],[33.87383,48.817562],[33.757196,48.829576],[33.643021,48.84946],[33.532505,48.877004],[33.426817,48.911919],[33.32708,48.953837],[33.234363,49.002317],[33.149666,49.056844],[33.073917,49.116841],[33.007956,49.181668],[32.952526,49.250633],[32.908267,49.322995],[32.875705,49.397975],[32.855248,49.474761],[32.847174,49.55252],[32.851631,49.630401],[32.868629,49.70755],[32.89804,49.783116],[32.939595,49.856263],[32.992886,49.926177],[33.057367,49.992075],[33.132359,50.053219],[33.217054,50.10892],[33.310527,50.158547],[33.411743,50.201538],[33.519569,50.237402],[33.632789,50.265732],[33.750116,50.286202],[33.870211,50.298579],[33.991699,50.30272]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[33.596191,47.358362],[33.596191,48.156009],[36.672363,48.156009],[36.672363,47.358362],[33.596191,47.358362]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[33.530273,45.434117]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[34.343262,45.541946]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[34.035645,45.031803]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[35.002441,45.093883]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[33.684082,44.532738]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[36.013184,45.171388]}},{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[27.817383,49.771509],[27.685547,49.529665],[27.839355,49.300949],[27.509766,49.071167],[27.37793,48.753473],[27.46582,48.477473],[28.146973,48.331604],[28.674316,48.141349],[29.135742,48.243882],[29.597168,48.112016],[29.86084,48.273139],[29.94873,48.521153],[29.663086,48.955875],[29.707031,49.200551],[29.487305,49.386843],[29.53125,49.672072],[29.003906,49.60092],[28.894043,49.870742],[27.817383,49.771509]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[33.398438,52.366376],[33.068848,52.379791],[32.76123,52.218546],[32.299805,52.366376],[32.34375,52.124215],[31.992188,52.002638],[31.728516,52.124215],[31.35498,52.124215],[30.9375,52.097226],[30.60791,51.772089],[30.541992,51.594988],[30.60791,51.2937],[30.541992,51.031895],[30.871582,50.824156],[31.179199,50.740801],[31.464844,50.461875],[31.750488,50.615489],[32.124023,50.419894],[32.431641,50.405892],[32.915039,50.433892],[33.134766,50.740801],[33.244629,50.990421],[32.915039,51.073331],[33.046875,51.403489],[33.178711,51.71767],[33.266602,51.989109],[33.574219,52.124215],[33.398438,52.366376]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[25.664063,51.948497],[25.64209,51.690436],[25.64209,51.376067],[26.147461,51.169872],[26.103516,50.907363],[25.861816,50.699067],[25.400391,50.629429],[25.136719,50.50382],[25.180664,50.279687],[24.719238,50.405892],[24.411621,50.657297],[24.038086,50.699067],[23.950195,50.851908],[24.213867,50.935065],[23.57666,51.348628],[23.642578,51.649555],[24.060059,51.608636],[24.301758,51.772089],[24.389648,51.921403],[24.873047,51.934952],[25.334473,51.975576],[25.664063,51.948497]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[25.004883,49.214906]}},{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[25.004883,50.13969],[25.155257,50.134528],[25.303888,50.119102],[25.449057,50.093589],[25.589092,50.058286],[25.72239,50.0136],[25.847435,49.960046],[25.962823,49.898239],[26.067272,49.828885],[26.159643,49.752774],[26.238948,49.670771],[26.304358,49.5838],[26.355216,49.492837],[26.391037,49.398898],[26.411509,49.303026],[26.416497,49.20628],[26.406035,49.109719],[26.380328,49.0144],[26.33974,48.921354],[26.28479,48.831587],[26.216142,48.746062],[26.134596,48.665691],[26.041078,48.59133],[25.936626,48.523764],[25.82238,48.463705],[25.699573,48.411785],[25.569511,48.368546],[25.433569,48.33444],[25.293169,48.309822],[25.149778,48.294948],[25.004883,48.289973],[24.859988,48.294948],[24.716596,48.309822],[24.576197,48.33444],[24.440254,48.368546],[24.310193,48.411785],[24.187385,48.463705],[24.07314,48.523764],[23.968688,48.59133],[23.87517,48.665691],[23.793624,48.746062],[23.724976,48.831587],[23.670026,48.921354],[23.629438,49.0144],[23.60373,49.109719],[23.593269,49.20628],[23.598256,49.303026],[23.618729,49.398898],[23.654549,49.492837],[23.705408,49.5838],[23.770818,49.670771],[23.850122,49.752774],[23.942493,49.828885],[24.046943,49.898239],[24.16233,49.960046],[24.287376,50.0136],[24.420673,50.058286],[24.560709,50.093589],[24.705878,50.119102],[24.854509,50.134528],[25.004883,50.13969]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[28.410645,50.865778]}},{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[28.410645,51.626669],[28.538409,51.622432],[28.664703,51.60977],[28.788077,51.588828],[28.907119,51.559847],[29.020472,51.52316],[29.126855,51.479185],[29.225076,51.428426],[29.314047,51.371459],[29.392794,51.30893],[29.460473,51.241545],[29.516373,51.170062],[29.559923,51.095281],[29.5907,51.018035],[29.608426,50.939179],[29.612973,50.859585],[29.604358,50.780125],[29.582741,50.701666],[29.548421,50.625062],[29.501829,50.55114],[29.443524,50.480696],[29.37418,50.414484],[29.29458,50.353211],[29.205608,50.297528],[29.108237,50.248025],[29.003517,50.205224],[28.892569,50.169576],[28.776568,50.141454],[28.656739,50.121155],[28.534338,50.10889],[28.410645,50.104787],[28.286951,50.10889],[28.16455,50.121155],[28.044721,50.141454],[27.92872,50.169576],[27.817772,50.205224],[27.713052,50.248025],[27.615681,50.297528],[27.526709,50.353211],[27.447109,50.414484],[27.377765,50.480696],[27.31946,50.55114],[27.272868,50.625062],[27.238548,50.701666],[27.216931,50.780125],[27.208316,50.859585],[27.212863,50.939179],[27.230589,51.018035],[27.261366,51.095281],[27.304916,51.170062],[27.360816,51.241545],[27.428495,51.30893],[27.507242,51.371459],[27.596213,51.428426],[27.694434,51.479185],[27.800817,51.52316],[27.91417,51.559847],[28.033212,51.588828],[28.156586,51.60977],[28.28288,51.622432],[28.410645,51.626669]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[30.563965,46.518241],[30.563965,49.114332],[33.068848,49.114332],[33.068848,46.518241],[30.563965,46.518241]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[30.498047,50.419894]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[33.793945,51.211185]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[29.970703,49.728918]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[30.19043,48.941445]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[26.455078,51.045711]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[37.507324,49.856579]}}]}
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

  constructor() { }

  ngOnInit(): void {
   this.initSecondMap();
   this.setStyleForGeoJsonFeatures();
   this.hideOrShowGeoJsonFeatures();
  }

  initSecondMap(): void {
    const startCoordinates = L.latLng(48.5132, 32.2597);
    this.map = L.map('second-map', {zoomControl: false}).setView(startCoordinates, 10);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 15,
    }).addTo(this.map);

    this.geoJson.addData(this.geoJsonFeatures as GeoJsonObject).addTo(this.map);
  }

  setStyleForGeoJsonFeatures(): void {
    const markerIcon = L.icon({
      iconUrl: 'assets/images/ukrainian-flag.png',
      iconSize: [40, 50],
      iconAnchor: [20, 50]
    });

    this.geoJson.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        layer.setIcon(markerIcon);
      }
    });

    this.geoJson.setStyle({
      color: '#1540ad',
      fillColor: '#c1d10f'
    });
  }

  hideOrShowGeoJsonFeatures(): void {
    this.map.on("zoomend", () => {
      this.geoJson.eachLayer(layer => {
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
}