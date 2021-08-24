import { Injectable } from '@angular/core';
// import { Http, Response, Headers, RequestOptions } from '@angular/http';
// import {}'rxjs/add/operator/toPromise';
// import 'rxjs/Rx';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
    providedIn: 'root'
})

export class HttpService {

    constructor(private http: HttpClient) { }

    httpCall(url: string, method: string, data?: any): Observable<any> {
        const header = {
            'Content-Type': 'application/json',
            authorization: localStorage.getItem('authorization')
        };
        const options = { headers: header };
        if (method !== 'put' && method !== 'post') {
            return this.http[method](environment.url + url, options, data);
        } else {
            return this.http[method](environment.url + url, data, options);
        }
    }

    loginCall(url: string, method: string, data?: any): Observable<any> {
        const header = {
            'Content-Type': 'application/json'
        };
        const options = { headers: header };
        if (method !== 'put' && method !== 'post') {
            return this.http[method](environment.url + url, options, data);


        } else {

            return this.http[method](environment.url + url, data, options);

        }
    }

    httpFormDataCall(url: string, method: string, data?: any): Observable<any>  {
        const header = {
            authorization: localStorage.getItem('authorization')
        };
        const options4 = { headers: header };
        if (method !== 'put' && method !== 'post') {
            return this.http[method](environment.url + url, options4, data)
        } else {
            return this.http[method](environment.url + url, data, options4)
        }
    }

    httpFileUpload(url: string, method: string, data?: Blob): Observable<any>  {
        const header = {
            'Content-Type': 'application/octet-stream'
        };
        const options = { headers: header };
        // const formData = new FormData();
        // formData.append('blob', data);
        if (method !== 'put') {
            return this.http[method](url, options, data);
        } else {
            return this.http[method](url, data, options);
        }
    }

    private extractData(res: Response) {
        const body = res.json();
        return body || {};
    }

    private loginExtractData(res: Response) {
        const body = res;
        return body || {};
    }

    private handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }
}

