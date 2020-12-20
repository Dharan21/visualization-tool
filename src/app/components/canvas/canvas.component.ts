import { Component, OnInit, HostListener, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
    delay = 0;
    onceShorted = false;

    constructor(
        private canvasService: CanvasService,
        private cdr: ChangeDetectorRef
    ) { }

    @HostListener('window:resize', ['$event'])
    onResize(event): void {
        this.calculateBarWidth();
    }

    ngOnInit(): void {
        this.canvas = this.canvasService.getCanvas();
        this.canvasSub = this.canvasService.canvasChanged.subscribe(canvas => {
            this.onceShorted = false;
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
        if (this.onceShorted) {
            this.canvas = this.canvas.sort((a, b) => a - b);
            const bars = document.getElementsByClassName('inner-bar');
            for(let i= 0; i < bars.length; i++) {
                bars[i].classList.value = 'inner-bar';
            }
        }
        switch (method) {
            case Enums.SortAlgoValues.BubbleSort:
                this.bubbleSort();
                break;
            case Enums.SortAlgoValues.QuickSort:
                this.quick();
                break;
            case Enums.SortAlgoValues.SelectionSort:
                this.selectionSort();
                break;
            case Enums.SortAlgoValues.InsertionSort:
                this.insertionSort();
                break;
            case Enums.SortAlgoValues.MergeSort:
                this.applyMergeSort();
                break;
        }
        this.onceShorted = true;
    }

    applyMergeSort(): void {
        this.delay = 0;
        this.mergeSort(this.canvas.slice(), 0, this.canvas.length - 1);
        window.setTimeout(() => {
            this.canvasService.stopSorting.next(true);
        }, this.delay += this.speed);
    }

    merge(arr: number[], l: number, m: number, r: number): void {
        let isLastCall = false;
        if (l === 0 && r === this.canvas.length - 1) {
            isLastCall = true;
        }
        let i = l;
        let j = m + 1;
        while (i <= j && i < r && j <= r) {
            this.toggleClass([i], Enums.ColorConsts.Selected);
            if (arr[i] > arr[j]) {
                this.toggleClass([j], Enums.ColorConsts.Selected);
                if (j + 1 === i || i + 1 === j) {
                    const temp = arr[j];
                    arr[j] = arr[i];
                    arr[i] = temp;
                } else if (j > i) {
                    const height = arr[j];
                    for (let k = j - 1; k >= i; k--) {
                        arr[k + 1] = arr[k];
                    }
                    arr[i] = height;
                } else {
                    const height = arr[i];
                    for (let k = i - 1; k >= j; k--) {
                        arr[k + 1] = arr[k];
                    }
                    arr[j] = height;
                }
                this.moveAnimation(j, i);
                this.toggleClass([j], Enums.ColorConsts.Selected, false);
                j++;
            }
            this.toggleClass([i], Enums.ColorConsts.Selected, false);
            if (isLastCall) {
                this.makeBarSorted(i);
            }
            i++;
        }
        if (isLastCall) {
            while (i <= r) {
                this.makeBarSorted(i);
                i++;
            }
        }
    }

    mergeSort(arr: number[], l: number, r: number): void {
        if (l < r) {
            const m = Math.floor((l + r) / 2);
            this.mergeSort(arr, l, m);
            this.mergeSort(arr, m + 1, r);
            this.merge(arr, l, m, r);
        }
    }

    insertionSort(): void {
        this.delay = 0;
        const arr = this.canvas.slice();
        const len = arr.length;
        for (let i = 0; i < len; i++) {
            this.toggleClass([i], Enums.ColorConsts.Selected);
            const height = arr[i];
            let j = i;
            while (j >= 1 && arr[j - 1] > height) {
                arr[j] = arr[j - 1];
                this.applyHeight(j, arr[j - 1]);
                j--;
            }
            this.toggleClass([i], Enums.ColorConsts.Selected, false);
            arr[j] = height;
            this.applyHeight(j, height);
            this.makeBarSorted(j);
        }
        window.setTimeout(() => {
            this.canvasService.stopSorting.next(true);
        }, this.delay += this.speed);
    }

    quick(): void {
        this.delay = 0;
        this.quickSort(this.canvas.slice(), 0, this.canvas.length - 1);
        window.setTimeout(() => {
            this.canvasService.stopSorting.next(true);
        }, this.delay += this.speed);
    }

    quickSort(arr: number[], low: number, high: number): void {
        if (low < high) {
            const pi = this.partition(arr, low, high);
            this.quickSort(arr, low, pi - 1);
            this.quickSort(arr, pi + 1, high);
        } else if (low === high) {
            window.setTimeout(() => {
                const bars = document.getElementsByClassName('inner-bar');
                bars[low].classList.add(Enums.ColorConsts.Sorted);
            }, this.delay += this.speed);
        }
    }

    partition(arr: number[], low: number, high: number): number {
        const pivot = arr[low];
        this.toggleClass([low], Enums.ColorConsts.Selected);
        let i = low + 1;
        let j = high;
        while (i <= j) {
            while (arr[i] <= pivot) {
                this.toggleClass([i], Enums.ColorConsts.Traversing);
                i++;
                this.toggleClass([i - 1], Enums.ColorConsts.Traversing, false);
            }
            while (arr[j] > pivot) {
                this.toggleClass([j], Enums.ColorConsts.Traversing);
                j--;
                this.toggleClass([j + 1], Enums.ColorConsts.Traversing, false);
            }
            if (i < j) {
                this.swapAnimation(i, j);
                const temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        this.toggleClass([low], Enums.ColorConsts.Selected, false);
        this.swapAnimation(low, j);
        const outerTemp = arr[low];
        arr[low] = arr[j];
        arr[j] = outerTemp;
        this.makeBarSorted(j);
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

    selectionSort(): void {
        const len = this.canvas.length;
        const bars = document.getElementsByClassName('inner-bar');
        let totalTime = 0;
        let totalSteps = 0;
        const stepTime = this.speed;
        const stepsArr: number[] = [];
        for (let i = 1; i < len; i++) {
            const steps = ((len - i) * 3) + 2;
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
            setTimeout(() => {
                let minIndex = i;
                bars[minIndex].classList.add('selected');
                for (let j = i + 1; j < len; j++) {
                    setTimeout(() => {
                        bars[j].classList.add('traverse');
                    }, j === i + 1 ? 0 : (j - (i + 1)) * 3 * stepTime);
                    setTimeout(() => {
                        if (this.canvas[minIndex] > this.canvas[j]) {
                            minIndex = j;
                        }
                    }, j === i + 1 ? stepTime : ((j - (i + 1)) * 3 * stepTime) + stepTime);
                    setTimeout(() => {
                        bars[j].classList.remove('traverse');
                    }, j === i + 1 ? 2 * stepTime : ((j - (i + 1)) * 3 * stepTime) + (2 * stepTime));
                }
                setTimeout(() => {
                    bars[i].classList.remove('selected');
                    const temp = this.canvas[i];
                    this.canvas[i] = this.canvas[minIndex];
                    this.canvas[minIndex] = temp;
                }, (stepsArr[i] - 2) * stepTime);
                setTimeout(() => {
                    bars[i].classList.add('sorted');
                }, (stepsArr[i] - 1) * stepTime);
            }, counter);
            setTimeout(() => {
                bars[len - 1].classList.add('sorted');
            }, (totalSteps - 1) * stepTime);
        }
    }

    makeBarSorted(i: number): void {
        window.setTimeout(() => {
            const bars = document.getElementsByClassName('inner-bar');
            bars[i].classList.add(Enums.ColorConsts.Sorted);
        }, this.delay += this.speed);
    }

    toggleClass(indexs: number[], className: string, isAdd: boolean = true): void {
        window.setTimeout(() => {
            const bars = document.getElementsByClassName('inner-bar');
            indexs.forEach(x => {
                if (isAdd) {
                    bars[x].classList.add(className);
                } else {
                    bars[x].classList.remove(className);
                }
            });
        }, this.delay += this.speed);
    }

    swapAnimation(i: number, j: number): void {
        window.setTimeout(() => {
            const temp = this.canvas[i];
            this.canvas[i] = this.canvas[j];
            this.canvas[j] = temp;
        }, this.delay += this.speed);
    }

    applyHeight(index: number, height: number): void {
        window.setTimeout(() => {
            this.canvas[index] = height;
        }, this.delay += this.speed);
    }

    moveAnimation(fromIndex: number, toIndex: number): void {
        window.setTimeout(() => {
            const bars = document.getElementsByClassName('inner-bar') as HTMLCollection;
            if (fromIndex + 1 === toIndex || toIndex + 1 === fromIndex) {
                const temp = (bars[fromIndex] as HTMLElement).style.height;
                (bars[fromIndex] as HTMLElement).style.height = (bars[toIndex] as HTMLElement).style.height;
                (bars[toIndex] as HTMLElement).style.height = temp;
            } else if (fromIndex > toIndex) {
                const height = (bars[fromIndex] as HTMLElement).style.height;
                for (let i = fromIndex - 1; i >= toIndex; i--) {
                    (bars[i + 1] as HTMLElement).style.height = (bars[i] as HTMLElement).style.height;
                }
                (bars[toIndex] as HTMLElement).style.height = height;
            }
        }, this.delay += this.speed);
    }

    ngOnDestroy(): void {
        this.canvasSub.unsubscribe();
    }
}
