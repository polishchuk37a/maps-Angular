import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {merge, Observable} from "rxjs";
import {CdkConnectedOverlay} from "@angular/cdk/overlay";
import {filter, mapTo} from "rxjs/operators";
import {FocusMonitor} from "@angular/cdk/a11y";
import {FormControl} from "@angular/forms";
import {FeatureGroup} from "leaflet";

@Component({
  selector: 'app-cdk-overlay',
  templateUrl: './cdk-overlay.component.html',
  styleUrls: ['./cdk-overlay.component.scss']
})
export class CdkOverlayComponent implements OnInit {
  showOverlay: Observable<boolean>;
  isOverlayVisible: Observable<boolean>;
  isOverlayHidden: Observable<boolean>;

  @Input() drawnItems: FeatureGroup;
  @Output() selectedValueFromOverlay = new EventEmitter<string>();

  @ViewChild('overlayInput', {static: true}) overlayInput: ElementRef;
  @ViewChild(CdkConnectedOverlay, {static: true}) overlay: CdkConnectedOverlay;

  itemKind = ['All', 'Points', 'Polygons'];

  overlayControl = new FormControl('');

  constructor(private readonly focusMonitor: FocusMonitor) {
  }

  ngOnInit(): void {
    this.overlayControl.patchValue('All');

    this.isOverlayVisible = this.focusMonitor.monitor(this.overlayInput)
      .pipe(
        filter((focused) => !!focused),
        mapTo(true)
      )

    this.isOverlayHidden = this.overlay.backdropClick
      .pipe(
        mapTo(false)
      )

    this.showOverlay = merge(this.isOverlayVisible, this.isOverlayHidden);
  }

  setSelectedValueAndCloseOverlay(selectedValue: string): void {
    this.overlayControl.patchValue(selectedValue);

    this.isOverlayHidden
      .pipe(
        mapTo(true)
      )

    this.isOverlayVisible
      .pipe(
        mapTo(false)
      )

    this.showOverlay = merge(this.isOverlayVisible, this.isOverlayHidden);
    this.selectedValueFromOverlay.emit(selectedValue);
  }
}

