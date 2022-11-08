import { inject, injectable } from "tsyringe";
import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ICreateTransferStatementDTO } from "./ICreateTransferStatementDTO";

@injectable()
export class CreateTransferStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}
  async execute({
    sender_id,
    receiver_id,
    description,
    amount,
  }: ICreateTransferStatementDTO): Promise<Statement> {
    const sender = await this.usersRepository.findById(sender_id);

    if (!sender) {
      throw new AppError("Sender not found", 404);
    }

    const receiver = await this.usersRepository.findById(receiver_id);

    if (!receiver) {
      throw new AppError("Receiver not found", 404);
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
    });

    if (balance < amount) {
      throw new AppError("Insufficient funds", 400);
    }

    const type = "transfer" as OperationType;

    const statement_sender = await this.statementsRepository.create({
      user_id: sender_id,
      description,
      amount,
      type,
    });

    const statement_receiver = await this.statementsRepository.create({
      user_id: receiver_id,
      sender_id,
      statement_sender_id: statement_sender.id,
      description,
      amount,
      type,
    });

    return statement_receiver;
  }
}
