import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CanvasService {
    canvasSize: number;
    canvasSizeChange = new Subject<number>();
    canvas: number[] = [75, 25];
    public canvasChanged = new Subject<number[]>();
    public sortCanvas = new Subject<{algo: number, speed: number}>();
    public stopSorting = new Subject<boolean>();

    getCanvas(): number[] {
        return this.canvas.slice();
    }

    createCanvas(size: number): void {
        this.emptyCanvas();
        for (let i = 0; i < size; i++) {
            const height = 10 + Math.random() * (100 - 10);
            this.canvas.push(height);
        }
        this.canvasChanged.next(this.canvas);
    }

    private emptyCanvas(): void {
        this.canvas = [];
    }
}