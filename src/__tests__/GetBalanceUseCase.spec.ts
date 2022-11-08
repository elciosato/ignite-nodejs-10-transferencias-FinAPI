import { verify } from "jsonwebtoken";
import { InMemoryUsersRepository } from "../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateUserUseCase } from "../modules/users/useCases/createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "../modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateStatementUseCase } from "../modules/statements/useCases/createStatement/CreateStatementUseCase";
import authConfig from "../config/auth";
import { GetBalanceUseCase } from "../modules/statements/useCases/getBalance/GetBalanceUseCase";
import { GetBalanceError } from "../modules/statements/useCases/getBalance/GetBalanceError";
import { OperationType } from "../modules/statements/entities/Statement";
import { CreateTransferStatementUseCase } from "../modules/statements/useCases/createTransferStatement/CreateTransferStatementUseCase";

const usersRepository = new InMemoryUsersRepository();
const statementsRepository = new InMemoryStatementsRepository();
const createUserUseCase = new CreateUserUseCase(usersRepository);
const authenticateUseCase = new AuthenticateUserUseCase(usersRepository);
const createStatementUseCase = new CreateStatementUseCase(
  usersRepository,
  statementsRepository
);
const createTransferStatementUseCase = new CreateTransferStatementUseCase(
  usersRepository,
  statementsRepository
);
const getBalanceUseCase = new GetBalanceUseCase(
  statementsRepository,
  usersRepository
);

const name1 = "User 1";
const email1 = "user1@example.com";
const password1 = "users1";

const name2 = "User 2";
const email2 = "user2@example.com";
const password2 = "users2";

interface IPayload {
  sub: string;
}

describe("Get Balance", () => {
  beforeEach(async () => {});

  it("Should be able to get balance", async () => {
    const sender = await createUserUseCase.execute({
      name: name1,
      email: email1,
      password: password1,
    });

    const receiver = await createUserUseCase.execute({
      name: name2,
      email: email2,
      password: password2,
    });

    const authUser = await authenticateUseCase.execute({
      email: email1,
      password: password1,
    });
    const { token } = authUser;
    const { sub: user_id } = verify(token, authConfig.jwt.secret) as IPayload;
    const deposit = await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Income",
    });

    const withdraw = await createStatementUseCase.execute({
      user_id,
      type: "withdraw" as OperationType,
      amount: 10,
      description: "cash",
    });

    const transfer = await createTransferStatementUseCase.execute({
      sender_id: user_id,
      receiver_id: String(receiver.id),
      amount: 10,
      description: "transfer",
    });

    const senderBalance = await getBalanceUseCase.execute({ user_id });
    expect(senderBalance).toHaveProperty("balance");
    expect(senderBalance.balance).toEqual(80);

    const receiverBalance = await getBalanceUseCase.execute({
      user_id: String(receiver.id),
    });
    expect(receiverBalance).toHaveProperty("balance");
    expect(receiverBalance.balance).toEqual(10);
  });

  it("Should not be able to operate if the user_id was not found", async () => {
    expect(async () => {
      const balance = await getBalanceUseCase.execute({ user_id: "incorrect" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
