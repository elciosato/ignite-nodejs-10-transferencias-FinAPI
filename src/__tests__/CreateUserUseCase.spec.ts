import { InMemoryUsersRepository } from "../modules/users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from "../modules/users/useCases/createUser/CreateUserError";
import { CreateUserUseCase } from "../modules/users/useCases/createUser/CreateUserUseCase";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user",() => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository)
  })

  it("Should be able to create a new user", async () => {
    const name = "User 1";
    const email = "user1@example.com"
    const password = "users1"

    await createUserUseCase.execute({
      name,
      email,
      password
    })

    const user = await usersRepository.findByEmail(email)

    expect(user).toHaveProperty("id")
  })

  it("Should not be able to create a user the email alread exists", async () => {
    expect(async () => {
      const name = "User 1";
      const email = "user1@example.com"
      const password = "users1"

      await createUserUseCase.execute({
        name,
        email,
        password
      })
      await createUserUseCase.execute({
        name,
        email,
        password
      })
    }).rejects.toBeInstanceOf(CreateUserError)
  })

})