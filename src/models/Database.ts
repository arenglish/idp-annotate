export interface TissueClass {
    tissue_type: string;
    class_id: number;
    pk: number;
}

export type Mask = {
    id: number;
    pk?: number;
    bitmap: string;
    tissueId: number;
    classId: number;
    color?: string;
    name?: string;
}

export function getMaskName(mask: Mask) {
    return mask?.name ? mask.name : 'Mask ' + mask.id
}

export type Annotation = {
    masks: Mask[];
}

export interface SpectralImageSlim {
    name: string;
    pk?: number;
    id: number;
    rgb: string;
    masks?: Mask[];
};

export interface SpectralImage {
    id: number;
    pk?: number;
    rgb: string;
    name: string;
    spim_cube: string;
    masks: Mask[];
};
