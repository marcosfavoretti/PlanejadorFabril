export interface IInitializeFunction<INPUT, INDIVIDUO> {
  init(size: number, input: INPUT): INDIVIDUO;
}
