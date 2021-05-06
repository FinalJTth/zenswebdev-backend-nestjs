import axios, { AxiosResponse } from 'axios';
import JSON5 from 'json5';

/*
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
*/

export const toGraphQLReturnString = (obj: Array<string | Record<string, any>>): string => {
  let rstr = '{';
  obj.forEach((o: string | Record<string, any>, index: number) => {
    let tstr;
    if (typeof o === 'object' && o !== null) {
      const keys = Object.keys(o);
      const key = keys[0];
      tstr = `${key} `;
      const tstrRec = `${toGraphQLReturnString(o[key])} `;
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

const stringifyValue = (value: any, nextValue?: any): string => {
  let tstr = ``;
  // If value is a string
  if (typeof value === 'string' || value instanceof String) {
    const typeIndex = value.search(/^enum_/);
    if (typeIndex !== -1) {
      tstr = `${value.substring(typeIndex + 5, value.length)}`;
    } else {
      tstr = `"${value}"`;
    }
  }
  // If value is a number
  else if (Number(value)) {
    tstr = `${value}`;
  }
  // If value is a JSON object
  else if (typeof value === 'object' && value !== null && !(value instanceof Array)) {
    const entries = Object.entries(value);
    let tstr2 = ``;
    entries.forEach((entry: Array<any>, index: number) => {
      const [key2, value2] = entry;
      const nextEntry = entries[index + 1];
      tstr2 += `${key2}: ${stringifyValue(value2, nextEntry)}${nextEntry ? ' ' : ''}`;
    });
    tstr = `{${tstr2}}`;
  }
  // If value is an array
  else if (value instanceof Array) {
    let tstr2 = ``;
    value.forEach((value2: any, index: number) => {
      const nextValue2 = value2[index + 1];
      tstr2 += `${stringifyValue(value2)}${nextValue2 ? ', ' : ''}`;
    });
    tstr = `[${tstr2}]`;
  }
  return `${tstr.substring(0, tstr.length)}${nextValue ? ' ' : ''}`;
};

export const toGraphQLParameterString = (obj: Record<string, any>, recursive?: boolean) => {
  const entries = Object.entries(obj);
  let params = ``;
  entries.forEach((entry: Array<any>, index: number) => {
    const [key, value] = entry;
    const nextValue = entries[index + 1];
    params += `${key}: ${stringifyValue(value, nextValue)}`;
  });
  params = `${params.substring(0, params.length)}`;
  return params;
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
        : ` ${toGraphQLReturnString(returnValues)}`;
  } else {
    rv = '';
  }
  if (type === 'mutation') {
    return `${type} {${resolver}(${params})${rv}}`;
  }
  return `{${type}: ${resolver}(${params})${rv}}`;
};
