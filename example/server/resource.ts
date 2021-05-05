import { SUB_RESOURCE_DIRNAME } from "./constants/path"

const getResourceFileName = (pathname: string) => {
  return `${SUB_RESOURCE_DIRNAME}${pathname}`;
}

export const getScriptFileName = (pathname: string) => {
  return getResourceFileName(`${pathname}.bundle.js`);
}

export const getCSSFileName = (pathname: string) => {
  return getResourceFileName(`${pathname}.css`);
}
