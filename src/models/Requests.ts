import { Mask, SpectralImage, SpectralImageSlim, TissueClass } from "./Database";


export type GetSpims = {
    spims: SpectralImageSlim[];
};

export type GetTissueClasses = {
    TissueClass: TissueClass[]
}

export type GetSpim = SpectralImage

export interface GenerateMasksPOST {
    masks: Mask[]
}
