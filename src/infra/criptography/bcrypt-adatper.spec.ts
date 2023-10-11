import bcrypt from 'bcrypt'
import {BycriptAdapter} from "./bcrypt-adapter";
import {Encrypter} from "../../data/protocols/encrypter";

interface SutTypes {
    sut: Encrypter
}

const makeSut = (): SutTypes => {
    const sut = new BycriptAdapter(12)
    return {
        sut
    }
}

describe('Bycript Adapter', () => {
    test('Should call bcrypt with correct value', async () => {
        const {sut} = makeSut()
        const hashSpy = jest.spyOn(bcrypt, 'hash')
        await sut.encrypt('any_value')
        expect(hashSpy).toHaveBeenCalledWith('any_value', 12)
    })
})
