import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { buildGraphql } from './utils';
import * as https from 'https';
import * as fs from 'fs';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // (NOTE: this will disable client verification)
  cert: fs.readFileSync('./secrets/cert.pem'),
  key: fs.readFileSync('./secrets/key.pem'),
});

const serverServiceUrl = 'https://localhost:5000';
export const axiosServiceURL = axios.create({
  baseURL: serverServiceUrl,
  httpsAgent,
});

const gqlHeader = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const axiosGqlServiceQuery = async (
  overloadingParam: string, // resolver or query string
  parameters?: Record<string, any> | string,
  returnValues?: Array<any> | string,
) => {
  const query = parameters ? buildGraphql('query', overloadingParam, parameters, returnValues) : overloadingParam;
  return axiosServiceURL
    .post('/graphql', JSON.stringify({ query }), gqlHeader)
    .then((response: Record<string, any>) => {
      if (response.data.errors && response.data.errors.length > 0) {
        if (response.data.errors[0].extensions) {
          const { exception } = response.data.errors[0].extensions;
          throw new Error(`${exception._stack}`);
        } else {
          let message = '';
          response.data.errors.map((error: any, index: number) => {
            let locations = '';
            if (error.locations) {
              error.locations.map((location: Record<string, any>, locationIndex: number) => {
                locations += `\tat ${locationIndex} ${JSON.stringify(location)}\n`;
                return location;
              });
            }
            message += `${index} ${error.message}\n${locations}`;
            return error;
          });
          throw new Error(message);
        }
      }
      return response.data;
    });
};

export { axiosGqlServiceQuery };
