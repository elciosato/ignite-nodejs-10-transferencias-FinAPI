import { verify } from "jsonwebtoken";
import { InMemoryUsersRepository } from "../modules/users/repositories/in-memory/InMemoryUsersRepository"
import { InMemoryStatementsRepository } from "../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateUserUseCase } from "../modules/users/useCases/createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "../modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateStatementUseCase } from "../modules/statements/useCases/createStatement/CreateStatementUseCase";
import authConfig from '../config/auth';
import { CreateStatementError } from "../modules/statements/useCases/createStatement/CreateStatementError";

// let usersRepository: InMemoryUsersRepository;
// let statementsRepository: InMemoryStatementsRepository;
// let createUserUseCase: CreateUserUseCase;
// let authenticateUseCase: AuthenticateUserUseCase;
// let createStatementUseCase: CreateStatementUseCase;

const usersRepository = new InMemoryUsersRepository();
const statementsRepository = new InMemoryStatementsRepository();
const createUserUseCase = new CreateUserUseCase(usersRepository);
const authenticateUseCase = new AuthenticateUserUseCase(usersRepository);
const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);


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

describe("Create Statement",() => {
  beforeEach(async () => {
  })

  it("Should be able to deposit", async () => {
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
    expect(deposit).toHaveProperty("amount")
    expect(deposit.amount).toEqual(100)
  })

  it("Should be able to withdraw", async () => {
    const authUser = await authenticateUseCase.execute({email, password});
    const { token } = authUser;
    const { sub: user_id } = verify(token, authConfig.jwt.secret) as IPayload;
    const withdraw = await createStatementUseCase.execute({
      user_id,
      type: "withdraw" as OperationType,
      amount: 10,
      description: "cash"
    })
    expect(withdraw).toHaveProperty("amount")
    expect(withdraw.amount).toEqual(10)
  })

  it("Should not be able to withdraw with insufficient funds", async () => {
    expect(async () => {
      const authUser = await authenticateUseCase.execute({email, password});
      const { token } = authUser;
      const { sub: user_id } = verify(token, authConfig.jwt.secret) as IPayload;
      const withdraw = await createStatementUseCase.execute({
        user_id,
        type: "withdraw" as OperationType,
        amount: 200,
        description: "cash"
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
  
  it("Should not be able to operate if the user_id was not found", async () => {
    expect(async () => {
      const withdraw = await createStatementUseCase.execute({
        user_id: "incorrect",
        type: "withdraw" as OperationType,
        amount: 200,
        description: "cash"
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

})