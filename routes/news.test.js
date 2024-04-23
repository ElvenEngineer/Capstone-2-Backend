"use strict";

const request = require("supertest");
const app = require("../app"); // Ensure this points to your Express app
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll } = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /news", function () {
    test("Gets news data for a keyword", async function () {
        const resp = await request(app)
            .get("/news?q=technology")
            .expect(200);
        
        expect(resp.body).toEqual(expect.any(Object)); 
        expect(resp.body.articles).toBeInstanceOf(Array);
    });

    test("Handles missing or bad keyword gracefully", async function () {
        const resp = await request(app)
            .get("/newssd")
            .expect(404);  
        
        expect(resp.body.error).toBeDefined();
    });
});

describe("GET /home", function () {
    test("Gets top news for the default country and category", async function () {
        const resp = await request(app)
            .get("/home")
            .expect(200);
        
        expect(resp.body).toEqual(expect.any(Object)); 
        console.log(Object);
        expect(resp.body.articles).toBeInstanceOf(Array);
    });

    test("Gets top news for a specific country and category", async function () {
        const resp = await request(app)
            .get("/home?country=ca&cat=science")
            .expect(200);
        
        expect(resp.body).toEqual(expect.any(Object));
        expect(resp.body.articles).toBeInstanceOf(Array);
    });

});

