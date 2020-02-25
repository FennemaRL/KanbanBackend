const supertest = require("supertest");
const app = require("server");
const userModel = require("persistence/user");
const boardModel = require("persistence/board");
const mongoose = require("mongoose");
const auth = require("auth");

const uri = process.env.URIMONGOTEST;
const db = mongoose.connection;
describe("user route verification", () => {
  let user;
  let request;
  beforeAll(async done => {
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    db.on("error connection", error => console.error(error));
    db.once("open", () => console.log("conected 2 db"));
    await userModel.deleteMany({});
    user = { userName: "pepe", password: "peppa" };
    done();
  });
  beforeEach(() => {
    request = supertest(app);
  });
  afterAll(async done => {
    //await db.close();
    done();
  });
  afterEach(async done => {
    await userModel.deleteMany({});
    done();
  });

  it("Register user successfully", async done => {
    let res = await request
      .post("/user/register")
      .set("Accept", "application/json")
      .send(user);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(201);
    expect(result.userName).toBe(user.userName);
    done();
  });
  it("Register 2 users with the same username", async done => {
    let res = await request
      .post("/user/register")
      .set("Accept", "application/json")
      .send(user);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(201);
    expect(result.userName).toBe(user.userName);

    let res2 = await request
      .post("/user/register")
      .set("Accept", "application/json")
      .send(user);

    let result2 = JSON.parse(res2.text);
    expect(result2.message).toBe("Username already exists");
    expect(res2.status).toBe(400);

    done();
  });
  it("Register user withOut name & pass", async done => {
    let res = await request
      .post("/user/register")
      .set("Accept", "application/json")
      .send();
    let result = JSON.parse(res.text);
    expect(result.message).toBe("Username or password empty");
    expect(res.status).toBe(400);
    done();
  });
  it("Login user successfully", async done => {
    await new userModel(user).save();

    let res = await request
      .post("/user/login")
      .set("Accept", "application/json")
      .send(user);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(200);
    expect(result.token.split(" ")[0]).not.toBe("Bearer");

    done();
  });
  it("Login an user not register", async done => {
    let res = await request
      .post("/user/login")
      .set("Accept", "application/json")
      .send(user);
    let result = JSON.parse(res.text);

    expect(result.message).toBe("User or password incorrect");
    expect(res.status).toBe(400);
    expect(result.token).toBe(undefined);

    done();
  });
  it("Login an user with wrong password ", async done => {
    await new userModel(user).save();

    let res = await request
      .post("/user/login")
      .set("Accept", "application/json")
      .send({ ...user, password: "incorrect" });
    let result = JSON.parse(res.text);

    expect(result.message).toBe("User or password incorrect");
    expect(res.status).toBe(400);
    expect(result.token).toBe(undefined);

    done();
  });
  it("NewOrder of an user board list successfully", async done => {
    await new userModel({ ...user, boards: ["pepa", "pape", "bug"] }).save();

    let res = await request
      .patch("/user/neworder")
      .set("Accept", "application/json")
      .set("token", `bearer ${auth.genToken(user)}`)
      .send({ boardsOrder: ["bug", "pape", "pepa"] });

    let result = JSON.parse(res.text);
    expect(res.message).toBe(undefined);
    expect(res.status).toBe(200);
    expect(result.userName).toBe(user.userName);
    expect(result.oldOrder).toStrictEqual(["pepa", "pape", "bug"]);
    expect(result.newOrder).toStrictEqual(["bug", "pape", "pepa"]);
    done();
  });
  it("NewOrder of an user board with less elements", async done => {
    await new userModel({ ...user, boards: ["pepa", "pape", "bug"] }).save();

    let res = await request
      .patch("/user/neworder")
      .set("Accept", "application/json")
      .set("token", `bearer ${auth.genToken(user)}`)
      .send({ boardsOrder: ["bug", "pepa"] });

    let result = JSON.parse(res.text);
    expect(res.status).toBe(400);
    expect(result.message).toBe("The lists don't contains the same elements");
    done();
  });
  it("NewOrder of an user board with different elements", async done => {
    await new userModel({ ...user, boards: ["pepa", "pape", "bug"] }).save();

    let res = await request
      .patch("/user/neworder")
      .set("Accept", "application/json")
      .set("token", `bearer ${auth.genToken(user)}`)
      .send({ boardsOrder: ["bug", "papa", "cow"] });

    let result = JSON.parse(res.text);
    expect(res.status).toBe(400);
    expect(result.message).toBe("The lists don't contains the same elements");
    done();
  });
  it("NewOrder of an user board list withOut token", async done => {
    await new userModel({ ...user, boards: ["pepa", "pape", "bug"] }).save();

    let res = await request
      .patch("/user/neworder")
      .set("Accept", "application/json")
      .send({ boardsOrder: ["bug", "pape", "pepa"] });
    let result = JSON.parse(res.text);
    expect(result.message).toBe("not authorized no token");
    expect(res.status).toBe(401);
    done();
  });
  it("NewOrder of an user board list with token expired", async done => {
    await new userModel({ ...user, boards: ["pepa", "pape", "bug"] }).save();

    let res = await request
      .patch("/user/neworder")
      .set("Accept", "application/json")
      .set(
        "token",
        `bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoicGVwYTEiLCJpYXQiOjE1ODI0MDI1NzEsImV4cCI6MTU4MjQwNDM3MX0.GEU_xccGD8IoPVS3MN2d1IG5BgbyktY8xB2uS2a-aa0`
      )
      .send({ boardsOrder: ["bug", "pape", "pepa"] });
    let result = JSON.parse(res.text);
    expect(result.message).toBe("not authorized jwt expired");
    expect(res.status).toBe(401);
    done();
  });
});

describe("board route verification", () => {
  let user;
  let board;
  let request;
  beforeAll(async done => {
    user = { userName: "pepa", password: "pepapass" };
    board = { boardTitle: "board1" };
    /*
    db.on("error connection", error => console.error(error));
    db.once("open", () => console.log("conected 2 db"));*/
    await new userModel(user).save();

    done();
  });
  afterAll(async done => {
    //await db.close();

    await boardModel.deleteMany({});
    await userModel.deleteMany({});
    done();
  });
  beforeEach(async done => {
    await boardModel.deleteMany({});
    request = supertest(app);
    done();
  });
  it("Get an user board successfully", async done => {
    await new boardModel({
      ...board,
      title: board.boardTitle + "." + user.userName
    }).save();

    let res = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send(board);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(200);
    expect(result.title).toBe(board.boardTitle);

    done();
  });
  it("Post an user board successfully", async done => {
    let res = await request
      .post("/board")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send(board);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(201);
    console.log(result);
    expect(result.title).toBe(board.boardTitle);

    done();
  });
});
