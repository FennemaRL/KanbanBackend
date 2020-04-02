const supertest = require("supertest");
const app = require("server");
const userModel = require("persistence/user");
const boardModel = require("persistence/board");
const mongoose = require("mongoose");
const auth = require("auth");

const uri = process.env.URIMONGOTEST;
const db = mongoose.connection;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
db.on("error connection", error => console.error(error));
db.once("open", () => console.log("conected 2 db"));

describe("user route verification", () => {
  let user;
  let request;
  beforeAll(async done => {
    await userModel.deleteMany({});
    user = { userName: "pepe", password: "peppa" };
    done();
  });

  beforeEach(() => {
    request = supertest(app);
    userModel.updateOne({ userName: user.userName }, { boards: [] });
  });
  afterAll(async done => {
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
  it("Login an user withOut name & pass", async done => {
    await new userModel(user).save();

    let res = await request
      .post("/user/login")
      .set("Accept", "application/json");
    let result = JSON.parse(res.text);

    expect(result.message).toBe("UserName or password are empty");
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
  let task;
  let body;
  beforeAll(async done => {
    user = { userName: "pepa", password: "pepapass" };
    board = { boardTitle: "board1" };
    body = { ...board, tableTitle: "pepa" };
    task = { titleTask: "find a papa", description: " and just cook it " };
    await new userModel(user).save();

    done();
  });
  afterAll(async done => {
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
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(200);
    expect(result.title).toBe(board.boardTitle);

    done();
  });
  it("Get an user board not found", async done => {
    let res = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result = JSON.parse(res.text);

    expect(result.message).toBe("Board not found");
    expect(res.status).toBe(400);

    done();
  });
  it("Add(.Post) an user board successfully", async done => {
    let res = await request
      .post("/board")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send(board);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(201);
    expect(result.title).toBe(board.boardTitle);

    let res2 = await request.get(`/user/${user.userName}`);
    let result2 = JSON.parse(res2.text);
    expect(res2.status).toBe(200);
    expect(result2.boards).toStrictEqual([board.boardTitle]);

    done();
  });
  it("Add(.Post) an user board empty", async done => {
    let res = await request
      .post("/board")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result = JSON.parse(res.text);

    expect(result.message).toBe("The field boardTitle is empty");
    expect(res.status).toBe(400);

    done();
  });
  it("Delete an user board successfully", async done => {
    await new boardModel({
      ...board,
      title: board.boardTitle + "." + user.userName
    }).save();

    let res = await request
      .delete(`/board`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send(board);

    let res2 = await request.get(`/user/${user.userName}`);
    let result = JSON.parse(res2.text);
    expect(res.status).toBe(204);
    expect(res2.status).toBe(200);
    expect(result.boards).toStrictEqual([]);
    done();
  });
  it("Delete an user board not saved ", async done => {
    let res = await request
      .delete(`/board`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send(board);

    expect(res.status).toBe(204);

    done();
  });
  it("Add(.Post) an user table in an saved board successfully", async done => {
    await new boardModel({
      ...board,
      title: board.boardTitle + "." + user.userName
    }).save();

    let res = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(200);
    expect(result.title).toBe(board.boardTitle);
    expect(result.tables).toStrictEqual([]);
    let res2 = await request
      .post("/board/table")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...board, tableTitle: "pepa" });
    let result2 = JSON.parse(res2.text);
    expect(res2.status).toBe(201);
    expect(result2.tables).toStrictEqual([{ titleTable: "pepa", content: [] }]);
    done();
  });
  it("Add(.Post) an user table in an not saved board ", async done => {
    let res2 = await request
      .post("/board/table")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...board, tableTitle: "pepa" });
    let result2 = JSON.parse(res2.text);
    expect(res2.status).toBe(400);
    expect(result2.message).toBe("couldn't find the board " + board.boardTitle);
    done();
  });
  it("Add(.Post) an user table without title in an saved board ", async done => {
    await new boardModel({
      ...board,
      title: board.boardTitle + "." + user.userName
    }).save();

    let res = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(200);
    expect(result.title).toBe(board.boardTitle);
    expect(result.tables).toStrictEqual([]);
    let res2 = await request
      .post("/board/table")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...board, tableTitle: "" });
    let result2 = JSON.parse(res2.text);
    expect(res2.status).toBe(400);
    expect(result2.message).toBe("The field tableTitle is empty");
    done();
  });
  it("Delete an user table in an saved board successfully", async done => {
    await new boardModel({
      ...board,
      title: board.boardTitle + "." + user.userName
    }).save();

    let res = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(200);
    expect(result.title).toBe(board.boardTitle);
    expect(result.tables).toStrictEqual([]);
    let res2 = await request
      .post("/board/table")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send(body);
    let result2 = JSON.parse(res2.text);
    expect(res2.status).toBe(201);
    expect(result2.tables).toStrictEqual([{ titleTable: "pepa", content: [] }]);

    let res3 = await request
      .delete("/board/table")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send(body);
    expect(res3.status).toStrictEqual(204);

    let res4 = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result4 = JSON.parse(res4.text);
    expect(result4.message).toBe(undefined);
    expect(res4.status).toBe(200);
    expect(result4.tables).toStrictEqual([]);

    done();
  });
  it("Delete an user table in an unsaved board", async done => {
    await new boardModel({
      ...board,
      title: board.boardTitle + "." + user.userName
    }).save();

    let res = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(200);
    expect(result.title).toBe(board.boardTitle);
    expect(result.tables).toStrictEqual([]);
    let res2 = await request
      .post("/board/table")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...board, tableTitle: "pepa" });
    let result2 = JSON.parse(res2.text);
    expect(res2.status).toBe(201);
    expect(result2.tables).toStrictEqual([{ titleTable: "pepa", content: [] }]);

    let res3 = await request
      .delete("/board/table")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...board, tableTitle: "pepa" });
    expect(res3.status).toBe(204);
    done();
  });
  it("Add(.Post) an user task in an saved table successfully", async done => {
    await new boardModel({
      ...board,
      title: board.boardTitle + "." + user.userName
    }).save();

    let res = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(200);
    expect(result.title).toBe(board.boardTitle);
    expect(result.tables).toStrictEqual([]);

    let res2 = await request
      .post("/board/table")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send(body);
    let result2 = JSON.parse(res2.text);
    expect(res2.status).toBe(201);
    expect(result2.tables).toStrictEqual([{ titleTable: "pepa", content: [] }]);

    let res3 = await request
      .post("/board/table/task")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...body, task: task });
    let result3 = JSON.parse(res3.text);
    expect(result3.boardTitle).toBe(board.boardTitle);
    expect(res3.status).toBe(201);
    expect(result3.tables).toStrictEqual([
      {
        titleTable: "pepa",
        content: [task]
      }
    ]);
    let res4 = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result4 = JSON.parse(res4.text);
    expect(res4.status).toBe(200);
    expect(result4.tables).toStrictEqual([
      {
        titleTable: "pepa",
        content: [task]
      }
    ]);
    done();
  });
  it("Add(.Post) an user task empty in an saved table", async done => {
    await new boardModel({
      ...board,
      title: board.boardTitle + "." + user.userName
    }).save();

    let res = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(200);
    expect(result.title).toBe(board.boardTitle);
    expect(result.tables).toStrictEqual([]);

    let res2 = await request
      .post("/board/table")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send(body);
    let result2 = JSON.parse(res2.text);
    expect(res2.status).toBe(201);
    expect(result2.tables).toStrictEqual([{ titleTable: "pepa", content: [] }]);

    let res3 = await request
      .post("/board/table/task")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...body, task: {} });

    let result3 = JSON.parse(res3.text);
    expect(res3.status).toBe(400);
    expect(result3.message).toStrictEqual(
      "The tableTitle or the task are empty"
    );
    done();
  });
  it("Add(.Post) an user task in an nameless table ", async done => {
    await new boardModel({
      ...board,
      title: board.boardTitle + "." + user.userName
    }).save();

    let res = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(200);
    expect(result.title).toBe(board.boardTitle);
    expect(result.tables).toStrictEqual([]);

    let res2 = await request
      .post("/board/table")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send(body);
    let result2 = JSON.parse(res2.text);
    expect(res2.status).toBe(201);
    expect(result2.tables).toStrictEqual([{ titleTable: "pepa", content: [] }]);

    let res3 = await request
      .post("/board//table/")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...body, tableTitle: "", task: task });

    let result3 = JSON.parse(res3.text);
    expect(res3.status).toBe(400);
    expect(result3.message).toStrictEqual("The field tableTitle is empty");
    done();
  });
  it("Add(.Post) an user task in an table dont save", async done => {
    await new boardModel({
      ...board,
      title: board.boardTitle + "." + user.userName
    }).save();

    let res = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(200);
    expect(result.title).toBe(board.boardTitle);
    expect(result.tables).toStrictEqual([]);

    let res3 = await request
      .post("/board/table/task")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...body, tableTitle: "title", task: task });

    let result3 = JSON.parse(res3.text);
    expect(res3.status).toBe(400);
    expect(result3.message).toBe(
      "The table dont belong to the board : " + board.boardTitle
    );
    done();
  });
  it("Delete an user task in an saved table successfully", async done => {
    await new boardModel({
      ...board,
      title: board.boardTitle + "." + user.userName
    }).save();

    let res = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(200);
    expect(result.title).toBe(board.boardTitle);
    expect(result.tables).toStrictEqual([]);

    let res2 = await request
      .post("/board/table")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send(body);
    let result2 = JSON.parse(res2.text);
    expect(res2.status).toBe(201);
    expect(result2.tables).toStrictEqual([{ titleTable: "pepa", content: [] }]);

    let res3 = await request
      .post("/board/table/task")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...body, task: task });
    let result3 = JSON.parse(res3.text);
    expect(result3.boardTitle).toBe(board.boardTitle);
    expect(res3.status).toBe(201);
    expect(result3.tables).toStrictEqual([
      {
        titleTable: "pepa",
        content: [task]
      }
    ]);
    let res6 = await request
      .post("/board/table/task")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...body, task: { ...task, titleTask: "tete" } });
    let result6 = JSON.parse(res6.text);
    expect(result6.boardTitle).toBe(board.boardTitle);
    expect(res6.status).toBe(201);
    expect(result6.tables).toStrictEqual([
      {
        titleTable: "pepa",
        content: [task, { ...task, titleTask: "tete" }]
      }
    ]);

    let res4 = await request
      .delete("/board/table/task")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...body, titleTask: task.titleTask });
    expect(res4.status).toBe(204);

    let res5 = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result5 = JSON.parse(res5.text);

    expect(res5.status).toBe(200);
    expect(result5.tables).toStrictEqual([
      { titleTable: "pepa", content: [{ ...task, titleTask: "tete" }] }
    ]);

    done();
  });
  it("Move(.patch /table) an user task in another table successfully", async done => {
    /*miss bad cases*/
    await new boardModel({
      ...board,
      title: board.boardTitle + "." + user.userName
    }).save();

    let res = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(200);
    expect(result.title).toBe(board.boardTitle);
    expect(result.tables).toStrictEqual([]);

    let res2 = await request
      .post("/board/table")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send(body);
    let result2 = JSON.parse(res2.text);
    expect(res2.status).toBe(201);
    expect(result2.tables).toStrictEqual([{ titleTable: "pepa", content: [] }]);

    let res3 = await request
      .post("/board/table")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...body, tableTitle: "pepe" });
    let result3 = JSON.parse(res3.text);
    expect(res3.status).toBe(201);
    expect(result3.tables).toStrictEqual([
      { titleTable: "pepa", content: [] },
      { titleTable: "pepe", content: [] }
    ]);

    let res4 = await request
      .post("/board/table/task")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...body, task: task });
    let result4 = JSON.parse(res4.text);
    expect(result4.boardTitle).toBe(board.boardTitle);
    expect(res4.status).toBe(201);
    expect(result4.tables).toStrictEqual([
      { titleTable: "pepa", content: [task] },
      { titleTable: "pepe", content: [] }
    ]);
    let res5 = await request
      .post("/board/table/task")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...body, task: { ...task, titleTask: "tete" } });
    let result5 = JSON.parse(res5.text);
    expect(result5.boardTitle).toBe(board.boardTitle);
    expect(res5.status).toBe(201);
    expect(result5.tables).toStrictEqual([
      {
        titleTable: "pepa",
        content: [task, { ...task, titleTask: "tete" }]
      },
      { titleTable: "pepe", content: [] }
    ]);

    let res6 = await request
      .patch("/board/table/")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({
        ...body,
        taskTitle: task.titleTask,
        tableTitleFrom: body.tableTitle,
        tableTitleTo: "pepe",
        indexTo: 0
      });
    let result6 = JSON.parse(res6.text);

    expect(res6.status).toBe(200);

    expect(result6.oldTables).toStrictEqual([
      {
        titleTable: "pepa",
        content: [task, { ...task, titleTask: "tete" }]
      },
      { titleTable: "pepe", content: [] }
    ]);
    expect(result6.tables).toStrictEqual([
      {
        titleTable: "pepa",
        content: [task]
      },
      { titleTable: "pepe", content: [{ ...task, titleTask: "tete" }] }
    ]);

    let res7 = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result7 = JSON.parse(res7.text);

    expect(res7.status).toBe(200);
    expect(result7.tables).toStrictEqual([
      {
        titleTable: "pepa",
        content: [task]
      },
      { titleTable: "pepe", content: [{ ...task, titleTask: "tete" }] }
    ]);

    done();
  });
  it("Edit (.patch /table/task) an user task successfully", async done => {
    /*miss bad cases */
    await new boardModel({
      ...board,
      title: board.boardTitle + "." + user.userName
    }).save();

    let res = await request
      .get(`/board/${board.boardTitle}`)
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`);
    let result = JSON.parse(res.text);

    expect(result.message).toBe(undefined);
    expect(res.status).toBe(200);
    expect(result.title).toBe(board.boardTitle);
    expect(result.tables).toStrictEqual([]);

    let res2 = await request
      .post("/board/table")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send(body);
    let result2 = JSON.parse(res2.text);
    expect(res2.status).toBe(201);
    expect(result2.tables).toStrictEqual([{ titleTable: "pepa", content: [] }]);

    let res3 = await request
      .post("/board/table")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...body, tableTitle: "pepe" });
    let result3 = JSON.parse(res3.text);
    expect(res3.status).toBe(201);
    expect(result3.tables).toStrictEqual([
      { titleTable: "pepa", content: [] },
      { titleTable: "pepe", content: [] }
    ]);

    let res4 = await request
      .post("/board/table/task")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...body, task: task });
    let result4 = JSON.parse(res4.text);
    expect(result4.boardTitle).toBe(board.boardTitle);
    expect(res4.status).toBe(201);
    expect(result4.tables).toStrictEqual([
      { titleTable: "pepa", content: [task] },
      { titleTable: "pepe", content: [] }
    ]);

    let res5 = await request
      .post("/board/table/task")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({ ...body, task: { ...task, taskTitle: "3" } });

    let result5 = JSON.parse(res5.text);
    expect(result5.boardTitle).toBe(board.boardTitle);
    expect(res5.status).toBe(201);
    expect(result5.tables).toStrictEqual([
      { titleTable: "pepa", content: [task, { ...task, taskTitle: "3" }] },
      { titleTable: "pepe", content: [] }
    ]);

    let res6 = await request
      .patch("/board/table/task")
      .set("Accept", "application/json")
      .set("Token", `Bearer ${auth.genToken(user)}`)
      .send({
        ...body,
        taskTitleToRemove: task.titleTask,
        newTask: { ...task, taskTitle: "1" }
      });
    let result6 = JSON.parse(res6.text);
    expect(res6.status).toBe(200);
    expect(result6.tables).toStrictEqual([
      {
        titleTable: "pepa",
        content: [
          { ...task, taskTitle: "1" },
          { ...task, taskTitle: "3" }
        ]
      },
      { titleTable: "pepe", content: [] }
    ]);

    done();
  });
});
