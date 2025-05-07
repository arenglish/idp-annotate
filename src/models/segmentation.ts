export enum SEGMENTATION_METHODS {
    KMEANS = 1,
    ADVANCED_DL = 2,
    SIMPLE_DL = 3,
    RESNET = 4,
    SPECTRAL_KMEANS = 5
}

export const SegmentationMethods = Object.keys(SEGMENTATION_METHODS).filter(key => !isNaN(parseInt(key, 10)))