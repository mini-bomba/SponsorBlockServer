import assert from "assert";

import { db } from "#/databases/databases";
import { BloomFilterID } from "#utils/bloomFilter";

import { checkBloom } from "#test/utils/bloomTest";
import { client } from "#test/utils/httpClient";
import { arrayPartialDeepEquals, partialDeepEquals } from "#test/utils/partialDeepEquals";


export type Segment = {
    segment: number[];
    category: string;
    actionType?: string;
    description?: string;
};

const endpoint = "/api/slopBloom";
export const getSlopBloom = (bloomID: number) => client({
    method: "GET",
    url: `${endpoint}/${bloomID}`,
    responseType: "arraybuffer"
});

const endpoint2 = "/api/slop";
export const postSlop = (data: Record<string, any>) => client({
    method: "POST",
    url: endpoint2,
    data
});

describe("getSlopBloomFilter", () => {
    // Constant and helpers
    const submitUserOne = `getSlopBloomFilter${".".repeat(18)}`;

    [{
        req: {
            votes: [
                "ai-script"
            ],
            wholeProfile: true
        },
        bloom: BloomFilterID.contentLeft,
        profileBloom: BloomFilterID.profileLeft,
        text: "left whole profile"
    }, {
        req: {
            votes: [
                "funny"
            ],
            wholeProfile: true
        },
        bloom: BloomFilterID.contentRightPositive,
        profileBloom: BloomFilterID.profileRightPositive,
        text: "right positive whole profile"
    }, {
        req: {
            votes: [
                "boring"
            ],
            wholeProfile: true
        },
        bloom: BloomFilterID.contentRightNegative,
        profileBloom: BloomFilterID.profileRightNegative,
        text: "right negative whole profile"
    }, {
        req: {
            votes: [
                "ai-script"
            ],
            wholeProfile: false
        },
        bloom: BloomFilterID.contentLeft,
        profileBloom: BloomFilterID.profileLeft,
        text: "left"
    } , {
        req: {
            votes: [
                "funny"
            ],
            wholeProfile: false
        },
        bloom: BloomFilterID.contentRightPositive,
        profileBloom: BloomFilterID.profileRightPositive,
        text: "right positive"
    }, {
        req: {
            votes: [
                "boring"
            ],
            wholeProfile: false
        },
        bloom: BloomFilterID.contentRightNegative,
        profileBloom: BloomFilterID.profileRightNegative,
        text: "right negative"
    }].forEach((a) => {
        it(`Should be able to get a generated bloom: ${a.text}`, (done) => {
            const contentID = `youtube.com-getSlopBloomFilter-${a.text}`;
            const profileID = `getSlopBloomFilter${a.text}`;
            postSlop({
                userID: submitUserOne,
                contentID,
                profileID,
                ...a.req
            })
                .then(async res => {
                    assert.strictEqual(res.status, 200);

                    const response = await getSlopBloom(a.bloom);
                    const buffer = response.data;
                    assert.ok(checkBloom(buffer.slice(9), contentID));

                    const response2 = await getSlopBloom(a.profileBloom);
                    const buffer2 = response2.data;
                    assert.equal(checkBloom(buffer2.slice(9), profileID), a.req.wholeProfile);

                    done();
                })
                .catch(err => done(err));
        });
    })
});
