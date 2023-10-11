import bcrypt from 'bcrypt'
import {BycriptAdapter} from "./bcrypt-adapter";
import {Encrypter} from "../../data/protocols/encrypter";
import spyOn = jest.spyOn;

const salt = 12
interface SutTypes {
    sut: Encrypter
}

const makeSut = (): SutTypes => {
    const sut = new BycriptAdapter(salt)
    return {
        sut
    }
}

jest.mock('bcrypt', () => ({
    async hash(): Promise<string> {
        return new Promise((resolve, _) => resolve('hash'))
    }
}))

describe('Bycript Adapter', () => {
    test('Should call bcrypt with correct value', async () => {
        const {sut} = makeSut()
        const hashSpy = jest.spyOn(bcrypt, 'hash')
        await sut.encrypt('any_value')
        expect(hashSpy).toHaveBeenCalledWith('any_value', salt)
    })

    test('Should return a hash on success', async () => {
        const {sut} = makeSut()
        const hash = await sut.encrypt('any_value')
        expect(hash).toBe('hash')
    })

    test('Should return a hash on success', async () => {
        const {sut} = makeSut()
        jest.spyOn(sut, 'encrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
        const promise = sut.encrypt('any_value')
        await expect(promise).rejects.toThrow()
    })
})
