import { Statement } from "../../entities/Statement";

export interface ICreateTransferStatementDTO {
  sender_id: string;
  receiver_id: string;
  description: string;
  amount: number;
}
