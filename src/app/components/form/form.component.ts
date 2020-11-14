import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CanvasService } from 'src/app/services/canvas.service';

@Component({
    selector: 'app-form',
    templateUrl: 'form.component.html',
    styleUrls: ['form.component.css']
})
export class FormComponent implements OnInit {
    sortingStarted = false;
    constructor(
        public canvasService: CanvasService,
        public cdr: ChangeDetectorRef
    ) { }
    ngOnInit(): void { }

    onSliderChange(event: { newValue: number, oldValue: number }): void {
        if (!this.sortingStarted) {
            this.canvasService.createCanvas(event.newValue);
        }
    }

    onSubmit(): void {
        const canvasSize = this.canvasService.canvas.length;
        this.sortingStarted = true;
        this.canvasService.sortCanvas.next(true);
        setTimeout(() => {
            this.sortingStarted = false;
        }, (((canvasSize - 1) * (canvasSize - 2)) / 2.0) * 1500);
    }

    onReset(): void {
        window.location.reload();
    }
}