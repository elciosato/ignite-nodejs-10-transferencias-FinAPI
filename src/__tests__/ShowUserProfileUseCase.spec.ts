import { verify } from "jsonwebtoken";
import { InMemoryUsersRepository } from "../modules/users/repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../modules/users/useCases/createUser/CreateUserUseCase";
import { ShowUserProfileError } from "../modules/users/useCases/showUserProfile/ShowUserProfileError";
import { ShowUserProfileUseCase } from "../modules/users/useCases/showUserProfile/ShowUserProfileUseCase";
import authConfig from '../config/auth';

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show user profile",() => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUseCase = new AuthenticateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  })

  it("Should be able to show a user profile", async () => {
    interface IPayload {
      sub: string;
    }
    const name = "User 1";
    const email = "user1@example.com"
    const password = "users1"

    await createUserUseCase.execute({
      name,
      email,
      password
    })

    const authUser = await authenticateUseCase.execute({email, password});
    const { token } = authUser;
    const { sub: user_id } = verify(token, authConfig.jwt.secret) as IPayload;
    const userProfile = await showUserProfileUseCase.execute(user_id)
    expect(userProfile).toHaveProperty("password")
  })

  it("Should not be able to show a user profile with an incorret user id ", async () => {
    expect(async () => {
      const userProfile = await showUserProfileUseCase.execute("incorrect")
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })

})