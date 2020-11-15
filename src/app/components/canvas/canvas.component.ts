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
    speed: number;

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
        this.canvasService.sortCanvas.subscribe((res: { algo: number, speed: number }) => {
            this.speed = res.speed;
            this.sortCanvas(res.algo);
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
        let totalTime = 0;
        let totalSteps = 0;
        const stepTime = this.speed;
        const stepsArr: number[] = [];
        for (let i = 1; i < len; i++) {
            const steps = ((len - i) * 3) + 1;
            stepsArr.push(steps);
        }
        totalSteps = stepsArr.reduce((a, b) => a + b);
        totalSteps += 1;
        totalTime = totalSteps * stepTime;
        setTimeout(() => {
            this.canvasService.stopSorting.next(true);
        }, totalTime);
        for (let i = 0; i < len - 1; i++) {
            let counter = 0;
            if (i !== 0) {
                counter = stepsArr.slice(0, i).reduce((a, b) => a + b) * stepTime;
            }
            this.timeoutId = window.setTimeout(() => {
                for (let j = 0; j < len - i - 1; j++) {
                    this.timeoutId = window.setTimeout(() => {
                        bars[j].classList.add('selected');
                        bars[j + 1].classList.add('selected');
                    }, j === 0 ? 0 : j * 3 * stepTime);
                    this.timeoutId = window.setTimeout(() => {
                        if (this.canvas[j] > this.canvas[j + 1]) {
                            const temp = this.canvas[j];
                            this.canvas[j] = this.canvas[j + 1];
                            this.canvas[j + 1] = temp;
                        }
                    }, j === 0 ? stepTime : (j * 3 * stepTime) + stepTime);
                    this.timeoutId = window.setTimeout(() => {
                        bars[j].classList.remove('selected');
                        bars[j + 1].classList.remove('selected');
                    }, j === 0 ? 2 * stepTime : (j * 3 * stepTime) + (2 * stepTime));
                }
                this.timeoutId = window.setTimeout(() => {
                    bars[len - i - 1].classList.add('sorted');
                }, (stepsArr[i] - 1) * stepTime);
            }, counter);

        }
        this.timeoutId = window.setTimeout(() => {
            bars[0].classList.add('sorted');
        }, (totalSteps - 1) * stepTime);
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