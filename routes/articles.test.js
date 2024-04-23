"use strict";

const request = require("supertest");
const app = require("../app"); // Adjust the path as necessary
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, u1Token, u2Token } = require("./_testCommon");
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

const initializeTests = require("./_testCommon");

let setupData;

beforeAll(async () => {
    // Await the setup to ensure all asynchronous operations are completed
    setupData = await initializeTests;
});

beforeEach(() => {
    setupData.commonBeforeEach();
});

afterEach(() => {
    setupData.commonAfterEach();
});

afterAll(() => {
    setupData.commonAfterAll();
});

// beforeAll(commonBeforeAll);
// beforeEach(commonBeforeEach);
// afterEach(commonAfterEach);
// afterAll(commonAfterAll);

describe("POST /articles", () => {
    test("Adds an article to the database", async () => {
        const token = u1Token; // Simulate a logged-in user
        console.log('u1Token', u1Token)
        const newArticle = {
            title: "Test Article",
            url: "http://example.com/test",
            description: "Test description",
            urltoimage: "http://example.com/test.jpg"
        };

        const response = await request(app)
            .post("/articles/articles")
            .send(newArticle)
            .set("Authorization", `Bearer ${token}`)
            .expect(201);

        expect(response.body).toEqual({
            article: expect.any(Object)
        });
        expect(response.body.article).toHaveProperty("id");
    });

    test("Fails to add an article without a token", async () => {
        const newArticle = {
            title: "Test Article",
            url: "http://example.com/test",
            description: "Test description",
            urltoimage: "http://example.com/test.jpg"
        };

        const response = await request(app)
            .post("/articles")
            .send(newArticle)
            .expect(400);

        expect(response.body.error).toBeDefined();
    });
});

describe("GET /articles", () => {
    test("Gets all saved articles", async () => {
        const response = await request(app)
            .get("/articles")
            .expect(200);

        expect(response.body.articles).toBeInstanceOf(Array);
    });
});

describe("GET /saved", () => {
    test("Gets saved articles for a user", async () => {
        const token = jwt.sign({ userId: 1 }, SECRET_KEY);
        const response = await request(app)
            .get("/saved")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(response.body.saved).toBeInstanceOf(Array);
    });
});

describe("DELETE /saved", () => {
    test("Deletes an article", async () => {
        const token = jwt.sign({ userId: 1 }, SECRET_KEY);
        const response = await request(app)
            .delete("/saved")
            .query({ title: "Test Article" })
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(response.body).toEqual({ message: "Article deleted successfully" });
    });
});
