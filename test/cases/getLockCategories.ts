import {getHash} from "../../src/utils/getHash";
import {db} from "../../src/databases/databases";
import assert from "assert";
import { client } from "../utils/httpClient";
const endpoint = "/api/lockCategories";
const getLockCategories = (videoID: string) => client.get(endpoint, { params: { videoID } });

describe("getLockCategories", () => {
    before(async () => {
        const insertVipUserQuery = 'INSERT INTO "vipUsers" ("userID") VALUES (?)';
        await db.prepare("run", insertVipUserQuery, [getHash("getLockCategoriesVIP")]);

        const insertLockCategoryQuery = 'INSERT INTO "lockCategories" ("userID", "videoID", "category", "reason") VALUES (?, ?, ?, ?)';
        await db.prepare("run", insertLockCategoryQuery, [getHash("getLockCategoriesVIP"), "getLock1", "sponsor", "1-short"]);
        await db.prepare("run", insertLockCategoryQuery, [getHash("getLockCategoriesVIP"), "getLock1", "interaction", "1-longer-reason"]);

        await db.prepare("run", insertLockCategoryQuery, [getHash("getLockCategoriesVIP"), "getLock2", "preview", "2-reason"]);

        await db.prepare("run", insertLockCategoryQuery, [getHash("getLockCategoriesVIP"), "getLock3", "nonmusic", "3-reason"]);
    });

    it("Should update the database version when starting the application", async () => {
        const version = (await db.prepare("get", "SELECT key, value FROM config where key = ?", ["version"])).value;
        assert.ok(version > 20, `Version isn't greater than 20. Version is ${version}`);
    });

    it("Should be able to get multiple locks", (done) => {
        getLockCategories("getLock1")
            .then(res => {
                assert.strictEqual(res.status, 200);
                const expected = {
                    categories: [
                        "sponsor",
                        "interaction"
                    ],
                    reason: "1-longer-reason"
                };
                assert.deepStrictEqual(res.data, expected);
                done();
            })
            .catch(err => done(err));
    });

    it("Should be able to get single locks", (done) => {
        getLockCategories("getLock2")
            .then(res => {
                assert.strictEqual(res.status, 200);
                const expected = {
                    categories: [
                        "preview"
                    ],
                    reason: "2-reason"
                };
                assert.deepStrictEqual(res.data, expected);
                done();
            })
            .catch(err => done(err));
    });

    it("should return 404 if no lock exists", (done) => {
        getLockCategories("getLockNull")
            .then(res => {
                assert.strictEqual(res.status, 404);
                done();
            })
            .catch(err => done(err));
    });

    it("should return 400 if no videoID specified", (done) => {
        client.get(endpoint)
            .then(res => {
                assert.strictEqual(res.status, 400);
                done();
            })
            .catch(err => done(err));
    });
});
