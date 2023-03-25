import * as td from 'typedi';
import * as rc from 'routing-controllers';

/**
 * A simple descriptor that contains metadata for runtime injection.
 */
export default class Layer {
  constructor(readonly name: string, readonly priority: number) {}
  static layersByPriority = new Map<number, Layer[]>();
  static init(name: string, priority: number) {
    const layers = this.layersByPriority.get(priority) ?? [];
    const layer = new Layer(name, priority);
    layers.push(layer);
    this.layersByPriority.set(priority, layers);
    return layer;
  }
}

/**
 * Spawns a new layer decorator function.
 * @param name The name of the layer.
 * @param priority The priority, or automatic.
 * @returns A decorator generator function.
 */
export function layer(name: string, priority: number) {
  const layer = Layer.init(name, priority);
  console.log('Spawning layer', layer);
  if (name === 'controller') {
    return <T>(url?: string) => {
      const decorateCtrl = rc.JsonController(url);
      const decorateSrv = td.Service<T>();
      return (target: unknown) => {
        decorateSrv(target);
        return decorateCtrl(target as FunctionConstructor);
      };
    };
  }
  return <T>(tag?: string) => {
    const decorate = tag ? td.Service<T>(tag) : td.Service<T>();
    return (target: unknown) => {
      return decorate(target);
    };
  };
}
