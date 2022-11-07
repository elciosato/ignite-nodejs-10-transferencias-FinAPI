import { verify } from "jsonwebtoken";
import { InMemoryUsersRepository } from "../modules/users/repositories/in-memory/InMemoryUsersRepository"
import { InMemoryStatementsRepository } from "../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateUserUseCase } from "../modules/users/useCases/createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "../modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateStatementUseCase } from "../modules/statements/useCases/createStatement/CreateStatementUseCase";
import authConfig from '../config/auth';
import { GetStatementOperationUseCase } from "../modules/statements/useCases/getStatementOperation/GetStatementOperationUseCase";
import { GetStatementOperationError } from "../modules/statements/useCases/getStatementOperation/GetStatementOperationError";

const usersRepository = new InMemoryUsersRepository();
const statementsRepository = new InMemoryStatementsRepository();
const createUserUseCase = new CreateUserUseCase(usersRepository);
const authenticateUseCase = new AuthenticateUserUseCase(usersRepository);
const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
const getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);

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

describe("Get Statement Operation",() => {
  beforeEach(async () => {
  })

  it("Should be able to get statement operation", async () => {
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

    const operation = await getStatementOperationUseCase.execute({
      user_id, 
      statement_id: deposit.id as string})

      expect(deposit).toEqual(operation)
  })

  it("Should not be able to withdraw with insufficient funds", async () => {
    expect(async () => {
      const authUser = await authenticateUseCase.execute({email, password});
      const { token } = authUser;
      const { sub: user_id } = verify(token, authConfig.jwt.secret) as IPayload;

      const operation = await getStatementOperationUseCase.execute({
        user_id, 
        statement_id: "incorrect"})
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
  
  it("Should not be able to get operation if the user_id was not found", async () => {
    expect(async () => {
      const operation = await getStatementOperationUseCase.execute({
        user_id: "incorrect", 
        statement_id: "incorrect"})
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

})