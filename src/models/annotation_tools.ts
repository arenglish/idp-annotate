export enum ANNOTATION_TOOLS {
    BRUSH,
    LINES,
    FILL,
    ERASE
}

export enum ANNOTATION_TOOL_MODES {
    ADD,
    SUBTRACT
}

export interface Brush {
    type: ANNOTATION_TOOLS;
    mode: ANNOTATION_TOOL_MODES;
    size: number;
}