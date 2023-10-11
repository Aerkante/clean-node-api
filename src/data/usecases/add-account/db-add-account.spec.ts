import {DbAddAccount} from "./db-add-account";
import {Encrypter} from "./db-add-account-protocols";
interface SutTypes {
    sut: DbAddAccount
    encrypterStub: Encrypter
}

const makeEncrypterStub = (): Encrypter => {
    class EncrypterSub implements Encrypter {
        async encrypt (value: string): Promise<string> {
            return new Promise(resolve => resolve('hashed_password'))
        }
    }
    return new EncrypterSub()
}


const makeSut = (): SutTypes => {
    const encrypterStub = makeEncrypterStub()
    const sut = new DbAddAccount(encrypterStub)
    return {
        sut,
        encrypterStub
    }
}

describe('DbAddAccount UseCase', () => {
    test('Should call Encrypter with correct password', async () => {

        const {encrypterStub, sut} = makeSut()
        const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
        const accountData = {
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password'
        }
        await sut.add(accountData)
        expect(encryptSpy).toHaveBeenCalledWith('valid_password')
    })

    test('Should throw if Encrypter throws', async () => {

        const {encrypterStub, sut} = makeSut()
        jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
        const accountData = {
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password'
        }
        const promise = sut.add(accountData)
        await expect(promise).rejects.toThrow()
    })
})
