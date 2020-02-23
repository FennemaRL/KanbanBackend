const supertest = require("supertest");
const app = require("server");
const user = require("persistence/user");
const mongoose = require("mongoose");

describe("api Verification", () => {
  let request = supertest(app);
  let db;
  beforeAll(() => {
    const uri = process.env.URIMONGOTEST;
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection;

    db.on("error connection", error => console.error(error));
    db.once("open", () => console.log("conected 2 db"));
  });

  afterEach(async done => {
    await user.deleteMany({});
    done();
  });

  it("register user successfully", async done => {
    let name = "pepe00721";
    let res = await request
      .post("/user/register")
      .set("Accept", "application/json")
      .send({ userName: name, password: "peppa" });
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(201);
    expect(result.userName).toBe(name);
    done();
  });

  it("register 2 users with the same username", async done => {
    let name = "pepe0072";
    let res = await request
      .post("/user/register")
      .set("Accept", "application/json")
      .send({ userName: name, password: "peppa" });
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(201);
    expect(result.userName).toBe(name);

    let res2 = await request
      .post("/user/register")
      .set("Accept", "application/json")
      .send({ userName: name, password: "peppa1" });

    let result2 = JSON.parse(res2.text);
    expect(result2.message).toBe("Username already exists");
    expect(res2.status).toBe(400);

    done();
  });
  it("register user withOut name pass", async done => {
    let res = await request
      .post("/user/register")
      .set("Accept", "application/json")
      .send({ userName: "", password: "" });
    let result = JSON.parse(res.text);
    expect(result.message).toBe("Username or password empty");
    expect(res.status).toBe(400);
    done();
  });
});
