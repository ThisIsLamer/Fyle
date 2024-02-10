import { logger } from './logger';

const MODULE_NAME_METADATA_KEY = Symbol('moduleName');
export const tempMethodStorage: Array<{ moduleConstructor: any; methodName: string; method: () => void }> =
  [];

export function Module(moduleName: string) {
  return function (constructor: new () => void) {
    logger.info(`Module register: ${moduleName}`);
    Reflect.defineMetadata(MODULE_NAME_METADATA_KEY, moduleName, constructor);
    Registry.registerModule(moduleName);

    tempMethodStorage.forEach(({ moduleConstructor, methodName, method }) => {
      if (!moduleName) {
        throw new Error(`Модуль для метода ${moduleConstructor.name} не определен`);
      }
      logger.info(`Method register: ${methodName}`);
      Registry.registerMethod(moduleName, methodName, method);
    });

    tempMethodStorage.length = 0;
  };
}

export function Method(methodName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    tempMethodStorage.push({
      moduleConstructor: target.constructor,
      methodName: methodName,
      method: descriptor.value,
    });
  };
}

export class Registry {
  public static modules = new Map<string, Map<string, (...args: any) => void>>();

  public static registerModule(name: string) {
    return this.modules.set(name, new Map());
  }

  public static getModule(name: string) {
    return this.modules.get(name);
  }

  public static registerMethod(moduleName: string, methodName: string, method: (...args: any) => void) {
    const loadedModule = this.modules.get(moduleName);
    if (!loadedModule) throw new Error(`Модуль ${moduleName} не зарегистрирован в реестре модулей.`);

    const loadedMethod = loadedModule.get(methodName);
    if (loadedMethod) console.error(`Метод ${methodName} уже зарегистрирован и будет перезаписан`);

    loadedModule.set(methodName, method);
  }

  public static getMethod(moduleName: string, methodName: string) {
    return this.modules.get(moduleName)?.get(methodName);
  }
}
