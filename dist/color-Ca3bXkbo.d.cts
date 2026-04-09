interface Palette {
    /** 5 HSL color objects, sorted by luminance (darkest → brightest) */
    colors: HSLColor[];
    /** The focal color — always the brightest, used for the central shape */
    focal: HSLColor;
    /** Background color — always the darkest */
    base: HSLColor;
}
interface HSLColor {
    h: number;
    s: number;
    l: number;
    hex: string;
}

export type { HSLColor as H, Palette as P };
