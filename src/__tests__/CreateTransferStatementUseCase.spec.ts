import { stat } from "fs";
import {
  OperationType,
  Statement,
} from "../modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../modules/statements/useCases/createStatement/CreateStatementUseCase";
import { CreateTransferStatementUseCase } from "../modules/statements/useCases/createTransferStatement/CreateTransferStatementUseCase";
import { User } from "../modules/users/entities/User";
import { InMemoryUsersRepository } from "../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../modules/users/useCases/createUser/CreateUserUseCase";
import { AppError } from "../shared/errors/AppError";

const usersRepository = new InMemoryUsersRepository();
const statementsRepository = new InMemoryStatementsRepository();
const createUserUseCase = new CreateUserUseCase(usersRepository);
// const authenticateUseCase = new AuthenticateUserUseCase(usersRepository);
const createStatementUseCase = new CreateStatementUseCase(
  usersRepository,
  statementsRepository
);
const createTransferStatementUseCase = new CreateTransferStatementUseCase(
  usersRepository,
  statementsRepository
);

const name1 = "User 1";
const email1 = "user1@example.com";
const password1 = "users1";

const name2 = "User 2";
const email2 = "user2@example.com";
const password2 = "users2";

let sender: User;
let receiver: User;
let deposit: Statement;

describe("Create Transfer Statement", () => {
  beforeAll(async () => {
    sender = await createUserUseCase.execute({
      name: name1,
      email: email1,
      password: password1,
    });

    receiver = await createUserUseCase.execute({
      name: name2,
      email: email2,
      password: password2,
    });

    deposit = await createStatementUseCase.execute({
      user_id: String(sender.id),
      type: "deposit" as OperationType,
      amount: 100,
      description: "Income",
    });
  });

  it("Should be able to transfer", async () => {
    expect(deposit).toHaveProperty("amount");
    expect(deposit.amount).toEqual(100);

    const statement = await createTransferStatementUseCase.execute({
      sender_id: String(sender.id),
      receiver_id: String(receiver.id),
      amount: 10,
      description: "Transfer",
    });

    expect(statement).toHaveProperty("sender_id");
    expect(statement.sender_id).toEqual(sender.id);
  });

  it("Should not be able to transfer with insufficient funds", async () => {
    await expect(
      createTransferStatementUseCase.execute({
        sender_id: String(sender.id),
        receiver_id: String(receiver.id),
        amount: 200,
        description: "Transfer",
      })
    ).rejects.toEqual(new AppError("Insufficient funds"));
  });

  it("Should not be able to transfer if the sender_id was not found", async () => {
    await expect(
      createTransferStatementUseCase.execute({
        sender_id: "incorrect",
        receiver_id: String(receiver.id),
        amount: 10,
        description: "Transfer",
      })
    ).rejects.toEqual(new AppError("Sender not found", 404));
  });

  it("Should not be able to transfer if the receiver_id was not found", async () => {
    await expect(
      createTransferStatementUseCase.execute({
        sender_id: String(sender.id),
        receiver_id: "incorrect",
        amount: 10,
        description: "Transfer",
      })
    ).rejects.toEqual(new AppError("Receiver not found", 404));
  });
});
