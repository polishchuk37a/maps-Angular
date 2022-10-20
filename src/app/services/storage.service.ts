import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  setDataToLocalStorage(key: string, geoData: string): void {
    localStorage.setItem(key, geoData);
  }

  getDataFromLocalStorage(key: string): string {
    return localStorage.getItem(key) ?? '';
  }
}
