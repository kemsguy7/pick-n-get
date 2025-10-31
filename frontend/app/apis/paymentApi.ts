// import {Transak} from '@transak/transak-sdk';
import dotenv from 'dotenv';
dotenv.config();

const getAccessToken = async () => {
  try {
    const url = 'https://api-stg.transak.com/partners/api/v2/refresh-token';
    const body = {
      apiKey: process.env.TRANSAK_API_KEY as string,
    };
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-secret': process.env.TRANSAK_API_SECRET as string,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    };
    const res = await fetch(url, options);
    const response = await res.json();
    console.log('access token: ', response);
  } catch (e) {
    console.error('failure getting access token', e);
  }
};

export const getSessionId = async () => {
  try {
    const url = 'https://api-stg.transak.com/auth/public/v2/session';

    const body = {
      widgetParams: {
        referrerDomain: 'transak.com',
        fiatAmount: '300',
        fiatCurrency: 'EUR',
        cryptoCurrencyCode: 'ETH',
      },
      landingPage: 'HomePage',
    };

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'access-token': process.env.TRANSAK_API_KEY as string,
        // "authorization": "Bearer <USER_AUTH_TOKEN>"
      },
      body: JSON.stringify(body),
    };

    const res = await fetch(url, options); // ✅ await the request
    const json = await res.json(); // ✅ parse response
    console.log('Session response:', json);

    return json; // ✅ return response to caller
  } catch (e) {
    console.error('Error creating session:', e);
    throw e; // rethrow if caller needs to handle it
  }
};

export const getCountries = async () => {
  try {
    const url = 'https://api-stg.transak.com/api/v2/countries';
    const options = { method: 'GET', headers: { accept: 'application/json' } };
    fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        const result = json.response;
        const countryName = [];
        for (let i = 0; i < result.length; i++) {
          const c_name = result[i].name;
          const c_code = result[i].currencyCode;
          countryName.push(c_name + ' ' + c_code);
        }
        console.log(countryName, result.length);
      });
  } catch (err) {
    console.error(err);
  }
};

export const getFiat = async () => {
  try {
    const url = 'https://api-stg.transak.com/fiat/public/v1/currencies/fiat-currencies';
    const options = { method: 'GET', headers: { accept: 'application/json' } };

    fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        const result = json.response;
        const formatted = result.map(
          (currency: { symbol: string; name: string; paymentOptions: Array<{ name: string }> }) => {
            return {
              currency: `${currency.symbol} - ${currency.name}`,
              paymentTypes: currency.paymentOptions.map((p: { name: string }) => p.name),
            };
          },
        );

        console.log(formatted);
      });
  } catch (e) {
    console.error(e);
  }
};

getAccessToken();
