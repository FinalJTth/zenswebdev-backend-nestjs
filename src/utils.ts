import axios, { AxiosResponse } from 'axios';
import JSON5 from 'json5';

const graphQLParamMap = JSON5.parse(`{ "'": '"', ':': ': ', ',': ' '}`);

export const toGraphQLParameterString = (obj: Record<string, any>): string => {
  const regex = new RegExp(Object.keys(graphQLParamMap).join('|'), 'gi');
  const str = JSON5.stringify(obj);
  return str.substring(1, str.length - 1).replace(regex, (matched) => graphQLParamMap[matched]);
};

const graphQLReturnMap = JSON5.parse(`{ ',': ' ', "'": ''}`);

export const toGraphQLReturnString = (obj: Array<string> | Record<string, any>): string => {
  const regex = new RegExp(Object.keys(graphQLReturnMap).join('|'), 'gi');
  const str = JSON5.stringify(obj);
  return str.substring(1, str.length - 1).replace(regex, (matched) => graphQLReturnMap[matched]);
};

export const toGraphQLReturnStringNew = (obj: Array<string | Record<string, any>>): string => {
  let rstr = '{';
  obj.forEach((o: string | Record<string, any>, index: number) => {
    let tstr;
    if (typeof o === 'object' && o !== null) {
      const keys = Object.keys(o);
      const key = keys[0];
      tstr = `${key} `;
      const tstrRec = `${toGraphQLReturnStringNew(o[key])} `;
      const nextObject = obj[index + 1];
      if (nextObject || typeof nextObject === 'string') {
        tstr += tstrRec;
      } else {
        tstr += tstrRec.substring(0, tstrRec.length - 1);
      }
    } else {
      tstr = o;
    }
    rstr += `${tstr} `;
  });
  rstr = `${rstr.substring(0, rstr.length - 1)}}`;
  return rstr;
};

export const buildGraphql = (
  type: string,
  resolver: string,
  parameters: Record<string, any> | string,
  returnValues?: Array<string | Record<string, any>> | string,
): string => {
  const params =
    typeof parameters === 'string' || parameters instanceof String ? parameters : toGraphQLParameterString(parameters);
  let rv;
  if (returnValues) {
    rv =
      typeof returnValues === 'string' || returnValues instanceof String
        ? returnValues
        : ` ${toGraphQLReturnStringNew(returnValues)}`;
  } else {
    rv = '';
  }
  return `{ ${type}: ${resolver}(${params})${rv}}`;
};
