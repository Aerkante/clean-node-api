import {AddAccountRepository} from "../../../../data/protocols/add-account-repository";
import {AddAccountModel} from "../../../../domain/usecases/add-account";
import {AccountModel} from "../../../../domain/models/account";
import {MongoHelper} from "../helpers/mongo-helper";

export class AccountMongoRepository implements AddAccountRepository{
    async add(accountData: AddAccountModel): Promise<AccountModel> {
        const accountCollection = MongoHelper.getCollection('account')
        const {insertedId} = await accountCollection.insertOne(accountData)
        const {_id, ...rest} = await accountCollection.findOne({"_id": insertedId})
        return {id: _id.toString(), name: rest.name, password: rest.password, email: rest.email}
    }

}
