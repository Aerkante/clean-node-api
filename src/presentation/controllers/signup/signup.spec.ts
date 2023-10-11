import {SignUpController} from './signup'
import {MissingParamError, ServerError, InvalidParamError} from "../../errors";
import {EmailValidator} from "./signup-protocols";
import {AddAccount, AddAccountModel} from "../../../domain/usecases/add-account";
import {AccountModel} from "../../../domain/models/account";

interface SutTypes {
    sut: SignUpController,
    emailValidatorStub: EmailValidator,
    addAccountStub: AddAccount
}

const makeEmailValidator = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator{
        isValid(email: string): boolean {
            return true
        }
    }
    return new EmailValidatorStub();
}

const makeAddAccount = (): AddAccount => {
    class AddAccountStubStub implements AddAccount{
        async add(account: AddAccountModel): Promise<AccountModel> {
            const fakeAccount = {
                id: 'valid_id',
                name: 'valid_name',
                email: 'valid_email',
                password: 'valid_password'
            }
            return new Promise(resolve => resolve(fakeAccount))
        }
    }
    return new AddAccountStubStub();
}

const makeSut = (): SutTypes => {
    const emailValidatorStub = makeEmailValidator();
    const addAccountStub = makeAddAccount()
    const sut = new SignUpController(emailValidatorStub, addAccountStub);
    return {
        sut,
        emailValidatorStub,
        addAccountStub
    }
}

describe('SignUp Controller', () => {
    test('Should return 400 if no name is provided', async () => {
        const {sut} = makeSut()
        const httpRequest = {
            body: {
                email: 'any_email',
                password: 'any_password',
                passwordConfirmation: 'any_password',
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('name'))
    })
    test('Should return 400 if no email is provided', async () => {
        const {sut} = makeSut()
        const httpRequest = {
            body: {
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password',
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('email'))
    })
    test('Should return 400 if no password is provided', async () => {
        const {sut} = makeSut()
        const httpRequest = {
            body: {
                email: 'any_email',
                name: 'any_name',
                passwordConfirmation: 'any_password',
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('password'))
    })
    test('Should return 400 if no passwordConfirmation is provided', async () => {
        const {sut} = makeSut()
        const httpRequest = {
            body: {
                email: 'any_email',
                name: 'any_name',
                password: 'any_password',
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
    })
    test('Should return 400 if an invalid email is provided', async () => {
        const {sut, emailValidatorStub} = makeSut()
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
        const httpRequest = {
            body: {
                email: 'invalid_email@email.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new InvalidParamError('email'))
    })
    test('Should return 400 if password confirmation fails', async () => {
        const {sut} = makeSut()
        const httpRequest = {
            body: {
                email: 'invalid_email@email.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'invalid_password'
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))
    })
    test('Should call email validator with correct email', async () => {
        const {sut, emailValidatorStub} = makeSut()
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

        const httpRequest = {
            body: {
                email: 'invalid_email@email.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        await sut.handle(httpRequest)
        expect(isValidSpy).toHaveBeenCalledWith('invalid_email@email.com')
    })
    test('Should call AddAccount validator with values', async () => {
        const {sut, addAccountStub} = makeSut()
        const addSpy = jest.spyOn(addAccountStub, 'add')
        const httpRequest = {
            body: {
                email: 'invalid_email@email.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        await sut.handle(httpRequest)
        expect(addSpy).toHaveBeenCalledWith({
            email: 'invalid_email@email.com',
            name: 'any_name',
            password: 'any_password',
        })
    })
    test('Should return 500 if EmailValidator throws', async () => {

        const {sut, emailValidatorStub} = makeSut()
        jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
            throw new Error()
        })
        const httpRequest = {
            body: {
                email: 'invalid_email@email.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })
    test('Should return 500 if AddAccount throws', async () => {

        const {sut, addAccountStub} = makeSut()
        jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
            return new Promise((_, reject) => reject(new Error()))
        })
        const httpRequest = {
            body: {
                email: 'invalid_email@email.com',
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })
    test('Should return 200 if data is provided', async () => {
        const {sut} = makeSut()
        const httpRequest = {
            body: {
                email: 'valid_email',
                name: 'valid_name',
                password: 'valid_password',
                passwordConfirmation: 'valid_password'
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(200)
        expect(httpResponse.body).toEqual({
            id: "valid_id",
            name: "valid_name",
            email: "valid_email",
            password: "valid_password"
        })
    })
})
