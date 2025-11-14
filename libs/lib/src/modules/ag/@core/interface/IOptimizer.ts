export interface IOptimizer<CONFIG, INPUT, OUTPUT> {
  run(props: { param: CONFIG; input: INPUT }): Promise<OUTPUT>;
}
