import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CanvasService } from 'src/app/services/canvas.service';
import * as Constants from './../../utils/constants';

@Component({
    selector: 'app-form',
    templateUrl: 'form.component.html',
    styleUrls: ['form.component.css']
})
export class FormComponent implements OnInit {
    sortingStarted = false;
    speedDropdown = Constants.SpeedDropdown;
    methodDropdown = Constants.SortMethodsDropdown;
    constructor(
        public canvasService: CanvasService
    ) { }
    ngOnInit(): void {
        this.canvasService.stopSorting.subscribe(res => {
            this.sortingStarted = !res;
        });
    }

    onSliderChange(event: { newValue: number, oldValue: number }): void {
        if (!this.sortingStarted) {
            this.canvasService.createCanvas(event.newValue);
        }
    }

    onSubmit(form: NgForm): void {
        this.sortingStarted = true;
        console.log(form.value);
        this.canvasService.sortCanvas.next(form.value);
    }

    onReset(): void {
        window.location.reload();
    }
}