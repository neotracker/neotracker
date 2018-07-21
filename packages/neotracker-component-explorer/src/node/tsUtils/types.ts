import ts from 'typescript';
import { common } from './common';

// tslint:disable no-bitwise
const hasTypeFlag = (type: ts.Type, flag: ts.TypeFlags): boolean => (type.flags & flag) === flag;
const hasObjectFlag = (type: ts.Type, flag: ts.ObjectFlags): boolean =>
  isObjectType(type) && (type.objectFlags & flag) === flag;
// const hasAnyTypeFlag = (type: ts.Type, flag: ts.TypeFlags): boolean => (type.flags & flag) !== 0;
// tslint:enable no-bitwise

export const isObjectType = (type: ts.Type): type is ts.ObjectType => hasTypeFlag(type, ts.TypeFlags.Object);
export const isTupleType = (type: ts.Type): type is ts.TupleType => hasObjectFlag(type, ts.ObjectFlags.Tuple);
export const isTypeReference = (type: ts.Type): type is ts.TypeReference =>
  hasObjectFlag(type, ts.ObjectFlags.Reference);
export const isTuple = (type: ts.Type): type is ts.TupleTypeReference =>
  isTypeReference(type) && isTupleType(type.target);
// If undefined => not a tuple type
export const getTupleElements = (type: ts.Type): ReadonlyArray<ts.Type> | undefined =>
  isTuple(type) ? common.asArray(type.typeArguments) : undefined;
