import { Injectable } from '@angular/core';
import {GeoJsonObject} from "geojson";

@Injectable({
  providedIn: 'root'
})
export class FileService {

  saveGeoData(geoData: GeoJsonObject): void {
    const fileName = 'geoData.geojson';
    const geoJsonFile = new Blob([JSON.stringify(geoData)]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(geoJsonFile);
    link.download = fileName;
    link.click();
    link.remove();
  }

}
