import { Base, IFace } from '@neotracker/server-db';
import { pascalCase, snakeCase } from 'change-case';

export const getRootEdgeName = ({ model, plural }: { readonly model: typeof Base; readonly plural: boolean }) =>
  snakeCase(plural ? model.modelSchema.pluralName : model.modelSchema.name);

export const getTypeName = (model: typeof Base) => model.modelSchema.name;
export const getInterfaceName = (iface: IFace) => iface.interfaceName;

const getEdgeOrConnectionName = (model: typeof Base | undefined, edgeName: string, suffix: string) => {
  if (model === undefined) {
    return `${pascalCase(edgeName)}${suffix}`;
  }

  const iface = model.modelSchema.interfaces.find((innerIface) => innerIface.graphqlFields.includes(edgeName));

  if (iface === undefined) {
    return `${getTypeName(model)}To${pascalCase(edgeName)}${suffix}`;
  }

  return `${getInterfaceName(iface)}To${pascalCase(edgeName)}${suffix}`;
};

export const getConnectionName = (model: typeof Base | undefined, edgeName: string) =>
  getEdgeOrConnectionName(model, edgeName, 'Connection');
export const getEdgeName = (model: typeof Base | undefined, edgeName: string) =>
  getEdgeOrConnectionName(model, edgeName, 'Edge');
