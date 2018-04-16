/* @flow */
import type { Base, IFace } from 'neotracker-server-db';

import { pascalCase, snakeCase } from 'change-case';

export const getRootEdgeName = ({
  model,
  plural,
}: {
  model: Class<Base>,
  plural: boolean,
}) => snakeCase(plural ? model.modelSchema.pluralName : model.modelSchema.name);

export const getTypeName = (model: Class<Base>) => model.modelSchema.name;
export const getInterfaceName = (iface: Class<IFace>) => iface.interfaceName;

const getEdgeOrConnectionName = (
  model?: Class<Base>,
  edgeName: string,
  suffix: string,
) => {
  if (model == null) {
    return `${pascalCase(edgeName)}${suffix}`;
  }

  const iface = model.modelSchema.interfaces.find(innerIface =>
    innerIface.graphqlFields.includes(edgeName),
  );
  if (iface == null) {
    return `${getTypeName(model)}To${pascalCase(edgeName)}${suffix}`;
  }
  return `${getInterfaceName(iface)}To${pascalCase(edgeName)}${suffix}`;
};

export const getConnectionName = (model?: Class<Base>, edgeName: string) =>
  getEdgeOrConnectionName(model, edgeName, 'Connection');
export const getEdgeName = (model?: Class<Base>, edgeName: string) =>
  getEdgeOrConnectionName(model, edgeName, 'Edge');
