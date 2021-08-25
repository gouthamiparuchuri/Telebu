import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { constantApis } from '../constant/constantapis';
import { from } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class HttpService {
    token: string;
    isExpired: boolean

    constructor(private http: HttpClient) { }

    httpCall(url: string, method: string, data?: any): Observable<any> {
        if (typeof this.token == 'undefined' || this.isExpired) {
            return from(this.handle(url, method, data))
        } else {
            const header = new HttpHeaders({
                'Content-Type': 'application/json'
            });
            data.token = this.token
            if (method !== 'put' && method !== 'post')
                return this.http[method](environment.url + url, { headers: header }, data);
            else
                return this.http[method](environment.url + url, data, { headers: header });
        }
    }
    async handle(url: string, method: string, data?: any) {
        const header = new HttpHeaders({
            'Content-Type': 'application/json',
            'authorization': `Basic ${window.btoa(environment.appId + ':' + environment.appPwd)}`
        })
        const res = await this.http.get(environment.url + constantApis.getToken, { headers: header }).toPromise()
        this.token = res['token']
        setTimeout(() => {
            this.isExpired = true
        }, new Date(res['expiry']).getTime() - new Date(res['createdAt']).getTime() - 10000);
        data.token = this.token
        if (method !== 'put' && method !== 'post')
            return this.http[method](environment.url + url, { headers: header }, data).toPromise();
        else
            return this.http[method](environment.url + url, data, { headers: header }).toPromise();
    }
    loginCall(url: string, method: string, data?: any): Observable<any> {
        const header = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        if (method !== 'put' && method !== 'post')
            return this.http[method](environment.url + url, { headers: header }, data);
        else
            return this.http[method](environment.url + url, data, { headers: header });
    }

    httpFormDataCall(url: string, method: string, data?: any): Observable<any> {
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

    httpFileUpload(url: string, method: string, data?: Blob): Observable<any> {
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

