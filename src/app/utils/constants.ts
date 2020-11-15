import * as Enums from './enums';

export const SortMethodsDropdown = [
    { value: Enums.SortAlgoValues.BubbleSort, name: 'Bubble Sort' },
    // { value: Enums.SortAlgoValues.QuickSort, name: 'Quick Sort' }
]

export const SpeedDropdown = [
    { value: 1, name: 'Slow', stepTime: 50 },
    { value: 2, name: 'Medium', stepTime: 20 },
    { value: 3, name: 'Fast', stepTime: 5 }
]