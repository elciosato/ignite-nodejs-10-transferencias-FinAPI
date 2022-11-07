import { InMemoryUsersRepository } from "../modules/users/repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "../modules/users/useCases/authenticateUser/IncorrectEmailOrPasswordError";
import { CreateUserUseCase } from "../modules/users/useCases/createUser/CreateUserUseCase";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUseCase: AuthenticateUserUseCase;

describe("Authenticate user",() => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUseCase = new AuthenticateUserUseCase(usersRepository);
  })

  it("Should be able to authenticate a user", async () => {
    const name = "User 1";
    const email = "user1@example.com"
    const password = "users1"

    await createUserUseCase.execute({
      name,
      email,
      password
    })

    const user = await authenticateUseCase.execute({email, password});
    
    expect(user).toHaveProperty("token")
  })

  it("Should not be able to authenticate an incorret email user", async () => {
    expect(async () => {
      const user = await authenticateUseCase.execute({
        email: "incorret@exemple.com", 
        password: "incorret"});
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("Should not be able to authenticate an incorret email user", async () => {
    expect(async () => {
      const name = "User 1";
      const email = "user1@example.com"
      const password = "users1"

      await createUserUseCase.execute({
        name,
        email,
        password
      })

      const user = await authenticateUseCase.execute({
        email,
        password: "incorret"});
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

})