import {HttpResponse} from "../protocols";
import {ServerError} from "../errors";

export const badRequest = (error: Error): HttpResponse => ({
    statusCode: 400,
    body: error
})

export const serverError = (): HttpResponse => ({
    statusCode: 500,
    body: new ServerError()
})

export const ok = (body: any): HttpResponse => ({
    statusCode: 200,
    body: body
})
