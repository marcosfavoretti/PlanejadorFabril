export class FabricaDuplicadaMergeException extends Error {
  constructor() {
    super('Essa fabrica ja esta para ser avaliada!');
  }
}
