export type Mask = {
    id: number;
    pk?: number;
    bitmap: string;
    tissueId: number;
    classId: number;
    color?: string;
}

export type Annotation = {
    masks: Mask[];
}

export interface SpectralImageSlim {
    name: string;
    pk?: number;
    id: number;
    rgb: string;
};

export interface SpectralImage {
    id: number;
    pk?: number;
    rgb: string;
    name: string;
    spim_cube: string;
    masks: Mask[];
};
