import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CanvasService } from 'src/app/services/canvas.service';
import { Subscription } from 'rxjs';
import * as Enums from './../../utils/enums';

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
        switch (method) {
            case Enums.SortAlgoValues.BubbleSort:
                this.bubbleSort();
                break;
            case Enums.SortAlgoValues.QuickSort:
                console.log(this.canvas);
                this.quickSort(this.canvas, 0, this.canvas.length - 1);
                break;
        }
    }

    quickSort(arr: number[], low: number, high: number): void {
        if (low < high) {
            const pi = this.partition(arr, low, high);
            console.log(arr);
            this.quickSort(arr, low, pi - 1);
            this.quickSort(arr, pi + 1, high);
        } else if (low === high) {
            const bars = document.getElementsByClassName('inner-bar');
            bars[low].classList.add('sorted');
        }
    }

    private partition(arr: number[], low: number, high: number): number {
        const bars = document.getElementsByClassName('inner-bar');
        const pivot = arr[low];
        let i = low + 1;
        let j = high;
        while (i <= j) {
            console.log('hit');
            while (arr[i] <= pivot) {
                i++;
            }
            while (arr[j] > pivot) {
                j--;
            }
            if (i < j) {
                const temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        const outerTemp = arr[low];
        arr[low] = arr[j];
        arr[j] = outerTemp;
        bars[j].classList.add('sorted');
        return j;
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