import { verify } from "jsonwebtoken";
import { InMemoryUsersRepository } from "../modules/users/repositories/in-memory/InMemoryUsersRepository"
import { InMemoryStatementsRepository } from "../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateUserUseCase } from "../modules/users/useCases/createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "../modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateStatementUseCase } from "../modules/statements/useCases/createStatement/CreateStatementUseCase";
import authConfig from '../config/auth';
import { GetBalanceUseCase } from "../modules/statements/useCases/getBalance/GetBalanceUseCase";
import { GetBalanceError } from "../modules/statements/useCases/getBalance/GetBalanceError";

const usersRepository = new InMemoryUsersRepository();
const statementsRepository = new InMemoryStatementsRepository();
const createUserUseCase = new CreateUserUseCase(usersRepository);
const authenticateUseCase = new AuthenticateUserUseCase(usersRepository);
const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
const getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);

const name = "User 1";
const email = "user1@example.com"
const password = "users1"

interface IPayload {
  sub: string;
}

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Balance",() => {
  beforeEach(async () => {
  })

  it("Should be able to get balance", async () => {
    await createUserUseCase.execute({
      name,
      email,
      password
    })

    const authUser = await authenticateUseCase.execute({email, password});
    const { token } = authUser;
    const { sub: user_id } = verify(token, authConfig.jwt.secret) as IPayload;
    const deposit = await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Income"
    })

    const withdraw = await createStatementUseCase.execute({
      user_id,
      type: "withdraw" as OperationType,
      amount: 10,
      description: "cash"
    })

    const balance = await getBalanceUseCase.execute({user_id})
    expect(balance).toHaveProperty("balance")
    expect(balance.balance).toEqual(90)
  })

  it("Should not be able to operate if the user_id was not found", async () => {
    expect(async () => {
      const balance = await getBalanceUseCase.execute({user_id: "incorrect"})
    }).rejects.toBeInstanceOf(GetBalanceError)
  })

})