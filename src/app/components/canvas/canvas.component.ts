import { Component, OnInit, HostListener, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CanvasService } from 'src/app/services/canvas.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-canvas',
    templateUrl: 'canvas.component.html',
    styleUrls: ['canvas.component.css']
})
export class CanvasComponent implements OnInit, OnDestroy {

    canvasSize: number;
    canvas: number[];
    barWidth: string;
    windowsWidth: number;
    canvasSub: Subscription;
    timeoutId: number;

    constructor(
        private canvasService: CanvasService
    ) { }

    @HostListener('window:resize', ['$event'])
    onResize(event): void {
        this.calculateBarWidth();
    }

    ngOnInit(): void {
        this.canvas = this.canvasService.getCanvas();
        this.canvasSub = this.canvasService.canvasChanged.subscribe(canvas => {
            this.canvas = canvas;
            this.calculateBarWidth();
        });
        this.canvasService.sortCanvas.subscribe(wantToSort => {
            if (wantToSort) { this.sortCanvas(1); }
        })
        this.canvasService.stopSorting.subscribe(result => {
            if (result) {
                this.clearAllTimeouts();
            }
        });
        this.calculateBarWidth();
    }



    calculateBarWidth(): void {
        this.windowsWidth = window.innerWidth;
        const width = (this.windowsWidth - 100) / this.canvas.length;
        this.barWidth = width + 'px';
    }

    sortCanvas(method: number): void {
        if (method === 1) {
            this.bubbleSort();
        }
    }

    bubbleSort(): void {
        const len = this.canvas.length;
        const bars = document.getElementsByClassName('inner-bar');
        for (let i = 0; i < len; i++) {
            const outerWait = i * 1500;
            this.timeoutId = window.setTimeout(() => {
                const counter = 1500 / (len - i);
                for (let j = 0; j < len - i - 1; j++) {
                    const innerWait = outerWait + counter * j;
                    this.timeoutId = window.setTimeout(() => {
                        bars[j].classList.add('selected');
                        bars[j + 1].classList.add('selected');
                    }, innerWait);
                    this.timeoutId = window.setTimeout(() => {
                        if (this.canvas[j] > this.canvas[j + 1]) {
                            const temp = this.canvas[j];
                            this.canvas[j] = this.canvas[j + 1];
                            this.canvas[j + 1] = temp;
                        }
                    }, innerWait + (counter / 3));
                    this.timeoutId = window.setTimeout(() => {
                        bars[j].classList.remove('selected');
                        bars[j + 1].classList.remove('selected');
                    }, innerWait + ((counter / 3) * 2));
                }
                this.timeoutId = window.setTimeout(() => {
                    bars[len - i - 1].classList.add('sorted');
                }, outerWait + (counter * (len - i - 1)));
            }, outerWait);
        }
    }

    clearAllTimeouts(): void {
        while (this.timeoutId--) {
            window.clearTimeout(this.timeoutId);
        }
    }

    ngOnDestroy(): void {
        this.canvasSub.unsubscribe();
    }
}