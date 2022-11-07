import { Connection, createConnection } from 'typeorm';

import request from "supertest"
import { app } from "../app"

let connection: Connection;

const name = String(Math.floor(Math.random()*100000000))
const email = `${name}@example.com`
const password = name

    describe("Statement tests",() => {
  beforeAll(async () => {
    connection = await createConnection()
    
  })

  afterAll(async () => {
    await connection.close();
  })

  it("Should be able an authenticated user make a deposit", async () => {
    const resUser = await request(app).post("/api/v1/users").send({
      name,
      email,
      password
    })
    
    expect(resUser.status).toEqual(201)

    const resToken = await request(app).post("/api/v1/sessions").send({
      email,
      password
    })
    expect(resToken.status).toEqual(200)
    const { token } = resToken.body

    const res = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        description: "Income",
        amount: 100
      })
      .set({
        Authorization: `Bearer ${token}`
      })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty("amount")
  })

  it("Should be able an authenticated user make a withdraw", async () => {
    const resToken = await request(app).post("/api/v1/sessions").send({
      email,
      password
    })
    expect(resToken.status).toEqual(200)
    const { token } = resToken.body

    const res = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        description: "Withdraw",
        amount: 10
      })
      .set({
        Authorization: `Bearer ${token}`
      })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty("amount")
  })

  it("Should not be able to withdraw with insufficient funds", async () => {
    const resToken = await request(app).post("/api/v1/sessions").send({
      email,
      password
    })
    expect(resToken.status).toEqual(200)
    const { token } = resToken.body

    const res = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        description: "Withdraw",
        amount: 500
      })
      .set({
        Authorization: `Bearer ${token}`
      })
    expect(res.status).toEqual(400)
  })
  
  it("Should not be able to operate with invalid token", async () => {
    const res = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        description: "Income",
        amount: 100
      })
      .set({
        Authorization: `Bearer incorrect`
      })
    expect(res.status).toEqual(401)

  })

  it("Should be able an authenticated user to list your statements and get the balance", async () => {
    const resToken = await request(app).post("/api/v1/sessions").send({
      email,
      password
    })
    expect(resToken.status).toEqual(200)
    const { token } = resToken.body

    const res = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty("balance")
  })

  it("Should not be able to operate with invalid token", async () => {
    const res = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer incorrect`
      })
    expect(res.status).toEqual(401)
  })

  it("Should be able an authenticated user to show one specific statement", async () => {
    const resToken = await request(app).post("/api/v1/sessions").send({
      email,
      password
    })
    expect(resToken.status).toEqual(200)
    const { token } = resToken.body

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        description: "Income 2",
        amount: 100
      })
      .set({
        Authorization: `Bearer ${token}`
      })

    const { id: statement_id } = deposit.body

    const statement = await request(app).get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer ${token}`
      })
    expect(deposit.body.id).toEqual(statement.body.id)
  })

  it("Should not be able to get statement operation if incorrect statement_id", async () => {
  const resToken = await request(app).post("/api/v1/sessions").send({
      email,
      password
    })
    expect(resToken.status).toEqual(200)
    const { token } = resToken.body

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        description: "Income 3",
        amount: 100
      })
      .set({
        Authorization: `Bearer ${token}`
      })

    const { id: statement_id } = deposit.body

    const statement = await request(app).get(`/api/v1/statements/de9cf2e7-782e-4cd8-a825-67918ab47921`)
      .set({
        Authorization: `Bearer ${token}`
      })
    expect(statement.status).toEqual(404)
  })

  it("Should not be able to get operation with invalid token", async () => {
    const resToken = await request(app).post("/api/v1/sessions").send({
      email,
      password
    })
    expect(resToken.status).toEqual(200)
    const { token } = resToken.body

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        description: "Income 4",
        amount: 100
      })
      .set({
        Authorization: `Bearer ${token}`
      })

    const { id: statement_id } = deposit.body

    const statement = await request(app).get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer incorrect`
      })
    expect(statement.status).toEqual(401)
  })
})