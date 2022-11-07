import { Connection, createConnection } from 'typeorm';

import request from "supertest"
import { app } from "../app"

let connection: Connection;

const name = String(Math.floor(Math.random()*100000000))
const email = `${name}@example.com`
const password = name

describe("User tests",() => {
  beforeAll(async () => {
    connection = await createConnection()
    
  })

  afterAll(async () => {
    await connection.close();
  })

  it("Should be able to create a new user", async () => {
    const res = await request(app).post("/api/v1/users").send({
      name,
      email,
      password
    })
    
    expect(res.status).toEqual(201)
  })

  it("Should not be able to create a user if the email alread exists", async () => {
    const res = await request(app).post("/api/v1/users").send({
      name,
      email,
      password
    })
    
    expect(res.status).toEqual(400)
  })
  

  it("Should be able to authenticate and receive a token", async () => {
    const res = await request(app).post("/api/v1/sessions").send({
      email,
      password
    })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty("token")
    expect(res.body).toHaveProperty("user")
  })

  it("Should not be able to authenticate an incorret email user", async () => {
    const res = await request(app).post("/api/v1/sessions").send({
      email: "incorrect@example.com",
      password
    })
    expect(res.status).toEqual(401)
  })

  it("Should not be able to authenticate an invalid password", async () => {
    const res = await request(app).post("/api/v1/sessions").send({
      email,
      password: "incorrect"
    })
    expect(res.status).toEqual(401)
  })

  it("Should be able to show profile from an authenticated user", async () => {
    const resToken = await request(app).post("/api/v1/sessions").send({
      email,
      password
    })
    expect(resToken.status).toEqual(200)
    const { token } = resToken.body

    const res = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`
    })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty("id")
  })

  it("Should not be able to show a user profile with an incorret user id ", async () => {
    const res = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer incorrect`
    })
    expect(res.status).toEqual(401)
  })
})