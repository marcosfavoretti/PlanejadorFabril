export class ColorGenerator {
  private index = 0;
  private readonly palette: string[];

  constructor() {
    // Paleta de cores bem distintas (24 cores)
    this.palette = [
      // Tons vibrantes
      "#ffe119", "#0082c8", "#f58231",
      "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe",
      "#008080", "#e6beff", "#aa6e28", "#fffac8", "#800000",
      "#aaffc3", "#808000", "#ffd8b1", "#000080", "#808080",
      "#FFFFFF", "#bcf60c", "#9a6324",

      // Novas cores — tons fortes e vivos
      "#ff7f50", "#87cefa", "#da70d6", "#32cd32", "#6495ed",
      "#ff69b4", "#cd5c5c", "#ffa07a", "#40e0d0", "#b0e0e6",
      "#ff1493", "#7fffd4", "#00ced1", "#1e90ff",
      "#00fa9a", "#ba55d3", "#9370db", "#3cb371",

      // Tons mais suaves
      "#add8e6", "#f0e68c", "#e0ffff", "#f5f5dc", "#d8bfd8",
      "#ffe4e1", "#fafad2", "#e9967a", "#afeeee", "#eee8aa",
      "#f5deb3", "#b0c4de", "#d3d3d3", "#f0fff0", "#ffe4b5",

      // Cores pastel variadas
      "#ffd1dc", "#c1f0f6", "#e2f0cb", "#ffefc1", "#f3c1ff",
      "#b2f7ef", "#ffb3ba", "#bae1ff", "#baffc9", "#ffffba",
      "#ffdfba", "#e6e6fa", "#c4f0c5", "#f4cccc", "#cfe2f3",

      // Tons escuros
      "#2f4f4f", "#556b2f", "#8b0000", "#191970", "#4b0082",
      "#800080", "#00008b", "#2e8b57", "#006400", "#483d8b",

      // Gradientes intermediários
      "#ff6347", "#6a5acd", "#20b2aa", "#5f9ea0", "#bc8f8f",
      "#deb887", "#b8860b", "#a0522d", "#daa520", "#d2691e",

      // Metálicos e acinzentados
      "#c0c0c0", "#a9a9a9", "#bdb76b", "#f8f8ff", "#f5f5f5",
      "#dcdcdc", "#708090", "#778899", "#696969", "#fdf5e6",

      // Extras para garantir variedade
      "#ffdead", "#ffe4c4", "#ffdab9", "#ffebcd", "#ffc0cb",
      "#ffcccb", "#fff5ee", "#fff0f5", "#f0f8ff", "#fdfd96",
      "#a4de02", "#ff6f61", "#007f5c", "#ffb347", "#cc99ff",
      "#f9a602", "#006994", "#f7cac9", "#92a8d1", "#034f84",
    ];
  }

  /**
   * Gera a próxima cor única em hexadecimal.
   */
  public next(): string {
    const color = this.palette[this.index % this.palette.length];
    this.index++;
    return color;
  }
}
