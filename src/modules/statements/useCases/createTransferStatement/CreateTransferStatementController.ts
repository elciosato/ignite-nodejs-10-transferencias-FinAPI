import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase";

export class CreateTransferStatementController {
  async handle(req: Request, res: Response): Promise<Response> {
    const { id: sender_id } = req.user;
    const { user_id: receiver_id } = req.params;
    const { amount, description } = req.body;

    const createTransferStatementUseCase = container.resolve(
      CreateTransferStatementUseCase
    );

    const statement = await createTransferStatementUseCase.execute({
      sender_id,
      receiver_id,
      description,
      amount,
    });

    return res.status(201).json(statement);
  }
}
