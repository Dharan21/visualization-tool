import { Component, OnInit } from '@angular/core';
import { CanvasService } from 'src/app/services/canvas.service';

@Component({
    selector: 'app-form',
    templateUrl: 'form.component.html',
    styleUrls: ['form.component.css']
})
export class FormComponent implements OnInit {
    constructor(public canvasService: CanvasService) { }
    ngOnInit(): void { }

    onSliderChange(event: { newValue: number, oldValue: number }): void {
        this.canvasService.createCanvas(event.newValue);
    }

    onSubmit(): void {
        this.canvasService.sortCanvas.next(true);
    }

    onReset(): void {
        window.location.reload();
    }
}